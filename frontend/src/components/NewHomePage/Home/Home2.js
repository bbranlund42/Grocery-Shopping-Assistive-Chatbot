
{/* Noah Herron: This File was not supposed to be added, it was a temporary file i was testing new stuff on */}
import React, { useState } from 'react';
import Display from '../Display/Display';
import { useNavigate } from "react-router-dom";
import JustChatting from '../../JustChatting/JustChatting';

export default function HomePage() {
    const [showChat, setShowChat] = useState(false);

    return (
        <div className="relative h-screen w-full">
            {/* Conditional Background */}
            <div 
                className={`absolute inset-0 w-full h-full transition-all duration-500 ${showChat ? 'bg-white' : ''}`}
                style={!showChat ? {
                    backgroundImage: 'url("./FoodAI.png")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                } : {}}
            >
                {!showChat && <div className="absolute inset-0 bg-black/30"></div>}
            </div>

            {/* Content Container */}
            {!showChat ? (
                <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
                    <h1 className="text-6xl font-bold text-white mb-4">
                        Make Shopping Easy
                    </h1>
                    <p className="text-2xl text-gray-200 mb-8">
                        Be an Agile Shopper with AI
                    </p>
                    
                    {/* Buttons Container */}
                    <div className="flex gap-4">
                        <button 
                            className="px-6 py-2 bg-white text-gray-900 rounded-md hover:bg-gray-100 transition-colors duration-300"
                            onClick={() => setShowChat(true)}
                        >
                            Start Chatting
                        </button>
                    </div>
                </div>
            ) : (
                <div className="relative w-full h-full flex items-center justify-center">
                    <JustChatting />
                </div>
            )}
      <div>
        <Display />
      </div>
    </div>

  );
};
