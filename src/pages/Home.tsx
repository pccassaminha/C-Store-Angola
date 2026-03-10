import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ShoppingCart, ShieldCheck, Truck, Clock, Search, Lock } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import Header from '../components/Header';

export default function Home() {
  const { slug } = useParams<{ slug: string }>();
  const { products, isLoading, store, lang } = useStore();
  const [searchQuery, setSearchQuery] = useState('');

  // Filtra apenas os produtos que estão ativos e correspondem à pesquisa
  const filteredProducts = products.filter(p => 
    (p.status === 'active' || !p.status) && 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const t = {
    welcome: lang === 'EN' ? 'Welcome to' : lang === 'FR' ? 'Bienvenue à' : 'Bem-vindo à',
    subtitle: lang === 'EN' ? 'Find the best products with guaranteed quality and fast delivery.' : lang === 'FR' ? 'Trouvez les meilleurs produits avec une qualité garantie et une livraison rapide.' : 'Encontre os melhores produtos com qualidade garantida e entrega rápida.',
    searchPlaceholder: lang === 'EN' ? 'Search products...' : lang === 'FR' ? 'Rechercher des produits...' : 'Pesquisar produtos...',
    noProducts: lang === 'EN' ? 'No products found with that name.' : lang === 'FR' ? 'Aucun produit trouvé avec ce nom.' : 'Nenhum produto encontrado com esse nome.',
    details: lang === 'EN' ? 'View Details' : lang === 'FR' ? 'Voir les détails' : 'Ver Detalhes',
    delivery: lang === 'EN' ? 'Fast Delivery' : lang === 'FR' ? 'Livraison Rapide' : 'Entrega Rápida',
    deliveryDesc: lang === 'EN' ? 'Receive your orders quickly and safely.' : lang === 'FR' ? 'Recevez vos commandes rapidement et en toute sécurité.' : 'Receba suas encomendas com rapidez e segurança.',
    quality: lang === 'EN' ? 'Quality Guarantee' : lang === 'FR' ? 'Garantie de Qualité' : 'Garantia de Qualidade',
    qualityDesc: lang === 'EN' ? 'Tested products with factory warranty.' : lang === 'FR' ? 'Produits testés avec garantie d\'usine.' : 'Produtos testados e com garantia de fábrica.',
    support: lang === 'EN' ? '24/7 Support' : lang === 'FR' ? 'Support 24/7' : 'Suporte 24/7',
    supportDesc: lang === 'EN' ? 'Our team is always ready to help.' : lang === 'FR' ? 'Notre équipe est toujours prête à vous aider.' : 'Nossa equipe está sempre pronta para ajudar.',
    developedBy: lang === 'EN' ? 'Developed by GRUPO CASSAMINHA' : lang === 'FR' ? 'Développé par GRUPO CASSAMINHA' : 'Desenvolvido pelo GRUPO CASSAMINHA'
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="pt-32 pb-20 flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="pt-24 pb-10 flex-1 flex flex-col min-h-screen">
        {/* Hero Section with Search */}
      <section className="max-w-7xl mx-auto px-6 py-12 md:py-20 text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-zinc-900 dark:text-white">
          {t.welcome} <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-emerald-400">{store?.name || 'C Store Angola'}</span>
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto mb-12">
          {t.subtitle}
        </p>
        
        <div className="max-w-xl mx-auto mb-10 relative">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-zinc-500" />
          </div>
          <input 
            type="text" 
            placeholder={t.searchPlaceholder} 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-zinc-50 dark:bg-zinc-900/80 border border-black/10 dark:border-white/10 rounded-full focus:outline-none focus:border-emerald-500/50 transition-colors text-zinc-900 dark:text-white shadow-inner"
          />
        </div>

        {filteredProducts.length === 0 && searchQuery && (
          <p className="text-zinc-500 mt-8">{t.noProducts}</p>
        )}
      </section>

      {/* Products Grid */}
      {filteredProducts.length > 0 && (
        <section id="produtos" className="max-w-7xl mx-auto px-6 pb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product) => (
              <div key={product.id} className="bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-3xl overflow-hidden hover:border-emerald-500/50 transition-colors group flex flex-col shadow-sm dark:shadow-none">
                <Link to={slug ? `/store/${slug}/produto/${product.id}` : `/produto/${product.id}`} className="block aspect-square overflow-hidden bg-zinc-50 dark:bg-zinc-800 relative flex items-center justify-center">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                </Link>
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-xl font-semibold mb-2 text-zinc-900 dark:text-white">{product.name}</h3>
                  <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-6 flex-1">{product.shortDesc}</p>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{product.price}</span>
                    <Link 
                      to={slug ? `/store/${slug}/produto/${product.id}` : `/produto/${product.id}`}
                      className="bg-zinc-100 hover:bg-zinc-200 dark:bg-white/10 dark:hover:bg-white/20 text-zinc-900 dark:text-white px-4 py-2 rounded-xl font-medium transition-colors"
                    >
                      {t.details}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Features - Moved to bottom */}
      <section className="border-y border-black/5 dark:border-white/10 bg-zinc-50 dark:bg-zinc-900/50 mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="bg-emerald-100 dark:bg-emerald-500/10 p-4 rounded-full">
                <Truck className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">{t.delivery}</h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm">{t.deliveryDesc}</p>
            </div>
            <div className="flex flex-col items-center text-center gap-4">
              <div className="bg-emerald-100 dark:bg-emerald-500/10 p-4 rounded-full">
                <ShieldCheck className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">{t.quality}</h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm">{t.qualityDesc}</p>
            </div>
            <div className="flex flex-col items-center text-center gap-4">
              <div className="bg-emerald-100 dark:bg-emerald-500/10 p-4 rounded-full">
                <Clock className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">{t.support}</h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm">{t.supportDesc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center justify-center gap-6">
          <p className="text-zinc-500 text-xs sm:text-sm text-center max-w-4xl">
            APP Desenvolvida pelo GRUPO CASSAMINHA | NIF: 500286821
          </p>
          <Link 
            to="/admin" 
            className="w-10 h-10 bg-blue-600 hover:bg-blue-500 text-white rounded-full flex items-center justify-center transition-colors shadow-lg"
            title="Área Administrativa"
          >
            <Lock className="w-4 h-4" />
          </Link>
        </div>
      </footer>
    </main>
    </>
  );
}
