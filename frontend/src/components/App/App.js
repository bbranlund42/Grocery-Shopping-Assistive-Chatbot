import React from 'react';
import LoginPage from '../LoginPage/LoginPage';
import Header from '../NewHomePage/Header/Header';
import AppRoutes from '../AppRoutes/AppRoutes';
// import HomePage from './components/HomePage/HomePage';

function App() {
  // return <HomePage />;
    return(
    <div>
      <Header />
      <AppRoutes />
    </div>
  );
}

export default App;
