import express from 'express';
import { createServer as createViteServer } from 'vite';
import pg from 'pg';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Postgres Pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function initDB() {
  try {
    await pool.query(`
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
        status TEXT DEFAULT 'active',
        specs TEXT DEFAULT '[]',
        features TEXT DEFAULT '[]',
        hasProgressiveDiscount INTEGER DEFAULT 0,
        detailedDesc TEXT,
        videoUrl TEXT
      );
      CREATE TABLE IF NOT EXISTS knowledge (
        id SERIAL PRIMARY KEY,
        store_id TEXT,
        content TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        store_id TEXT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        role TEXT DEFAULT 'manager'
      );
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        store_id TEXT,
        customer_name TEXT,
        customer_email TEXT,
        total_amount REAL,
        status TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Insert default store if empty
    const storeCheck = await pool.query('SELECT * FROM stores WHERE id = $1', ['7234568']);
    if (storeCheck.rows.length === 0) {
      await pool.query('INSERT INTO stores (id, name, slug, status) VALUES ($1, $2, $3, $4)', ['7234568', 'C Store Angola', 'main', 'approved']);
    }

    // Insert default admin if empty
    const adminCheck = await pool.query('SELECT * FROM admins WHERE email = $1', ['exportacoes.extras@gmail.com']);
    if (adminCheck.rows.length === 0) {
      await pool.query('INSERT INTO admins (email, password, status, role, store_id) VALUES ($1, $2, $3, $4, $5)', ['exportacoes.extras@gmail.com', 'admin123', 'approved', 'superadmin', '7234568']);
    } else {
      await pool.query('UPDATE admins SET role = $1 WHERE email = $2', ['superadmin', 'exportacoes.extras@gmail.com']);
    }

    // Set owner_id for main store
    const mainAdmin = await pool.query('SELECT id FROM admins WHERE email = $1', ['exportacoes.extras@gmail.com']);
    if (mainAdmin.rows.length > 0) {
      await pool.query('UPDATE stores SET owner_id = $1 WHERE id = $2', [mainAdmin.rows[0].id, '7234568']);
    }

    // Insert default knowledge if empty
    const knowledgeCheck = await pool.query('SELECT * FROM knowledge WHERE store_id = $1', ['7234568']);
    if (knowledgeCheck.rows.length === 0) {
      await pool.query('INSERT INTO knowledge (store_id, content) VALUES ($1, $2)', ['7234568', 'O número do WhatsApp da loja é +244 921 167 980. Entregas grátis em Luanda. Pagamento na entrega.']);
    }

    // Insert default products if empty
    const productsCheck = await pool.query('SELECT COUNT(*) as count FROM products');
    if (parseInt(productsCheck.rows[0].count) === 0) {
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
      
      for (const p of defaultProducts) {
        await pool.query(
          'INSERT INTO products (id, store_id, name, shortDesc, price, image, images, fullDesc, detailedDesc, features, specs) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
          [p.id, '7234568', p.name, p.shortDesc, p.price, p.image, JSON.stringify(p.images), p.fullDesc, p.detailedDesc, JSON.stringify(p.features), JSON.stringify(p.specs)]
        );
      }
    }
    console.log('Database initialized successfully');
  } catch (err) {
    console.error('Failed to initialize database:', err);
  }
}

async function startServer() {
  if (process.env.DATABASE_URL) {
    await initDB();
  } else {
    console.warn('DATABASE_URL not set. Skipping database initialization.');
  }

  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // API Routes
  app.post('/api/admin/login', async (req, res) => {
    const { email, password } = req.body;
    try {
      const result = await pool.query('SELECT * FROM admins WHERE email = $1 AND password = $2', [email, password]);
      const admin = result.rows[0];
      
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
    } catch (e) {
      console.error('Login error:', e);
      res.status(500).json({ error: 'Erro no servidor' });
    }
  });

  app.post('/api/admin/register', async (req, res) => {
    const { email, password, type, storeName, storeSlug, storeId } = req.body;
    try {
      if (type === 'new_store') {
        const existingStore = await pool.query('SELECT id FROM stores WHERE slug = $1', [storeSlug]);
        if (existingStore.rows.length > 0) {
          return res.status(400).json({ error: 'Nome de loja (slug) já em uso.' });
        }
        
        let newStoreId = Math.floor(1000000 + Math.random() * 9000000).toString();
        let idCheck = await pool.query('SELECT id FROM stores WHERE id = $1', [newStoreId]);
        while (idCheck.rows.length > 0) {
          newStoreId = Math.floor(1000000 + Math.random() * 9000000).toString();
          idCheck = await pool.query('SELECT id FROM stores WHERE id = $1', [newStoreId]);
        }
        
        await pool.query('BEGIN');
        await pool.query('INSERT INTO stores (id, name, slug, status) VALUES ($1, $2, $3, $4)', [newStoreId, storeName, storeSlug, 'pending']);
        const newAdminResult = await pool.query('INSERT INTO admins (email, password, status, role, store_id) VALUES ($1, $2, $3, $4, $5) RETURNING id', [email, password, 'pending', 'store_admin', newStoreId]);
        await pool.query('UPDATE stores SET owner_id = $1 WHERE id = $2', [newAdminResult.rows[0].id, newStoreId]);
        await pool.query('COMMIT');
        
      } else {
        if (!storeId) return res.status(400).json({ error: 'ID da loja é obrigatório.' });
        await pool.query('INSERT INTO admins (email, password, status, role, store_id) VALUES ($1, $2, $3, $4, $5)', [email, password, 'pending', 'manager', storeId]);
      }
      res.json({ success: true });
    } catch (e: any) {
      await pool.query('ROLLBACK');
      if (e.code === '23505') { // Postgres unique violation
        res.status(400).json({ error: 'Email já cadastrado.' });
      } else {
        res.status(500).json({ error: 'Erro ao criar conta.' });
      }
    }
  });

  app.post('/api/admin/create-manager', async (req, res) => {
    const { email, password, storeId } = req.body;
    try {
      await pool.query('INSERT INTO admins (email, password, status, role, store_id) VALUES ($1, $2, $3, $4, $5)', [email, password, 'approved', 'manager', storeId]);
      res.json({ success: true });
    } catch (e: any) {
      if (e.code === '23505') {
        res.status(400).json({ error: 'Email já cadastrado.' });
      } else {
        res.status(500).json({ error: 'Erro ao criar gerente.' });
      }
    }
  });

  app.get('/api/stores', async (req, res) => {
    try {
      const result = await pool.query('SELECT id, name, slug, logo, whatsapp, address, status FROM stores WHERE status != $1', ['pending']);
      res.json(result.rows);
    } catch (e) {
      res.status(500).json({ error: 'Erro ao buscar lojas' });
    }
  });

  app.get('/api/store/dashboard', async (req, res) => {
    const { storeId } = req.query;
    if (!storeId) return res.status(400).json({ error: 'storeId is required' });
    
    try {
      const storeResult = await pool.query('SELECT id, name, slug, logo, whatsapp, address FROM stores WHERE id = $1', [storeId]);
      if (storeResult.rows.length === 0) return res.status(404).json({ error: 'Store not found' });
      
      const productsResult = await pool.query('SELECT * FROM products WHERE store_id = $1', [storeId]);
      const ordersResult = await pool.query('SELECT * FROM orders WHERE store_id = $1 ORDER BY created_at DESC', [storeId]);
      
      res.json({ store: storeResult.rows[0], products: productsResult.rows, orders: ordersResult.rows });
    } catch (e) {
      res.status(500).json({ error: 'Erro ao buscar dashboard' });
    }
  });

  app.post('/api/store/products', async (req, res) => {
    const { storeId, name, description, price } = req.body;
    if (!storeId || !name || price === undefined) return res.status(400).json({ error: 'Missing required fields' });
    
    const id = Math.random().toString(36).substring(2, 9);
    try {
      await pool.query(
        'INSERT INTO products (id, store_id, name, shortDesc, price, image, images, fullDesc, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
        [id, storeId, name, description || '', price, '', '[]', '', 'active']
      );
      res.json({ success: true, id });
    } catch (e) {
      res.status(500).json({ error: 'Failed to add product' });
    }
  });

  app.delete('/api/store/products/:id', async (req, res) => {
    try {
      await pool.query('DELETE FROM products WHERE id = $1', [req.params.id]);
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: 'Failed to delete product' });
    }
  });

  app.get('/api/storefront/:slug', async (req, res) => {
    try {
      const storeResult = await pool.query('SELECT id, name, slug, logo, whatsapp, address FROM stores WHERE slug = $1', [req.params.slug]);
      if (storeResult.rows.length === 0) return res.status(404).json({ error: 'Store not found' });
      
      const productsResult = await pool.query('SELECT * FROM products WHERE store_id = $1 AND status = $2', [storeResult.rows[0].id, 'active']);
      res.json({ store: storeResult.rows[0], products: productsResult.rows });
    } catch (e) {
      res.status(500).json({ error: 'Erro ao buscar loja' });
    }
  });

  app.post('/api/storefront/checkout', async (req, res) => {
    const { storeId, customerName, customerEmail, items } = req.body;
    if (!storeId || !customerName || !items || items.length === 0) return res.status(400).json({ error: 'Missing required fields' });
    
    const orderId = Math.random().toString(36).substring(2, 9);
    const totalAmount = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
    
    try {
      await pool.query('BEGIN');
      await pool.query(
        'INSERT INTO orders (id, store_id, customer_name, customer_email, total_amount, status) VALUES ($1, $2, $3, $4, $5, $6)',
        [orderId, storeId, customerName, customerEmail || '', totalAmount, 'pending']
      );
      
      for (const item of items) {
        await pool.query('UPDATE products SET sales = sales + $1 WHERE id = $2', [item.quantity, item.productId]);
      }
      await pool.query('COMMIT');
      res.json({ success: true, orderId });
    } catch (e) {
      await pool.query('ROLLBACK');
      res.status(500).json({ error: 'Failed to process checkout' });
    }
  });

  app.get('/api/store/:id', async (req, res) => {
    try {
      const storeResult = await pool.query('SELECT id, name, slug, logo, whatsapp, address, has_marquee, marquee_text FROM stores WHERE id = $1', [req.params.id]);
      if (storeResult.rows.length > 0) {
        res.json(storeResult.rows[0]);
      } else {
        res.status(404).json({ error: 'Loja não encontrada' });
      }
    } catch (e) {
      res.status(500).json({ error: 'Erro ao buscar loja' });
    }
  });

  app.post('/api/store/:id/settings', async (req, res) => {
    const { whatsapp, address, logo, has_marquee, marquee_text } = req.body;
    try {
      await pool.query(
        'UPDATE stores SET whatsapp = $1, address = $2, logo = $3, has_marquee = $4, marquee_text = $5 WHERE id = $6',
        [whatsapp, address, logo, has_marquee === undefined ? 1 : has_marquee, marquee_text || null, req.params.id]
      );
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: 'Erro ao atualizar configurações' });
    }
  });

  app.get('/api/stores/pending', async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT s.id, s.name, s.slug, s.status, a.email as owner_email 
        FROM stores s 
        JOIN admins a ON s.owner_id = a.id 
        WHERE s.status = $1
      `, ['pending']);
      res.json(result.rows);
    } catch (e) {
      res.status(500).json({ error: 'Erro ao buscar lojas pendentes' });
    }
  });

  app.post('/api/stores/approve', async (req, res) => {
    const { id } = req.body;
    try {
      await pool.query('BEGIN');
      await pool.query('UPDATE stores SET status = $1 WHERE id = $2', ['approved', id]);
      await pool.query('UPDATE admins SET status = $1 WHERE store_id = $2 AND role = $3', ['approved', id, 'store_admin']);
      await pool.query('COMMIT');
      res.json({ success: true });
    } catch (e) {
      await pool.query('ROLLBACK');
      res.status(500).json({ error: 'Erro ao aprovar loja' });
    }
  });

  app.post('/api/stores/reject', async (req, res) => {
    const { id } = req.body;
    try {
      await pool.query('BEGIN');
      await pool.query('UPDATE stores SET status = $1 WHERE id = $2', ['rejected', id]);
      await pool.query('UPDATE admins SET status = $1 WHERE store_id = $2 AND role = $3', ['rejected', id, 'store_admin']);
      await pool.query('COMMIT');
      res.json({ success: true });
    } catch (e) {
      await pool.query('ROLLBACK');
      res.status(500).json({ error: 'Erro ao rejeitar loja' });
    }
  });

  app.delete('/api/stores/:id', async (req, res) => {
    const { id } = req.params;
    try {
      await pool.query('BEGIN');
      await pool.query('DELETE FROM products WHERE store_id = $1', [id]);
      await pool.query('DELETE FROM orders WHERE store_id = $1', [id]);
      await pool.query('DELETE FROM admins WHERE store_id = $1', [id]);
      await pool.query('DELETE FROM stores WHERE id = $1', [id]);
      await pool.query('COMMIT');
      res.json({ success: true });
    } catch (e) {
      await pool.query('ROLLBACK');
      res.status(500).json({ error: 'Erro ao eliminar loja' });
    }
  });

  app.get('/api/admin/pending', async (req, res) => {
    const { storeId } = req.query;
    try {
      let result;
      if (storeId) {
        result = await pool.query('SELECT id, email, status, role FROM admins WHERE status = $1 AND store_id = $2', ['pending', storeId]);
      } else {
        result = await pool.query('SELECT id, email, status, role, store_id FROM admins WHERE status = $1', ['pending']);
      }
      res.json(result.rows);
    } catch (e) {
      res.status(500).json({ error: 'Erro ao buscar admins pendentes' });
    }
  });

  app.get('/api/admins', async (req, res) => {
    const { storeId } = req.query;
    try {
      let result;
      if (storeId) {
        result = await pool.query('SELECT id, email, status, role FROM admins WHERE store_id = $1', [storeId]);
      } else {
        result = await pool.query('SELECT id, email, status, role, store_id FROM admins');
      }
      res.json(result.rows);
    } catch (e) {
      res.status(500).json({ error: 'Erro ao buscar admins' });
    }
  });

  app.post('/api/admin/approve', async (req, res) => {
    const { id, role } = req.body;
    try {
      await pool.query('UPDATE admins SET status = $1, role = $2 WHERE id = $3', ['approved', role || 'manager', id]);
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: 'Erro ao aprovar admin' });
    }
  });

  app.post('/api/admin/reject', async (req, res) => {
    const { id } = req.body;
    try {
      await pool.query('UPDATE admins SET status = $1 WHERE id = $2', ['rejected', id]);
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: 'Erro ao rejeitar admin' });
    }
  });

  app.delete('/api/admin/:id', async (req, res) => {
    try {
      await pool.query('DELETE FROM admins WHERE id = $1', [req.params.id]);
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: 'Erro ao eliminar admin' });
    }
  });

  app.put('/api/admin/profile', async (req, res) => {
    const { currentEmail, newEmail, newPassword } = req.body;
    try {
      if (newPassword) {
        await pool.query('UPDATE admins SET email = $1, password = $2 WHERE email = $3', [newEmail, newPassword, currentEmail]);
      } else {
        await pool.query('UPDATE admins SET email = $1 WHERE email = $2', [newEmail, currentEmail]);
      }
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: 'Erro ao atualizar perfil' });
    }
  });

  app.get('/api/products', async (req, res) => {
    const { storeId } = req.query;
    try {
      let result;
      if (storeId) {
        result = await pool.query('SELECT * FROM products WHERE store_id = $1', [storeId]);
      } else {
        result = await pool.query('SELECT * FROM products');
      }
      
      const formattedProducts = result.rows.map((p: any) => ({
        ...p,
        hasProgressiveDiscount: Boolean(p.hasprogressivediscount || p.hasProgressiveDiscount),
        images: JSON.parse(p.images || '[]'),
        specs: JSON.parse(p.specs || '[]'),
        features: JSON.parse(p.features || '[]')
      }));
      res.json(formattedProducts);
    } catch (e) {
      res.status(500).json({ error: 'Erro ao buscar produtos' });
    }
  });

  app.post('/api/products', async (req, res) => {
    const { id, name, shortDesc, price, image, images, fullDesc, detailedDesc = '', status = 'active', hasProgressiveDiscount = false, specs = [], features = [], storeId, videoUrl = '' } = req.body;
    try {
      await pool.query(
        'INSERT INTO products (id, store_id, name, shortDesc, price, image, images, fullDesc, detailedDesc, status, hasProgressiveDiscount, specs, features, videoUrl, sales, reservations) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 0, 0)',
        [id, storeId || '7234568', name, shortDesc, price, image, JSON.stringify(images), fullDesc, detailedDesc, status, hasProgressiveDiscount ? 1 : 0, JSON.stringify(specs), JSON.stringify(features), videoUrl]
      );
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: 'Erro ao adicionar produto' });
    }
  });

  app.put('/api/products/:id', async (req, res) => {
    const { name, shortDesc, price, image, images, fullDesc, detailedDesc = '', status, hasProgressiveDiscount, specs, features, videoUrl = '' } = req.body;
    try {
      await pool.query(
        'UPDATE products SET name = $1, shortDesc = $2, price = $3, image = $4, images = $5, fullDesc = $6, detailedDesc = $7, status = $8, hasProgressiveDiscount = $9, specs = $10, features = $11, videoUrl = $12 WHERE id = $13',
        [name, shortDesc, price, image, JSON.stringify(images), fullDesc, detailedDesc, status, hasProgressiveDiscount ? 1 : 0, JSON.stringify(specs), JSON.stringify(features), videoUrl, req.params.id]
      );
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: 'Erro ao atualizar produto' });
    }
  });

  app.put('/api/products/:id/status', async (req, res) => {
    const { status } = req.body;
    try {
      await pool.query('UPDATE products SET status = $1 WHERE id = $2', [status, req.params.id]);
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: 'Erro ao atualizar status do produto' });
    }
  });

  app.post('/api/products/:id/reserve', async (req, res) => {
    const { quantity = 1 } = req.body;
    try {
      await pool.query('UPDATE products SET reservations = reservations + $1 WHERE id = $2', [quantity, req.params.id]);
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: 'Erro ao registrar reserva' });
    }
  });

  app.post('/api/products/reset-ranking', async (req, res) => {
    try {
      await pool.query('UPDATE products SET sales = 0, reservations = 0');
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: 'Erro ao zerar ranking' });
    }
  });

  app.delete('/api/products/:id', async (req, res) => {
    try {
      await pool.query('DELETE FROM products WHERE id = $1', [req.params.id]);
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: 'Erro ao deletar produto' });
    }
  });

  app.get('/api/knowledge', async (req, res) => {
    const { storeId } = req.query;
    try {
      const targetStoreId = storeId || '7234568';
      const result = await pool.query('SELECT content FROM knowledge WHERE store_id = $1', [targetStoreId]);
      res.json({ content: result.rows[0]?.content || '' });
    } catch (e) {
      res.status(500).json({ error: 'Erro ao buscar conhecimento' });
    }
  });

  app.post('/api/knowledge', async (req, res) => {
    const { content, storeId } = req.body;
    const targetStoreId = storeId || '7234568';
    
    try {
      const existing = await pool.query('SELECT id FROM knowledge WHERE store_id = $1', [targetStoreId]);
      if (existing.rows.length > 0) {
        await pool.query('UPDATE knowledge SET content = $1 WHERE store_id = $2', [content, targetStoreId]);
      } else {
        await pool.query('INSERT INTO knowledge (store_id, content) VALUES ($1, $2)', [targetStoreId, content]);
      }
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: 'Erro ao salvar conhecimento' });
    }
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
