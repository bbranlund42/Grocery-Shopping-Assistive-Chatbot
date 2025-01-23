// this url connects you to MONGO
const database =
'mongodb+srv://user:123@capgemini.zcb5v.mongodb.net/?retryWrites=true&w=majority&appName=CapGemini'; 
import mongoose from 'mongoose'; 
import express  from 'express'; 
const app = express(); 
const PORT = 3500; 

// connect to Mongo function
const connectToMongo = async () => {
    await mongoose.connect(database, {
        useUnifiedTopology: true, 
        useNewUrlParser: true
    }); 
}
// This sets the boundaries of what a new item must have if you were to create one 
const Schema = mongoose.Schema; 
const FoodSchema = new Schema({
    product_id: {
        type: String
    }, 
    product_name: {
        type: String
    }, 
    category: {
        type: String
    }, 
    quantity: {
        type: Number
    }, 
    price: {
        type: Number
    }, 
    description: {
        type: String
    }
}); 

const Food = mongoose.model('Food', FoodSchema); // this creates the object that lets you do database things (remove, add, find) 

// adds new thing to database
/* const newFood = Food.create({
    "product_id": "P002", 
    "product_name": "Banana",
    "category": "Fruit", 
    "quantity": 150, 
    "price": 0.3, 
    "description": "Ripe Yellow Bananas"
}); */

console.log(await Food.findOne({
    name: 'apple'
}).exec()); 

// Conect to MongoD and start the backend serever 
connectToMongo(); 
app.listen(PORT); 