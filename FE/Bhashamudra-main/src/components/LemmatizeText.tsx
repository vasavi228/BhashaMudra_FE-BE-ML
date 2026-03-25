import React, { useState } from 'react';
import axios from 'axios';

const LemmatizeText = () => {
  const [text, setText] = useState('');
  const [response, setResponse] = useState<any>(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setText(event.target.value);
  };

  const processText = () => {
    axios
      .post('http://127.0.0.1:8000/api/process-text/', { sentence: text })
      .then((response) => {
        setResponse(response.data);
        setCurrentVideoIndex(0); // Reset video index
        playNextVideo(response.data.videos, 0); // Start playing videos
      })
      .catch((error) => {
        console.error('Error during text processing:', error);
      });
  };

  const playNextVideo = (videos: string[], index: number) => {
    if (index < videos.length) {
      const videoUrl = videos[index];
      console.log(Playing: ${videoUrl});
      // Play the video corresponding to the current word or letter
      const videoElement = document.getElementById("video-player") as HTMLVideoElement;
      videoElement.src = path/to/videos/${videoUrl}; // Make sure you have the correct path
      videoElement.play();

      // Once the video ends, move to the next one
      videoElement.onended = () => {
        playNextVideo(videos, index + 1);
      };
    }
  };

  return (
    <div>
      <input
        type="text"
        value={text}
        onChange={handleTextChange}
        placeholder="Enter text to process"
      />
      <button onClick={processText}>Process Text</button>
      {response && (
        <div>
          <h3>Processed Videos:</h3>
          <video id="video-player" width="320" height="240" controls>
            Your browser does not support the video tag.
          </video>
        </div>
      )}
    </div>
  );
};

export default LemmatizeText;