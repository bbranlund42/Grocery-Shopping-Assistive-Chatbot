import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./components/App/App";
import LoginPage from "./components/LoginPage/LoginPage";
import HomePage from "./components/HomePage/HomePage";
import CreateAccount from "./components/CreateAccount/CreateAccount";
import SearchShopping from "./components/SearchShopping/SearchShopping";
import ShoppingCartCheckout from "./components/ShoppingCartCheckout/ShoppingCartCheckout";
import JustChatting from "./components/JustChatting/JustChatting";
import CapMap from "./components/CapMap/CapMap";
import NavigatePage from "./components/NavigatePage/NavigatePage";
import NewHomePage from "./components/NewHomePage/Home/Home";
import reportWebVitals from "./reportWebVitals";
import Order_History from "./components/Order_history/Order_History";
import DevPage from "./components/DevPage/devPage"; 
import { BrowserRouter, Route, Routes } from "react-router-dom";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route index element={<App />} />
        <Route path="/" element={<NewHomePage />} />
        <Route path="LoginPage" element={<LoginPage />} />
        <Route path="HomePage" element={<HomePage />} />
        <Route path="CreateAccount" element={<CreateAccount />} />
        <Route path="SearchShopping" element={<SearchShopping />} />
        <Route path="cart" element={<ShoppingCartCheckout />} />
        <Route path="CapMap" element={<CapMap />} />
        <Route path="NavigatePage" element={<NavigatePage />} />
        <Route path="JustChatting" element={<JustChatting />} />
        <Route path= "Order_History" element={<Order_History/>}/>
        <Route path="DevPage" element={<DevPage/>}/>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
