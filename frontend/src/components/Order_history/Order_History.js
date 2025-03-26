import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { House } from 'lucide-react';
import axios from 'axios';

const OrderHistory = () => {
  const navigate = useNavigate();
  const [orderHistory, setOrderHistory] = useState([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchPreviousItems = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('http://localhost:4800/Order_history');
        
        console.log('Raw response:', response.data); // Debug log
        
        // Multiple levels of fallback for different possible response structures
        const historicItems = 
          response.data.Historic_Items || 
          response.data.items || 
          response.data || 
          [];
        
        // Flatten and filter items, ensuring each item has required properties
        const flattenedItems = historicItems.flatMap(order => 
          Array.isArray(order.items) ? order.items : 
          Array.isArray(order) ? order : 
          [order]
        ).filter(item => 
          item && 
          typeof item.price === 'number' && 
          typeof item.quantity === 'number' &&
          item.name
        );
        
        console.log('Processed items:', flattenedItems); // Debug log
        
        setOrderHistory(flattenedItems);
        
        // Calculate total with additional safety checks
        const cartTotal = flattenedItems.reduce(
          (sum, item) => sum + (item.price || 0) * (item.quantity || 0), 
          0
        );
        
        setTotal(cartTotal);
        setError(null);
      } catch (error) {
        console.error('Error fetching previous items:', error);
        setError('Failed to load order history. Please try again later.');
        setOrderHistory([]);
        setTotal(0);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPreviousItems();
  }, []);
  
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
        <div className="text-blue-600 text-2xl font-medium">Order History</div>
        <button
          className="bg-blue-400 text-white w-10 h-10 flex items-center justify-center rounded"
          onClick={() => navigate("/")}
        >
          <House size={24} />
        </button>
      </div>

      {/* Order History Container */}
      <div className="w-full max-w-md border border-blue-200 rounded-lg p-4 mx-4">
        {isLoading ? (
          <div className="text-center py-8">Loading order history...</div>
        ) : error ? (
          <div className="text-center text-red-500 py-8">{error}</div>
        ) : (
          <>
            {/* Order Items */}
            <div className="space-y-4">
              {orderHistory.length === 0 ? (
                <div className="text-center text-gray-500 py-8">No order history found</div>
              ) : (
                orderHistory.map((item, index) => (
                  <div key={`${item.product_id || index}`} className="flex items-center justify-between bg-gray-100 rounded-lg p-3">
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
                        <div className="text-sm text-gray-600">${(item.price || 0).toFixed(2)} per unit</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="text-lg font-medium bg-blue-100 px-3 py-1 rounded-full">
                        Qty: {item.quantity || 0}
                      </div>
                      {item.orderDate && (
                        <div className="ml-2 text-sm text-gray-500">
                          {new Date(item.orderDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {/* Order Total */}
            {orderHistory.length > 0 && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="font-bold text-xl text-center">
                  Total Order Value: ${total.toFixed(2)}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;