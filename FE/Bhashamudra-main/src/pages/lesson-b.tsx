import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Camera,
  CheckCircle,
  HelpCircle,
  RefreshCcw,
  Volume2,
  Loader,
  Star,
  ThumbsUp,
  ChevronRight
} from 'lucide-react';

// Import media files
import letterAVideo from './B.mp4';
import letterAAudio from './B.mp3';

const LessonInterface = () => {
  const navigate = useNavigate();
  const [cameraActive, setCameraActive] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const handleEndLesson = () => {
    navigate('/learn/alphabets')
  };
  const handleNextLesson = () => {
    navigate('/lesson-c'); // This will be the route for Letter B lesson
  };
  // Constants for progress calculation
  const TOTAL_LETTERS = 26; // A-Z
  const CURRENT_LETTER = 2; // A is 1
  const PROGRESS_PERCENTAGE = (CURRENT_LETTER / TOTAL_LETTERS) * 100;

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.addEventListener('loadeddata', () => {
        setIsVideoLoading(false);
        setIsPlaying(true);
      });
      videoRef.current.addEventListener('error', () => {
        setVideoError(true);
        setIsVideoLoading(false);
      });
    }

    return () => {
      if (videoRef.current) {
        videoRef.current.removeEventListener('loadeddata', () => {});
        videoRef.current.removeEventListener('error', () => {});
      }
    };
  }, []);

  const handleReplay = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleAudioToggle = () => {
    if (audioRef.current) {
      if (isAudioPlaying) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      } else {
        audioRef.current.play().catch(error => {
          console.error('Audio playback failed:', error);
        });
      }
      setIsAudioPlaying(!isAudioPlaying);
    }
  };

  const handleCheckSign = () => {
    setShowSuccess(true);
    setConfetti(true);
    setTimeout(() => {
      setShowSuccess(false);
      setConfetti(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Success Overlay */}
      {showSuccess && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 transition-opacity">
          <div className="bg-white p-6 rounded-xl shadow-2xl transform animate-bounce">
            <ThumbsUp className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <p className="text-2xl font-bold text-center">Great Job!</p>
          </div>
        </div>
      )}

      {/* Top Navigation */}
      <nav className="bg-white shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 transition-transform hover:scale-105"
            >
              <span className="text-2xl font-bold bg-black text-transparent bg-clip-text">
                BhashaMudra
              </span>
            </button>
            <div className="flex items-center gap-4">
              <button className="text-purple-600 hover:text-blue-600 transition-colors">
                <HelpCircle className="h-6 w-6" />
              </button>
              <button onClick={handleEndLesson} className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 hover:scale-105 hover:shadow-lg">
                
                End Lesson
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-8">
        {/* Progress Bar */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Learning Progress (A-Z)</h3>
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-400 fill-current" />
              <span className="text-gray-600 font-medium">{CURRENT_LETTER}/26 Letters</span>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-purple-600 to-blue-600 h-full rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${PROGRESS_PERCENTAGE}%` }}
            >
              <div className="w-full h-full opacity-75 animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Letter Heading */}
        <h2 className="text-5xl font-bold text-transparent bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text mb-8 text-center animate-fade-in">
          Letter B
        </h2>

        {/* Main Content Area */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Side - Avatar Display */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-2xl">
            <div className="p-4 border-b bg-gradient-to-r from-purple-50 to-blue-50">
              <h3 className="text-lg font-semibold text-gray-800">Watch and Learn</h3>
            </div>
            <div className="aspect-video bg-gray-100 relative">
              {isVideoLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                  <Loader className="h-8 w-8 text-purple-600 animate-spin" />
                </div>
              )}
              {videoError ? (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                  <p className="text-red-500">Failed to load video</p>
                </div>
              ) : (
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  autoPlay
                  playsInline
                  src={letterAVideo}
                  onEnded={() => setIsPlaying(false)}
                />
              )}
              <audio
                ref={audioRef}
                src={letterAAudio}
                onEnded={() => setIsAudioPlaying(false)}
              />
            </div>
            <div className="p-4 flex justify-center gap-4 bg-gradient-to-r from-purple-50 to-blue-50">
              <button 
                onClick={handleReplay}
                className={`bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center gap-2 ${
                  isPlaying || isVideoLoading ? 'opacity-50 cursor-not-allowed' : 'hover:from-purple-700 hover:to-blue-700'
                }`}
                disabled={isPlaying || isVideoLoading}
              >
                <RefreshCcw className={`h-5 w-5 ${isPlaying ? 'animate-spin' : ''}`} />
                Replay
              </button>
              <button 
                onClick={handleAudioToggle}
                className={`${
                  isAudioPlaying 
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700'
                } px-6 py-2 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center gap-2`}
                disabled={isVideoLoading}
              >
                <Volume2 className={`h-5 w-5 ${isAudioPlaying ? 'animate-pulse' : ''}`} />
                Audio
              </button>
            </div>
          </div>

          {/* Right Side - User Camera Feed */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-2xl">
            <div className="p-4 border-b bg-gradient-to-r from-purple-50 to-blue-50">
              <h3 className="text-lg font-semibold text-gray-800">Practice</h3>
            </div>
            <div className="aspect-video bg-gray-100 flex items-center justify-center">
              {cameraActive ? (
                <div className="relative w-full h-full">
                  <video
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-4 right-4">
                    <button 
                      onClick={() => setCameraActive(false)}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                    >
                      Stop Camera
                    </button>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => setCameraActive(true)}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg hover:from-purple-700 hover:to-blue-700 flex items-center gap-2"
                >
                  <Camera className="h-5 w-5" />
                  Start Camera
                </button>
              )}
            </div>
            <div className="p-4 flex justify-center bg-gradient-to-r from-purple-50 to-blue-50">
              <button 
                onClick={handleCheckSign}
                className={`bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-2 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg hover:from-green-600 hover:to-emerald-600 flex items-center gap-2 ${
                  !cameraActive && 'opacity-50 cursor-not-allowed'
                }`}
                disabled={!cameraActive}
              >
                <CheckCircle className="h-5 w-5" />
                Check Sign
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Confetti Effect */}
      {confetti && (
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-full animate-confetti opacity-75">
              {Array.from({ length: 50 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-purple-500 rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animation: `fall ${Math.random() * 3 + 2}s linear infinite`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
      <div className="container mx-auto px-6 py-8">
        <div className="flex justify-end">
          <button
            onClick={handleNextLesson}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center gap-2"
          >
            Next Lesson: Letter C
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>

  );
};

export default LessonInterface;