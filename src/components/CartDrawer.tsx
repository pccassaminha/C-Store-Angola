import { X, Minus, Plus, ShoppingBag, ShoppingCart, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, removeFromCart, updateQuantity, totalPrice, totalItems, subtotal, totalDiscount } = useCart();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  const handleRemove = (id: string) => {
    removeFromCart(id);
    toast.success('Item removido do carrinho');
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white dark:bg-zinc-950 border-l border-black/10 dark:border-white/10 z-[70] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="p-6 border-b border-black/10 dark:border-white/10 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Seu Carrinho</h2>
            <span className="bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs px-2 py-1 rounded-full font-medium">
              {totalItems} {totalItems === 1 ? 'item' : 'itens'}
            </span>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-zinc-500 gap-4">
              <ShoppingCart className="w-16 h-16 opacity-20" />
              <p>Seu carrinho está vazio</p>
              <button 
                onClick={onClose}
                className="mt-4 text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 font-medium"
              >
                Continuar comprando
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {items.map((item) => (
                <div key={item.product.id} className="flex gap-4 bg-white dark:bg-zinc-900/50 p-3 rounded-xl border border-black/5 dark:border-white/5 shadow-sm dark:shadow-none">
                  <img 
                    src={item.product.images?.[0] || item.product.image} 
                    alt={item.product.name} 
                    className="w-20 h-20 object-cover rounded-lg bg-zinc-100 dark:bg-zinc-800"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-medium text-sm line-clamp-2 leading-snug text-zinc-900 dark:text-white">{item.product.name}</h3>
                      <p className="text-emerald-600 dark:text-emerald-400 font-semibold text-sm mt-1">{item.product.price}</p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center bg-zinc-50 dark:bg-zinc-950 rounded-lg border border-black/10 dark:border-white/10 p-0.5">
                        <button 
                          onClick={() => updateQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                          className="w-7 h-7 flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 rounded transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium text-zinc-900 dark:text-white">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 rounded transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <button 
                        onClick={() => handleRemove(item.product.id)}
                        className="p-1.5 text-red-500/70 dark:text-red-400/70 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 dark:hover:bg-red-400/10 rounded-md transition-colors"
                        title="Remover item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="p-6 bg-white/80 dark:bg-zinc-900/80 border-t border-black/10 dark:border-white/10 backdrop-blur-md">
            <div className="space-y-3 mb-4">
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
            <button 
              onClick={handleCheckout}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-900/20"
            >
              <ShoppingCart className="w-5 h-5" />
              Finalizar Encomenda
            </button>
          </div>
        )}
      </div>
    </>
  );
}
