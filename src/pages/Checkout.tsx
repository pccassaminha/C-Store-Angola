import React, { useState, useEffect } from 'react';
import { ShoppingCart, ShoppingBag, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Checkout() {
  const { slug: urlSlug } = useParams<{ slug: string }>();
  const slug = urlSlug || 'main';
  const { items, totalPrice, totalItems, subtotal, totalDiscount } = useCart();
  const navigate = useNavigate();
  
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [info, setInfo] = useState('');
  const [storeInfo, setStoreInfo] = useState<any>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    const fetchStoreData = async () => {
      try {
        const res = await fetch(`/api/storefront/${slug}`);
        if (res.ok) {
          const data = await res.json();
          setStoreInfo(data.store);
        }
      } catch (error) {
        console.error('Failed to fetch store data', error);
      }
    };

    if (slug) {
      fetchStoreData();
    }
  }, [slug]);

  if (items.length === 0) {
    return (
      <main className="pt-32 pb-20 flex-1 flex flex-col items-center justify-center text-center px-6">
        <ShoppingBag className="w-20 h-20 text-zinc-400 dark:text-zinc-700 mb-6" />
        <h1 className="text-3xl font-bold mb-4 text-zinc-900 dark:text-white">O seu carrinho está vazio</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mb-8 max-w-md">
          Adicione produtos ao carrinho antes de finalizar a encomenda.
        </p>
        <button 
          onClick={() => navigate('/')}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 px-8 rounded-xl transition-colors"
        >
          Voltar à Loja
        </button>
      </main>
    );
  }

  const handleWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!storeInfo?.whatsapp) {
      toast.error('Número de WhatsApp não configurado para esta loja.');
      return;
    }
    
    // Register reservations
    try {
      await Promise.all(items.map(item => 
        fetch(`/api/products/${item.product.id}/reserve`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quantity: item.quantity })
        })
      ));
    } catch (error) {
      console.error('Failed to register reservations', error);
    }

    let text = `Olá, quero encomendar `;
    items.forEach((item, index) => {
      text += `${item.quantity}x ${item.product.name}`;
      if (index < items.length - 1) text += ', ';
    });
    
    text += `. O total é ${new Intl.NumberFormat('pt-BR').format(totalPrice)} Kz. Meu nome é ${name} e a morada é ${address}.`;
    if (info) {
      text += ` Observação: ${info}`;
    }
    
    const phoneNumber = storeInfo.whatsapp.replace(/\D/g, '');
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    
    toast.success('Redirecionando para o WhatsApp...');
  };

  return (
    <main className="pt-32 pb-20 flex-1">
      <section className="max-w-3xl mx-auto px-6">
        <div className="bg-white dark:bg-zinc-900/50 border border-black/5 dark:border-white/5 rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-sm dark:shadow-none">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-blue-500"></div>
          
          <button
            onClick={() => navigate(-1)}
            className="absolute top-6 right-6 p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
            aria-label="Voltar"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-6">
              <ShoppingCart className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-bold mb-4 text-zinc-900 dark:text-white">Fazer Encomenda</h2>
            <p className="text-zinc-500 dark:text-zinc-400">
              Preencha os dados abaixo para finalizar a compra de <strong className="text-zinc-900 dark:text-white">{totalItems} itens</strong> diretamente pelo WhatsApp.
            </p>
          </div>

          {/* Resumo do Pedido */}
          <div className="mb-10 bg-zinc-50 dark:bg-zinc-950/50 rounded-2xl p-6 border border-black/5 dark:border-white/5 shadow-sm dark:shadow-none">
            <h3 className="font-semibold text-lg mb-4 text-zinc-900 dark:text-zinc-300 border-b border-black/10 dark:border-white/10 pb-4">Resumo do Pedido</h3>
            <div className="flex flex-col gap-4 mb-6">
              {items.map((item) => (
                <div key={item.product.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <span className="text-zinc-500 font-medium">{item.quantity}x</span>
                    <span className="text-zinc-900 dark:text-zinc-300 line-clamp-1">{item.product.name}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="space-y-3 pt-4 border-t border-black/10 dark:border-white/10">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-500 dark:text-zinc-400">Subtotal</span>
                <span className="text-zinc-900 dark:text-zinc-300">
                  {new Intl.NumberFormat('pt-BR').format(subtotal)} Kz
                </span>
              </div>
              
              {totalDiscount > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">Desconto aplicado</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                    -{new Intl.NumberFormat('pt-BR').format(totalDiscount)} Kz
                  </span>
                </div>
              )}
              
              <div className="flex items-center justify-between pt-3 border-t border-black/10 dark:border-white/10">
                <span className="text-zinc-900 dark:text-zinc-300 font-medium">Total a pagar</span>
                <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {new Intl.NumberFormat('pt-BR').format(totalPrice)} Kz
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={handleWhatsApp} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-2">
                Seu Nome
              </label>
              <input 
                type="text" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                placeholder="Ex: João Silva"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-2">
                Endereço e Pontos de Referência
              </label>
              <input 
                type="text" 
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                placeholder="Ex: Luanda, Talatona, Rua X, próximo ao banco Y"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-2">
                Sua Dúvida / Observação (Opcional)
              </label>
              <textarea 
                rows={3}
                value={info}
                onChange={(e) => setInfo(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all resize-none"
                placeholder="Ex: Quero receber no dia X, hora Y"
              ></textarea>
            </div>
            
            <button 
              type="submit"
              className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#25D366]/20 mt-8"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-6 h-6"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
              </svg>
              <span className="text-lg">Finalizar Encomenda via WhatsApp</span>
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
