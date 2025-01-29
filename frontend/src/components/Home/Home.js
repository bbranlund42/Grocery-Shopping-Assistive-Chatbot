import React from 'react'
import Display from '../Display/Display';
import { useNavigate } from "react-router-dom";

export default function HomePage() {
    const navigate = useNavigate();
  return (
    <div className="relative h-screen w-full">
      {/* Background Image */}
      <div 
        className="absolute inset-0 w-full h-full"
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
      <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-6xl font-bold text-white mb-4">
          Make Shopping Easy
        </h1>
        <p className="text-2xl text-gray-200 mb-8">
          Be An Aglige Shopper
        </p>
        
        {/* Buttons Container */}
        <div className="flex gap-4">
          <button 
            className="px-6 py-2 bg-white text-gray-900 rounded-md hover:bg-gray-100 transition-colors duration-300"
            onClick={() => navigate("/JustChatting")} >
            Just Chatting
          </button>
        </div>
      </div>

      <Display />
    </div>
  );
};

