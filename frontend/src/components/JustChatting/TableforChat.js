import React, { useState, useEffect } from "react";
import { TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper } from "@mui/material";
import { Plus, Minus } from 'lucide-react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MyTableforSuggest = ({ products }) => {


    const [quantity, setQuantity] = useState(1);
    // Initialize with an empty array if products is undefined
    const [data, setData] = useState([]);
    // Track count for each product separately using product_name as key
        const [counts, setCounts] = useState({});

    useEffect(() => {
        // First, completely clear the existing data
        setData([]);
        setCounts({});

        // Then, after a small delay, set the new data
        // This ensures a complete refresh of the component
        setTimeout(() => {
            if (products && Array.isArray(products)) {
                setData(products);

                // Initialize counts for each product
                const initialCounts = {};
                products.forEach(product => {
                    initialCounts[product.product_name] = 1;
                });
                setCounts(initialCounts);
            }
        }, 0);
    }, [products]);
    
    const addToCart = async (food) => {

        if (food.quantity === 0) {
            console.error("Item out of stock");
            return;
        }

        try {
            const response = await axios.post("http://localhost:4000/add/cart/table", {
                productId: food.productID,
                name: food.product_name,
                price: food.price,
                quantity: counts[food.product_name] || 1
            });
            setQuantity(1);
            toast.success("Added " + food.product_name + " to cart");
            //const cartResponse = await axios.get("http://localhost:3000/cart");
            //setCart(cartResponse.data);
            //await fetchFoodItems(); // Refresh stock levels
        } catch (error) {
            toast.error("Error adding to cart");
            console.error("Error adding to cart:", error.response ? error.response.data : error.message);
        }
    };


    // Update data when products prop changes
     // This dependency ensures the effect runs whenever products changes

    const decrement = (productName) => {
        setCounts(prevCounts => ({
            ...prevCounts,
            [productName]: Math.max(1, prevCounts[productName] - 1) // Ensure count doesn't go below 1
        }));
    };

    const increment = (productName) => {
        setCounts(prevCounts => ({
            ...prevCounts,
            [productName]: prevCounts[productName] + 1
        }));
    };

    return (
        <>
            <div className="flex">
                <TableContainer className=""
                    component={Paper}
                    variant="outlined"
                >
                    <Table aria-label="products table">
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>In Stock</TableCell>
                                <TableCell>Quantity</TableCell>
                                <TableCell>Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data.map((product) => (
                                <TableRow key={product.product_name}>
                                    <TableCell>{product.product_name}</TableCell>
                                    <TableCell>{product.quantity}</TableCell>
                                    <TableCell>
                                        <div className="mt-2 flex items-center">
                                            <div className="flex items-center">
                                                <button
                                                    onClick={() => decrement(product.product_name)}
                                                    className="rounded-full hover:bg-gray-100"
                                                    disabled={counts[product.product_name] === 1}
                                                >
                                                    <Minus size={20} className="text-gray-600" />
                                                </button>
                                                <input
                                                    value={counts[product.product_name] || 1}
                                                    className="w-8 text-center"
                                                    readOnly
                                                />
                                                <button
                                                    onClick={() => increment(product.product_name)}
                                                    className="p-1 rounded-full hover:bg-gray-100"
                                                >
                                                    <Plus size={20} className="text-gray-600" />
                                                </button>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <button
                                            className="w-full mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                                            onClick={() => addToCart(product)}
                                        >
                                            Add to Cart
                                        </button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </div>
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
        </>
    );
};

export default MyTableforSuggest;