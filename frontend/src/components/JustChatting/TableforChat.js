import React, { useState }from "react";
import { TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper, Tab } from "@mui/material";
import { Plus, Minus } from 'lucide-react';

const MyTableforSuggest = () => {
    const [count, setCount] = useState(1);

    const decrement = () => {
        setCount(prevCount => prevCount - 1);
        };

    const increment = () => {
        setCount(prevCount => prevCount + 1);
        };
    
    return (
        <>
            <div className="flex">
            <TableContainer className=""
                component={Paper}
                variant="outlined"
            >
                <Table aria-label="demo table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Price</TableCell>
                            <TableCell>In Stock</TableCell>
                            <TableCell></TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell>Frozen yoghurt</TableCell>
                            <TableCell>$1.00</TableCell>
                            <TableCell>100</TableCell>
                            <TableCell>
                            <div className="mt-2 flex items-center ">
                            <div className="flex items-center">
                                <button
                                    onClick={decrement}
                                    className="rounded-full hover:bg-gray-100" disabled={count === 1}
                                >
                                    <Minus size={20} className="text-gray-600" />
                                </button>
                                <input value={count} className="w-8 text-center" placeholder="1" readOnly></input>
                                <button
                                    onClick={increment}
                                    className="p-1 rounded-full hover:bg-gray-100"
                                >
                                    <Plus size={20} className="text-gray-600" />
                                </button>
                            </div>
                            </div>
                            </TableCell>
                            <TableCell>
                            <button className="w-full mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400">Add to Cart</button>
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Cupcake</TableCell>
                            <TableCell>$2.99</TableCell>
                            <TableCell>99</TableCell>
                            <TableCell>
                            <div className="mt-2 flex items-center ">
                            <div className="flex items-center">
                                <button
                                    onClick={decrement}
                                    className="rounded-full hover:bg-gray-100" disabled={count === 1}
                                >
                                    <Minus size={20} className="text-gray-600" />
                                </button>
                                <input value={count} className="w-8 text-center" placeholder="1" readOnly></input>
                                <button
                                    onClick={increment}
                                    className="p-1 rounded-full hover:bg-gray-100"
                                >
                                    <Plus size={20} className="text-gray-600" />
                                </button>
                            </div>
                            </div>
                            </TableCell>
                            <TableCell>
                            <button className="w-full mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400">Add to Cart</button>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
            </div>
        </>
    );
};

export default MyTableforSuggest;