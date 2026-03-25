import React, { useState } from "react";

interface SpeechToTextProps {
  onTextRecognized: (text: string) => void;
}

const SpeechToText: React.FC<SpeechToTextProps> = ({ onTextRecognized }) => {
  const [text, setText] = useState<string>("");

  const startListening = () => {
    const recognition = new (window.SpeechRecognition ||
      (window as any).webkitSpeechRecognition)();
    recognition.lang = "en-US";
    recognition.start();

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      setText(transcript);
      onTextRecognized(transcript);
    };
  };

  return (
    <div>
      <button onClick={startListening}>Start Listening</button>
      <p>{text}</p>
    </div>
  );
};

export default SpeechToText;