"""
Live Feed API – Seat Occupancy Streaming
=========================================
Endpoints:
  GET /api/v1/live/raw-stream            → raw ESP32-CAM MJPEG proxy
  GET /api/v1/live/annotated-stream      → YOLO-annotated ESP32 MJPEG
  GET /api/v1/live/stats                 → ESP32 occupancy stats JSON

  GET /api/v1/live/video-annotated-stream → YOLO-annotated video.mp4 MJPEG
  GET /api/v1/live/video-stats            → per-chair + aggregate stats JSON
"""

import asyncio
import os
import sys
import threading
import time
from pathlib import Path
from typing import AsyncGenerator, List, Optional

import cv2
import numpy as np
import requests
from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse, JSONResponse

# ── CONFIG ─────────────────────────────────────────────────────────────────────
ESP32_URL       = "http://10.224.155.139/"
YOLO_MODEL      = "yolo11n.pt"
CONF_THRESHOLD  = 0.35
IOU_THRESHOLD   = 0.50
IMGSZ           = 640
MIN_CHAIR_AREA  = 800.0
OVERLAP_RATIO   = 0.18
POINT_X         = 0.50
POINT_Y         = 0.72
RECONNECT_DELAY = 2.0
TIMEOUT_SEC     = 10
JPEG_QUALITY    = 75

# Absolute path to video.mp4 in the frontend public folder
VIDEO_PATH = Path(r"C:\Users\ashis\OneDrive\Desktop\Recursion\Frontend\assemble-app\public\video.mp4")
# ───────────────────────────────────────────────────────────────────────────────

router = APIRouter(prefix="/live", tags=["Live Feed"])

# ── Shared state ───────────────────────────────────────────────────────────────
_lock              = threading.Lock()
_latest_raw_jpg:   Optional[bytes] = None
_latest_ann_jpg:   Optional[bytes] = None
_latest_vid_jpg:   Optional[bytes] = None   # annotated video.mp4 frame

_stats: dict = {
    "occupied": 0, "free": 0, "total_chairs": 0,
    "persons": 0, "tables": 0, "fps": 0.0,
    "chairs": [],      # list of {"id": int, "status": "FREE"|"OCC", "conf": float}
    "connected": False,
}
_video_stats: dict = {
    "occupied": 0, "free": 0, "total_chairs": 0,
    "persons": 0, "tables": 0, "fps": 0.0,
    "chairs": [],      # list of {"id": int, "status": "FREE"|"OCC", "conf": float}
    "connected": False,
}

# ── YOLO (lazy, once) ──────────────────────────────────────────────────────────
_model      = None
_model_lock = threading.Lock()

def _get_model():
    global _model
    with _model_lock:
        if _model is None:
            try:
                cfg = Path(__file__).resolve().parents[4] / ".yolo_config"
                cfg.mkdir(parents=True, exist_ok=True)
                os.environ.setdefault("YOLO_CONFIG_DIR", str(cfg))
                from ultralytics import YOLO
                _model = YOLO(YOLO_MODEL)
            except Exception as e:
                print(f"[LiveFeed] YOLO load error: {e}", file=sys.stderr)
    return _model

# ── Geometry helpers ───────────────────────────────────────────────────────────
def _clip(box, w, h):
    x1, y1, x2, y2 = box
    x1 = float(max(0, min(w - 1, x1)));  y1 = float(max(0, min(h - 1, y1)))
    x2 = float(max(0, min(w - 1, x2)));  y2 = float(max(0, min(h - 1, y2)))
    return (min(x1, x2), min(y1, y2), max(x1, x2), max(y1, y2))

def _area(box):
    x1, y1, x2, y2 = box
    return max(0.0, x2 - x1) * max(0.0, y2 - y1)

def _intersection(a, b):
    return (max(0.0, min(a[2], b[2]) - max(a[0], b[0])) *
            max(0.0, min(a[3], b[3]) - max(a[1], b[1])))

def _expand(box, w, h, xf=0.10, yf=0.25):
    x1, y1, x2, y2 = box
    ex, ey = (x2 - x1) * xf, (y2 - y1) * yf
    return _clip((x1 - ex, y1 - ey, x2 + ex, y2 + ey), w, h)

