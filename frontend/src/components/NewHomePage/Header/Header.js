import React from 'react';
import { useNavigate } from "react-router-dom";



export default function Header() {
    const navigate = useNavigate();
    const menuItems = [
        // { label: 'Products', href: '/Products' },
        { label: 'Products', href: '#products' },
        { label: 'Just Chatting', href: "/JustChatting" },
        { label: 'Cart', href: '/ShoppingCartCheckout' },
        { label: 'Contact', href: '#' }
    ];

    return (
        <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-24 sm:h-32 items-center">
           {/* Logo */}
           <div className="flex-shrink-0 flex items-center">
            <a href="/" className="block h-16 sm:h-32">
            <img src={require('./Capgemini-Logo.png')}
                alt="Capgemini"
                className="h-full w-auto object-contain"
              />
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {menuItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
              >
                {item.label}
              </a>
            ))}
            
            
            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
              <button 
                className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
                onClick={() => navigate("/LoginPage")} 
              >
                Sign in
              </button>
              <button 
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                onClick={() => navigate("/CreateAccount")}
              >
                Register
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}