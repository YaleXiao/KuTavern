from fastapi import FastAPI

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.post("/api/llm")
async def request_to_koboldcpp(item: dict):
    # 处理 POST 请求，自动解析 JSON Body
    return {"received": item}

