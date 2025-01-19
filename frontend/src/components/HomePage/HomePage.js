import React, { useState } from "react";
import { Search, Camera, Mic, Map, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const [menuOpen, setMenuOpen] = useState(false); // State to manage menu visibility
  const navigate = useNavigate();

  // Function to toggle the menu visibility on click
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <div className="min-h-screen bg-white p-4 flex flex-col items-center">
      {/* Hamburger Menu with click-to-toggle functionality */}
      {/* I would like to fix this so it has a hover effect 
        on the hamburger menu before you click it */}
      <div
        className="relative self-start mb-8 hover:shadow-lg"
        id="Menu"
        onClick={toggleMenu}
      >
        {/* Hamburger Icon */}
        <div className="space-y-1.5">
          <div className="w-6 h-0.5 bg-gray-600"></div>
          <div className="w-6 h-0.5 bg-gray-600"></div>
          <div className="w-6 h-0.5 bg-gray-600"></div>
        </div>

        {/* Dropdown Menu */}
        <div
          className={`absolute top-12 left-0 w-40 bg-white shadow-md rounded-md p-2 space-y-2 overflow-hidden border-solid border border-gray-200
            ${menuOpen ? "opacity-100 max-h-[300px]" : "opacity-0 max-h-0"}
            transition-all duration-300 ease-out`}
          onClick={(e) => e.stopPropagation()} // Prevent closing the menu when clicking inside
        >
          <button
            className="w-full text-left text-blue-600 py-2 px-3 rounded-md hover:bg-blue-100 hover:shadow-md transition-all duration-200"
            onClick={() => navigate("/ShoppingCartCheckout")} // just add the path to the page you want to go to
          >
            Shopping Cart
          </button>
          <button
            className="w-full text-left text-blue-600 py-2 px-3 rounded-md hover:bg-blue-100 hover:shadow-md transition-all duration-200"
            onClick={() => navigate("/SomePage2")}
          >
            Option 2
          </button>
          <button
            className="w-full text-left text-blue-600 py-2 px-3 rounded-md hover:bg-blue-100 hover:shadow-md transition-all duration-200"
            onClick={() => navigate("/SomePage3")}
          >
            Option 3
          </button>
        </div>
      </div>

      {/* Logo and Welcome */}
      <div className="w-full max-w-md space-y-4 text-center mb-8">
        <h1 className="text-4xl text-blue-600 font-normal">Capgemini</h1>
        <h2 className="text-3xl text-blue-600 mb-2">Welcome!</h2>
        <p className="text-xl text-blue-400">What can I get started for you?</p>
      </div>

      {/* Search Input */}
      <div className="w-full max-w-md mb-8">
        <div className="relative">
          <Search
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Enter your question"
            className="w-full pl-12 pr-4 py-3 border-2 border-blue-400 rounded-full focus:outline-none focus:border-blue-600"
          />
        </div>
      </div>

      {/* Grid of Options */}
      <div className="grid grid-cols-2 gap-4 w-full max-w-md mb-8">
        <button className="bg-blue-400 text-white p-8 rounded-lg flex flex-col items-center space-y-2">
          <Camera size={24} />
          <span>Image</span>
        </button>
        <button className="bg-blue-400 text-white p-8 rounded-lg flex flex-col items-center space-y-2">
          <Mic size={24} />
          <span>Speak</span>
        </button>
        <button className="bg-blue-400 text-white p-8 rounded-lg flex flex-col items-center space-y-2"
        onClick={() => navigate("/NavigatePage")}>
          <Map size={24} />
          <span>Navigate</span>
        </button>
        <button
          className="bg-blue-400 text-white p-8 rounded-lg flex flex-col items-center space-y-2"
          id="ShoppingList"
          onClick={() => navigate("/SearchShopping")}
        >
          <MapPin size={24} />
          <span>Search</span>
        </button>
      </div>

      {/* View Map Button */}
      <button
        className="w-full max-w-md bg-blue-600 text-white py-4 rounded-full"
        id="Map"
        onClick={() => navigate("/CapMap")}
      >
        View Map
      </button>
    </div>
  );
};

export default HomePage;
