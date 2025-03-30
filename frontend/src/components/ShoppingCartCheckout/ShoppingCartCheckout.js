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

  const fetchCart = async () => {
    if (!isProcessing) {
      const response = await axios.get('http://localhost:4000/cart');
      setCartItems(response.data.items || []);
      setTotal(response.data.total || 0);
      if (onUpdateCart) {
        onUpdateCart(response.data.items || []);
      }
    }
  };

  useEffect(() => {
    fetchCart();
    const interval = setInterval(fetchCart, 5000);
    return () => clearInterval(interval);
  }, [isProcessing]);

  const handlePayment = async () => {
    setIsProcessing(true);
    
    // Update inventory
    await axios.post('http://localhost:3500/updateInventory', {
     //sets items to items in the cart, hence "cartItems" and send its to update inventory functions
      items: cartItems
    });

    // this calls the clear endpoint to reset the users cart after they pay
    await axios.post('http://localhost:4000/cart/clear');

    // Update local state
    setCartItems([]);
    setTotal(0);
    if (onUpdateCart) {
      onUpdateCart([]);
    }

    alert('Payment successful! Thank you for your purchase.');
    navigate('/');
  };

  const removeFromCart = async (productId) => {
    if (!isProcessing) {
      const response = await axios.post('http://localhost:4000/cart/remove', { productId });
      setCartItems(response.data.items);
      setTotal(response.data.total);
      if (onUpdateCart) {
        onUpdateCart(response.data.items);
      }
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    if (!isProcessing) {
      const response = await axios.post('http://localhost:4000/cart/update', {
        productId,
        quantity: newQuantity
      });
      
      setCartItems(response.data.items);
      setTotal(response.data.total);
      if (onUpdateCart) {
        onUpdateCart(response.data.items);
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
                      src={item.name}
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
                      className="bg-slate-300 text-black w-6 h-6 rounded-xl flex items-center justify-center hover:bg-slate-400"
                      onClick={() => updateQuantity(item.productId, Math.max(0, item.quantity - 1))}
                    >
                      -
                    </button>
                    <span className="text-lg">{item.quantity}</span>
                    <button 
                      className="bg-slate-300 text-black w-6 h-6 rounded-xl flex items-center justify-center hover:bg-slate-400"
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                  <button 
                    className="bg-red-400 text-white p-2 rounded hover:bg-red-500"
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
            className="w-1/2 py-3 border-2 bg-blue-600 rounded-xl text-center text-white font-bold hover:bg-blue-800"
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