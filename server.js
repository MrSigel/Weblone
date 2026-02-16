import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const IS_PROD = process.env.NODE_ENV === 'production';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'dev-token-123';
const DB_PATH = process.env.DATABASE_PATH || path.join(__dirname, 'leads.db');

// DB Initialization
const db = new Database(DB_PATH);
db.exec(`
  CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT UNIQUE NOT NULL,
    channel TEXT,
    message TEXT,
    createdAt TEXT,
    ip TEXT
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    username TEXT,
    templateId INTEGER,
    siteSlug TEXT UNIQUE,
    category TEXT,
    isSetupComplete INTEGER DEFAULT 0,
    avatarUrl TEXT,
    toolsConfig TEXT DEFAULT '{}'
  );

  CREATE TABLE IF NOT EXISTS site_blocks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    name TEXT,
    type TEXT,
    status TEXT,
    orderIndex INTEGER,
    FOREIGN KEY(userId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS deals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    name TEXT,
    deal TEXT,
    performance TEXT,
    status TEXT,
    FOREIGN KEY(userId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS streamer_site_settings (
    userId INTEGER PRIMARY KEY,
    navTitle TEXT,
    logoPath TEXT,
    slogan TEXT,
    FOREIGN KEY(userId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS streamer_pages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    title TEXT,
    slug TEXT,
    type TEXT DEFAULT 'custom',
    visible INTEGER DEFAULT 1,
    sortOrder INTEGER,
    FOREIGN KEY(userId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS page_blocks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    pageId INTEGER,
    blockType TEXT,
    dataJson TEXT,
    visible INTEGER DEFAULT 1,
    sortOrder INTEGER,
    FOREIGN KEY(userId) REFERENCES users(id),
    FOREIGN KEY(pageId) REFERENCES streamer_pages(id)
  );
`);

// Insert default superadmin if not exists
const adminEmail = 'admin@weblone.de';
const adminPass = 'weblone2026!';
const existingAdmin = db.prepare('SELECT id FROM users WHERE email = ?').get(adminEmail);
if (!existingAdmin) {
  db.prepare('INSERT INTO users (email, password, username) VALUES (?, ?, ?)').run(adminEmail, adminPass, 'SuperAdmin');
}

app.use(helmet({
  contentSecurityPolicy: false, // For development simplicity
}));
app.use(cors());
app.use(express.json());

// Request Logging
app.use((req, res, next) => {
  const logMsg = `${new Date().toISOString()} - ${req.method} ${req.url}\n`;
  console.log(logMsg);
  next();
});

// API Routes

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  
  if (user && user.password === password) {
    res.json({ success: true, user: { id: user.id, email: user.email, username: user.username, isSetupComplete: user.isSetupComplete } });
  } else {
    res.status(401).json({ success: false, error: 'Ungültige Anmeldedaten.' });
  }
});

app.post('/api/auth/register', (req, res) => {
  const { email, password, inviteCode } = req.body;
  
  if (inviteCode !== 'weblone2026!') {
    return res.status(400).json({ success: false, error: 'Ungültiger Einladungscode.' });
  }

  try {
    const info = db.prepare('INSERT INTO users (email, password) VALUES (?, ?)').run(email, password);
    res.json({ success: true, user: { id: info.lastInsertRowid, email, isSetupComplete: 0 } });
  } catch (err) {
    res.status(400).json({ success: false, error: 'Email bereits registriert.' });
  }
});

app.get('/api/user/:id', (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (user) {
    res.json({ success: true, user });
  } else {
    res.status(404).json({ success: false, error: 'User not found' });
  }
});

app.get('/api/check-slug/:slug', (req, res) => {
  const existing = db.prepare('SELECT id FROM users WHERE siteSlug = ?').get(req.params.slug);
  res.json({ available: !existing });
});

