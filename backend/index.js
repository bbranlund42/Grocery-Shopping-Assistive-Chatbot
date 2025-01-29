// Peyton Rushing
// 6/24/2021
// used this file to to test get,post, and delete requests
const database =
'mongodb+srv://user:123@capgemini.zcb5v.mongodb.net/?retryWrites=true&w=majority&appName=CapGemini'; 
import mongoose from 'mongoose'; 
import express  from 'express'; 
const PORT = 3500; 

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
    }
}); 

const Food = mongoose.model('Food', FoodSchema);

app.get('/data', async (req, res) => {
    try {
      const items = await Food.find(); // Replace with your Mongoose model
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

app.post('/addNewFood', async (req,res) => {
    try{
        const {product_id, product_name, category, quantity, price, description} = req.query;
        const newFood = new Food({product_id, product_name, category, quantity, price, description});

        const savedFood = await newFood.save();
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

  
  app.listen(PORT);