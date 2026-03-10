import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, useStore } from './StoreContext';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  subtotal: number;
  totalDiscount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { store } = useStore();
  const storeId = store?.id || localStorage.getItem('storeId') || 'default';
  const cartKey = `cart_${storeId}`;

  const [items, setItems] = useState<CartItem[]>(() => {
    // Migrate old cart if it exists
    const oldCart = localStorage.getItem('cart');
    if (oldCart && cartKey === 'cart_7234568' && !localStorage.getItem('cart_7234568')) {
      localStorage.setItem('cart_7234568', oldCart);
      localStorage.removeItem('cart');
    }
    
    const saved = localStorage.getItem(cartKey);
    return saved ? JSON.parse(saved) : [];
  });
  const [currentCartKey, setCurrentCartKey] = useState(cartKey);

  // Reset cart immediately when store changes (render-phase state update)
  if (cartKey !== currentCartKey) {
    // Migrate old cart if it exists
    const oldCart = localStorage.getItem('cart');
    if (oldCart && cartKey === 'cart_7234568' && !localStorage.getItem('cart_7234568')) {
      localStorage.setItem('cart_7234568', oldCart);
      localStorage.removeItem('cart');
    }

    const saved = localStorage.getItem(cartKey);
    setItems(saved ? JSON.parse(saved) : []);
    setCurrentCartKey(cartKey);
  }

  // Save cart when items change
  useEffect(() => {
    localStorage.setItem(currentCartKey, JSON.stringify(items));
  }, [items, currentCartKey]);

  const addToCart = (product: Product, quantity: number) => {
    setItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const removeFromCart = (productId: string) => {
    setItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return;
    setItems(prev => prev.map(item => 
      item.product.id === productId ? { ...item, quantity } : item
    ));
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  
  const subtotal = items.reduce((acc, item) => {
    const priceNumber = parseInt(item.product.price.replace(/\D/g, ''), 10);
    return acc + (priceNumber * item.quantity);
  }, 0);

  const totalDiscount = items.reduce((acc, item) => {
    let discount = 0;
    if (item.product.hasProgressiveDiscount) {
      if (item.quantity === 2) discount = 2000;
      else if (item.quantity === 3) discount = 3000;
      else if (item.quantity >= 4) discount = 5000;
    }
    return acc + discount;
  }, 0);

  const totalPrice = subtotal - totalDiscount;

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      totalItems,
      totalPrice,
      subtotal,
      totalDiscount
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
