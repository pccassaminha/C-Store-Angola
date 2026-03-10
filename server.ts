import express from 'express';
import { createServer as createViteServer } from 'vite';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new Database('store.db');

// Initialize DB
db.exec(`
  CREATE TABLE IF NOT EXISTS stores (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    logo TEXT,
    whatsapp TEXT,
    address TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    owner_id INTEGER,
    has_marquee INTEGER DEFAULT 1,
    marquee_text TEXT
  );
  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    store_id TEXT,
    name TEXT NOT NULL,
    shortDesc TEXT NOT NULL,
    price TEXT NOT NULL,
    image TEXT NOT NULL,
    images TEXT NOT NULL,
    fullDesc TEXT NOT NULL,
    sales INTEGER DEFAULT 0,
    reservations INTEGER DEFAULT 0,
    FOREIGN KEY (store_id) REFERENCES stores (id)
  );
  CREATE TABLE IF NOT EXISTS knowledge (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    store_id TEXT,
    content TEXT NOT NULL,
    FOREIGN KEY (store_id) REFERENCES stores (id)
  );
  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    store_id TEXT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    role TEXT DEFAULT 'manager',
    FOREIGN KEY (store_id) REFERENCES stores (id)
  );
`);

// Migrations
try { db.exec('ALTER TABLE products ADD COLUMN status TEXT DEFAULT "active"'); } catch (e) {}
try { db.exec('ALTER TABLE products ADD COLUMN specs TEXT DEFAULT "[]"'); } catch (e) {}
try { db.exec('ALTER TABLE products ADD COLUMN features TEXT DEFAULT "[]"'); } catch (e) {}
try { db.exec('ALTER TABLE products ADD COLUMN hasProgressiveDiscount INTEGER DEFAULT 0'); } catch (e) {}
try { db.exec('ALTER TABLE products ADD COLUMN detailedDesc TEXT'); } catch (e) {}
try { db.exec('ALTER TABLE products ADD COLUMN sales INTEGER DEFAULT 0'); } catch (e) {}
try { db.exec('ALTER TABLE products ADD COLUMN reservations INTEGER DEFAULT 0'); } catch (e) {}
try { db.exec('ALTER TABLE products ADD COLUMN store_id TEXT'); } catch (e) {}
try { db.exec('ALTER TABLE products ADD COLUMN videoUrl TEXT'); } catch (e) {}
try { db.exec('ALTER TABLE admins ADD COLUMN role TEXT DEFAULT "manager"'); } catch (e) {}
try { db.exec('ALTER TABLE admins ADD COLUMN store_id TEXT'); } catch (e) {}
try { db.exec('ALTER TABLE knowledge ADD COLUMN store_id TEXT'); } catch (e) {}
try { db.exec('ALTER TABLE stores ADD COLUMN whatsapp TEXT'); } catch (e) {}
try { db.exec('ALTER TABLE stores ADD COLUMN address TEXT'); } catch (e) {}
try { db.exec('ALTER TABLE stores ADD COLUMN has_marquee INTEGER DEFAULT 1'); } catch (e) {}
try { db.exec('ALTER TABLE stores ADD COLUMN marquee_text TEXT'); } catch (e) {}

// Migration to change 'main' store ID to '7234568'
try {
  const mainStore = db.prepare('SELECT * FROM stores WHERE id = ?').get('main');
  if (mainStore) {
    db.prepare('UPDATE stores SET id = ? WHERE id = ?').run('7234568', 'main');
    db.prepare('UPDATE products SET store_id = ? WHERE store_id = ?').run('7234568', 'main');
    db.prepare('UPDATE knowledge SET store_id = ? WHERE store_id = ?').run('7234568', 'main');
    db.prepare('UPDATE admins SET store_id = ? WHERE store_id = ?').run('7234568', 'main');
  }
} catch (e) {
  console.error('Migration error:', e);
}

// Insert default store if empty
const storeCheck = db.prepare('SELECT * FROM stores WHERE id = ?').get('7234568');
if (!storeCheck) {
  db.prepare('INSERT INTO stores (id, name, slug, status) VALUES (?, ?, ?, ?)').run('7234568', 'C Store Angola', 'main', 'approved');
}

