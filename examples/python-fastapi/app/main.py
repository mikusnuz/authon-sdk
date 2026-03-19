import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from dotenv import load_dotenv

from authon import AsyncAuthonBackend

from .routes import router

load_dotenv()

templates_dir = os.path.join(os.path.dirname(__file__), "templates")
templates = Jinja2Templates(directory=templates_dir)


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.authon = AsyncAuthonBackend(
        secret_key=os.environ.get("AUTHON_SECRET_KEY", ""),
        api_url=os.environ.get("AUTHON_API_URL", "https://api.authon.dev"),
    )
    app.state.publishable_key = os.environ.get("AUTHON_PUBLISHABLE_KEY", "")
    app.state.api_url = os.environ.get("AUTHON_API_URL", "https://api.authon.dev")
    app.state.templates = templates
    yield
    await app.state.authon.close()


app = FastAPI(lifespan=lifespan)
app.include_router(router)


@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    token = request.cookies.get("authon_token")
    return templates.TemplateResponse(
        "home.html",
        {
            "request": request,
            "token": token,
            "publishable_key": request.app.state.publishable_key,
            "api_url": request.app.state.api_url,
        },
    )
