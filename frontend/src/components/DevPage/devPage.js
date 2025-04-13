import React from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Header from "../NewHomePage/Header/Header";


export default function DevPage() {
    const [item, setItem] = useState({
        product_id: '',
        product_name: '',
        category: '',
        quantity: '',
        price: '',
        description: '',
        location: '',
        discount: ''
    });

    const addItem = async () => {
        const newItem = {
            product_id: item.product_id,
            product_name: item.product_name,
            category: item.category,
            quantity: parseInt(item.quantity),
            price: parseInt(item.price),
            description: item.description,
            location: item.location,
            discount: parseFloat(item.discount)
        }

        console.log(newItem)
        try {
            await axios.post('http://localhost:3500/addNewFood', newItem);
            alert("thanks");
        }
        catch (err) {
            console.error(err);
            alert('oh no');
        }
        
    }

    return (

        <>

            <div className="bg-white min-h-screen flex flex-col items-center">
                <Header />
                <div className="max-w-xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden mt-2">
                    {/* Header */}
                    <div style={{ backgroundColor: 'rgb(18, 171, 219)' }} className=" p-4">
                        <h2 className="text-xl font-bold text-white">Add New Product</h2>
                        <p className="text-blue-100 text-sm">Fill in the details to add a product to inventory</p>
                    </div>

                    {/* Form content */}
                    <div className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Left column */}
                            <div className="space-y-3">
                                <div className="form-group">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Product ID</label>
                                    <input
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                        type="text"
                                        value={item.product_id}
                                        onChange={(e) => setItem({ ...item, product_id: e.target.value })}
                                        placeholder="Enter product ID"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                                    <input
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                        type="text"
                                        value={item.product_name}
                                        onChange={(e) => setItem({ ...item, product_name: e.target.value })}
                                        placeholder="Enter product name"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <input
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                        type="text"
                                        value={item.category}
                                        onChange={(e) => setItem({ ...item, category: e.target.value })}
                                        placeholder="Enter category"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                    <input
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                        type="text"
                                        value={item.location}
                                        onChange={(e) => setItem({ ...item, location: e.target.value })}
                                        placeholder="Enter location"
                                    />
                                </div>
                            </div>

                            {/* Right column */}
                            <div className="space-y-4">
                                <div className="form-group">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                                    <input
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                        type="number"
                                        value={item.quantity}
                                        onChange={(e) => setItem({ ...item, quantity: e.target.value })}
                                        placeholder="Enter quantity"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                                    <input
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                        type="number"
                                        step="0.01"
                                        value={item.price}
                                        onChange={(e) => setItem({ ...item, price: e.target.value })}
                                        placeholder="0.00"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Discount (%)</label>
                                    <input
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                        type="number"
                                        value={item.discount}
                                        onChange={(e) => setItem({ ...item, discount: e.target.value })}
                                        placeholder="0%"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                        rows="3"
                                        value={item.description}
                                        onChange={(e) => setItem({ ...item, description: e.target.value })}
                                        placeholder="Enter product description"
                                    ></textarea>
                                </div>
                            </div>
                        </div>

                        {/* Button area */}
                        <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end space-x-3">
                            <button
                                style={{ backgroundColor: 'rgba(18, 171, 219, 1)' }}
                                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white custom-hover focus:outline-none focus:ring-2 focus:ring-blue-500"
                                type="button"
                                onClick={addItem}
                            >
                                Add Product
                            </button>
                        </div>
                    </div>
                </div>
            </div>

        </>

    );
}; 
