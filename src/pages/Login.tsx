import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Sessão iniciada com sucesso!');
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);
        localStorage.setItem('email', data.email);
        if (data.storeId) {
          localStorage.setItem('storeId', data.storeId.toString());
        }

        if (data.role === 'superadmin') {
          navigate('/admin');
        } else if (data.role === 'store_admin' || data.role === 'manager') {
          navigate('/store-dashboard');
        } else {
          navigate('/');
        }
      } else {
        toast.error(data.error || 'Credenciais inválidas');
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

      <div className="max-w-md w-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm p-10 rounded-3xl shadow-sm hover:shadow-md border border-zinc-200 dark:border-zinc-800 transition-all duration-300">
        <h1 className="text-4xl font-bold text-center mb-3 tracking-tight">Iniciar Sessão</h1>
        <p className="text-center text-zinc-500 dark:text-zinc-400 mb-10 font-light">
          Bem-vindo de volta! Insira as suas credenciais.
        </p>

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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium transition-colors mt-8 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'A iniciar sessão...' : 'Iniciar Sessão'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
          Não tem uma conta?{' '}
          <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium hover:underline">
            Criar loja
          </Link>
        </div>
      </div>
    </div>
  );
}
