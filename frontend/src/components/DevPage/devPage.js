import React from 'react'; 
import {useState, useEffect} from 'react'; 
import axios from 'axios'; 
import Header from "../NewHomePage/Header/Header";


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
    <div className="bg-white min-h-screen flex flex-col items-center">
        <Header />
        <form style={{margin:'10px', padding: '10px'}}>
            <label>Product ID       </label>
            <input style={{marginRight: '100px', border: '2px solid blue'}}
            onChange={(e)=> setItem({...item, product_id: e.target.value})}type='text' 
            value={item.product_id}
            placeholder='           enter here'/>
        </form>

        <form style={{margin:'10px', padding: '10px'}}>
            <label>Product Name     </label>
            <input style={{marginRight: '130px', border: '2px solid blue'}}
            onChange={(e)=> setItem({...item, product_name: e.target.value})} type='text'
            value={item.product_name}
            placeholder='           enter here'/>
        </form>

        <form style={{margin:'10px', padding: '10px'}}>
            <label>Category     </label>
            <input style={{marginRight: '92px', border: '2px solid blue'}}
            onChange={(e)=> setItem({...item, category: e.target.value})} type='text'
            value={item.category}
            placeholder='           enter here'/>
        </form>

        <form style={{margin:'10px', padding: '10px'}}>
            <label >Quantity     </label>
            <input style={{marginRight: '83px', border: '2px solid blue'}}
            onChange={(e)=> setItem({...item, quantity: e.target.value})} type='number'
            value={item.quantity}
            placeholder='           enter here'/>
        </form>

        <form style={{marginRight:'10px', padding: '10px'}}>
            <label>Price        </label>
            <input style={{marginRight: '50px', border: '2px solid blue'}}
            onChange={(e)=> setItem({...item, price: e.target.value})} type='number'
            value={item.price}
            placeholder='           enter here'/>
        </form>

        <form style={{margin:'10px', padding: '10px'}}>
            <label>Description      </label>
            <input style={{marginRight: '100px', border: '2px solid blue'}}
            onChange={(e)=> setItem({...item, description: e.target.value})} type='text'
            value={item.description}
            placeholder='           enter here'/>
        </form>

        <form style={{margin:'10px', padding: '10px'}}>
            <label>Location     </label>
            <input style={{marginRight: '85px', border: '2px solid blue'}}
            onChange={(e)=> setItem({...item, location: e.target.value})} type='text'
            value={item.location}
            placeholder='           enter here'/>
        </form>

        <form style={{margin:'10px', padding: '10px'}}>
            <button style={{marginRight: '50px', border: '2px solid blue'}}type='button' onClick={addItem}>Click here to submit</button>
        </form>
    </div>
); 
}; 
