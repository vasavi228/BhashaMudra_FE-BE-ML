import React, { useState, useRef, useEffect } from 'react';
import Fuse from 'fuse.js';
import { IoMdSend } from 'react-icons/io';
import { FaRobot } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import { BsChatDots } from 'react-icons/bs';

// Define the chatbot's knowledge base
const knowledgeBase = [
  {
    keywords: ['hello', 'hi', 'hey', 'greetings'],
    response: "Hello! Welcome to ISL Learning. How can I help you today?"
  },
  {
    keywords: ['learn', 'study', 'course', 'lessons', 'tutorial'],
    response: "Our platform offers interactive ISL lessons with video demonstrations, practice exercises, and real-time feedback. Would you like to start learning?"
  },
  {
    keywords: ['sign', 'language', 'isl', 'indian sign language'],
    response: "ISL (Indian Sign Language) is a visual language used by the deaf community in India. Our platform makes learning ISL engaging and accessible!"
  },
  {
    keywords: ['translate', 'translation', 'converter'],
    response: "Yes! We offer a real-time ISL translation feature that converts text and speech into sign language videos."
  },
  {
    keywords: ['account', 'signup', 'register', 'login'],
    response: "You can create a free account by clicking the 'Sign Up' button in the top right corner. This will give you access to all our learning features!"
  },
  {
    keywords: ['free', 'cost', 'price', 'pricing'],
    response: "We offer both free and premium features. You can start learning basic ISL completely free of charge!"
  },
  {
    keywords: ['help', 'support', 'contact', 'assistance'],
    response: "Need help? You can reach our support team through the contact form or email us at support@isllearning.com"
  },
  {
    keywords: ['practice', 'exercise', 'quiz', 'test'],
    response: "We provide interactive practice sessions, quizzes, and progress tracking to help you master ISL effectively."
  }
];

// Configure Fuse.js options
const fuseOptions = {
  includeScore: true,
  threshold: 0.4,
  keys: ['keywords']
};

// Create Fuse instance
const fuse = new Fuse(knowledgeBase.map(item => ({ keywords: item.keywords.join(' ') })), fuseOptions);

interface Message {
  text: string;
  isUser: boolean;
}

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { text: "Hi! I'm your ISL Learning assistant. How can I help you today?", isUser: false }
  ]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const findBestResponse = (query: string) => {
    const results = fuse.search(query.toLowerCase());
    if (results.length > 0) {
      const bestMatch = results[0];
      const matchIndex = parseInt(bestMatch.refIndex?.toString() || '0');
      return knowledgeBase[matchIndex].response;
    }
    return "I'm not sure about that. Could you please rephrase your question or ask something about our ISL learning platform?";
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMessage = { text: inputText, isUser: true };
    const botResponse = { text: findBestResponse(inputText), isUser: false };

    setMessages(prev => [...prev, userMessage, botResponse]);
    setInputText('');
  };

  return (
    <>
      {/* Chatbot toggle button */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="fixed bottom-4 right-4 bg-[#004748] text-white p-4 rounded-full shadow-lg hover:bg-[#003334] transition-colors z-50"
      >
        {isOpen ? <IoClose size={24} /> : <BsChatDots size={24} />}
      </button>

      {/* Chatbot window */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 w-96 h-[500px] bg-white rounded-2xl shadow-xl flex flex-col overflow-hidden z-50">
          {/* Header */}
          <div className="bg-[#004748] text-white p-4 flex items-center gap-2">
            <FaRobot className="text-2xl" />
            <span className="font-semibold">ISL Learning Assistant</span>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.isUser
                      ? 'bg-[#004748] text-white rounded-br-none'
                      : 'bg-gray-100 text-gray-800 rounded-bl-none'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input form */}
          <form onSubmit={handleSend} className="p-4 border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004748]"
              />
              <button
                type="submit"
                className="p-2 bg-[#004748] text-white rounded-lg hover:bg-[#003334] transition-colors"
              >
                <IoMdSend size={20} />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default Chatbot;