from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import Role, User, UserProfile


@receiver(post_save, sender=User)
def ensure_user_profile(sender, instance, created, **kwargs):
    """
    Her kullanıcı için otomatik profil oluştur.
    Superuser'lar varsayılan olarak Admin rolü alır.
    """
    if created:
        role = Role.ADMIN if instance.is_superuser else Role.VIEWER
        UserProfile.objects.get_or_create(
            user=instance, defaults={"role": role}
        )
