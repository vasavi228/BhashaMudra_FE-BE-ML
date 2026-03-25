import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Camera,
  CheckCircle,
  HelpCircle,
  RefreshCcw,
  Volume2,
  Loader,
  Star,
  ThumbsUp,
  ChevronRight,
  ChevronLeft,
  ArrowLeft
} from 'lucide-react';

const WordInterface = () => {
  const navigate = useNavigate();
  const { word = 'afraid' } = useParams();
  const [cameraActive, setCameraActive] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // List of words for navigation
  const WORDS_LIST = [
    'afraid', 'agree', 'assistance', 'bad', 'become', 
    'college', 'doctor', 'warn', 'from', 'stand', 
    'pain', 'pray', 'work', 'today', 'secondary', 
    'specific', 'skin', 'which', 'small', 'you'
  ];

  // Constants for progress calculation
  const TOTAL_WORDS = WORDS_LIST.length;
  const CURRENT_WORD_INDEX = WORDS_LIST.indexOf(word);
  const PROGRESS_PERCENTAGE = ((CURRENT_WORD_INDEX + 1) / TOTAL_WORDS) * 100;

  useEffect(() => {
    // Reset states when word changes
    setIsVideoLoading(true);
    setVideoError(false);
    setIsPlaying(false);
    setIsAudioPlaying(false);
    setCameraActive(false);
    
    if (videoRef.current) {
      videoRef.current.src = `/videos/assets/videos/${word}.mkv`;
      videoRef.current.load();
    }
    if (audioRef.current) {
      audioRef.current.src = `/videos/assets/videos/audio/${word}.mp3`;
      audioRef.current.load();
    }
  }, [word]);

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
        audioRef.current.play().catch(console.error);
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

  const handleNextWord = () => {
    if (CURRENT_WORD_INDEX < TOTAL_WORDS - 1) {
      navigate(`/learn/word/${WORDS_LIST[CURRENT_WORD_INDEX + 1]}`);
    }
  };

  const handlePreviousWord = () => {
    if (CURRENT_WORD_INDEX > 0) {
      navigate(`/learn/word/${WORDS_LIST[CURRENT_WORD_INDEX - 1]}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#98E7DE] to-[#ffe8e1]">
      {/* Success Overlay */}
      {showSuccess && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm"
        >
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="bg-white p-8 rounded-2xl shadow-2xl"
          >
            <ThumbsUp className="h-16 w-16 text-[#004748] mx-auto mb-4" />
            <p className="text-2xl font-bold text-center text-[#004748]">Excellent Work!</p>
          </motion.div>
        </motion.div>
      )}

      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => navigate('/learn/words')}
              className="flex items-center gap-2 text-[#004748] hover:text-[#003738] transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Back to Overview</span>
            </button>
            <div className="flex items-center gap-4">
              <button className="text-[#004748] hover:text-[#003738] transition-colors">
                <HelpCircle className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-8">
        {/* Progress Bar */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-[#004748]">Learning Progress</h3>
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-[#004748] fill-current" />
              <span className="text-[#004748] font-medium">Word {CURRENT_WORD_INDEX + 1} of {TOTAL_WORDS}</span>
            </div>
          </div>
          <div className="w-full h-2 bg-[#98E7DE]/30 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-[#004748] rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${PROGRESS_PERCENTAGE}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Word Heading */}
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-6xl font-bold text-[#004748] mb-8 text-center capitalize"
        >
          {word}
        </motion.h2>

        {/* Main Content Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Video Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden">
            <div className="p-4 border-b border-[#98E7DE]/20">
              <h3 className="text-lg font-semibold text-[#004748]">Watch and Learn</h3>
            </div>
            <div className="aspect-video bg-[#98E7DE]/10 relative">
              {isVideoLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader className="h-8 w-8 text-[#004748] animate-spin" />
                </div>
              )}
              {videoError ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-red-500">Video not available</p>
                </div>
              ) : (
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  autoPlay
                  playsInline
                  onLoadedData={() => setIsVideoLoading(false)}
                  onPlay={() => setIsPlaying(true)}
                  onEnded={() => setIsPlaying(false)}
                  onError={() => {
                    setVideoError(true);
                    setIsVideoLoading(false);
                  }}
                />
              )}
              <audio
                ref={audioRef}
                autoPlay
                onEnded={() => setIsAudioPlaying(false)}
              />
            </div>
            <div className="p-4 flex justify-center gap-4">
              <button 
                onClick={handleReplay}
                className={`bg-[#004748] text-white px-6 py-2 rounded-lg transition-all duration-300 hover:bg-[#003738] flex items-center gap-2 ${
                  isPlaying ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={isPlaying}
              >
                <RefreshCcw className={`h-5 w-5 ${isPlaying ? 'animate-spin' : ''}`} />
                Replay
              </button>
              <button 
                onClick={handleAudioToggle}
                className={`${
                  isAudioPlaying 
                    ? 'bg-[#004748] text-white' 
                    : 'bg-[#98E7DE]/20 text-[#004748]'
                } px-6 py-2 rounded-lg transition-all duration-300 hover:bg-[#004748] hover:text-white flex items-center gap-2`}
              >
                <Volume2 className={`h-5 w-5 ${isAudioPlaying ? 'animate-pulse' : ''}`} />
                Audio
              </button>
            </div>
          </div>

          {/* Practice Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden">
            <div className="p-4 border-b border-[#98E7DE]/20">
              <h3 className="text-lg font-semibold text-[#004748]">Practice</h3>
            </div>
            <div className="aspect-video bg-[#98E7DE]/10 flex items-center justify-center">
              {cameraActive ? (
                <div className="relative w-full h-full">
                  <video
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  <button 
                    onClick={() => setCameraActive(false)}
                    className="absolute bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all"
                  >
                    Stop Camera
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setCameraActive(true)}
                  className="bg-[#004748] text-white px-6 py-3 rounded-lg transition-all duration-300 hover:bg-[#003738] flex items-center gap-2"
                >
                  <Camera className="h-5 w-5" />
                  Start Camera
                </button>
              )}
            </div>
            <div className="p-4 flex justify-center">
              <button 
                onClick={handleCheckSign}
                className={`bg-green-500 text-white px-8 py-2 rounded-lg transition-all duration-300 hover:bg-green-600 flex items-center gap-2 ${
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

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center">
          <button
            onClick={handlePreviousWord}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-300
              ${CURRENT_WORD_INDEX > 0
                ? 'bg-[#004748] text-white hover:bg-[#003738]'
                : 'bg-[#98E7DE]/20 text-[#004748]/50 cursor-not-allowed'
              }`}
            disabled={CURRENT_WORD_INDEX <= 0}
          >
            <ChevronLeft className="h-5 w-5" />
            Previous Word
          </button>
          
          <button
            onClick={handleNextWord}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-300
              ${CURRENT_WORD_INDEX < TOTAL_WORDS - 1
                ? 'bg-[#004748] text-white hover:bg-[#003738]'
                : 'bg-[#98E7DE]/20 text-[#004748]/50 cursor-not-allowed'
              }`}
            disabled={CURRENT_WORD_INDEX >= TOTAL_WORDS - 1}
          >
            Next Word
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </main>

      {/* Confetti Effect */}
      {confetti && (
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute inset-0 flex items-center justify-center">
            {Array.from({ length: 50 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  opacity: 1,
                  y: -20,
                  x: Math.random() * window.innerWidth
                }}
                animate={{
                  opacity: 0,
                  y: window.innerHeight + 20,
                  x: Math.random() * window.innerWidth
                }}
                transition={{
                  duration: Math.random() * 2 + 1,
                  ease: "linear"
                }}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  background: i % 2 === 0 ? '#98E7DE' : '#004748',
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WordInterface;