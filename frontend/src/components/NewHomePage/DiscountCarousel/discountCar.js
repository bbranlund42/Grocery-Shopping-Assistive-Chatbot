import React, { useRef, useEffect, useState } from "react";

const DiscountWheel = () => {
    // Sample card data
    const cardData = [
        {
            title: "Bakery Deals",
            description: "Get 20% off on all bakery items",
            color: "bg-amber-300",
            icon: "🥐"
        },
        {
            title: "Beverage Special",
            description: "Buy one get one free on selected drinks",
            color: "bg-blue-300",
            icon: "🥤"
        },
        {
            title: "Candy Discount",
            description: "30% off on premium chocolates",
            color: "bg-pink-300",
            icon: "🍬"
        }
    ];
    
    let cardContainerRef = useRef(null);
    const [autoScroll, setAutoScroll] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            if (autoScroll){
                next();
            }
        }, 4000);

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
                <div className="prev w-8 h-8 cursor-pointer bg-center bg-cover bg-no-repeat transition duration-200 flex items-center justify-center hover:bg-slate-300 rounded-full" onClick={prev}>
                    <span className="text-lg">←</span>
                </div>
                <div 
                    className="slide-panel no-scrollbar flex items-center w-full overflow-x-scroll snap-x snap-mandatory scroll-smooth" 
                    ref={cardContainerRef} 
                    onMouseEnter={() => setAutoScroll(false)} 
                    onMouseLeave={() => setAutoScroll(true)}
                >
                    {cardData.map((card, index) => (
                        <div 
                            key={index} 
                            className={`snap-start min-w-full flex justify-center`}
                        >
                            <div className={`card p-4 w-full max-w-md rounded-lg shadow-md flex items-center space-x-4 ${card.color}`}>
                                <div className="icon text-4xl">{card.icon}</div>
                                <div className="card-content">
                                    <h3 className="text-xl font-bold">{card.title}</h3>
                                    <p className="text-gray-700">{card.description}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="next w-8 h-8 cursor-pointer bg-center bg-cover bg-no-repeat transition duration-200 flex items-center justify-center hover:bg-slate-300 rounded-full" onClick={next}>
                    <span className="text-lg">→</span>
                </div>
            </div>
        </div>
    );
}

export default DiscountWheel;