def _class_id(names, targets):
    if isinstance(names, dict):
        items = list(names.items())
    else:
        items = list(enumerate(names))
    norm = {str(n).strip().lower().replace("_", " "): i for i, n in items}
    for t in targets:
        k = t.strip().lower().replace("_", " ")
        if k in norm:
            return int(norm[k])
    return None

def _draw(img, box, color, label=None):
    x1, y1, x2, y2 = (int(v) for v in box)
    cv2.rectangle(img, (x1, y1), (x2, y2), color, 2)
    if label:
        cv2.putText(img, label, (x1, max(0, y1 - 8)),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.55, color, 2, cv2.LINE_AA)

# ── YOLO inference helper ──────────────────────────────────────────────────────
def _infer(model, frame):
    """Run YOLO and return (persons, chairs_with_conf, tables)."""
    results = model.predict(source=frame, imgsz=IMGSZ,
                            conf=CONF_THRESHOLD, iou=IOU_THRESHOLD,
                            device=None, verbose=False)
    persons, chairs, tables = [], [], []
    r0 = results[0] if results else None
    if r0 is None or r0.boxes is None or len(r0.boxes) == 0:
        return persons, chairs, tables

    names = model.names
    p_id  = _class_id(names, ["person"])
    ch_id = _class_id(names, ["chair"])
    t_id  = _class_id(names, ["dining table", "diningtable", "table"])

    xyxy  = r0.boxes.xyxy.detach().cpu().numpy()
    cls   = r0.boxes.cls.detach().cpu().numpy().astype(int)
    confs = r0.boxes.conf.detach().cpu().numpy()

    for (x1, y1, x2, y2), c, cf in zip(xyxy, cls, confs):
        box = (float(x1), float(y1), float(x2), float(y2))
        if   p_id  is not None and c == p_id:  persons.append((box, float(cf)))
        elif ch_id is not None and c == ch_id:  chairs.append( (box, float(cf)))
        elif t_id  is not None and c == t_id:   tables.append( (box, float(cf)))
    return persons, chairs, tables

def _occupancy(persons, chairs, w, h):
    """Return list of (box, conf, is_occupied)."""
    result = []
    for (cb, cf) in chairs:
        cb  = _clip(cb, w, h)
        if _area(cb) < MIN_CHAIR_AREA:
            result.append((cb, cf, False))
            continue
        ce  = _expand(cb, w, h)
        ca  = max(1.0, _area(cb))
        occ = False
        for (pb, _) in persons:
            pb = _clip(pb, w, h)
            if (_intersection(cb, pb) / ca) >= OVERLAP_RATIO:
                occ = True; break
            px1, py1, px2, py2 = pb
            px = px1 + (px2 - px1) * POINT_X
            py = py1 + (py2 - py1) * POINT_Y
            if ce[0] <= px <= ce[2] and ce[1] <= py <= ce[3]:
                occ = True; break
        result.append((cb, cf, occ))
    return result

# ── Worker: raw ESP32 stream ───────────────────────────────────────────────────
def _raw_stream_worker():
    global _latest_raw_jpg, _stats
    while True:
        try:
            res = requests.get(ESP32_URL, stream=True, timeout=TIMEOUT_SEC,
                               headers={"User-Agent": "Mozilla/5.0",
                                        "Cache-Control": "no-cache"})
            buf = b""
            for chunk in res.iter_content(chunk_size=4096):
                buf += chunk
                s = buf.find(b"\xff\xd8"); e = buf.find(b"\xff\xd9")
                if s != -1 and e != -1:
                    jpg = buf[s: e + 2]; buf = buf[e + 2:]
                    with _lock:
                        _latest_raw_jpg = jpg
                        _stats["connected"] = True
                if len(buf) > 8_000_000:
                    buf = buf[-2:]
        except Exception:
            pass
        with _lock:
            _stats["connected"] = False
        time.sleep(RECONNECT_DELAY)