// Update existing products, knowledge, and admins to belong to the main store if they don't have one
db.prepare('UPDATE products SET store_id = ? WHERE store_id IS NULL').run('7234568');
db.prepare('UPDATE knowledge SET store_id = ? WHERE store_id IS NULL').run('7234568');
db.prepare('UPDATE admins SET store_id = ? WHERE store_id IS NULL').run('7234568');

// Insert default admin if empty
const adminCheck = db.prepare('SELECT * FROM admins WHERE email = ?').get('exportacoes.extras@gmail.com');
if (!adminCheck) {
  db.prepare('INSERT INTO admins (email, password, status, role, store_id) VALUES (?, ?, ?, ?, ?)').run('exportacoes.extras@gmail.com', 'admin123', 'approved', 'superadmin', '7234568');
} else {
  // Ensure the default admin has the 'superadmin' role
  db.prepare('UPDATE admins SET role = ? WHERE email = ?').run('superadmin', 'exportacoes.extras@gmail.com');
}

// Set owner_id for main store
const mainAdmin = db.prepare('SELECT id FROM admins WHERE email = ?').get('exportacoes.extras@gmail.com') as any;
if (mainAdmin) {
  db.prepare('UPDATE stores SET owner_id = ? WHERE id = ?').run(mainAdmin.id, '7234568');
}

// Insert default knowledge if empty
const knowledgeCheck = db.prepare('SELECT * FROM knowledge WHERE store_id = ?').get('7234568');
if (!knowledgeCheck) {
  db.prepare('INSERT INTO knowledge (store_id, content) VALUES (?, ?)').run('7234568', 'O número do WhatsApp da loja é +244 921 167 980. Entregas grátis em Luanda. Pagamento na entrega.');
}

