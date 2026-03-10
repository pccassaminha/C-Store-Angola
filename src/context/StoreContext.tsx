import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Product {
  id: string;
  name: string;
  shortDesc: string;
  price: string;
  image: string;
  images?: string[];
  fullDesc: string;
  detailedDesc?: string;
  status?: string;
  active?: boolean;
  specs?: { label: string; value: string }[];
  features?: string[];
  hasProgressiveDiscount?: boolean;
}

interface StoreContextType {
  products: Product[];
  knowledge: string;
  store: { id: string, name: string, slug: string, logo: string | null, whatsapp: string | null } | null;
  refreshStore: () => Promise<void>;
  isLoading: boolean;
  lang: string;
  setLang: (lang: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [knowledge, setKnowledge] = useState<string>('');
  const [store, setStore] = useState<{ id: string, name: string, slug: string, logo: string | null, whatsapp: string | null } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lang, setLang] = useState('PT');

  const refreshStore = async () => {
    try {
      let storeId = localStorage.getItem('storeId');
      if (!storeId || storeId === 'null' || storeId === 'undefined' || storeId === 'main') {
        storeId = '7234568';
        localStorage.setItem('storeId', '7234568');
      }
      
      const [productsRes, knowledgeRes, storeRes] = await Promise.all([
        fetch(`/api/products?storeId=${storeId}`),
        fetch(`/api/knowledge?storeId=${storeId}`),
        fetch(`/api/store/${storeId}`)
      ]);
      
      if (productsRes.ok) {
        const data = await productsRes.json();
        setProducts(data);
      }
      
      if (knowledgeRes.ok) {
        const data = await knowledgeRes.json();
        setKnowledge(data.content);
      }

      if (storeRes.ok) {
        const data = await storeRes.json();
        setStore(data);
      }
    } catch (error) {
      console.error('Failed to fetch store data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshStore();
  }, []);

  return (
    <StoreContext.Provider value={{ products, knowledge, store, refreshStore, isLoading, lang, setLang }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
