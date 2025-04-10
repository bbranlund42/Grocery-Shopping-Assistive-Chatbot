import React,{useState} from 'react'
import Display from '../Display/Display';
//import { useNavigate } from "react-router-dom";
import PopupChatbot from './PopupChat';

export default function HomePage() {
    //const navigate = useNavigate();
    const [showChatbot, setShowChatbot] = useState(false);
    const handleStartChatting = () => {
      setShowChatbot(true);
    };

  return (
    <div className="relative h-screen w-full">
      {/* Background Image */}
      <div 
        className="absolute top-0 w-full h-1/2"
        style={{
          backgroundImage: 'url("./FoodAI.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Overlay to improve text readability */}
        <div className="absolute inset-0 bg-black/30"></div>
      </div>
      {/* Content Container */}
      <div className="relative h-1/2 flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-4xl font-bold text-white mb-2">
          Make Shopping Easy
        </h1>
        <p className="text-2xl text-gray-200 mb-8">
          Be An Agile Shopper with AI
        </p>
        
        {/* Buttons Container */}
        <div className="flex gap-4">
          <button 
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-300"
            onClick={handleStartChatting} >
            Start Chatting
          </button>
        </div>
      </div>

      {/* Animated Chatbot */}
      <PopupChatbot
        isTriggered={showChatbot}
        onClose={() => setShowChatbot(false)}
        />

      <Display />
    </div>
  );
};

