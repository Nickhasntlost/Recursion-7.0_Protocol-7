import requests
import json

queries = {
    "Karan Aujla": "Karan_Aujla",
    "Samay Raina": "Samay_Raina",
    "Seedhe Maut": "Seedhe_Maut",
    "Butter Chicken": "Butter_chicken",
    "Indie Film": "Cinema_of_India",
    "Modern Art": "National_Gallery_of_Modern_Art,_New_Delhi",
    "IPL Fan Zone": "Arun_Jaitley_Stadium"
}

results = {}
headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

for name, title in queries.items():
    url = f"https://en.wikipedia.org/w/api.php?action=query&titles={title}&prop=pageimages&format=json&pithumbsize=800"
    try:
        res = requests.get(url, headers=headers).json()
        pages = res['query']['pages']
        for page_id in pages:
            if 'thumbnail' in pages[page_id]:
                results[name] = pages[page_id]['thumbnail']['source']
            else:
                results[name] = None
    except Exception as e:
        results[name] = f"Error: {e}"

with open("images.json", "w") as f:
    json.dump(results, f, indent=2)
