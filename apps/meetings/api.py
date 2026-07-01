from typing import Optional

from django.shortcuts import get_object_or_404
from ninja import Router

from apps.accounts.decorators import require_role
from apps.accounts.models import User
from apps.projects.models import Project

from .models import Meeting, ActionItem
from .schemas import (
    MeetingIn,
    MeetingOut,
    MeetingPatch,
    ActionItemIn,
    ActionItemOut,
    ActionItemPatch,
)

router = Router()


def _meeting_qs():
    return Meeting.objects.select_related("project", "created_by").prefetch_related(
        "participants"
    )


@router.get("", response=list[MeetingOut])
def list_meetings(request, project_id: Optional[int] = None):
    qs = _meeting_qs()
    if project_id:
        qs = qs.filter(project_id=project_id)
    return list(qs)


@router.post("", response={200: MeetingOut})
@require_role("admin", "editor")
def create_meeting(request, payload: MeetingIn):
    project = get_object_or_404(Project, id=payload.project_id)
    auth = getattr(request, "auth", {}) or {}
    meeting = Meeting.objects.create(
        project=project,
        title=payload.title,
        type=payload.type,
        meeting_date=payload.meeting_date,
        location=payload.location,
        minutes=payload.minutes,
        created_by_id=auth.get("user_id"),
    )
    if payload.participant_ids:
        meeting.participants.set(payload.participant_ids)
    return _meeting_qs().get(id=meeting.id)


@router.get("/{meeting_id}", response=MeetingOut)
def get_meeting(request, meeting_id: int):
    return get_object_or_404(_meeting_qs(), id=meeting_id)


@router.patch("/{meeting_id}", response=MeetingOut)
@require_role("admin", "editor")
def update_meeting(request, meeting_id: int, payload: MeetingPatch):
    meeting = get_object_or_404(Meeting, id=meeting_id)
    data = payload.model_dump(exclude_unset=True)
    participant_ids = data.pop("participant_ids", None)
    for field, value in data.items():
        setattr(meeting, field, value)
    meeting.save()
    if participant_ids is not None:
        meeting.participants.set(participant_ids)
    return _meeting_qs().get(id=meeting.id)


# ── ActionItem ────────────────────────────────────────────────────────────────

@router.get("/{meeting_id}/actions", response=list[ActionItemOut])
def list_actions(request, meeting_id: int):
    get_object_or_404(Meeting, id=meeting_id)
    return list(
        ActionItem.objects.select_related("meeting", "owner").filter(meeting_id=meeting_id)
    )


@router.post("/{meeting_id}/actions", response={200: ActionItemOut})
@require_role("admin", "editor")
def create_action(request, meeting_id: int, payload: ActionItemIn):
    meeting = get_object_or_404(Meeting, id=meeting_id)
    action = ActionItem.objects.create(
        meeting=meeting,
        description=payload.description,
        owner_id=payload.owner_id,
        due_date=payload.due_date,
        status=payload.status,
    )
    return ActionItem.objects.select_related("meeting", "owner").get(id=action.id)


@router.patch("/{meeting_id}/actions/{action_id}", response=ActionItemOut)
@require_role("admin", "editor")
def update_action(request, meeting_id: int, action_id: int, payload: ActionItemPatch):
    action = get_object_or_404(ActionItem, id=action_id, meeting_id=meeting_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(action, field, value)
    action.save()
    return ActionItem.objects.select_related("meeting", "owner").get(id=action.id)