# ── Worker: YOLO on ESP32 frames ──────────────────────────────────────────────
def _annotate_worker():
    global _latest_ann_jpg, _stats
    model   = _get_model()
    last_raw = None; last_t = time.perf_counter(); fps = 0.0
    while True:
        with _lock:
            raw = _latest_raw_jpg
        if raw is None or raw is last_raw:
            time.sleep(0.03); continue
        last_raw = raw
        frame = cv2.imdecode(np.frombuffer(raw, np.uint8), cv2.IMREAD_COLOR)
        if frame is None:
            time.sleep(0.03); continue
        h, w = frame.shape[:2]

        if model:
            try:
                persons, chairs, tables = _infer(model, frame)
                chair_occ = _occupancy(persons, chairs, w, h)
                occ_count = sum(1 for *_, is_occ in chair_occ if is_occ)
                for box, cf, is_occ in chair_occ:
                    _draw(frame, box, (0, 0, 255) if is_occ else (0, 200, 0),
                          "OCC" if is_occ else "FREE")
                for box, cf in tables:  _draw(frame, box, (255, 180, 0), "table")
                for box, cf in persons: _draw(frame, box, (0, 255, 255), "person")
                total = len(chair_occ)
                free  = max(0, total - occ_count)
                now_t = time.perf_counter()
                fps   = 0.9 * fps + 0.1 / max(1e-6, now_t - last_t); last_t = now_t
                ov = (f"Occupied:{occ_count}  Free:{free}  Chairs:{total}  "
                      f"Persons:{len(persons)}  Tables:{len(tables)}  FPS:{fps:.1f}")
                cv2.putText(frame, ov, (10, 26), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (20,20,20), 1, cv2.LINE_AA)
                cv2.putText(frame, ov, (10, 26), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255,255,255), 2, cv2.LINE_AA)
                # ── Update stats BEFORE encoding so they always get written ──
                chair_list = []
                for idx, (box, cf, is_occ) in enumerate(chair_occ, start=1):
                    chair_list.append({
                        "id":     idx,
                        "status": "OCC" if is_occ else "FREE",
                        "conf":   round(float(cf), 2),
                    })

                new_stats = {
                    "occupied":     int(occ_count),
                    "free":         int(free),
                    "total_chairs": int(total),
                    "persons":      int(len(persons)),
                    "tables":       int(len(tables)),
                    "fps":          float(round(fps, 1)),
                    "chairs":       chair_list,
                    "connected":    True,
                }
                with _lock:
                    _stats.update(new_stats)

                ret, buf = cv2.imencode(".jpg", frame, [cv2.IMWRITE_JPEG_QUALITY, JPEG_QUALITY])
                if ret:
                    with _lock:
                        _latest_ann_jpg = buf.tobytes()
            except Exception as ex:
                print(f"[annotate] {ex}", file=sys.stderr)
        time.sleep(0.01)

