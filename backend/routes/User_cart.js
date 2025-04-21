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

// Middleware to verify userId exists
const requireValidUserId = (req, res, next) => {
    const userId = req.query.userId || req.body.userId;
    
    if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
    }
    
    next();
};

// Route directory for Cart Management
app.get('/cart', requireValidUserId, async (req, res) => {
    try {
        const { userId } = req.query;
        const cart = await UserCart.findOne({ userId });
        
        if (!cart) {
            // Create a new empty cart for this user
            return res.json({ userId, items: [], total: 0 });
        }
        
        res.json(cart);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/cart/add', requireValidUserId, async (req, res) => {
    try {
        const { productId, quantity, name, price, userId } = req.body;

        if (!productId || !quantity || !name || price === undefined) {
            return res.status(400).json({ error: "Missing product information" });
        }

        let cart = await UserCart.findOne({ userId });

        if (!cart) {
            cart = new UserCart({ 
                userId, 
                items: [],
                total: 0
            });
        }

        const existingItemIndex = cart.items.findIndex(item => item.productId === productId);
        
        if (existingItemIndex > -1) {
            cart.items[existingItemIndex].quantity += quantity;
        } else {
            cart.items.push({
                productId,
                name,
                quantity,
                price
            });
        }

        // Recalculates the total price of the cart
        cart.total = cart.items.reduce((total, item) => 
            total + (item.price * item.quantity), 0);

        await cart.save();
        res.json(cart);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/add/cart/table', requireValidUserId, async (req, res) => {
    try {
        const { productId, quantity, name, price, userId } = req.body;

        if (!productId || !quantity || !name || price === undefined) {
            return res.status(400).json({ error: "Missing product information" });
        }

        let cart = await UserCart.findOne({ userId });

        if (!cart) {
            cart = new UserCart({ 
                userId, 
                items: [],
                total: 0
            });
        }

        const existingItemIndex = cart.items.findIndex(item => item.productId === productId);
        
        if (existingItemIndex > -1) {
            cart.items[existingItemIndex].quantity += quantity;
        } else {
            cart.items.push({
                productId,
                name,
                quantity,
                price
            });
        }

        // Recalculates the total price of the cart
        cart.total = cart.items.reduce((total, item) => 
            total + (item.price * item.quantity), 0);

        await cart.save();
        res.json(cart);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/cart/remove', requireValidUserId, async (req, res) => {
    try {
        const { productId, userId } = req.body;

        if (!productId) {
            return res.status(400).json({ error: "Product ID is required" });
        }

        let cart = await UserCart.findOne({ userId });

        if (!cart) {
            return res.status(404).json({ error: "Cart not found" });
        }

        const itemIndex = cart.items.findIndex(item => item.productId === productId);

        if (itemIndex === -1) {
            return res.status(404).json({ error: "Product not in cart" });
        }

        // Remove the item completely
        cart.items.splice(itemIndex, 1);

        // Recalculate total price
        cart.total = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);

        await cart.save();
        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/cart/update', requireValidUserId, async (req, res) => {
    try {
        const { productId, quantity, userId } = req.body;

        console.log('Update request received:', { productId, quantity, userId });

        if (!productId || quantity === undefined) {
            return res.status(400).json({ error: "Missing required fields: productId or quantity" });
        }

        // Find the user's cart
        let cart = await UserCart.findOne({ userId });
        console.log('Cart found:', cart ? 'Yes' : 'No');

        if (!cart) {
            console.log('Cart not found for userId:', userId);
            return res.status(404).json({ error: "Cart not found" });
        }

        // Find the item in the cart
        const itemIndex = cart.items.findIndex(item => item.productId === productId);
        console.log('Item index:', itemIndex, 'Looking for productId:', productId);
        console.log('Available product IDs:', cart.items.map(item => item.productId));

        if (itemIndex === -1) {
            console.log('Product not in cart');
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

app.post('/cart/clear', requireValidUserId, async (req, res) => {
    try {
        const { userId } = req.body;
        const cart = await UserCart.findOne({ userId });
        
        if (!cart) {
            return res.status(404).json({ error: "Cart not found" });
        }
        
        cart.items = [];
        cart.total = 0;
        await cart.save();
        
        res.json({ message: 'Cart cleared successfully', cart });
    } catch (error) {
        res.status(500).json({ error: error.message });
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