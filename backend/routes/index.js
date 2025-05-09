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
    },
    discount: {
        type: Number
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

app.get('/findOne', async (req, res) => {
  try {
    // for some reason, the get request really did not like req.body so I used req.query using the 
    const item = req.query.product_id; 
    // info will return an object 
    const info = await Food.findOne({product_id: item});
    // send the object back to frontend to read 
    res.json(info); 
  } catch (error) {
    res.status(500).json({ error: error.message})
  }

}); 

app.get('/findByDiscount' ,async (req, res) =>{
  try{
    const item = await Food.find({discount: { $gt: 0 }})
    console.log(item)
    res.json(item)
  } catch (error){
    res.status(500).json({ error: error.message})
  }
});
app.post('/updateAnItem', async (req, res) => {
  try{
    // everything sent will be within req.body._____
    // define text that will be used later
    const text = (`
Product ID: ${req.body.product_id}
Product Name: ${req.body.product_name}
Category: ${req.body.category}
Quantity: ${req.body.quantity}
Price: ${req.body.price}
Description: ${req.body.description}
Location: ${req.body.location}
Discount: ${req.body.discount}`
    ); 
    // this will update all the fields 
    const result = await Food.updateOne(
      {product_id: req.body.product_id }, 
      {
        product_name: req.body.product_name, 
        category: req.body.category,
        quantity: req.body.quantity,
        price: req.body.price,
        description: req.body.description,
        location: req.body.location,
        discount: req.body.discount
      }
      // update the text embedding
      ); 
      const res2 = await Food.updateOne(
        {product_id: req.body.product_id}, 
        {$set: {'text': text}}, 
        {strict: false}
    ); 
    // update the number embedding
    const embedding = await embedding_model.embedQuery(req.body.product_name); 
    const embed = await Food.updateOne(
      {product_id: req.body.product_id}, 
      {$set: {'embedding': embedding} }, 
      {strict: false}
      ); 

      res.status(20).json({message: 'joe'})
  } catch (error){
    res.status(500).json({ error: error.message})
  }
}); 

app.post('/addNewFood', async (req,res) => {
    try{        
        const {product_id, product_name, category, quantity, price, description, location, discount} = req.body;
        //const {product_id, product_name, category, quantity, price, description, location} = req.query;
        const newFood = new Food({product_id, product_name, category, quantity, price, description, location, discount});
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
Location: ${newFood['location']}
Discount: ${newFood['discount']}`
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
  

// need to find out if the discount can by updated though here
app.put('/updateDiscount', async (req, res) => {
    try {
        const { product_id, discount } = req.body;
        if (!product_id || !discount) {
            return res.status(400).json({ error: "Missing required fields: product_id or discount" });
        }
        
        const updatedFood = await Food.findOneAndUpdate(
            { product_id },
            { discount },
            { new: true } // Return the updated document
        );
        
        if (!updatedFood) {
            return res.status(404).json({ error: "Food item not found" });
        }
        
        res.json({ message: "Discount updated successfully!", data: updatedFood });
    } catch (error) {
        console.error("Error updating discount:", error);
        res.status(500).json({ error: error.message });
    }
});
// add discount to add item api call so it can be vecotrized
// need to postman call to test discount, bens bread is the only one with a discount currently
// update ui to dev page
// need to add discount section to ui
  
  app.listen(PORT);