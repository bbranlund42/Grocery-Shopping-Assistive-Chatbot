import React from 'react'; 
import {useState, useEffect} from 'react'; 
import axios from 'axios'; 

export default function DevPage(){
    const [item, setItem] = useState({
        product_id: '',
        product_name: '', 
        category: '', 
        quantity: '',
        price: '',
        description: '',
        location: ''
    });

    const addItem = async () => {
        const newItem = {
            product_id: item.product_id, 
            product_name: item.product_name,
            category: item.category,
            quantity: parseInt(item.quantity),
            price: parseFloat(item.price),
            description: item.description,
            location: item.location
        }

        console.log(newItem)
        try{
            await axios.post('http://localhost:3500/addNewFood', newItem); 
            alert("thanks"); 
        }
        catch(err){ 
            alert('oh no')
        }
    }

    return (
    <div>
        <form>
        <label>Product ID</label>
        <input onChange={(e)=> setItem({...item, product_id: e.target.value})}type='text' value={item.product_id}
            placeholder='   product_id'/>
        </form>

        <form>
        <label>Product Name</label>
        <input onChange={(e)=> setItem({...item, product_name: e.target.value})} type='text'
        value={item.product_name}
        placeholder='   product_name'/>
        </form>

        <form>
        <label>Category</label>
        <input onChange={(e)=> setItem({...item, category: e.target.value})} type='text'
        value={item.category}
        placeholder='   category'/>
        </form>

        <form>
        <label>Quantity</label>
        <input onChange={(e)=> setItem({...item, quantity: e.target.value})} type='number'
        value={item.quantity}
        placeholder='   enter here'/>
        </form>

        <form>
        <label>Price</label>
        <input onChange={(e)=> setItem({...item, price: e.target.value})} type='number'
        value={item.price}
        placeholder='   enter here'/>
        </form>

        <form>
        <label>Description</label>
        <input onChange={(e)=> setItem({...item, description: e.target.value})} type='text'
        value={item.description}
        placeholder='   enter here'/>
        </form>

        <form>
        <label>Location</label>
        <input onChange={(e)=> setItem({...item, location: e.target.value})} type='text'
        value={item.location}
        placeholder='   location'/>
        </form>
        <button onClick={addItem}>Click here to submit</button>
    </div>
); 
}; 