# ── Worker: YOLO on video.mp4 ─────────────────────────────────────────────────
def _video_yolo_worker():
    global _latest_vid_jpg, _video_stats
    model  = _get_model()
    vpath  = str(VIDEO_PATH)
    last_t = time.perf_counter(); fps = 0.0

    while True:
        cap = cv2.VideoCapture(vpath)
        if not cap.isOpened():
            print(f"[video worker] Cannot open {vpath}", file=sys.stderr)
            time.sleep(5); continue

        with _lock:
            _video_stats["connected"] = True

        frame_num = 0
        while True:
            ok, frame = cap.read()
            if not ok:
                break   # restart video (loop)
            frame_num += 1
            h, w = frame.shape[:2]
            chair_list: List[dict] = []

            if model:
                try:
                    persons, chairs, tables = _infer(model, frame)
                    chair_occ = _occupancy(persons, chairs, w, h)
                    occ_count = 0

                    for idx, (box, cf, is_occ) in enumerate(chair_occ, start=1):
                        if is_occ:
                            occ_count += 1
                        color = (0, 0, 255) if is_occ else (0, 200, 0)
                        _draw(frame, box, color, f"{'OCC' if is_occ else 'FREE'} {cf:.2f}")
                        chair_list.append({
                            "id":     idx,
                            "status": "OCC" if is_occ else "FREE",
                            "conf":   round(float(cf), 2),
                        })

                    for box, cf in tables:  _draw(frame, box, (255, 180, 0), f"table {cf:.2f}")
                    for box, cf in persons: _draw(frame, box, (0, 255, 255), f"person {cf:.2f}")

                    total = len(chair_occ)
                    free  = max(0, total - occ_count)
                    now_t = time.perf_counter()
                    fps   = 0.9 * fps + 0.1 / max(1e-6, now_t - last_t); last_t = now_t

                    ov = (f"Occupied:{occ_count}  Free:{free}  Chairs:{total}  "
                          f"Persons:{len(persons)}  Tables:{len(tables)}  FPS:{fps:.1f}")
                    cv2.putText(frame, ov, (10, 26), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (20,20,20), 1, cv2.LINE_AA)
                    cv2.putText(frame, ov, (10, 26), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255,255,255), 2, cv2.LINE_AA)

                    # ── Update stats BEFORE encoding so they always get written ──
                    new_stats = {
                        "occupied":     int(occ_count),
                        "free":         int(free),
                        "total_chairs": int(total),
                        "persons":      int(len(persons)),
                        "tables":       int(len(tables)),
                        "fps":          float(round(fps, 1)),
                        "chairs":       list(chair_list),
                        "connected":    True,
                    }
                    with _lock:
                        _video_stats.update(new_stats)

                    if frame_num % 30 == 0:
                        print(f"[video-stats] occ={occ_count} free={free} chairs={total} persons={len(persons)} fps={fps:.1f}")

                    ret, buf = cv2.imencode(".jpg", frame, [cv2.IMWRITE_JPEG_QUALITY, JPEG_QUALITY])
                    if ret:
                        with _lock:
                            _latest_vid_jpg = buf.tobytes()

                except Exception as ex:
                    print(f"[video yolo] {ex}", file=sys.stderr)

            time.sleep(0.04)   # ~25 fps cap

        cap.release()
        time.sleep(0.1)   # brief pause before restart

# ── Start daemon threads ───────────────────────────────────────────────────────
threading.Thread(target=_raw_stream_worker, daemon=True, name="raw-stream").start()
threading.Thread(target=_annotate_worker,   daemon=True, name="annotate").start()
threading.Thread(target=_video_yolo_worker, daemon=True, name="video-yolo").start()

# ── MJPEG generator ────────────────────────────────────────────────────────────
async def _mjpeg(get_fn) -> AsyncGenerator[bytes, None]:
    boundary = b"--frame\r\nContent-Type: image/jpeg\r\n\r\n"
    last: Optional[bytes] = None
    while True:
        f = get_fn()
        if f is not None and f is not last:
            last = f
            yield boundary + f + b"\r\n"
        await asyncio.sleep(0.03)

# ── Endpoints ──────────────────────────────────────────────────────────────────
@router.get("/raw-stream")
async def raw_stream(request: Request):
    def _g():
        with _lock: return _latest_raw_jpg
    return StreamingResponse(_mjpeg(_g),
        media_type="multipart/x-mixed-replace; boundary=frame",
        headers={"Cache-Control": "no-cache"})

@router.get("/annotated-stream")
async def annotated_stream(request: Request):
    def _g():
        with _lock: return _latest_ann_jpg
    return StreamingResponse(_mjpeg(_g),
        media_type="multipart/x-mixed-replace; boundary=frame",
        headers={"Cache-Control": "no-cache"})

@router.get("/stats")
async def get_stats():
    with _lock: return JSONResponse(_stats)

@router.get("/video-annotated-stream")
async def video_annotated_stream(request: Request):
    """YOLO-annotated video.mp4 MJPEG stream."""
    def _g():
        with _lock: return _latest_vid_jpg
    return StreamingResponse(_mjpeg(_g),
        media_type="multipart/x-mixed-replace; boundary=frame",
        headers={"Cache-Control": "no-cache"})

@router.get("/video-stats")
async def get_video_stats():
    """Per-chair occupancy + aggregate stats for the video.mp4 source."""
    with _lock: return JSONResponse(_video_stats)
