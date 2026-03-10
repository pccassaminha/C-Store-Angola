import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Info } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegisterStore() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    storeName: '',
    storeSlug: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/admin/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          type: 'new_store'
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success('Store application submitted! Please wait for admin approval.');
        navigate('/login');
      } else {
        toast.error(data.error || 'Failed to register store');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-950 relative">
      <button 
        onClick={() => navigate(-1)}
        className="absolute top-6 left-6 flex items-center gap-2 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Voltar</span>
      </button>

      <div className="max-w-md w-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm p-10 rounded-3xl shadow-sm hover:shadow-md border border-zinc-200 dark:border-zinc-800 my-8 transition-all duration-300">
        <h1 className="text-4xl font-bold text-center mb-3 tracking-tight">Criar a sua Loja</h1>
        <p className="text-center text-zinc-500 dark:text-zinc-400 mb-8 font-light">
          Preencha o formulário abaixo para solicitar a criação de uma nova loja.
        </p>

        <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-2xl p-5 mb-8 flex items-start gap-4">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <p className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed">
            <strong className="font-semibold">Atenção:</strong> O registo é apenas para quem deseja criar e gerir uma loja. 
            Os compradores podem navegar e comprar livremente sem necessidade de criar conta.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">Email</label>
            <input
              type="email"
              required
              className="w-full p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">Palavra-passe</label>
            <input
              type="password"
              required
              className="w-full p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">Nome da Loja</label>
            <input
              type="text"
              required
              className="w-full p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
              value={formData.storeName}
              onChange={(e) => {
                const name = e.target.value;
                const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                setFormData({ ...formData, storeName: name, storeSlug: slug });
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">URL da Loja</label>
            <div className="flex items-center">
              <span className="px-4 py-3.5 bg-zinc-100 dark:bg-zinc-800 border border-r-0 border-zinc-200 dark:border-zinc-800 rounded-l-2xl text-zinc-500 text-sm">
                /store/
              </span>
              <input
                type="text"
                required
                className="w-full p-3.5 rounded-r-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                value={formData.storeSlug}
                onChange={(e) => setFormData({ ...formData, storeSlug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium transition-colors mt-8 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'A enviar...' : 'Solicitar Loja'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
          Já tem uma conta?{' '}
          <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium hover:underline">
            Iniciar sessão
          </Link>
        </div>
      </div>
    </div>
  );
}
