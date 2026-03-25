import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Camera, CheckCircle, HelpCircle, RefreshCcw,
  Volume2, Loader, Star, ThumbsUp, ChevronRight,
  ChevronLeft, ArrowLeft, InfoIcon, XCircle
} from 'lucide-react';
import { markLessonComplete } from '../api/userApi';
import { getUser } from '../services/authService';

const ML_API = 'http://localhost:8000';

const LessonInterface = () => {
  const navigate = useNavigate();
  const { letter = 'A' } = useParams();
  const [cameraActive, setCameraActive] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showFailure, setShowFailure] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [detectionResult, setDetectionResult] = useState<{label: string, confidence: number} | null>(null);
  const [timer, setTimer] = useState(15);
  const [timerActive, setTimerActive] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const cameraRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef(null);

  const TOTAL_LETTERS = 26;
  const CURRENT_LETTER = letter.charCodeAt(0) - 64;
  const PROGRESS_PERCENTAGE = (CURRENT_LETTER / TOTAL_LETTERS) * 100;

  useEffect(() => {
    setIsVideoLoading(true);
    setVideoError(false);
    setIsPlaying(false);
    setIsAudioPlaying(false);
    setDetectionResult(null);
    setTimerActive(false);
    setTimer(15);
    stopCamera();

    if (videoRef.current) {
      videoRef.current.src = `/videos/assets/videos/${letter.toLowerCase()}.mkv`;
      videoRef.current.load();
    }
    if (audioRef.current) {
      audioRef.current.src = `/videos/assets/audio/${letter.toLowerCase()}.mp3`;
      audioRef.current.load();
    }
  }, [letter]);

  useEffect(() => {
    if (timerActive && timer > 0) {
      timerRef.current = setTimeout(() => setTimer(prev => prev - 1), 1000);
    } else if (timer === 0) {
      setTimerActive(false);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [timerActive, timer]);

  useEffect(() => {
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      setCameraActive(true);
      setTimer(15);
      setTimerActive(true);
      setTimeout(() => {
        if (cameraRef.current) {
          cameraRef.current.srcObject = stream;
          cameraRef.current.play();
        }
      }, 100);
    } catch (err) {
      alert('Camera access denied. Please allow camera access.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    setTimerActive(false);
    setTimer(15);
  };

  const captureFrame = (): string | null => {
  if (!cameraRef.current) return null;
  const canvas = document.createElement('canvas');
  canvas.width = cameraRef.current.videoWidth;
  canvas.height = cameraRef.current.videoHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.translate(canvas.width, 0);
  ctx.scale(-1, 1);
  // Draw WITHOUT flipping — matches Python script behavior
  ctx.drawImage(cameraRef.current, 0, 0);
  return canvas.toDataURL('image/jpeg', 0.8);
};

  const handleCheckSign = async () => {
    if (!cameraActive || isChecking) return;
    setIsChecking(true);
    setDetectionResult(null);

    try {
      const frame = captureFrame();
      if (!frame) throw new Error('Could not capture frame');

      const response = await fetch(`${ML_API}/api/detect/alphabet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: frame, expected: letter })
      });

      const result = await response.json();
      console.log('ML result:', result);

      if (!result.detected) {
        setShowFailure(true);
        setTimeout(() => setShowFailure(false), 2000);
        return;
      }

      setDetectionResult({ label: result.label, confidence: result.confidence });

      if (result.confidence >= 0.80 && result.label === letter) {
        setShowSuccess(true);
        setConfetti(true);
        setTimerActive(false);

        const user = await getUser();
        if (user) {
          await markLessonComplete(user.id, 'alphabet', letter);
        }

        setTimeout(() => {
          setShowSuccess(false);
          setConfetti(false);
        }, 3000);
      } else {
        setShowFailure(true);
        setTimeout(() => setShowFailure(false), 2000);
      }
    } catch (err) {
      console.error('Detection error:', err);
      alert('Could not connect to ML server. Make sure app.py is running.');
    } finally {
      setIsChecking(false);
    }
  };

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

  const handleNextLetter = () => {
    if (CURRENT_LETTER < 26) {
      navigate(`/learn/letter/${String.fromCharCode(letter.charCodeAt(0) + 1)}`);
    }
  };

  const handlePreviousLetter = () => {
    if (CURRENT_LETTER > 1) {
      navigate(`/learn/letter/${String.fromCharCode(letter.charCodeAt(0) - 1)}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#98E7DE] to-[#ffe8e1]">

      {/* Success Overlay */}
      {showSuccess && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm"
        >
          <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }}
            className="bg-white p-8 rounded-2xl shadow-2xl text-center"
          >
            <ThumbsUp className="h-16 w-16 text-[#004748] mx-auto mb-4" />
            <p className="text-2xl font-bold text-[#004748]">Excellent Work!</p>
            <p className="text-gray-500 mt-2">Letter {letter} completed! +10 XP</p>
          </motion.div>
        </motion.div>
      )}

      {/* Failure Overlay */}
      {showFailure && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm"
        >
          <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }}
            className="bg-white p-8 rounded-2xl shadow-2xl text-center"
          >
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <p className="text-2xl font-bold text-gray-800">Try Again!</p>
            {detectionResult && (
              <p className="text-gray-500 mt-2">
                Detected: {detectionResult.label} ({Math.round(detectionResult.confidence * 100)}%)
              </p>
            )}
          </motion.div>
        </motion.div>
      )}

      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button onClick={() => navigate('/learn/alphabets')}
              className="flex items-center gap-2 text-[#004748] hover:text-[#003738] transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Back to Overview</span>
            </button>
            <button className="text-[#004748] hover:text-[#003738] transition-colors">
              <HelpCircle className="h-6 w-6" />
            </button>
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
              <span className="text-[#004748] font-medium">Letter {CURRENT_LETTER} of {TOTAL_LETTERS}</span>
            </div>
          </div>
          <div className="w-full h-2 bg-[#98E7DE]/30 rounded-full overflow-hidden">
            <motion.div className="h-full bg-[#004748] rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${PROGRESS_PERCENTAGE}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>

        <motion.h2 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="text-6xl font-bold text-[#004748] mb-8 text-center"
        >
          Letter {letter}
        </motion.h2>

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
                <video ref={videoRef} className="w-full h-full object-cover"
                  autoPlay playsInline
                  onLoadedData={() => setIsVideoLoading(false)}
                  onPlay={() => setIsPlaying(true)}
                  onEnded={() => setIsPlaying(false)}
                  onError={() => { setVideoError(true); setIsVideoLoading(false); }}
                />
              )}
              <audio ref={audioRef} autoPlay onEnded={() => setIsAudioPlaying(false)} />
            </div>
            <div className="p-4 flex justify-center gap-4">
              <button onClick={handleReplay}
                className={`bg-[#004748] text-white px-6 py-2 rounded-lg flex items-center gap-2 ${isPlaying ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isPlaying}
              >
                <RefreshCcw className={`h-5 w-5 ${isPlaying ? 'animate-spin' : ''}`} />
                Replay
              </button>
              <button onClick={handleAudioToggle}
                className={`${isAudioPlaying ? 'bg-[#004748] text-white' : 'bg-[#98E7DE]/20 text-[#004748]'} px-6 py-2 rounded-lg flex items-center gap-2`}
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
            <div className="aspect-video bg-[#98E7DE]/10 flex items-center justify-center relative">
              {cameraActive ? (
                <div className="relative w-full h-full">
                  <video ref={cameraRef} autoPlay playsInline muted
                    className="w-full h-full object-cover"
                  />
                  {/* Timer badge */}
                  {timerActive && (
                    <div className="absolute top-4 right-4 bg-[#004748] text-white px-3 py-1 rounded-full font-semibold">
                      {timer}s
                    </div>
                  )}
                  {/* Detection result badge */}
                  {detectionResult && (
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      <div className="bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                        Detected: {detectionResult.label}
                      </div>
                      <div className="bg-black/60 text-white px-3 py-2 rounded-xl text-sm w-48">
                        <div className="flex justify-between mb-1">
                          <span>Confidence</span>
                          <span className={
                            detectionResult.confidence >= 0.80 ? 'text-green-400' :
                            detectionResult.confidence >= 0.60 ? 'text-yellow-400' : 'text-red-400'
                          }>
                            {Math.round(detectionResult.confidence * 100)}%
                          </span>
                        </div>
                        <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              detectionResult.confidence >= 0.80 ? 'bg-green-400' :
                              detectionResult.confidence >= 0.60 ? 'bg-yellow-400' : 'bg-red-400'
                            }`}
                            style={{ width: `${Math.round(detectionResult.confidence * 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  <button onClick={stopCamera}
                    className="absolute bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg"
                  >
                    Stop Camera
                  </button>
                </div>
              ) : (
                <button onClick={startCamera}
                  className="bg-[#004748] text-white px-6 py-3 rounded-lg flex items-center gap-2"
                >
                  <Camera className="h-5 w-5" />
                  Start Camera
                </button>
              )}
            </div>
            <div className="p-4 flex flex-col items-center">
              <button onClick={handleCheckSign}
                disabled={!cameraActive || isChecking}
                className={`px-8 py-2 rounded-lg flex items-center gap-2 text-white mb-4 transition-all
                  ${!cameraActive || isChecking ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'}`}
              >
                {isChecking
                  ? <><Loader className="h-5 w-5 animate-spin" /> Checking...</>
                  : <><CheckCircle className="h-5 w-5" /> Check Sign</>
                }
              </button>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="bg-[#98E7DE]/30 border border-[#004748]/20 rounded-lg p-4 w-full max-w-md"
              >
                <div className="flex items-start gap-3">
                  <InfoIcon className="h-5 w-5 text-[#004748] flex-shrink-0 mt-0.5" />
                  <p className="text-[#004748] text-sm leading-relaxed">
                    Click 'Start Camera' and perform the sign for letter <strong>{letter}</strong> within 15 seconds.
                    The system will automatically evaluate your sign.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center">
          <button onClick={handlePreviousLetter} disabled={CURRENT_LETTER <= 1}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-300
              ${CURRENT_LETTER > 1 ? 'bg-[#004748] text-white hover:bg-[#003738]' : 'bg-[#98E7DE]/20 text-[#004748]/50 cursor-not-allowed'}`}
          >
            <ChevronLeft className="h-5 w-5" /> Previous Letter
          </button>
          <button onClick={handleNextLetter} disabled={CURRENT_LETTER >= 26}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-300
              ${CURRENT_LETTER < 26 ? 'bg-[#004748] text-white hover:bg-[#003738]' : 'bg-[#98E7DE]/20 text-[#004748]/50 cursor-not-allowed'}`}
          >
            Next Letter <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </main>

      {/* Confetti */}
      {confetti && (
        <div className="fixed inset-0 pointer-events-none">
          {Array.from({ length: 50 }).map((_, i) => (
            <motion.div key={i}
              initial={{ opacity: 1, y: -20, x: Math.random() * window.innerWidth }}
              animate={{ opacity: 0, y: window.innerHeight + 20, x: Math.random() * window.innerWidth }}
              transition={{ duration: Math.random() * 2 + 1, ease: "linear" }}
              className="absolute w-2 h-2 rounded-full"
              style={{ background: i % 2 === 0 ? '#98E7DE' : '#004748' }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default LessonInterface;