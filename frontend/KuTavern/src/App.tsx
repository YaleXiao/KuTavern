import { useState, useRef } from 'react';

function App() {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const finalTextRef = useRef('');
  const interimTextRef = useRef('');
  const backendUrl = 'http://localhost:5200';

  const startListening = () => {
    // 获取语音识别对象
   const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('浏览器不支持语音识别，请使用 Chrome 或 Edge');
      return;
    }

    finalTextRef.current = '';
    interimTextRef.current = '';

    // 创建实例（如果已有则复用）
    if (!recognitionRef.current) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'zh-CN';
      recognition.continuous = false;
      recognition.interimResults = true;
      
      recognition.onresult = (event: any) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const text = result[0].transcript;
          
          if (result.isFinal) {
            finalTextRef.current += text;
          } else {
            interimTextRef.current += text;
          }
        }
        
        // 临时结果显示在界面上
        setTranscript(interimTextRef.current || finalTextRef.current);
        
        // 如果是最终结果，可以在这里发送给后端
        if (finalTextRef.current) {
          console.log('🎤 最终识别：', finalTextRef.current);
          setTranscript(finalTextRef.current);
        }
      };
      
      recognition.onerror = (event: any) => {
        console.error('识别错误：', event.error);
        setIsListening(false);
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognitionRef.current = recognition;
    }

    // 开始识别
    try {
      recognitionRef.current.start();
      setIsListening(true);
      setTranscript('🎤 正在听...');
    } catch (error) {
      console.error('启动失败：', error);
    }
  };

  const stopListening = async () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
    const responseLLM = await fetch(`${backendUrl}/api/llm`, { 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: finalTextRef.current,
        model: 'gpt-3.5-turbo',
        lang: 'zh-CN'
      })

    });
    // 处理后端响应
    console.log('已发送请求到后端');
    const data = await responseLLM.json();
    console.log('后端响应：', data.response);
    console.log('后端响应：', data);

    const resopnseTTS = await fetch(`${backendUrl}/api/tts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: data.response,
        lang: 'zh-CN'
      })
    });

    console.log('已发送 TTS 请求到后端', resopnseTTS.body);

    const ttsData = await resopnseTTS.json();
    console.log('TTS 响应：', ttsData);

    // 播放音频
    const audio = new Audio(ttsData.audio_base64);
    audio.play().catch((error) => console.error('播放音频失败：', error));
  };

  return (
    <div>
      <button
        onMouseDown={startListening}  // 按住说话
        onMouseUp={stopListening}     // 松开停止
        onTouchStart={startListening} // 移动端支持
        onTouchEnd={stopListening}
        style={{
          padding: '12px 24px',
          background: isListening ? '#ff4444' : '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          cursor: 'pointer'
        }}
      >
        {isListening ? '🔴 录音中...' : '🎤 按住说话'}
      </button>
      <div style={{ marginTop: '16px', padding: '12px', border: '1px solid #ddd', minHeight: '50px' }}>
        {transcript || '语音识别结果会显示在这里'}
      </div>
      <div style={{ marginTop: '16px', padding: '12px', border: '1px solid #ddd', minHeight: '50px' }}>
        {transcript || '语音对话结果会显示在这里'}
      </div>
    </div>
  );
}

export default App;