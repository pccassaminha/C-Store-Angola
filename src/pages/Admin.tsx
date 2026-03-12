import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { Settings, LogOut, Plus, Trash2, Save, Image as ImageIcon, FileText, Package, Users, CheckCircle, XCircle, TrendingUp, Trophy, Eye, EyeOff, Globe, Sun, Moon, ExternalLink, Store } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Admin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminRole, setAdminRole] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerType, setRegisterType] = useState<'new_store' | 'manager'>('new_store');
  const [storeName, setStoreName] = useState('');
  const [storeSlug, setStoreSlug] = useState('');
  const [storeId, setStoreId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<'products' | 'knowledge' | 'admins' | 'stores' | 'profile' | 'store_settings'>('products');
  
  const { products, knowledge, refreshStore, lang, setLang, store } = useStore();
  
  // Theme state
  const [isDark, setIsDark] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) return savedTheme === 'dark';
    return true;
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

  const toggleTheme = () => setIsDark(!isDark);
  
  // Admins state
  const [pendingAdmins, setPendingAdmins] = useState<{id: number, email: string, status: string}[]>([]);
  const [allAdmins, setAllAdmins] = useState<{id: number, email: string, status: string, role: string}[]>([]);
  
  // Stores state
  const [pendingStores, setPendingStores] = useState<{id: string, name: string, slug: string, status: string, owner_email: string}[]>([]);
  const [allStores, setAllStores] = useState<{id: string, name: string, slug: string, logo: string, status: string}[]>([]);

  // Missing state variables
  const [profileEmail, setProfileEmail] = useState('');
  const [profilePassword, setProfilePassword] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [storeWhatsapp, setStoreWhatsapp] = useState('');
  const [storeAddress, setStoreAddress] = useState('');
  const [storeLogo, setStoreLogo] = useState('');
  const [hasMarquee, setHasMarquee] = useState(1);
  const [marqueeText, setMarqueeText] = useState('');
  const [showWhatsappConfirm, setShowWhatsappConfirm] = useState(false);
  const [originalWhatsapp, setOriginalWhatsapp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showProfilePassword, setShowProfilePassword] = useState(false);
  const [storeSettingsError, setStoreSettingsError] = useState('');
  const [storeSettingsSuccess, setStoreSettingsSuccess] = useState('');
  const [isSavingStoreSettings, setIsSavingStoreSettings] = useState(false);
  const [isSavingKnowledge, setIsSavingKnowledge] = useState(false);
  const [knowledgeText, setKnowledgeText] = useState('');
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({
    id: '',
    name: '',
    shortDesc: '',
    price: '',
    image: '',
    images: '',
    fullDesc: '',
    detailedDesc: '',
    status: 'active',
    hasProgressiveDiscount: false,
    specs: [] as {label: string, value: string}[],
    features: [] as string[],
    videoUrl: ''
  });

  const [newManagerEmail, setNewManagerEmail] = useState('');
  const [newManagerPassword, setNewManagerPassword] = useState('');
  const [isCreatingManager, setIsCreatingManager] = useState(false);

  const getStoreId = () => {
    const id = localStorage.getItem('storeId');
    if (!id || id === 'null' || id === 'undefined' || id === 'main') {
      localStorage.setItem('storeId', '7234568');
      return '7234568';
    }
    return id;
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const savedEmail = localStorage.getItem('email');
    if (token) {
      setIsLoggedIn(true);
      setAdminRole(role);
      if (savedEmail) setEmail(savedEmail);
      if (role === 'superadmin') {
        setActiveTab('stores');
      }
    }
  }, []);

  const fetchStoreSettings = async () => {
    try {
      const storeId = getStoreId();
      const res = await fetch(`/api/store/${storeId}`);
      if (res.ok) {
        const data = await res.json();
        setStoreWhatsapp(data.whatsapp || '');
        setStoreAddress(data.address || '');
        setOriginalWhatsapp(data.whatsapp || '');
        setStoreLogo(data.logo || '');
        setHasMarquee(data.has_marquee !== undefined ? data.has_marquee : 1);
        setMarqueeText(data.marquee_text || '');
      }
    } catch (e) {
      console.error('Failed to fetch store settings');
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      if (activeTab === 'admins' && (adminRole === 'superadmin' || adminRole === 'store_admin')) {
        fetchPendingAdmins();
        fetchAllAdmins();
      }
      if (activeTab === 'stores' && adminRole === 'superadmin') {
        fetchPendingStores();
        fetchAllStores();
      }
      if (activeTab === 'store_settings' && (adminRole === 'superadmin' || adminRole === 'store_admin')) {
        fetchStoreSettings();
      }
    }
  }, [isLoggedIn, activeTab, adminRole]);

  const fetchPendingStores = async () => {
    try {
      const res = await fetch('/api/stores/pending', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setPendingStores(data);
      }
    } catch (e) {
      console.error('Failed to fetch pending stores');
    }
  };

  const fetchAllStores = async () => {
    try {
      const res = await fetch('/api/stores', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setAllStores(data);
      }
    } catch (e) {
      console.error('Failed to fetch all stores');
    }
  };

  const fetchPendingAdmins = async () => {
    try {
      const currentStoreId = getStoreId();
      const url = adminRole === 'superadmin' ? '/api/admin/pending' : `/api/admin/pending?storeId=${currentStoreId}`;
      const res = await fetch(url, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setPendingAdmins(data);
      }
    } catch (e) {
      console.error('Failed to fetch pending admins');
    }
  };

  const fetchAllAdmins = async () => {
    try {
      const currentStoreId = getStoreId();
      const url = adminRole === 'superadmin' ? '/api/admins' : `/api/admins?storeId=${currentStoreId}`;
      const res = await fetch(url, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setAllAdmins(data);
      }
    } catch (e) {
      console.error('Failed to fetch all admins');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginSuccess('');
    
    if (isRegistering) {
      try {
        const res = await fetch('/api/admin/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, type: registerType, storeName, storeSlug, storeId })
        });
        const data = await res.json();
        if (res.ok) {
          setLoginSuccess(registerType === 'new_store' ? 'Loja criada com sucesso. Aguarde a aprovação do administrador principal.' : 'Conta criada com sucesso. Aguarde a aprovação do administrador da loja.');
          setIsRegistering(false);
          setPassword('');
        } else {
          setLoginError(data.error || 'Erro ao criar conta');
        }
      } catch (err) {
        setLoginError('Erro ao criar conta');
      }
      return;
    }

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);
        localStorage.setItem('email', data.email);
        if (data.storeId) localStorage.setItem('storeId', data.storeId);
        setIsLoggedIn(true);
        setAdminRole(data.role);
        setEmail(data.email);
        if (data.role === 'superadmin') {
          setActiveTab('stores');
        } else {
          setActiveTab('products');
        }
        setLoginError('');
        toast.success('Login efetuado com sucesso!');
        // Refresh store data with new storeId
        refreshStore();
      } else {
        setLoginError(data.error || 'Credenciais inválidas');
      }
    } catch (err) {
      setLoginError('Erro ao fazer login');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('storeId');
    localStorage.removeItem('email');
    setIsLoggedIn(false);
    setAdminRole(null);
    setEmail('');
    setActiveTab('products');
    toast.success('Sessão terminada');
    // Refresh store data to default
    refreshStore();
  };

  const handleSaveKnowledge = async () => {
    setIsSavingKnowledge(true);
    try {
      await fetch('/api/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: knowledgeText, storeId: getStoreId() })
      });
      await refreshStore();
      toast.success('Base de conhecimento atualizada com sucesso!');
    } catch (e) {
      toast.error('Erro ao atualizar base de conhecimento');
    } finally {
      setIsSavingKnowledge(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
      await refreshStore();
      toast.success('Produto apagado com sucesso!');
    } catch (e) {
      toast.error('Erro ao apagar produto');
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const imagesArray = newProduct.images.split('\n').filter(url => url.trim() !== '');
      const productData = {
        ...newProduct,
        images: imagesArray.length > 0 ? imagesArray : [newProduct.image],
        specs: newProduct.specs.filter(s => s.label.trim() !== '' && s.value.trim() !== ''),
        features: newProduct.features.filter(f => f.trim() !== ''),
        storeId: getStoreId()
      };

      const url = editingProductId ? `/api/products/${editingProductId}` : '/api/products';
      const method = editingProductId ? 'PUT' : 'POST';

      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });
      
      await refreshStore();
      setIsAddingProduct(false);
      setEditingProductId(null);
      setNewProduct({ id: '', name: '', shortDesc: '', price: '', image: '', images: '', fullDesc: '', detailedDesc: '', status: 'active', hasProgressiveDiscount: false, specs: [], features: [] });
      toast.success(editingProductId ? 'Produto atualizado com sucesso!' : 'Produto criado com sucesso!');
    } catch (e) {
      toast.error('Erro ao salvar produto');
    }
  };

  const handleEditProduct = (product: any) => {
    setEditingProductId(product.id);
    setNewProduct({
      id: product.id,
      name: product.name,
      shortDesc: product.shortDesc,
      price: product.price,
      image: product.image,
      images: product.images?.join('\n') || '',
      fullDesc: product.fullDesc,
      detailedDesc: product.detailedDesc || '',
      status: product.status || 'active',
      hasProgressiveDiscount: product.hasProgressiveDiscount || false,
      specs: product.specs || [],
      features: product.features || [],
      videoUrl: product.videoUrl || ''
    });
    setIsAddingProduct(true);
  };

  const handleToggleStatus = async (product: any) => {
    try {
      const newStatus = product.status === 'active' ? 'inactive' : 'active';
      await fetch(`/api/products/${product.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      await refreshStore();
      toast.success(`Produto ${newStatus === 'active' ? 'ativado' : 'desativado'} com sucesso!`);
    } catch (e) {
      toast.error('Erro ao atualizar status do produto');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'image' | 'images') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      if (field === 'image') {
        setNewProduct(prev => ({ ...prev, image: base64String }));
      } else {
        setNewProduct(prev => ({ 
          ...prev, 
          images: prev.images ? `${prev.images}\n${base64String}` : base64String 
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApproveAdmin = async (id: number, role: 'store_admin' | 'manager') => {
    const roleName = role === 'store_admin' ? 'Administrador' : 'Gerente';
    try {
      await fetch('/api/admin/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, role })
      });
      fetchPendingAdmins();
      fetchAllAdmins();
      toast.success(`Usuário aprovado como ${roleName} com sucesso!`);
    } catch (e) {
      toast.error('Erro ao aprovar usuário');
    }
  };

  const handleRejectAdmin = async (id: number) => {
    try {
      const res = await fetch('/api/admin/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        fetchPendingAdmins();
        fetchAllAdmins();
        toast.success('Administrador rejeitado com sucesso!');
      } else {
        toast.error('Erro ao rejeitar administrador');
      }
    } catch (e) {
      toast.error('Erro ao rejeitar administrador');
    }
  };

  const handleDeleteAdmin = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchAllAdmins();
        toast.success('Administrador apagado com sucesso!');
      } else {
        toast.error('Erro ao apagar administrador');
      }
    } catch (e) {
      toast.error('Erro ao apagar administrador');
    }
  };

  const handleCreateManager = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingManager(true);
    try {
      const res = await fetch('/api/admin/create-manager', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newManagerEmail, password: newManagerPassword, storeId: getStoreId() })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Gerente criado com sucesso!');
        setNewManagerEmail('');
        setNewManagerPassword('');
        fetchAllAdmins();
      } else {
        toast.error(data.error || 'Erro ao criar gerente');
      }
    } catch (e) {
      toast.error('Erro ao criar gerente');
    } finally {
      setIsCreatingManager(false);
    }
  };

  const handleUpdateStoreSettings = async (e: React.FormEvent) => {
    e.preventDefault();

    if (originalWhatsapp && originalWhatsapp !== storeWhatsapp) {
      setShowWhatsappConfirm(true);
      return;
    }

    await confirmUpdateStoreSettings();
  };

  const confirmUpdateStoreSettings = async () => {
    setShowWhatsappConfirm(false);
    setStoreSettingsError('');
    setStoreSettingsSuccess('');
    setIsSavingStoreSettings(true);
    
    try {
      const storeId = getStoreId();
      const res = await fetch(`/api/store/${storeId}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ whatsapp: storeWhatsapp, address: storeAddress, logo: storeLogo, has_marquee: hasMarquee, marquee_text: marqueeText })
      });
      
      if (res.ok) {
        setStoreSettingsSuccess('Configurações atualizadas com sucesso!');
        setOriginalWhatsapp(storeWhatsapp);
        toast.success('Configurações atualizadas!');
      } else {
        setStoreSettingsError('Erro ao atualizar configurações.');
      }
    } catch (err) {
      setStoreSettingsError('Erro ao atualizar configurações.');
    } finally {
      setIsSavingStoreSettings(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    try {
      const res = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          currentEmail: email, // Assuming the logged in user's email is stored in `email` state
          newEmail: profileEmail || email,
          newPassword: profilePassword 
        })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Perfil atualizado com sucesso!');
        if (profileEmail) {
          setEmail(profileEmail);
          localStorage.setItem('email', profileEmail);
        }
        setProfilePassword('');
      } else {
        toast.error(data.error || 'Erro ao atualizar perfil');
      }
    } catch (e) {
      toast.error('Erro ao atualizar perfil');
    }
  };

  if (!isLoggedIn) {
    return (
      <main className="pt-32 pb-20 flex-1 flex items-center justify-center px-6">
        <div className="bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-2xl p-8 w-full max-w-md shadow-xl dark:shadow-none">
          <div className="flex items-center justify-center gap-3 mb-8">
            <Settings className="w-8 h-8 text-emerald-500" />
            <h1 className="text-2xl font-bold">{isRegistering ? 'Criar Conta' : 'Área Administrativa'}</h1>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            {loginError && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-xl text-sm text-center">
                {loginError}
              </div>
            )}
            {loginSuccess && (
              <div className="bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 p-3 rounded-xl text-sm text-center">
                {loginSuccess}
              </div>
            )}
            {isRegistering && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">Tipo de Registro</label>
                <select 
                  value={registerType}
                  onChange={e => setRegisterType(e.target.value as 'new_store' | 'manager')}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  disabled
                >
                  <option value="new_store">Criar uma nova loja</option>
                </select>
              </div>
            )}
            
            {isRegistering && (
              <>
                <div>
                  <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">Nome da Loja</label>
                  <input 
                    type="text" 
                    value={storeName}
                    onChange={e => setStoreName(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    required={isRegistering}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">URL da Loja (Slug)</label>
                  <input 
                    type="text" 
                    value={storeSlug}
                    onChange={e => setStoreSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                    placeholder="minha-loja"
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    required={isRegistering}
                  />
                  <p className="text-xs text-zinc-600 dark:text-zinc-500 mt-1">Apenas letras minúsculas, números e hífens.</p>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">Email</label>
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">Senha</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <button 
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 rounded-xl transition-colors mt-4"
            >
              {isRegistering ? 'Criar Conta' : 'Entrar'}
            </button>
            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setLoginError('');
                  setLoginSuccess('');
                }}
                className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                {isRegistering ? 'Já tenho uma conta. Fazer login.' : 'Ainda não tenho conta. Criar conta.'}
              </button>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-500 text-center mt-4">
              Acesso restrito a administradores da C Store Angola.
            </p>
            <div className="mt-6 pt-6 border-t border-white/10 flex justify-center">
              <Link 
                to={store?.slug && store.slug !== 'main' ? `/store/${store.slug}` : "/"}
                className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Voltar à Loja Inicial
              </Link>
            </div>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-24 pb-20 flex-1 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3 text-zinc-900 dark:text-white">
              <Settings className="w-8 h-8 text-emerald-500" />
              Painel de Administração
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 mt-1">Faça a gestão dos produtos e do conhecimento do assistente virtual.</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Link 
              to={store?.slug && store.slug !== 'main' ? `/store/${store.slug}` : "/"}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl transition-colors text-sm font-medium"
            >
              <ExternalLink className="w-4 h-4" />
              Ver Loja
            </Link>
            
            <div className="relative group">
              <button className="flex items-center gap-2 bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 px-4 py-2 rounded-xl text-sm font-medium text-zinc-900 dark:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                <Globe className="w-4 h-4" />
                {lang}
              </button>
              <div className="absolute top-full right-0 mt-2 w-32 bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 overflow-hidden z-50">
                {['PT', 'EN', 'FR'].map((l) => (
                  <button
                    key={l}
                    onClick={() => setLang(l)}
                    className={`w-full text-left px-4 py-2 text-sm font-medium transition-colors ${
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
              className="p-2 bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800"
              title="Alternar Tema"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white px-4 py-2 rounded-xl transition-colors text-sm font-medium"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-black/10 dark:border-white/10 pb-px overflow-x-auto">
          <button 
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'products' ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' : 'border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'}`}
          >
            <Package className="w-4 h-4" />
            Produtos
          </button>
          <button 
            onClick={() => setActiveTab('knowledge')}
            className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'knowledge' ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' : 'border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'}`}
          >
            <FileText className="w-4 h-4" />
            Base de Conhecimento (Bot)
          </button>
          {adminRole === 'superadmin' && (
            <button 
              onClick={() => setActiveTab('stores')}
              className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'stores' ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' : 'border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'}`}
            >
              <Settings className="w-4 h-4" />
              Lojas
              {pendingStores.length > 0 && (
                <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full ml-1">
                  {pendingStores.length}
                </span>
              )}
            </button>
          )}
          {(adminRole === 'superadmin' || adminRole === 'store_admin') && (
            <button 
              onClick={() => setActiveTab('store_settings')}
              className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'store_settings' ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' : 'border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'}`}
            >
              <Settings className="w-4 h-4" />
              Configurações da Loja
            </button>
          )}
          <button 
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'profile' ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' : 'border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'}`}
          >
            <Settings className="w-4 h-4" />
            Meu Perfil
          </button>
        </div>

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Produtos Cadastrados ({products.length})</h2>
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    const rankingEl = document.getElementById('ranking-section');
                    if (rankingEl) {
                      rankingEl.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-xl transition-colors text-sm font-medium"
                >
                  <TrendingUp className="w-4 h-4" />
                  Ver Ranking
                </button>
                <button 
                  onClick={() => setIsAddingProduct(!isAddingProduct)}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl transition-colors text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  {isAddingProduct ? 'Cancelar' : 'Novo Produto'}
                </button>
              </div>
            </div>

            {isAddingProduct && (
              <div className="bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-2xl p-6 mb-8 shadow-sm dark:shadow-none">
                <h3 className="text-lg font-medium mb-4 text-zinc-900 dark:text-white">{editingProductId ? 'Editar Produto' : 'Adicionar Novo Produto'}</h3>
                <form onSubmit={handleAddProduct} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-400 mb-1">ID do Produto (ex: fone-bluetooth-x1)</label>
                      <input type="text" required disabled={!!editingProductId} value={newProduct.id} onChange={e => setNewProduct({...newProduct, id: e.target.value})} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-black/10 dark:border-white/10 rounded-xl px-4 py-2 text-zinc-900 dark:text-white disabled:opacity-50" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-400 mb-1">Nome do Produto</label>
                      <input type="text" required value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-black/10 dark:border-white/10 rounded-xl px-4 py-2 text-zinc-900 dark:text-white" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-400 mb-1">Preço (ex: 35.000 Kz)</label>
                      <input type="text" required value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-black/10 dark:border-white/10 rounded-xl px-4 py-2 text-zinc-900 dark:text-white" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-400 mb-1">Status</label>
                      <select value={newProduct.status} onChange={e => setNewProduct({...newProduct, status: e.target.value})} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-black/10 dark:border-white/10 rounded-xl px-4 py-2 text-zinc-900 dark:text-white">
                        <option value="active">Ativo</option>
                        <option value="inactive">Inativo</option>
                      </select>
                    </div>
                    <div className="md:col-span-2 flex items-center gap-2 mt-2">
                      <input 
                        type="checkbox" 
                        id="hasProgressiveDiscount"
                        checked={newProduct.hasProgressiveDiscount} 
                        onChange={e => setNewProduct({...newProduct, hasProgressiveDiscount: e.target.checked})} 
                        className="w-4 h-4 rounded border-white/10 bg-zinc-950 text-emerald-500 focus:ring-emerald-500/50"
                      />
                      <label htmlFor="hasProgressiveDiscount" className="text-sm font-medium text-zinc-300">
                        Ativar Desconto Progressivo (Compre mais, pague menos)
                      </label>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-zinc-400 mb-1">Descrição Curta (Aparece no card e abaixo do preço)</label>
                      <input type="text" required value={newProduct.shortDesc} onChange={e => setNewProduct({...newProduct, shortDesc: e.target.value})} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-black/10 dark:border-white/10 rounded-xl px-4 py-2 text-zinc-900 dark:text-white" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-zinc-400 mb-1">Descrição Detalhada (Parágrafo acima das qualidades)</label>
                      <textarea rows={3} value={newProduct.detailedDesc} onChange={e => setNewProduct({...newProduct, detailedDesc: e.target.value})} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-black/10 dark:border-white/10 rounded-xl px-4 py-2 text-zinc-900 dark:text-white resize-none" />
                    </div>
                    
                    {/* Qualidades / Features */}
                    <div className="md:col-span-2 p-4 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-black/5 dark:border-white/5">
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400">Qualidades do Produto (Símbolos Verdes de Verificação)</label>
                        <button type="button" onClick={() => setNewProduct({...newProduct, features: [...newProduct.features, '']})} className="text-xs bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 px-2 py-1 rounded transition-colors">
                          + Adicionar Qualidade
                        </button>
                      </div>
                      <div className="space-y-2">
                        {newProduct.features.map((feature, idx) => (
                          <div key={idx} className="flex gap-2 items-center">
                            <input type="text" placeholder="Ex: Bateria de Longa Duração" value={feature} onChange={e => {
                              const newFeatures = [...newProduct.features];
                              newFeatures[idx] = e.target.value;
                              setNewProduct({...newProduct, features: newFeatures});
                            }} className="flex-1 bg-zinc-50 dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-lg px-3 py-1.5 text-sm text-zinc-900 dark:text-white" />
                            <button type="button" onClick={() => {
                              const newFeatures = newProduct.features.filter((_, i) => i !== idx);
                              setNewProduct({...newProduct, features: newFeatures});
                            }} className="text-red-400 hover:bg-red-400/10 p-1.5 rounded-lg transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        {newProduct.features.length === 0 && (
                          <p className="text-xs text-zinc-600 dark:text-zinc-500 italic">Nenhuma qualidade adicionada. Clique no botão acima para adicionar.</p>
                        )}
                      </div>
                    </div>

                    {/* Especificações Técnicas */}
                    <div className="md:col-span-2 p-4 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-black/5 dark:border-white/5">
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400">Especificações Técnicas</label>
                        <button type="button" onClick={() => setNewProduct({...newProduct, specs: [...newProduct.specs, {label: '', value: ''}]})} className="text-xs bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 px-2 py-1 rounded text-zinc-900 dark:text-white transition-colors">
                          + Adicionar Especificação
                        </button>
                      </div>
                      <div className="space-y-2">
                        {newProduct.specs.map((spec, idx) => (
                          <div key={idx} className="flex gap-2 items-center">
                            <input type="text" placeholder="Rótulo (ex: Bateria)" value={spec.label} onChange={e => {
                              const newSpecs = [...newProduct.specs];
                              newSpecs[idx].label = e.target.value;
                              setNewProduct({...newProduct, specs: newSpecs});
                            }} className="flex-1 bg-zinc-50 dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-lg px-3 py-1.5 text-sm text-zinc-900 dark:text-white" />
                            <input type="text" placeholder="Valor (ex: 500mAh)" value={spec.value} onChange={e => {
                              const newSpecs = [...newProduct.specs];
                              newSpecs[idx].value = e.target.value;
                              setNewProduct({...newProduct, specs: newSpecs});
                            }} className="flex-1 bg-zinc-50 dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-lg px-3 py-1.5 text-sm text-zinc-900 dark:text-white" />
                            <button type="button" onClick={() => {
                              const newSpecs = newProduct.specs.filter((_, i) => i !== idx);
                              setNewProduct({...newProduct, specs: newSpecs});
                            }} className="text-red-400 hover:bg-red-400/10 p-1.5 rounded-lg transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        {newProduct.specs.length === 0 && (
                          <p className="text-xs text-zinc-600 dark:text-zinc-500 italic">Nenhuma especificação adicionada.</p>
                        )}
                      </div>
                    </div>
                    
                    {/* Imagem Principal */}
                    <div className="md:col-span-2 p-4 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-black/5 dark:border-white/5">
                      <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-2">Imagem Principal</label>
                      <div className="flex gap-4 items-start">
                        <div className="flex-1">
                          <input type="text" placeholder="URL da imagem (ex: https://...)" value={newProduct.image} onChange={e => setNewProduct({...newProduct, image: e.target.value})} className="w-full bg-zinc-50 dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-xl px-4 py-2 text-zinc-900 dark:text-white mb-2" />
                          <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-500">
                            <span>ou</span>
                            <label className="cursor-pointer text-blue-400 hover:text-blue-300 flex items-center gap-1">
                              <ImageIcon className="w-4 h-4" />
                              Fazer Upload do PC
                              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'image')} />
                            </label>
                          </div>
                        </div>
                        {newProduct.image && (
                          <img src={newProduct.image} alt="Preview" className="w-16 h-16 object-cover rounded-lg bg-zinc-800" />
                        )}
                      </div>
                    </div>

                    {/* Imagens da Galeria */}
                    <div className="md:col-span-2 p-4 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-black/5 dark:border-white/5">
                      <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-2">Galeria de Imagens (Uma URL por linha)</label>
                      <textarea rows={3} placeholder="https://...\nhttps://..." value={newProduct.images} onChange={e => setNewProduct({...newProduct, images: e.target.value})} className="w-full bg-zinc-50 dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-xl px-4 py-2 text-zinc-900 dark:text-white resize-none mb-2" />
                      <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-500">
                        <span>ou</span>
                        <label className="cursor-pointer text-blue-400 hover:text-blue-300 flex items-center gap-1">
                          <ImageIcon className="w-4 h-4" />
                          Adicionar Upload à Galeria
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'images')} />
                        </label>
                      </div>
                    </div>

                    {/* Vídeo do Produto */}
                    <div className="md:col-span-2 p-4 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-black/5 dark:border-white/5">
                      <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">Link do Vídeo (Opcional - YouTube ou MP4)</label>
                      <p className="text-xs text-zinc-600 dark:text-zinc-500 mb-3">Se preenchido, criará uma seção de vídeo abaixo das informações principais.</p>
                      <input 
                        type="text" 
                        placeholder="Ex: https://www.youtube.com/watch?v=... ou https://.../video.mp4" 
                        value={newProduct.videoUrl} 
                        onChange={e => setNewProduct({...newProduct, videoUrl: e.target.value})} 
                        className="w-full bg-zinc-50 dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-xl px-4 py-2 text-zinc-900 dark:text-white" 
                      />
                    </div>
                  </div>
                  <div className="flex justify-end pt-4">
                    <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-xl font-medium transition-colors">
                      Salvar Produto
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map(p => (
                <div key={p.id} className={`bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5 rounded-2xl p-4 flex gap-4 items-center shadow-sm dark:shadow-none ${p.status === 'inactive' ? 'opacity-50' : ''}`}>
                  <img src={p.image} alt={p.name} className="w-16 h-16 object-cover rounded-lg bg-zinc-100 dark:bg-zinc-800 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate text-zinc-900 dark:text-white">{p.name}</h3>
                    <p className="text-emerald-600 dark:text-emerald-400 text-sm font-semibold">{p.price}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${p.status === 'active' || !p.status ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-zinc-200 dark:bg-zinc-500/20 text-zinc-600 dark:text-zinc-400'}`}>
                      {p.status === 'active' || !p.status ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    <button 
                      onClick={() => handleToggleStatus(p)}
                      className="p-2 text-zinc-500 dark:text-zinc-400 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors"
                      title={p.status === 'active' || !p.status ? 'Desativar Produto' : 'Ativar Produto'}
                    >
                      {p.status === 'active' || !p.status ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                    </button>
                    <button 
                      onClick={() => handleEditProduct(p)}
                      className="p-2 text-blue-500 dark:text-blue-400 hover:bg-blue-500/10 dark:hover:bg-blue-400/10 rounded-lg transition-colors"
                      title="Editar Produto"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteProduct(p.id)}
                      className="p-2 text-red-500 dark:text-red-400 hover:bg-red-500/10 dark:hover:bg-red-400/10 rounded-lg transition-colors"
                      title="Apagar Produto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Ranking Section inside Products */}
            <div id="ranking-section" className="bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-2xl p-6 shadow-sm dark:shadow-none mt-12">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Trophy className="w-6 h-6 text-yellow-500" />
                  <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">Ranking de Produtos</h2>
                </div>
                <button
                  onClick={async () => {
                    try {
                      await fetch('/api/products/reset-ranking', { method: 'POST' });
                      await refreshStore();
                      toast.success('Ranking zerado com sucesso!');
                    } catch (e) {
                      toast.error('Erro ao zerar ranking');
                    }
                  }}
                  className="text-sm bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 px-4 py-2 rounded-lg transition-colors font-medium"
                >
                  Zerar Ranking
                </button>
              </div>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-8">
                Os produtos mais reservados e comprados pelos clientes.
              </p>
              
              <div className="space-y-4">
                {products.map((p) => {
                  return {
                    ...p,
                    sales: p.sales || 0,
                    reservations: p.reservations || 0,
                    score: (p.sales || 0) * 2 + (p.reservations || 0)
                  };
                })
                .sort((a, b) => b.score - a.score)
                .map((p, index) => (
                  <div key={p.id} className="bg-white dark:bg-zinc-950 border border-black/5 dark:border-white/5 rounded-xl p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between relative overflow-hidden shadow-sm dark:shadow-none">
                    {index < 3 && (
                      <div className={`absolute top-0 left-0 w-1 h-full ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-zinc-400 dark:bg-zinc-300' : 'bg-amber-600'}`}></div>
                    )}
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                        index === 0 ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-500' : 
                        index === 1 ? 'bg-zinc-200 dark:bg-zinc-300/20 text-zinc-600 dark:text-zinc-300' : 
                        index === 2 ? 'bg-amber-600/20 text-amber-600' : 
                        'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-500'
                      }`}>
                        {index + 1}
                      </div>
                      <img src={p.image} alt={p.name} className="w-12 h-12 object-cover rounded-lg bg-zinc-100 dark:bg-zinc-800 shrink-0" />
                      <div>
                        <h3 className="font-medium text-sm text-zinc-900 dark:text-white">{p.name}</h3>
                        <p className="text-emerald-600 dark:text-emerald-400 text-xs font-semibold">{p.price}</p>
                      </div>
                    </div>
                    <div className="flex gap-6 w-full sm:w-auto mt-2 sm:mt-0">
                      <div className="text-center">
                        <p className="text-xs text-zinc-600 dark:text-zinc-500 mb-1">Vendas</p>
                        <p className="font-semibold text-zinc-900 dark:text-zinc-200">{p.sales}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-zinc-600 dark:text-zinc-500 mb-1">Reservas</p>
                        <p className="font-semibold text-zinc-900 dark:text-zinc-200">{p.reservations}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Knowledge Tab */}
        {activeTab === 'knowledge' && (
          <div className="bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-2xl p-6 shadow-sm dark:shadow-none">
            <h2 className="text-xl font-semibold mb-2 text-zinc-900 dark:text-white">Base de Conhecimento do Assistente</h2>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-6">
              Escreva aqui todas as informações adicionais que o assistente virtual deve saber para responder aos clientes. 
              (Ex: Políticas de troca, horários de funcionamento, regras de entrega, etc).
            </p>
            
            <textarea 
              value={knowledgeText}
              onChange={(e) => setKnowledgeText(e.target.value)}
              rows={12}
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-black/10 dark:border-white/10 rounded-xl p-4 text-zinc-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/50 mb-4"
              placeholder="Escreva as regras e informações da loja aqui..."
            />
            
            <div className="flex justify-end">
              <button 
                onClick={handleSaveKnowledge}
                disabled={isSavingKnowledge}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-6 py-3 rounded-xl transition-colors font-medium"
              >
                <Save className="w-5 h-5" />
                {isSavingKnowledge ? 'Salvando...' : 'Salvar Base de Conhecimento'}
              </button>
            </div>
          </div>
        )}

        {/* Stores Tab */}
        {activeTab === 'stores' && adminRole === 'superadmin' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-2xl p-6 shadow-sm dark:shadow-none">
              <h2 className="text-xl font-semibold mb-2 text-zinc-900 dark:text-white">Pedidos de Novas Lojas</h2>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-6">
                Aprove ou rejeite solicitações de criação de novas lojas.
              </p>
              
              {pendingStores.length === 0 ? (
                <div className="text-center py-12 bg-zinc-50 dark:bg-zinc-950/50 rounded-xl border border-black/5 dark:border-white/5">
                  <Settings className="w-12 h-12 text-zinc-400 dark:text-zinc-600 mx-auto mb-3" />
                  <p className="text-zinc-600 dark:text-zinc-400">Não há pedidos de novas lojas pendentes.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingStores.map(store => (
                    <div key={store.id} className="bg-zinc-50 dark:bg-zinc-950 border border-black/5 dark:border-white/5 rounded-xl p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-500/20 p-2 rounded-full">
                          <Settings className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="font-medium text-zinc-900 dark:text-white">{store.name}</p>
                          <p className="text-xs text-zinc-600 dark:text-zinc-500">Slug: {store.slug} | Dono: {store.owner_email}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto">
                        <button 
                          onClick={async () => {
                            try {
                              await fetch('/api/stores/reject', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ id: store.id })
                              });
                              fetchPendingStores();
                              fetchAllStores();
                              toast.success('Loja rejeitada com sucesso!');
                            } catch (e) {
                              toast.error('Erro ao rejeitar loja');
                            }
                          }}
                          className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                        >
                          <XCircle className="w-4 h-4" />
                          Rejeitar
                        </button>
                        <button 
                          onClick={async () => {
                            try {
                              await fetch('/api/stores/approve', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ id: store.id })
                              });
                              fetchPendingStores();
                              fetchAllStores();
                              toast.success('Loja aprovada com sucesso!');
                            } catch (e) {
                              toast.error('Erro ao aprovar loja');
                            }
                          }}
                          className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Aprovar Loja
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-2xl p-6 shadow-sm dark:shadow-none">
              <h2 className="text-xl font-semibold mb-6 text-zinc-900 dark:text-white">Todas as Lojas Ativas</h2>
              <div className="space-y-4">
                {allStores.map(store => (
                  <div key={store.id} className="bg-zinc-50 dark:bg-zinc-950 border border-black/5 dark:border-white/5 rounded-xl p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${store.status === 'approved' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/20 text-red-600 dark:text-red-400'}`}>
                        <Store className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium text-zinc-900 dark:text-white">{store.name}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-zinc-600 dark:text-zinc-500">Slug: {store.slug}</p>
                          <span className="text-xs text-zinc-400 dark:text-zinc-600">•</span>
                          <p className="text-xs text-zinc-600 dark:text-zinc-500">ID: {store.id}</p>
                          <span className="text-xs text-zinc-400 dark:text-zinc-600">•</span>
                          <p className={`text-xs font-medium ${store.status === 'approved' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                            {store.status === 'approved' ? 'Ativa' : 'Desativada'}
                          </p>
                        </div>
                      </div>
                    </div>
                    {store.id !== '7234568' && (
                      <div className="flex gap-2 w-full sm:w-auto">
                        <button 
                          onClick={async () => {
                            const action = store.status === 'approved' ? 'desativar' : 'ativar';
                            if (window.confirm(`Deseja realmente ${action} a loja ${store.name}?`)) {
                              try {
                                const endpoint = store.status === 'approved' ? '/api/stores/reject' : '/api/stores/approve';
                                await fetch(endpoint, {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ id: store.id })
                                });
                                fetchAllStores();
                                toast.success(`Loja ${action === 'ativar' ? 'ativada' : 'desativada'} com sucesso!`);
                              } catch (e) {
                                toast.error(`Erro ao ${action} loja`);
                              }
                            }
                          }}
                          className={`flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                            store.status === 'approved' 
                              ? 'bg-red-500/10 text-red-600 hover:bg-red-500/20 dark:bg-red-500/20 dark:text-red-400 dark:hover:bg-red-500/30' 
                              : 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400 dark:hover:bg-emerald-500/30'
                          }`}
                        >
                          {store.status === 'approved' ? 'Desativar' : 'Ativar'}
                        </button>
                        <button 
                          onClick={async () => {
                            if (window.confirm(`Deseja realmente eliminar a loja ${store.name}? Esta ação não pode ser desfeita.`)) {
                              try {
                                await fetch(`/api/stores/${store.id}`, {
                                  method: 'DELETE'
                                });
                                fetchAllStores();
                                toast.success('Loja eliminada com sucesso!');
                              } catch (e) {
                                toast.error('Erro ao eliminar loja');
                              }
                            }
                          }}
                          className="flex-1 sm:flex-none px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-red-600 dark:text-red-400 text-sm font-medium rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          Eliminar
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Store Settings Tab */}
        {activeTab === 'store_settings' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-2xl p-6 shadow-sm dark:shadow-none">
              <h2 className="text-xl font-semibold mb-6 text-zinc-900 dark:text-white">Configurações da Loja</h2>
              
              <div className="mb-8 p-4 bg-zinc-50 dark:bg-zinc-950 border border-black/5 dark:border-white/5 rounded-xl">
                <h3 className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-2">ID da Loja</h3>
                <div className="flex items-center gap-3">
                  <code className="flex-1 bg-zinc-50 dark:bg-zinc-900 px-4 py-3 rounded-lg border border-black/10 dark:border-white/10 text-zinc-900 dark:text-white font-mono text-lg">
                    {getStoreId()}
                  </code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(getStoreId());
                      toast.success('ID copiado!');
                    }}
                    className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-4 py-3 rounded-lg hover:bg-emerald-500/20 transition-colors font-medium"
                  >
                    Copiar
                  </button>
                </div>
              </div>

              <form onSubmit={handleUpdateStoreSettings} className="space-y-6">
                {storeSettingsError && (
                  <div className="bg-red-500/10 border border-red-500/50 text-red-600 dark:text-red-400 p-3 rounded-xl text-sm text-center">
                    {storeSettingsError}
                  </div>
                )}
                {storeSettingsSuccess && (
                  <div className="bg-emerald-500/10 border border-emerald-500/50 text-emerald-600 dark:text-emerald-400 p-3 rounded-xl text-sm text-center">
                    {storeSettingsSuccess}
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">URL da Logo da Loja</label>
                  <input 
                    type="text" 
                    value={storeLogo}
                    onChange={e => setStoreLogo(e.target.value)}
                    placeholder="https://exemplo.com/logo.png"
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                  <p className="text-xs text-zinc-600 dark:text-zinc-500 mt-1">
                    Insira o link direto para a imagem da logo da sua loja.
                  </p>
                  {storeLogo && (
                    <div className="mt-2 p-2 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-black/5 dark:border-white/5 inline-block">
                      <img src={storeLogo} alt="Logo Preview" className="h-12 object-contain" onError={(e) => (e.currentTarget.style.display = 'none')} onLoad={(e) => (e.currentTarget.style.display = 'block')} />
                    </div>
                  )}
                </div>

                <div>
                  <label className="flex items-center gap-3 cursor-pointer p-4 bg-zinc-50 dark:bg-zinc-950 border border-black/10 dark:border-white/10 rounded-xl">
                    <input 
                      type="checkbox" 
                      checked={hasMarquee === 1}
                      onChange={e => setHasMarquee(e.target.checked ? 1 : 0)}
                      className="w-5 h-5 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <span className="block text-sm font-medium text-zinc-900 dark:text-white">Exibir Faixa Promocional no Topo</span>
                      <span className="block text-xs text-zinc-600 dark:text-zinc-500">Mostra a mensagem promocional no topo do site.</span>
                    </div>
                  </label>
                  
                  {hasMarquee === 1 && (
                    <div className="mt-4 pl-4 border-l-2 border-emerald-500/30">
                      <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">Texto da Faixa Promocional</label>
                      <input 
                        type="text" 
                        value={marqueeText}
                        onChange={e => setMarqueeText(e.target.value)}
                        placeholder="Ex: ✨ COMPRE MAIS DE UM E RECEBA DESCONTO GRADUALMENTE! ✨"
                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      />
                      <p className="text-xs text-zinc-600 dark:text-zinc-500 mt-1">
                        Deixe em branco para usar a mensagem padrão do sistema.
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400">WhatsApp da Loja (Para Reservas)</label>
                    {originalWhatsapp && (
                      <span className="text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded-md">
                        Atual: {originalWhatsapp}
                      </span>
                    )}
                  </div>
                  <input 
                    type="text" 
                    value={storeWhatsapp}
                    onChange={e => setStoreWhatsapp(e.target.value)}
                    placeholder="+244 900 000 000"
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                  <p className="text-xs text-zinc-600 dark:text-zinc-500 mt-1">
                    Este número receberá as mensagens de reserva de encomendas feitas no site.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">Endereço da Loja</label>
                  <input 
                    type="text" 
                    value={storeAddress}
                    onChange={e => setStoreAddress(e.target.value)}
                    placeholder="Ex: Luanda, Talatona"
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                  <p className="text-xs text-zinc-600 dark:text-zinc-500 mt-1">
                    Endereço exibido na página do produto.
                  </p>
                </div>
                
                <button 
                  type="submit" 
                  disabled={isSavingStoreSettings}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 px-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSavingStoreSettings ? 'Salvando...' : 'Salvar Configurações'}
                </button>
              </form>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-2xl p-6 shadow-sm dark:shadow-none">
              <h2 className="text-xl font-semibold mb-6 text-zinc-900 dark:text-white">Gerentes da Loja</h2>
              
              <form onSubmit={handleCreateManager} className="mb-8 p-4 bg-zinc-50 dark:bg-zinc-950 border border-black/5 dark:border-white/5 rounded-xl">
                <h3 className="text-sm font-medium text-zinc-900 dark:text-white mb-4">Adicionar Novo Gerente</h3>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">Email do Gerente</label>
                    <input 
                      type="email" 
                      value={newManagerEmail}
                      onChange={e => setNewManagerEmail(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-xl px-4 py-2 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">Senha de Acesso</label>
                    <input 
                      type="text" 
                      value={newManagerPassword}
                      onChange={e => setNewManagerPassword(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-xl px-4 py-2 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      required
                    />
                  </div>
                </div>
                <button 
                  type="submit" 
                  disabled={isCreatingManager}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 px-6 rounded-xl transition-colors disabled:opacity-50"
                >
                  {isCreatingManager ? 'Criando...' : 'Criar Gerente'}
                </button>
              </form>

              <div className="space-y-4">
                {allAdmins.map(admin => (
                  <div key={admin.id} className="bg-zinc-50 dark:bg-zinc-950 border border-black/5 dark:border-white/5 rounded-xl p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${admin.status === 'approved' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : admin.status === 'rejected' ? 'bg-red-500/20 text-red-600 dark:text-red-400' : 'bg-blue-500/20 text-blue-600 dark:text-blue-400'}`}>
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium text-zinc-900 dark:text-white">{admin.email}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-zinc-600 dark:text-zinc-500 capitalize">{admin.status}</p>
                          <span className="text-xs text-zinc-400 dark:text-zinc-600">•</span>
                          <p className="text-xs text-zinc-600 dark:text-zinc-500 capitalize">{admin.role === 'superadmin' ? 'Super Admin' : admin.role === 'store_admin' ? 'Administrador' : 'Gerente'}</p>
                        </div>
                      </div>
                    </div>
                    {admin.email !== 'exportacoes.extras@gmail.com' && (
                      <div className="flex gap-2">
                        {admin.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => handleApproveAdmin(admin.id, 'manager')}
                              className="p-2 text-emerald-500 dark:text-emerald-400 hover:bg-emerald-500/10 dark:hover:bg-emerald-400/10 rounded-lg transition-colors"
                              title="Aprovar Gerente"
                            >
                              <CheckCircle className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => handleRejectAdmin(admin.id)}
                              className="p-2 text-red-500 dark:text-red-400 hover:bg-red-500/10 dark:hover:bg-red-400/10 rounded-lg transition-colors"
                              title="Rejeitar Gerente"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          </>
                        )}
                        {admin.status === 'approved' && (
                          <button 
                            onClick={async () => {
                              try {
                                const res = await fetch('/api/admin/reject', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ id: admin.id })
                                });
                                if (res.ok) {
                                  fetchAllAdmins();
                                  toast.success('Gerente desativado com sucesso!');
                                } else {
                                  toast.error('Erro ao desativar gerente');
                                }
                              } catch (e) {
                                toast.error('Erro ao desativar gerente');
                              }
                            }}
                            className="p-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-500/10 dark:hover:bg-zinc-400/10 rounded-lg transition-colors"
                            title="Desativar Gerente"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        )}
                        {admin.status === 'rejected' && (
                          <button 
                            onClick={() => handleApproveAdmin(admin.id, 'manager')}
                            className="p-2 text-emerald-500 dark:text-emerald-400 hover:bg-emerald-500/10 dark:hover:bg-emerald-400/10 rounded-lg transition-colors"
                            title="Ativar Gerente"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                        )}
                        <button 
                          onClick={() => handleDeleteAdmin(admin.id)}
                          className="p-2 text-red-500 dark:text-red-400 hover:bg-red-500/10 dark:hover:bg-red-400/10 rounded-lg transition-colors"
                          title="Apagar Gerente"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-2xl p-6 max-w-2xl mx-auto shadow-sm dark:shadow-none">
            <h2 className="text-xl font-semibold mb-6 text-zinc-900 dark:text-white">Configurações do Perfil</h2>
            
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              {profileError && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-600 dark:text-red-400 p-3 rounded-xl text-sm text-center">
                  {profileError}
                </div>
              )}
              {profileSuccess && (
                <div className="bg-emerald-500/10 border border-emerald-500/50 text-emerald-600 dark:text-emerald-400 p-3 rounded-xl text-sm text-center">
                  {profileSuccess}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">Novo Email (Opcional)</label>
                <input 
                  type="email" 
                  value={profileEmail}
                  onChange={e => setProfileEmail(e.target.value)}
                  placeholder={email}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
                <p className="text-xs text-zinc-600 dark:text-zinc-500 mt-1">Deixe em branco para manter o atual.</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">Nova Senha (Opcional)</label>
                <div className="relative">
                  <input 
                    type={showProfilePassword ? "text" : "password"} 
                    value={profilePassword}
                    onChange={e => setProfilePassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowProfilePassword(!showProfilePassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
                  >
                    {showProfilePassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-500 mt-1">Deixe em branco para manter a atual.</p>
              </div>
              
              <div className="flex justify-end pt-4">
                <button 
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-xl font-medium transition-colors"
                >
                  Atualizar Perfil
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {showWhatsappConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 max-w-md w-full shadow-xl border border-black/10 dark:border-white/10">
            <h3 className="text-xl font-bold mb-2 text-zinc-900 dark:text-white">Confirmar Alteração</h3>
            <p className="text-zinc-600 dark:text-zinc-400 mb-6">
              Tem certeza que deseja alterar o número de WhatsApp de <strong className="text-zinc-900 dark:text-white">{originalWhatsapp}</strong> para <strong className="text-zinc-900 dark:text-white">{storeWhatsapp}</strong>?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowWhatsappConfirm(false)}
                className="px-4 py-2 rounded-xl font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmUpdateStoreSettings}
                className="px-4 py-2 rounded-xl font-medium bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
              >
                Confirmar Alteração
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
