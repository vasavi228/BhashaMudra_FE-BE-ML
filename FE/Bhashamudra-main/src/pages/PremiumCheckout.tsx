import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Diamond, 
  CheckCircle, 
  Shield, 
  ArrowLeft,
  CreditCard,
  PiggyBank,
  Gift,
  LockKeyhole,
  BookOpen,
  MessageSquare,
  Award,
  Brain,
  X
} from 'lucide-react';

function PremiumCheckout() {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    couponCode: ''
  });
  const [discountApplied, setDiscountApplied] = useState(false);

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
  ];

  const plans = [
    {
      id: 'monthly',
      title: 'Monthly',
      price: '₹349',
      period: 'per month',
      features: [
        'All premium features',
        'Cancel anytime',
        'Premium support'
      ]
    },
    {
      id: 'annual',
      title: 'Annual',
      price: '₹2,999',
      period: 'per year',
      discount: 'Save 28%',
      features: [
        'All premium features',
        '2 months free',
        'Priority support'
      ]
    }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleApplyCoupon = () => {
    // Simulate coupon application
    if (formData.couponCode.toLowerCase() === 'first10') {
      setDiscountApplied(true);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      // Store premium status in localStorage
      localStorage.setItem('userPremiumStatus', 'active');
      localStorage.setItem('userPremiumPlan', selectedPlan);
      localStorage.setItem('userPremiumExpiry', selectedPlan === 'monthly' ? 
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : 
        new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      );
      
      setShowSuccessModal(true);
    }, 2000);
  };

  const goToDashboard = () => {
    navigate('/premium/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#98E7DE] to-[#ffe8e1]">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-2xl font-bold text-[#004748]">
                BhashaMudra
              </span>
            </div>
            
            <button 
              className="flex items-center gap-2 text-[#004748] font-medium hover:text-[#004748]/80 transition-colors"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="h-5 w-5" />
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-6 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-4 rounded-full">
                <Diamond className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-[#004748] mb-2">Upgrade to BhashaMudra Premium</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Unlock all premium features and accelerate your sign language journey with advanced learning tools and interactive content.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Plan Selection */}
            <div className="md:col-span-1">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Choose Your Plan</h2>
                
                <div className="space-y-4">
                  {plans.map(plan => (
                    <motion.div
                      key={plan.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`
                        border-2 rounded-xl p-4 cursor-pointer transition-all
                        ${selectedPlan === plan.id ? 'border-amber-500 bg-amber-50/50' : 'border-gray-200'}
                      `}
                      onClick={() => setSelectedPlan(plan.id)}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold text-gray-800">{plan.title}</h3>
                        {plan.discount && (
                          <span className="text-xs font-medium text-white bg-amber-500 px-2 py-1 rounded-full">
                            {plan.discount}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-baseline mb-3">
                        <span className="text-2xl font-bold text-[#004748]">{plan.price}</span>
                        <span className="text-sm text-gray-500 ml-1">{plan.period}</span>
                      </div>
                      
                      <ul className="space-y-2 mb-2">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                            <CheckCircle className="h-4 w-4 text-amber-500" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Premium Features</h2>
                
                <div className="space-y-3">
                  {premiumFeatures.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-2 rounded-lg shrink-0">
                        {feature.icon}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800">{feature.title}</h3>
                        <p className="text-sm text-gray-600">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Payment Form */}
            <div className="md:col-span-2">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Payment Details</h2>
                
                <div className="mb-6">
                  <div className="flex space-x-3 mb-6">
                    <button
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all
                        ${paymentMethod === 'card' ? 'border-amber-500 bg-amber-50/50' : 'border-gray-200'}`}
                      onClick={() => setPaymentMethod('card')}
                    >
                      <CreditCard className={`h-5 w-5 ${paymentMethod === 'card' ? 'text-amber-500' : 'text-gray-500'}`} />
                      <span className={paymentMethod === 'card' ? 'font-medium text-gray-800' : 'text-gray-600'}>Card</span>
                    </button>
                    
                    <button
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all
                        ${paymentMethod === 'upi' ? 'border-amber-500 bg-amber-50/50' : 'border-gray-200'}`}
                      onClick={() => setPaymentMethod('upi')}
                    >
                      <PiggyBank className={`h-5 w-5 ${paymentMethod === 'upi' ? 'text-amber-500' : 'text-gray-500'}`} />
                      <span className={paymentMethod === 'upi' ? 'font-medium text-gray-800' : 'text-gray-600'}>UPI</span>
                    </button>
                  </div>
                  
                  <form onSubmit={handleSubmit}>
                    {paymentMethod === 'card' && (
                      <>
                        <div className="mb-4">
                          <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                          <input
                            id="cardNumber"
                            name="cardNumber"
                            type="text"
                            placeholder="1234 5678 9012 3456"
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#004748] focus:border-transparent"
                            value={formData.cardNumber}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        
                        <div className="mb-4">
                          <label htmlFor="cardName" className="block text-sm font-medium text-gray-700 mb-1">Cardholder Name</label>
                          <input
                            id="cardName"
                            name="cardName"
                            type="text"
                            placeholder="John Doe"
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#004748] focus:border-transparent"
                            value={formData.cardName}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                            <input
                              id="expiryDate"
                              name="expiryDate"
                              type="text"
                              placeholder="MM/YY"
                              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#004748] focus:border-transparent"
                              value={formData.expiryDate}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                            <input
                              id="cvv"
                              name="cvv"
                              type="text"
                              placeholder="123"
                              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#004748] focus:border-transparent"
                              value={formData.cvv}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                        </div>
                      </>
                    )}
                    
                    {paymentMethod === 'upi' && (
                      <div className="mb-4">
                        <label htmlFor="upiId" className="block text-sm font-medium text-gray-700 mb-1">UPI ID</label>
                        <input
                          id="upiId"
                          name="upiId"
                          type="text"
                          placeholder="example@upi"
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#004748] focus:border-transparent"
                          required
                        />
                      </div>
                    )}
                    
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-2">
                        <Gift className="h-5 w-5 text-gray-500" />
                        <label htmlFor="couponCode" className="text-sm font-medium text-gray-700">Have a coupon code?</label>
                      </div>
                      
                      <div className="flex gap-2">
                        <input
                          id="couponCode"
                          name="couponCode"
                          type="text"
                          placeholder="Enter coupon code"
                          className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#004748] focus:border-transparent"
                          value={formData.couponCode}
                          onChange={handleInputChange}
                        />
                        
                        <button
                          type="button"
                          className="px-4 py-3 bg-gray-100 text-gray-800 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                          onClick={handleApplyCoupon}
                        >
                          Apply
                        </button>
                      </div>
                      
                      {discountApplied && (
                        <p className="mt-2 text-sm text-green-600 flex items-center gap-1">
                          <CheckCircle className="h-4 w-4" />
                          10% discount applied successfully!
                        </p>
                      )}
                    </div>
                    
                    <div className="border-t border-gray-200 pt-4 mb-6">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="font-medium text-gray-800">
                          {selectedPlan === 'monthly' ? '₹349' : '₹2,999'}
                        </span>
                      </div>
                      
                      {discountApplied && (
                        <div className="flex justify-between items-center mb-2 text-green-600">
                          <span>Discount (10%)</span>
                          <span>
                            - {selectedPlan === 'monthly' ? '₹35' : '₹299'}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center font-bold text-lg">
                        <span className="text-gray-800">Total</span>
                        <span className="text-[#004748]">
                          {discountApplied
                            ? (selectedPlan === 'monthly' ? '₹314' : '₹2,700')
                            : (selectedPlan === 'monthly' ? '₹349' : '₹2,999')
                          }
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-4">
                      <motion.button
                        type="submit"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="relative overflow-hidden w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white py-4 rounded-xl font-bold shadow-lg flex items-center justify-center"
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                            <span>Processing...</span>
                          </div>
                        ) : (
                          <>
                            <span className="relative z-10">Complete Purchase</span>
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
                          </>
                        )}
                      </motion.button>
                      
                      <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
                        <LockKeyhole className="h-3 w-3" />
                        <span>Secure payment processed by Razorpay</span>
                      </div>
                    </div>
                  </form>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-[#004748] shrink-0 mt-1" />
                    <div>
                      <h3 className="font-medium text-gray-800 mb-1">100% Satisfaction Guarantee</h3>
                      <p className="text-sm text-gray-600">
                        Not satisfied with our premium features? Get a full refund within 7 days of purchase, no questions asked.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-8 shadow-xl max-w-md w-full mx-4 text-center"
            >
              <div className="flex justify-center mb-6">
                <div className="bg-green-100 p-4 rounded-full">
                  <CheckCircle className="h-12 w-12 text-green-600" />
                </div>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Welcome to Premium!</h2>
              
              <p className="text-gray-600 mb-8">
                Your payment was successful. You now have access to all premium features and content on BhashaMudra!
              </p>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full bg-gradient-to-r from-[#004748] to-[#98E7DE] text-white py-4 rounded-xl font-bold shadow-lg"
                onClick={goToDashboard}
              >
                Go to Dashboard
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default PremiumCheckout;