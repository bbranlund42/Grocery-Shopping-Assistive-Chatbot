import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { House, ShoppingCart, Trash2, Minus, Plus } from 'lucide-react';
import axios from 'axios';

const ShoppingCartCheckout = ({onUpdateCart}) => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  //this isProcessing state is used so we dont make double payments or some ish while the current payment is processing, so we use this as a barrier to prevent mistakes during payment
  const [isProcessing, setIsProcessing] = useState(false);
  const [userId, setUserId] = useState('single_user_id');

  useEffect(() => {
    // Get the userId from localStorage when component mounts
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
    }
  }, []);

  const fetchCart = async () => {
    if (!isProcessing) {
      try {
        const response = await axios.get(`http://localhost:4000/cart?userId=${userId}`);
        setCartItems(response.data.items || []);
        setTotal(response.data.total || 0);
        if (onUpdateCart) {
          onUpdateCart(response.data.items || []);
        }
      } catch (error) {
        console.error('Error fetching cart:', error);
      }
    }
  };

  useEffect(() => {
    fetchCart();
    const interval = setInterval(fetchCart, 5000);
    return () => clearInterval(interval);
  }, [isProcessing, userId]);

  const handlePayment = async () => {
    setIsProcessing(true);
    
    try {
      // Check if user is logged in
      if (userId === 'single_user_id') {
        alert('Please log in before checkout');
        navigate('/login');
        return;
      }
      
      // Update inventory
      await axios.post('http://localhost:3500/updateInventory', {
        items: cartItems
      });

      // Save the order to order history BEFORE clearing the cart
      // This is the critical change - save the current cart as a new order
      await axios.post('http://localhost:4800/Order_history', {
        userId: userId,
        Historic_Items: cartItems.map(item => ({
          product_id: item.productId,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          orderDate: new Date()
        }))
      });

      // Clear cart with userId
      await axios.post('http://localhost:4000/cart/clear', { userId });

      // Update local state
      setCartItems([]);
      setTotal(0);
      if (onUpdateCart) {
        onUpdateCart([]);
      }

      alert('Payment successful! Thank you for your purchase.');
      navigate('/');
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('There was an error processing your payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const removeFromCart = async (productId) => {
    if (!isProcessing) {
      try {
        console.log(`Removing product with ID: ${productId}`);
        
        // Using POST as specified in the backend
        const response = await axios.post('http://localhost:4000/cart/remove', { 
          productId,
          userId 
        });
        
        console.log('Response after removal:', response.data);
        
        // Update local state with the updated cart
        setCartItems(response.data.items || []);
        setTotal(response.data.total || 0);
        
        if (onUpdateCart) {
          onUpdateCart(response.data.items || []);
        }
      } catch (error) {
        console.error('Error removing from cart:', error);
        alert('Failed to remove item. Please try again.');
      }
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    if (!isProcessing) {
      try {
        console.log('Updating product:', productId, 'to quantity:', newQuantity);
        console.log('User ID:', userId);
        
        const requestData = {
          productId,
          quantity: newQuantity,
          userId
        };
        console.log('Request data:', requestData);
        
        const response = await axios.post('http://localhost:4000/cart/update', requestData);
        
        console.log('Response:', response.data);
        setCartItems(response.data.items);
        setTotal(response.data.total);
        if (onUpdateCart) {
          onUpdateCart(response.data.items);
        }
      } catch (error) {
        console.error('Error updating quantity:', error);
        console.error('Request that failed:', {
          productId,
          quantity: newQuantity,
          userId
        });
        
        // Try to get more detailed error information
        if (error.response) {
          console.error('Error response:', error.response.status, error.response.data);
        }
      }
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
        <div className="text-blue-400 text-2xl font-medium">Shopping Cart</div>
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
                    <div className="text-sm text-gray-600">${(item.price * ( 1 - item.discount / 100 )).toFixed(2)} per unit</div>
                    <div className="font-bold">${(item.price * item.quantity).toFixed(2)}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-2">
                    <button 
                      className="bg-slate-300 text-white w-6 h-6 rounded-2xl flex items-center justify-center hover:bg-slate-400"
                      onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                    >
                      -
                    </button>
                    <span className="text-lg">{item.quantity}</span>
                    <button 
                      className="bg-slate-300 text-white w-6 h-6 rounded-2xl flex items-center justify-center hover:bg-slate-400"
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                  <button 
                    className="bg-red-400 text-white p-2 rounded-md hover:bg-red-500"
                    onClick={() => removeFromCart(item.productId)}
                    aria-label="Remove item"
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
            className="w-1/2 py-3 border-2 set-user-text rounded-lg text-center font-bold custom-hover text-white"
            disabled={cartItems.length === 0 || isProcessing}
            onClick={handlePayment}
          >
            {isProcessing ? 'Processing...' : 'PAY'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShoppingCartCheckout;
