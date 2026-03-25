import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Mic, Play, Pause, ArrowLeft, Type, Youtube } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Define available words in the dataset
const AVAILABLE_WORDS = new Set([
  'hello',
  'hi',
  'me',
  'you',
  'afraid',
  'agree',
  'assistance',
  'bad',
  'become',
  'college',
  'doctor',
  'warn',
  'from',
  'stand',
  'pain',
  'pray',
  'work',
  'today',
  'secondary',
  'specific',
  'skin',
  'which',
  'small',
  // Add more words that are available in your dataset
]);

// Mock function to extract YouTube ID from URL
const extractYouTubeID = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

// Mock transcripts for demo purposes
const MOCK_TRANSCRIPTS: Record<string, string> = {
  // Add a few sample YouTube IDs and their transcripts
  'dQw4w9WgXcQ': 'hello today I want to talk about specific college assistance',
  'jNQXAC9IVRw': 'hi me and you can learn to become doctors with specific assistance',
  '-rGetleD-DI': 'okay plant tissues they are of two types meristematic tissues and permanent tissues now meristematic tissue the tireless Fearless ever growing most active tissue found in the regions where the plants actively grow they are made up of Bunches of small densely packed thin wall cells that keep on and on and on dividing to produce new cells and so they have one a huge nucleus and two they lack one major organel that is found only in Plants the central vacuum and why do they lack that the main function as you know is the storage',
  'default': 'hello specific college doctor assistance which today pray work',
};

type TranslationUnit = {
  type: 'word' | 'letter';
  value: string;
  originalWord?: string; // Reference to original word for letter units
  wordIndex?: number;    // Index of the word in the original text
};

