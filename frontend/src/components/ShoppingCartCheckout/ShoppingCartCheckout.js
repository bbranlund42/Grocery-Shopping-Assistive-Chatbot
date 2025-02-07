import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { House, ShoppingCart, Trash2, Minus, Plus } from 'lucide-react';
import axios from 'axios';

const ShoppingCartCheckout = ({onUpdateCart}) => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  
    const fetchCart = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:4000/cart');

        setCartItems(response.data.items || []);
        setTotal(response.data.total || 0);

        if (onUpdateCart) {
          onUpdateCart(response.data.items || []);
        }
      } catch (error) {
        console.error('Error fetching cart:', error);
        setError('Error loading cart. Please try again.');
        console.error('Error fetching cart:', error);
      } finally {
        setLoading(false);
      }


    };

  useEffect(() => {
    fetchCart();

    const interval = setInterval(fetchCart, 5000);
    return () => clearInterval(interval);
  }, []);

  //this remove the items from the cart
  const removeFromCart = async (productId) => {
    try {
      const response = await axios.post('http://localhost:4000/cart/remove', { productId });
      
      setCartItems(response.data.items);
      setTotal(response.data.total);
      if (onUpdateCart) {
        onUpdateCart(response.data.items);
      }
    } catch (error) {
      setError('Error removing item. Please try again.');
      console.error('Error removing item:', error);
    }
  };
  // update quantity
  const updateQuantity = async (productId, newQuantity) => {
    try {
      const response = await axios.post('http://localhost:4000/cart/update', {
        productId,
        quantity: newQuantity
      });
      
      setCartItems(response.data.items);
      setTotal(response.data.total);
      if (onUpdateCart) {
        onUpdateCart(response.data.items);
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
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
          onClick={() => navigate("/")}
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
                  <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
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
                  <div className="flex items-center space-x-2">
                    <button 
                      className="bg-blue-400 text-white w-6 h-6 rounded flex items-center justify-center"
                      onClick={() => updateQuantity(item.productId, Math.max(0, item.quantity - 1))}
                    >
                      -
                    </button>
                    <span className="text-lg">{item.quantity}</span>
                    <button 
                      className="bg-blue-400 text-white w-6 h-6 rounded flex items-center justify-center"
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
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