// Insert default products if empty
const productsCheck = db.prepare('SELECT COUNT(*) as count FROM products').get() as { count: number };
if (productsCheck.count === 0) {
  const defaultProducts = [
    {
      id: 'yyk-q16',
      name: 'YYK-Q16 AI Earbuds Auriculares',
      shortDesc: 'Tradução em tempo real em mais de 144 idiomas, ideal para chamadas e viagens.',
      price: '35.000 Kz',
      image: 'https://i.postimg.cc/k4yH4qLG/main-image-1.webp',
      images: [
        'https://i.postimg.cc/k4yH4qLG/main-image-1.webp',
        'https://i.postimg.cc/ydTGds2k/main-image-2.webp',
        'https://i.postimg.cc/ZRLQR4XW/main-image-3.webp',
        'https://i.postimg.cc/W37y3Tx1/main-image-4.webp',
        'https://i.postimg.cc/qqM56Wd7/main-image-5.webp',
        'https://i.postimg.cc/Y0qsLTw9/main-image-6.webp'
      ],
      fullDesc: `🎧 YYK-Q16 Auriculares com Inteligência Artificial 🌍\n\nAuricular inteligente com tradução em tempo real em mais de 144 idiomas, ideal para chamadas, reuniões, viagens e conversas internacionais.\n\nPermite comunicar sem barreiras linguísticas de forma simples e prática.\n\n🔹 Destaques:\n✔ Tradução instantânea por Inteligência Artificial\n✔ Chamadas de áudio e vídeo\n✔ Confortável com gancho ergonômico\n✔ Até 6h de música | 4h de chamadas\n✔ Carregamento rápido (50 minutos)\n\nPerfeito para trabalho, estudos e uso diário.\n\n💰 Preço: 35.000 Kz\n🚚 Entrega grátis | 💵 Pagamento na entrega`,
      detailedDesc: 'O YYK-Q16 é um auricular inteligente revolucionário que quebra as barreiras do idioma. Com tradução em tempo real em mais de 144 idiomas, é a ferramenta perfeita para negócios internacionais, viagens e estudos.',
      features: [
        'Tradução em Tempo Real: Suporta mais de 144 idiomas com alta precisão.',
        'Design Ergonômico: Gancho de orelha confortável para uso prolongado.',
        'Bateria de Longa Duração: Até 6 horas de reprodução contínua.',
        'Carregamento Rápido: Carga completa em apenas 50 minutos.',
        'Conexão Estável: Bluetooth 5.3 para áudio sem interrupções.'
      ],
      specs: [
        { label: 'Bluetooth', value: 'Versão 5.3' },
        { label: 'Tempo de Carga', value: '50 minutos' },
        { label: 'Duração da Bateria', value: 'Até 6 horas' },
        { label: 'Idiomas Suportados', value: '+144 idiomas' }
      ]
    },
    {
      id: 'mini-barbeador',
      name: 'Mini Barbeador Magnético R19 – Ultra Portátil',
      shortDesc: 'O barbeador é portátil, de boa qualidade, silencioso e confortável, ideal para retoques rápidos e uso seguro em áreas sensíveis.',
      price: '25.000 Kz',
      image: 'https://i.postimg.cc/cJtt7cSP/variant-image-cor-laranja-laranja-4.webp',
      images: [
        'https://i.postimg.cc/cJtt7cSP/variant-image-cor-laranja-laranja-4.webp',
        'https://i.postimg.cc/1zVV0KSx/variant-image-cor-amarelo-e-amarelo-3.webp',
        'https://i.postimg.cc/rpRRG9kv/variant-image-cor-azul-ceu-1.webp',
        'https://i.postimg.cc/CKnnC4g3/variant-image-cor-preto-e-preto-2.webp'
      ],
      fullDesc: `O barbeador é portátil, de boa qualidade, silencioso e confortável, ideal para retoques rápidos e uso seguro em áreas sensíveis.\n\n💰 25.000 Kz\n🚚 Entrega grátis | 💵 Pagamento na entrega\nCores disponível 🟠⚫️🔵\n\nNos infiorme seu nome e endereço para agendarmos a entrega`,
      detailedDesc: 'O R19 é a solução definitiva para quem procura praticidade e um barbear impecável em qualquer lugar. Com um design premium e tecnologia magnética, combina potência e elegância no tamanho da palma da mão.',
      features: [
        'Cabeça Magnética Removível: Encaixe e desencaixe instantâneo para uma limpeza profunda e fácil manutenção.',
        'Motor Ultra Potente (9000 RPM): Barbear rápido, suave e sem puxões, mesmo em barbas mais densas.',
        'Lâmina de Anel Duplo: Adapta-se aos contornos do rosto, reduzindo a irritação e garantindo um corte rente.',
        'Bateria de Longa Duração: Até 60 dias de uso com uma única carga (uso médio diário).',
        'Carregamento USB-C: Carregue no carro, no portátil ou com o carregador do telemóvel.',
        'Design Pocket: Ultra compacto, ideal para viagens, escritório ou ginásio.'
      ],
      specs: [
        { label: 'Material', value: 'Aço inoxidável e ABS premium' },
        { label: 'Interface', value: 'USB Type-C' },
        { label: 'Tempo de Carga', value: '1-2 horas' },
        { label: 'Conteúdo', value: 'Barbeador R19, Cabo USB-C e Escova' }
      ]
    },
    {
      id: 'espelho-360',
      name: 'Par de Espelhos de Ângulo Morto 360°',
      shortDesc: 'Segurança Total ao Conduzir. Elimina os pontos cegos e conduz com muito mais confiança.',
      price: '13.500 Kz',
      image: 'https://i.postimg.cc/R0C44SPD/main-image-1.webp',
      images: [
        'https://i.postimg.cc/R0C44SPD/main-image-1.webp',
        'https://i.postimg.cc/8CkNNpyn/main-image-2.webp',
        'https://i.postimg.cc/rphcpBbG/main-image-3.webp',
        'https://i.postimg.cc/BvZ44Sh7/main-image-4.webp',
        'https://i.postimg.cc/QM6sM2Pk/main-image-5.webp',
        'https://i.postimg.cc/BvhsvryB/main-image-6.webp'
      ],
      fullDesc: `Com o Espelho Auxiliar 360º Anti-Ponto Cego, você elimina esse risco:\n✅ Visão ampliada dos dois lados\n✅ Mais segurança em mudanças de faixa e estacionamento\n✅ Instalação em segundos, sem ferramentas\n✅ Compatível com qualquer modelo de carro\n\n📦 Pack com 2 unidades\n💰 13.500 Kz\n🚚 Entrega gratuita em Luanda`,
      detailedDesc: 'Este par de espelhos convexos de alta definição é o acessório indispensável para mudar de faixa, estacionar e fazer manobras com precisão e segurança.',
      features: [
        'Visão Ampla e Convexa: Design curvo que expande significativamente o campo de visão, revelando veículos e obstáculos que os espelhos comuns não mostram.',
        'Ajuste Personalizado 360°: Equipado com um suporte rotativo que permite ajustar o ângulo perfeito de acordo com a tua altura e posição de condução.',
        'Vidro HD Sem Moldura (Frameless): Design ultrafino e elegante que não obstrui o espelho original e oferece uma imagem nítida e real, sem distorções.',
        'Instalação Instantânea: Fixação ultra forte com adesivo 3M de alta aderência. Resistente à chuva, lavagens e altas temperaturas.',
        'Universal: Compatível com todos os tipos de veículos (carros, SUVs, carrinhas e camiões).'
      ],
      specs: [
        { label: 'Material', value: 'Vidro HD de alta qualidade e carcaça em ABS resistente' },
        { label: 'Tipo de Espelho', value: 'Convexo de ângulo largo' },
        { label: 'Rotação', value: '360 graus de inclinação e rotação' },
        { label: 'Conteúdo da Embalagem', value: '2x Espelhos de Ângulo Morto + Suportes de ajuste' }
      ]
    }
  ];
  const insertProduct = db.prepare('INSERT INTO products (id, store_id, name, shortDesc, price, image, images, fullDesc, detailedDesc, features, specs) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  for (const p of defaultProducts) {
    insertProduct.run(p.id, '7234568', p.name, p.shortDesc, p.price, p.image, JSON.stringify(p.images), p.fullDesc, p.detailedDesc, JSON.stringify(p.features), JSON.stringify(p.specs));
  }
}

