import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { House, Pin } from "lucide-react";

function JustChatting() {
  const navigate = useNavigate();

  // all the items use this so they are all updated together
  // if you increase one item they all increase
  // we can fix later
  const [quantity, setQuantity] = useState(1);

  const incrementQuantity = () => setQuantity(quantity + 1);
  const decrementQuantity = () => setQuantity(quantity > 1 ? quantity - 1 : 1);

  return (
    <div className="bg-white min-h-screen flex flex-col items-center">
      {/* Header */}
      <div className="w-full flex items-center justify-between p-4 bg-blue-100">
        <button
          className="bg-blue-500 text-white w-8 h-8 flex items-center justify-center rounded-full"
          onClick={() => navigate(-1)}
        >
          ⬅
        </button>
        <button
          className="bg-blue-500 text-white w-10 h-10 flex items-center justify-center rounded fixed top-4 right-4"
          onClick={() => navigate("/HomePage")}
        >
          <House size={24} />
        </button>
      </div>

      {/* Search Container */}
      <div className="w-full max-w-md flex flex-col items-center my-4">
        <div className="flex items-center border border-blue-300 rounded-full p-2 shadow-sm w-full">
          <Pin size={24} />
          <input
            type="text"
            placeholder="are there apples in the store?"
            className="flex-grow ml-2 border-none outline-none"
          />
        </div>
      </div>

      {/* Results Container */}
      <div className="w-full max-w-md">
        {/* Result Item 1 */}
        <div className="flex items-center justify-between border rounded-lg p-4 my-2 shadow-sm">
          <div className="flex flex-col">
            <div className="text-lg font-bold">Red Apple</div>
            <div className="text-sm text-blue-500">Aisle H23</div>
            <div>36 lbs In Stock</div>
          </div>
          <div className="flex items-center">
            <button
              className="bg-gray-300 w-8 h-8 flex items-center justify-center rounded"
              onClick={decrementQuantity}
            >
              -
            </button>
            <span className="mx-2">{quantity}</span>
            <button
              className="bg-gray-300 w-8 h-8 flex items-center justify-center rounded"
              onClick={incrementQuantity}
            >
              +
            </button>
          </div>
        </div>

        {/* Result Item 2 */}
        <div className="flex items-center justify-between border rounded-lg p-4 my-2 shadow-sm">
          <div className="flex flex-col">
            <div className="text-lg font-bold">Green Apple</div>
            <div className="text-sm text-blue-500">Aisle H23</div>
            <div>55 lbs In Stock</div>
          </div>
          <div className="flex items-center">
            <button
              className="bg-gray-300 w-8 h-8 flex items-center justify-center rounded"
              onClick={decrementQuantity}
            >
              -
            </button>
            <span className="mx-2">{quantity}</span>
            <button
              className="bg-gray-300 w-8 h-8 flex items-center justify-center rounded"
              onClick={incrementQuantity}
            >
              +
            </button>
          </div>
        </div>

        {/* Result Item 3 */}
        <div className="flex items-center justify-between border rounded-lg p-4 my-2 shadow-sm bg-red-100">
          <div className="flex flex-col">
            <div className="text-lg font-bold">Honey Crisp Apple</div>
            <div className="text-sm text-blue-500">Aisle H23</div>
            <div>0 lbs In Stock</div>
          </div>
          <div className="flex items-center">
            <button
              className="bg-gray-300 w-8 h-8 flex items-center justify-center rounded"
              onClick={decrementQuantity}
            >
              -
            </button>
            <span className="mx-2">{quantity}</span>
            <button
              className="bg-gray-300 w-8 h-8 flex items-center justify-center rounded"
              onClick={incrementQuantity}
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default JustChatting;