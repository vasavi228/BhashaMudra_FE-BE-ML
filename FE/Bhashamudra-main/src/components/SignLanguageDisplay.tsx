import React from "react";

interface SignLanguageDisplayProps {
  video: string;
}

const SignLanguageDisplay: React.FC<SignLanguageDisplayProps> = ({ video }) => {
  return (
    <div>
      {video ? (
        <video width="300" controls autoPlay>
          <source src={`/videos/assets/${video}`} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      ) : (
        <p>No sign language video available</p>
      )}
    </div>
  );
};

export default SignLanguageDisplay;