app.post('/api/user/:id/setup', (req, res) => {
  const { templateId, username, siteSlug, category } = req.body;
  const userId = req.params.id;
  
  // 1. Check if slug is taken
  const existing = db.prepare('SELECT id FROM users WHERE siteSlug = ? AND id != ?').get(siteSlug, userId);
  if (existing) {
    return res.status(400).json({ success: false, error: 'Dieser Name ist bereits vergeben.' });
  }

  try {
    // Start transaction to ensure everything is created or nothing
    const transaction = db.transaction(() => {
      // 2. Update user setup data
      db.prepare(`
        UPDATE users 
        SET templateId = ?, username = ?, siteSlug = ?, category = ?, isSetupComplete = 1 
        WHERE id = ?
      `).run(Number(templateId) || 2, username, siteSlug, category, userId);

      // 3. Clear existing blocks to avoid duplicates if setup is run twice
      db.prepare('DELETE FROM site_blocks WHERE userId = ?').run(userId);

      // 4. Create default blocks based on template
      const defaultBlocks = [
        { name: 'Willkommen', type: 'Hero', orderIndex: 1 },
        { name: 'Meine Top Deals', type: 'Grid', orderIndex: 2 },
        { name: 'Social Media', type: 'List', orderIndex: 3 }
      ];

      const insertBlock = db.prepare('INSERT INTO site_blocks (userId, name, type, status, orderIndex) VALUES (?, ?, ?, ?, ?)');
      for (const block of defaultBlocks) {
        insertBlock.run(userId, block.name, block.type, 'Active', block.orderIndex);
      }
      
      // 5. Create a default deal
      db.prepare('DELETE FROM deals WHERE userId = ?').run(userId);
      db.prepare('INSERT INTO deals (userId, name, deal, performance, status) VALUES (?, ?, ?, ?, ?)')
        .run(userId, 'Weblone Partner', '100% Bonus bis 500€', 'Top Deal', 'Aktiv');

      // 6. Create default site settings
      db.prepare('INSERT OR IGNORE INTO streamer_site_settings (userId, navTitle) VALUES (?, ?)').run(userId, username);

      // 7. Create default pages
      const defaultPages = [
        { title: 'Home', slug: '', type: 'system', sortOrder: 1 },
        { title: 'Shop', slug: 'shop', type: 'system', sortOrder: 2 },
        { title: 'Hunt', slug: 'hunt', type: 'system', sortOrder: 3 },
        { title: 'Giveaway', slug: 'giveaway', type: 'system', sortOrder: 4 }
      ];
      const insertPage = db.prepare('INSERT INTO streamer_pages (userId, title, slug, type, sortOrder) VALUES (?, ?, ?, ?, ?)');
      for (const page of defaultPages) {
        insertPage.run(userId, page.title, page.slug, page.type, page.sortOrder);
      }
    });

    transaction();
    res.json({ success: true });
  } catch (err) {
    console.error('Setup Error:', err);
    res.status(500).json({ success: false, error: 'Fehler beim Erstellen deiner Landingpage.' });
  }
});

