from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Verify admin user email'

    def handle(self, *args, **options):
        try:
            admin_user = User.objects.get(email='admin@example.com')
            admin_user.is_email_verified = True
            admin_user.save()
            self.stdout.write(
                self.style.SUCCESS(f'Successfully verified email for {admin_user.email}')
            )
        except User.DoesNotExist:
            self.stdout.write(
                self.style.ERROR('Admin user not found')
            )
