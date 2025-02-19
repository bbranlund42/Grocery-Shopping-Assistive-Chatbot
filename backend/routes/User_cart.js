import mongoose from 'mongoose';
import express from 'express';
import cors from 'cors';

const database = 'mongodb+srv://user:123@capgemini.zcb5v.mongodb.net/?retryWrites=true&w=majority&appName=CapGemini';
const app = express();
app.use(cors());
app.use(express.json());

const PORT = 4000;

// Connect to MongoDB
const connectToMongo = async () => {
    try {
        await mongoose.connect(database);
        console.log("Connected to MongoDB");
    } catch (err) {
        console.error("MongoDB connection error:", err);
    }
}

// This defines the cart schema
const Schema = mongoose.Schema;
const UserCartSchema = new Schema({
    userId: {
        type: String,
        required: true
    },
    items: [{
        productId: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        price: {
            type: Number,
            required: true,
            min: 0
        }
    }],
    total: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const UserCart = mongoose.model('UserCart', UserCartSchema);

// this is the Route directory for Cart Management
app.get('/cart', async (req, res) => {
    try {
        const userId = 'single_user_id';
        const cart = await UserCart.findOne({ userId });
        res.json(cart || { items: [], total: 0 });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

//add is where the data will be sent, req contains data sent by the client, res is the response
app.post('/cart/add', async (req, res) => {
    try {
      //extract productID and quanitity form the request body
        const { productId, quantity } = req.body;
        const userId = 'single_user_id'; //Hardcoded userID, this is just for testing with one user

        //find user cart in database based on UserID
        let cart = await UserCart.findOne({ userId });

        //if cart doesnt exist, create a new cart
        if (!cart) {
            cart = new UserCart({ userId, 
              items: [] //initialize with no items 
              ,total: 0 //initialize price as 0
            });
        }

        //check if the product already exists in the cart
        const existingItemIndex = cart.items.findIndex(item => item.productId === productId);

        
        if (existingItemIndex > -1) //if the prudct exists then increase the quanitity
          {
            cart.items[existingItemIndex].quantity += quantity;
        } else {
            //if no products exists, then PUSH it to the cart
            cart.items.push({
                productId, //stores the product ID
                name: req.body.name, //stores teh product name
                quantity, //stores quanitity
                price: req.body.price //stores price
            });
        }

        // Recalculates the total price of the cart
        cart.total = cart.items.reduce((total, item) => 
            total + (item.price * item.quantity), 0);

        //saves teh updated cart
        await cart.save();
        //responds with the updated cart data
        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

//this is the directory for the remove feature
app.post('/cart/remove', async (req, res) => {
    try {
        const { productId } = req.body;
        const userId = 'single_user_id';

        let cart = await UserCart.findOne({ userId });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        //searches the cart.items array to find the item that matching the given Product iD
        const itemIndex = cart.items.findIndex(item => item.productId === productId);

        if (itemIndex === -1) {
            return res.status(404).json({ message: 'Product not in cart' });
        }

        // Remove the item completely
        cart.items.splice(itemIndex, 1);

        // Recalculate total price
        cart.total = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);

        await cart.save();
        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


app.post('/cart/update', async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const userId = 'single_user_id';

        if (!productId || quantity === undefined) {
            return res.status(400).json({ error: "Missing required fields: productId or quantity" });
        }

        // Find the user's cart
        let cart = await UserCart.findOne({ userId });

        if (!cart) {
            return res.status(404).json({ error: "Cart not found" });
        }

        // Find the item in the cart
        const itemIndex = cart.items.findIndex(item => item.productId === productId);

        if (itemIndex === -1) {
            return res.status(404).json({ error: "Product not in cart" });
        }

        if (quantity < 1) {
            // Remove item if quantity is less than 1
            cart.items.splice(itemIndex, 1);
        } else {
            // Update item quantity
            cart.items[itemIndex].quantity = quantity;
        }

        // Recalculate total price
        cart.total = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);

        await cart.save();
        res.status(200).json(cart);
    } catch (error) {
        console.error("Error updating cart:", error);
        res.status(500).json({ error: error.message });
    }
});

//this is the function thats going to be called to clear the cart of the user after they pay
app.post('/cart/clear', async (req, res) => {
    try {
      const userId = 'single_user_id';
      const cart = await UserCart.findOne({ userId });
      
      if (!cart) {
        return res.status(404).json({ message: 'Cart not found' });
      }
      
      cart.items = [];
      cart.total = 0;
      await cart.save();
      
      res.json({ message: 'Cart cleared successfully', cart });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  
// Connect to MongoDB and start server
connectToMongo();
mongoose.connection.once('open', () => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});

export default UserCart;