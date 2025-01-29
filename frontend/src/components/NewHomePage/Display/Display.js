import React, { useState } from "react";
import { Search } from 'lucide-react';


export default function Display() {
    const [searchQuery, setSearchQuery] = useState('');
  
    // Sample product data
    const products = [
      { id: 1, name: 'Product 1', price: 0, image: '/api/placeholder/300/300' },
      { id: 2, name: 'Product 2', price: 0, image: '/api/placeholder/300/300' },
      { id: 3, name: 'Product 3', price: 0, image: '/api/placeholder/300/300' },
      { id: 4, name: 'Product 4', price: 0, image: '/api/placeholder/300/300' },
      { id: 5, name: 'Product 5', price: 0, image: '/api/placeholder/300/300' },
      { id: 6, name: 'Product 6', price: 0, image: '/api/placeholder/300/300' },
    ];
  
    const ProductCard = ({ product }) => (
      <div className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-64 object-cover rounded-md bg-gray-100"
        />
        <div className="mt-4">
          <h3 className="text-gray-800">{product.name}</h3>
          <p className="text-gray-900 font-medium mt-2">${product.price}</p>
        </div>
      </div>
    );
  
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
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
          <div className="flex gap-4 items-center">
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
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    );
  };