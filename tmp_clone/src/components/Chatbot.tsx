import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, User, Bot, Heart, Activity, Thermometer, Droplets, Moon, Sun, Footprints, Apple, Dumbbell } from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'bot';
  text: string;
  timestamp: string;
}

const healthTips = [
  { icon: Heart, title: 'Heart Health', tip: 'Aim for at least 30 minutes of moderate exercise daily. Brisk walking, cycling, or swimming are excellent choices for cardiovascular health.' },
  { icon: Apple, title: 'Nutrition', tip: 'Include colorful vegetables and fruits in every meal. Aim for 5 servings daily. Reduce processed sugar and salt intake.' },
  { icon: Dumbbell, title: 'Exercise', tip: 'Combine aerobic exercises with strength training twice a week. Start slow and gradually increase intensity.' },
  { icon: Moon, title: 'Sleep', tip: 'Adults need 7-9 hours of quality sleep. Maintain a consistent sleep schedule and avoid screens 1 hour before bed.' },
  { icon: Droplets, title: 'Hydration', tip: 'Drink at least 8 glasses (2 liters) of water daily. Increase intake during hot weather or physical activity.' },
  { icon: Sun, title: 'Vitamin D', tip: 'Get 15-20 minutes of morning sunlight exposure. Vitamin D is essential for bone health and immune function.' },
  { icon: Footprints, title: 'Physical Activity', tip: 'Take the stairs instead of elevators. Aim for 10,000 steps daily. Small movements add up!' },
  { icon: Thermometer, title: 'Temperature Awareness', tip: 'Monitor body temperature during illness. Seek medical attention if fever exceeds 103°F (39.4°C) or persists beyond 3 days.' },
  { icon: Activity, title: 'Stress Management', tip: 'Practice deep breathing exercises, meditation, or yoga for 10-15 minutes daily to reduce stress and anxiety.' },
];

