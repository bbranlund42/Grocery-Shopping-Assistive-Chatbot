import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { House, ShoppingCart, Trash2 } from 'lucide-react';
import axios from 'axios';

const ShoppingCartCheckout = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);

  
  useEffect(() => {
    const fetchCart = async () => {
      try {
        //retrieves the cart in the /cart route
        const response = await axios.get('http://localhost:3000/cart');
        setCartItems(response.data.items || []);
        setTotal(response.data.total || 0);
      } catch (error) {
        console.error('Error fetching cart:', error);
      }
    };

    fetchCart();
  }, []);

  //this remove the items from the cart
  const removeFromCart = async (productId) => {
    try {
      const response = await axios.post('http://localhost:3000/cart/remove', { 
        productId, 
        quantity: 1 
      });
      
      setCartItems(response.data.items);
      setTotal(response.data.total);
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  return (
    <div className="bg-white min-h-screen flex flex-col items-center">
      {/* Header */}
      <div className="w-full flex items-center justify-between p-4">
        <button
          className="bg-blue-400 text-white w-10 h-10 flex items-center justify-center rounded-full"
          onClick={() => navigate(-1)}
        >
          ⬅
        </button>
        <div className="text-blue-600 text-2xl font-medium">Shopping Cart</div>
        <button
          className="bg-blue-400 text-white w-10 h-10 flex items-center justify-center rounded"
          onClick={() => navigate("/HomePage")}
        >
          <House size={24} />
        </button>
      </div>

      {/* Cart Container */}
      <div className="w-full max-w-md border border-blue-200 rounded-lg p-4 mx-4">
        {/* Cart Items */}
        <div className="space-y-4">
          {cartItems.length === 0 ? (
            <div className="text-center text-gray-500">Your cart is empty</div>
          ) : (
            cartItems.map((item) => (
              <div key={item.productId} className="flex items-center justify-between bg-gray-100 rounded-lg p-2">
                <div className="flex items-center space-x-3">
                  <div className="w-16 h-16 bg-red-500 rounded-lg overflow-hidden">
                    <img
                      src="/api/placeholder/64/64"
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-gray-600">${item.price.toFixed(2)} per unit</div>
                    <div className="font-bold">${(item.price * item.quantity).toFixed(2)}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="text-lg">{item.quantity}</div>
                  <button 
                    className="bg-red-400 text-white p-2 rounded"
                    onClick={() => removeFromCart(item.productId)}
                  >
                    <Trash2 size={24} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
  
        {/* Total and Pay Button */}
        <div className="mt-4 flex justify-between items-center">
          <div className="font-bold text-xl">Total: ${total.toFixed(2)}</div>
          <button 
            className="w-1/2 py-3 border-2 border-black rounded-lg text-center font-bold"
            disabled={cartItems.length === 0}
          >
            PAY
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShoppingCartCheckout;