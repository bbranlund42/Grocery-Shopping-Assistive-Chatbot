import React, { useState, useEffect } from "react";
import { Search, ShoppingCart } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Display() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [cart, setCart] = useState([]);

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
    //define and iterate through fooditems list. Assign Food to fooditems 
    //not being used, can delete this
    const addToCart = async (food) => {
      try {
        //structure of the post request
        const response = await axios.post('http://localhost:3000/cart/add', {
          //it doesnt make sense to iterate through the food list items if its a button to add an item
          //make sure this is right in conjuction with the code for the "add cart" function and the return code for the "foodlist" section
          productId: food.id,
          name: food.name,
          price: food.price,
          quantity: 1
        });
    
        setCart(response.data.items);
      } catch (error) {
        console.error('Error adding to cart:', error);
      }
  };
  return (
    <div id="products" className="max-w-7xl mx-auto px-4 py-8">
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
      </div>
  
      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Foodlist />
      </div>
    </div>
  );
  };

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  //newly implemented code
  const Foodlist = () => {
    //add another line similiar to foodItems but instead with the cart and iterate through with the .map function and utilizing axios to figure out the food items that are left
    const [foodItems, setFoodItems] = useState([]);
    const [cart, setCart] = useState([]);

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
    //define and iterate through fooditems list. Assign Food to fooditems 
    const addToCart = async (food) => {
      if (food.quantity === 0) {
          console.error('Item out of stock');
          return;
      }
  
      try {
          const response = await axios.post('http://localhost:3000/cart/add', {
              productId: food._id,
              name: food.product_name,
              price: food.price,
              quantity: 1
          });
          setCart(response.data.items);
      } catch (error) {
          console.error('Error adding to cart:', error);
      }
  };

    //these should retrieve the quantity from the database located at /data and use the "food.quantity" attribute to determine the stock amount left
    function changeBG(quantity){
      if(quantity > 0){
        return "w-full h-64 object cover rounded-md bg-gray-100"
      }
      else{
        return "w-full h-64 object-cover rounded-md bg-red-100"
      }
    }
    function changeText(quantity){
      if(quantity > 0){
        return "text-gray-900 font-medium mt-2"
      }
      else{
        return "text-red-900 font-medium mt-2"
      }
    }
   
    function test(quantity){
      if (quantity > 0){
        return `${quantity} in stock`
      }
      else{
        return "OUT OF STOCK"
      } 
    }

    useEffect(() => {
      axios.get('http://localhost:3500/data') 
        .then(response => {
          setFoodItems(response.data);
          console.log('Current foodItems:', response.data); // Use response.data instead
        })
        .catch(error => console.error('Error fetching food:', error));
    }, []); // Empty dependency array to fetch only once on mount
    
   
    return (
      <>
        {foodItems.length > 0 ? (
          foodItems.map((food) => (
            <div key={food._id} className="bg-red rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
              <img
                src={food.image}
                alt={food.name}
                className={changeBG(food.quantity)}
              />
              <div className="mt-4">
                <h3 className="text-grey-800 font-medium">{food.product_name}</h3>
                <p className={changeText(food.quantity)}>{test(food.quantity)}</p>
                <p className="text-gray-900 font-medium mt-2">${food.price}</p>
                <button 
                      onClick={() => addToCart(food)}
                      className="mt-4 w-full flex items-center justify-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 
                      transition-all duration-200 transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                  >
                      <ShoppingCart className="mr-2" size={20} />
                      Add to Cart
                  </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-8">Loading food items...</div>
        )}
      </>
    );
  };