const getBotResponse = (input: string): string => {
  const lower = input.toLowerCase();
  
  if (lower.includes('heart') || lower.includes('cardio') || lower.includes('blood pressure')) {
    return 'For heart health: Maintain a diet low in saturated fats and sodium. Regular aerobic exercise (30 min/day) is essential. Monitor your blood pressure regularly. Avoid smoking and limit alcohol. Note: For medication advice, please consult your doctor.';
  }
  if (lower.includes('diabetes') || lower.includes('sugar') || lower.includes('glucose')) {
    return 'For diabetes management: Eat low glycemic index foods (whole grains, legumes, vegetables). Monitor blood sugar levels as advised. Maintain healthy weight through diet and exercise. Stay hydrated. Note: Never adjust insulin or medication without consulting your doctor.';
  }
  if (lower.includes('diet') || lower.includes('food') || lower.includes('eat') || lower.includes('nutrition')) {
    return 'Healthy eating tips: Eat a rainbow of vegetables and fruits daily. Choose whole grains over refined carbs. Include lean proteins (fish, poultry, legumes). Limit processed foods, sugar, and salt. Eat smaller, frequent meals. Note: For personalized diet plans, consult a registered dietitian.';
  }
  if (lower.includes('exercise') || lower.includes('workout') || lower.includes('fitness') || lower.includes('gym')) {
    return 'Exercise recommendations: Aim for 150 minutes of moderate aerobic activity per week. Include strength training twice weekly. Start with low impact exercises (walking, swimming) if you have joint issues. Always warm up before and cool down after exercise. Note: If you have a medical condition, get clearance from your doctor before starting a new exercise program.';
  }
  if (lower.includes('sleep') || lower.includes('insomnia') || lower.includes('tired')) {
    return 'Sleep hygiene tips: Maintain a consistent sleep schedule. Create a dark, quiet, cool bedroom environment. Avoid caffeine after 2 PM. Limit screen time 1 hour before bed. Try relaxation techniques like reading or meditation. Note: Persistent sleep issues should be discussed with your doctor.';
  }
  if (lower.includes('stress') || lower.includes('anxiety') || lower.includes('depression') || lower.includes('mental')) {
    return 'Mental wellness tips: Practice mindfulness or meditation daily. Maintain social connections with friends and family. Take regular breaks from work. Engage in hobbies you enjoy. Get adequate sleep and exercise. Note: If you experience persistent anxiety or depression, please seek professional mental health support.';
  }
  if (lower.includes('cold') || lower.includes('flu') || lower.includes('fever') || lower.includes('cough')) {
    return 'General wellness for cold/flu: Rest adequately and stay hydrated. Drink warm fluids like herbal tea or soup. Use a humidifier to ease congestion. Wash hands frequently. Note: If symptoms worsen, fever exceeds 103°F, or persist beyond a week, consult your doctor immediately.';
  }
  if (lower.includes('medicine') || lower.includes('medication') || lower.includes('pill') || lower.includes('drug') || lower.includes('tablet')) {
    return 'I cannot provide medication advice as I am not a medical professional. Please consult your doctor or pharmacist for any questions about medications, dosages, side effects, or drug interactions. Never start, stop, or change medication without professional guidance.';
  }
  if (lower.includes('pain') || lower.includes('ache') || lower.includes('hurt')) {
    return 'For general discomfort: Rest the affected area. Apply ice for acute pain (first 48 hours) or heat for chronic stiffness. Gentle stretching may help. Stay hydrated. Note: Severe, sudden, or persistent pain requires immediate medical attention. Please consult your doctor.';
  }
  if (lower.includes('water') || lower.includes('hydrate') || lower.includes('drink')) {
    return 'Hydration tips: Drink at least 8 glasses (2 liters) of water daily. Increase intake during exercise, hot weather, or illness. Limit sugary drinks and excessive caffeine. Eat water-rich foods like cucumber, watermelon, and oranges.';
  }
  if (lower.includes('weight') || lower.includes('obese') || lower.includes('fat') || lower.includes('bmi')) {
    return 'Healthy weight management: Focus on portion control and nutrient-dense foods. Combine cardio with strength training. Aim for gradual weight loss (0.5-1 kg/week). Track your progress. Note: For personalized weight management plans, consult your doctor or a registered dietitian.';
  }
  if (lower.includes('skin') || lower.includes('acne') || lower.includes('rash')) {
    return 'Skin health tips: Stay hydrated and eat antioxidant-rich foods. Protect skin from sun with SPF 30+. Maintain a gentle skincare routine. Avoid touching your face frequently. Note: Persistent skin issues should be evaluated by a dermatologist.';
  }
  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
    return 'Hello! I am your UDHRS Health Assistant. I can provide general health tips, lifestyle recommendations, and wellness advice. Remember, I cannot prescribe medications or replace your doctor. How can I help you today?';
  }
  if (lower.includes('thank')) {
    return "You're welcome! Stay healthy and remember to follow up with your doctor for any medical concerns. Take care!";
  }
  if (lower.includes('bye') || lower.includes('goodbye')) {
    return 'Goodbye! Take care of your health. Remember to follow your doctor\'s advice and maintain a healthy lifestyle!';
  }
  
  return "I'm here to help with general health and wellness tips. You can ask me about diet, exercise, sleep, stress management, or general precautions for various health conditions. However, I cannot provide medical diagnoses or medication advice - please consult your doctor for those. What would you like to know?";
};

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'bot',
      text: 'Hello! I am your UDHRS Health Assistant. I can suggest health precautions, lifestyle tips, and wellness advice. I cannot prescribe medicines - please consult your doctor for medical advice. How can I help you today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [showTips, setShowTips] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setShowTips(false);
    
    // Simulate bot thinking
    setTimeout(() => {
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        text: getBotResponse(userMsg.text),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, botMsg]);
    }, 800);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTipClick = (tip: string) => {
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: tip,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, userMsg]);
    setShowTips(false);
    
    setTimeout(() => {
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        text: getBotResponse(tip),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, botMsg]);
    }, 800);
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full shadow-xl shadow-emerald-500/30 flex items-center justify-center text-white hover:scale-110 transition-transform z-40"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[380px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-3rem)] bg-white rounded-2xl shadow-2xl shadow-slate-300/50 border border-slate-200 flex flex-col z-50 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">UDHRS Health Assistant</h3>
                <p className="text-[10px] text-emerald-100">General wellness tips & precautions</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.role === 'user' ? 'bg-blue-100' : 'bg-emerald-100'
                }`}>
                  {msg.role === 'user' ? (
                    <User className="w-3.5 h-3.5 text-blue-600" />
                  ) : (
                    <Bot className="w-3.5 h-3.5 text-emerald-600" />
                  )}
                </div>
                <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-sm'
                    : 'bg-slate-100 text-slate-700 rounded-tl-sm'
                }`}>
                  {msg.text}
                  <div className={`text-[9px] mt-1 ${msg.role === 'user' ? 'text-blue-200' : 'text-slate-400'}`}>
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Quick Tips */}
            {showTips && (
              <div className="mt-2">
                <p className="text-[10px] text-slate-400 mb-2">Quick health tips:</p>
                <div className="grid grid-cols-3 gap-1.5">
                  {healthTips.slice(0, 6).map((tip, i) => {
                    const Icon = tip.icon;
                    return (
                      <button
                        key={i}
                        onClick={() => handleTipClick(tip.title)}
                        className="bg-slate-50 hover:bg-emerald-50 border border-slate-100 hover:border-emerald-200 rounded-lg p-2 text-center transition-all"
                      >
                        <Icon className="w-3.5 h-3.5 text-emerald-500 mx-auto mb-1" />
                        <span className="text-[9px] text-slate-600 font-medium">{tip.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-3 py-3 border-t border-slate-100 flex-shrink-0">
            <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about health tips..."
                className="flex-1 bg-transparent text-xs text-slate-700 placeholder-slate-400 focus:outline-none"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="p-1.5 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-40 disabled:hover:bg-emerald-500 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-[9px] text-slate-400 mt-1.5 text-center">
              I cannot prescribe medicines. Consult your doctor for medical advice.
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
