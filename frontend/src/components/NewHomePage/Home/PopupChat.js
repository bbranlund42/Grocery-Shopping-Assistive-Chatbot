import React, { useState, useRef, useEffect } from "react";
import { Send, X } from "lucide-react";
import axios from "axios";

const PopupChatbot = ({ isTriggered = false, onClose }) => {
  const [chatHistory, setChatHistory] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isInView, setIsInView] = useState(true);
  const [animationState, setAnimationState] = useState('initial');
  const chatBodyRef = useRef(null);
  const inputRef = useRef();

  // Handle the trigger from parent component
  useEffect(() => {
    if (isTriggered && !isVisible) {
      setAnimationState('appearing');
      setTimeout(() => {
        setIsVisible(true);
        setIsOpen(true);
        setAnimationState('visible');
      }, 300); // Animation delay
    }
  }, [isTriggered, isVisible]);

  // Auto-scroll to bottom when new messages appear
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const generateBotResponse = async (history) => {
    // Helper Function to update chat history
    const updateHistory = (text) => {
      setChatHistory(prev => {
        // Remove the "Thinking..." message and add the bot's response
        return prev.filter(msg => msg.text !== "Thinking...").concat({
          role: "model",
          text: text
        });
      });
    };

    try {
      // Convert history to just the text content
      const historyString = history.map(({ text }) => text).join('\n');
      // console.log(historyString);

      // Use Axios to make the POST request to localhost
      const response = await axios.post("http://localhost:5001/invoke-model", {
        prompt: historyString
      });

      // Getting the API response and assigning it to apiResponse
      const apiResponse = response.data.generation;
      
      // These are for Debugging
      // console.log(response)
      //console.log(apiResponse);
      // console.log(typeof apiResponse);

      // Parse only for setting state, but keep the returned value as a string
      let responseJSON;
      if (typeof apiResponse === "string") {
        try {
          responseJSON = JSON.parse(apiResponse);
        } catch (error) {
          console.error("Error parsing JSON:", error);
          console.error("Raw API Response:", apiResponse);
          return apiResponse;  // Return the raw string if parsing fails
        }
      } else {
        responseJSON = apiResponse;  // Already a JSON object
      }

      // Ensure valid structure before updating state
      if (!responseJSON || !responseJSON.products || !responseJSON.answer) {
        console.error("Invalid API response format:", responseJSON);
        return apiResponse;  // Return raw string in case of issues
      }
      // Debugging statement
      // console.log(responseJSON);

      // set table
      // Update the history with the bot's response

      updateHistory(responseJSON.answer);

      // Debugging
      // console.log(typeof responseJSON)
      // console.log(typeof response.data.generation)


      // Assuming the response contains the bot's generation
      return apiResponse;
    } catch (error) {
      console.error("Error invoking model:", error);

      // Update history with an error message if something goes wrong
      updateHistory("Sorry, something went wrong.");

      // Optionally handle or rethrow the error
      throw error;
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, 300); // Animation delay for closing
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const userMessage = inputRef.current.value.trim();
    if (!userMessage) return;
    inputRef.current.value = "";

    // Set isInView to false when first message is sent
    setIsInView(false);

    // Update chat history with the user's message
    setChatHistory((history) => [
      ...history,
      { role: "user", text: userMessage },
    ]);

    // add a "Thinking..." Placeholder for the bots message
    setTimeout(() => {
      setChatHistory((history) => [
        ...history,
        { role: "model", text: "Thinking..." },
      ]);

      // Call the function to generate bot's response
      generateBotResponse([
        ...chatHistory,
        { role: "user", text: userMessage },
      ]);
    }, 600);
  };

  // Chat Message Component
  const ChatMessage = ({ chat }) => {
    return (
      <div
        className={`message ${chat.role === "model" ? "bot" : "user"
          }-message flex break-words whitespace-pre-line p-2 mt-2 mb-2 flex-col max-w-90 rounded-tl-xl rounded-tr-xl ${chat.role === "model"
            ? "self-start bg-slate-300 rounded-br-xl rounded-bl-sm text-black mr-4"
            : "self-end bg-blue-500 rounded-bl-xl rounded-br-sm text-white ml-4"
          }`}
      >
        <p className="message-text ml-2 mr-2 text-sm">{chat.text}</p>
      </div>
    );
  };

  if (!isVisible && animationState === 'initial') return null;

  return (
    <div className={`fixed bottom-4 right-4 z-50 transition-opacity duration-300 ${animationState === 'appearing' ? 'opacity-0 scale-90' : 'opacity-100 scale-100'}`}>
      {/* Chat toggle button */}
      <button 
        onClick={toggleChat}
        className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg flex items-center justify-center transition-transform duration-300 hover:scale-105"
      >
        {isOpen ? <X size={24} /> : (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        )}
      </button>

      {/* Chat window */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 sm:w-96 bg-white rounded-lg shadow-xl overflow-hidden flex flex-col transition-all duration-300 transform origin-bottom-right animate-fade-in h-96">
          {/* Header */}
          <div className="bg-blue-600 text-white p-3 flex justify-between items-center">
            <h3 className="font-medium">Chuck Curtis</h3>
            <button onClick={handleClose} className="text-white hover:text-gray-200">
              <X size={20} />
            </button>
          </div>

          {isInView ? (
            <div className="flex flex-col items-center w-full p-6 h-full justify-center">
              <h1 className="text-xl font-semibold mb-6">What can I help you with?</h1>
              <form
                action="#"
                className="chat-form flex w-full items-center justify-center border bg-slate-200 border-blue-300 rounded-full p-2 shadow-sm"
                onSubmit={handleFormSubmit}
              >
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Ex. Add ingredients for applesauce to my cart"
                  className="message-input bg-slate-200 w-full p-1.5 focus:outline-none"
                  required
                />
                <button className="bg-blue-500 h-8 w-8 rounded-full flex items-center justify-center">
                  <Send size={16} color="white" />
                </button>
              </form>
            </div>
          ) : (
            <>
              {/* Chat body */}
              <div ref={chatBodyRef} className="chat-body p-3 flex-grow overflow-y-auto flex flex-col smooth-scroll">
                <div className="message bot-message p-3 break-words whitespace-pre-line flex mt-2 mb-2 bg-slate-300 max-w-64 rounded-tl-xl rounded-tr-xl rounded-bl-sm rounded-br-xl">
                  <p className="message-text text-sm">
                    Hello, How can I assist you today?
                  </p>
                </div>
                {/* Render the chat history dynamically */}
                {chatHistory.map((chat, index) => (
                  <ChatMessage key={index} chat={chat} />
                ))}
              </div>

              {/* Chat footer */}
              <div className="chat-footer p-2 border-t border-gray-200">
                <form
                  action="#"
                  className="chat-form flex w-full items-center justify-center bg-slate-200 border border-blue-300 rounded-full p-1 shadow-sm"
                  onSubmit={handleFormSubmit}
                >
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Ask questions here..."
                    className="message-input bg-slate-200 w-full p-1.5 px-3 focus:outline-none text-sm"
                    required
                  />
                  <button className="bg-blue-500 h-8 w-8 rounded-full flex items-center justify-center">
                    <Send size={16} color="white" />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default PopupChatbot;