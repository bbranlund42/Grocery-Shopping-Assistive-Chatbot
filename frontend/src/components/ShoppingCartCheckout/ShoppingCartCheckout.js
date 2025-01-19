import React from 'react';
import { useNavigate } from 'react-router-dom';
import { House, ShoppingCart } from 'lucide-react';

const ShoppingCartCheckout = () => {
  const navigate = useNavigate();

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
        <div className="text-blue-600 text-2xl font-medium">Shopping List</div>
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
          {/* Item #1 */}
          <div className="flex items-center justify-between bg-gray-100 rounded-lg p-2">
            <div className="flex items-center space-x-3">
              <div className="w-16 h-16 bg-red-500 rounded-lg overflow-hidden">
                <img
                  src="/api/placeholder/64/64"
                  alt="Red Apple"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="font-medium">Red Apple</div>
                <div className="text-sm text-gray-600">1.60 per lb</div>
                <div className="font-bold">$7.56</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="text-lg">9</div>
              <button className="bg-red-400 text-white p-2 rounded">
              <ShoppingCart size={24} />
              </button>
            </div>
          </div>

          {/* Item #2 */}
          <div className="flex items-center justify-between bg-gray-100 rounded-lg p-2">
            <div className="flex items-center space-x-3">
              <div className="w-16 h-16 bg-yellow-500 rounded-lg overflow-hidden">
                <img
                  src="/api/placeholder/64/64"
                  alt="Cheeto Puffs"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="font-medium">Cheeto Puffs</div>
                <div className="text-sm text-gray-600">1.99 Per Unit</div>
                <div className="font-bold">$3.98</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="text-lg">2</div>
              <button className="bg-red-400 text-white p-2 rounded">
              <ShoppingCart size={24} />
              </button>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-6 space-y-2">
          <div className="flex justify-between">
            <div>Subtotal</div>
            <div>$11.54</div>
          </div>
          <div className="flex justify-between">
            <div>Fees & Estimated Tax</div>
            <div>$2.45</div>
          </div>
          <div className="h-px bg-blue-200 my-2" />
          <div className="flex justify-between text-lg font-bold">
            <div>Total</div>
            <div>$13.99</div>
          </div>
        </div>

        {/* Promotion Card */}
        <div className="mt-6 bg-gradient-to-r from-blue-600 to-blue-400 rounded-lg p-4 text-white text-center">
          <div className="text-lg">
            Add another Red Apple for only an additional $0.10?
          </div>
        </div>

        {/* Pay Button */}
        <button className="w-full mt-6 py-3 border-2 border-black rounded-lg text-center font-bold">
          PAY
        </button>
      </div>
    </div>
  );
};

export default ShoppingCartCheckout;