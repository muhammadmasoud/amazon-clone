from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings


def send_verification_email(user):
    """Send email verification email to user"""
    subject = 'Verify your Amazon Clone account'
    
    # Create verification URL
    verification_url = f"{settings.FRONTEND_URL}/verify-email/{user.email_verification_token}"
    
    # HTML email content
    html_message = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
        <style>
            body {{
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }}
            .header {{
                background-color: #131921;
                color: white;
                padding: 20px;
                text-align: center;
                border-radius: 8px 8px 0 0;
            }}
            .content {{
                background-color: #f9f9f9;
                padding: 30px;
                border-radius: 0 0 8px 8px;
                border: 1px solid #ddd;
            }}
            .button {{
                display: inline-block;
                background-color: #f0c14b;
                color: #000;
                padding: 12px 30px;
                text-decoration: none;
                border-radius: 6px;
                font-weight: bold;
                margin: 20px 0;
                border: 1px solid #a88734;
            }}
            .button:hover {{
                background-color: #f4d078;
            }}
            .footer {{
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #ddd;
                font-size: 12px;
                color: #666;
            }}
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Amazon Clone</h1>
        </div>
        <div class="content">
            <h2>Welcome to Amazon Clone!</h2>
            <p>Hello {user.first_name},</p>
            <p>Thank you for creating an account with us. To complete your registration and start shopping, please verify your email address by clicking the button below:</p>
            
            <div style="text-align: center;">
                <a href="{verification_url}" class="button">Verify My Email</a>
            </div>
            
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background-color: #eee; padding: 10px; border-radius: 4px;">
                {verification_url}
            </p>
            
            <p><strong>Important:</strong> This verification link will expire in 24 hours for security reasons.</p>
            
            <p>If you didn't create an account with us, please ignore this email.</p>
            
            <p>Best regards,<br>The Amazon Clone Team</p>
        </div>
        <div class="footer">
            <p>This is an automated email, please do not reply to this message.</p>
        </div>
    </body>
    </html>
    """
    
    # Plain text version for email clients that don't support HTML
    plain_message = f"""
    Welcome to Amazon Clone!

    Hello {user.first_name},

    Thank you for creating an account with us. To complete your registration and start shopping, please verify your email address by clicking the link below:

    {verification_url}

    Important: This verification link will expire in 24 hours for security reasons.

    If you didn't create an account with us, please ignore this email.

    Best regards,
    The Amazon Clone Team
    """
    
    try:
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            html_message=html_message,
            fail_silently=False,
        )
        return True
    except Exception as e:
        print(f"Failed to send verification email: {e}")
        return False