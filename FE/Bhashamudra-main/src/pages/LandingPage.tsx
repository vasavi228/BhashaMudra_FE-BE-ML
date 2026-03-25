import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Search, X, MessageCircle, Send, Minimize2, Maximize2 } from 'lucide-react';
import logo from './logo.png';
import namaste from './namaste.png';
import demo from './namaste-VEED.mp4';
import Fuse from 'fuse.js';



// Enhanced chatbot responses
const chatbotResponses = {
  greetings: ["👋 Namaste! I'm your ISL Learning Assistant. How can I help you today?"],
  about_isl: ["Indian Sign Language (ISL) is a complete language with its own grammar and vocabulary."],
  learning_process: ["Our learning process is designed to be intuitive and effective."],
  camera_validation: ["Our AI system analyzes your hand movements in real-time for validation."],
  avatar_demo: ["Our 3D avatar demonstrates ISL signs with detailed hand movements."],
  sentence_translation: ["Our text-to-ISL feature converts typed English/Hindi sentences into ISL demonstrations."],
  progress_tracking: ["Track your ISL mastery through skill progression metrics and achievement badges."],
  cultural_context: ["ISL is deeply connected to Indian culture with regional variations."],
  technical_requirements: ["To use BhashaMudra, you need a camera, internet, and a well-lit space."],
  business_inquiry: ["For business collaborations, please email us at business@bhashamudra.com."],
  accessibility: ["BhashaMudra offers screen reader compatibility, keyboard navigation, and high contrast mode."],
  benefits: ["Learning ISL improves cognitive skills, enhances communication, and bridges communication gaps."],
  pricing: ["BhashaMudra offers free and premium plans starting at ₹349/month."],
  community: ["Join our vibrant ISL learning community to connect with fellow learners."],
  mobile_app: ["Our mobile app is available for iOS and Android with offline learning capabilities."],
  certification: ["Earn recognized ISL proficiency certificates by completing our courses."],
  default: ["I'm here to help you learn ISL! Ask me anything about ISL or our platform."]
};
const categories = [
  { category: 'greetings', keywords: ['hello', 'hi', 'hey', 'greetings', 'namaste', 'welcome', 'start'] },
  { category: 'about_isl', keywords: ['indian sign language', 'explain isl', 'describe isl', 
    'define isl', 'information about isl', 'how does isl work'] },
  { category: 'learning_process', keywords: ['learning', 'process', 'steps', 'begin', 'how to learn', 'lessons', 'course'] },
  { category: 'camera_validation', keywords: ['camera', 'validation', 'feedback', 'tracking', 'assessment'] },
  { category: 'avatar_demo', keywords: ['avatar', 'demonstration', 'demo', 'show', '3d', 'animation', 'tutorial'] },
  { category: 'sentence_translation', keywords: ['sentence', 'translate', 'conversion', 'text to isl', 'english to isl'] },
  { category: 'progress_tracking', keywords: ['progress', 'track', 'improve', 'monitor', 'metrics', 'achievements'] },
  { category: 'cultural_context', keywords: ['culture', 'tradition', 'history', 'custom', 'diversity'] },
  { category: 'technical_requirements', keywords: ['require', 'need', 'technical', 'device', 'hardware', 'software'] },
  { category: 'business_inquiry', keywords: ['business', 'school', 'corporate', 'institute', 'company', 'organization'] },
  { category: 'accessibility', keywords: ['accessible', 'disability', 'screen reader', 'accommodation'] },
  { category: 'benefits', keywords: ['benefits', 'advantages', 'gains', 'value', 'rewards', 'perks'] },
  { category: 'pricing', keywords: ['price', 'cost', 'fee', 'subscription', 'payment', 
    'plan', 'package', 'offer', 'discount', 'trial', 
    'premium', 'pay', 'pricing', 'how much', 'charge', 
    'rate', 'monthly cost', 'yearly cost', 'pricing details'] },
  { category: 'community', keywords: ['community', 'network', 'forum', 'group', 'members', 'social', 'connect'] },
  { category: 'mobile_app', keywords: ['app', 'mobile', 'android', 'ios', 'smartphone', 'tablet', 'download'] },
  { category: 'certification', keywords: ['certificate', 'certification', 'credential', 'qualification', 'award'] }
];

