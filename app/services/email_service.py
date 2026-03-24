"""
Email service using FREE Gmail SMTP
Setup: Enable 2FA on Gmail, then generate App Password
https://myaccount.google.com/apppasswords
"""

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings
from typing import Optional
from datetime import datetime


class EmailService:
    def __init__(self):
        self.smtp_server = "smtp.gmail.com"
        self.smtp_port = 587
        self.sender_email = settings.SMTP_EMAIL
        self.sender_password = settings.SMTP_PASSWORD
        self.enabled = bool(settings.SMTP_EMAIL and settings.SMTP_PASSWORD)

    def send_email(self, to_email: str, subject: str, html_content: str) -> bool:
        """Send email using Gmail SMTP (FREE!)"""

        if not self.enabled:
            print(f"⚠️  Email not configured. Would have sent to {to_email}: {subject}")
            return False

        try:
            # Create message
            message = MIMEMultipart("alternative")
            message["Subject"] = subject
            message["From"] = f"Event Booking System <{self.sender_email}>"
            message["To"] = to_email

            # Attach HTML content
            html_part = MIMEText(html_content, "html")
            message.attach(html_part)

            # Connect to Gmail SMTP
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.sender_email, self.sender_password)
                server.send_message(message)

            print(f"[OK] Email sent to {to_email}: {subject}")
            return True

        except Exception as e:
            print(f"[ERROR] Email failed to {to_email}: {str(e)}")
            return False

    def send_task_assignment_email(
        self,
        volunteer_name: str,
        volunteer_email: str,
        event_title: str,
        task_title: str,
        task_description: str,
        priority: str,
        due_date: Optional[datetime] = None,
        location: Optional[str] = None,
        estimated_hours: Optional[float] = None
    ) -> bool:
        """Send task assignment notification to volunteer"""

        subject = f"New Task Assigned: {task_title} - {event_title}"

        # Format due date
        due_date_str = due_date.strftime("%B %d, %Y at %I:%M %p") if due_date else "Not specified"

        # Priority emoji
        priority_emoji = {
            "low": "🟢",
            "medium": "🟡",
            "high": "🔴"
        }.get(priority.lower(), "⚪")

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                }}
                .container {{
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }}
                .header {{
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 30px;
                    border-radius: 10px 10px 0 0;
                    text-align: center;
                }}
                .content {{
                    background: #f9f9f9;
                    padding: 30px;
                    border-radius: 0 0 10px 10px;
                }}
                .task-details {{
                    background: white;
                    padding: 20px;
                    border-radius: 8px;
                    margin: 20px 0;
                    border-left: 4px solid #667eea;
                }}
                .detail-row {{
                    margin: 10px 0;
                }}
                .label {{
                    font-weight: bold;
                    color: #667eea;
                }}
                .button {{
                    display: inline-block;
                    padding: 12px 30px;
                    background: #667eea;
                    color: white;
                    text-decoration: none;
                    border-radius: 5px;
                    margin-top: 20px;
                }}
                .footer {{
                    text-align: center;
                    margin-top: 30px;
                    color: #666;
                    font-size: 12px;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>📋 New Task Assigned!</h1>
                    <p>You have been assigned a new task for {event_title}</p>
                </div>
                <div class="content">
                    <p>Hi {volunteer_name},</p>
                    <p>You have been assigned a new task. Here are the details:</p>

                    <div class="task-details">
                        <h2>{task_title}</h2>

                        <div class="detail-row">
                            <span class="label">Description:</span><br>
                            {task_description}
                        </div>

                        <div class="detail-row">
                            <span class="label">Priority:</span> {priority_emoji} {priority.upper()}
                        </div>

                        <div class="detail-row">
                            <span class="label">Due Date:</span> {due_date_str}
                        </div>

                        {f'<div class="detail-row"><span class="label">Location:</span> {location}</div>' if location else ''}

                        {f'<div class="detail-row"><span class="label">Estimated Time:</span> {estimated_hours} hours</div>' if estimated_hours else ''}

                        <div class="detail-row">
                            <span class="label">Event:</span> {event_title}
                        </div>
                    </div>

                    <p>Please acknowledge this task and update your progress regularly.</p>

                    <center>
                        <a href="{settings.FRONTEND_URL}/my-tasks" class="button">
                            View My Tasks
                        </a>
                    </center>

                    <div class="footer">
                        <p>This is an automated notification from Event Booking System</p>
                        <p>If you have any questions, please contact the event organizer</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
        """

        return self.send_email(volunteer_email, subject, html_content)

    def send_task_update_email(
        self,
        volunteer_name: str,
        volunteer_email: str,
        event_title: str,
        task_title: str,
        update_message: str
    ) -> bool:
        """Send task update notification"""

        subject = f"Task Updated: {task_title} - {event_title}"

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2>📝 Task Update</h2>
                <p>Hi {volunteer_name},</p>
                <p>There has been an update to your task: <strong>{task_title}</strong></p>
                <div style="background: #f0f0f0; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    {update_message}
                </div>
                <p>Event: {event_title}</p>
                <a href="{settings.FRONTEND_URL}/my-tasks" style="display: inline-block; padding: 10px 20px; background: #667eea; color: white; text-decoration: none; border-radius: 5px;">
                    View Task Details
                </a>
            </div>
        </body>
        </html>
        """

        return self.send_email(volunteer_email, subject, html_content)

    def send_booking_confirmation_email(
        self,
        user_name: str,
        user_email: str,
        booking_number: str,
        event_title: str,
        event_date,
        total_tickets: int,
        total_amount: float,
        tickets: list
    ):
        """Send booking confirmation email to user"""

        subject = f"Booking Confirmed - {event_title}"

        html_content = f"""
        <html>
            <head>
                <style>
                    body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                    .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
                    .ticket-info {{ background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #667eea; }}
                    .success-badge {{ background: #10b981; color: white; padding: 5px 15px; border-radius: 20px; display: inline-block; font-weight: bold; }}
                    .footer {{ text-align: center; margin-top: 20px; color: #666; font-size: 12px; }}
                    .btn {{ background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🎉 Booking Confirmed!</h1>
                        <p style="font-size: 18px; margin: 10px 0;">Your tickets are ready!</p>
                    </div>
                    <div class="content">
                        <p>Hi <strong>{user_name}</strong>,</p>
                        <p>Great news! Your booking has been confirmed. Here are your booking details:</p>

                        <div class="ticket-info">
                            <p><span class="success-badge">CONFIRMED</span></p>
                            <h2 style="margin: 15px 0;">{event_title}</h2>
                            <p><strong>Booking Number:</strong> {booking_number}</p>
                            <p><strong>Event Date:</strong> {event_date.strftime('%B %d, %Y at %I:%M %p')}</p>
                            <p><strong>Total Tickets:</strong> {total_tickets}</p>
                            <p><strong>Total Amount:</strong> ₹{total_amount:.2f}</p>

                            <h3 style="margin-top: 20px;">Your Seats:</h3>
                            <ul>
                                {"".join([f"<li>{ticket.seat_info.seat_label if ticket.seat_info else 'General'} - {ticket.tier_name}</li>" for ticket in tickets])}
                            </ul>
                        </div>

                        <p style="text-align: center;">
                            <a href="{settings.FRONTEND_URL}/my-bookings" class="btn">View My Bookings</a>
                        </p>

                        <p><strong>Important:</strong></p>
                        <ul>
                            <li>Please arrive at the venue at least 30 minutes before the event</li>
                            <li>Carry a valid ID for verification</li>
                            <li>Present your QR code at the entrance</li>
                        </ul>
                    </div>
                    <div class="footer">
                        <p>Need help? Contact us at support@eventbooking.com</p>
                        <p>&copy; 2026 Event Booking Platform. All rights reserved.</p>
                    </div>
                </div>
            </body>
        </html>
        """

        return self.send_email(user_email, subject, html_content)

    def send_booking_cancellation_email(
        self,
        user_name: str,
        user_email: str,
        booking_number: str,
        event_title: str,
        refund_amount: float
    ):
        """Send booking cancellation email"""

        subject = f"Booking Cancelled - {event_title}"

        html_content = f"""
        <html>
            <head>
                <style>
                    body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .header {{ background: #ef4444; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                    .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
                    .info-box {{ background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }}
                    .footer {{ text-align: center; margin-top: 20px; color: #666; font-size: 12px; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Booking Cancelled</h1>
                    </div>
                    <div class="content">
                        <p>Hi <strong>{user_name}</strong>,</p>
                        <p>Your booking has been cancelled as requested.</p>

                        <div class="info-box">
                            <h2>{event_title}</h2>
                            <p><strong>Booking Number:</strong> {booking_number}</p>
                            <p><strong>Refund Amount:</strong> ₹{refund_amount:.2f}</p>
                            <p><strong>Refund Status:</strong> Processing</p>
                        </div>

                        <p>The refund will be credited to your original payment method within 5-7 business days.</p>
                    </div>
                    <div class="footer">
                        <p>Questions? Contact us at support@eventbooking.com</p>
                    </div>
                </div>
            </body>
        </html>
        """

        return self.send_email(user_email, subject, html_content)

    def send_seat_change_confirmation_email(
        self,
        user_name: str,
        user_email: str,
        booking_number: str,
        event_title: str,
        old_seats: list,
        new_seats: list,
        additional_charge: float,
        refund_amount: float
    ):
        """Send seat change confirmation email"""

        subject = f"Seats Changed - {event_title}"

        charge_info = ""
        if additional_charge > 0:
            charge_info = f"<p><strong>Additional Charge:</strong> ₹{additional_charge:.2f}</p>"
        elif refund_amount > 0:
            charge_info = f"<p><strong>Refund Amount:</strong> ₹{refund_amount:.2f}</p>"

        html_content = f"""
        <html>
            <head>
                <style>
                    body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .header {{ background: #3b82f6; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                    .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
                    .info-box {{ background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }}
                    .footer {{ text-align: center; margin-top: 20px; color: #666; font-size: 12px; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Seats Changed Successfully</h1>
                    </div>
                    <div class="content">
                        <p>Hi <strong>{user_name}</strong>,</p>
                        <p>Your seat selection has been updated.</p>

                        <div class="info-box">
                            <h2>{event_title}</h2>
                            <p><strong>Booking Number:</strong> {booking_number}</p>

                            <h3>Previous Seats:</h3>
                            <p>{", ".join(old_seats)}</p>

                            <h3>New Seats:</h3>
                            <p>{", ".join(new_seats)}</p>

                            {charge_info}
                        </div>
                    </div>
                    <div class="footer">
                        <p>Questions? Contact us at support@eventbooking.com</p>
                    </div>
                </div>
            </body>
        </html>
        """

        return self.send_email(user_email, subject, html_content)


# Singleton instance
email_service = EmailService()
