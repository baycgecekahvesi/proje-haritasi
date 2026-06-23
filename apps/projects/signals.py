from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver

from .models import Project, Task


def _recalculate_progress(project_id: int):
    tasks = list(Task.objects.filter(project_id=project_id))
    if not tasks:
        return
    done = sum(1 for t in tasks if t.is_done)
    new_progress = round(done / len(tasks) * 100)
    Project.objects.filter(id=project_id).update(progress=new_progress)


@receiver(post_save, sender=Task)
def task_saved(sender, instance, **kwargs):
    _recalculate_progress(instance.project_id)


@receiver(post_delete, sender=Task)
def task_deleted(sender, instance, **kwargs):
    _recalculate_progress(instance.project_id)
