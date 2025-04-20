import mongoose from 'mongoose'; 
import express from 'express'; 
import cors from 'cors';

const database = 'mongodb+srv://user:123@capgemini.zcb5v.mongodb.net/?retryWrites=true&w=majority&appName=CapGemini'; 
const PORT = 4800; 

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const connectToMongo = async () => {
    await mongoose.connect(database, {
        useUnifiedTopology: true, 
        useNewUrlParser: true
    }); 
}
connectToMongo();

const OrderHistorySchema = new mongoose.Schema({
    userId: {
        type: String,  // Simple string ID
        required: true
    },
    items: [{
        product_id: {
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
        },
        orderDate: { 
            type: Date, 
            default: Date.now 
        }
    }],
    totalAmount: {
        type: Number,
        default: 0
    }
});

const OrderHistory = mongoose.model('orderhistory', OrderHistorySchema, 'orderhistory');

// GET route to fetch previous orders for specific user
app.get('/Order_history', async (req, res) => {
    try {
        const userId = req.query.userId || 'single_user_id';  // Default for backward compatibility
        const orders = await OrderHistory.find({ userId }).sort({ 'items.orderDate': -1 });
        res.json({ Historic_Items: orders });
    } catch (error) {
        console.error('Error fetching order history:', error);
        res.status(500).json({ error: error.message });
    }
});


// POST route to save new order history
app.post('/Order_history', async (req, res) => {
    try {
        const { Historic_Items, userId } = req.body;
        
        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }
        
        if (!Historic_Items || !Array.isArray(Historic_Items)) {
            return res.status(400).json({ error: 'Invalid order data' });
        }

        // Calculate total amount
        const totalAmount = Historic_Items.reduce((total, item) => 
            total + (item.price * item.quantity), 0);

        // Save new order - include userId here
        const newOrder = new OrderHistory({ 
            userId: userId,  // Include userId in the new order
            items: Historic_Items, 
            totalAmount 
        });
        await newOrder.save();

        res.status(201).json({ 
            message: 'Order history updated successfully',
            order: newOrder 
        });
    } catch (error) {
        console.error('Error saving order history:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Order History server running on port ${PORT}`);
});