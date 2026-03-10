import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Battery, 
  CheckCircle2, 
  Phone, 
  MessageCircle, 
  ShoppingCart,
  Zap,
  Clock,
  ChevronLeft,
  ChevronRight,
  Settings,
  Minus,
  Plus,
  MapPin,
  TrendingUp,
  ShoppingBag,
  Sparkles,
  Store,
  Globe,
  Moon,
  Sun
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import toast from 'react-hot-toast';

// Fake Purchase Popup Component
const names = [
  'João', 'Maria', 'Pedro', 'Ana', 'Carlos', 'Marta', 'Rui', 'Sofia', 'Miguel', 'Inês', 'Paulo', 'Teresa',
  'Francisco', 'António', 'Cláudio', 'Benvinda', 'Eunice', 'Kiara', 'Yuri', 'Edmilson', 'Nayma', 'Avelino',
  'Januário', 'Catarina', 'Mauro', 'Tatiana', 'Ladislau', 'Gisela', 'Helga', 'Vicente', 'Adelaide', 'Nelson',
  'Arlindo', 'Conceição', 'Domingos', 'Esperança', 'Feliciano', 'Glória', 'Henrique', 'Isabel', 'Joaquim',
  'Laurinda', 'Manuel', 'Noémia', 'Osvaldo', 'Patrícia', 'Quintino', 'Rosa', 'Sebastião', 'Uíge', 'Valter',
  'Zuleica', 'Edson', 'Jandira', 'Silvio', 'Yola', 'Celsio', 'Bruna', 'Hamilton', 'Kátia', 'Nuno', 'Vanda'
];

const locations = [
  'Luanda', 'Benguela', 'Huambo', 'Lubango', 'Cabinda', 'Talatona', 'Viana', 'Kilamba',
  'Miramar', 'Alvalade', 'Maianga', 'Patriota', 'Benfica', 'Ilha do Cabo', 'Samba', 'Morro Bento',
  'Nova Vida', 'Sequele', 'Lobito', 'Camama', 'Mutamba'
];

function PurchasePopup({ productName }: { productName: string }) {
  const [visible, setVisible] = useState(false);
  const [data, setData] = useState({ name: '', location: '', time: '' });

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const showPopup = () => {
      const name = names[Math.floor(Math.random() * names.length)];
      const location = locations[Math.floor(Math.random() * locations.length)];
      const time = Math.floor(Math.random() * 50) + 2; // 2 to 51 min ago
      
      setData({ name, location, time: `${time} min atrás` });
      setVisible(true);
      
      // Hide after 4 seconds (slightly shorter visibility)
      setTimeout(() => {
        setVisible(false);
      }, 4000);
      
      // Schedule next popup (longer interval: 25-45s)
      timeoutId = setTimeout(showPopup, Math.random() * 20000 + 25000); 
    };

    // Initial delay (longer: 8-15s)
    timeoutId = setTimeout(showPopup, Math.random() * 7000 + 8000); 

    return () => clearTimeout(timeoutId);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-4 left-4 right-4 sm:right-auto z-50 bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 shadow-2xl rounded-xl p-3 sm:p-4 flex items-center gap-3 sm:gap-4 animate-in slide-in-from-bottom-5 fade-in duration-500 sm:max-w-sm">
      <div className="bg-emerald-500/20 p-1.5 sm:p-2 rounded-full shrink-0">
        <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 truncate">
          <span className="font-semibold text-zinc-900 dark:text-white">{data.name}</span> de {data.location}
        </p>
        <p className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
          Comprou {productName}
        </p>
        <p className="text-[9px] sm:text-[10px] text-emerald-500 dark:text-emerald-400 mt-1 font-medium">
          {data.time}
        </p>
      </div>
    </div>
  );
}

