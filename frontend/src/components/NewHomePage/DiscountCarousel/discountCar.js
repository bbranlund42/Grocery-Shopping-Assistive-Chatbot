import React, { useRef, useEffect, useState } from "react";
import Badge from '@mui/material/Badge';
import axios from 'axios';

const DiscountWheel = () => {
    // Sample card data
    const [cardData, setCardData] = useState([]);
    let cardContainerRef = useRef(null);
    const [autoScroll, setAutoScroll] = useState(true);

    const categoryEmojis = {
        fruit: "🍎",
        vegetable: "🥦",
        bakery: "🥐",
        candy: "🍬",
        snack: "🍿",
        beverage: "🥤",
        meat: "🍖",
        dairy: "🧀"
    };

    const categoryColors = {
        fruit: "bg-rose-200",
        vegetable: "bg-lime-200",
        bakery: "bg-amber-200",
        candy: "bg-pink-200",
        snack: "bg-yellow-200",
        beverage: "bg-sky-200",
        meat: "bg-red-200",
        dairy: "bg-indigo-200"
        };


    useEffect(() => {
        const fetchDiscounts = async () => {
            try {
                const response = await axios.get("http://localhost:3500/findByDiscount");
                setCardData(response.data);
            } catch (error) {
                console.error("Error fetching discount data:", error);
            }
        };

        fetchDiscounts();
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            if (autoScroll) {
                next();
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [autoScroll]);

    const prev = () => cardContainerRef.current.scrollLeft -= cardContainerRef.current.offsetWidth;
    const next = () => {
        if (cardContainerRef.current.scrollLeft + cardContainerRef.current.offsetWidth >= cardContainerRef.current.scrollWidth) {
            cardContainerRef.current.scrollLeft = 0;
        } else {
            cardContainerRef.current.scrollLeft += cardContainerRef.current.offsetWidth;
        }
    }

    return (
        <div className="page-container bg-slate-200 w-full py-4 flex justify-center items-center">
            <div className="content w-full max-w-full flex justify-around items-center">
                <div
                    className="prev w-8 h-8 cursor-pointer flex items-center justify-center hover:bg-slate-300 rounded-full"
                    onClick={prev}
                >
                    <span className="text-lg">←</span>
                </div>

                <div
                    className="slide-panel no-scrollbar flex items-center w-full overflow-x-scroll snap-x snap-mandatory scroll-smooth"
                    ref={cardContainerRef}
                    onMouseEnter={() => setAutoScroll(false)}
                    onMouseLeave={() => setAutoScroll(true)}
                >
                    {cardData.length === 0 ? (
                        <div className="text-center text-gray-500 w-full">
                            No discounts available.
                        </div>
                    ) : (
                        cardData.map((card, index) => (
                            <div
                                key={index}
                                className={`snap-start min-w-full flex justify-center`}
                            >
                                <div className={`card p-4 w-full max-w-md rounded-lg shadow-md flex items-center space-x-4 ${categoryColors[card.category?.toLowerCase()]}`}>
                                    <div className="icon text-4xl">
                                        {categoryEmojis[card.category.toLowerCase()]}
                                    </div>
                                    <div className="card-content">
                                        <h3 className="text-xl font-bold">{card.product_name}</h3>
                                        <p className="text-gray-700">{card.description}</p>
                                        <p className="text-blue-600 font-semibold">{card.discount}% off</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div
                    className="next w-8 h-8 cursor-pointer flex items-center justify-center hover:bg-slate-300 rounded-full"
                    onClick={next}
                >
                    <span className="text-lg">→</span>
                </div>
            </div>
        </div>
    );
}

export default DiscountWheel;