import os
from pathlib import Path

from fastapi import FastAPI, Request, Response
from fastapi.responses import HTMLResponse, JSONResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from authon import AuthonBackend

app = FastAPI()

templates = Jinja2Templates(directory=str(Path(__file__).parent / "templates"))

authon = AuthonBackend(
    secret_key=os.environ["AUTHON_API_KEY"],
    api_url=os.environ.get("AUTHON_API_URL", "https://api.authon.dev"),
)

PROJECT_ID = os.environ.get("AUTHON_PROJECT_ID", "")
API_URL = os.environ.get("AUTHON_API_URL", "https://api.authon.dev")
WEBHOOK_SECRET = os.environ.get("AUTHON_WEBHOOK_SECRET", "")


@app.get("/", response_class=HTMLResponse)
async def index(request: Request, response: Response):
    user = None
    token = request.cookies.get("authon_token")
    if token:
        try:
            user = authon.verify_token(token)
        except Exception:
            response.delete_cookie("authon_token")
    return templates.TemplateResponse(
        "index.html",
        {
            "request": request,
            "user": user,
            "project_id": PROJECT_ID,
            "api_url": API_URL,
        },
    )


@app.post("/auth/token")
async def set_token(request: Request):
    data = await request.json()
    token = data.get("token")
    if not token:
        return JSONResponse({"error": "missing token"}, status_code=400)
    resp = JSONResponse({"ok": True})
    resp.set_cookie(
        key="authon_token",
        value=token,
        httponly=True,
        samesite="lax",
        max_age=3600,
    )
    return resp


@app.post("/auth/signout")
async def signout():
    resp = RedirectResponse(url="/", status_code=303)
    resp.delete_cookie("authon_token")
    return resp


@app.post("/webhook")
async def webhook(request: Request):
    body = await request.body()
    sig = request.headers.get("x-authon-signature", "")
    try:
        event = authon.webhooks.verify(body, sig, WEBHOOK_SECRET)
        print("Webhook received:", event)
        return {"ok": True}
    except ValueError:
        return JSONResponse({"error": "invalid signature"}, status_code=400)
