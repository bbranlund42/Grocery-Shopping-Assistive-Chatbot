// Peyton Rushing
// 6/24/2021
// used this file to to test get,post, and delete requests
const database =
'mongodb+srv://user:123@capgemini.zcb5v.mongodb.net/?retryWrites=true&w=majority&appName=CapGemini'; 
import mongoose from 'mongoose'; 
import express  from 'express'; 
import cors from 'cors';
const PORT = 3500; 
import { BedrockEmbeddings } from "@langchain/aws";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
// embedding model 
const embedding_model = new BedrockEmbeddings({
  model: 'amazon.titan-embed-text-v2:0',
  credentials_profile_name: 'default'
}); 


const connectToMongo = async () => {
    await mongoose.connect(database, {
        useUnifiedTopology: true, 
        useNewUrlParser: true
    }); 
}
connectToMongo();

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
    },
    location: {
        type: String
    }
}); 

const Food = mongoose.model('Food', FoodSchema);

app.get('/findAllProducts', async (req, res) => {
    try {
      const items = await Food.find(); // Replace with your Mongoose model
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

app.post('/addNewFood', async (req,res) => {
    try{
        const {product_id, product_name, category, quantity, price, description, location} = req.query;
        const newFood = new Food({product_id, product_name, category, quantity, price, description, location});

        const savedFood = await newFood.save();
        const embedding = await embedding_model.embedQuery(newFood['product_name']); 
        const result = await Food.updateOne(
          {'_id': newFood['_id']}, 
          {$set: {'embedding': embedding} }, 
          {strict: false}
          ); 
          const text = (`
Product ID: ${newFood['product_id']}
Product Name: ${newFood['product_name']}
Category: ${newFood['category']}
Quantity: ${newFood['quantity']}
Price: ${newFood['price']}
Description: ${newFood['description']}
Location: ${newFood['location']}`
        ); 
        const res2 = await Food.updateOne(
            {'_id': newFood['_id']}, 
            {$set: {'text': text}}, 
            {strict: false}
        ); 

        res.status(201).json({message:"Added Successfully",data: savedFood});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



app.delete('/deleteFood', async (req, res) => {
    try {
      const { product_id } = req.query; // Get product_id from query params
  
      if (!product_id) {
        return res.status(400).json({ error: "Missing required field: product_id" });
      }
  
      const deletedFood = await Food.findOneAndDelete({ product_id });
  
      if (!deletedFood) {
        return res.status(404).json({ error: "Food item not found" });
      }
  
      res.json({ message: "Food item deleted successfully!", data: deletedFood });
    } catch (error) {
      console.error("Error deleting food:", error);
      res.status(500).json({ error: error.message });
    }
  });

//this function is used to update the inventory of the database after a user clicks "pay" and finalizes their order
//this function is going to match the product name then subtract from the quantity that is in the cart from the amount in the database
app.post('/updateInventory', async (req, res) => {
  try {
      
      const { items } = req.body;
      console.log('Received items for inventory update:', items);
      
      //this iterates through each item in the cart and finds its respective place in the database based on off the product name and subtracts amount thats int cart from database
      for (const item of items) {
          // Find the food item by name 
          const foodItem = await Food.findOne({ product_name: item.name });
          console.log('Found food item:', foodItem);
          
          if (!foodItem) {
              return res.status(404).json({ error: `Product ${item.name} not found` });
          }
          
          // Subtract the cart quantity from the database quantity
          foodItem.quantity = foodItem.quantity - item.quantity;
          await foodItem.save();
          console.log(`Updated quantity for ${foodItem.product_name}. New quantity: ${foodItem.quantity}`);
      }
      
      res.json({ success: true, message: 'Inventory updated successfully' });
  } catch (error) {
      console.error('Error updating inventory:', error);
      res.status(500).json({ error: error.message });
  }
});
  
  
  app.listen(PORT);