from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings


def send_verification_email(user):
    """Send email verification email to user"""
    subject = 'Verify your Amazon Clone account'
    
    # Create verification URL
    verification_url = f"{settings.FRONTEND_URL}/verify-email/{user.email_verification_token}"
    
    # HTML email content with fixed button styling
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
                display: inline-block !important;
                background-color: #f0c14b !important;
                color: #000 !important;
                padding: 12px 30px !important;
                text-decoration: none !important;
                border-radius: 6px !important;
                font-weight: bold !important;
                margin: 20px 0 !important;
                border: 1px solid #a88734 !important;
                cursor: pointer !important;
            }}
            .button:hover {{
                background-color: #f4d078 !important;
            }}
            .button-container {{
                text-align: center;
                margin: 20px 0;
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
            
            <div class="button-container">
                <a href="{verification_url}" class="button" style="display: inline-block; background-color: #f0c14b; color: #000; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; border: 1px solid #a88734;">Verify My Email</a>
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


def send_password_reset_email(user):
    """Send password reset email to user"""
    subject = 'Reset your Amazon Clone password'
    
    # Create password reset URL
    reset_url = f"{settings.FRONTEND_URL}/reset-password/{user.password_reset_token}"
    
    # HTML email content
    html_message = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
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
                display: inline-block !important;
                background-color: #f0c14b !important;
                color: #000 !important;
                padding: 12px 30px !important;
                text-decoration: none !important;
                border-radius: 6px !important;
                font-weight: bold !important;
                margin: 20px 0 !important;
                border: 1px solid #a88734 !important;
                cursor: pointer !important;
            }}
            .button:hover {{
                background-color: #f4d078 !important;
            }}
            .button-container {{
                text-align: center;
                margin: 20px 0;
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
            <h2>Password Reset Request</h2>
            <p>Hello {user.first_name or user.email},</p>
            <p>We received a request to reset your password. If you made this request, please click the button below to reset your password:</p>
            
            <div class="button-container">
                <a href="{reset_url}" class="button" style="display: inline-block; background-color: #f0c14b; color: #000; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; border: 1px solid #a88734;">Reset My Password</a>
            </div>
            
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background-color: #eee; padding: 10px; border-radius: 4px;">
                {reset_url}
            </p>
            
            <p><strong>Important:</strong> This password reset link will expire in 24 hours for security reasons.</p>
            
            <p>If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
            
            <p>Best regards,<br>The Amazon Clone Team</p>
        </div>
        <div class="footer">
            <p>This is an automated email, please do not reply to this message.</p>
        </div>
    </body>
    </html>
    """
    
    # Plain text version
    plain_message = f"""
    Password Reset Request

    Hello {user.first_name or user.email},

    We received a request to reset your password. If you made this request, please click the link below to reset your password:

    {reset_url}

    Important: This password reset link will expire in 24 hours for security reasons.

    If you didn't request a password reset, please ignore this email. Your password will remain unchanged.

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
        print(f"Failed to send password reset email: {e}")
        return False