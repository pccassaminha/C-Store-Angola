import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Store, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';

interface PendingStore {
  id: string;
  name: string;
  slug: string;
  status: string;
  owner_email: string;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [pendingStores, setPendingStores] = useState<PendingStore[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPendingStores = async () => {
    try {
      const res = await fetch('/api/stores/pending');
      if (res.ok) {
        const data = await res.json();
        setPendingStores(data);
      } else {
        toast.error('Failed to fetch pending stores');
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
    
    if (!token || role !== 'superadmin') {
      navigate('/login');
      return;
    }
    
    fetchPendingStores();
  }, [navigate]);

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch('/api/stores/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        toast.success('Store approved successfully');
        fetchPendingStores();
      } else {
        toast.error('Failed to approve store');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  const handleReject = async (id: string) => {
    try {
      const res = await fetch('/api/stores/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        toast.success('Store rejected');
        fetchPendingStores();
      } else {
        toast.error('Failed to reject store');
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

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-bold flex items-center gap-3 tracking-tight">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-sm">
              <Store size={24} />
            </div>
            Admin Dashboard
          </h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors shadow-sm text-sm font-medium"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <div className="p-8 border-b border-zinc-200 dark:border-zinc-800">
            <h2 className="text-2xl font-semibold tracking-tight">Pending Store Approvals</h2>
          </div>
          
          {loading ? (
            <div className="p-8 text-center text-zinc-500">Loading...</div>
          ) : pendingStores.length === 0 ? (
            <div className="p-8 text-center text-zinc-500">No pending stores to approve.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 text-sm">
                  <tr>
                    <th className="p-4 font-medium">Store Name</th>
                    <th className="p-4 font-medium">Slug</th>
                    <th className="p-4 font-medium">Owner Email</th>
                    <th className="p-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {pendingStores.map((store) => (
                    <tr key={store.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                      <td className="p-4 font-medium">{store.name}</td>
                      <td className="p-4 text-zinc-500">
                        <Link to={`/store/${store.slug}`} target="_blank" className="hover:text-blue-500 hover:underline">
                          /store/{store.slug}
                        </Link>
                      </td>
                      <td className="p-4 text-zinc-500">{store.owner_email}</td>
                      <td className="p-4 flex justify-end gap-2">
                        <button
                          onClick={() => handleApprove(store.id)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                        >
                          <CheckCircle size={16} /> Approve
                        </button>
                        <button
                          onClick={() => handleReject(store.id)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                        >
                          <XCircle size={16} /> Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
