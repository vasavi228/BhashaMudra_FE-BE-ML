import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Brain, Clock } from 'lucide-react';

const questions = [
  {
    id: 1,
    question: "What brings you to BhashaMudra?",
    subtext: "This will help us tailor your learning journey",
    icon: <BookOpen className="w-8 h-8" />,
    options: [
      {
        text: "Connect with deaf community",
        description: "Learn signs for meaningful conversations",
        value: "community"
      },
      {
        text: "Personal growth",
        description: "Expand your language skills",
        value: "personal"
      },
      {
        text: "Professional development",
        description: "Add ISL to your skill set",
        value: "professional"
      },
      {
        text: "Help family/friends",
        description: "Bridge communication gaps",
        value: "family"
      }
    ]
  },
  {
    id: 2,
    question: "What's your ISL proficiency?",
    subtext: "We'll adjust the difficulty accordingly",
    icon: <Brain className="w-8 h-8" />,
    options: [
      {
        text: "Complete beginner",
        description: "Starting from scratch",
        value: "beginner"
      },
      {
        text: "Know basic signs",
        description: "Familiar with fundamentals",
        value: "basic"
      },
      {
        text: "Intermediate",
        description: "Can hold basic conversations",
        value: "intermediate"
      },
      {
        text: "Advanced",
        description: "Looking to perfect my skills",
        value: "advanced"
      }
    ]
  },
  {
    id: 3,
    question: "How much time can you dedicate daily?",
    subtext: "We'll set realistic goals for you",
    icon: <Clock className="w-8 h-8" />,
    options: [
      {
        text: "5-10 minutes",
        description: "Quick daily practice",
        value: "minimal"
      },
      {
        text: "15-30 minutes",
        description: "Regular learning sessions",
        value: "moderate"
      },
      {
        text: "1 hour",
        description: "Dedicated practice time",
        value: "dedicated"
      },
      {
        text: "More than 1 hour",
        description: "Intensive learning",
        value: "intensive"
      }
    ]
  }
];

const OnboardingPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const progress = ((currentStep + 1) / questions.length) * 100;

  const handleOptionSelect = (answer) => {
    const updatedAnswers = { ...answers, [questions[currentStep].id]: answer };
    setAnswers(updatedAnswers);
    
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      customizeDashboard(updatedAnswers);
      navigate('/dashboard');
    }
  };

  const customizeDashboard = (answers) => {
    const settings = {
      // Store original answers
      purpose: answers[1],
      proficiency: answers[2],
      timeCommitment: answers[3],
      
      // Adjust difficulty based on proficiency
      difficulty: answers[2] === 'beginner' ? 'easy' : 
                 (answers[2] === 'advanced' ? 'challenging' : 'normal'),
      
      // Set daily XP goals based on time commitment
      dailyGoal: {
        'minimal': 50,
        'moderate': 100,
        'dedicated': 200,
        'intensive': 300
      }[answers[3]],
      
      // Customize validation frequency based on proficiency and time commitment
      validationFrequency: answers[2] === 'beginner' || answers[3] === 'minimal' ? 
                          'periodic' : 'frequent',
      
      // Set initial unlocks based on proficiency
      initialUnlocks: answers[2] === 'beginner' ? 1 :
                     answers[2] === 'basic' ? 2 :
                     answers[2] === 'intermediate' ? 3 : 4,
                     
      // Additional features based on purpose
      features: {
        communityAccess: answers[1] === 'community',
        professionalCertification: answers[1] === 'professional',
        familyFocusedContent: answers[1] === 'family',
        personalizedVocabulary: answers[1] === 'personal'
      },
      
      // Special modes based on combinations
      specialModes: {
        intensiveBoot: answers[3] === 'intensive' && answers[2] === 'beginner',
        expertTrack: answers[2] === 'advanced' && answers[1] === 'professional',
        quickStart: answers[3] === 'minimal' && answers[2] === 'beginner',
        familyPack: answers[1] === 'family' && 
                   (answers[3] === 'minimal' || answers[3] === 'moderate')
      }
    };
    
    localStorage.setItem('dashboardSettings', JSON.stringify(settings));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#98E7DE] to-[#ffe8e1]">
      <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-screen">
        <motion.div 
          className="w-full max-w-3xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-[#004748] mb-3">
              Personalize Your Journey
            </h1>
            <p className="text-gray-600">
              Step {currentStep + 1} of {questions.length}
            </p>
            
            <div className="w-full h-2 bg-white/30 rounded-full mt-6 overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-[#004748] to-[#98E7DE]"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 rounded-xl bg-[#98E7DE]/20 text-[#004748]">
                  {questions[currentStep].icon}
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-[#004748]">
                    {questions[currentStep].question}
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {questions[currentStep].subtext}
                  </p>
                </div>
              </div>

              <div className="grid gap-4">
                {questions[currentStep].options.map((option, index) => (
                  <motion.button
                    key={index}
                    className={`w-full text-left p-6 rounded-xl border-2 
                      ${answers[questions[currentStep].id] === option.value 
                        ? 'border-[#004748] bg-[#98E7DE]/10' 
                        : 'border-transparent bg-white hover:border-[#98E7DE] hover:bg-[#98E7DE]/5'} 
                      transition-all duration-200`}
                    onClick={() => handleOptionSelect(option.value)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex flex-col">
                      <span className="text-lg font-medium text-[#004748]">
                        {option.text}
                      </span>
                      <span className="text-sm text-gray-500 mt-1">
                        {option.description}
                      </span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-between mt-8">
            <motion.button
              className={`px-6 py-3 rounded-xl text-[#004748] font-medium
                ${currentStep > 0 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
              onClick={() => setCurrentStep(currentStep - 1)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Back
            </motion.button>
            <motion.button
              className={`px-6 py-3 rounded-xl bg-[#004748] text-white font-medium
                ${currentStep === questions.length - 1 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
              onClick={() => setCurrentStep(currentStep + 1)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Skip
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OnboardingPage;