// Ensure all products have a store_id
db.prepare('UPDATE products SET store_id = ? WHERE store_id IS NULL').run('7234568');

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Increase payload limit for base64 images
  app.use(express.json({ limit: '50mb' }));

  // API Routes
  app.post('/api/admin/login', (req, res) => {
    const { email, password } = req.body;
    const admin = db.prepare('SELECT * FROM admins WHERE email = ? AND password = ?').get(email, password) as any;
    
    if (admin) {
      if (admin.status === 'approved') {
        res.json({ token: 'fake-jwt-token-admin', role: admin.role, storeId: admin.store_id, email: admin.email });
      } else if (admin.status === 'pending') {
        res.status(403).json({ error: 'Conta pendente de aprovação.' });
      } else {
        res.status(403).json({ error: 'A loja está bloqueada, contacte o suporte +244 956 394 712' });
      }
    } else {
      res.status(401).json({ error: 'Credenciais inválidas' });
    }
  });

  app.post('/api/admin/register', (req, res) => {
    const { email, password, type, storeName, storeSlug, storeId } = req.body;
    try {
      if (type === 'new_store') {
        // Check if slug exists
        const existingStore = db.prepare('SELECT id FROM stores WHERE slug = ?').get(storeSlug);
        if (existingStore) {
          return res.status(400).json({ error: 'Nome de loja (slug) já em uso.' });
        }
        
        let newStoreId = Math.floor(1000000 + Math.random() * 9000000).toString();
        while (db.prepare('SELECT id FROM stores WHERE id = ?').get(newStoreId)) {
          newStoreId = Math.floor(1000000 + Math.random() * 9000000).toString();
        }
        db.prepare('INSERT INTO stores (id, name, slug, status) VALUES (?, ?, ?, ?)').run(newStoreId, storeName, storeSlug, 'pending');
        db.prepare('INSERT INTO admins (email, password, status, role, store_id) VALUES (?, ?, ?, ?, ?)').run(email, password, 'pending', 'store_admin', newStoreId);
        
        // Update owner_id
        const newAdmin = db.prepare('SELECT id FROM admins WHERE email = ?').get(email) as any;
        db.prepare('UPDATE stores SET owner_id = ? WHERE id = ?').run(newAdmin.id, newStoreId);
        
      } else {
        // Registering as manager for an existing store
        if (!storeId) return res.status(400).json({ error: 'ID da loja é obrigatório.' });
        db.prepare('INSERT INTO admins (email, password, status, role, store_id) VALUES (?, ?, ?, ?, ?)').run(email, password, 'pending', 'manager', storeId);
      }
      res.json({ success: true });
    } catch (e: any) {
      if (e.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        res.status(400).json({ error: 'Email já cadastrado.' });
      } else {
        res.status(500).json({ error: 'Erro ao criar conta.' });
      }
    }
  });

  app.post('/api/admin/create-manager', (req, res) => {
    const { email, password, storeId } = req.body;
    try {
      db.prepare('INSERT INTO admins (email, password, status, role, store_id) VALUES (?, ?, ?, ?, ?)').run(email, password, 'approved', 'manager', storeId);
      res.json({ success: true });
    } catch (e: any) {
      if (e.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        res.status(400).json({ error: 'Email já cadastrado.' });
      } else {
        res.status(500).json({ error: 'Erro ao criar gerente.' });
      }
    }
  });

  app.get('/api/stores', (req, res) => {
    const stores = db.prepare('SELECT id, name, slug, logo, whatsapp, address, status FROM stores WHERE status != ?').all('pending');
    res.json(stores);
  });

  app.get('/api/store/dashboard', (req, res) => {
    const { storeId } = req.query;
    if (!storeId) {
      return res.status(400).json({ error: 'storeId is required' });
    }
    
    const store = db.prepare('SELECT id, name, slug, logo, whatsapp, address FROM stores WHERE id = ?').get(storeId);
    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }
    
    const products = db.prepare('SELECT * FROM products WHERE store_id = ?').all(storeId);
    
    // Create orders table if it doesn't exist (since it's missing from schema)
    db.prepare(`
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        store_id TEXT,
        customer_name TEXT,
        customer_email TEXT,
        total_amount REAL,
        status TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run();
    
    const orders = db.prepare('SELECT * FROM orders WHERE store_id = ? ORDER BY created_at DESC').all(storeId);
    
    res.json({ store, products, orders });
  });

  app.post('/api/store/products', (req, res) => {
    const { storeId, name, description, price } = req.body;
    if (!storeId || !name || price === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const id = Math.random().toString(36).substring(2, 9);
    try {
      db.prepare('INSERT INTO products (id, store_id, name, shortDesc, price, image, images, fullDesc, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').run(
        id, storeId, name, description || '', price, '', '[]', '', 'active'
      );
      res.json({ success: true, id });
    } catch (e) {
      res.status(500).json({ error: 'Failed to add product' });
    }
  });

  app.delete('/api/store/products/:id', (req, res) => {
    try {
      db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: 'Failed to delete product' });
    }
  });

  app.get('/api/storefront/:slug', (req, res) => {
    const store = db.prepare('SELECT id, name, slug, logo, whatsapp, address FROM stores WHERE slug = ?').get(req.params.slug);
    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }
    
    // Also fetch products for this store
    const products = db.prepare('SELECT * FROM products WHERE store_id = ? AND status = ?').all(store.id, 'active');
    
    res.json({ store, products });
  });

  app.post('/api/storefront/checkout', (req, res) => {
    const { storeId, customerName, customerEmail, items } = req.body;
    
    if (!storeId || !customerName || !items || items.length === 0) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Create orders table if it doesn't exist
    db.prepare(`
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        store_id TEXT,
        customer_name TEXT,
        customer_email TEXT,
        total_amount REAL,
        status TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run();
    
    const orderId = Math.random().toString(36).substring(2, 9);
    const totalAmount = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
    
    try {
      db.prepare('INSERT INTO orders (id, store_id, customer_name, customer_email, total_amount, status) VALUES (?, ?, ?, ?, ?, ?)').run(
        orderId, storeId, customerName, customerEmail || '', totalAmount, 'pending'
      );
      
      // Update sales
      const updateSales = db.prepare('UPDATE products SET sales = sales + ? WHERE id = ?');
      db.transaction(() => {
        for (const item of items) {
          updateSales.run(item.quantity, item.productId);
        }
      })();
      
      res.json({ success: true, orderId });
    } catch (e) {
      res.status(500).json({ error: 'Failed to process checkout' });
    }
  });

  app.get('/api/store/:id', (req, res) => {
    const store = db.prepare('SELECT id, name, slug, logo, whatsapp, address, has_marquee, marquee_text FROM stores WHERE id = ?').get(req.params.id);
    if (store) {
      res.json(store);
    } else {
      res.status(404).json({ error: 'Loja não encontrada' });
    }
  });

  app.post('/api/store/:id/settings', (req, res) => {
    const { whatsapp, address, logo, has_marquee, marquee_text } = req.body;
    try {
      db.prepare('UPDATE stores SET whatsapp = ?, address = ?, logo = ?, has_marquee = ?, marquee_text = ? WHERE id = ?').run(whatsapp, address, logo, has_marquee === undefined ? 1 : has_marquee, marquee_text || null, req.params.id);
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: 'Erro ao atualizar configurações' });
    }
  });

  app.get('/api/stores/pending', (req, res) => {
    const stores = db.prepare(`
      SELECT s.id, s.name, s.slug, s.status, a.email as owner_email 
      FROM stores s 
      JOIN admins a ON s.owner_id = a.id 
      WHERE s.status = ?
    `).all('pending');
    res.json(stores);
  });

  app.post('/api/stores/approve', (req, res) => {
    const { id } = req.body;
    console.log('Approving store with ID:', id);
    try {
      const result1 = db.prepare('UPDATE stores SET status = ? WHERE id = ?').run('approved', id);
      console.log('Store update result:', result1);
      const result2 = db.prepare('UPDATE admins SET status = ? WHERE store_id = ? AND role = ?').run('approved', id, 'store_admin');
      console.log('Admin update result:', result2);
      res.json({ success: true });
    } catch (e) {
      console.error('Error approving store:', e);
      res.status(500).json({ error: 'Erro ao aprovar loja' });
    }
  });

  app.post('/api/stores/reject', (req, res) => {
    const { id } = req.body;
    try {
      db.prepare('UPDATE stores SET status = ? WHERE id = ?').run('rejected', id);
      db.prepare('UPDATE admins SET status = ? WHERE store_id = ? AND role = ?').run('rejected', id, 'store_admin');
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: 'Erro ao rejeitar loja' });
    }
  });

  app.delete('/api/stores/:id', (req, res) => {
    const { id } = req.params;
    try {
      db.prepare('DELETE FROM products WHERE store_id = ?').run(id);
      db.prepare('DELETE FROM orders WHERE store_id = ?').run(id);
      db.prepare('DELETE FROM admins WHERE store_id = ?').run(id);
      db.prepare('DELETE FROM stores WHERE id = ?').run(id);
      res.json({ success: true });
    } catch (e) {
      console.error('Error deleting store:', e);
      res.status(500).json({ error: 'Erro ao eliminar loja' });
    }
  });

  app.get('/api/admin/pending', (req, res) => {
    const { storeId } = req.query;
    let pendingAdmins;
    if (storeId) {
      pendingAdmins = db.prepare('SELECT id, email, status, role FROM admins WHERE status = ? AND store_id = ?').all('pending', storeId);
    } else {
      pendingAdmins = db.prepare('SELECT id, email, status, role, store_id FROM admins WHERE status = ?').all('pending');
    }
    res.json(pendingAdmins);
  });

  app.get('/api/admins', (req, res) => {
    const { storeId } = req.query;
    let admins;
    if (storeId) {
      admins = db.prepare('SELECT id, email, status, role FROM admins WHERE store_id = ?').all(storeId);
    } else {
      admins = db.prepare('SELECT id, email, status, role, store_id FROM admins').all();
    }
    res.json(admins);
  });

  app.post('/api/admin/approve', (req, res) => {
    const { id, role } = req.body;
    db.prepare('UPDATE admins SET status = ?, role = ? WHERE id = ?').run('approved', role || 'manager', id);
    res.json({ success: true });
  });

  app.post('/api/admin/reject', (req, res) => {
    const { id } = req.body;
    db.prepare('UPDATE admins SET status = ? WHERE id = ?').run('rejected', id);
    res.json({ success: true });
  });

  app.delete('/api/admin/:id', (req, res) => {
    db.prepare('DELETE FROM admins WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  app.put('/api/admin/profile', (req, res) => {
    const { currentEmail, newEmail, newPassword } = req.body;
    try {
      if (newPassword) {
        db.prepare('UPDATE admins SET email = ?, password = ? WHERE email = ?').run(newEmail, newPassword, currentEmail);
      } else {
        db.prepare('UPDATE admins SET email = ? WHERE email = ?').run(newEmail, currentEmail);
      }
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: 'Erro ao atualizar perfil' });
    }
  });

  app.get('/api/products', (req, res) => {
    const { storeId } = req.query;
    let products;
    if (storeId) {
      products = db.prepare('SELECT * FROM products WHERE store_id = ?').all(storeId);
    } else {
      products = db.prepare('SELECT * FROM products').all();
    }
    
    const formattedProducts = products.map((p: any) => ({
      ...p,
      hasProgressiveDiscount: Boolean(p.hasProgressiveDiscount),
      images: JSON.parse(p.images),
      specs: JSON.parse(p.specs || '[]'),
      features: JSON.parse(p.features || '[]')
    }));
    res.json(formattedProducts);
  });

  app.post('/api/products', (req, res) => {
    const { id, name, shortDesc, price, image, images, fullDesc, detailedDesc = '', status = 'active', hasProgressiveDiscount = false, specs = [], features = [], storeId, videoUrl = '' } = req.body;
    try {
      db.prepare('INSERT INTO products (id, store_id, name, shortDesc, price, image, images, fullDesc, detailedDesc, status, hasProgressiveDiscount, specs, features, videoUrl, sales, reservations) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0)').run(
        id, storeId || '7234568', name, shortDesc, price, image, JSON.stringify(images), fullDesc, detailedDesc, status, hasProgressiveDiscount ? 1 : 0, JSON.stringify(specs), JSON.stringify(features), videoUrl
      );
      res.json({ success: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Erro ao adicionar produto' });
    }
  });

  app.put('/api/products/:id', (req, res) => {
    const { name, shortDesc, price, image, images, fullDesc, detailedDesc = '', status, hasProgressiveDiscount, specs, features, videoUrl = '' } = req.body;
    try {
      db.prepare('UPDATE products SET name = ?, shortDesc = ?, price = ?, image = ?, images = ?, fullDesc = ?, detailedDesc = ?, status = ?, hasProgressiveDiscount = ?, specs = ?, features = ?, videoUrl = ? WHERE id = ?').run(
        name, shortDesc, price, image, JSON.stringify(images), fullDesc, detailedDesc, status, hasProgressiveDiscount ? 1 : 0, JSON.stringify(specs), JSON.stringify(features), videoUrl, req.params.id
      );
      res.json({ success: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Erro ao atualizar produto' });
    }
  });

  app.put('/api/products/:id/status', (req, res) => {
    const { status } = req.body;
    try {
      db.prepare('UPDATE products SET status = ? WHERE id = ?').run(status, req.params.id);
      res.json({ success: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Erro ao atualizar status do produto' });
    }
  });

  app.post('/api/products/:id/reserve', (req, res) => {
    const { quantity = 1 } = req.body;
    try {
      db.prepare('UPDATE products SET reservations = reservations + ? WHERE id = ?').run(quantity, req.params.id);
      res.json({ success: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Erro ao registrar reserva' });
    }
  });

  app.post('/api/products/reset-ranking', (req, res) => {
    try {
      db.prepare('UPDATE products SET sales = 0, reservations = 0').run();
      res.json({ success: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Erro ao zerar ranking' });
    }
  });

  app.delete('/api/products/:id', (req, res) => {
    db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  app.get('/api/knowledge', (req, res) => {
    const { storeId } = req.query;
    let k;
    if (storeId) {
      k = db.prepare('SELECT content FROM knowledge WHERE store_id = ?').get(storeId) as any;
    } else {
      k = db.prepare('SELECT content FROM knowledge WHERE store_id = ?').get('7234568') as any;
    }
    res.json({ content: k?.content || '' });
  });

  app.post('/api/knowledge', (req, res) => {
    const { content, storeId } = req.body;
    const targetStoreId = storeId || '7234568';
    
    const existing = db.prepare('SELECT id FROM knowledge WHERE store_id = ?').get(targetStoreId);
    if (existing) {
      db.prepare('UPDATE knowledge SET content = ? WHERE store_id = ?').run(content, targetStoreId);
    } else {
      db.prepare('INSERT INTO knowledge (store_id, content) VALUES (?, ?)').run(targetStoreId, content);
    }
    res.json({ success: true });
  });

  // Vite middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
