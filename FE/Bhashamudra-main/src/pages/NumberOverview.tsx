import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, BookOpen, GraduationCap } from 'lucide-react';

const NumberOverview = () => {
  const navigate = useNavigate();
  
  // Progress tracking (mock data - replace with actual progress)
  const totalNumbers = 9;
  const completedNumbers = 1;
  const progressPercentage = (completedNumbers / totalNumbers) * 100;
  
  const numbers = Array.from({ length: 9 }, (_, i) => ({
    number: i + 1,
    isCompleted: i < completedNumbers,
  }));

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03
      }
    }
  };

  const itemVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#98E7DE] to-[#ffe8e1]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <nav className="flex items-center justify-between mb-12">
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-[#004748] hover:text-[#003738] transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span>Back</span>
          </button>
          
          <div className="flex items-center gap-6">
            <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all">
              <BookOpen className="w-5 h-5 text-[#004748]" />
              <span className="text-[#004748]">Study Guide</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#004748] text-white shadow-sm hover:shadow-md transition-all">
              <GraduationCap className="w-5 h-5" />
              <span>Practice Quiz</span>
            </button>
          </div>
        </nav>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#004748] mb-4">
            ISL Numbers Journey
          </h1>
          
          {/* Progress Bar */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="flex justify-between text-sm text-[#004748] mb-2">
              <span>Progress</span>
              <span>{Math.round(progressPercentage)}% Complete</span>
            </div>
            <div className="h-2 bg-white/50 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-[#004748] rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
            <div className="text-sm text-[#004748]/70 mt-2">
              {completedNumbers} of {totalNumbers} numbers mastered
            </div>
          </div>
        </div>

        {/* Main Grid Layout */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 max-w-4xl mx-auto"
        >
          {numbers.map(({ number, isCompleted }) => (
            <motion.div
              key={number}
              variants={itemVariants}
              whileHover={{ 
                scale: 1.05,
                transition: { type: "spring", stiffness: 400, damping: 10 }
              }}
              className="relative aspect-square"
            >
              <button
                onClick={() => navigate(`/learn/number/${number}`)}
                className={`w-full h-full rounded-xl bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all overflow-hidden group
                  ${isCompleted ? 'border-2 border-[#004748]/20' : ''}`}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-4xl font-medium transition-transform
                    ${isCompleted ? 'text-[#004748]' : 'text-[#004748]/60'}`}>
                    {number}
                  </span>
                </div>
                
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-[#004748]/10 backdrop-blur-sm">
                  <motion.div 
                    className="flex flex-col items-center gap-2"
                    initial={{ y: 10 }}
                    animate={{ y: 0 }}
                  >
                    <div className="p-2.5 bg-[#004748] rounded-lg shadow-lg">
                      <Play className="w-4 h-4 text-white" fill="white" />
                    </div>
                  </motion.div>
                </div>
              </button>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default NumberOverview;