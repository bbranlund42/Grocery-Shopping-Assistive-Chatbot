import mongoose from 'mongoose'; 
import express from 'express';
import cors from 'cors';

const app = express(); 
const PORT = 3500;
const database = 'mongodb+srv://user:123@capgemini.zcb5v.mongodb.net/?retryWrites=true&w=majority&appName=CapGemini';

// Middleware
app.use(express.json()); // Allows parsing JSON in requests
app.use(cors({ origin: 'http://localhost:3001' })); // Enable CORS for frontend

// Connect to MongoDB
const connectToMongo = async () => {
    try {
        await mongoose.connect(database);
        console.log("Connected to MongoDB");
    } catch (err) {
        console.error("MongoDB connection error:", err);
    }
};

// Food Schema
const Schema = mongoose.Schema; 
const FoodSchema = new Schema({
    product_id: String,
    product_name: String,
    category: String,
    quantity: Number,
    price: Number,
    description: String
}); 

const Food = mongoose.model('Food', FoodSchema);

// Find a specific item
const findItem = async (req, res) => {
    try {
        const query = await Food.findOne({ product_name: req.query.product_name }).exec(); 
        if (!query) {
            return res.status(404).json({ message: "Item not found" });
        }
        res.json(query);
    } catch (error) {
        console.error("Error finding item:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get all products
app.get('/products', async (req, res) => {
    try {
        const result = await Food.find().exec(); 
        res.json(result);
    } catch (error) {
        console.error("Error retrieving products:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Get all food data (is this extra?)
app.get('/data', async (req, res) => {
    try {
        const result = await Food.find().exec();
        res.json(result);
    } catch (error) {
        console.error("Error retrieving food items:", error);
        res.status(500).json({ message: "Error retrieving food items" });
    }
});

// Get a single product by name
app.get('/users', async (req, res) => {
    try {
        const result = await Food.findOne({ product_name: req.query.product_name }).exec();
        if (!result) {
            return res.status(404).json({ message: "Item not found" });
        }
        res.json(result);
    } catch (error) {
        console.error("Error retrieving user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Connect to MongoDB and start the server
connectToMongo();
mongoose.connection.once('open', () => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
