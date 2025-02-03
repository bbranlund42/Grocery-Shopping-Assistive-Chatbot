import React, { useState, useEffect } from "react";
import { Search, ShoppingCart } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Display() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [cart, setCart] = useState([]);
    const [products, setProducts] = useState([
      //added some prices to the products
      { id: '1', name: 'Product 1', price: 10.99, image: '/api/placeholder/300/300' },
      { id: '2', name: 'Product 2', price: 15.50, image: '/api/placeholder/300/300' },
      { id: '3', name: 'Product 3', price: 7.25, image: '/api/placeholder/300/300' },
      { id: '4', name: 'Product 4', price: 22.00, image: '/api/placeholder/300/300' },
      { id: '5', name: 'Product 5', price: 12.75, image: '/api/placeholder/300/300' },
      { id: '6', name: 'Product 6', price: 18.50, image: '/api/placeholder/300/300' },
    ]);

    useEffect(() => {
      fetchCart();
    }, []);

    const fetchCart = async () => {
      try {
        //this is the get request that is used to retreive the cart array and displays it in the "Cart" button located on the homepage
        const response = await axios.get('http://localhost:3000/cart');
        setCart(response.data.items || []);
      } catch (error) {
        console.error('Error fetching cart:', error);
      }
    };
    
    //is called when the button is pressed and sent the data to the Cart/add route
    const addToCart = async (product) => {
      try {
        //structure of the post request
        const response = await axios.post('http://localhost:3000/cart/add', {
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: 1
        });
    
        setCart(response.data.items);
      } catch (error) {
        console.error('Error adding to cart:', error);
      }
    };
    
    const ProductCard = ({ product }) => (
      <div className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow relative">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-64 object-cover rounded-md bg-gray-100"
        />
        <div className="mt-4">
          <h3 className="text-gray-800">{product.name}</h3>
          <p className="text-gray-900 font-medium mt-2">${product.price.toFixed(2)}</p>
        </div>
        <button 
        //calls the addToCart function when button pressed
          onClick={() => addToCart(product)}
          className="mt-4 w-full flex items-center justify-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <ShoppingCart className="mr-2" size={20} />
          Add to Cart
        </button>
      </div>
    );
  
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header with Cart Navigation */}
        <div className="flex justify-end mb-4">
          <button 
            onClick={() => navigate('/cart')}
            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            <ShoppingCart className="mr-2" size={20} />
            Cart ({cart.length})
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
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
  
          <div className="flex gap-4 items-center">
            <button className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800">
              New
            </button>
            <button className="px-4 py-2 text-gray-600 hover:text-gray-900">
              Price ascending
            </button>
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