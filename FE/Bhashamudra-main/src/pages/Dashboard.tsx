import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Flame,
  Target,
  Award,
  Sparkles,
  Zap,
  Calendar,
  Brain,
  Lightbulb,
  Medal,
  Crown,
  Rocket,
  BookOpen,
  MessageSquare,
  Star,
  Clock,
  X,
  Lock,
  Sparkle,
  Diamond,
  Gift,
  AlertCircle
} from 'lucide-react';

function Dashboard() {
  const navigate = useNavigate();
  const [showStreakCalendar, setShowStreakCalendar] = useState(false);
  const [showQuestModal, setShowQuestModal] = useState(false);
  const [selectedQuest, setSelectedQuest] = useState(null);
  const [dashboardSettings, setDashboardSettings] = useState(null);
  const [timer, setTimer] = useState(300); // 5 minutes in seconds
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showPremiumTooltip, setShowPremiumTooltip] = useState(false);
  
  useEffect(() => {
    const settings = JSON.parse(localStorage.getItem('dashboardSettings') || '{}');
    setDashboardSettings(settings);
  }, []);

  useEffect(() => {
    let interval;
    if (isTimerRunning && timer > 0) {
      interval = setInterval(() => {
        setTimer(prevTime => prevTime - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timer]);

  useEffect(() => {
    let tooltipTimeout;
    if (showPremiumTooltip) {
      tooltipTimeout = setTimeout(() => {
        setShowPremiumTooltip(false);
      }, 3000);
    }
    return () => clearTimeout(tooltipTimeout);
  }, [showPremiumTooltip]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const userStats = {
    xp: 10,
    level: 1,
    progress: 1,
    streak: 1,
    dailyGoal: dashboardSettings?.dailyGoal || 100,
    todayXP: 10
  };

  const dailyQuests = [
    {
      id: 1,
      title: "Perfect A",
      description: "Sign 'A' with 100% accuracy on first try",
      reward: 100,
      progress: 0,
      total: 1,
      icon: <Brain className="w-5 h-5" />,
      modalContent: {
        type: "practice",
        instructions: "Sign the letter 'A' correctly on your first try to complete this quest.",
        action: "Go to Practice",
        path: "/learn/letter/A"
      }
    },
    {
      id: 2,
      title: "Quick Learner",
      description: "Complete 3 lessons in under 5 minutes",
      reward: 150,
      progress: 1,
      total: 3,
      icon: <Rocket className="w-5 h-5" />,
      modalContent: {
        type: "timed",
        instructions: "Complete any 3 quick lessons before the timer runs out.",
        lessonsAvailable: [
          { id: 1, title: "Learn A", path: "/learn/letter/A", duration: "1-2 min" },
          { id: 2, title: "Learn B", path: "/learn/letter/B", duration: "1-2 min" },
          { id: 3, title: "Learn C", path: "/learn/letter/C", duration: "1-2 min" },
          { id: 4, title: "Learn 1", path: "/learn/number/1", duration: "1 min" },
          { id: 5, title: "Learn 2", path: "/learn/number/2", duration: "1 min" }
        ]
      }
    }
  ];

  const funFact = {
    title: "Did you know?",
    content: "The first Deaflympics was held in Paris in 1924, making it the second oldest multi-sport event after the Olympics!",
    image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=800"
  };

  const premiumFeatures = [
    {
      title: "Interactive Stories",
      description: "Learn sign language through engaging narrative adventures",
      icon: <BookOpen className="w-5 h-5 text-white" />
    },
    {
      title: "Advanced Vocabulary",
      description: "Unlock 100+ additional signs and phrases",
      icon: <MessageSquare className="w-5 h-5 text-white" />
    }
    // {
    //   title: "Personalized Feedback",
    //   description: "Get detailed analysis on your signing technique",
    //   icon: <Award className="w-5 h-5 text-white" />
    // },
    // {
    //   title: "Practice with AI",
    //   description: "Realistic signing conversations with adaptive AI",
    //   icon: <Brain className="w-5 h-5 text-white" />
    // }
  ];

  const lessons = [
    {
      id: 1,
      title: "A to Z",
      description: "Learn the ISL gestures for the 26 alphabets",
      icon: <BookOpen className="w-6 h-6" />,
      status: "current",
      progress: 30,
      totalSigns: 26,
      completedSigns: 1,
      path: "/learn/alphabets"
    },
    {
      id: 2,
      title: "1 to 9",
      description: "Master numbers in ISL",
      icon: <Star className="w-6 h-6" />,
      status: "current",
      progress: 0,
      totalSigns: 9,
      completedSigns: 0,
      path: "/learn/numbers"
    },
    {
      id: 3,
      title: "Interactive Story",
      description: "Learn through an engaging narrative quiz",
      icon: <BookOpen className="w-6 h-6" />,
      status: "premium",
      progress: 0,
      totalSigns: 10,
      completedSigns: 0,
      path: null,
      isPremium: true
    },
    {
      id: 4,
      title: "Basic Words",
      description: "Common everyday expressions in ISL",
      icon: <MessageSquare className="w-6 h-6" />,
      status: "premium",
      progress: 0,
      totalSigns: 15,
      completedSigns: 0,
      path: null,
      isPremium: true
    }
  ];

  // Add purpose-specific lessons
  useEffect(() => {
    if (dashboardSettings?.purpose === 'professional') {
      lessons.push({
        id: 5,
        title: "Professional Terms",
        description: "Business and workplace signs",
        icon: <Rocket className="w-6 h-6" />,
        status: "locked",
        progress: 0,
        totalSigns: 20,
        completedSigns: 0,
        path: null
      });
    } else if (dashboardSettings?.purpose === 'community') {
      lessons.push({
        id: 5,
        title: "Community Phrases",
        description: "Social interaction signs",
        icon: <Rocket className="w-6 h-6" />,
        status: "locked",
        progress: 0,
        totalSigns: 20,
        completedSigns: 0,
        path: null
      });
    }
  }, [dashboardSettings]);
  
  const handleQuestClick = (quest) => {
    setSelectedQuest(quest);
    setShowQuestModal(true);
    if (quest.id === 2) { // Reset timer for Quick Learner quest
      setTimer(300);
    }
  };

  const handleMonthlyPlanClick = () => {
    setShowPremiumModal(false);
    navigate('/premium/checkout', { state: { plan: 'monthly', price: '₹349/month' } });
  };
  
  const handleAnnualPlanClick = () => {
    setShowPremiumModal(false);
    navigate('/premium/checkout', { state: { plan: 'annual', price: '₹2,999/year' } });
  };

  const startQuickLearnerChallenge = () => {
    setIsTimerRunning(true);
  };

  const handlePremiumButtonClick = () => {
    setShowPremiumModal(true);
  };

  const handlePremiumItemClick = () => {
    setShowPremiumTooltip(true);
    setTimeout(() => {
      setShowPremiumModal(true);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#98E7DE] to-[#ffe8e1]">
      {/* Top Navigation */}
      <div className="bg-white/80 backdrop-blur-sm shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-2xl font-bold text-[#004748]">
                BhashaMudra
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-[#004748]/10 px-4 py-2 rounded-full">
                <Trophy className="h-5 w-5 text-[#004748]" />
                <span className="font-semibold text-[#004748]">{userStats.xp} XP</span>
              </div>
              
              <motion.button
                className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-5 py-2 rounded-full font-medium shadow-lg flex items-center gap-2 relative overflow-hidden"
                onClick={handlePremiumButtonClick}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Diamond className="h-5 w-5" />
                <span>Upgrade to Premium</span>
                <motion.div 
                  className="absolute inset-0 bg-white"
                  initial={{ x: "-100%", opacity: 0.3 }}
                  animate={{ x: "100%", opacity: 0 }}
                  transition={{ 
                    repeat: Infinity,
                    duration: 1.5,
                    ease: "easeInOut"
                  }}
                />
              </motion.button>
              
              <button 
                className="bg-[#004748] text-white px-6 py-2 rounded-full font-medium hover:bg-[#004748]/90 transition-colors"
                onClick={() => navigate('/selection')}
              >
                Change Mode
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Column */}
          <div className="col-span-3 space-y-6">
            {/* Streak Card */}
            <motion.div 
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg cursor-pointer"
              whileHover={{ scale: 1.02 }}
              onClick={() => setShowStreakCalendar(true)}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-orange-100 p-3 rounded-xl">
                  <Flame className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Streak</h3>
                  <p className="text-3xl font-bold text-orange-600">{userStats.streak} days</p>
                </div>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-orange-500 rounded-full"
                  style={{ width: `${(userStats.todayXP / userStats.dailyGoal) * 100}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {userStats.todayXP}/{userStats.dailyGoal} XP today
              </p>
            </motion.div>

            {/* Daily Quests */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <Target className="h-6 w-6 text-[#004748]" />
                <h3 className="text-lg font-semibold text-gray-800">Daily Quests</h3>
              </div>
              <div className="space-y-4">
                {dailyQuests.map(quest => (
                  <motion.div 
                    key={quest.id} 
                    className="bg-[#004748]/5 rounded-xl p-4 cursor-pointer"
                    whileHover={{ scale: 1.02 }}
                    onClick={() => handleQuestClick(quest)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="bg-[#004748]/10 p-2 rounded-lg">
                        {quest.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800">{quest.title}</h4>
                        <p className="text-sm text-gray-600 mb-2">{quest.description}</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-[#004748] rounded-full"
                              style={{ width: `${(quest.progress / quest.total) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-600">
                            {quest.progress}/{quest.total}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Fun Fact Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg">
              <img 
                src={funFact.image} 
                alt="Fun fact illustration" 
                className="w-full h-32 object-cover"
              />
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                  <h3 className="font-semibold text-gray-800">{funFact.title}</h3>
                </div>
                <p className="text-sm text-gray-600">{funFact.content}</p>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="col-span-9">
            {/* Level Progress */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="bg-purple-100 p-3 rounded-xl">
                    <Crown className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Level {userStats.level}</h3>
                    <p className="text-sm text-gray-600">
                      {dashboardSettings?.proficiency === 'beginner' ? 'Novice Signer' :
                       dashboardSettings?.proficiency === 'intermediate' ? 'Skilled Communicator' :
                       dashboardSettings?.proficiency === 'advanced' ? 'Master Signer' : 'Learning ISL'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Medal className="h-5 w-5 text-yellow-500" />
                  <span className="text-sm font-medium text-gray-600">Next reward at Level {userStats.level + 1}</span>
                </div>
              </div>
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                  style={{ width: `${userStats.progress}%` }}
                />
              </div>
            </div>

            {/* Learning Path */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
              <div className="relative">
                {/* Connecting Lines */}
                <div className="absolute left-[47px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#004748] to-[#98E7DE]/30" />
                
                {/* Lesson Cards */}
                <div className="space-y-8">
                  {lessons.map((lesson, index) => (
                    <motion.div
                      key={lesson.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.2 }}
                      className="relative"
                    >
                      {/* Connection Dot */}
                      <div className="absolute left-[43px] top-[30px] w-[13px] h-[13px] rounded-full bg-[#004748]" />
                      
                      <motion.div
                        whileHover={{ scale: lesson.status !== 'premium' ? 1.02 : 1 }}
                        className={`
                          ml-16 bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg
                          ${lesson.status === 'premium' ? 'border-2 border-amber-500/50' : 'border-2 border-transparent'}
                          ${lesson.status === 'current' && lesson.title !== '1 to 9' ? 'border-2 border-[#004748]' : ''}
                          ${lesson.status !== 'premium' ? 'cursor-pointer hover:border-[#98E7DE]' : ''}
                          transition-all duration-200 relative
                        `}
                        onClick={() => {
                          if (lesson.status === 'premium') {
                            handlePremiumItemClick();
                          } else if (lesson.status !== 'locked' && lesson.path) {
                            navigate(lesson.path);
                          }
                        }}
                      >
                        {lesson.status === 'premium' && (
                          <div className="absolute right-4 top-4 z-10">
                            <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-2 rounded-lg shadow-lg">
                              <Lock className="h-5 w-5 text-white" />
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-6">
                          <div className={`
                            p-4 rounded-xl shadow-lg
                            ${lesson.status === 'current' ? 'bg-gradient-to-br from-[#004748] to-[#98E7DE]' : 
                              lesson.status === 'premium' ? 'bg-gradient-to-r from-amber-500 to-amber-600' : 'bg-gray-100'}
                          `}>
                            <div className={lesson.status === 'locked' ? 'text-gray-500' : 'text-white'}>
                              {lesson.icon}
                            </div>
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="text-xl font-bold text-gray-800">{lesson.title}</h3>
                              {lesson.status === 'current' && (
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                >
                                  <div className="bg-gradient-to-br from-[#004748] to-[#98E7DE] rounded-full p-2">
                                    <Sparkles className="h-5 w-5 text-white" />
                                  </div>
                                </motion.div>
                              )}
                              {lesson.status === 'locked' && !lesson.isPremium && (
                                <Zap className="h-5 w-5 text-gray-400" />
                              )}
                              {lesson.status === 'premium' && (
                                <span className="text-sm font-semibold text-amber-600 bg-amber-100 px-4 py-1 rounded-full mr-8">
                                  Premium
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{lesson.description}</p>
                            
                            {lesson.status === 'premium' && lesson.id === 3 && (
                              <button
                                className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium mb-3 hover:shadow-md transition-shadow flex items-center gap-2"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePremiumItemClick();
                                }}
                              >
                                <span>Take Story Quiz</span>
                                <Lock className="h-4 w-4" />
                              </button>
                            )}
                            
                            <div className="flex items-center gap-3">
                              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${lesson.status === 'premium' ? 'bg-amber-500' : 'bg-[#004748]'}`}
                                  style={{ width: `${(lesson.completedSigns / lesson.totalSigns) * 100}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium text-gray-600">
                                {lesson.completedSigns}/{lesson.totalSigns}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Premium Feature Lock Tooltip */}
      <AnimatePresence>
        {showPremiumTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-[#004748] text-white px-6 py-3 rounded-lg shadow-xl z-50 flex items-center gap-3"
          >
            <AlertCircle className="h-5 w-5" />
            <p className="font-medium">This feature requires a premium subscription</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Streak Calendar Modal */}
      <AnimatePresence>
        {showStreakCalendar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setShowStreakCalendar(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 shadow-xl max-w-lg w-full mx-4"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Calendar className="h-6 w-6 text-[#004748]" />
                  <h3 className="text-xl font-semibold text-gray-800">Your Streak Calendar</h3>
                </div>
                <button
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => setShowStreakCalendar(false)}
                >
                  ✕
                </button>
              </div>
              <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 30 }).map((_, i) => (
                <div
                  key={i}
                  className={`aspect-square rounded-lg flex items-center justify-center text-sm
                    ${i < userStats.streak ? 'bg-[#004748] text-white' : 'bg-gray-100 text-gray-400'}`}
                >
                  {i + 1}
                </div>
              ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quest Modal */}
      <AnimatePresence>
        {showQuestModal && selectedQuest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setShowQuestModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 shadow-xl max-w-lg w-full mx-4"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  {selectedQuest.icon}
                  <h3 className="text-xl font-semibold text-gray-800">{selectedQuest.title}</h3>
                </div>
                <button
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => setShowQuestModal(false)}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <Award className="h-5 w-5 text-yellow-500" />
                  <span className="text-sm font-medium text-gray-700">Reward: {selectedQuest.reward} XP</span>
                </div>
                <p className="text-gray-700 mb-4">{selectedQuest.modalContent.instructions}</p>
                
                {/* Quest specific content */}
                {selectedQuest.id === 2 && (
                  <div className="bg-[#004748]/5 rounded-xl p-4 mb-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-[#004748]" />
                        <span className="font-medium">Time Remaining:</span>
                      </div>
                      <div className="text-2xl font-bold text-[#004748]">
                        {formatTime(timer)}
                      </div>
                    </div>
                    
                    {!isTimerRunning && timer === 300 && (
                      <button
                        className="w-full bg-[#004748] text-white py-2 rounded-lg font-medium hover:bg-[#004748]/90 transition-colors mb-4"
                        onClick={startQuickLearnerChallenge}
                      >
                        Start Challenge
                      </button>
                    )}
                    
                    {(isTimerRunning || timer < 300) && (
                      <div className="grid grid-cols-1 gap-3 mt-4">
                        <p className="text-sm text-gray-700 font-medium mb-2">Choose any 3 lessons to complete:</p>
                        {selectedQuest.modalContent.lessonsAvailable.map(lesson => (
                          <motion.div
                            key={lesson.id}
                            whileHover={{ scale: 1.02 }}
                            className="bg-white rounded-lg p-3 shadow-sm border border-[#98E7DE]/30 cursor-pointer hover:border-[#004748]/40 transition-all"
                            onClick={() => lesson.path && navigate(lesson.path)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="bg-[#004748]/10 p-2 rounded-full">
                                  {lesson.id <= 3 ? <BookOpen className="h-4 w-4 text-[#004748]" /> : <Star className="h-4 w-4 text-[#004748]" />}
                                </div>
                                <span className="font-medium">{lesson.title}</span>
                              </div>
                              <span className="text-xs text-gray-500">{lesson.duration}</span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                
                {selectedQuest.id === 1 && (
                  <button
                    className="w-full bg-[#004748] text-white py-3 rounded-lg font-medium hover:bg-[#004748]/90 transition-colors mt-4"
                    onClick={() => {
                      setShowQuestModal(false);
                      navigate(selectedQuest.modalContent.path);
                    }}
                  >
                    {selectedQuest.modalContent.action}
                  </button>
                )}
              </div>
              
              <div className="flex justify-end mt-4">
                <button
                  className="text-[#004748] hover:text-[#004748]/70 font-medium"
                  onClick={() => setShowQuestModal(false)}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Premium Modal */}
      <AnimatePresence>
        {showPremiumModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setShowPremiumModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 shadow-xl max-w-md w-full mx-4"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Upgrade to Premium</h3>
                <button
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPremiumModal(false)}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-center mb-6">
                  <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-4 rounded-full">
                    <Diamond className="h-8 w-8 text-white" />
                  </div>
                </div>
                <p className="text-center text-gray-700 mb-4">
                  Unlock all premium features and take your sign language learning to the next level!
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 mb-6">
                {premiumFeatures.map((feature, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl p-4 shadow-lg"
                  >
                    <div className="flex flex-col items-center">
                      <div className="mb-3">
                        {feature.icon}
                      </div>
                      <h4 className="font-semibold text-white text-center mb-1">{feature.title}</h4>
                      <p className="text-xs text-white/90 text-center">{feature.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="flex flex-col gap-3">
              <motion.button
  whileHover={{ scale: 1.03 }}
  whileTap={{ scale: 0.97 }}
  className="relative overflow-hidden bg-gradient-to-r from-amber-500 to-amber-600 text-white py-3 rounded-xl font-bold shadow-lg"
  onClick={handleMonthlyPlanClick}
>
  <span className="relative z-10">Upgrade Now - ₹349/month</span>
  <motion.div
    className="absolute inset-0 bg-white"
    initial={{ x: "-100%", opacity: 0.3 }}
    animate={{ x: "100%", opacity: 0 }}
    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
    style={{ width: "150%", height: "100%" }}
  />
</motion.button>
<motion.button
  whileHover={{ scale: 1.03 }}
  whileTap={{ scale: 0.97 }}
  className="relative overflow-hidden bg-gradient-to-r from-amber-500 to-amber-600 text-white py-3 rounded-xl font-bold shadow-lg"
  onClick={handleAnnualPlanClick}
>
  <span className="relative z-10">Annual Plan - ₹2,999/year</span>
  <motion.div
    className="absolute inset-0 bg-white"
    initial={{ x: "-100%", opacity: 0.3 }}
    animate={{ x: "100%" }}
    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
    style={{ width: "150%", height: "100%" }}
  />
</motion.button>
                <p className="text-xs text-gray-500 text-center mt-2">
                  Save 28% with our annual plan
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Dashboard;