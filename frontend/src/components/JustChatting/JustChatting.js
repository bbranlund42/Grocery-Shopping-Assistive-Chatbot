import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { House, Pin, Send, Bot } from "lucide-react";
import axios from "axios";
import Header from "../NewHomePage/Header/Header";
import MyTableforSuggest from "../JustChatting/TableforChat";

function JustChatting() {
  const [chatHistory, setChatHistory] = useState([]);
  const [fullChatHistory, setFullChatHistory] = useState([]);
  const [productData, setProductData] = useState([]);
  const [tableVersion, setTableVersion] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState("1111");
  const navigate = useNavigate();
  const MAX_DISPLAYED_MESSAGES = 10;

  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [isInView, setIsInView] = useState(true);

  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const historyResponse = await axios.get(`http://localhost:5001/chat-history/${userId}`);

        if (historyResponse.data?.messages?.length > 0) {
          const processedMessages = historyResponse.data.messages.map(message => {
            if (message.role === "model" && typeof message.text === "string") {
              try {
                const jsonObj = JSON.parse(message.text);
                if (jsonObj?.answer) {
                  return { ...message, text: jsonObj.answer };
                }
              } catch (e) {}
            }
            return message;
          });

          const lastMessages = processedMessages.slice(-MAX_DISPLAYED_MESSAGES);

          setFullChatHistory(processedMessages);
          setChatHistory(lastMessages);
          setIsInView(false);
        } else {
          setChatHistory([]);
        }
      } catch (error) {
        console.error("Error fetching chat history:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChatHistory();
  }, [userId]);

  const generateBotResponse = async (history) => {
    const updateHistory = (text, rawResponse) => {
      setChatHistory(prev => {
        const filteredHistory = prev.filter(msg => msg.text !== "Thinking...");

        let responseText = text;
        if (typeof rawResponse === "string") {
          try {
            const jsonObj = JSON.parse(rawResponse);
            if (jsonObj && jsonObj.answer) {
              responseText = jsonObj.answer;
            }
          } catch (e) {}
        } else if (rawResponse && rawResponse.answer) {
          responseText = rawResponse.answer;
        }

        const newEntry = { role: "model", text: responseText };
        setFullChatHistory(prev => [...prev.filter(msg => msg.text !== "Thinking..."), newEntry]);

        return [...filteredHistory, newEntry].slice(-MAX_DISPLAYED_MESSAGES);
      });
    };

    try {
      const lastUserMessage = history.filter(msg => msg.role === "user").pop().text;

      const response = await axios.post("http://localhost:5001/invoke-model", {
        prompt: lastUserMessage
      });

      const apiResponse = response.data.generation;
      setTableVersion(prev => prev + 1);

      let responseJSON;
      if (typeof apiResponse === "string") {
        try {
          responseJSON = JSON.parse(apiResponse);
        } catch (error) {
          updateHistory(apiResponse, apiResponse);
          return apiResponse;
        }
      } else {
        responseJSON = apiResponse;
      }

      if (!responseJSON || !responseJSON.products || !responseJSON.answer) {
        updateHistory(apiResponse, apiResponse);
        return apiResponse;
      }

      setProductData(responseJSON.products);
      updateHistory(responseJSON.answer, apiResponse);

      return apiResponse;
    } catch (error) {
      updateHistory("Sorry, something went wrong.");
      throw error;
    }
  };

  const ChatMessage = ({ chat }) => {
    return (
      <div
        className={`message ${chat.role === "model" ? "bot" : "user"}-message flex break-words whitespace-pre-line p-2 mt-2 mb-2 flex-col max-w-90 rounded-tl-xl rounded-tr-xl ${chat.role === "model"
          ? "self-start bg-slate-300 rounded-br-xl rounded-bl-sm text-black mr-20"
          : "self-end bg-blue-500 rounded-bl-xl rounded-br-sm text-white ml-20"}`}
      >
        <p className="message-text ml-3 mr-3">{chat.text}</p>
      </div>
    );
  };

  const ChatForm = ({ chatHistory, setChatHistory, generateBotResponse, setIsInView }) => {
    const inputRef = useRef();

    const handleFormSubmit = (e) => {
      e.preventDefault();
      const userMessage = inputRef.current.value.trim();
      if (!userMessage) return;
      inputRef.current.value = "";
      setIsInView(false);

      const userEntry = { role: "user", text: userMessage };
      setChatHistory(prev => [...prev, userEntry]);
      setFullChatHistory(prev => [...prev, userEntry]);

      setTimeout(() => {
        const thinkingEntry = { role: "model", text: "Thinking..." };
        setChatHistory(prev => [...prev, thinkingEntry]);
        setFullChatHistory(prev => [...prev, thinkingEntry]);

        generateBotResponse([...fullChatHistory, userEntry]);
      }, 600);
    };

    return (
      <form
        className="chat-form flex w-10/12 items-center justify-center border bg-slate-200 border-blue-300 rounded-full p-2 shadow-sm"
        onSubmit={handleFormSubmit}
      >
        <input
          ref={inputRef}
          type="text"
          placeholder={isInView ? "Ex. Add ingredients for applesauce to my cart" : "Ask questions here..."}
          className="message-input bg-slate-200 w-full p-1.5 focus:outline-none"
          required
        />
        <button className="material-symbols-rounded bg-blue-500 h-10 w-10 rounded-2xl flex items-center justify-center">
          <Send size={24} color="white" />
        </button>
      </form>
    );
  };

  const chatBodyRef = useRef(null);

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [chatHistory]);

  if (isLoading) {
    return (
      <div className="bg-white min-h-screen flex flex-col items-center justify-center">
        <p>Loading your conversation...</p>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen flex flex-col items-center">
      <Header />
      <div className="container flex flex-col relative justify-center align-middle min-h-80 mt-24 w-10/12 bg-white rounded-2xl">
        {isInView ? (
          <div className="flex flex-col items-center w-full p-8">
            <h1 className="text-2xl font-semibold mb-8">What can I help you with?</h1>
            <ChatForm
              chatHistory={chatHistory}
              setChatHistory={setChatHistory}
              generateBotResponse={generateBotResponse}
              setIsInView={setIsInView}
            />
          </div>
        ) : (
          <>
            <div ref={chatBodyRef} className="chat-body p-3 h-96 overflow-y-auto flex flex-col smooth-scroll">
              {chatHistory.length === 0 ? (
                <div className="message bot-message p-4 break-words whitespace-pre-line flex mt-4 mb-4 bg-slate-300 max-w-48 rounded-tl-2xl rounded-tr-2xl rounded-bl-sm rounded-br-2xl">
                  <p className="message-text">Hello, How can I assist you today?</p>
                </div>
              ) : (
                chatHistory.map((chat, index) => (
                  <ChatMessage key={index} chat={chat} />
                ))
              )}
            </div>

            <div className="flex chat-footer justify-center items-center bottom-0 w-full mt-5 mb-5">
              <ChatForm
                chatHistory={chatHistory}
                setChatHistory={setChatHistory}
                generateBotResponse={generateBotResponse}
                setIsInView={setIsInView}
              />
            </div>

            <MyTableforSuggest 
              key={`product-table-${tableVersion}`}
              products={productData}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default JustChatting;