import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X, User } from "lucide-react"; // Import Lucide icons

export default function Header() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  
  // Check if user is logged in on component mount and when coming back to this page
  useEffect(() => {
    checkLoginStatus();
  }, []);
  
  const checkLoginStatus = () => {
    const loggedInUser = localStorage.getItem("userId");
    const storedUserName = localStorage.getItem("userName") || localStorage.getItem("username");
    
    if (loggedInUser) {
      setIsLoggedIn(true);
      setUserName(storedUserName || "User");
    } else {
      setIsLoggedIn(false);
      setUserName("");
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("username");
    setIsLoggedIn(false);
    setUserName("");
    navigate("/");
  };
  
  const menuItems = [
    { label: "Products", href: "/#products" },
    { label: "Just Chatting", href: "/JustChatting" },
    { label: "Cart", href: "/cart" },
    { label: "Contact", href: "#" },
    { label: "Order History", href: "/Order_History"},
    { label: "Dev Page", href: "/DevPage" }
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
                className="text-gray-600 hover:bg-gray-300 px-3 py-1 text-sm font-medium rounded-lg"
              >
                {item.label}
              </a>
            ))}

            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
              {isLoggedIn ? (
                <div className="flex items-center space-x-2">
                  <button
                    className="text-gray-600 hover:bg-slate-300 px-3 py-1 text-sm font-medium rounded-md"
                    onClick={handleLogout}
                  >
                    Sign out
                  </button>
                  <div className="flex items-center gap-2 text-gray-600">
                    <User size={20} />
                    <span className="font-medium">{userName}</span>
                  </div>
                </div>
              ) : (
                <>
                  <button
                    className="text-gray-600 hover:bg-slate-300 px-3 py-1 text-sm font-medium rounded-md"
                    onClick={() => navigate("/LoginPage")}
                  >
                    Sign in
                  </button>
                  <button
                    className="set-user-text text-white px-4 py-2 rounded-md text-sm font-medium custom-hover"
                    onClick={() => navigate("/CreateAccount")}
                  >
                    Register
                  </button>
                </>
              )}
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
                className="text-gray-600 hover:bg-gray-300 px-3 py-2 text-sm font-medium block rounded-lg"
              >
                {item.label}
              </a>
            ))}
            
            {isLoggedIn ? (
              <>
                <div className="flex items-center gap-2 text-gray-600 px-3 py-2">
                  <User size={16} />
                  <span className="font-medium">{userName}</span>
                </div>
                <button
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-300 w-full text-left"
                  onClick={handleLogout}
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <button
                  className="text-gray-600 hover:bg-gray-300 px-3 py-2 text-sm font-medium rounded-lg"
                  onClick={() => navigate("/LoginPage")}
                >
                  Sign in
                </button>
                <button
                  className="set-user-text text-white px-4 py-2 rounded-md text-sm font-medium custom-hover"
                  onClick={() => navigate("/CreateAccount")}
                >
                  Register
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
