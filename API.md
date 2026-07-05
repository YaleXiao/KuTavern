# 定API文档

fastapi 开两个接口，一个这个语音接口，一个llm接口
路径怎么设置，：8000/api/llm
            :8000/api/tts
参数设置包括
 llm:
    request:
        model: qwen
        lang: zh-CN
        text: hello , i am a tiger
    response:
        reply: yes, you are a tiger


tts:
    request:
        text: hello , i am a tiger
        lang: zh-CN
        voice: XiaoxiaoNetural
        provider: edge-tts || gpt-sovits || any
        rate: default
    esponse:
        audioUrl: https://www.yalex.top/
        
