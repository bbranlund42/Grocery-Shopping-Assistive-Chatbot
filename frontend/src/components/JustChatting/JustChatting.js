// CHAT HISTORY ADDED
// CHAT HISTORY ADDED
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { House, Pin, Send, Bot } from "lucide-react";
import axios from "axios";
import Header from "../NewHomePage/Header/Header";
import MyTableforSuggest from "../JustChatting/TableforChat";

function JustChatting() {
  const [chatHistory, setChatHistory] = useState([]);
  const [fullHistory, setFullHistory] = useState([]); // Store complete history for context
  const [productData, setProductData] = useState([]);
  const [tableVersion, setTableVersion] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState("1111"); // Using your default user ID from backend
  const navigate = useNavigate();
  const MAX_DISPLAYED_MESSAGES = 10; // Maximum number of messages to display
  const MAX_CONTEXT_MESSAGES = 5; // Number of previous messages to include for context

  // Used for getting prompt
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [isInView, setIsInView] = useState(true);

  // Fetch user chat history when component mounts
  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        // Fetch chat history for this user using the existing endpoint
        const historyResponse = await axios.get(`http://localhost:5001/chat-history/${userId}`);
        
        if (historyResponse.data && historyResponse.data.messages && historyResponse.data.messages.length > 0) {
          // If user has chat history, set it and change view state
          
          // Process the messages to extract answer from JSON if needed
          const processedMessages = historyResponse.data.messages.map(message => {
            if (message.role === "model" && typeof message.text === "string") {
              try {
                const jsonObj = JSON.parse(message.text);
                if (jsonObj && jsonObj.answer) {
                  return { ...message, text: jsonObj.answer };
                }
              } catch (e) {
                // Not JSON or doesn't have answer field, use as is
              }
            }
            return message;
          });
          
          // Store the full processed history
          setFullHistory(processedMessages);
          
          // Get only the last MAX_DISPLAYED_MESSAGES for display
          const limitedMessages = processedMessages.slice(-MAX_DISPLAYED_MESSAGES);
          
          setChatHistory(limitedMessages);
          setIsInView(false);
        }
      } catch (error) {
        console.error("Error fetching chat history:", error);
        // If error occurs or no history found, we'll just start with empty chat history
      } finally {
        setIsLoading(false);
      }
    };

    fetchChatHistory();
  }, [userId]);

  const generateBotResponse = async (history) => {
    // Helper Function to update chat history
    const updateHistory = (text, rawResponse) => {
      // Extract just the answer portion
      let responseText = text;
      if (typeof rawResponse === "string") {
        try {
          const jsonObj = JSON.parse(rawResponse);
          if (jsonObj && jsonObj.answer) {
            responseText = jsonObj.answer;
          }
        } catch (e) {
          // Not valid JSON or doesn't have answer field, use as is
        }
      } else if (rawResponse && rawResponse.answer) {
        responseText = rawResponse.answer;
      }
      
      // Update both histories
      setChatHistory(prev => {
        // Remove the "Thinking..." message
        const filteredHistory = prev.filter(msg => msg.text !== "Thinking...");
        
        const newDisplayHistory = [...filteredHistory, {
          role: "model",
          text: responseText
        }];
        
        // Limit the display chat history
        return newDisplayHistory.slice(-MAX_DISPLAYED_MESSAGES);
      });
      
      setFullHistory(prev => {
        // Remove any "Thinking..." message
        const filteredHistory = prev.filter(msg => msg.text !== "Thinking...");
        
        const newFullHistory = [...filteredHistory, {
          role: "model",
          text: responseText
        }];
        
        return newFullHistory;
      });
    }

    try {
      // Get the last user message
      const lastUserMessage = history.filter(msg => msg.role === "user").pop().text;
      
      // Create context from recent conversation history
      // Get the last few messages for context (excluding the most recent user message)
      const contextMessages = fullHistory.slice(-MAX_CONTEXT_MESSAGES);
      
      // Format context as a string with clear role labels
      const contextString = contextMessages.map(msg => 
        `${msg.role === 'user' ? 'Customer' : 'Bot'}: ${msg.text}`
      ).join('\n');
      
      // Combine context with the current question
      const promptWithContext = `Previous conversation:\n${contextString}\n\nCustomer: ${lastUserMessage}\n\nBot:`;
      
      // Use Axios to make the POST request with context
      const response = await axios.post("http://localhost:5001/invoke-model", {
        prompt: promptWithContext
      });

      // Getting the API response and assigning it to apiResponse
      const apiResponse = response.data.generation;

      setTableVersion(prev => prev + 1);
      
      // Parse only for setting state, but keep the returned value as a string
      let responseJSON;
      if (typeof apiResponse === "string") {
        try {
          responseJSON = JSON.parse(apiResponse);
        } catch (error) {
          console.error("Error parsing JSON:", error);
          console.error("Raw API Response:", apiResponse);
          updateHistory(apiResponse, apiResponse);
          return apiResponse;  // Return the raw string if parsing fails
        }
      } else {
        responseJSON = apiResponse;  // Already a JSON object
      }

      // Ensure valid structure before updating state
      if (!responseJSON || !responseJSON.products || !responseJSON.answer) {
        console.error("Invalid API response format:", responseJSON);
        updateHistory(apiResponse, apiResponse);
        return apiResponse;  // Return raw string in case of issues
      }

      // Set table data
      setProductData(responseJSON.products);
      
      // Update the history with just the bot's answer, not the full JSON
      updateHistory(responseJSON.answer, apiResponse);

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

  // Chat Message
  const ChatMessage = ({ chat }) => {
    return (
      <div
        className={`message ${chat.role === "model" ? "bot" : "user"
          }-message flex break-words whitespace-pre-line p-2 mt-2 mb-2 flex-col max-w-90 rounded-tl-xl rounded-tr-xl ${chat.role === "model"
            ? "self-start bg-slate-300 rounded-br-xl rounded-bl-sm text-black mr-20"
            : "self-end bg-blue-500 rounded-bl-xl rounded-br-sm text-white ml-20"
          }`}
      >
        {chat.role === "model"}
        <p className="message-text ml-3 mr-3">{chat.text}</p>
      </div>
    );
  };

  // ChatForm
  const ChatForm = ({ chatHistory, setChatHistory, generateBotResponse, setIsInView }) => {
    const inputRef = useRef();

    const handleFormSubmit = (e) => {
      e.preventDefault();
      const userMessage = inputRef.current.value.trim();
      if (!userMessage) return;
      inputRef.current.value = "";

      // Set isInView to false when first message is sent
      setIsInView(false);

      // Update both histories with the user's message
      setChatHistory((history) => {
        const newHistory = [...history, { role: "user", text: userMessage }];
        return newHistory.slice(-MAX_DISPLAYED_MESSAGES);
      });
      
      setFullHistory((history) => {
        return [...history, { role: "user", text: userMessage }];
      });

      // add a "Thinking..." Placeholder for the bots message
      setTimeout(() => {
        setChatHistory((history) => {
          const newHistory = [...history, { role: "model", text: "Thinking..." }];
          return newHistory.slice(-MAX_DISPLAYED_MESSAGES);
        });

        // Call the function to generate bot's response using full history for context
        generateBotResponse([
          ...fullHistory,
          { role: "user", text: userMessage },
        ]);
      }, 600);
    };

    return (
      <form
        action="#"
        className="chat-form flex w-10/12 items-center justify-center border bg-slate-200 border-blue-300 rounded-full p-2 shadow-sm"
        onSubmit={handleFormSubmit}
      >
        <input
          ref={inputRef}
          type="text"
          placeholder={isInView ? "Ex. Add ingredients for applesauce to my cart" : "Ask questions here..."}
          className={`message-input ${isInView ? 'bg-slate-200' : 'bg-slate-200'} w-full p-1.5 focus:outline-none`}
          required
        ></input>
        <button className="material-symbols-rounded bg-blue-500 h-10 w-10 rounded-2xl flex items-center justify-center">
          <Send size={24} color={isInView ? 'white' : 'white'}/>
        </button>
      </form>
    );
  };

  // Chat body reference to update the scroll/auto snap
  const chatBodyRef = useRef(null);

  // Auto snap to the bottom of the chat body
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
            {/* Chatbot Body*/}
            <div ref={chatBodyRef} className="chat-body p-3 h-96 overflow-y-auto flex flex-col smooth-scroll">
              {chatHistory.length === 0 ? (
                <div className="message bot-message p-4 break-words whitespace-pre-line flex mt-4 mb-4 bg-slate-300 max-w-48 rounded-tl-2xl rounded-tr-2xl rounded-bl-sm rounded-br-2xl">
                  <p className="message-text">
                    Hello, How can I assist you today?
                  </p>
                </div>
              ) : (
                <>
                  {/*Render the chat history dynamically*/}
                  {chatHistory.map((chat, index) => (
                    <ChatMessage key={index} chat={chat} />
                  ))}
                </>
              )}
            </div>

            {/* Chatbot Footer*/}
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






// import React, { useState, useRef, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { House, Pin, Send, Bot } from "lucide-react";
// import axios from "axios";
// import Header from "../NewHomePage/Header/Header";
// import MyTableforSuggest from "../JustChatting/TableforChat";

// function JustChatting() {
//   const [chatHistory, setChatHistory] = useState([]);
//   const [productData, setProductData] = useState([]);
//   const [tableVersion, setTableVersion] = useState(0);
//   const navigate = useNavigate();

//   {
//     /*Used for getting promt*/
//   }
//   const [prompt, setPrompt] = useState("");
//   const [response, setResponse] = useState("");
//   const [isInView, setIsInView] = useState(true);

//   const generateBotResponse = async (history) => {
//     // Helper Function to update chat history
//     const updateHistory = (text) => {
//       setChatHistory(prev => {
//         // Remove the "Thinking..." message and add the bot's response
//         return prev.filter(msg => msg.text !== "Thinking...").concat({
//           role: "model",
//           text: text
//         });
//       });
//     }

//     try {
//       // Convert history to just the text content
//       const historyString = history.map(({ text }) => text).join('\n');
//       // console.log(historyString);

//       // Use Axios to make the POST request to localhost
//       const response = await axios.post("http://localhost:5001/invoke-model", {
//         prompt: historyString
//       });

//       // Getting the API response and assigning it to apiResponse
//       const apiResponse = response.data.generation;

//       setTableVersion(prev => prev + 1);
      
//       // These are for Debugging
//       // console.log(response)
//       //console.log(apiResponse);
//       // console.log(typeof apiResponse);

//       // Parse only for setting state, but keep the returned value as a string
//       let responseJSON;
//       if (typeof apiResponse === "string") {
//         try {
//           responseJSON = JSON.parse(apiResponse);
//         } catch (error) {
//           console.error("Error parsing JSON:", error);
//           console.error("Raw API Response:", apiResponse);
//           return apiResponse;  // Return the raw string if parsing fails
//         }
//       } else {
//         responseJSON = apiResponse;  // Already a JSON object
//       }

//       // Ensure valid structure before updating state
//       if (!responseJSON || !responseJSON.products || !responseJSON.answer) {
//         console.error("Invalid API response format:", responseJSON);
//         return apiResponse;  // Return raw string in case of issues
//       }
//       // Debugging statement
//       // console.log(responseJSON);

//       // set table
//       // Update the history with the bot's response

//       setProductData(responseJSON.products);
//       updateHistory(responseJSON.answer);

//       // Debugging
//       // console.log(typeof responseJSON)
//       // console.log(typeof response.data.generation)


//       // Assuming the response contains the bot's generation
//       return apiResponse;
//     } catch (error) {
//       console.error("Error invoking model:", error);

//       // Update history with an error message if something goes wrong
//       updateHistory("Sorry, something went wrong.");

//       // Optionally handle or rethrow the error
//       throw error;
//     }
//   };

//   // Chat Message
//   const ChatMessage = ({ chat }) => {
//     return (
//       <div
//         className={`message ${chat.role === "model" ? "bot" : "user"
//           }-message flex break-words whitespace-pre-line p-2 mt-2 mb-2 flex-col max-w-90 rounded-tl-xl rounded-tr-xl ${chat.role === "model"
//             ? "self-start bg-slate-300 rounded-br-xl rounded-bl-sm text-black mr-20"
//             : "self-end bg-blue-500 rounded-bl-xl rounded-br-sm text-white ml-20"
//           }`}
//       >
//         {chat.role === "model"}
//         <p className="message-text ml-3 mr-3">{chat.text}</p>
//       </div>
//     );
//   };

//   // ChatForm
//   const ChatForm = ({ chatHistory, setChatHistory, generateBotResponse, setIsInView }) => {
//     const inputRef = useRef();

//     const handleFormSubmit = (e) => {
//       e.preventDefault();
//       const userMessage = inputRef.current.value.trim();
//       if (!userMessage) return;
//       inputRef.current.value = "";

//       // Set isInView to false when first message is sent
//       setIsInView(false);

//       // Update chat history with the user's message
//       setChatHistory((history) => [
//         ...history,
//         { role: "user", text: userMessage },
//       ]);
//       // console.log(userMessage);

//       // add a "Thinking..." Placeholder for the bots message
//       setTimeout(() => {
//         setChatHistory((history) => [
//           ...history,
//           { role: "model", text: "Thinking..." },
//         ]);

//         // Call the functoin to generate bot's response
//         generateBotResponse([
//           ...chatHistory,
//           { role: "user", text: userMessage },
//         ]);
//       }, 600);
//     };

//     return (
//       <form
//         action="#"
//         className="chat-form flex w-10/12 items-center justify-center border bg-slate-200 border-blue-300 rounded-full p-2 shadow-sm"
//         onSubmit={handleFormSubmit}
//       >
//         <input
//           ref={inputRef}
//           type="text"
//           placeholder={isInView ? "Ex. Add ingredients for applesauce to my cart" : "Ask questions here..."}
//           className={`message-input ${isInView ? 'bg-slate-200' : 'bg-slate-200'} w-full p-1.5 focus:outline-none`}
//           required
//         ></input>
//         <button className="material-symbols-rounded bg-blue-500 h-10 w-10 rounded-2xl flex items-center justify-center">
//           <Send size={24} color={isInView ? 'white' : 'white'}/>
//         </button>
//       </form>
//     );
//   };

//   const handleSubmit = async () => {
//     try {
//       const res = await axios.post("http://localhost:5001/invoke-model", {
//         prompt,
//       }); // location of the fastapi server
//       setResponse(res.data.generation);
//     } catch (error) {
//       console.error("Error invoking model:", error);
//     }
//   };

//   // chat body reference to update the scroll/ auto snap
//   const chatBodyRef = useRef(null);

//   // auto snap to the bottom of the chat body
//   useEffect(() => {
//     if (chatBodyRef.current) {
//       chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
//     }
//   }, [chatHistory]);

//   return (
//     <div className="bg-white min-h-screen flex flex-col items-center">
//       <Header />
//       <div className="container flex flex-col relative justify-center align-middle min-h-80 mt-24 w-10/12 bg-white rounded-2xl">
//         {isInView ? (
//           <div className="flex flex-col items-center w-full p-8">
//             <h1 className="text-2xl font-semibold mb-8">What can I help you with?</h1>
//             <ChatForm
//               chatHistory={chatHistory}
//               setChatHistory={setChatHistory}
//               generateBotResponse={generateBotResponse}
//               setIsInView={setIsInView}
//             />
//           </div>
//         ) : (
//           <>
//             {/* Chatbot Body*/}
//             <div ref={chatBodyRef} className="chat-body p-3 h-96 overflow-y-auto flex flex-col smooth-scroll">
//               <div className="message bot-message p-4 break-words whitespace-pre-line flex mt-4 mb-4 bg-slate-300 max-w-48 rounded-tl-2xl rounded-tr-2xl rounded-bl-sm rounded-br-2xl">
//                 <p
//                   className="message-text"
//                   placeholder="Hello! Ask questions here!"
//                 >
//                   Hello, How can I assist you today?
//                 </p>
//               </div>
//               {/*Render the chat history dynamically*/}
//               {chatHistory.map((chat, index) => (
//                 <ChatMessage key={index} chat={chat} />
//               ))}
//             </div>

//             {/* Chatbot Footer*/}
//             <div className="flex chat-footer justify-center items-center bottom-0 w-full mt-5 mb-5">
//               <ChatForm
//                 chatHistory={chatHistory}
//                 setChatHistory={setChatHistory}
//                 generateBotResponse={generateBotResponse}
//                 setIsInView={setIsInView}
//               />
//             </div>
//             <MyTableforSuggest 
//             key={`product-table-${tableVersion}`}
//             products={productData}/>
//           </>
//         )}
//       </div>
//     </div>

//   );
// }

// export default JustChatting;