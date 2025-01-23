import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { House, Pin } from "lucide-react";

function NavigatePage() {
  const navigate = useNavigate();

  return (
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

      {/* Search Container */}
      <div className="w-full max-w-md flex flex-col items-center my-4">
        <div className="flex items-center border border-blue-300 rounded-full p-2 shadow-sm w-full">
        <Pin size={24} />
          <input
            type="text"
            placeholder="are there apples in the store?"
            className="flex-grow ml-2 border-none outline-none"
          />
        </div>
      </div>
      <img src={require('../CapMap/CapMap.png')} width="500"/>
    </div>

  );
}

export default NavigatePage;