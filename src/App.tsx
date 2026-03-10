import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Home from './pages/Home';
import Admin from './pages/Admin';
import StoreDashboard from './pages/StoreDashboard';
import ProductDetails from './pages/ProductDetails';
import Checkout from './pages/Checkout';
import RegisterStore from './pages/RegisterStore';
import Login from './pages/Login';
import { StoreProvider } from './context/StoreContext';
import { CartProvider } from './context/CartContext';
import ChatAgent from './components/ChatAgent';

export default function App() {
  React.useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const isDark = savedTheme ? savedTheme === 'dark' : true; // Default to dark mode
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, []);

  return (
    <Router>
      <StoreProvider>
        <CartProvider>
          <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 font-sans selection:bg-blue-500/30 flex flex-col transition-colors duration-300 overflow-x-hidden">
            <Toaster position="top-center" toastOptions={{ className: 'dark:bg-zinc-800 dark:text-white' }} />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/store/:slug" element={<Home />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/store-dashboard" element={<StoreDashboard />} />
              <Route path="/produto/:id" element={<ProductDetails />} />
              <Route path="/store/:slug/produto/:id" element={<ProductDetails />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/store/:slug/checkout" element={<Checkout />} />
              <Route path="/register" element={<RegisterStore />} />
              <Route path="/login" element={<Login />} />
            </Routes>
            <ChatAgent />
          </div>
        </CartProvider>
      </StoreProvider>
    </Router>
  );
}
