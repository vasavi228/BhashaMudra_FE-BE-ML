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
  Diamond,
  Gift,
  AlertCircle,
  ChevronDown,
  Settings,
  User,
  LogOut,
  BarChart,
  PieChart,
  ArrowRight,
  Check,
  Lock
} from 'lucide-react';

function PremiumDashboard() {
  const navigate = useNavigate();
  const [showStreakCalendar, setShowStreakCalendar] = useState(false);
  const [showQuestModal, setShowQuestModal] = useState(false);
  const [selectedQuest, setSelectedQuest] = useState(null);
  const [dashboardSettings, setDashboardSettings] = useState(null);
  const [timer, setTimer] = useState(300); // 5 minutes in seconds
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showPremiumInfo, setShowPremiumInfo] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  
  useEffect(() => {
    const settings = JSON.parse(localStorage.getItem('dashboardSettings') || '{}');
    setDashboardSettings(settings);
    
    // Check if this is first visit after upgrading
    const isPremiumNew = localStorage.getItem('premiumFirstVisit');
    if (!isPremiumNew) {
      setShowPremiumInfo(true);
      localStorage.setItem('premiumFirstVisit', 'false');
    }
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

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Get premium expiry date
  const getPremiumExpiryDate = () => {
    const expiryDate = localStorage.getItem('userPremiumExpiry');
    if (expiryDate) {
      const date = new Date(expiryDate);
      return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    }
    return 'Mar 13, 2026'; // Default fallback
  };

  const premiumPlan = localStorage.getItem('userPremiumPlan') || 'monthly';

  // Enhanced stats for premium users
  const userStats = {
    xp: 350,
    level: 3,
    progress: 45,
    streak: 7,
    dailyGoal: dashboardSettings?.dailyGoal || 100,
    todayXP: 75,
    totalSigns: 12,
    practiceMinutes: 45,
    accuracy: 94.5,
    daysActive: 9,
    totalLessonsCompleted: 14
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
    },
    // Premium-only quests
    {
      id: 3,
      title: "Story Time",
      description: "Complete the interactive story module",
      reward: 250,
      progress: 0,
      total: 1,
      icon: <BookOpen className="w-5 h-5" />,
      isPremium: true,
      modalContent: {
        type: "story",
        instructions: "Immerse yourself in an interactive sign language story experience!",
        action: "Start Story",
        path: "/learn/story/1"
      }
    },
    {
      id: 4,
      title: "Advanced Phrase",
      description: "Master 3 advanced vocabulary phrases",
      reward: 200,
      progress: 0,
      total: 3,
      icon: <MessageSquare className="w-5 h-5" />,
      isPremium: true,
      modalContent: {
        type: "vocabulary",
        instructions: "Practice these advanced phrases to improve your vocabulary.",
        lessonsAvailable: [
          { id: 1, title: "Greeting Phrases", path: "/learn/vocabulary/greetings", duration: "3-4 min" },
          { id: 2, title: "Common Questions", path: "/learn/vocabulary/questions", duration: "3-4 min" },
          { id: 3, title: "Everyday Actions", path: "/learn/vocabulary/actions", duration: "4-5 min" }
        ]
      }
    }
  ];

  const funFacts = [
    {
      title: "Did you know?",
      content: "The first Deaflympics was held in Paris in 1924, making it the second oldest multi-sport event after the Olympics!",
      image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=800"
    },
    {
      title: "Premium Fact",
      content: "Sign languages aren't universal! There are over 300 different sign languages used around the world today.",
      image: "https://images.unsplash.com/photo-1508780709619-79562169bc64?auto=format&fit=crop&q=80&w=800"
    },
    {
      title: "Premium Fact",
      content: "The world's largest sign language dictionary contains over 15,000 signs and is maintained by research institutions.",
      image: "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=800"
    }
  ];

  // Randomly select a fun fact
  const funFact = funFacts[Math.floor(Math.random() * funFacts.length)];

  const lessons = [
    {
      id: 1,
      title: "A to Z",
      description: "Learn the ISL gestures for the 26 alphabets",
      icon: <BookOpen className="w-6 h-6" />,
      status: "current",
      progress: 30,
      totalSigns: 26,
      completedSigns: 7,
      path: "/learn/alphabets"
    },
    {
      id: 2,
      title: "1 to 9",
      description: "Master numbers in ISL",
      icon: <Star className="w-6 h-6" />,
      status: "current",
      progress: 20,
      totalSigns: 9,
      completedSigns: 3,
      path: "/learn/numbers"
    },
    {
      id: 3,
      title: "Interactive Story",
      description: "Learn through engaging narrative quizzes",
      icon: <BookOpen className="w-6 h-6" />,
      status: "available",
      progress: 40,
      totalSigns: 10,
      completedSigns: 4,
      path: "/premium/quiz",
      premiumFeature: true
    },
    {
      id: 4,
      title: "Basic Words",
      description: "Common everyday expressions in ISL",
      icon: <MessageSquare className="w-6 h-6" />,
      status: "available",
      progress: 0,
      totalSigns: 15,
      completedSigns: 0,
      path: "/learn/words",
      premiumFeature: true
    },
    {
      id: 5,
      title: "Advanced Phrases",
      description: "Complex conversational phrases in ISL",
      icon: <MessageSquare className="w-6 h-6" />,
      status: "available",
      progress: 0,
      totalSigns: 20,
      completedSigns: 0,
      path: "/learn/vocabulary/advanced",
      premiumFeature: true
    },
    {
      id: 6,
      title: "Community Phrases",
      description: "Social interaction signs",
      icon: <Rocket className="w-6 h-6" />,
      status: "available",
      progress: 0,
      totalSigns: 20,
      completedSigns: 0,
      path: "/learn/community",
      premiumFeature: true
    }
  ];

  // Add purpose-specific lessons
  useEffect(() => {
    if (dashboardSettings?.purpose === 'professional') {
      lessons.push({
        id: 7,
        title: "Professional Terms",
        description: "Business and workplace signs",
        icon: <Rocket className="w-6 h-6" />,
        status: "available",
        progress: 0,
        totalSigns: 20,
        completedSigns: 0,
        path: "/learn/professional",
        premiumFeature: true
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

  const startQuickLearnerChallenge = () => {
    setIsTimerRunning(true);
  };

  // Premium stats data for charts
  const activityData = [
    { day: 'Mon', minutes: 15 },
    { day: 'Tue', minutes: 22 },
    { day: 'Wed', minutes: 18 },
    { day: 'Thu', minutes: 25 },
    { day: 'Fri', minutes: 30 },
    { day: 'Sat', minutes: 15 },
    { day: 'Sun', minutes: 45 }
  ];
  
  const accuracyByCategory = [
    { category: "Alphabets", accuracy: 92 },
    { category: "Numbers", accuracy: 88 },
    { category: "Basic Words", accuracy: 76 },
    { category: "Stories", accuracy: 85 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#b38ff5] to-[#f8e4ff]">
      {/* Top Navigation */}
      <div className="bg-[#340e62]/90 backdrop-blur-sm shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-2xl font-bold text-white">
                BhashaMudra
              </span>
              <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-3 py-1 rounded-full font-medium shadow-md flex items-center gap-1">
                <Diamond className="h-4 w-4" />
                <span className="text-sm">Premium</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                <Trophy className="h-5 w-5 text-amber-400" />
                <span className="font-semibold text-white">{userStats.xp} XP</span>
              </div>
              
              <motion.div 
                className="relative"
                initial={false}
              >
                <motion.button
                  className="relative flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full cursor-pointer"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <User className="h-5 w-5 text-white" />
                  <span className="font-medium text-white">My Account</span>
                  <ChevronDown className="h-4 w-4 text-white" />
                </motion.button>
                
                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-xl z-[9999]"
                    >
                      <div className="p-4 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                          <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-2 rounded-full">
                            <Diamond className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">Premium</p>
                            <p className="text-xs text-gray-500">
                              {premiumPlan === 'monthly' ? 'Monthly Plan' : 'Annual Plan'}
                            </p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Valid until: {getPremiumExpiryDate()}
                        </p>
                      </div>
                      <div className="py-2">
                        <button 
                          className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-3"
                          onClick={() => navigate('/settings')}
                        >
                          <Settings className="h-4 w-4 text-gray-600" />
                          <span className="text-gray-700">Settings</span>
                        </button>
                        <button 
                          className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-3"
                          onClick={() => setShowStatsModal(true)}
                        >
                          <BarChart className="h-4 w-4 text-gray-600" />
                          <span className="text-gray-700">My Stats</span>
                        </button>
                        <button 
                          className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-3"
                          onClick={() => navigate('/logout')}
                        >
                          <LogOut className="h-4 w-4 text-gray-600" />
                          <span className="text-gray-700">Log Out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
              
              <button 
                className="bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-full font-medium transition-colors"
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
            {/* Premium Status Card */}
            <motion.div 
              className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl p-6 shadow-lg"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-white/20 p-3 rounded-xl">
                  <Diamond className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Premium Active</h3>
                  <p className="text-sm text-white/80">
                    {premiumPlan === 'monthly' ? 'Monthly Plan' : 'Annual Plan'}
                  </p>
                </div>
              </div>
              <div className="bg-white/20 p-3 rounded-xl mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-white/90 text-sm">Renewal date:</span>
                  <span className="text-white font-medium">{getPremiumExpiryDate()}</span>
                </div>
              </div>
            </motion.div>
            
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

            {/* Premium Stats Summary */}
            <motion.div
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg"
              whileHover={{ scale: 1.02 }}
              onClick={() => setShowStatsModal(true)}
            >
              <div className="flex items-center gap-3 mb-6">
                <BarChart className="h-6 w-6 text-[#340e62]" />
                <h3 className="text-lg font-semibold text-gray-800">Your Stats</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total signs learned:</span>
                  <span className="font-semibold text-gray-800">{userStats.totalSigns}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Practice time:</span>
                  <span className="font-semibold text-gray-800">{userStats.practiceMinutes} mins</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Average accuracy:</span>
                  <span className="font-semibold text-gray-800">{userStats.accuracy}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Days active:</span>
                  <span className="font-semibold text-gray-800">{userStats.daysActive}</span>
                </div>
                <button
                  className="w-full bg-[#340e62] text-white py-2 rounded-lg mt-2 flex items-center justify-center gap-2"
                >
                  <span>View Detailed Stats</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>

            {/* Daily Quests */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <Target className="h-6 w-6 text-[#340e62]" />
                <h3 className="text-lg font-semibold text-gray-800">Daily Quests</h3>
              </div>
              <div className="space-y-4">
                {dailyQuests.map(quest => (
                  <motion.div 
                    key={quest.id} 
                    className={`rounded-xl p-4 cursor-pointer ${quest.isPremium ? 'bg-gradient-to-r from-amber-100 to-amber-200' : 'bg-[#340e62]/5'}`}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => handleQuestClick(quest)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${quest.isPremium ? 'bg-amber-500/20' : 'bg-[#340e62]/10'}`}>
                        {quest.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center">
                          <h4 className="font-medium text-gray-800">{quest.title}</h4>
                          {quest.isPremium && (
                            <span className="ml-2 bg-amber-500/20 text-amber-700 text-xs px-2 py-0.5 rounded-full">
                              Premium
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{quest.description}</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${quest.isPremium ? 'bg-amber-500' : 'bg-[#340e62]'}`}
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

            {/* Weekly Activity Summary (Premium Feature) */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg mb-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <BarChart className="h-6 w-6 text-[#340e62]" />
                  <h3 className="text-lg font-semibold text-gray-800">Weekly Activity</h3>
                </div>
                <div className="flex items-center gap-2">
                  <Diamond className="h-4 w-4 text-amber-500" />
                  <span className="text-sm font-medium text-amber-500">Premium Feature</span>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-2 h-40">
                {activityData.map((day, index) => (
                  <div key={index} className="flex flex-col items-center justify-end h-full">
                    <div className="w-full bg-gradient-to-t from-[#340e62] to-[#8a65c9] rounded-t-lg" style={{ height: `${day.minutes * 2}px` }}></div>
                    <div className="text-xs font-medium text-gray-600 mt-2">{day.day}</div>
                    <div className="text-xs text-gray-500">{day.minutes}m</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Learning Path */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
              <div className="relative">
                {/* Connecting Lines */}
                <div className="absolute left-[47px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#340e62] to-[#b38ff5]/30" />
                
                {/* Lesson Cards */}
                <div className="space-y-8">
                  {lessons.map((lesson, index) => (
                    <motion.div
                      key={lesson.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="relative"
                    >
                      {/* Connection Dot */}
                      <div className={`absolute left-[43px] top-[30px] w-[13px] h-[13px] rounded-full ${lesson.premiumFeature ? 'bg-amber-500' : 'bg-[#340e62]'}`} />
                      
                      <motion.div
                        whileHover={{ scale: lesson.status !== 'locked' ? 1.02 : 1 }}
                        className={`
                          ml-16 bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg
                          ${lesson.premiumFeature ? 'border-2 border-amber-500/50' : 'border-2 border-transparent'}
                          ${lesson.status === 'current' ? 'border-2 border-[#340e62]' : ''}
                          ${lesson.status !== 'locked' ? 'cursor-pointer hover:border-[#b38ff5]' : ''}
                          transition-all duration-200 relative
                        `}
                        onClick={() => {
                          if (lesson.status !== 'locked' && lesson.path) {
                            navigate(lesson.path);
                          }
                        }}
                      >
                        {lesson.premiumFeature && (
                          <div className="absolute right-4 top-4 z-10">
                            <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-2 rounded-lg shadow-lg">
                              <Diamond className="h-4 w-4 text-white" />
                            </div>
                          </div>
                          )}
                          <div className="flex items-start gap-4">
                            <div className={`bg-${lesson.premiumFeature ? 'amber' : '[#340e62]'}/10 p-3 rounded-xl`}>
                              {lesson.icon}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="text-lg font-semibold text-gray-800">{lesson.title}</h3>
                                {lesson.status === 'current' && (
                                  <span className="bg-[#340e62]/10 text-[#340e62] text-xs px-2 py-0.5 rounded-full">
                                    In Progress
                                  </span>
                                )}
                                {lesson.status === 'locked' && (
                                  <span className="flex items-center gap-1 bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full">
                                    <Lock className="h-3 w-3" />
                                    <span>Locked</span>
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mb-3">{lesson.description}</p>
                              <div className="flex items-center gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs text-gray-500">Progress</span>
                                    <span className="text-xs font-medium text-gray-700">
                                      {lesson.completedSigns}/{lesson.totalSigns} signs
                                    </span>
                                  </div>
                                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div 
                                      className={`h-full ${lesson.premiumFeature ? 'bg-amber-500' : 'bg-[#340e62]'} rounded-full`}
                                      style={{ width: `${lesson.progress}%` }}
                                    />
                                  </div>
                                </div>
                                <button 
                                  className={`px-4 py-1.5 rounded-lg text-sm font-medium 
                                    ${lesson.status === 'locked' 
                                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                                      : lesson.status === 'current'
                                        ? 'bg-[#340e62] text-white'
                                        : 'bg-[#b38ff5]/20 text-[#340e62]'
                                    }`}
                                  disabled={lesson.status === 'locked'}
                                >
                                  {lesson.status === 'current' ? 'Continue' : lesson.status === 'completed' ? 'Review' : 'Start'}
                                </button>
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
  
        {/* Modal for Streak Calendar */}
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
                className="bg-white rounded-2xl p-6 max-w-xl w-full shadow-2xl"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                    <Flame className="h-6 w-6 text-orange-500" />
                    <h3 className="text-xl font-bold text-gray-800">Your Streak Calendar</h3>
                  </div>
                  <button
                    className="text-gray-500 hover:text-gray-700"
                    onClick={() => setShowStreakCalendar(false)}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-700">March 2025</h4>
                    <span className="text-sm text-gray-500">Current streak: {userStats.streak} days</span>
                  </div>
                  
                  <div className="grid grid-cols-7 gap-2 text-center mb-2">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                      <div key={i} className="text-sm font-medium text-gray-500">{day}</div>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-7 gap-2">
                    {/* First week empty days */}
                    {[...Array(5)].map((_, i) => (
                      <div key={`empty-${i}`} className="h-10"></div>
                    ))}
                    
                    {/* Actual days */}
                    {[...Array(13)].map((_, i) => {
                      const day = i + 1;
                      const isActive = day <= 13; // All days up to today (13th March)
                      const isToday = day === 13;
                      return (
                        <div 
                          key={`day-${day}`}
                          className={`
                            h-10 rounded-lg flex items-center justify-center font-medium
                            ${isActive ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400'}
                            ${isToday ? 'ring-2 ring-orange-300' : ''}
                          `}
                        >
                          {day}
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                <div className="bg-orange-50 p-4 rounded-xl">
                  <div className="flex gap-4 items-start">
                    <Gift className="h-5 w-5 text-orange-500 mt-0.5" />
                    <div>
                      <h5 className="font-medium text-gray-800 mb-1">Streak Rewards</h5>
                      <p className="text-sm text-gray-600 mb-2">
                        Keep your streak going to unlock special rewards!
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-orange-700">7</span>
                          </div>
                          <span className="text-sm text-gray-700">Unlock special practice mode</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-500">14</span>
                          </div>
                          <span className="text-sm text-gray-700">+50 XP bonus</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-500">30</span>
                          </div>
                          <span className="text-sm text-gray-700">Exclusive profile badge</span>
                        </div>
                      </div>
                    </div>
                  </div>
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
                className="bg-white rounded-2xl p-6 max-w-xl w-full shadow-2xl"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${selectedQuest.isPremium ? 'bg-amber-500/20' : 'bg-[#340e62]/10'}`}>
                      {selectedQuest.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">{selectedQuest.title}</h3>
                  </div>
                  <button
                    className="text-gray-500 hover:text-gray-700"
                    onClick={() => setShowQuestModal(false)}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="mb-6">
                  <p className="text-gray-600 mb-4">{selectedQuest.description}</p>
                  
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500">Progress</span>
                    <span className="text-sm font-medium text-gray-700">
                      {selectedQuest.progress}/{selectedQuest.total}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-4">
                    <div 
                      className={`h-full ${selectedQuest.isPremium ? 'bg-amber-500' : 'bg-[#340e62]'} rounded-full`}
                      style={{ width: `${(selectedQuest.progress / selectedQuest.total) * 100}%` }}
                    />
                  </div>
                  
                  {/* Quest reward */}
                  <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-xl">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    <span className="text-gray-700">Reward: <span className="font-semibold">{selectedQuest.reward} XP</span></span>
                  </div>
                </div>
                
                {/* Quest specific content based on modalContent */}
                {selectedQuest.modalContent && (
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-800 mb-3">Instructions:</h4>
                    <p className="text-gray-600 mb-4">{selectedQuest.modalContent.instructions}</p>
                    
                    {selectedQuest.modalContent.type === 'timed' && (
                      <div className="bg-[#340e62]/5 p-4 rounded-xl mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Time Remaining:</span>
                          <span className={`text-lg font-bold ${timer < 60 ? 'text-red-500' : 'text-[#340e62]'}`}>
                            {formatTime(timer)}
                          </span>
                        </div>
                        {!isTimerRunning && (
                          <button
                            className="w-full bg-[#340e62] text-white py-2 rounded-lg mt-2 flex items-center justify-center gap-2"
                            onClick={startQuickLearnerChallenge}
                          >
                            <Clock className="h-4 w-4" />
                            <span>Start Challenge</span>
                          </button>
                        )}
                      </div>
                    )}
                    
                    {/* Available lessons list for timed or vocabulary quests */}
                    {(selectedQuest.modalContent.type === 'timed' || selectedQuest.modalContent.type === 'vocabulary') && 
                      selectedQuest.modalContent.lessonsAvailable && (
                      <div>
                        <h4 className="font-medium text-gray-800 mb-2">Available Lessons:</h4>
                        <div className="space-y-2">
                          {selectedQuest.modalContent.lessonsAvailable.map(lesson => (
                            <motion.div
                              key={lesson.id}
                              whileHover={{ scale: 1.02 }}
                              className="bg-white border border-gray-200 rounded-xl p-3 flex items-center justify-between cursor-pointer shadow-sm"
                              onClick={() => {
                                setShowQuestModal(false);
                                navigate(lesson.path);
                              }}
                            >
                              <div>
                                <h5 className="font-medium text-gray-800">{lesson.title}</h5>
                                <p className="text-xs text-gray-500">Duration: {lesson.duration}</p>
                              </div>
                              <ArrowRight className="h-4 w-4 text-gray-500" />
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Action buttons */}
                <div className="flex justify-end gap-3">
                  <button
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    onClick={() => setShowQuestModal(false)}
                  >
                    Cancel
                  </button>
                  
                  {selectedQuest.modalContent && selectedQuest.modalContent.action && (
                    <button
                      className={`px-6 py-2 rounded-lg font-medium text-white ${selectedQuest.isPremium ? 'bg-amber-500' : 'bg-[#340e62]'}`}
                      onClick={() => {
                        setShowQuestModal(false);
                        if (selectedQuest.modalContent.path) {
                          navigate(selectedQuest.modalContent.path);
                        }
                      }}
                    >
                      {selectedQuest.modalContent.action}
                    </button>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Premium Info Modal */}
        <AnimatePresence>
          {showPremiumInfo && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
              onClick={() => setShowPremiumInfo(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl"
                onClick={e => e.stopPropagation()}
              >
                <div className="text-center mb-6">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full flex items-center justify-center mb-4">
                    <Diamond className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Welcome to Premium!</h3>
                  <p className="text-gray-600">
                    You've unlocked all premium features of BhashaMudra. Here's what you can now access:
                  </p>
                </div>
                
                <div className="space-y-4 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="bg-amber-100 p-2 rounded-lg">
                      <Check className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">Advanced Lessons</h4>
                      <p className="text-sm text-gray-600">
                        Access all vocabulary lessons and interactive stories
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-amber-100 p-2 rounded-lg">
                      <Check className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">Detailed Progress Tracking</h4>
                      <p className="text-sm text-gray-600">
                        In-depth analytics and charts to monitor your improvement
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-amber-100 p-2 rounded-lg">
                      <Check className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">Premium Quests</h4>
                      <p className="text-sm text-gray-600">
                        Exclusive daily challenges with higher XP rewards
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-amber-100 p-2 rounded-lg">
                      <Check className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">Ad-Free Experience</h4>
                      <p className="text-sm text-gray-600">
                        Enjoy learning without any advertisements or interruptions
                      </p>
                    </div>
                  </div>
                </div>
                
                <button
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white py-3 rounded-xl font-medium shadow-lg"
                  onClick={() => setShowPremiumInfo(false)}
                >
                  Start Exploring Premium
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Stats Modal */}
        <AnimatePresence>
          {showStatsModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
              onClick={() => setShowStatsModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl p-6 max-w-2xl w-full h-[80vh] overflow-y-auto shadow-2xl"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                    <BarChart className="h-6 w-6 text-[#340e62]" />
                    <h3 className="text-xl font-bold text-gray-800">Your Detailed Stats</h3>
                  </div>
                  <button
                    className="text-gray-500 hover:text-gray-700"
                    onClick={() => setShowStatsModal(false)}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-[#340e62]/5 p-4 rounded-xl">
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Total XP Earned</h4>
                    <div className="text-3xl font-bold text-[#340e62]">{userStats.xp}</div>
                  </div>
                  
                  <div className="bg-[#340e62]/5 p-4 rounded-xl">
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Lessons Completed</h4>
                    <div className="text-3xl font-bold text-[#340e62]">{userStats.totalLessonsCompleted}</div>
                  </div>
                  
                  <div className="bg-[#340e62]/5 p-4 rounded-xl">
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Signs Learned</h4>
                    <div className="text-3xl font-bold text-[#340e62]">{userStats.totalSigns}</div>
                  </div>
                  
                  <div className="bg-[#340e62]/5 p-4 rounded-xl">
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Current Streak</h4>
                    <div className="text-3xl font-bold text-orange-500">{userStats.streak} days</div>
                  </div>
                </div>
                
                <div className="mb-8">
                  <h4 className="text-lg font-medium text-gray-800 mb-4">Weekly Activity</h4>
                  <div className="grid grid-cols-7 gap-2 h-40">
                    {activityData.map((day, index) => (
                      <div key={index} className="flex flex-col items-center justify-end h-full">
                        <div className="w-full bg-gradient-to-t from-[#340e62] to-[#8a65c9] rounded-t-lg" style={{ height: `${day.minutes * 2}px` }}></div>
                        <div className="text-xs font-medium text-gray-600 mt-2">{day.day}</div>
                        <div className="text-xs text-gray-500">{day.minutes}m</div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="mb-8">
                  <h4 className="text-lg font-medium text-gray-800 mb-4">Accuracy by Category</h4>
                  <div className="space-y-4">
                    {accuracyByCategory.map((item, index) => (
                      <div key={index}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-gray-700">{item.category}</span>
                          <span className="text-sm font-medium text-gray-800">{item.accuracy}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-[#340e62] to-[#8a65c9] rounded-full"
                            style={{ width: `${item.accuracy}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-amber-50 rounded-xl p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="bg-amber-100 p-2 rounded-lg">
                      <Diamond className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">Premium Benefit</h4>
                      <p className="text-sm text-gray-600 mb-2">
                        As a premium user, your progress is automatically saved to the cloud and synced across all your devices.
                      </p>
                      <p className="text-xs text-amber-700">
                        Your premium plan: {premiumPlan === 'monthly' ? 'Monthly' : 'Annual'} • Renews on {getPremiumExpiryDate()}
                      </p>
                    </div>
                  </div>
                </div>
                
                <button
                  className="w-full bg-[#340e62] text-white py-3 rounded-xl font-medium shadow-lg"
                  onClick={() => {
                    setShowStatsModal(false);
                    // Here you could also export or share stats
                  }}
                >
                  Close
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
  
  export default PremiumDashboard;