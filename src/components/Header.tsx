import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Sparkles, Globe, Sun, Moon } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import CartDrawer from './CartDrawer';

export default function Header() {
  const { totalItems } = useCart();
  const { lang, setLang, store } = useStore();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  
  useEffect(() => {
    const path = location.pathname;
    let title = store?.name || 'C Store Angola';
    
    if (path === '/') {
      title = `Início | ${store?.name || 'C Store Angola'}`;
    } else if (path.startsWith('/produto/')) {
      title = `Produto | ${store?.name || 'C Store Angola'}`;
    } else if (path === '/checkout') {
      title = `Checkout | ${store?.name || 'C Store Angola'}`;
    } else if (path.startsWith('/admin')) {
      title = `Admin | ${store?.name || 'C Store Angola'}`;
    }
    
    document.title = title;
  }, [location, store?.name]);
  
  const defaultPromoText = lang === 'EN' 
    ? "✨ BUY MORE THAN ONE AND GET GRADUAL DISCOUNTS! ✨" 
    : lang === 'FR' 
    ? "✨ ACHETEZ-EN PLUS D'UN ET OBTENEZ DES RÉDUCTIONS PROGRESSIVES ! ✨" 
    : "✨ COMPRE MAIS DE UM E RECEBA DESCONTO GRADUALMENTE! ✨";
    
  const promoText = store?.marquee_text || defaultPromoText;
  
  // Simple state for theme
  const [isDark, setIsDark] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    return true; // Default to dark mode if no preference is saved
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <>
      {!isAdmin && store?.has_marquee !== 0 && (
        <div className="fixed top-0 w-full z-50 bg-gradient-to-r from-emerald-600 to-blue-600 text-white h-8 flex items-center overflow-hidden">
          <div className="flex whitespace-nowrap animate-marquee w-max min-w-full">
            {[...Array(6)].map((_, i) => (
              <span key={i} className="text-xs font-bold tracking-wide uppercase mx-8 flex items-center gap-2">
                {promoText}
              </span>
            ))}
          </div>
        </div>
      )}
      
      <header className={`fixed ${isAdmin || store?.has_marquee === 0 ? 'top-0' : 'top-8'} w-full z-40 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-black/5 dark:border-white/10 transition-all`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <Link 
            to={store?.slug && store.slug !== 'main' ? `/store/${store.slug}` : "/"}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2 sm:gap-3 font-semibold text-base sm:text-lg tracking-tight hover:opacity-80 transition-opacity text-left"
          >
            <img 
              src={store?.logo || "https://i.postimg.cc/Wp9dFKRm/Adobe-Express-file.png"} 
              alt={`Logo ${store?.name || 'da Loja'}`} 
              className="h-8 w-8 sm:h-10 sm:w-10 object-contain rounded-xl"
              referrerPolicy="no-referrer"
            />
            <span className="hidden sm:block">{store?.name || 'C Store Angola'}</span>
          </Link>
          <div className="flex items-center gap-1 sm:gap-4">
            {isAdmin && (
              <Link 
                to={store?.slug && store.slug !== 'main' ? `/store/${store.slug}` : "/"}
                className="hidden sm:flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded-full transition-colors text-xs font-medium mr-2"
              >
                Ver Loja
              </Link>
            )}
            <div className="relative group">
              <button className="flex items-center gap-1 bg-zinc-50 dark:bg-zinc-900 rounded-full px-3 py-1.5 border border-black/10 dark:border-white/10 text-xs font-medium text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                <Globe className="w-3.5 h-3.5" />
                {lang}
              </button>
              <div className="absolute top-full right-0 mt-2 w-24 bg-zinc-50 dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 overflow-hidden">
                {['PT', 'EN', 'FR'].map((l) => (
                  <button
                    key={l}
                    onClick={() => setLang(l as 'PT' | 'EN' | 'FR')}
                    className={`w-full text-left px-4 py-2 text-xs font-medium transition-colors ${
                      lang === l ? 'bg-black/5 dark:bg-white/10 text-zinc-900 dark:text-white' : 'text-zinc-600 dark:text-zinc-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    {l === 'PT' ? 'Português' : l === 'EN' ? 'English' : 'Français'}
                  </button>
                ))}
              </div>
            </div>
            <button 
              onClick={toggleTheme}
              className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors rounded-full hover:bg-black/5 dark:hover:bg-zinc-800"
              title="Alternar Tema"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            
            {!isAdmin && (
              <>
                <button 
                  onClick={() => setIsCartOpen(true)}
                  className="relative p-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                >
                  <ShoppingCart className="w-6 h-6" />
                  {totalItems > 0 && (
                    <span className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </header>
      
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
