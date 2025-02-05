import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { House, Pin, Send, Bot } from "lucide-react";
import axios from "axios";

function JustChatting() {
  const [chatHistory, setChatHistory] = useState([]);
  const navigate = useNavigate();

  {
    /*Used for getting promt*/
  }
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");

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
    }

    try {
      // Convert history to just the text content
      const historyString = history.map(({ text }) => text).join('\n');
      console.log(historyString);

      // Use Axios to make the POST request to localhost
      const response = await axios.post("http://localhost:5001/invoke-model", {
        prompt: historyString
      });

      // Getting the API response and assigning it to apiResponse
      const apiResponse = response.data.generation;

      //console.log(apiResponse);

      // Update the history with the bot's response
      updateHistory(apiResponse);

      // Assuming the response contains the bot's generation
      return response.data.generation;
    } catch (error) {
      console.error("Error invoking model:", error);

      // Update history with an error message if something goes wrong
      updateHistory("Sorry, something went wrong.");

      // Optionally handle or rethrow the error
      throw error;
    }
  };

  // Chat Message
  const ChatMessage = ({ chat }) => {
    return (
      <div
        className={`message ${chat.role === "model" ? "bot" : "user"
          }-message flex break-words whitespace-pre-line p-2 mt-2 mb-2 flex-col ${chat.role === "model"
            ? "self-start bg-slate-300 text-black"
            : "self-end bg-blue-500 text-white"
          } max-w-48 rounded-tl-xl rounded-tr-xl ${chat.role === "model"
            ? "rounded-br-xl rounded-bl-sm"
            : "rounded-bl-xl rounded-br-sm"
          }`}
      >
        {chat.role === "model" && <Bot />}
        <p className="message-text">{chat.text}</p>
      </div>
    );
  };

  // ChatForm
  const ChatForm = ({ chatHistory, setChatHistory, generateBotResponse }) => {
    const inputRef = useRef();

    const handleFormSubmit = (e) => {
      e.preventDefault();
      const userMessage = inputRef.current.value.trim();
      if (!userMessage) return;
      inputRef.current.value = "";

      // Update chat history with the user's message
      setChatHistory((history) => [
        ...history,
        { role: "user", text: userMessage },
      ]);
      // console.log(userMessage);

      // add a "Thinking..." Placeholder for the bots message
      setTimeout(() => {
        setChatHistory((history) => [
          ...history,
          { role: "model", text: "Thinking..." },
        ]);

        // Call the functoin to generate bot's response
        generateBotResponse([
          ...chatHistory,
          { role: "user", text: userMessage },
        ]);
      }, 600);
    };

    return (
      <form
        action="#"
        className="chat-form flex w-10/12 items-center justify-center border border-blue-300 rounded-full p-2 shadow-sm"
        onSubmit={handleFormSubmit}
      >
        <input
          ref={inputRef}
          type="text"
          placeholder="Ask questions here..."
          className="message-input bg-slate-200 w-full p-1.5"
          required
        ></input>
        <button className="material-symbols-rounded bg-blue-500 h-10 w-10 rounded-2xl flex items-center justify-center">
          <Send size={24} />
        </button>
      </form>
    );
  };

  const handleSubmit = async () => {
    try {
      const res = await axios.post("http://localhost:5001/invoke-model", {
        prompt,
      }); // location of the fastapi server
      setResponse(res.data.generation);
    } catch (error) {
      console.error("Error invoking model:", error);
    }
  };

  // chat body reference to update the scroll/ auto snap
  const chatBodyRef = useRef(null);
  
  // auto snap to the bottom of the chat body
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [chatHistory]);

  return (
    <>
      <div className="bg-white min-h-screen flex flex-col items-center">
        {/* Header */}
        <div className="w-full flex items-center justify-between p-4 bg-blue-100">
          <button
            className="bg-blue-500 text-white w-8 h-8 flex items-center justify-center rounded-full"
            onClick={() => navigate(-1)}
          >
            ⬅
          </button>
          <button
            className="bg-blue-500 text-white w-10 h-10 flex items-center justify-center rounded fixed top-4 right-4"
            onClick={() => navigate("/")}
          >
            <House size={24} />
          </button>
        </div>
        <div className="container flex flex-col relative justify-center align-middle min-h-80 mt-24 w-10/12 bg-slate-200 rounded-2xl">
          <div className="chatbot-popup bg-blue-500 w-auto rounded-t-2xl">
            {/* Chatbot Header*/}
            <div className="chat-header flex text-3xl pb-3 pt-3 ps-3 justify-between">
              <div className="header-info flex justify-center mt-4 mb-4">
                <h2 className="logo-text text-4xl">Test for chatbot</h2>
              </div>
            </div>
          </div>

          {/* Chatbot Body*/}
          <div ref={chatBodyRef} className="chat-body p-5 h-96 overflow-y-auto flex flex-col smooth-scroll">
            <div className="message bot-message p-4 break-words whitespace-pre-line flex mt-4 mb-4 bg-slate-300 max-w-48 rounded-tl-2xl rounded-tr-2xl rounded-bl-sm rounded-br-2xl">
              <Bot />
              <p
                className="message-text"
                placeholder="Hello! Ask questions here!"
              >
                Hello, How can I assist you today?
              </p>
            </div>
            {/*Render the chat history dynamically*/}
            {chatHistory.map((chat, index) => (
              <ChatMessage key={index} chat={chat} />
            ))}
          </div>

          {/* Chatbot Footer*/}
          <div className="chat-footer fixed justify-center items-center bottom-0 w-full ms-1 mt-10 mb-5">
            <ChatForm
              chatHistory={chatHistory}
              setChatHistory={setChatHistory}
              generateBotResponse={generateBotResponse}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default JustChatting;
