import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { House, Pin, Send } from "lucide-react";
import axios from "axios";

function JustChatting() {
  const navigate = useNavigate();

  {/*Used for getting promt*/}
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");

  const handleSubmit = async () => {
    try {
      const res = await axios.post("http://localhost:5000/invoke-model", { prompt }); // location of the fastapi server
      setResponse(res.data.generation);
    } catch (error) {
      console.error("Error invoking model:", error);
    }
  };

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
          onClick={() => navigate("/HomePage")}
        >
          <House size={24} />
        </button>
      </div>
      <div className="container relative justify-center align-middle min-h-80 mt-24 w-10/12 bg-slate-200 rounded-2xl">
        <div className="chatbot-popup bg-blue-500 w-auto rounded-t-2xl">

          {/* Chatbot Header*/}
          <div className="chat-header flex text-3xl pb-3 pt-3 ps-3 justify-between">
            <div className="header-info flex justify-center mt-4 mb-4">
              <h2 className="logo-text text-4xl">Test for chatbot</h2>
            </div>
          </div>
        </div>

        {/* Chatbot Body*/}
        <div className="chat-body p-5 h-96 overflow-y-auto flex flex-col"> 
          <div className="message bot-message p-4 break-words whitespace-pre-line flex mt-4 mb-4 bg-slate-300 max-w-48 rounded-tl-2xl rounded-tr-2xl rounded-bl-sm rounded-br-2xl">
            <p className="message-text" placeholder="Hello! Ask questions here!">
              {response}
            </p>
          </div>
          <div className="message user-message flex break-words whitespace-pre-line p-4 mt-4 mb-4 flex-col self-end text-white bg-blue-500 max-w-48 rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl rounded-br-sm">
            <p className="message-text">
              User text here
            </p>
          </div>
        </div>

        {/* Chatbot Footer*/}
        <div className="chat-footer absolute bottom-0 w-full ms-5 mt-10 mb-5">
          <form action="#" className="chat-form flex w-11/12 items-center justify-between border border-blue-300 rounded-full p-2 shadow-sm">
            <input value={prompt} onChange={(e) => setPrompt(e.target.value)} type="text" placeholder="Ask questions here..." className="message-input bg-slate-200 w-full p-1.5" required></input>
            <button onClick={handleSubmit} type="submit" className="material-symbols-rounded bg-blue-500 h-10 w-10 rounded-2xl flex items-center justify-center"><Send size={24} /></button>
          </form>
        </div>
      </div>
     </div>
    </>
    
  );
}

export default JustChatting;