app.post('/api/user/:id/block', (req, res) => {
  const { name, type } = req.body;
  try {
    const lastBlock = db.prepare('SELECT MAX(orderIndex) as maxIdx FROM site_blocks WHERE userId = ?').get(req.params.id);
    const nextIdx = (lastBlock?.maxIdx || 0) + 1;
    
    const info = db.prepare('INSERT INTO site_blocks (userId, name, type, status, orderIndex) VALUES (?, ?, ?, ?, ?)')
      .run(req.params.id, name, type, 'Active', nextIdx);
    
    res.json({ success: true, blockId: info.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/user/:id/block/:blockId', (req, res) => {
  try {
    db.prepare('DELETE FROM site_blocks WHERE id = ? AND userId = ?')
      .run(req.params.blockId, req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/user/:id/block/:blockId', (req, res) => {
  const { status } = req.body;
  try {
    db.prepare('UPDATE site_blocks SET status = ? WHERE id = ? AND userId = ?')
      .run(status, req.params.blockId, req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/user/:id/settings', (req, res) => {
  const { username, email, avatarUrl } = req.body;
  try {
    db.prepare('UPDATE users SET username = ?, email = ?, avatarUrl = ? WHERE id = ?')
      .run(username, email, avatarUrl, req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/user/:id/tools', (req, res) => {
  const { toolsConfig } = req.body;
  try {
    db.prepare('UPDATE users SET toolsConfig = ? WHERE id = ?')
      .run(JSON.stringify(toolsConfig), req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/user/:id/deal', (req, res) => {
  const { name, deal, performance, status } = req.body;
  try {
    const info = db.prepare('INSERT INTO deals (userId, name, deal, performance, status) VALUES (?, ?, ?, ?, ?)')
      .run(req.params.id, name, deal, performance || '0 clicks', status || 'Aktiv');
    res.json({ success: true, dealId: info.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/user/:id/deal/:dealId', (req, res) => {
  const { status, name, deal, performance } = req.body;
  try {
    db.prepare('UPDATE deals SET status = ?, name = ?, deal = ?, performance = ? WHERE id = ? AND userId = ?')
      .run(status, name, deal, performance, req.params.dealId, req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/user/:id/deal/:dealId', (req, res) => {
  try {
    db.prepare('DELETE FROM deals WHERE id = ? AND userId = ?')
      .run(req.params.dealId, req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/user/:id/domain', (req, res) => {
  const { customDomain } = req.body;
  try {
    db.prepare('UPDATE users SET category = ? WHERE id = ?')
      .run(customDomain, req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/leads', (req, res) => {
  const { name, email, channel, message } = req.body;

  // Basic validation
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, error: 'Invalid email address' });
  }

  try {
    const checkEmail = db.prepare('SELECT id FROM leads WHERE email = ?').get(email);
    if (checkEmail) {
      return res.status(400).json({ success: false, error: 'Email already registered' });
    }

    const insert = db.prepare(`
      INSERT INTO leads (name, email, channel, message, createdAt, ip)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    insert.run(
      name || null,
      email,
      channel || null,
      message ? message.substring(0, 500) : null,
      new Date().toISOString(),
      req.ip
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

app.get('/api/leads', (req, res) => {
  const token = req.query.token;
  if (!token || token !== ADMIN_TOKEN) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  try {
    const leads = db.prepare('SELECT * FROM leads ORDER BY createdAt DESC').all();
    res.json({ success: true, leads });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

app.get('/api/user/:id/dashboard', (req, res) => {
  try {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
    const blocks = db.prepare('SELECT * FROM site_blocks WHERE userId = ? ORDER BY orderIndex ASC').all(req.params.id);
    const userDeals = db.prepare('SELECT * FROM deals WHERE userId = ?').all(req.params.id);
    
    // Echte Statistiken (initial 0)
    const stats = {
      visitors: 0,
      visitorsChange: '0%',
      conversions: 0,
      conversionsChange: '0%'
    };
    
    res.json({ success: true, data: { user, blocks, deals: userDeals, stats } });
  } catch (err) {
    console.error('Dashboard Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- SITE BUILDER API ---

app.get('/api/site/:id/settings', (req, res) => {
  const settings = db.prepare('SELECT * FROM streamer_site_settings WHERE userId = ?').get(req.params.id);
  res.json({ success: true, settings: settings || { navTitle: '' } });
});

app.put('/api/site/:id/settings', (req, res) => {
  const { navTitle, slogan } = req.body;
  db.prepare('INSERT OR REPLACE INTO streamer_site_settings (userId, navTitle, slogan) VALUES (?, ?, ?)')
    .run(req.params.id, navTitle, slogan);
  res.json({ success: true });
});

app.get('/api/site/:id/pages', (req, res) => {
  const pages = db.prepare('SELECT * FROM streamer_pages WHERE userId = ? ORDER BY sortOrder ASC').all(req.params.id);
  res.json({ success: true, pages });
});

app.post('/api/site/:id/pages', (req, res) => {
  const { title, slug, type } = req.body;
  const lastPage = db.prepare('SELECT MAX(sortOrder) as maxOrder FROM streamer_pages WHERE userId = ?').get(req.params.id);
  const nextOrder = (lastPage?.maxOrder || 0) + 1;
  const info = db.prepare('INSERT INTO streamer_pages (userId, title, slug, type, sortOrder) VALUES (?, ?, ?, ?, ?)')
    .run(req.params.id, title, slug, type || 'custom', nextOrder);
  res.json({ success: true, pageId: info.lastInsertRowid });
});

app.put('/api/site/:id/pages/:pageId', (req, res) => {
  const { title, slug, visible } = req.body;
  db.prepare('UPDATE streamer_pages SET title = ?, slug = ?, visible = ? WHERE id = ? AND userId = ?')
    .run(title, slug, visible === undefined ? 1 : visible, req.params.pageId, req.params.id);
  res.json({ success: true });
});

app.delete('/api/site/:id/pages/:pageId', (req, res) => {
  const page = db.prepare('SELECT type FROM streamer_pages WHERE id = ? AND userId = ?').get(req.params.pageId, req.params.id);
  if (page?.type === 'system') {
    return res.status(400).json({ success: false, error: 'Systemseiten können nicht gelöscht werden.' });
  }
  db.prepare('DELETE FROM streamer_pages WHERE id = ? AND userId = ?').run(req.params.pageId, req.params.id);
  db.prepare('DELETE FROM page_blocks WHERE pageId = ?').run(req.params.pageId);
  res.json({ success: true });
});

app.post('/api/site/:id/pages/reorder', (req, res) => {
  const { pageIds } = req.body; // Array of IDs in new order
  const update = db.prepare('UPDATE streamer_pages SET sortOrder = ? WHERE id = ? AND userId = ?');
  const transaction = db.transaction(() => {
    pageIds.forEach((pageId, index) => {
      update.run(index + 1, pageId, req.params.id);
    });
  });
  transaction();
  res.json({ success: true });
});

app.get('/api/site/:id/pages/:pageId/blocks', (req, res) => {
  const blocks = db.prepare('SELECT * FROM page_blocks WHERE pageId = ? AND userId = ? ORDER BY sortOrder ASC').all(req.params.pageId, req.params.id);
  res.json({ success: true, blocks });
});

app.post('/api/site/:id/pages/:pageId/blocks', (req, res) => {
  const { blockType, dataJson } = req.body;
  const lastBlock = db.prepare('SELECT MAX(sortOrder) as maxOrder FROM page_blocks WHERE pageId = ?').get(req.params.pageId);
  const nextOrder = (lastBlock?.maxOrder || 0) + 1;
  const info = db.prepare('INSERT INTO page_blocks (userId, pageId, blockType, dataJson, sortOrder) VALUES (?, ?, ?, ?, ?)')
    .run(req.params.id, req.params.pageId, blockType, JSON.stringify(dataJson), nextOrder);
  res.json({ success: true, blockId: info.lastInsertRowid });
});

app.put('/api/site/:id/pages/:pageId/blocks/:blockId', (req, res) => {
  const { dataJson, visible } = req.body;
  db.prepare('UPDATE page_blocks SET dataJson = ?, visible = ? WHERE id = ? AND pageId = ? AND userId = ?')
    .run(JSON.stringify(dataJson), visible === undefined ? 1 : visible, req.params.blockId, req.params.pageId, req.params.id);
  res.json({ success: true });
});

app.delete('/api/site/:id/pages/:pageId/blocks/:blockId', (req, res) => {
  db.prepare('DELETE FROM page_blocks WHERE id = ? AND pageId = ? AND userId = ?')
    .run(req.params.blockId, req.params.pageId, req.params.id);
  res.json({ success: true });
});

app.post('/api/site/:id/pages/:pageId/blocks/reorder', (req, res) => {
  const { blockIds } = req.body;
  const update = db.prepare('UPDATE page_blocks SET sortOrder = ? WHERE id = ? AND pageId = ? AND userId = ?');
  const transaction = db.transaction(() => {
    blockIds.forEach((blockId, index) => {
      update.run(index + 1, blockId, req.params.pageId, req.params.id);
    });
  });
  transaction();
  res.json({ success: true });
});

// --- PUBLIC SITE API ---

app.get('/api/public/site/:slug', (req, res) => {
  try {
    const slug = req.params.slug.toLowerCase().trim();
    const user = db.prepare('SELECT id, username, siteSlug, templateId, category, avatarUrl, toolsConfig FROM users WHERE siteSlug = ? OR category = ?').get(slug, slug);
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'Streamer nicht gefunden.' });
    }

    // Ensure basic site structure exists for older users
    const settingsCheck = db.prepare('SELECT userId FROM streamer_site_settings WHERE userId = ?').get(user.id);
    if (!settingsCheck) {
      db.prepare('INSERT OR IGNORE INTO streamer_site_settings (userId, navTitle) VALUES (?, ?)').run(user.id, user.username);
    }

    const pagesCheck = db.prepare('SELECT id FROM streamer_pages WHERE userId = ?').get(user.id);
    if (!pagesCheck) {
      const defaultPages = [
        { title: 'Home', slug: '', type: 'system', sortOrder: 1 },
        { title: 'Shop', slug: 'shop', type: 'system', sortOrder: 2 },
        { title: 'Hunt', slug: 'hunt', type: 'system', sortOrder: 3 },
        { title: 'Giveaway', slug: 'giveaway', type: 'system', sortOrder: 4 }
      ];
      const insertPage = db.prepare('INSERT INTO streamer_pages (userId, title, slug, type, sortOrder) VALUES (?, ?, ?, ?, ?)');
      for (const page of defaultPages) {
        insertPage.run(user.id, page.title, page.slug, page.type, page.sortOrder);
      }
    }

    const settings = db.prepare('SELECT * FROM streamer_site_settings WHERE userId = ?').get(user.id);
    const pages = db.prepare('SELECT * FROM streamer_pages WHERE userId = ? AND visible = 1 ORDER BY sortOrder ASC').all(user.id);
    const blocks = db.prepare('SELECT * FROM page_blocks WHERE userId = ? AND visible = 1 ORDER BY sortOrder ASC').all(user.id);
    const deals = db.prepare("SELECT * FROM deals WHERE userId = ? AND status = 'Aktiv'").all(user.id);

    res.json({ 
      success: true, 
      data: { 
        user, 
        settings: settings || { navTitle: user.username }, 
        pages, 
        blocks,
        deals
      } 
    });
  } catch (err) {
    console.error('PUBLIC SITE API ERROR:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/streamer/:slug', (req, res) => {
  try {
    const slug = req.params.slug.toLowerCase().trim();
    console.log('Fetching streamer for slug/domain:', slug);
    // Search by siteSlug OR custom domain (stored in category)
    const user = db.prepare('SELECT id, username, siteSlug, templateId, category, avatarUrl, toolsConfig FROM users WHERE siteSlug = ? OR category = ?').get(slug, slug);
    
    if (!user) {
      console.log('Streamer not found for slug/domain:', slug);
      return res.status(404).json({ success: false, error: 'Streamer nicht gefunden.' });
    }

    console.log('Found user:', user);
    const blocks = db.prepare("SELECT * FROM site_blocks WHERE userId = ? AND (status = 'Active' OR status = 'Aktiv') ORDER BY orderIndex ASC").all(user.id);
    
    res.json({ 
      success: true, 
      data: { user, blocks } 
    });
  } catch (err) {
    console.error('API Error for slug ' + req.params.slug + ':', err);
    res.status(500).json({ success: false, error: 'Datenbankfehler: ' + err.message });
  }
});

// Explicit 404 for any other /api routes
app.all('/api/*', (req, res) => {
  res.status(404).json({ success: false, error: 'API endpoint not found' });
});

// Serve static files in production
if (IS_PROD) {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (req, res) => {
    // Check if it's an API route first
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ success: false, error: 'API endpoint not found' });
    }
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Global Error:', err);
  res.status(500).json({ success: false, error: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
