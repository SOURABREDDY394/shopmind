from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from modules.sales import router as sales_router
from utils.settings import settings

def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.app_name,
        description="FastAPI backend with Sales analytics.",
        version="0.1.0",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_allowed_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/health")
    async def health_check():
        return {"status": "ok"}

    # Include modules
    app.include_router(sales_router)

    return app

app = create_app()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
