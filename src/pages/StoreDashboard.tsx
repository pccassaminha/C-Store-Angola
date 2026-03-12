import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Package, ShoppingCart, Plus, Edit, Trash2, LogOut, ExternalLink, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface Product {
  id: string;
  name: string;
  shortDesc: string;
  price: string;
  status: string;
}

interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  total_amount: number;
  status: string;
  created_at: string;
}

interface StoreInfo {
  id: string;
  name: string;
  slug: string;
}

export default function StoreDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', description: '', price: '' });

  const fetchDashboardData = async () => {
    try {
      const storeId = localStorage.getItem('storeId');
      if (!storeId) {
        navigate('/login');
        return;
      }
      const res = await fetch(`/api/store/dashboard?storeId=${storeId}`);
      if (res.ok) {
        const data = await res.json();
        setStoreInfo(data.store);
        setProducts(data.products);
        setOrders(data.orders || []);
      } else {
        toast.error('Failed to fetch store data');
        navigate('/login');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (!token || (role !== 'store_admin' && role !== 'manager' && role !== 'superadmin')) {
      navigate('/login');
      return;
    }
    
    fetchDashboardData();
  }, [navigate]);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const storeId = localStorage.getItem('storeId');
      const res = await fetch('/api/store/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId: storeId,
          name: newProduct.name,
          description: newProduct.description,
          price: newProduct.price
        })
      });
      if (res.ok) {
        toast.success('Product added successfully');
        setIsAddingProduct(false);
        setNewProduct({ name: '', description: '', price: '' });
        fetchDashboardData();
      } else {
        toast.error('Failed to add product');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  const handleToggleStatus = async (product: Product) => {
    try {
      const newStatus = product.status === 'active' ? 'inactive' : 'active';
      const res = await fetch(`/api/products/${product.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        toast.success(`Produto ${newStatus === 'active' ? 'ativado' : 'desativado'} com sucesso!`);
        fetchDashboardData();
      } else {
        toast.error('Erro ao atualizar status do produto');
      }
    } catch (error) {
      toast.error('Erro ao atualizar status do produto');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      const res = await fetch(`/api/store/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Product deleted');
        fetchDashboardData();
      } else {
        toast.error('Failed to delete product');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  const handleLogout = async () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('email');
      localStorage.removeItem('storeId');
      navigate('/login');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-3 tracking-tight">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-sm">
                <Package size={24} />
              </div>
              {storeInfo?.name} Dashboard
            </h1>
            <Link 
              to={storeInfo?.slug && storeInfo.slug !== 'main' ? `/store/${storeInfo.slug}` : "/"} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 mt-3 text-sm font-medium ml-[60px]"
            >
              Ver Loja <ExternalLink size={14} />
            </Link>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors shadow-sm text-sm font-medium"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>

        <div className="flex gap-3 mb-8">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-6 py-2.5 rounded-full font-medium transition-all duration-200 text-sm ${
              activeTab === 'products' 
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-md' 
                : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800'
            }`}
          >
            Products
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-6 py-2.5 rounded-full font-medium transition-all duration-200 text-sm ${
              activeTab === 'orders' 
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-md' 
                : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800'
            }`}
          >
            Orders
          </button>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          {activeTab === 'products' && (
            <div>
              <div className="p-8 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
                <h2 className="text-2xl font-semibold tracking-tight">Your Products</h2>
                <button
                  onClick={() => setIsAddingProduct(!isAddingProduct)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-sm font-medium text-sm"
                >
                  <Plus size={16} />
                  Add Product
                </button>
              </div>

              {isAddingProduct && (
                <div className="p-6 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
                  <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Name</label>
                      <input
                        type="text"
                        required
                        className="w-full p-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Preço</label>
                      <input
                        type="text"
                        required
                        className="w-full p-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                        value={newProduct.price}
                        onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-1">Descrição</label>
                      <textarea
                        required
                        className="w-full p-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                        rows={3}
                        value={newProduct.description}
                        onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                      />
                    </div>
                    <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => setIsAddingProduct(false)}
                        className="px-4 py-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Save Product
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {products.length === 0 ? (
                <div className="p-8 text-center text-zinc-500">No products found. Add your first product!</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 text-sm">
                      <tr>
                        <th className="p-4 font-medium">Nome</th>
                        <th className="p-4 font-medium">Preço</th>
                        <th className="p-4 font-medium">Status</th>
                        <th className="p-4 font-medium text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                      {products.map((product) => (
                        <tr key={product.id} className={`hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors ${product.status === 'inactive' ? 'opacity-50' : ''}`}>
                          <td className="p-4 font-medium">{product.name}</td>
                          <td className="p-4 text-zinc-500">{product.price}</td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.status === 'active' || !product.status ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-500' : 'bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-400'}`}>
                              {product.status === 'active' || !product.status ? 'Ativo' : 'Inativo'}
                            </span>
                          </td>
                          <td className="p-4 flex justify-end gap-2">
                            <button
                              onClick={() => handleToggleStatus(product)}
                              className="p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                              title={product.status === 'active' || !product.status ? 'Desativar Produto' : 'Ativar Produto'}
                            >
                              {product.status === 'active' || !product.status ? <XCircle size={18} /> : <CheckCircle size={18} />}
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'orders' && (
            <div>
              <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
                <h2 className="text-xl font-semibold">Recent Orders</h2>
              </div>
              
              {orders.length === 0 ? (
                <div className="p-8 text-center text-zinc-500">No orders yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 text-sm">
                      <tr>
                        <th className="p-4 font-medium">Order ID</th>
                        <th className="p-4 font-medium">Customer</th>
                        <th className="p-4 font-medium">Date</th>
                        <th className="p-4 font-medium">Total</th>
                        <th className="p-4 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                      {orders.map((order) => (
                        <tr key={order.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                          <td className="p-4 font-medium text-sm">#{order.id.substring(0, 8)}</td>
                          <td className="p-4">
                            <div>{order.customer_name}</div>
                            <div className="text-xs text-zinc-500">{order.customer_email}</div>
                          </td>
                          <td className="p-4 text-zinc-500">{new Date(order.created_at).toLocaleDateString()}</td>
                          <td className="p-4 font-medium">${order.total_amount.toFixed(2)}</td>
                          <td className="p-4">
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500 rounded-full text-xs font-medium capitalize">
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
