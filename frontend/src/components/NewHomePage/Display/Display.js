import React, { useState, useEffect } from "react";
import { Search } from 'lucide-react';
import axios from 'axios';

const FoodList = () => {
  const [foodItems, setFoodItems] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:3500/data') // Fetch food items from backend
      .then(response => setFoodItems(response.data))
      .catch(error => console.error('Error fetching food:', error));
  }, []); 

  return (
    <>
      {foodItems.length > 0 ? (
        foodItems.map((food) => (
          <div key={food._id} className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
            <img
              src={food.image}
              alt={food.product_name}
              className="w-full h-64 object-cover rounded-md bg-gray-100"
            />
            <div className="mt-4">
              <h3 className="text-gray-800 font-medium">{food.product_name}</h3>
              <p className="text-gray-900 font-medium mt-2">{food.quantity} in stock</p>
              <p className="text-gray-900 font-medium mt-2">${food.price}</p>
            </div>
          </div>
        ))
      ) : (
        <div className="col-span-full text-center py-8">Loading food items...</div>
      )}
    </>
  );
};

const Display = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div id="products" className="max-w-7xl mx-auto px-4 py-8 ">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        {/* Search Bar */}
        <div className="relative w-full sm:w-96">
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-4 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute right-3 top-2.5 text-gray-400" size={20} />
        </div>

        {/* Filters */}
        <div className="flex gap-4 items-center flex-wrap">
          <button className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800">
            New
          </button>
          <button className="px-4 py-2 text-gray-600 hover:text-gray-900">
            Price ascending
          </button>
          <button className="px-4 py-2 text-gray-600 hover:text-gray-900">
            Price descending
          </button>
          <button className="px-4 py-2 text-gray-600 hover:text-gray-900">
            Rating
          </button>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <FoodList />
      </div>
    </div>
  );
};

export default Display;