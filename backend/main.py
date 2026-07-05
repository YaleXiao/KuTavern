from edge_tts import Communicate
import asyncio

async def main():
    kutavern = Communicate(text="你好，我在.", voice="zh-CN-XiaoxiaoNeural")
    await kutavern.save("output.mp3")

asyncio.run(main())