const findResponseWithFuzzy = (query) => {
  console.log(`🔍 Searching for: "${query}"`);

  if (!fuse || !query.trim()) {
    console.log("⚠️ Fuse.js not initialized or query is empty.");
    return chatbotResponses.default[Math.floor(Math.random() * chatbotResponses.default.length)];
  }

  // Try searching for the **full query** first
  let results = fuse.search(query);
  console.log(`📌 Full Query Results:`, results);

  if (results.length > 0) {
    // ✅ If full query matches, return the best category
    const bestMatch = results[0];
    const categoryName = bestMatch.item.category;
    console.log(`✅ Full Query Match: ${categoryName} (Score: ${bestMatch.score})`);

    return chatbotResponses[categoryName][Math.floor(Math.random() * chatbotResponses[categoryName].length)];
  }

  console.log("❌ No full query match. Trying individual words...");

  // Split query into words and search each one
  const words = query.toLowerCase().split(/\s+/);
  let wordMatches = [];

  words.forEach(word => {
    const wordResult = fuse.search(word);
    if (wordResult.length > 0) {
      wordMatches.push(wordResult[0]); // Pick **best match** for each word
    }
  });

  if (wordMatches.length === 0) {
    console.log("❌ No match found for any words.");
    return chatbotResponses.default[Math.floor(Math.random() * chatbotResponses.default.length)];
  }

  // 🏆 Sort matches by score and frequency
  const matchCounts = {};
  wordMatches.forEach(match => {
    const category = match.item.category;
    if (!matchCounts[category]) matchCounts[category] = 0;
    matchCounts[category]++;
  });

  // Pick **the most frequently matched category**
  let bestCategory = Object.keys(matchCounts).reduce((a, b) => matchCounts[a] > matchCounts[b] ? a : b);

  console.log(`🎯 Best Category: ${bestCategory} (Matched ${matchCounts[bestCategory]} times)`);
  return chatbotResponses[bestCategory][Math.floor(Math.random() * chatbotResponses[bestCategory].length)];
};


