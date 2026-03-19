from fastapi import Request
from fastapi.responses import RedirectResponse


async def get_current_user(request: Request):
    token = request.cookies.get("authon_token")
    if not token:
        return None
    try:
        return await request.app.state.authon.verify_token(token)
    except Exception:
        return None


async def require_auth(request: Request):
    user = await get_current_user(request)
    if not user:
        return RedirectResponse("/sign-in", status_code=302)
    return user
