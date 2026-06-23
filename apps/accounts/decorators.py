from functools import wraps

from ninja.errors import HttpError


def require_role(*roles):
    """
    Belirtilen rollerden birine sahip olmayan kullanıcıları 403 ile reddeder.

    Kullanım (router dekoratörü EN DIŞTA olmalı):

        @router.post("/")
        @require_role("admin", "editor")
        def create(request, payload: ProjectIn): ...
    """

    def decorator(func):
        @wraps(func)
        def wrapper(request, *args, **kwargs):
            auth = getattr(request, "auth", None) or {}
            if auth.get("role") not in roles:
                raise HttpError(403, "Bu işlem için yetkiniz yok")
            return func(request, *args, **kwargs)

        return wrapper

    return decorator
