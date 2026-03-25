declare global {
    interface Window {
      SpeechRecognition: SpeechRecognition;
      webkitSpeechRecognition: SpeechRecognition;
    }
  
    interface SpeechRecognition {
      new (): SpeechRecognition;
      lang: string;
      start: () => void;
      onresult: (event: SpeechRecognitionEvent) => void;
    }
  
    interface SpeechRecognitionEvent {
      results: SpeechRecognitionResultList;
    }
  }
  
  export {};