import React from 'react'; 
import {useState, useEffect} from 'react'; 
import axios from 'axios'; 
import Header from "../NewHomePage/Header/Header";


export default function UpdatePage(){
    const [info, setInfo] = useState({
        product_id: '',
        product_name: '', 
        category: '', 
        quantity: '',
        price: '',
        description: '',
        location: ''
    }
    ); 
        const getInfo = async () => {
            try{
                const response = await axios.get(`http://localhost:3500/findOne?product_id=${info.product_id}`
                ); 
                setInfo({...info, category: response.data.category,
                    product_name: response.data.product_name,
                    quantity: response.data.quantity,
                    price: response.data.price,
                    description: response.data.description,
                    location: response.data.location
                })
                console.log("thanks"); 
            }
            catch(err){ 
                alert('oh no')
            }
        }
        const updateItem = async () => {
            const item = {
                product_id: info.product_id, 
                product_name: info.product_name,
                category: info.category,
                quantity: parseInt(info.quantity),
                price: parseFloat(info.price),
                description: info.description,
                location: info.location
            }; 
            console.log(item); 
            try{
                await axios.post('http://localhost:3500/updateAnItem', item); 
                alert('thanks'); 
                console.log(item); 
            } catch (error){
                alert('oh no'); 
            }
        }
    return(
    <div>
        <label>Enter Item to Edit       </label>
        <form style={{margin:'10px', padding: '10px'}}>
        <label>Product ID       </label>
        <input style={{marginRight: '100px', border: '2px solid blue'}}
        onChange={(e)=> setInfo({...info, product_id: e.target.value})}type='text' 
        value={info.product_id}
        placeholder='           enter here'/>
    </form>
    <button style={{marginRight: '50px', border: '2px solid blue'}} type='button' onClick={getInfo}>Click to get Info </button>

    <form style={{margin:'10px', padding: '10px'}}>
        <label>Product Name     </label>
        <input style={{marginRight: '130px', border: '2px solid blue'}}
        onChange={(e)=> setInfo({...info, product_name: e.target.value})} type='text'
        value={info.product_name}
        placeholder='           enter here'/>
    </form>

    <form style={{margin:'10px', padding: '10px'}}>
        <label>Category     </label>
        <input style={{marginRight: '92px', border: '2px solid blue'}}
        onChange={(e)=> setInfo({...info, category: e.target.value})} type='text'
        value={info.category}
        placeholder='           enter here'/>
    </form>

    <form style={{margin:'10px', padding: '10px'}}>
        <label >Quantity     </label>
        <input style={{marginRight: '83px', border: '2px solid blue'}}
        onChange={(e)=> setInfo({...info, quantity: e.target.value})} type='number'
        value={info.quantity}
        placeholder='           enter here'/>
    </form>

    <form style={{marginRight:'10px', padding: '10px'}}>
        <label>Price        </label>
        <input style={{marginRight: '50px', border: '2px solid blue'}}
        onChange={(e)=> setInfo({...info, price: e.target.value})} type='number'
        value={info.price}
        placeholder='           enter here'/>
    </form>

    <form style={{margin:'10px', padding: '10px'}}>
        <label>Description      </label>
        <input style={{marginRight: '100px', border: '2px solid blue'}}
        onChange={(e)=> setInfo({...info, description: e.target.value})} type='text'
        value={info.description}
        placeholder='           enter here'/>
    </form>

    <form style={{margin:'10px', padding: '10px'}}>
        <label>Location     </label>
        <input style={{marginRight: '85px', border: '2px solid blue'}}
        onChange={(e)=> setInfo({...info, location: e.target.value})} type='text'
        value={info.location}
        placeholder='           enter here'/>
    </form>

    <form style={{margin:'10px', padding: '10px'}}>
        <button onClick={updateItem} style={{marginRight: '50px', border: '2px solid blue'}}type='button'>Click here to submit</button>
    </form>
</div>
    )
}