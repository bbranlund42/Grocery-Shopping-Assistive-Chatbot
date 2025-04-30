import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { House } from 'lucide-react';
import axios from 'axios';
import Header from '../NewHomePage/Header/Header';

const OrderHistory = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    // Get the userId from localStorage when component mounts
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
    } else {
      // Default for development/testing
      setUserId('single_user_id');
    }
  }, []);

  // Function to repurchase items from a previous order
  const repurchaseItems = async (items) => {
    try {
      // Add items to cart
      for (const item of items) {
        await axios.post('http://localhost:4000/cart/add', {
          productId: item.product_id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          userId: userId
        });
      }
      
      // Navigate to cart after adding items
      alert('Items added to cart!');
      navigate('/cart');
    } catch (error) {
      console.error('Error repurchasing items:', error);
      alert('Failed to add items to cart. Please try again.');
    }
  };

  useEffect(() => {
    // Only fetch if userId is available
    if (!userId) return;
    
    const fetchOrderHistory = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`http://localhost:4800/Order_history?userId=${userId}`);
        
        console.log('Raw response data:', response.data);
        
        // Handle the order history data structure properly
        if (response.data && response.data.Historic_Items) {
          setOrders(response.data.Historic_Items);
        } else {
          setOrders([]);
        }
        
        setError(null);
      } catch (error) {
        console.error('Error fetching order history:', error);
        setError('Failed to load order history. Please try again later.');
        setOrders([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrderHistory();
  }, [userId]); // Only re-run if userId changes
  
  //debuggin wats in oders
  useEffect(() => {
    console.log('Current orders state:', orders);
  }, [orders]);

  return (
    <div className="bg-white min-h-screen flex flex-col items-center">
      <Header />
      {/* Order History Container */}
      <div className="w-full max-w-md p-4 mx-4">
        {isLoading ? (
          <div className="text-center py-8">Loading order history...</div>
        ) : error ? (
          <div className="text-center text-red-500 py-8">{error}</div>
        ) : (
          <div className="space-y-6">
            {orders.length === 0 ? (
              <div className="text-center text-gray-500 py-8">No order history found</div>
            ) : (
              orders.map((order, orderIndex) => (
                <div key={order._id || orderIndex} className="border border-blue-200 rounded-lg overflow-hidden">
                  {/* Order Header */}
                  <div className="bg-blue-50 p-3 border-b border-blue-200">
                    <div className="font-semibold">
                      Order #{(order._id || '').substring((order._id || '').length - 6) || orderIndex + 1}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(order.createdAt || Date.now()).toLocaleDateString()}
                    </div>
                  </div>
                  
                  {/* Order Items */}
                  <div className="divide-y divide-gray-100">
                    {(order.items && Array.isArray(order.items)) ? order.items.map((item, index) => (
                      <div key={`${item.product_id || index}`} className="flex items-center justify-between p-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden">
                            <img
                              src="/api/placeholder/48/48"
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <div className="font-medium">{item.name}</div>
                            <div className="text-sm text-gray-600">${(item.price || 0).toFixed(2)} per unit</div>
                          </div>
                        </div>
                        <div className="text-lg font-medium bg-blue-100 px-3 py-1 rounded-full">
                          Qty: {item.quantity || 0}
                        </div>
                      </div>
                    )) : <div className="p-3 text-gray-500">No items in this order</div>}
                  </div>
                  
                  {/* Order Total and Repurchase Button */}
                  <div className="p-3 bg-blue-50 border-t border-blue-200 flex justify-between items-center">
                    <div className="font-bold">
                      Total: ${(order.totalAmount || 0).toFixed(2)}
                    </div>
                    <button 
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-600"
                      onClick={() => repurchaseItems(order.items || [])}
                    >
                      Repurchase Order
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;