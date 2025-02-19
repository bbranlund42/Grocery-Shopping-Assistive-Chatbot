import React, { useState, useEffect } from "react";
import { Search, Plus, Minus, ShoppingCart, X } from 'lucide-react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import images
import fruitImage from '../Display/Icons/fruitImage.jpg';
import vegetableImage from '../Display/Icons/vegetableImage.jpeg';
import bakeryImage from '../Display/Icons/bakeryImage.jpg';
import candyImage from '../Display/Icons/candyImage.jpg';
import snackImage from '../Display/Icons/snackImage.jpg';



export default function Display() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [foodItems, setFoodItems] = useState([]);
    const [cart, setCart] = useState([]);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        fetchCart();
        fetchFoodItems();
    }, []);

    const fetchCart = async () => {
        try {
            const response = await axios.get('http://localhost:4000/cart');
            setCart(response.data.items || []);
        } catch (error) {
            console.error('Error fetching cart:', error);
        }
    };

    const fetchFoodItems = async () => {
        try {
            const response = await axios.get('http://localhost:3500/data');
            setFoodItems(response.data);
        } catch (error) {
            console.error('Error fetching food items:', error);
        }
    };

    const getCategoryImage = (category) => {
        const imageMap = {
            "Fruit": fruitImage,
            "Vegetable": vegetableImage,
            "Bakery": bakeryImage,
            "Candy": candyImage,
            "Snack": snackImage
        };
        return imageMap[category] || '';
    };

    const addToCart = async (food) => {
        if (food.quantity === 0) {
            console.error("Item out of stock");
            return;
        }

        try {
            const response = await axios.post("http://localhost:4000/cart/add", {
                productId: food._id,
                name: food.product_name,
                price: food.price,
                quantity: quantity
            });
            setQuantity(1);
            handleCloseModal();
            toast.success("Added to cart");
            //const cartResponse = await axios.get("http://localhost:3000/cart");
            //setCart(cartResponse.data);
            //await fetchFoodItems(); // Refresh stock levels
        } catch (error) {
            toast.error("Error adding to cart");
            console.error("Error adding to cart:", error.response ? error.response.data : error.message);
        }
    };



    const handleCloseModal = () => {
        setSelectedProduct(null);
        setQuantity(1);
    };

    const filteredProducts = foodItems.filter(item =>
        item?.product_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div id="products" className="w-full w-7xl mx-auto px-4 py-8 bg-slate-200">
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
                <Foodlist
                    filteredProducts={filteredProducts}
                    setSelectedProduct={setSelectedProduct}
                    addToCart={addToCart} />
            </div>

            {/* Product Modal */}
            {selectedProduct && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
                        <button
                            onClick={handleCloseModal}
                            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
                        >
                            <X size={24} />
                        </button>

                        <h2 className="text-xl font-semibold mb-4">{selectedProduct.product_name}</h2>
                        <img
                            src={getCategoryImage(selectedProduct.category)}
                            alt={selectedProduct.product_name}
                            className="w-full h-64 object-cover rounded-md bg-gray-100"
                        />
                        <p className="text-lg font-medium mt-4">
                            ${selectedProduct.price.toFixed(2)}
                        </p>
                        <h2 className="text-xl mb-4">{selectedProduct.description}</h2>

                        <div className="mt-6 flex items-center gap-4">
                            <span className="text-gray-600">Quantity:</span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                                    className="p-1 rounded-full hover:bg-gray-100"
                                >
                                    <Minus size={20} className="text-gray-600" />
                                </button>
                                <span className="w-8 text-center">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(prev => prev + 1)}
                                    className="p-1 rounded-full hover:bg-gray-100"
                                >
                                    <Plus size={20} className="text-gray-600" />
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={() => addToCart(selectedProduct)}
                            disabled={selectedProduct.quantity === 0}
                            className="w-full mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                        >
                            Add {quantity} to Cart
                        </button>
                    </div>
                </div>
            )}
            <ToastContainer
                position="bottom-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
        </div>
    );
};
//newly implemented code
const Foodlist = ({ filteredProducts, setSelectedProduct, addToCart }) => {
    //add another line similiar to foodItems but instead with the cart and iterate through with the .map function and utilizing axios to figure out the food items that are left
    const [foodItems, setFoodItems] = useState([]);


    //these should retrieve the quantity from the database located at /data and use the "food.quantity" attribute to determine the stock amount left
    function changeBG(quantity) {
        if (quantity > 0) {
            return "w-full h-64 object cover rounded-md bg-gray-100"
        }
        else {
            return "w-full h-64 object-cover rounded-md bg-red-100"
        }
    }
    function changeText(quantity) {
        if (quantity > 0) {
            return "text-gray-900 font-medium mt-2"
        }
        else {
            return "text-red-900 font-medium mt-2"
        }
    }

    function test(quantity) {
        if (quantity > 0) {
            return `${quantity} in stock`
        }
        else {
            return "OUT OF STOCK"
        }
    }

    function setImages(i) {
        if (i === "Fruit") {
            return fruitImage
        }
        else if (i === "Vegetable") {
            return vegetableImage
        }
        else if (i === "Bakery") {
            return bakeryImage
        }
        else if (i === "Candy") {
            return candyImage
        }
        else if (i === "Snack") {
            return snackImage
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
            {filteredProducts.length > 0 ? (
                filteredProducts.map((food) => (
                    <div
                        key={food._id}
                        onClick={() => food.quantity !== 0 && setSelectedProduct(food)}
                        className="bg-white rounded-lg shadow-sm p-3 hover:shadow-md transition-shadow"
                    >
                        <img
                            src={setImages(food.category)}
                            alt={food.product_name}
                            className={food.quantity > 0
                                ? "w-full h-32 object-cover rounded-md bg-gray-100"
                                : "w-full h-32 object-cover rounded-md bg-red-100"
                            }
                        />
                        <div className="mt-2">
                            <div className="flex justify-between items-center">
                                <h3 className="flex text-grey-800 font-semibold text-l flex-wrap">
                                    {food.product_name}
                                </h3>
                                <div className="text-sm">
                                    <p className={changeText(food.quantity)}>{test(food.quantity)}
                                    </p>
                                </div>
                            </div>

                            <div className="text-xl">
                                <p className="text-gray-900 font-medium mt-2">
                                    ${food.price.toFixed(2)}
                                </p>
                            </div>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    addToCart(food);
                                }}
                                disabled={food.quantity === 0}
                                className="mt-4 w-full flex items-center justify-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 
                            transition-all duration-200 transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
                            disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                <ShoppingCart className="mr-2" size={20} />
                                Add to Cart
                            </button>
                        </div>
                    </div>
                ))
            ) : (
                <div className="col-span-full text-center py-8">
                    {foodItems.length === 0 ? "Loading food items..." : "No matching products found"}
                </div>
            )}
        </>
    );
};
