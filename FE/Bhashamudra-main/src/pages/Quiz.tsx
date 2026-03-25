import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Award, HelpCircle, BarChart, Camera, CheckCircle, RefreshCcw } from 'lucide-react';

const QuizPage = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [signValidated, setSignValidated] = useState(false);
  const videoRef = useRef(null);
  
  const questions = [
    {
      id: 1,
      story: "Deepika and Rahul are meeting at a café. Deepika is telling Rahul about her new job at a tech company where she works with 7 other teammates.",
      conversation: [
        { speaker: "Deepika", text: "I'm so excited about my new job! I work with seven other people in my team." },
        { speaker: "Rahul", text: "That's great! How would you sign the number 7 in ISL?" }
      ],
      question: "How should Deepika correctly sign the number 7 in Indian Sign Language?",
      options: [
        {
          id: "A",
          text: "Extending thumb, index, and middle fingers horizontally",
          isCorrect: false
        },
        {
          id: "B",
          text: "Extending all five fingers of one hand and two fingers of the other",
          isCorrect: false
        },
        {
          id: "C",
          text: "Extending thumb, index, middle, and ring fingers with palm facing forward",
          isCorrect: false
        },
        {
          id: "D",
          text: "Extending index, middle, ring fingers, pinky, and folded thumb with palm facing forward",
          isCorrect: true
        }
      ]
    },
    {
      id: 2,
      story: "Meena is at a family gathering explaining to her cousin that she needs assistance understanding the conversation.",
      conversation: [
        { speaker: "Meena", text: "I'm having trouble following what everyone is saying." },
        { speaker: "Cousin", text: "Would you like me to help?" },
        { speaker: "Meena", text: "Yes, I need assistance, please." }
      ],
      question: "Which sign should Meena use for 'assistance'?",
      options: [
        {
          id: "A",
          text: "Placing open hands on chest and pushing outward",
          isCorrect: false
        },
        {
          id: "B",
          text: "Right palm up with left hand moving down onto it",
          isCorrect: true
        },
        {
          id: "C",
          text: "Tapping wrist several times",
          isCorrect: false
        },
        {
          id: "D",
          text: "Both hands moving side to side with palms facing down",
          isCorrect: false
        }
      ]
    },
    {
      id: 3,
      story: "Arjun and Priya are discussing their college schedules over coffee.",
      conversation: [
        { speaker: "Arjun", text: "How many classes do you have this semester?" },
        { speaker: "Priya", text: "I have 4 classes, all in the science building." },
        { speaker: "Arjun", text: "Oh, that's convenient! How do you sign 'college' in ISL?" }
      ],
      question: "How would Priya correctly sign 'college' in ISL?",
      options: [
        {
          id: "A",
          text: "Making a 'C' handshape near the temple",
          isCorrect: true
        },
        {
          id: "B",
          text: "Stacking flat hands on top of each other",
          isCorrect: false
        },
        {
          id: "C",
          text: "Writing motion with index finger",
          isCorrect: false
        },
        {
          id: "D",
          text: "Placing hands in front of chest and moving outward",
          isCorrect: false
        }
      ]
    },
    {
      id: 4,
      story: "Vikram and Anjali are planning a trip to Mumbai. Anjali is telling Vikram about her doctor's appointment before they leave.",
      conversation: [
        { speaker: "Anjali", text: "I need to visit my doctor on Tuesday before our trip." },
        { speaker: "Vikram", text: "No problem, we can leave on Wednesday. How do you sign 'doctor' in ISL?" }
      ],
      question: "Which is the correct way for Anjali to sign 'doctor' in ISL?",
      options: [
        {
          id: "A",
          text: "Tapping the wrist like checking a pulse",
          isCorrect: false
        },
        {
          id: "B",
          text: "Moving thumb from heart to opposite shoulder",
          isCorrect: false
        },
        {
          id: "C",
          text: "Making a 'D' handshape and placing it against the wrist",
          isCorrect: true
        },
        {
          id: "D",
          text: "Mimicking taking medicine",
          isCorrect: false
        }
      ]
    },
    {
      id: 5,
      story: "Aanya and Rohan are shopping at a grocery store. Aanya wants to buy some apples for a pie she's baking.",
      conversation: [
        { speaker: "Aanya", text: "I need to get some fresh apples for my pie recipe." },
        { speaker: "Rohan", text: "They're in the produce section. Can you show me how to sign 'apple' in ISL?" }
      ],
      question: "Show how you would sign 'apple' in Indian Sign Language",
      isVideoQuestion: true,
      correctSignDescription: "Place your index finger knuckle on your cheek and twist slightly (like the motion of taking a bite from an apple)."
    }
  ];

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  
  const handleSelectOption = (optionId) => {
    setAnswers({
      ...answers,
      [questions[currentQuestion].id]: optionId
    });
  };
  
  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      // Reset camera state when moving to next question
      setCameraActive(false);
      setSignValidated(false);
    } else {
      setShowResult(true);
    }
  };
  
  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      // Reset camera state when moving to previous question
      setCameraActive(false);
      setSignValidated(false);
    }
  };
  
  const handleBackToDashboard = () => {
    window.location.href = '/premium/dashboard';
  };
  
  const startCamera = () => {
    setCameraActive(true);
    // Here you would normally start the camera stream
  };
  
  const stopCamera = () => {
    setCameraActive(false);
  };
  
  const validateSign = () => {
    // This is where ML validation would happen in a real application
    setSignValidated(true);
    setAnswers({
      ...answers,
      [questions[currentQuestion].id]: "VALIDATED"
    });
  };
  
  const calculateScore = () => {
    let score = 0;
    Object.keys(answers).forEach(questionId => {
      const question = questions.find(q => q.id === parseInt(questionId));
      if (question.isVideoQuestion) {
        if (answers[questionId] === "VALIDATED") {
          score++;
        }
      } else {
        const selectedOption = question.options.find(o => o.id === answers[questionId]);
        if (selectedOption && selectedOption.isCorrect) {
          score++;
        }
      }
    });
    return score;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f9fa] to-[#e9ecef] text-[#004748]">
      <div className="container mx-auto px-4 py-8 flex flex-col min-h-screen">
        <div className="flex items-center mb-8">
          <button 
            onClick={handleBackToDashboard}
            className="flex items-center text-[#004748] hover:text-[#098b8c] transition-colors"
          >
            <ArrowLeft className="mr-2" />
            Back to Dashboard
          </button>
        </div>
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#004748] mb-2">
            Quiz Time!
          </h1>
          {!showResult && (
            <div className="flex flex-col items-center">
              <p className="text-[#098b8c] mb-3">
                Question {currentQuestion + 1} of {questions.length}
              </p>
              <div className="w-full max-w-3xl h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-[#98E7DE]"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          )}
        </div>
        
        <AnimatePresence mode="wait">
          {!showResult ? (
            <motion.div
              key={`question-${currentQuestion}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col"
            >
              <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 flex-1">
                {/* Conversation Bubbles */}
                <div className="mb-8 p-4 bg-[#f8f9fa] rounded-xl">
                  <p className="text-[#098b8c] mb-3 text-lg font-medium">Conversation Context</p>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    {questions[currentQuestion].story}
                  </p>
                  
                  <div className="space-y-4">
                    {questions[currentQuestion].conversation && 
                      questions[currentQuestion].conversation.map((message, index) => (
                        <div 
                          key={index} 
                          className={`flex ${message.speaker === "Rahul" || message.speaker === "Cousin" || message.speaker === "Vikram" || message.speaker === "Rohan" ? "justify-end" : "justify-start"}`}
                        >
                          <div className={`max-w-xs md:max-w-md rounded-2xl p-4 
                            ${message.speaker === "Rahul" || message.speaker === "Cousin" || message.speaker === "Vikram" || message.speaker === "Rohan" 
                              ? "bg-[#004748] text-white rounded-tr-none" 
                              : "bg-[#98E7DE]/40 text-[#004748] rounded-tl-none"}`}
                          >
                            <p className="font-semibold text-sm mb-1">{message.speaker}</p>
                            <p>{message.text}</p>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </div>
                
                <div className="mb-8">
                  <h2 className="text-2xl font-semibold mb-6 text-[#004748] text-center">
                    {questions[currentQuestion].question}
                  </h2>
                  
                  {questions[currentQuestion].isVideoQuestion ? (
                    <div className="flex flex-col items-center space-y-4">
                      <div className="w-full max-w-md aspect-video bg-gray-100 rounded-xl overflow-hidden relative">
                        {cameraActive ? (
                          <React.Fragment>
                            <video 
                              ref={videoRef}
                              autoPlay 
                              playsInline 
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute bottom-4 right-4 flex space-x-2">
                              <button
                                onClick={stopCamera}
                                className="bg-red-500 text-white px-3 py-2 rounded-lg text-sm"
                              >
                                Stop Camera
                              </button>
                            </div>
                          </React.Fragment>
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                              <Camera className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                              <p className="text-gray-500">Camera preview will appear here</p>
                              <button
                                onClick={startCamera}
                                className="mt-4 bg-[#004748] text-white px-6 py-2 rounded-lg"
                              >
                                Start Camera
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {cameraActive && (
                        <motion.button
                          initial={{ scale: 0.9 }}
                          animate={{ scale: 1 }}
                          onClick={validateSign}
                          className={`px-6 py-3 rounded-xl bg-[#004748] text-white font-medium flex items-center justify-center gap-2 ${
                            signValidated ? 'bg-green-500' : ''
                          }`}
                          disabled={signValidated}
                        >
                          {signValidated ? (
                            <React.Fragment>
                              <CheckCircle className="w-5 h-5" />
                              Sign Validated!
                            </React.Fragment>
                          ) : (
                            <React.Fragment>
                              <CheckCircle className="w-5 h-5" />
                              Validate My Sign
                            </React.Fragment>
                          )}
                        </motion.button>
                      )}
                      
                      {/* Hint box for video question */}
                      {/* <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-[#FFF8E1] border border-[#FFD54F] rounded-lg p-4 text-[#5D4037] mt-2 max-w-md"
                      >
                        <p className="font-medium mb-1">Hint:</p>
                        <p className="text-sm">
                          {questions[currentQuestion].correctSignDescription}
                        </p>
                      </motion.div> */}
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {questions[currentQuestion].options.map((option) => (
                        <motion.button
                          key={option.id}
                          onClick={() => handleSelectOption(option.id)}
                          className={`w-full text-left p-5 rounded-xl border-2 transition-all duration-200
                            ${answers[questions[currentQuestion].id] === option.id
                              ? 'border-[#004748] bg-[#98E7DE]/10'
                              : 'border-gray-200 bg-gray-50 hover:border-[#98E7DE]'}`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="flex items-start">
                            <div className="w-8 h-8 rounded-full bg-[#e9f5f4] flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                              <span className="text-[#004748] font-medium">{option.id}</span>
                            </div>
                            <div>
                              <div className="text-lg font-medium text-[#004748]">
                                {option.text}
                              </div>
                            </div>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-between">
                <motion.button
                  onClick={handlePreviousQuestion}
                  className={`px-6 py-3 rounded-xl bg-gray-200 text-gray-700 font-medium transition-all
                    ${currentQuestion === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-300'}`}
                  whileHover={currentQuestion !== 0 ? { scale: 1.05 } : {}}
                  whileTap={currentQuestion !== 0 ? { scale: 0.95 } : {}}
                  disabled={currentQuestion === 0}
                >
                  Previous
                </motion.button>
                
                <motion.button
                  onClick={handleNextQuestion}
                  className={`px-6 py-3 rounded-xl font-medium transition-all
                    ${(!answers[questions[currentQuestion].id] && !questions[currentQuestion].isVideoQuestion) || 
                      (questions[currentQuestion].isVideoQuestion && !signValidated)
                      ? 'bg-gray-200 text-gray-400 opacity-50 cursor-not-allowed' 
                      : 'bg-[#004748] text-white hover:bg-[#005f60]'}`}
                  whileHover={answers[questions[currentQuestion].id] || (questions[currentQuestion].isVideoQuestion && signValidated) ? { scale: 1.05 } : {}}
                  whileTap={answers[questions[currentQuestion].id] || (questions[currentQuestion].isVideoQuestion && signValidated) ? { scale: 0.95 } : {}}
                  disabled={(!answers[questions[currentQuestion].id] && !questions[currentQuestion].isVideoQuestion) || 
                    (questions[currentQuestion].isVideoQuestion && !signValidated)}
                >
                  {currentQuestion === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-3xl mx-auto"
            >
              <div className="text-center mb-8">
                <div className="w-24 h-24 rounded-full bg-[#98E7DE]/20 flex items-center justify-center mx-auto mb-4">
                  <Award className="w-12 h-12 text-[#004748]" />
                </div>
                <h2 className="text-3xl font-bold mb-2 text-[#004748]">Quiz Completed!</h2>
                <p className="text-gray-600">
                  You scored {calculateScore()} out of {questions.length}
                </p>
              </div>
              
              <div className="h-4 bg-gray-200 rounded-full mb-8">
                <div 
                  className="h-full bg-[#98E7DE] rounded-full"
                  style={{ width: `${(calculateScore() / questions.length) * 100}%` }}
                />
              </div>
              
              <div className="flex flex-col gap-6 mb-8">
                {questions.map((question, index) => {
                  const answered = answers[question.id];
                  
                  if (question.isVideoQuestion) {
                    return (
                      <div key={question.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs
                            ${!answered 
                              ? 'bg-gray-400 text-white' 
                              : answered === "VALIDATED"
                                ? 'bg-green-500 text-white' 
                                : 'bg-red-500 text-white'}`}
                          >
                            {index + 1}
                          </div>
                          <h3 className="font-medium text-[#004748]">{question.question}</h3>
                        </div>
                        
                        <div className="pl-8 text-sm">
                          {answered === "VALIDATED" ? (
                            <p className="text-green-600">
                              Your sign was validated correctly!
                            </p>
                          ) : (
                            <p className="text-amber-600">Not attempted</p>
                          )}
                        </div>
                      </div>
                    );
                  } else {
                    const selectedOption = question.options.find(o => o.id === answered);
                    const correctOption = question.options.find(o => o.isCorrect);
                    const isCorrect = selectedOption && selectedOption.isCorrect;
                    
                    return (
                      <div key={question.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs
                            ${!answered 
                              ? 'bg-gray-400 text-white' 
                              : isCorrect 
                                ? 'bg-green-500 text-white' 
                                : 'bg-red-500 text-white'}`}
                          >
                            {index + 1}
                          </div>
                          <h3 className="font-medium text-[#004748]">{question.question}</h3>
                        </div>
                        
                        {answered ? (
                          <div className="pl-8 text-sm">
                            <p className={isCorrect ? 'text-green-600' : 'text-red-600'}>
                              You selected: {selectedOption.text}
                            </p>
                            {!isCorrect && (
                              <p className="text-green-600 mt-1">
                                Correct answer: {correctOption.text}
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="pl-8 text-sm text-amber-600">Not answered</p>
                        )}
                      </div>
                    );
                  }
                })}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <motion.button
                  onClick={handleBackToDashboard}
                  className="flex-1 px-6 py-4 rounded-xl bg-gray-200 text-gray-700 font-medium flex items-center justify-center gap-2 hover:bg-gray-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <ArrowLeft className="w-5 h-5" />
                  Return to Dashboard
                </motion.button>
                
                <motion.button
                  onClick={() => {
                    setCurrentQuestion(0);
                    setAnswers({});
                    setShowResult(false);
                    setCameraActive(false);
                    setSignValidated(false);
                  }}
                  className="flex-1 px-6 py-4 rounded-xl bg-[#004748] text-white font-medium flex items-center justify-center gap-2 hover:bg-[#005f60]"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <RefreshCcw className="w-5 h-5" />
                  Try Again
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default QuizPage;