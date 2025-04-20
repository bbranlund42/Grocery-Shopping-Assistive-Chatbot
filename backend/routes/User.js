import mongoose from 'mongoose';
import express from 'express';
import cors from 'cors';

const database = 'mongodb+srv://user:123@capgemini.zcb5v.mongodb.net/?retryWrites=true&w=majority&appName=CapGemini';
const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5000;

// Connect to MongoDB
const connectToMongo = async () => {
    try {
        await mongoose.connect(database);
        console.log("Connected to MongoDB for User Service");
    } catch (err) {
        console.error("MongoDB connection error:", err);
    }
}

// Simple User Schema Definition
const Schema = mongoose.Schema;
const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const User = mongoose.model('User', UserSchema);

// Register route - simple version without hashing
app.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        
        // Create new user (storing password as plain text for now)
        const user = new User({ email, password });
        await user.save();
        
        res.status(201).json({ message: 'User created successfully', userId: user._id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Login route - simple version
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        
        // Check password (plain text comparison)
        if (user.password !== password) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        
        res.json({ message: 'Login successful', userId: user._id, username: user.email });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Connect to MongoDB and start server
connectToMongo();
mongoose.connection.once('open', () => {
    app.listen(PORT, () => {
        console.log(`User server running on port ${PORT}`);
    });
});

export default User;