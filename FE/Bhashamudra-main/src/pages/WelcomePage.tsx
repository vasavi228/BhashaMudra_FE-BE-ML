import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Mic } from 'lucide-react';

const WelcomePage = () => {
  const navigate = useNavigate();
  const [showCards, setShowCards] = useState(false);
  const userName = "User"; // Replace with actual user name from your auth system

  useEffect(() => {
    // Show cards after welcome animation
    const timer = setTimeout(() => {
      setShowCards(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handlePathSelect = (path) => {
    if (path === 'learning') {
      navigate('/onboarding');
    } else {
      navigate('/sign-language-translator');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#98E7DE] to-[#ffe8e1] flex flex-col items-center justify-center px-4">
      <div className="max-w-4xl w-full text-center">
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl font-bold text-[#004748] mb-4">
              Welcome to BhashaMudra!
            </h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-2xl text-gray-800 mb-12"
            >
              Ready to embark on your ISL journey?
            </motion.p>
          </motion.div>
        </AnimatePresence>

        <AnimatePresence>
          {showCards && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="grid md:grid-cols-2 gap-8"
            >
              {/* Learning Path Card */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg overflow-hidden cursor-pointer"
                onClick={() => handlePathSelect('learning')}
              >
                <div className="absolute inset-0 bg-[#FFC6C4] opacity-0 group-hover:opacity-30 transition-opacity"></div>
                <div className="p-8 flex flex-col items-center text-center relative z-10">
                  <div className="h-24 w-24 rounded-full bg-[#FFC6C4] flex items-center justify-center mb-6 group-hover:bg-[#FF928F] transition-colors">
                    <BookOpen className="h-12 w-12 text-[#8B0000] group-hover:text-[#650000] transition-colors" />
                  </div>
                  <h2 className="text-2xl font-bold text-[#8B0000] mb-4">
                    Learning Path
                  </h2>
                  <p className="text-[#650000]">
                    Start your structured journey to master ISL through interactive
                    lessons and exercises. Perfect for beginners! ✨
                  </p>
                </div>
              </motion.div>

              {/* Live Translation Card */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg overflow-hidden cursor-pointer"
                onClick={() => handlePathSelect('translation')}
              >
                <div className="p-8 flex flex-col items-center text-center relative z-10">
                  <div className="h-24 w-24 rounded-full bg-[#FFD699] flex items-center justify-center mb-6 group-hover:bg-[#E6A856] transition-colors">
                    <Mic className="h-12 w-12 text-[#6B3E00] group-hover:text-[#4A2A00] transition-colors" />
                  </div>
                  <h2 className="text-2xl font-bold text-[#6B3E00] mb-4">
                    Live Translation
                  </h2>
                  <p className="text-[#4A2A00]">
                    Convert text to ISL signs instantly with our real-time
                    translation feature. Try it now! 🎯
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default WelcomePage;
