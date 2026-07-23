import { useState } from 'react';

function App() {
  const [text, setText] = useState<string>('Hello, World!');
 
  return (
    <div>
      <div>
        <p>{text}</p>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>
      <div>
        <audio src="your-audio-file.mp3" controls></audio>
      </div>
      <div>
        <img src="your-image-file.jpg" alt="Your Image" />
      </div>
    </div>
  )
}

export default App;