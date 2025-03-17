import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react"; // Import Lucide icons

export default function Header() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const menuItems = [
    { label: "Products", href: "#products" },
    { label: "Just Chatting", href: "/JustChatting" },
    { label: "Cart", href: "/cart" },
    { label: "Contact", href: "#" },
  ];

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between py-2">
          {/* Logo */}
          <div className="flex items-center">
            <a href="/" className="block h-12 sm:h-16">
              <img
                src={require("./Capgemini-Logo3.png")}
                alt="Capgemini"
                className="h-full w-auto object-contain"
              />
            </a>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="sm:hidden text-gray-600"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Navigation Links (Desktop) */}
          <div className="hidden sm:flex items-center gap-4">
            {menuItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-gray-600 hover:text-gray-900 px-3 py-1 text-sm font-medium"
              >
                {item.label}
              </a>
            ))}

            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
              <button
                className="text-gray-600 hover:text-gray-900 px-3 py-1 text-sm font-medium"
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

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="sm:hidden flex flex-col space-y-2 py-2">
            {menuItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium block"
              >
                {item.label}
              </a>
            ))}
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
        )}
      </div>
    </nav>
  );
}