function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    { type: 'bot', content: chatbotResponses.greetings[0] }
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);
  const [fuse, setFuse] = useState(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const options = { includeScore: true, threshold: 0.6,  minMatchCharLength: 2, keys: ['keyword', 'category'] };
    const keywordsWithCategories = categories.flatMap(category =>
      category.keywords.map(keyword => ({ keyword: keyword, category: category.category }))
    );
    console.log("✅ Fuse.js Keywords Loaded:", keywordsWithCategories);
    setFuse(new Fuse(keywordsWithCategories, options));
    console.log("Fuse.js initialized:", keywordsWithCategories);
  }, []);

  useEffect(() => {
     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const findResponseWithFuzzy = (query) => {
    console.log(`🔍 Searching for: "${query}"`);
  
    if (!fuse || !query.trim()) {
      console.log("⚠️ Fuse.js not initialized or query is empty.");
      return chatbotResponses.default[Math.floor(Math.random() * chatbotResponses.default.length)];
    }
  
    // **Step 1: Try Full Query Match**
    let results = fuse.search(query);
    console.log(`📌 Full Query Results:`, results);
  
    if (results.length > 0) {
      const bestMatch = results[0].item.category;
      console.log(`✅ Full Sentence Match: ${bestMatch}`);
      return chatbotResponses[bestMatch][Math.floor(Math.random() * chatbotResponses[bestMatch].length)];
    }
  
    console.log("❌ No full query match. Trying individual words...");
  
    // **Step 2: Search Each Word Separately**
    const words = query.toLowerCase().split(/\s+/);
    let wordMatches = [];
  
    words.forEach(word => {
      const wordResult = fuse.search(word);
      if (wordResult.length > 0) {
        wordMatches.push(wordResult[0]);  // Pick **best match** for each word
      }
    });
  
    if (wordMatches.length === 0) {
      console.log("❌ No match found for any words.");
      return chatbotResponses.default[Math.floor(Math.random() * chatbotResponses.default.length)];
    }
  
    // **Step 3: Pick Most Commonly Matched Category**
    const matchCounts = {};
    wordMatches.forEach(match => {
      const category = match.item.category;
      if (!matchCounts[category]) matchCounts[category] = 0;
      matchCounts[category]++;
    });
  
    let bestCategory = Object.keys(matchCounts).reduce((a, b) => matchCounts[a] > matchCounts[b] ? a : b);
  
    console.log(`🎯 Best Category: ${bestCategory} (Matched ${matchCounts[bestCategory]} times)`);
    return chatbotResponses[bestCategory][Math.floor(Math.random() * chatbotResponses[bestCategory].length)];
  };
  

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    setMessages(prev => [...prev, { type: 'user', content: inputValue }]);

    setTimeout(() => {
      setMessages(prev => [...prev, { type: 'bot', content: findResponseWithFuzzy(inputValue) }]);
    }, 500);

    setInputValue('');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-[#98E7DE] hover:bg-[#7ac5bb] text-gray-800 rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {isOpen && (
        <div className={`bg-white rounded-lg shadow-xl transition-all duration-300 ${
          isMinimized ? 'h-14' : 'h-[500px]'
        } w-[350px] flex flex-col`}>
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-[#98E7DE]" />
              <h3 className="font-semibold text-gray-800">ISL Learning Assistant</h3>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-gray-500 hover:text-gray-700"
              >
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.type === 'user'
                          ? 'bg-[#98E7DE] text-gray-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <p className="whitespace-pre-line">{message.content}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSubmit} className="p-4 border-t">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Type your question..."
                    className="flex-1 p-2 border rounded-lg focus:outline-none focus:border-[#98E7DE]"
                  />
                  <button
                    type="submit"
                    className="bg-[#98E7DE] text-gray-800 p-2 rounded-lg hover:bg-[#7ac5bb] transition-colors"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function StepCard({ id, step, title, description }) {
  return (
    <div id={id} className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-center transform hover:-translate-y-2">
      <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-[#98E7DE] text-gray-900 mb-6">
        <h4 className="text-2xl font-bold">{step}</h4>
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-4">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}

function FeatureCard({ title, description, icon }) {
  return (
    <div className="flex items-start p-6 bg-gray-50 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
      <div className="text-4xl mr-4">{icon}</div>
      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-600 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function LandingPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  
  const pageContent = [
    { id: 'hero', title: 'Break the Silence', content: 'Connect through gestures with India\'s visual language. Perfect for family members of the deaf community.' },
    { id: 'features', title: 'AI-Powered Learning', content: 'Real-time feedback, personalized lessons, and interactive practice sessions.' },
    { id: 'video', title: 'BhashaMudra Demo', content: 'See how our platform transforms ISL learning through intelligent recognition.' },
    { id: 'process', title: 'Learning Journey', content: 'Sign up, practice with AI feedback, connect with the community.' },
    { id: 'step1', title: 'Personalized Learning Path', content: 'Take an assessment and get a custom learning plan based on your goals.' },
    { id: 'step2', title: 'Interactive Practice', content: 'Get instant feedback on your signing technique from our AI coach.' },
    { id: 'step3', title: 'Real Conversations', content: 'Practice in simulated scenarios and connect with native signers.' },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    
    const results = pageContent.filter(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    console.log("Search results:", results);
    setSearchResults(results);
    setShowResults(true);

    
  };
  
  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
  };
  
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.search-container') && !e.target.closest('.search-results')) {
        setShowResults(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const scrollToSection = (id) => {
    console.log(`Attempting to scroll to: ${id}`);
    const element = document.getElementById(id);
    console.log(`Element found:`, element);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      clearSearch();
    } else {
      console.warn(`Element with ID ${id} not found`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#98E7DE] to-[#ffe8e1]">
      {/* Hero Section */}
      <header>
        <nav className="container mx-auto px-7 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={logo} alt="BhashaMudra Logo" className="h-20 w-40.5" />
          </div>
          <div className="hidden md:flex items-center space-x-8 text-gray-800">
            {/* Search Bar */}
            <div className="relative search-container">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => { if (searchResults.length > 0) setShowResults(true) }}
                  placeholder="Find what you need..."
                  className="px-4 py-2 pr-10 rounded-full border border-gray-300 focus:outline-none focus:border-[#98E7DE] w-64"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-12 top-1/2 transform -translate-y-1/2"
                  >
                    <X className="h-4 w-4 text-gray-500 hover:text-gray-700" />
                  </button>
                )}
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <Search className="h-5 w-5 text-gray-500 hover:text-gray-700" />
                </button>
              </form>
              
              {/* Search Results Dropdown */}
              {showResults && searchResults.length > 0 && (
                <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-lg z-10 search-results">
                  <ul className="py-2">
                    {searchResults.map((result) => (
                      <li key={result.id} className="px-4 py-2 hover:bg-gray-100 cursor-pointer" onClick={(e) => {
                        e.stopPropagation(); // Stop event from bubbling up
                        scrollToSection(result.id);
                      }}>
                        <div className="font-medium">{result.title}</div>
                        <div className="text-sm text-gray-600 truncate">{result.content}</div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div> 
            <a href="#features" className="hover:text-[#98E7DE] transition-colors duration-300">Features</a>
            <a href="#about" className="hover:text-[#98E7DE] transition-colors duration-300">About</a>
            <a href="#contact" className="hover:text-[#98E7DE] transition-colors duration-300">Contact</a>
            <button 
              onClick={() => navigate('/signin')}
              className="bg-white text-gray-900 px-6 py-2 rounded-full font-semibold hover:bg-[#98E7DE] transition-colors duration-300 shadow-sm hover:shadow"
            >
              Sign In
            </button>
          </div>
        </nav>

        <div id="hero" className="container mx-auto px-9 py-20 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-16 md:mb-0">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-800 leading-tight mb-6">
              Break the Silence with <span className="text-[#41928a]">Indian Sign Language</span>
            </h1>
            <p className="text-gray-700 text-xl mb-8 leading-relaxed">
              Whether you have a deaf family member or want to make the world more inclusive, BhashaMudra makes ISL Learning accessible to <b>everyone</b>.
            </p>
            <button 
              onClick={() => navigate('/signup')}
              className="bg-white text-gray-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-[#98E7DE] transition-colors duration-300 inline-flex items-center gap-2 shadow-md hover:shadow-lg transform hover:-translate-y-1"
            >
              Begin Your Journey
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <div className="rounded-2xl overflow-hidden transform hover:scale-105 transition-transform duration-500">
              <img src={namaste} alt="Namaste sign animation" height="150" />
            </div>
          </div>
        </div>
      </header>

      {/* Demo Video Section */}
      <section id="video" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">
            Experience the Magic of Connection
          </h2>
          <div className="max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300">
            <video 
              controls
              className="w-full"
              poster="/api/placeholder/800/450"
            >
              <source src={demo} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="process" className="py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-6">
            The BhashaMudra Method
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <StepCard 
              id="step1"
              step="01" 
              title="Sign Up & Set Goals" 
              description="Begin your journey by setting clear learning objectives and understanding your current ISL proficiency level." 
            />
            <StepCard 
              id="step2"
              step="02" 
              title="Learn Through Real-Time Practice" 
              description="Practice with our AI-powered system that provides instant feedback on your signing technique." 
            />
            <StepCard 
              id="step3"
              step="03" 
              title="Apply and Connect" 
              description="Put your skills to practice in real-world scenarios and connect with the ISL community." 
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            Why BhashaMudra Stands Apart
          </h2>
          
          <div className="grid md:grid-cols-2 gap-12">
            <FeatureCard 
              title="Indian Sign Language Focus" 
              description="Built specifically for ISL with its unique grammar, expressions, and cultural nuances that reflect India's rich diversity."
              icon="🇮🇳" 
            />
            <FeatureCard 
              title="Real-time Feedback" 
              description="Our advanced AI system provides instant feedback on your signing technique, ensuring proper form and progression."
              icon="⚡" 
            />
            <FeatureCard 
              title="Interactive Avatar" 
              description="Learn from our detailed 3D avatar that demonstrates precise hand movements, expressions, and signing techniques."
              icon="🎯" 
            />
            <FeatureCard 
              title="Text to ISL" 
              description="Convert written text into ISL demonstrations, bridging the gap between written and signed communication."
              icon="💫" 
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contact" className="py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-black mb-4">
            Your Hands Have Stories to Tell
          </h2>
          <p className="max-w-2xl mx-auto text-gray-700 mb-8">
            Join thousands of Indians who are discovering the profound connection that happens when words become visible.
          </p>
          <button 
            onClick={() => navigate('/signup')}
            className="bg-white text-gray-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-[#D1D2DE] transition-all duration-300 inline-flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            Start Signing Today
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-semibold text-lg mb-4">BhashaMudra</h3>
              <p className="text-gray-400">Bridging worlds through the language of hands.</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="/blog" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
                <li><a href="/resources" className="text-gray-400 hover:text-white transition-colors">Resources</a></li>
                <li><a href="/faq" className="text-gray-400 hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-4">Contact</h3>
              <p className="text-gray-400">contact@bhashamudra.com</p>
              <div className="flex space-x-4 mt-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Twitter</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Instagram</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">LinkedIn</a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <p>© 2025 BhashaMudra. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Chatbot */}
      <Chatbot />
    </div>
  );
}

export default LandingPage;