const SignLanguageTranslator = () => {
  const [inputText, setInputText] = useState('');
  const [youtubeURL, setYoutubeURL] = useState('');
  const [youtubeID, setYoutubeID] = useState<string | null>(null);
  const [translationUnits, setTranslationUnits] = useState<TranslationUnit[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptProgress, setTranscriptProgress] = useState(0);
  const [inputMode, setInputMode] = useState<'text' | 'youtube'>('text');
  const [fullTranscript, setFullTranscript] = useState('');
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [currentWordText, setCurrentWordText] = useState('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const youtubePlayerRef = useRef<HTMLIFrameElement>(null);
  const navigate = useNavigate();
  
  // Speech recognition setup
  const startSpeechRecognition = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.lang = 'en-IN';
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
      };
      
      recognition.start();
    } else {
      alert('Speech recognition is not supported in this browser.');
    }
  };

  // Process text into words and letters
  const processText = (text: string, mode: 'text' | 'youtube') => {
    const words = text.toLowerCase().split(/\s+/);
    const units: TranslationUnit[] = [];
    let currentWordIndex = 0;

    words.forEach(originalWord => {
      // Remove any non-alphabetical characters
      const cleanWord = originalWord.replace(/[^a-z]/g, '');
      
      if (cleanWord && AVAILABLE_WORDS.has(cleanWord)) {
        // If word exists in dataset, add it as a word unit
        units.push({ 
          type: 'word', 
          value: cleanWord,
          originalWord: originalWord,
          wordIndex: currentWordIndex
        });
      } else if (cleanWord) {
        // If word doesn't exist, break it into letters (for both modes)
        const letters = cleanWord.split('').filter(char => /[a-z]/.test(char));
        letters.forEach(letter => {
          units.push({ 
            type: 'letter', 
            value: letter,
            originalWord: originalWord,
            wordIndex: currentWordIndex
          });
        });
      }
      
      currentWordIndex++;
    });

    return units;
  };

  // Handle text translation form submission
  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    
    setInputMode('text');
    const units = processText(inputText, 'text');
    setTranslationUnits(units);
    setCurrentIndex(0);
    setIsPlaying(true);
    setFullTranscript(inputText);
    
    // Clear YouTube URL if we're using text input
    setYoutubeURL('');
    setYoutubeID(null);
  };
  
  // Handle YouTube URL form submission
  const handleYouTubeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!youtubeURL.trim()) return;
    
    const id = extractYouTubeID(youtubeURL);
    if (!id) {
      alert('Invalid YouTube URL');
      return;
    }
    
    setYoutubeID(id);
    setInputMode('youtube');
    
    // Clear text input if we're using YouTube
    setInputText('');
    
    // Simulate transcript extraction with progress
    setIsTranscribing(true);
    setTranscriptProgress(0);
    
    // Simulate progress
    for (let i = 1; i <= 10; i++) {
      await new Promise(resolve => setTimeout(resolve, 300));
      setTranscriptProgress(i * 10);
    }
    
    // Get mock transcript or use default
    const transcript = MOCK_TRANSCRIPTS[id] || MOCK_TRANSCRIPTS.default;
    setFullTranscript(transcript);
    
    // Process the transcript - include ALL words, using letter-by-letter for words not in dataset
    const units = processText(transcript, 'youtube');
    
    setTranslationUnits(units);
    setCurrentIndex(0);
    setIsTranscribing(false);
    setIsPlaying(true);
  };

  // Video playback control
  useEffect(() => {
    const playVideo = async () => {
      if (videoRef.current) {
        try {
          if (isPlaying) {
            await videoRef.current.play();
          } else {
            videoRef.current.pause();
          }
        } catch (error) {
          console.error('Error playing video:', error);
        }
      }
    };

    playVideo();
  }, [isPlaying]);

  // Handle video ended event
  const handleVideoEnd = () => {
    if (currentIndex < translationUnits.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsPlaying(false);
      setCurrentIndex(0);
    }
  };

  // Update current word information when index changes
  useEffect(() => {
    if (translationUnits.length > 0 && currentIndex < translationUnits.length) {
      const current = translationUnits[currentIndex];
      setCurrentWordIndex(current.wordIndex || -1);
      
      // Set the display text based on whether it's a word or letter
      if (current.type === 'word') {
        setCurrentWordText(current.value.toUpperCase());
      } else {
        setCurrentWordText(`${current.originalWord} (${current.value.toUpperCase()})`);
      }
    }
  }, [currentIndex, translationUnits]);

  // Update video source when current unit changes
  useEffect(() => {
    if (translationUnits.length > 0 && videoRef.current && currentIndex < translationUnits.length) {
      const currentUnit = translationUnits[currentIndex];
      const videoPath = `/videos/assets/videos/${currentUnit.value}.mkv`;
      
      videoRef.current.src = videoPath;
      
      if (isPlaying) {
        const playVideo = async () => {
          try {
            await videoRef.current?.play();
          } catch (error) {
            console.error('Error playing video:', error);
            setIsPlaying(false);
          }
        };
        playVideo();
      }
    }
  }, [currentIndex, translationUnits, isPlaying]);

  // Toggle between text and YouTube input modes
  const toggleInputMode = (mode: 'text' | 'youtube') => {
    setInputMode(mode);
    // Reset state
    setTranslationUnits([]);
    setCurrentIndex(0);
    setIsPlaying(false);
    setFullTranscript('');
    
    if (mode === 'text') {
      setYoutubeURL('');
      setYoutubeID(null);
    } else {
      setInputText('');
    }
  };

  // Render the transcript with highlighting
  const renderTranscript = () => {
    if (!fullTranscript) return null;
    
    const words = fullTranscript.split(/\s+/);
    
    return words.map((word, index) => {
      const isHighlighted = index === currentWordIndex;
      return (
        <span 
          key={index}
          className={`${isHighlighted ? 'bg-[#FFC6C4] text-[#8B0000] px-1 rounded' : ''}`}
        >
          {word}{' '}
        </span>
      );
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#98E7DE] to-[#ffe8e1]">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="container mx-auto px-4 py-8"
      >
        {/* Back Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/selection')}
          className="mb-8 flex items-center gap-2 text-[#004748] hover:text-[#003334] transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Selection</span>
        </motion.button>

        {/* Mode Toggle Buttons */}
        <div className="mb-6 flex justify-center">
          <div className="bg-white/80 backdrop-blur-lg rounded-full p-1 inline-flex">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => toggleInputMode('text')}
              className={`px-6 py-3 rounded-full flex items-center gap-2 transition-colors ${
                inputMode === 'text' 
                  ? 'bg-[#004748] text-white' 
                  : 'bg-transparent text-[#004748] hover:bg-gray-100'
              }`}
            >
              <Type className="h-5 w-5" />
              <span>Text/Audio to ISL</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => toggleInputMode('youtube')}
              className={`px-6 py-3 rounded-full flex items-center gap-2 transition-colors ${
                inputMode === 'youtube' 
                  ? 'bg-[#004748] text-white' 
                  : 'bg-transparent text-[#004748] hover:bg-gray-100'
              }`}
            >
              <Youtube className="h-5 w-5" />
              <span>YouTube to ISL</span>
            </motion.button>
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Section - Input */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-8"
          >
            {/* Text Input Mode */}
            {inputMode === 'text' && (
              <>
                <h2 className="text-3xl font-bold text-[#004748] mb-6">Text or Audio to ISL</h2>
                <form onSubmit={handleTextSubmit} className="mb-6">
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Enter text to translate..."
                      className="flex-1 p-3 border border-[#98E7DE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004748]"
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={startSpeechRecognition}
                      className="p-3 bg-[#FFC6C4] rounded-lg hover:bg-[#FF928F] transition-colors"
                    >
                      <Mic className="h-6 w-6 text-[#8B0000]" />
                    </motion.button>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    className="w-full py-3 bg-[#004748] text-white rounded-lg hover:bg-[#003334] transition-colors"
                    disabled={!inputText}
                  >
                    Translate Text
                  </motion.button>
                </form>

                {/* Display Translation Units for Text Mode */}
                {translationUnits.length > 0 && inputMode === 'text' && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-[#004748] mb-3">Translation Progress</h3>
                    <div className="flex flex-wrap gap-2">
                      {translationUnits.map((unit, index) => (
                        <motion.div
                          key={index}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className={`${
                            unit.type === 'word' ? 'px-4' : 'w-10'
                          } h-10 flex items-center justify-center rounded-lg ${
                            index === currentIndex
                              ? 'bg-[#FFC6C4] text-[#8B0000]'
                              : index < currentIndex
                              ? 'bg-[#98E7DE] text-[#004748]'
                              : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          {unit.value.toUpperCase()}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* YouTube Input Mode */}
            {inputMode === 'youtube' && (
              <>
                <h2 className="text-3xl font-bold text-[#004748] mb-6">YouTube to ISL</h2>
                <form onSubmit={handleYouTubeSubmit} className="mb-6">
                  <div className="space-y-3">
                    <input
                      id="youtube-input"
                      type="text"
                      value={youtubeURL}
                      onChange={(e) => setYoutubeURL(e.target.value)}
                      placeholder="Paste YouTube URL here..."
                      className="w-full p-3 border border-[#98E7DE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004748]"
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      className="w-full py-3 bg-[#FFC6C4] text-[#8B0000] rounded-lg hover:bg-[#FF928F] transition-colors font-medium"
                      disabled={!youtubeURL || isTranscribing}
                    >
                      {isTranscribing ? 'Processing...' : 'Translate YouTube Video'}
                    </motion.button>
                  </div>
                </form>
                
                {/* Transcription Progress */}
                {isTranscribing && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm text-[#004748]">Extracting transcript... {transcriptProgress}%</p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-[#004748] h-2 rounded-full" 
                        style={{ width: `${transcriptProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                
                {/* YouTube Player (if YouTube ID exists) */}
                {youtubeID && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-[#004748] mb-3">YouTube Video</h3>
                    <div className="w-full aspect-video rounded-lg overflow-hidden bg-black">
                      <iframe
                        ref={youtubePlayerRef}
                        width="100%"
                        height="100%"
                        src={`https://www.youtube.com/embed/${youtubeID}?autoplay=0`}
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  </div>
                )}
              </>
            )}
          </motion.div>

          {/* Right Section - Sign Language Video */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-8"
          >
            <h2 className="text-3xl font-bold text-[#004748] mb-6">Sign Language Animation</h2>
            <div className="flex flex-col items-center gap-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsPlaying(!isPlaying)}
                disabled={translationUnits.length === 0}
                className={`px-6 py-3 rounded-lg flex items-center gap-2 ${
                  translationUnits.length === 0
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-[#004748] text-white hover:bg-[#003334]'
                }`}
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                {isPlaying ? 'Pause' : 'Play'}
              </motion.button>

              <div className="w-full aspect-video bg-black/5 rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  className="w-full h-full object-contain"
                  onEnded={handleVideoEnd}
                >
                  Your browser does not support HTML5 video.
                </video>
              </div>
              
              {/* Current sign indicator */}
              <div className="w-full text-center text-lg">
                {currentIndex < translationUnits.length && (
                  <p className="font-semibold text-[#004748]">
                    Showing sign language for: {currentWordText}
                  </p>
                )}
              </div>
              
              {/* Transcript display (always shown below the sign language video) */}
              {fullTranscript && (
                <div className="w-full mt-4">
                  <h3 className="text-lg font-semibold text-[#004748] mb-2">Transcript</h3>
                  <div className="p-4 bg-gray-50 rounded-lg max-h-48 overflow-y-auto text-gray-800">
                    {renderTranscript()}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default SignLanguageTranslator;