export default function ProductDetails() {
  const { slug, id } = useParams<{ slug: string; id: string }>();
  const storeContext = useStore();
  const [storeInfo, setStoreInfo] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { lang } = storeContext;
  
  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        const res = await fetch(`/api/storefront/${slug}`);
        if (res.ok) {
          const data = await res.json();
          setStoreInfo(data.store);
          setProducts(data.products);
        } else {
          setError('Store not found');
        }
      } catch (error) {
        setError('An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchStoreData();
    } else {
      setStoreInfo(storeContext.store);
      setProducts(storeContext.products);
      setLoading(storeContext.isLoading);
    }
  }, [slug, storeContext.store, storeContext.products, storeContext.isLoading]);

  const product = products.find(p => p.id === id);
  
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [stock, setStock] = useState(0);
  const { addToCart, totalItems } = useCart();
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const toggleLang = () => {
    storeContext.setLang(lang === 'PT' ? 'EN' : lang === 'EN' ? 'FR' : 'PT');
  };

  useEffect(() => {
    if (!loading && (!product || product.status === 'inactive')) {
      navigate(slug ? `/store/${slug}` : '/');
    }
  }, [loading, product, navigate, slug]);

  useEffect(() => {
    window.scrollTo(0, 0);
    setSelectedImage(0);
    setQuantity(1);
    // Generate a random stock number between 5 and 15
    setStock(Math.floor(Math.random() * 11) + 5);
  }, [id]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!product?.images || product.images.length <= 1) return;
      
      if (e.key === 'ArrowLeft') {
        setSelectedImage((prev) => (prev > 0 ? prev - 1 : product.images!.length - 1));
      } else if (e.key === 'ArrowRight') {
        setSelectedImage((prev) => (prev < product.images!.length - 1 ? prev + 1 : 0));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [product]);

  if (loading) {
    return (
      <main className="pt-32 pb-20 flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </main>
    );
  }

  if (error || !product || product.status === 'inactive') {
    return (
      <main className="pt-32 pb-20 flex-1 text-center">
        <h1 className="text-3xl font-bold mb-4">Produto não encontrado ou indisponível</h1>
        <Link to={slug ? `/store/${slug}` : '/'} className="text-blue-500 hover:underline">Voltar para a loja</Link>
      </main>
    );
  }

  const upsellProducts = products.filter(p => p.id !== id && (p.status === 'active' || !p.status));

  const priceNumber = parseInt(product.price.replace(/\D/g, ''), 10);
  let discount = 0;
  if (product.hasProgressiveDiscount) {
    if (quantity === 2) discount = 2000;
    else if (quantity === 3) discount = 3000;
    else if (quantity >= 4) discount = 5000;
  }
  
  const totalPriceNumber = (priceNumber * quantity) - discount;
  const totalPrice = new Intl.NumberFormat('pt-BR').format(totalPriceNumber) + ' Kz';

  const handleBuyNow = () => {
    addToCart(product, quantity);
    navigate(slug ? `/store/${slug}/checkout` : '/checkout');
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
    toast.success('Adicionado ao carrinho com sucesso!');
  };

  const handleWhatsAppReservation = () => {
    if (!storeInfo?.whatsapp) {
      toast.error('Número de WhatsApp não configurado para esta loja.');
      return;
    }
    
    const phoneNumber = storeInfo.whatsapp.replace(/\D/g, ''); // Remove non-numeric characters
    const message = `Olá, quero encomendar ${quantity}x ${product.name}.\nO total é ${totalPrice}.\n\nLink do produto: ${window.location.href}`;
    const encodedMessage = encodeURIComponent(message);
    
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0a0a0a] text-zinc-900 dark:text-white selection:bg-blue-500/30 flex flex-col">
      {/* Sticky Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md border-b border-black/5 dark:border-white/5">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors shrink-0">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <Link to={slug ? `/store/${slug}` : '/'} className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity min-w-0">
              <img 
                src={storeInfo?.logo || "https://i.postimg.cc/Wp9dFKRm/Adobe-Express-file.png"} 
                alt={storeInfo?.name || 'Loja'} 
                className="w-8 h-8 rounded-full object-cover shrink-0" 
                referrerPolicy="no-referrer" 
              />
              <span className="font-semibold text-zinc-900 dark:text-white truncate max-w-[120px] sm:max-w-xs">
                {storeInfo?.name || 'C Store Angola'}
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button 
              onClick={toggleLang}
              className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-sm font-medium"
            >
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline">{lang}</span>
            </button>
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <Link 
              to={slug ? `/store/${slug}/checkout` : '/checkout'}
              className="relative p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-20 flex-1">
      {/* Product Hero (Photos & Basic Info) */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-start">
          {/* Photos */}
          <div className="flex flex-col gap-3 sm:gap-4 w-full mx-auto min-w-0">
            {/* Main Image */}
            <div className="bg-zinc-50 dark:bg-zinc-900 rounded-2xl sm:rounded-3xl overflow-hidden border border-black/5 dark:border-white/10 aspect-square w-full relative group shadow-sm dark:shadow-none flex items-center justify-center">
              <img 
                src={product.images ? product.images[selectedImage] : product.image} 
                alt={product.name} 
                className="w-full h-full object-contain transition-opacity duration-300"
                referrerPolicy="no-referrer"
              />
              
              {/* Navigation Arrows */}
              {product.images && product.images.length > 1 && (
                <>
                  <button 
                    onClick={() => setSelectedImage((prev) => (prev > 0 ? prev - 1 : product.images!.length - 1))}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm"
                    aria-label="Imagem anterior"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button 
                    onClick={() => setSelectedImage((prev) => (prev < product.images!.length - 1 ? prev + 1 : 0))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm"
                    aria-label="Próxima imagem"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                  
                  {/* Dot Indicators */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/30 px-3 py-2 rounded-full backdrop-blur-sm">
                    {product.images.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(idx)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          selectedImage === idx ? 'bg-white w-4' : 'bg-white/50 hover:bg-white/80'
                        }`}
                        aria-label={`Ir para a imagem ${idx + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
            {/* Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 custom-scrollbar snap-x w-full">
                {product.images.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onMouseEnter={() => setSelectedImage(idx)}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-lg sm:rounded-xl overflow-hidden border-2 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-zinc-950 snap-start bg-zinc-50 dark:bg-zinc-900 ${
                      selectedImage === idx ? 'border-blue-500 opacity-100 ring-2 ring-blue-500 ring-offset-2 ring-offset-zinc-950' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Info */}
          <div className="flex flex-col justify-center h-full min-w-0">
            {id === 'yyk-q16' && (
              <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-500 dark:text-blue-400 text-xs sm:text-sm font-medium mb-4 border border-blue-500/20 w-fit">
                <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Tradução em Tempo Real</span>
              </div>
            )}
            <h1 className="text-xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-3 sm:mb-4 text-zinc-900 dark:text-white leading-tight break-words">
              {product.name}
            </h1>
            {product.hasProgressiveDiscount && (
              <div className="inline-flex items-center gap-1 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] sm:text-sm font-bold px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-md mb-3 sm:mb-4 w-fit">
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                {lang === 'EN' ? 'Progressive Discount Available' : lang === 'FR' ? 'Réduction Progressive Disponible' : 'Desconto Progressivo Disponível'}
              </div>
            )}
            <div className="flex items-baseline gap-2 sm:gap-3 mb-2">
              <p className="text-xl sm:text-2xl md:text-3xl text-emerald-600 dark:text-emerald-400 font-bold">{totalPrice}</p>
              {quantity > 1 && (
                <p className="text-zinc-500 text-sm sm:text-lg line-through">{new Intl.NumberFormat('pt-BR').format(priceNumber * quantity)} Kz</p>
              )}
            </div>
            {quantity > 1 && (
              <div className="inline-block bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] sm:text-xs font-bold px-2 py-1 rounded mb-4 sm:mb-6">
                Desconto de {new Intl.NumberFormat('pt-BR').format(discount)} Kz aplicado!
              </div>
            )}
            {quantity === 1 && <div className="mb-4 sm:mb-6"></div>}
            
            {/* Stock Indicator */}
            <div className="flex items-center gap-1.5 sm:gap-2 mb-2 text-[10px] sm:text-sm font-medium">
              <div className="relative flex h-2.5 w-2.5 sm:h-3 sm:w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 bg-red-500"></span>
              </div>
              <span className="text-red-500 dark:text-red-400">Apenas {stock} unidades em stock!</span>
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-red-500 dark:text-red-400 ml-0.5 sm:ml-1" />
              <span className="text-zinc-300 dark:text-zinc-600 mx-1">|</span>
              <span className="text-zinc-500 dark:text-zinc-400">🔥 {Math.abs(product.id.split('').reduce((a: number,b: string)=>{a=((a<<5)-a)+b.charCodeAt(0);return a&a},0)) % 5000 + 1500} vendidos</span>
            </div>

            {storeInfo?.address && (
              <div className="flex items-center gap-1.5 mb-4 sm:mb-6 text-[10px] sm:text-sm text-zinc-500 dark:text-zinc-400">
                <MapPin className="w-4 h-4 text-emerald-500" />
                <span>De {storeInfo.address}</span>
              </div>
            )}

            <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base mb-6 sm:mb-8 leading-relaxed">
              {product.shortDesc}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center w-full">
              <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-black/5 dark:border-white/10 p-1 w-full sm:w-auto justify-center sm:justify-start shrink-0">
                <button 
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-12 h-10 sm:w-10 sm:h-10 flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors"
                  aria-label="Diminuir quantidade"
                >
                  <Minus className="w-5 h-5 sm:w-4 sm:h-4" />
                </button>
                <span className="w-16 sm:w-12 text-center font-medium text-base sm:text-base text-zinc-900 dark:text-white">{quantity}</span>
                <button 
                  onClick={() => setQuantity(q => q + 1)}
                  className="w-12 h-10 sm:w-10 sm:h-10 flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors"
                  aria-label="Aumentar quantidade"
                >
                  <Plus className="w-5 h-5 sm:w-4 sm:h-4" />
                </button>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full flex-1 min-w-0">
                <button 
                  onClick={handleAddToCart}
                  className="bg-zinc-800 dark:bg-zinc-800 hover:bg-zinc-700 dark:hover:bg-zinc-700 text-white font-semibold py-2.5 sm:py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition-colors border border-black/10 dark:border-white/10 flex-1 text-center text-[13px] sm:text-sm truncate"
                >
                  <ShoppingBag className="w-4 h-4 shrink-0" />
                  <span className="truncate">Adicionar ao Carrinho</span>
                </button>
                <button 
                  onClick={handleBuyNow}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 sm:py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-900/20 flex-1 text-center text-[13px] sm:text-sm truncate"
                >
                  <ShoppingCart className="w-4 h-4 shrink-0" />
                  <span className="truncate">Comprar Agora</span>
                </button>
              </div>
            </div>
            
            <div className="mt-6 sm:mt-4 flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-medium w-full">
              <span className="flex items-center gap-1 whitespace-nowrap"><span className="text-xl">🚚</span> Entrega grátis</span>
              <span className="text-zinc-300 dark:text-zinc-600 hidden sm:inline">|</span>
              <span className="flex items-center gap-1 whitespace-nowrap"><span className="text-xl">💵</span> Pagamento na entrega</span>
              <span className="text-zinc-300 dark:text-zinc-600 hidden sm:inline">|</span>
              <span className="flex items-center gap-1 whitespace-nowrap"><span className="text-xl">🛡️</span> Garantia de 7 dias</span>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Detailed Description Section (Replaces the hardcoded ones) */}
      {(product.detailedDesc || (product.features && product.features.length > 0) || (product.specs && product.specs.length > 0)) && (
        <section className="max-w-5xl mx-auto px-6 py-16 border-t border-black/5 dark:border-white/10">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
              <h3 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-zinc-900 dark:text-white">{product.name}</h3>
              {product.detailedDesc && (
                <p className="text-zinc-600 dark:text-zinc-400 text-base sm:text-lg mb-6 sm:mb-8 leading-relaxed whitespace-pre-wrap">
                  {product.detailedDesc}
                </p>
              )}
              
              {product.features && product.features.length > 0 && (
                <div className="space-y-3 sm:space-y-4">
                  {product.features.map((feature: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-2 sm:gap-3">
                      <div className="text-emerald-500 shrink-0 mt-0.5">
                        <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <span className="text-zinc-700 dark:text-zinc-300 text-sm md:text-base">{feature}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {product.specs && product.specs.length > 0 && (
              <div className="bg-zinc-50 dark:bg-[#111] rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-black/5 dark:border-white/5 sticky top-24 shadow-sm dark:shadow-none">
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
                  <h4 className="text-lg sm:text-xl font-semibold text-zinc-900 dark:text-white">Especificações Técnicas</h4>
                </div>
                
                <ul className="space-y-4 sm:space-y-6">
                  {product.specs.map((spec: any, idx: number) => (
                    <li key={idx} className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-3 sm:pb-4 last:border-0 last:pb-0">
                      <span className="text-zinc-500 dark:text-zinc-400 text-sm md:text-base">{spec.label}</span>
                      <span className="font-medium text-right text-sm md:text-base text-zinc-900 dark:text-white">{spec.value}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Specific YYK-Q16 Content (Videos) */}
      {id === 'yyk-q16' && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16 text-center border-t border-black/5 dark:border-white/10">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-12 text-zinc-900 dark:text-white">
            Tutoriais de Configuração
          </h2>

          <div className="max-w-3xl mx-auto space-y-8 sm:space-y-12">
            <div className="bg-zinc-50 dark:bg-[#111] rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-black/5 dark:border-white/5 shadow-sm dark:shadow-none">
              <h3 className="text-lg sm:text-xl font-medium mb-6 text-zinc-900 dark:text-white">
                Primeira forma de configurar o auricular
              </h3>
              <div className="rounded-xl sm:rounded-2xl overflow-hidden bg-black aspect-[9/16] max-w-sm mx-auto relative shadow-inner">
                <iframe 
                  src="https://fast.wistia.net/embed/iframe/r7m8fsrh3y?videoFoam=true" 
                  title="Tutorial Vertical" 
                  allow="autoplay; fullscreen" 
                  frameBorder="0" 
                  className="absolute top-0 left-0 w-full h-full"
                ></iframe>
              </div>
            </div>

            <div className="bg-zinc-50 dark:bg-[#111] rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-black/5 dark:border-white/5 shadow-sm dark:shadow-none">
              <h3 className="text-lg sm:text-xl font-medium mb-6 text-zinc-900 dark:text-white">
                Segunda forma de configurar o auricular
              </h3>
              <div className="rounded-xl sm:rounded-2xl overflow-hidden bg-black aspect-video relative shadow-inner">
                <iframe 
                  src="https://fast.wistia.net/embed/iframe/r7m8fsrh3y?videoFoam=true" 
                  title="Tutorial Horizontal" 
                  allow="autoplay; fullscreen" 
                  frameBorder="0" 
                  className="absolute top-0 left-0 w-full h-full"
                ></iframe>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Upsell Section */}
      {upsellProducts.length > 0 && (
        <section id="outros-produtos" className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24 border-t border-black/5 dark:border-white/5">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-zinc-900 dark:text-white tracking-tight">Aproveite também estas ofertas</h2>
            <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 font-light">Adicione estes produtos incríveis ao seu pedido.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {upsellProducts.map((p) => (
              <div key={p.id} className="bg-white dark:bg-[#111] border border-black/5 dark:border-white/5 rounded-2xl overflow-hidden flex flex-col hover:bg-zinc-50 dark:hover:bg-[#1a1a1a] transition-all duration-300 shadow-sm hover:shadow-md dark:shadow-none group">
                <Link to={slug ? `/store/${slug}/produto/${p.id}` : `/produto/${p.id}`} className="aspect-square bg-zinc-100 dark:bg-zinc-800 overflow-hidden block relative flex items-center justify-center">
                  <img 
                    src={p.image} 
                    alt={p.name} 
                    className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                </Link>
                <div className="p-5 flex flex-col flex-grow">
                  <Link to={slug ? `/store/${slug}/produto/${p.id}` : `/produto/${p.id}`} className="hover:text-blue-600 transition-colors">
                    <h3 className="text-lg font-bold mb-2 text-zinc-900 dark:text-white line-clamp-2 leading-tight">{p.name}</h3>
                  </Link>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6 line-clamp-2 font-light leading-relaxed flex-grow">{p.shortDesc}</p>
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-black/5 dark:border-white/5">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 text-lg">{p.price}</span>
                    <Link 
                      to={slug ? `/store/${slug}/produto/${p.id}` : `/produto/${p.id}`}
                      className="text-xs sm:text-sm bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Ver Detalhes
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Purchase Popup */}
      <PurchasePopup productName={product.name} />
      </main>
    </div>
  );
}
