import base64
from pathlib import Path

import httpx
from fastapi import FastAPI, HTTPException
import edge_tts

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# 配置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# KoboldCpp 的地址（你之前启动的）
KOBOLD_URL = "http://127.0.0.1:5001"
KOBOLD_ENDPOINT = "/api/v1/generate"

@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.post("/api/llm")
async def request_to_koboldcpp(item: dict):
    try:
        # 1. 从请求中提取文本
        print(f"收到请求: {item}")
        user_text = item.get("text", "")
        model = item.get("model", "default")
        lang = item.get("lang", "zh-CN")
        
        print(f"收到用户消息: {user_text}")
        
        # 2. 构造发送给 KoboldCpp 的请求
        # KoboldCpp 的 API 文档：https://github.com/LostRuins/koboldcpp/blob/development/README.md
        kobold_payload = {
            "prompt": user_text,  # 用户的输入
            "max_context_length": 12288,  # 上下文长度（匹配你之前的设置）
            "max_length": 500,  # 生成的最大 token 数
            "temperature": 0.7,  # 创造性
            "top_p": 0.9
        }
        
        # 3. 发送请求到 KoboldCpp
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{KOBOLD_URL}{KOBOLD_ENDPOINT}",
                json=kobold_payload,
                timeout=60.0
            )
            
            if response.status_code == 200:
                result = response.json()
                # 4. 提取生成的文本
                results = result.get("results") or []
                generated_text = results[0].get("text", "") if results else ""
                print(f"AI 回复: {generated_text}")
                
                # 5. 返回给前端
                return {
                    "response": generated_text,
                    "status": "success"
                }
            else:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"KoboldCpp 返回错误: {response.text}"
                )
                
    except Exception as e:
        print(f"处理出错: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/tts")
async def text_to_speech(item: dict):
    # 这里实现 TTS 逻辑
    text = item.get("text", "")
    lang = item.get("lang", "zh-CN")
    
    print(f"收到 TTS 请求: {text}")

    # 使用 edge-tts 进行文本转语音
    audio_path = Path(__file__).with_name("output.mp3")
    await edge_tts.Chat(request=text, voice="zh-CN-XiaoxiaoNeural", rate=1.0, volume=1.0).save(str(audio_path))

    # 读取音频文件并转换为 base64
    with audio_path.open("rb") as f:
        audio_bytes = f.read()
        audio_file = "data:audio/mpeg;base64," + base64.b64encode(audio_bytes).decode("utf-8")

    return {
        "audio_base64": audio_file,  # 或音频文件路径
        "status": "success"
    }