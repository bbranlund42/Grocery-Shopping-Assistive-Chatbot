import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import axios from "axios";

const LoginPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError("");
    
    if (username.trim() === '') {
      setError("Please enter a valid username");
      return;
    }

    if (!password) {
      setError("Please enter your password");
      return;
    }
  
    try {
      // Update the port to 5000 where your User service is running
      const response = await axios.post("http://localhost:5000/login", {
        // Change the field name from 'username' to 'email' to match your backend
        email: username,
        password
      });
  
      // Update to match your backend response structure
      if (response.data.userId) {
        // Save user information in localStorage
        localStorage.setItem("userId", response.data.userId);
        localStorage.setItem("username", username); // Store the username/email
        
        console.log("Login successful, user ID:", response.data.userId);
        navigate("/");
      } else {
        setError("Invalid username or password");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Login failed. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-6 rounded shadow-md w-80">
        <div className="text-center mb-4">
          <img src={require('./Capgemini-Logo.png')} alt="Capgemini" /> 
        </div>
        
        {error && (
          <div className="p-3 mb-4 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSignIn}>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              E-mail/Username
            </label>
            <input
              type="text"
              id="email"
              placeholder="E-mail/Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div className="flex items-center justify-between mb-4">
            <label className="flex items-center text-sm">
              <input
                type="checkbox"
                id="remember"
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <span className="ml-2">Remember me</span>
            </label>
            <a href="/" className="text-sm text-blue-500 hover:underline">
              Forgot Password?
            </a>
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-500 text-white font-medium rounded-md hover:bg-blue-600"
          >
            Sign in
          </button>
        </form>
        <p className="mt-4 text-sm text-center">
          Click{" "}
          <a href="/CreateAccount" className="text-blue-500 hover:underline">
            here
          </a>{" "}
          to create an account
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
