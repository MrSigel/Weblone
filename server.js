import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import tls from 'tls';
import { randomBytes } from 'crypto';
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
const DB_PATH = process.env.DATABASE_PATH || (IS_PROD ? '/var/data/leads.db' : path.join(__dirname, 'leads.db'));
const SUPERADMIN_EMAIL = process.env.SUPERADMIN_EMAIL || 'admin@weblone2026.com';
const SUPERADMIN_PASSWORD = process.env.SUPERADMIN_PASSWORD || 'graecodesigns.de2026!';
const SUPERADMIN_SESSION_TOKEN = process.env.SUPERADMIN_SESSION_TOKEN || 'superadmin-session-token-2026';
const SUPERADMIN_2FA_CODE = process.env.SUPERADMIN_2FA_CODE || '';
const SUPERADMIN_IP_ALLOWLIST = (process.env.SUPERADMIN_IP_ALLOWLIST || '').split(',').map((x) => x.trim()).filter(Boolean);
const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID || '';
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET || '';
const TWITCH_REDIRECT_URI = process.env.TWITCH_REDIRECT_URI || '';
const FRONTEND_BASE_URL = process.env.FRONTEND_BASE_URL || '';
const adTimerJobs = new Map();
const pickupReminderJobs = new Map();
const chatReaderSessions = new Map();
const pendingTwitchAuthStates = new Map();
const superadminSessions = new Map();

// DB Initialization
const LOCAL_DB_FALLBACK = path.join(__dirname, 'leads.db');
let activeDbPath = DB_PATH;
let db;

try {
  fs.mkdirSync(path.dirname(activeDbPath), { recursive: true });
  db = new Database(activeDbPath);
} catch (err) {
  console.error(`Database open failed for \"${activeDbPath}\": ${err.message}`);
  activeDbPath = LOCAL_DB_FALLBACK;
  fs.mkdirSync(path.dirname(activeDbPath), { recursive: true });
  db = new Database(activeDbPath);
  console.warn(`Falling back to local database path: ${activeDbPath}`);
}
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

  CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    actor TEXT,
    action TEXT,
    targetUserId INTEGER,
    details TEXT,
    createdAt TEXT
  );

  CREATE TABLE IF NOT EXISTS support_tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    subject TEXT,
    status TEXT DEFAULT 'open',
    priority TEXT DEFAULT 'normal',
    message TEXT,
    assignee TEXT,
    createdAt TEXT,
    updatedAt TEXT
  );

  CREATE TABLE IF NOT EXISTS payouts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    amount REAL,
    currency TEXT DEFAULT 'EUR',
    status TEXT DEFAULT 'pending',
    note TEXT,
    period TEXT,
    dueDate TEXT,
    paidAt TEXT,
    createdAt TEXT
  );

  CREATE TABLE IF NOT EXISTS cta_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    slug TEXT,
    variant TEXT,
    eventType TEXT,
    createdAt TEXT,
    ip TEXT,
    userAgent TEXT
  );
`);

const ensureColumn = (tableName, columnName, definitionSql) => {
  const columns = db.prepare(`PRAGMA table_info(${tableName})`).all();
  const hasColumn = columns.some((col) => col.name === columnName);
  if (!hasColumn) {
    db.prepare(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definitionSql}`).run();
  }
};

ensureColumn('streamer_site_settings', 'primaryCtaText', "TEXT DEFAULT 'Jetzt Bonus sichern'");
ensureColumn('streamer_site_settings', 'primaryCtaUrl', "TEXT DEFAULT ''");
ensureColumn('streamer_site_settings', 'stickyCtaEnabled', 'INTEGER DEFAULT 1');
ensureColumn('streamer_site_settings', 'stickyCtaText', "TEXT DEFAULT 'Jetzt registrieren & Bonus aktivieren'");
ensureColumn('streamer_site_settings', 'stickyCtaUrl', "TEXT DEFAULT ''");
ensureColumn('streamer_site_settings', 'trustBadgeText', "TEXT DEFAULT 'Verifiziert | 18+ | Verantwortungsvoll spielen'");
ensureColumn('streamer_site_settings', 'urgencyText', "TEXT DEFAULT 'Nur heute: exklusive Freispiele für neue Spieler'");
ensureColumn('streamer_site_settings', 'abTestEnabled', 'INTEGER DEFAULT 0');
ensureColumn('streamer_site_settings', 'ctaAText', "TEXT DEFAULT 'Jetzt Bonus sichern'");
ensureColumn('streamer_site_settings', 'ctaAUrl', "TEXT DEFAULT ''");
ensureColumn('streamer_site_settings', 'ctaBText', "TEXT DEFAULT 'Bonus für neue Spieler holen'");
ensureColumn('streamer_site_settings', 'ctaBUrl', "TEXT DEFAULT ''");
ensureColumn('streamer_site_settings', 'conversionBoosterEnabled', 'INTEGER DEFAULT 1');
ensureColumn('streamer_site_settings', 'backgroundTheme', "TEXT DEFAULT 'dark'");
ensureColumn('users', 'customDomain', "TEXT DEFAULT ''");
ensureColumn('deals', 'imageUrl', "TEXT DEFAULT ''");
ensureColumn('deals', 'promoCode', "TEXT DEFAULT 'DIEGAWINOS'");
ensureColumn('deals', 'bonusTerms', "TEXT DEFAULT '100% Sticky - 300EUR Max Bonus - 40x Wager'");
ensureColumn('deals', 'ctaUrl', "TEXT DEFAULT ''");
db.prepare("UPDATE streamer_pages SET title = 'Casinos' WHERE slug = 'shop'").run();
db.prepare("UPDATE users SET customDomain = category WHERE (customDomain IS NULL OR customDomain = '') AND instr(category, '.') > 0").run();

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

const readUserToolsConfig = (userId) => {
  const row = db.prepare('SELECT toolsConfig FROM users WHERE id = ?').get(userId);
  if (!row) return {};
  try {
    return row.toolsConfig ? JSON.parse(row.toolsConfig) : {};
  } catch (err) {
    return {};
  }
};

const writeUserToolsConfig = (userId, toolsConfig) => {
  db.prepare('UPDATE users SET toolsConfig = ? WHERE id = ?')
    .run(JSON.stringify(toolsConfig || {}), userId);
};

const logAudit = (actor, action, targetUserId = null, details = null) => {
  try {
    db.prepare('INSERT INTO audit_logs (actor, action, targetUserId, details, createdAt) VALUES (?, ?, ?, ?, ?)')
      .run(
        actor || 'system',
        action || 'unknown',
        targetUserId === undefined ? null : targetUserId,
        details ? JSON.stringify(details) : null,
        new Date().toISOString()
      );
  } catch (err) {
    console.error('Audit log error:', err.message);
  }
};

const resolveFrontendBase = (req) => {
  if (FRONTEND_BASE_URL) return FRONTEND_BASE_URL.replace(/\/$/, '');
  return `${req.protocol}://${req.get('host')}`;
};

const resolveTwitchRedirectUri = (req) => {
  if (TWITCH_REDIRECT_URI) return TWITCH_REDIRECT_URI;
  return `${req.protocol}://${req.get('host')}/api/social/twitch/callback`;
};

const twitchScopes = [
  'user:read:email',
  'moderator:read:followers',
  'channel:read:subscriptions'
];

const parseKickFollowers = (payload) => (
  payload?.followersCount ??
  payload?.followers_count ??
  payload?.followers ??
  payload?.subscriber_count ??
  0
);

const parseKickSubs = (payload) => (
  payload?.subscribersCount ??
  payload?.subscribers_count ??
  payload?.subscribers ??
  null
);

const refreshTwitchAccessToken = async (refreshToken) => {
  const params = new URLSearchParams();
  params.set('client_id', TWITCH_CLIENT_ID);
  params.set('client_secret', TWITCH_CLIENT_SECRET);
  params.set('grant_type', 'refresh_token');
  params.set('refresh_token', refreshToken);

  const response = await fetch('https://id.twitch.tv/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString()
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Twitch Token Refresh fehlgeschlagen.');
  }
  return data;
};

const fetchTwitchMetrics = async (auth) => {
  if (!auth?.accessToken || !auth?.twitchUserId) {
    throw new Error('Twitch Auth nicht vollständig.');
  }

  const headers = {
    'Client-Id': TWITCH_CLIENT_ID,
    Authorization: `Bearer ${auth.accessToken}`
  };

  const followersRes = await fetch(`https://api.twitch.tv/helix/channels/followers?broadcaster_id=${encodeURIComponent(auth.twitchUserId)}&first=100`, { headers });
  const followersData = await followersRes.json();
  if (!followersRes.ok) {
    throw new Error(followersData.message || 'Follower konnten nicht geladen werden.');
  }

  let subs = null;
  let subsError = null;
  try {
    const subsRes = await fetch(`https://api.twitch.tv/helix/subscriptions?broadcaster_id=${encodeURIComponent(auth.twitchUserId)}&first=1`, { headers });
    const subsData = await subsRes.json();
    if (subsRes.ok) {
      subs = subsData.total ?? 0;
    } else {
      subsError = subsData.message || 'Subs nicht verfügbar.';
    }
  } catch (err) {
    subsError = err.message;
  }

  const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
  const newFollowers24h = Array.isArray(followersData.data)
    ? followersData.data.filter((f) => new Date(f.followed_at).getTime() >= dayAgo).length
    : 0;

  return {
    followers: followersData.total ?? 0,
    subs,
    subsError,
    newFollowers24h,
    lastSync: new Date().toISOString()
  };
};

const fetchKickMetrics = async (channel) => {
  if (!channel) throw new Error('Kick Channel fehlt.');
  const response = await fetch(`https://kick.com/api/v2/channels/${encodeURIComponent(channel)}`);
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.message || 'Kick Daten konnten nicht geladen werden.');
  }

  return {
    followers: parseKickFollowers(payload),
    subs: parseKickSubs(payload),
    newFollowers24h: null,
    lastSync: new Date().toISOString()
  };
};

const collectToolChannels = (toolsConfig) => {
  const toolIds = ['bonushunt', 'wagerbar', 'slottracker', 'tournament'];
  const twitch = new Set();
  const kick = new Set();

  toolIds.forEach((toolId) => {
    const config = toolsConfig[toolId] || {};
    if (config.twitch) twitch.add(String(config.twitch).replace(/^#/, '').trim().toLowerCase());
    if (config.kick) kick.add(String(config.kick).trim().toLowerCase());
  });

  return {
    twitch: [...twitch].filter(Boolean),
    kick: [...kick].filter(Boolean)
  };
};

const sendTwitchChatMessage = ({ botUsername, oauthToken, channel, message }) => {
  return new Promise((resolve, reject) => {
    if (!botUsername || !oauthToken || !channel || !message) {
      return reject(new Error('Twitch-Konfiguration unvollständig.'));
    }

    const token = oauthToken.startsWith('oauth:') ? oauthToken : `oauth:${oauthToken}`;
    const nick = String(botUsername).trim().toLowerCase();
    const chan = String(channel).replace(/^#/, '').trim().toLowerCase();
    const msg = String(message).replace(/\r?\n/g, ' ').trim();
    if (!msg) return reject(new Error('Leere Nachricht.'));

    const socket = tls.connect(6697, 'irc.chat.twitch.tv', {}, () => {
      socket.write(`PASS ${token}\r\n`);
      socket.write(`NICK ${nick}\r\n`);
      socket.write(`JOIN #${chan}\r\n`);

      setTimeout(() => {
        socket.write(`PRIVMSG #${chan} :${msg}\r\n`);
        setTimeout(() => {
          socket.write('QUIT\r\n');
          socket.end();
          resolve({ platform: 'twitch', channel: chan, ok: true });
        }, 250);
      }, 350);
    });

    socket.setTimeout(4500, () => {
      socket.destroy();
      reject(new Error(`Timeout beim Senden an Twitch #${chan}.`));
    });

    socket.on('error', (err) => {
      reject(new Error(`Twitch Fehler #${chan}: ${err.message}`));
    });
  });
};

const sendKickBridgeMessage = async ({ webhookUrl, webhookSecret, channel, message }) => {
  if (!webhookUrl) throw new Error('Kick-Bridge URL fehlt.');
  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(webhookSecret ? { 'x-kick-secret': webhookSecret } : {})
    },
    body: JSON.stringify({ channel, message })
  });
  if (!response.ok) {
    throw new Error(`Kick-Bridge Fehler (${response.status}).`);
  }
  return { platform: 'kick', channel, ok: true };
};

const broadcastToolsMessage = async (userId, message) => {
  const toolsConfig = readUserToolsConfig(userId);
  const channels = collectToolChannels(toolsConfig);
  const chatAuth = toolsConfig.chatAuth || {};
  const kickBridge = toolsConfig.kickBridge || {};
  const tasks = [];
  const errors = [];

  channels.twitch.forEach((channel) => {
    tasks.push(
      sendTwitchChatMessage({
        botUsername: chatAuth.twitchBotUsername,
        oauthToken: chatAuth.twitchOauthToken,
        channel,
        message
      }).catch((err) => {
        errors.push(err.message);
      })
    );
  });

  channels.kick.forEach((channel) => {
    tasks.push(
      sendKickBridgeMessage({
        webhookUrl: kickBridge.webhookUrl,
        webhookSecret: kickBridge.webhookSecret,
        channel,
        message
      }).catch((err) => {
        errors.push(err.message);
      })
    );
  });

  await Promise.all(tasks);
  return {
    attempted: channels.twitch.length + channels.kick.length,
    twitchChannels: channels.twitch,
    kickChannels: channels.kick,
    errors
  };
};

const appendChatReaderLog = (userId, entry) => {
  const session = chatReaderSessions.get(String(userId));
  if (!session) return;
  session.logs.push({ at: new Date().toISOString(), ...entry });
  if (session.logs.length > 300) {
    session.logs.splice(0, session.logs.length - 300);
  }
};

const stopTwitchChatReader = (userId) => {
  const key = String(userId);
  const session = chatReaderSessions.get(key);
  if (!session) return { success: true, running: false };

  session.running = false;
  try {
    session.socket?.write('QUIT\r\n');
  } catch (err) {}
  try {
    session.socket?.destroy();
  } catch (err) {}

  chatReaderSessions.delete(key);
  return { success: true, running: false };
};

const startTwitchChatReader = (userId) => {
  const key = String(userId);
  const toolsConfig = readUserToolsConfig(key);
  const channels = collectToolChannels(toolsConfig).twitch;
  const chatAuth = toolsConfig.chatAuth || {};
  const botUsername = (chatAuth.twitchBotUsername || '').trim().toLowerCase();
  const oauthToken = (chatAuth.twitchOauthToken || '').trim();

  if (!botUsername || !oauthToken) {
    throw new Error('Twitch Bot Username und OAuth Token fehlen.');
  }
  if (channels.length === 0) {
    throw new Error('Keine Twitch Channels in den Tools konfiguriert.');
  }

  if (chatReaderSessions.has(key)) {
    stopTwitchChatReader(key);
  }

  const token = oauthToken.startsWith('oauth:') ? oauthToken : `oauth:${oauthToken}`;
  const session = {
    userId: key,
    running: true,
    startedAt: new Date().toISOString(),
    channels,
    logs: [],
    lastError: null,
    socket: null
  };
  chatReaderSessions.set(key, session);

  const socket = tls.connect(6697, 'irc.chat.twitch.tv', {}, () => {
    socket.write(`PASS ${token}\r\n`);
    socket.write(`NICK ${botUsername}\r\n`);
    channels.forEach((channel) => socket.write(`JOIN #${channel}\r\n`));
    appendChatReaderLog(key, { type: 'system', channel: 'all', message: `Reader gestartet. Joined: ${channels.join(', ')}` });
  });
  session.socket = socket;

  let buffer = '';
  socket.on('data', (chunk) => {
    buffer += chunk.toString('utf8');
    const lines = buffer.split('\r\n');
    buffer = lines.pop() || '';

    lines.forEach((line) => {
      if (!line) return;
      if (line.startsWith('PING')) {
        socket.write(line.replace('PING', 'PONG') + '\r\n');
        return;
      }
      const match = line.match(/^:([^!]+)![^ ]+ PRIVMSG #([^ ]+) :(.+)$/);
      if (match) {
        const [, username, channel, message] = match;
        appendChatReaderLog(key, { type: 'message', platform: 'twitch', channel, username, message });
      }
    });
  });

  socket.on('error', (err) => {
    session.lastError = err.message;
    appendChatReaderLog(key, { type: 'error', channel: 'all', message: `Reader Fehler: ${err.message}` });
  });

  socket.on('close', () => {
    if (session.running) {
      session.running = false;
      appendChatReaderLog(key, { type: 'system', channel: 'all', message: 'Reader Verbindung geschlossen.' });
    }
  });

  socket.setTimeout(0);
  return { success: true, running: true, channels, startedAt: session.startedAt };
};

// API Routes

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (email === SUPERADMIN_EMAIL && password === SUPERADMIN_PASSWORD) {
    return res.json({
      success: true,
      user: {
        id: 'superadmin',
        email: SUPERADMIN_EMAIL,
        username: 'SuperAdmin',
        isSetupComplete: 1,
        isSuperadmin: true
      }
    });
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  
  if (user && user.password === password) {
    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        templateId: user.templateId,
        siteSlug: user.siteSlug,
        category: user.category,
        customDomain: user.customDomain,
        avatarUrl: user.avatarUrl,
        toolsConfig: user.toolsConfig,
        isSetupComplete: user.isSetupComplete,
        isSuperadmin: false
      }
    });
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
    res.json({
      success: true,
      user: {
        id: info.lastInsertRowid,
        email,
        username: '',
        siteSlug: '',
        category: '',
        customDomain: '',
        isSetupComplete: 0
      }
    });
  } catch (err) {
    res.status(400).json({ success: false, error: 'Email bereits registriert.' });
  }
});

app.get('/api/social/twitch/start', (req, res) => {
  const userId = String(req.query.userId || '').trim();
  if (!userId) return res.status(400).send('userId fehlt.');
  if (!TWITCH_CLIENT_ID || !TWITCH_CLIENT_SECRET) return res.status(500).send('Twitch OAuth ist nicht konfiguriert.');

  const state = randomBytes(24).toString('hex');
  pendingTwitchAuthStates.set(state, { userId, expiresAt: Date.now() + (10 * 60 * 1000) });
  const redirectUri = resolveTwitchRedirectUri(req);

  const params = new URLSearchParams();
  params.set('client_id', TWITCH_CLIENT_ID);
  params.set('redirect_uri', redirectUri);
  params.set('response_type', 'code');
  params.set('scope', twitchScopes.join(' '));
  params.set('state', state);

  res.redirect(`https://id.twitch.tv/oauth2/authorize?${params.toString()}`);
});

app.get('/api/social/twitch/callback', async (req, res) => {
  const { code, state, error, error_description } = req.query;
  const frontend = resolveFrontendBase(req);

  if (error) {
    return res.redirect(`${frontend}/dashboard?social_error=${encodeURIComponent(String(error_description || error))}`);
  }

  const stateData = pendingTwitchAuthStates.get(String(state || ''));
  pendingTwitchAuthStates.delete(String(state || ''));
  if (!stateData || stateData.expiresAt < Date.now()) {
    return res.redirect(`${frontend}/dashboard?social_error=invalid_state`);
  }

  try {
    const tokenParams = new URLSearchParams();
    tokenParams.set('client_id', TWITCH_CLIENT_ID);
    tokenParams.set('client_secret', TWITCH_CLIENT_SECRET);
    tokenParams.set('code', String(code || ''));
    tokenParams.set('grant_type', 'authorization_code');
    tokenParams.set('redirect_uri', resolveTwitchRedirectUri(req));

    const tokenResponse = await fetch('https://id.twitch.tv/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: tokenParams.toString()
    });
    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok) throw new Error(tokenData.message || 'Twitch Token Request fehlgeschlagen.');

    const userResponse = await fetch('https://api.twitch.tv/helix/users', {
      headers: {
        'Client-Id': TWITCH_CLIENT_ID,
        Authorization: `Bearer ${tokenData.access_token}`
      }
    });
    const userData = await userResponse.json();
    if (!userResponse.ok || !userData?.data?.[0]) throw new Error(userData.message || 'Twitch Userdaten konnten nicht geladen werden.');
    const twitchUser = userData.data[0];

    const toolsConfig = readUserToolsConfig(stateData.userId);
    toolsConfig.socialAuth = toolsConfig.socialAuth || {};
    toolsConfig.socialAuth.twitch = {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresAt: Date.now() + ((tokenData.expires_in || 0) * 1000),
      twitchUserId: twitchUser.id,
      login: twitchUser.login,
      displayName: twitchUser.display_name,
      profileImageUrl: twitchUser.profile_image_url
    };
    writeUserToolsConfig(stateData.userId, toolsConfig);

    res.redirect(`${frontend}/dashboard?social=twitch_connected`);
  } catch (err) {
    res.redirect(`${frontend}/dashboard?social_error=${encodeURIComponent(err.message)}`);
  }
});

app.post('/api/superadmin/login', (req, res) => {
  const { email, password, twoFactorCode } = req.body;
  if (email !== SUPERADMIN_EMAIL || password !== SUPERADMIN_PASSWORD) {
    return res.status(401).json({ success: false, error: 'Ungültige Superadmin-Zugangsdaten.' });
  }
  if (SUPERADMIN_2FA_CODE && twoFactorCode !== SUPERADMIN_2FA_CODE) {
    return res.status(401).json({ success: false, error: '2FA Code ungültig.' });
  }

  const token = randomBytes(32).toString('hex');
  const ip = req.headers['x-forwarded-for']?.toString().split(',')[0].trim() || req.ip;
  const session = {
    token,
    email: SUPERADMIN_EMAIL,
    createdAt: new Date().toISOString(),
    lastSeenAt: new Date().toISOString(),
    ip,
    userAgent: req.headers['user-agent'] || ''
  };
  superadminSessions.set(token, session);
  logAudit('superadmin', 'superadmin_login', null, { ip });
  res.json({ success: true, token, user: { email: SUPERADMIN_EMAIL, session } });
});

const requireSuperadmin = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  if (!token) return res.status(401).json({ success: false, error: 'Unauthorized' });

  const ip = req.headers['x-forwarded-for']?.toString().split(',')[0].trim() || req.ip;
  if (SUPERADMIN_IP_ALLOWLIST.length > 0 && !SUPERADMIN_IP_ALLOWLIST.includes(ip)) {
    return res.status(403).json({ success: false, error: 'IP nicht freigegeben.' });
  }

  const session = superadminSessions.get(token);
  if (!session && token !== SUPERADMIN_SESSION_TOKEN) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
  if (session) {
    session.lastSeenAt = new Date().toISOString();
  }
  req.superadmin = session || { email: SUPERADMIN_EMAIL, token: 'legacy' };
  next();
};

const computeUserHealth = (user, details) => {
  const flags = [];
  if (!user?.siteSlug) flags.push('missing_slug');
  if (!user?.isSetupComplete) flags.push('setup_incomplete');
  if ((details.deals || []).length === 0) flags.push('no_deals');
  if ((details.pages || []).length === 0) flags.push('no_pages');

  let toolsConfig = {};
  try { toolsConfig = user?.toolsConfig ? JSON.parse(user.toolsConfig) : {}; } catch (err) {}
  if (!toolsConfig?.socialAuth?.twitch) flags.push('twitch_not_connected');
  if (!toolsConfig?.socialAuth?.kick) flags.push('kick_not_connected');
  if (!chatReaderSessions.get(String(user?.id))?.running) flags.push('bot_reader_offline');

  const score = Math.max(0, 100 - (flags.length * 15));
  return { score, flags };
};

app.get('/api/superadmin/users', requireSuperadmin, (req, res) => {
  try {
    const users = db.prepare(`
      SELECT id, email, username, siteSlug, category, templateId, isSetupComplete, avatarUrl, toolsConfig
      FROM users
      ORDER BY id DESC
    `).all();

    const hydrated = users.map((user) => {
      const deals = db.prepare('SELECT id FROM deals WHERE userId = ?').all(user.id);
      const pages = db.prepare('SELECT id FROM streamer_pages WHERE userId = ?').all(user.id);
      return {
        ...user,
        health: computeUserHealth(user, { deals, pages })
      };
    });
    res.json({ success: true, users: hydrated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/superadmin/user/:id', requireSuperadmin, (req, res) => {
  try {
    const userId = req.params.id;
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    const blocks = db.prepare('SELECT * FROM site_blocks WHERE userId = ? ORDER BY orderIndex ASC').all(userId);
    const deals = db.prepare('SELECT * FROM deals WHERE userId = ? ORDER BY id DESC').all(userId);
    const settings = db.prepare('SELECT * FROM streamer_site_settings WHERE userId = ?').get(userId);
    const pages = db.prepare('SELECT * FROM streamer_pages WHERE userId = ? ORDER BY sortOrder ASC').all(userId);
    const pageBlocks = db.prepare('SELECT * FROM page_blocks WHERE userId = ? ORDER BY sortOrder ASC').all(userId);
    const payouts = db.prepare('SELECT * FROM payouts WHERE userId = ? ORDER BY id DESC').all(userId);
    const tickets = db.prepare('SELECT * FROM support_tickets WHERE userId = ? ORDER BY id DESC').all(userId);

    res.json({
      success: true,
      data: {
        user,
        blocks,
        deals,
        settings: settings || { navTitle: user.username || '' },
        pages,
        pageBlocks,
        payouts,
        tickets,
        health: computeUserHealth(user, { deals, pages })
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/superadmin/user/:id', requireSuperadmin, (req, res) => {
  try {
    const userId = Number(req.params.id);
    if (!Number.isFinite(userId)) {
      return res.status(400).json({ success: false, error: 'Ungültige User-ID.' });
    }

    const user = db.prepare('SELECT id, email, username, siteSlug FROM users WHERE id = ?').get(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const protectedEmails = new Set([SUPERADMIN_EMAIL, 'admin@weblone.de']);
    if (protectedEmails.has(String(user.email || '').toLowerCase())) {
      return res.status(403).json({ success: false, error: 'Dieser Account kann nicht gelöscht werden.' });
    }

    // Stop and cleanup runtime jobs/sessions before deleting persisted data
    stopTwitchChatReader(userId);
    const userKey = String(userId);
    if (adTimerJobs.has(userKey)) {
      clearInterval(adTimerJobs.get(userKey).intervalId);
      adTimerJobs.delete(userKey);
    }
    if (pickupReminderJobs.has(userKey)) {
      clearTimeout(pickupReminderJobs.get(userKey));
      pickupReminderJobs.delete(userKey);
    }
    for (const [state, data] of pendingTwitchAuthStates.entries()) {
      if (String(data?.userId) === userKey) pendingTwitchAuthStates.delete(state);
    }

    const tx = db.transaction(() => {
      db.prepare('DELETE FROM cta_events WHERE userId = ?').run(userId);
      db.prepare('DELETE FROM payouts WHERE userId = ?').run(userId);
      db.prepare('DELETE FROM support_tickets WHERE userId = ?').run(userId);
      db.prepare('DELETE FROM page_blocks WHERE userId = ?').run(userId);
      db.prepare('DELETE FROM streamer_pages WHERE userId = ?').run(userId);
      db.prepare('DELETE FROM streamer_site_settings WHERE userId = ?').run(userId);
      db.prepare('DELETE FROM site_blocks WHERE userId = ?').run(userId);
      db.prepare('DELETE FROM deals WHERE userId = ?').run(userId);
      db.prepare('DELETE FROM audit_logs WHERE targetUserId = ?').run(userId);
      db.prepare('DELETE FROM users WHERE id = ?').run(userId);
    });
    tx();

    logAudit(req.superadmin.email, 'user_delete_full', userId, {
      email: user.email,
      username: user.username,
      siteSlug: user.siteSlug
    });
    res.json({ success: true, deletedUserId: userId });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/superadmin/user/:id/deal', requireSuperadmin, (req, res) => {
  const { name, deal, performance, status, imageUrl, promoCode, bonusTerms, ctaUrl } = req.body;
  if (!name || !deal) {
    return res.status(400).json({ success: false, error: 'name und deal sind erforderlich.' });
  }
  try {
    const info = db.prepare('INSERT INTO deals (userId, name, deal, performance, status, imageUrl, promoCode, bonusTerms, ctaUrl) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .run(
        req.params.id,
        name,
        deal,
        performance || '0 clicks',
        status || 'Aktiv',
        imageUrl || '',
        promoCode || 'DIEGAWINOS',
        bonusTerms || '100% Sticky - 300EUR Max Bonus - 40x Wager',
        ctaUrl || ''
      );
    logAudit(req.superadmin.email, 'deal_create', req.params.id, { dealId: info.lastInsertRowid, name });
    res.json({ success: true, dealId: info.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/superadmin/user/:id/deal/:dealId', requireSuperadmin, (req, res) => {
  const { name, deal, performance, status, imageUrl, promoCode, bonusTerms, ctaUrl } = req.body;
  try {
    db.prepare('UPDATE deals SET name = ?, deal = ?, performance = ?, status = ?, imageUrl = ?, promoCode = ?, bonusTerms = ?, ctaUrl = ? WHERE id = ? AND userId = ?')
      .run(
        name,
        deal,
        performance,
        status,
        imageUrl || '',
        promoCode || 'DIEGAWINOS',
        bonusTerms || '100% Sticky - 300EUR Max Bonus - 40x Wager',
        ctaUrl || '',
        req.params.dealId,
        req.params.id
      );
    logAudit(req.superadmin.email, 'deal_update', req.params.id, { dealId: req.params.dealId, status });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/superadmin/user/:id/deal/:dealId', requireSuperadmin, (req, res) => {
  try {
    db.prepare('DELETE FROM deals WHERE id = ? AND userId = ?').run(req.params.dealId, req.params.id);
    logAudit(req.superadmin.email, 'deal_delete', req.params.id, { dealId: req.params.dealId });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/superadmin/deal-template/apply', requireSuperadmin, (req, res) => {
  const { userIds, template } = req.body;
  if (!Array.isArray(userIds) || userIds.length === 0) {
    return res.status(400).json({ success: false, error: 'userIds fehlt.' });
  }

  const templates = {
    starter: [
      { name: 'Starter Deal', deal: '100% Bonus bis 100€', performance: '0 clicks', status: 'Aktiv', imageUrl: '', promoCode: 'DIEGAWINOS', bonusTerms: '100% Sticky - 300EUR Max Bonus - 40x Wager' }
    ],
    pro: [
      { name: 'VIP Cashback', deal: '15% Weekly Cashback', performance: '0 clicks', status: 'Aktiv', imageUrl: '', promoCode: 'DIEGAWINOS', bonusTerms: '100% Sticky - 300EUR Max Bonus - 40x Wager' },
      { name: 'Reload Bonus', deal: '50% bis 500€', performance: '0 clicks', status: 'Aktiv', imageUrl: '', promoCode: 'DIEGAWINOS', bonusTerms: '100% Sticky - 300EUR Max Bonus - 40x Wager' }
    ]
  };
  const selected = templates[template] || templates.starter;

  const insert = db.prepare('INSERT INTO deals (userId, name, deal, performance, status, imageUrl, promoCode, bonusTerms, ctaUrl) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
  const tx = db.transaction(() => {
    userIds.forEach((userId) => {
      selected.forEach((d) => insert.run(
        userId,
        d.name,
        d.deal,
        d.performance,
        d.status,
        d.imageUrl || '',
        d.promoCode || 'DIEGAWINOS',
        d.bonusTerms || '100% Sticky - 300EUR Max Bonus - 40x Wager',
        d.ctaUrl || ''
      ));
      logAudit(req.superadmin.email, 'deal_template_apply', userId, { template });
    });
  });
  tx();
  res.json({ success: true, appliedTo: userIds.length, template });
});

app.post('/api/superadmin/bulk/deals/status', requireSuperadmin, (req, res) => {
  const { userIds, status } = req.body;
  if (!Array.isArray(userIds) || userIds.length === 0 || !status) {
    return res.status(400).json({ success: false, error: 'userIds und status erforderlich.' });
  }
  const update = db.prepare('UPDATE deals SET status = ? WHERE userId = ?');
  const tx = db.transaction(() => {
    userIds.forEach((userId) => {
      update.run(status, userId);
      logAudit(req.superadmin.email, 'bulk_deals_status', userId, { status });
    });
  });
  tx();
  res.json({ success: true, updatedUsers: userIds.length, status });
});

app.get('/api/superadmin/audit', requireSuperadmin, (req, res) => {
  const limit = Math.max(1, Math.min(Number(req.query.limit || 100), 500));
  const logs = db.prepare('SELECT * FROM audit_logs ORDER BY id DESC LIMIT ?').all(limit);
  res.json({ success: true, logs });
});

app.get('/api/superadmin/analytics', requireSuperadmin, (req, res) => {
  const totalUsers = db.prepare('SELECT COUNT(*) as c FROM users').get().c;
  const setupDone = db.prepare('SELECT COUNT(*) as c FROM users WHERE isSetupComplete = 1').get().c;
  const activeDeals = db.prepare("SELECT COUNT(*) as c FROM deals WHERE status = 'Aktiv'").get().c;
  const pendingPayouts = db.prepare("SELECT COUNT(*) as c FROM payouts WHERE status = 'pending'").get().c;
  const openTickets = db.prepare("SELECT COUNT(*) as c FROM support_tickets WHERE status IN ('open','in_progress')").get().c;
  const botOnline = [...chatReaderSessions.values()].filter((s) => s.running).length;
  res.json({
    success: true,
    analytics: {
      totalUsers,
      setupDone,
      activeDeals,
      pendingPayouts,
      openTickets,
      botOnline,
      setupRate: totalUsers ? Math.round((setupDone / totalUsers) * 100) : 0
    }
  });
});

app.get('/api/superadmin/bot-monitor', requireSuperadmin, (req, res) => {
  const users = db.prepare('SELECT id, username, siteSlug FROM users ORDER BY id DESC').all();
  const monitor = users.map((u) => {
    const reader = chatReaderSessions.get(String(u.id));
    const adTimer = adTimerJobs.get(String(u.id));
    return {
      userId: u.id,
      username: u.username,
      siteSlug: u.siteSlug,
      readerRunning: !!reader?.running,
      readerChannels: reader?.channels || [],
      lastReaderError: reader?.lastError || null,
      adTimerRunning: !!adTimer,
      adTimerIntervalMinutes: adTimer?.intervalMinutes || null
    };
  });
  res.json({ success: true, monitor });
});

app.get('/api/superadmin/support-tickets', requireSuperadmin, (req, res) => {
  const tickets = db.prepare('SELECT * FROM support_tickets ORDER BY id DESC').all();
  res.json({ success: true, tickets });
});

app.post('/api/superadmin/support-tickets', requireSuperadmin, (req, res) => {
  const { userId, subject, message, priority, assignee } = req.body;
  const now = new Date().toISOString();
  const info = db.prepare(`
    INSERT INTO support_tickets (userId, subject, status, priority, message, assignee, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(userId || null, subject || 'Support Ticket', 'open', priority || 'normal', message || '', assignee || null, now, now);
  logAudit(req.superadmin.email, 'support_ticket_create', userId || null, { ticketId: info.lastInsertRowid });
  res.json({ success: true, ticketId: info.lastInsertRowid });
});

app.put('/api/superadmin/support-tickets/:id', requireSuperadmin, (req, res) => {
  const { status, priority, assignee, message } = req.body;
  db.prepare(`
    UPDATE support_tickets
    SET status = COALESCE(?, status),
        priority = COALESCE(?, priority),
        assignee = COALESCE(?, assignee),
        message = COALESCE(?, message),
        updatedAt = ?
    WHERE id = ?
  `).run(status || null, priority || null, assignee || null, message || null, new Date().toISOString(), req.params.id);
  logAudit(req.superadmin.email, 'support_ticket_update', null, { ticketId: req.params.id, status, priority });
  res.json({ success: true });
});

app.get('/api/superadmin/payouts', requireSuperadmin, (req, res) => {
  const payouts = db.prepare('SELECT * FROM payouts ORDER BY id DESC').all();
  res.json({ success: true, payouts });
});

app.post('/api/superadmin/payouts', requireSuperadmin, (req, res) => {
  const { userId, amount, currency, note, period, dueDate } = req.body;
  const info = db.prepare(`
    INSERT INTO payouts (userId, amount, currency, status, note, period, dueDate, createdAt)
    VALUES (?, ?, ?, 'pending', ?, ?, ?, ?)
  `).run(userId || null, Number(amount || 0), currency || 'EUR', note || '', period || '', dueDate || null, new Date().toISOString());
  logAudit(req.superadmin.email, 'payout_create', userId || null, { payoutId: info.lastInsertRowid, amount });
  res.json({ success: true, payoutId: info.lastInsertRowid });
});

app.put('/api/superadmin/payouts/:id', requireSuperadmin, (req, res) => {
  const { status, paidAt, note } = req.body;
  db.prepare(`
    UPDATE payouts
    SET status = COALESCE(?, status),
        paidAt = COALESCE(?, paidAt),
        note = COALESCE(?, note)
    WHERE id = ?
  `).run(status || null, paidAt || null, note || null, req.params.id);
  logAudit(req.superadmin.email, 'payout_update', null, { payoutId: req.params.id, status });
  res.json({ success: true });
});

app.get('/api/superadmin/security/sessions', requireSuperadmin, (req, res) => {
  const sessions = [...superadminSessions.values()].map(({ token, ...rest }) => ({ tokenSuffix: token.slice(-8), ...rest }));
  res.json({ success: true, sessions });
});

app.post('/api/superadmin/security/sessions/revoke', requireSuperadmin, (req, res) => {
  const { tokenSuffix } = req.body;
  for (const token of superadminSessions.keys()) {
    if (token.endsWith(String(tokenSuffix || ''))) {
      superadminSessions.delete(token);
    }
  }
  logAudit(req.superadmin.email, 'security_revoke_session', null, { tokenSuffix });
  res.json({ success: true });
});

app.post('/api/superadmin/security/sessions/revoke-all', requireSuperadmin, (req, res) => {
  const keep = req.headers.authorization?.replace(/^Bearer\s+/i, '') || '';
  for (const token of superadminSessions.keys()) {
    if (token !== keep) superadminSessions.delete(token);
  }
  logAudit(req.superadmin.email, 'security_revoke_all', null, {});
  res.json({ success: true });
});

app.get('/api/user/:id', (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (user) {
    res.json({ success: true, user });
  } else {
    res.status(404).json({ success: false, error: 'User not found' });
  }
});

app.get('/api/user/:id/support-tickets', (req, res) => {
  try {
    const user = db.prepare('SELECT id FROM users WHERE id = ?').get(req.params.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    const tickets = db.prepare('SELECT * FROM support_tickets WHERE userId = ? ORDER BY id DESC LIMIT 50').all(req.params.id);
    res.json({ success: true, tickets });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/user/:id/support-ticket', (req, res) => {
  try {
    const user = db.prepare('SELECT id, username, email FROM users WHERE id = ?').get(req.params.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    const { subject, message, priority } = req.body;
    if (!subject || !message) {
      return res.status(400).json({ success: false, error: 'subject und message sind erforderlich.' });
    }

    const now = new Date().toISOString();
    const info = db.prepare(`
      INSERT INTO support_tickets (userId, subject, status, priority, message, assignee, createdAt, updatedAt)
      VALUES (?, ?, 'open', ?, ?, NULL, ?, ?)
    `).run(user.id, subject, priority || 'normal', message, now, now);

    logAudit(`user:${user.id}`, 'support_ticket_create_by_streamer', user.id, { ticketId: info.lastInsertRowid, subject });
    res.json({ success: true, ticketId: info.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/check-slug/:slug', (req, res) => {
  const existing = db.prepare('SELECT id FROM users WHERE siteSlug = ?').get(req.params.slug);
  res.json({ available: !existing });
});

app.post('/api/user/:id/setup', (req, res) => {
  const { templateId, username, siteSlug, category, backgroundTheme } = req.body;
  const userId = req.params.id;
  const parsedTemplateId = Number(templateId) || 1;
  const templateThemeMap = { 1: 'casino_midnightblue', 2: 'template2_draft', 3: 'template3_draft' };
  const allowedThemes = new Set(['casino_midnightblue', 'template2_draft', 'template3_draft', 'dark']);
  const normalizedBackgroundTheme = allowedThemes.has(String(backgroundTheme || '').toLowerCase())
    ? String(backgroundTheme).toLowerCase()
    : (templateThemeMap[parsedTemplateId] || 'dark');
  const landingPresetsByTemplate = {
    1: {
      home: [
        { blockType: 'Hero', dataJson: { title: 'Casino Midnightblue', subtitle: 'Exklusive Casino-Deals, Hunt-Updates und Giveaways an einem Ort.' } },
        { blockType: 'Text', dataJson: { content: 'About: Willkommen auf meiner Seite. Hier findest du handverlesene Partner, transparente Bonusinfos und alle relevanten Updates zum Stream.' } },
        { blockType: 'Text', dataJson: { content: 'Contact: Für Kooperationen oder Rückfragen erreichst du mich direkt über meine offiziellen Kanäle.' } },
        { blockType: 'Button', dataJson: { label: 'Jetzt zum Hauptangebot', url: 'https://example.com/deal-main' } }
      ],
      shop: [
        { blockType: 'Hero', dataJson: { title: 'Top Bonus Auswahl', subtitle: 'Fuer schnelle Conversions auf einen Blick.' } },
        { blockType: 'LinkList', dataJson: { links: [{ label: 'Casino Deal 1', url: 'https://example.com/deal-1' }, { label: 'Casino Deal 2', url: 'https://example.com/deal-2' }, { label: 'VIP Deal', url: 'https://example.com/deal-vip' }] } }
      ],
      hunt: [
        { blockType: 'Hero', dataJson: { title: 'Bonus Hunt Center', subtitle: 'Alle Infos für den naechsten Hunt-Stream.' } },
        { blockType: 'Text', dataJson: { content: 'Poste hier Regeln, Streamzeiten und Teilnahmehinweise für die Community.' } },
        { blockType: 'Button', dataJson: { label: 'Hunt Teilnahme Link', url: 'https://example.com/hunt' } }
      ],
      giveaway: [
        { blockType: 'Hero', dataJson: { title: 'Giveaway Zone', subtitle: 'Aktionen und Teilnahme in wenigen Klicks.' } },
        { blockType: 'Text', dataJson: { content: 'Beschreibe Gewinn, Laufzeit und Bedingungen. Der Link unten fuehrt direkt zur Teilnahme.' } },
        { blockType: 'Button', dataJson: { label: 'Giveaway Link', url: 'https://example.com/giveaway' } }
      ]
    },
    2: {
      home: [
        { blockType: 'Hero', dataJson: { title: 'Willkommen auf meiner Landingpage', subtitle: 'Exklusive Deals, klar strukturiert und direkt klickbar.' } },
        { blockType: 'Text', dataJson: { content: 'Dieses Template ist auf maximale Uebersicht optimiert. Ersetze nur die Platzhalter-Links mit deinen Partner-Links.' } },
        { blockType: 'Button', dataJson: { label: 'Jetzt zum Hauptangebot', url: 'https://example.com/main-offer' } },
        { blockType: 'LinkList', dataJson: { links: [{ label: 'Discord Community', url: 'https://discord.com/' }, { label: 'Telegram News', url: 'https://t.me/' }] } }
      ],
      shop: [
        { blockType: 'Hero', dataJson: { title: 'Deal Shop', subtitle: 'Die besten Angebote für neue und bestehende Spieler.' } },
        { blockType: 'LinkList', dataJson: { links: [{ label: 'Willkommensbonus', url: 'https://example.com/welcome' }, { label: 'Reload Bonus', url: 'https://example.com/reload' }, { label: 'Highroller Deal', url: 'https://example.com/highroller' }] } }
      ],
      hunt: [
        { blockType: 'Hero', dataJson: { title: 'Hunt Plan', subtitle: 'Zeiten, Punkte und Teilnahmelinks.' } },
        { blockType: 'Text', dataJson: { content: 'Erklaere hier kurz, wann Punkte gesammelt werden und wann Belohnungen abgeholt werden koennen.' } },
        { blockType: 'Button', dataJson: { label: 'Zum Hunt-Portal', url: 'https://example.com/hunt-portal' } }
      ],
      giveaway: [
        { blockType: 'Hero', dataJson: { title: 'Community Giveaway', subtitle: 'Belohnungen für aktive Zuschauer.' } },
        { blockType: 'Text', dataJson: { content: 'Definiere Teilnahmebedingungen transparent, damit Zuschauer schnell verstehen, wie sie mitmachen.' } },
        { blockType: 'Button', dataJson: { label: 'Jetzt teilnehmen', url: 'https://example.com/giveaway-entry' } }
      ]
    },
    3: {
      home: [
        { blockType: 'Hero', dataJson: { title: 'Casino Master Hub', subtitle: 'Premium Deals und starke CTAs für maximale Einzahlungen.' } },
        { blockType: 'Text', dataJson: { content: 'Dieses Preset ist conversion-orientiert. Trage deine Partner-Links ein und starte direkt mit einer professionellen Struktur.' } },
        { blockType: 'Button', dataJson: { label: 'VIP Bonus aktivieren', url: 'https://example.com/vip-bonus' } },
        { blockType: 'LinkList', dataJson: { links: [{ label: 'Live Stream', url: 'https://twitch.tv/' }, { label: 'Kick Stream', url: 'https://kick.com/' }, { label: 'Kontakt', url: 'mailto:kontakt@weblone.de' }] } }
      ],
      shop: [
        { blockType: 'Hero', dataJson: { title: 'Casino Deals', subtitle: 'Schneller Zugriff auf die besten Partnerangebote.' } },
        { blockType: 'LinkList', dataJson: { links: [{ label: 'Top Casino #1', url: 'https://example.com/casino-1' }, { label: 'Top Casino #2', url: 'https://example.com/casino-2' }, { label: 'Exklusiv Deal', url: 'https://example.com/exclusive' }] } }
      ],
      hunt: [
        { blockType: 'Hero', dataJson: { title: 'Bonus Hunt Mission', subtitle: 'Alles für deinen naechsten Live-Hunt.' } },
        { blockType: 'Text', dataJson: { content: 'Nutze diese Seite für Ablaufplan, Regeln und special Aktionen waehrend des Streams.' } },
        { blockType: 'Button', dataJson: { label: 'Hunt Event starten', url: 'https://example.com/hunt-start' } }
      ],
      giveaway: [
        { blockType: 'Hero', dataJson: { title: 'Giveaway & Rewards', subtitle: 'Belohne deine treusten Zuschauer.' } },
        { blockType: 'Text', dataJson: { content: 'Erklaere die Teilnahme in 2-3 Saetzen und leite ueber den Button direkt zur Aktionsseite weiter.' } },
        { blockType: 'Button', dataJson: { label: 'Rewards Seite', url: 'https://example.com/rewards' } }
      ]
    }
  };
  const selectedPreset = landingPresetsByTemplate[parsedTemplateId] || landingPresetsByTemplate[1];
  
  // 1. Check if slug is taken
  const existing = db.prepare('SELECT id FROM users WHERE siteSlug = ? AND id != ?').get(siteSlug, userId);
  if (existing) {
    return res.status(400).json({ success: false, error: 'Dieser Name ist bereits vergeben.' });
  }

  try {
    // Start transaction to ensure everything is created or nothing
    const transaction = db.transaction(() => {
      const existingUser = db.prepare('SELECT isSetupComplete FROM users WHERE id = ?').get(userId);
      const isFirstSetup = !existingUser || Number(existingUser.isSetupComplete || 0) === 0;

      // 2. Update user setup data
      db.prepare(`
        UPDATE users 
        SET templateId = ?, username = ?, siteSlug = ?, category = ?, isSetupComplete = 1 
        WHERE id = ?
      `).run(parsedTemplateId, username, siteSlug, category, userId);

      // Ensure settings row exists and keep template-related styling in sync
      db.prepare('INSERT OR IGNORE INTO streamer_site_settings (userId, navTitle, backgroundTheme) VALUES (?, ?, ?)')
        .run(userId, username, normalizedBackgroundTheme);
      db.prepare('UPDATE streamer_site_settings SET navTitle = ?, backgroundTheme = ? WHERE userId = ?')
        .run(username, normalizedBackgroundTheme, userId);

      // Seed defaults only on first setup to avoid overriding existing custom work
      if (!isFirstSetup) return;

      // 3. Clear existing blocks/pages to avoid duplicates
      db.prepare('DELETE FROM site_blocks WHERE userId = ?').run(userId);
      db.prepare('DELETE FROM page_blocks WHERE userId = ?').run(userId);
      db.prepare('DELETE FROM streamer_pages WHERE userId = ?').run(userId);

      // 4. Create dashboard blocks
      const defaultBlocks = [
        { name: 'Willkommen', type: 'Hero', orderIndex: 1 },
        { name: 'Meine Top Deals', type: 'Grid', orderIndex: 2 },
        { name: 'Social Media', type: 'List', orderIndex: 3 }
      ];
      const insertSiteBlock = db.prepare('INSERT INTO site_blocks (userId, name, type, status, orderIndex) VALUES (?, ?, ?, ?, ?)');
      for (const block of defaultBlocks) {
        insertSiteBlock.run(userId, block.name, block.type, 'Active', block.orderIndex);
      }

      // 5. Create a default deal only when no deal exists yet
      const existingDealCount = db.prepare('SELECT COUNT(*) as c FROM deals WHERE userId = ?').get(userId)?.c || 0;
      if (existingDealCount === 0) {
        db.prepare('INSERT INTO deals (userId, name, deal, performance, status, ctaUrl) VALUES (?, ?, ?, ?, ?, ?)')
          .run(userId, 'Weblone Partner', '100% Bonus bis 500€', 'Top Deal', 'Aktiv', '');
      }

      // 7. Create default pages
      const defaultPages = [
        { title: 'Home', slug: '', type: 'system', sortOrder: 1 },
        { title: 'Casinos', slug: 'shop', type: 'system', sortOrder: 2 },
        { title: 'Hunt', slug: 'hunt', type: 'system', sortOrder: 3 },
        { title: 'Giveaway', slug: 'giveaway', type: 'system', sortOrder: 4 }
      ];
      const insertPage = db.prepare('INSERT INTO streamer_pages (userId, title, slug, type, sortOrder) VALUES (?, ?, ?, ?, ?)');
      const pageIdBySlug = {};
      for (const page of defaultPages) {
        const info = insertPage.run(userId, page.title, page.slug, page.type, page.sortOrder);
        pageIdBySlug[page.slug] = Number(info.lastInsertRowid);
      }

      // 8. Create predefined landing page content from selected template
      const pageBlocksBySlug = {
        '': selectedPreset.home || [],
        shop: selectedPreset.shop || [],
        hunt: selectedPreset.hunt || [],
        giveaway: selectedPreset.giveaway || []
      };
      const insertPageBlock = db.prepare(`
        INSERT INTO page_blocks (userId, pageId, blockType, dataJson, visible, sortOrder)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      Object.entries(pageBlocksBySlug).forEach(([slug, blocks]) => {
        const pageId = pageIdBySlug[slug];
        if (!pageId) return;
        blocks.forEach((block, index) => {
          insertPageBlock.run(
            userId,
            pageId,
            block.blockType,
            JSON.stringify(block.dataJson || {}),
            1,
            index + 1
          );
        });
      });
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

app.post('/api/user/:id/social/kick/connect', async (req, res) => {
  const { channel } = req.body;
  const normalizedChannel = String(channel || '').trim().toLowerCase();
  if (!normalizedChannel) {
    return res.status(400).json({ success: false, error: 'Kick Channel ist erforderlich.' });
  }
  try {
    const metrics = await fetchKickMetrics(normalizedChannel);
    const toolsConfig = readUserToolsConfig(req.params.id);
    toolsConfig.socialAuth = toolsConfig.socialAuth || {};
    toolsConfig.socialAuth.kick = { channel: normalizedChannel, connectedAt: new Date().toISOString() };
    toolsConfig.socialMetrics = toolsConfig.socialMetrics || {};
    toolsConfig.socialMetrics.kick = metrics;
    writeUserToolsConfig(req.params.id, toolsConfig);
    res.json({ success: true, metrics });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.post('/api/user/:id/social/disconnect', (req, res) => {
  const { platform } = req.body;
  const toolsConfig = readUserToolsConfig(req.params.id);
  toolsConfig.socialAuth = toolsConfig.socialAuth || {};
  toolsConfig.socialMetrics = toolsConfig.socialMetrics || {};

  if (platform === 'twitch') {
    delete toolsConfig.socialAuth.twitch;
    delete toolsConfig.socialMetrics.twitch;
  } else if (platform === 'kick') {
    delete toolsConfig.socialAuth.kick;
    delete toolsConfig.socialMetrics.kick;
  } else {
    return res.status(400).json({ success: false, error: 'Ungültige Plattform.' });
  }

  writeUserToolsConfig(req.params.id, toolsConfig);
  res.json({ success: true });
});

app.post('/api/user/:id/social/refresh', async (req, res) => {
  const toolsConfig = readUserToolsConfig(req.params.id);
  toolsConfig.socialAuth = toolsConfig.socialAuth || {};
  toolsConfig.socialMetrics = toolsConfig.socialMetrics || {};
  const result = { twitch: null, kick: null, errors: [] };

  if (toolsConfig.socialAuth.twitch) {
    try {
      let twitchAuth = toolsConfig.socialAuth.twitch;
      if (!TWITCH_CLIENT_ID || !TWITCH_CLIENT_SECRET) throw new Error('Twitch OAuth nicht konfiguriert.');
      if (!twitchAuth.accessToken || !twitchAuth.refreshToken || !twitchAuth.twitchUserId) throw new Error('Twitch Account nicht vollständig verbunden.');

      if (!twitchAuth.expiresAt || twitchAuth.expiresAt <= Date.now() + 60_000) {
        const refreshed = await refreshTwitchAccessToken(twitchAuth.refreshToken);
        twitchAuth = {
          ...twitchAuth,
          accessToken: refreshed.access_token,
          refreshToken: refreshed.refresh_token || twitchAuth.refreshToken,
          expiresAt: Date.now() + ((refreshed.expires_in || 0) * 1000)
        };
        toolsConfig.socialAuth.twitch = twitchAuth;
      }

      const twitchMetrics = await fetchTwitchMetrics(twitchAuth);
      toolsConfig.socialMetrics.twitch = twitchMetrics;
      result.twitch = twitchMetrics;
    } catch (err) {
      result.errors.push(`Twitch: ${err.message}`);
    }
  }

  if (toolsConfig.socialAuth.kick?.channel) {
    try {
      const kickMetrics = await fetchKickMetrics(toolsConfig.socialAuth.kick.channel);
      toolsConfig.socialMetrics.kick = kickMetrics;
      result.kick = kickMetrics;
    } catch (err) {
      result.errors.push(`Kick: ${err.message}`);
    }
  }

  writeUserToolsConfig(req.params.id, toolsConfig);
  res.json({ success: true, result, socialAuth: toolsConfig.socialAuth, socialMetrics: toolsConfig.socialMetrics });
});

app.post('/api/user/:id/tools/chat/test', async (req, res) => {
  const { message } = req.body;
  if (!message || !String(message).trim()) {
    return res.status(400).json({ success: false, error: 'Nachricht fehlt.' });
  }
  try {
    const result = await broadcastToolsMessage(req.params.id, String(message).trim());
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/user/:id/tools/tournament/start', async (req, res) => {
  const { title, pickupAfterMinutes } = req.body;
  const userId = String(req.params.id);
  const tournamentTitle = (title || 'Turnier').toString().trim();
  const startMessage = `Turnier gestartet: ${tournamentTitle}. Viel Erfolg!`;

  try {
    const sendResult = await broadcastToolsMessage(userId, startMessage);
    const minutes = Number(pickupAfterMinutes || 0);

    if (pickupReminderJobs.has(userId)) {
      clearTimeout(pickupReminderJobs.get(userId));
      pickupReminderJobs.delete(userId);
    }

    if (minutes > 0) {
      const timeoutId = setTimeout(async () => {
        try {
          await broadcastToolsMessage(userId, `Punkte zum Abholen für "${tournamentTitle}" sind jetzt verfügbar.`);
        } catch (err) {
          console.error('Pickup reminder error:', err.message);
        } finally {
          pickupReminderJobs.delete(userId);
        }
      }, minutes * 60 * 1000);
      pickupReminderJobs.set(userId, timeoutId);
    }

    res.json({ success: true, result: sendResult, pickupReminderMinutes: minutes > 0 ? minutes : null });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/user/:id/tools/tournament/pickup', async (req, res) => {
  const { message } = req.body;
  const pickupMessage = (message || 'Punkte zum Abholen sind jetzt verfügbar.').toString().trim();
  try {
    const result = await broadcastToolsMessage(req.params.id, pickupMessage);
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/user/:id/tools/ad-timer/status', (req, res) => {
  const job = adTimerJobs.get(String(req.params.id));
  if (!job) return res.json({ success: true, running: false });
  res.json({
    success: true,
    running: true,
    intervalMinutes: job.intervalMinutes,
    message: job.message,
    startedAt: job.startedAt
  });
});

app.post('/api/user/:id/tools/ad-timer/start', async (req, res) => {
  const userId = String(req.params.id);
  const intervalMinutes = Number(req.body.intervalMinutes || 15);
  const message = (req.body.message || 'Werbung: Unterstütze den Stream über die Links auf meiner Seite.').toString().trim();

  if (!Number.isFinite(intervalMinutes) || intervalMinutes < 1 || intervalMinutes > 240) {
    return res.status(400).json({ success: false, error: 'intervalMinutes muss zwischen 1 und 240 liegen.' });
  }
  if (!message) return res.status(400).json({ success: false, error: 'Nachricht fehlt.' });

  if (adTimerJobs.has(userId)) {
    clearInterval(adTimerJobs.get(userId).intervalId);
    adTimerJobs.delete(userId);
  }

  try {
    const initialSend = await broadcastToolsMessage(userId, message);
    const intervalId = setInterval(async () => {
      try {
        await broadcastToolsMessage(userId, message);
      } catch (err) {
        console.error('Ad timer error:', err.message);
      }
    }, intervalMinutes * 60 * 1000);

    adTimerJobs.set(userId, {
      intervalId,
      intervalMinutes,
      message,
      startedAt: new Date().toISOString()
    });

    res.json({ success: true, running: true, initialSend });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/user/:id/tools/ad-timer/stop', (req, res) => {
  const userId = String(req.params.id);
  if (adTimerJobs.has(userId)) {
    clearInterval(adTimerJobs.get(userId).intervalId);
    adTimerJobs.delete(userId);
  }
  res.json({ success: true, running: false });
});

app.post('/api/user/:id/tools/chat-reader/start', (req, res) => {
  try {
    const result = startTwitchChatReader(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.post('/api/user/:id/tools/chat-reader/stop', (req, res) => {
  const result = stopTwitchChatReader(req.params.id);
  res.json(result);
});

app.get('/api/user/:id/tools/chat-reader/status', (req, res) => {
  const session = chatReaderSessions.get(String(req.params.id));
  if (!session) {
    return res.json({ success: true, running: false, channels: [], startedAt: null, lastError: null });
  }
  res.json({
    success: true,
    running: !!session.running,
    channels: session.channels,
    startedAt: session.startedAt,
    lastError: session.lastError
  });
});

app.get('/api/user/:id/tools/chat-reader/logs', (req, res) => {
  const session = chatReaderSessions.get(String(req.params.id));
  const limit = Math.max(1, Math.min(Number(req.query.limit || 100), 300));
  if (!session) return res.json({ success: true, logs: [] });
  res.json({ success: true, logs: session.logs.slice(-limit) });
});

app.post('/api/user/:id/deal', (req, res) => {
  const { name, deal, performance, status, imageUrl, promoCode, bonusTerms, ctaUrl } = req.body;
  try {
    const info = db.prepare('INSERT INTO deals (userId, name, deal, performance, status, imageUrl, promoCode, bonusTerms, ctaUrl) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .run(
        req.params.id,
        name,
        deal,
        performance || '0 clicks',
        status || 'Aktiv',
        imageUrl || '',
        promoCode || 'DIEGAWINOS',
        bonusTerms || '100% Sticky - 300EUR Max Bonus - 40x Wager',
        ctaUrl || ''
      );
    res.json({ success: true, dealId: info.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/user/:id/deal/:dealId', (req, res) => {
  const { status, name, deal, performance, imageUrl, promoCode, bonusTerms, ctaUrl } = req.body;
  try {
    db.prepare('UPDATE deals SET status = ?, name = ?, deal = ?, performance = ?, imageUrl = ?, promoCode = ?, bonusTerms = ?, ctaUrl = ? WHERE id = ? AND userId = ?')
      .run(
        status,
        name,
        deal,
        performance,
        imageUrl || '',
        promoCode || 'DIEGAWINOS',
        bonusTerms || '100% Sticky - 300EUR Max Bonus - 40x Wager',
        ctaUrl || '',
        req.params.dealId,
        req.params.id
      );
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
  const normalizedDomain = String(customDomain || '').trim().toLowerCase();
  try {
    db.prepare('UPDATE users SET customDomain = ? WHERE id = ?')
      .run(normalizedDomain, req.params.id);
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
    let toolsConfig = {};
    try {
      toolsConfig = user?.toolsConfig ? JSON.parse(user.toolsConfig) : {};
    } catch (err) {
      toolsConfig = {};
    }
    
    // Echte Statistiken (initial 0)
    const stats = {
      visitors: 0,
      visitorsChange: '0%',
      conversions: 0,
      conversionsChange: '0%'
    };

    const social = {
      twitchConnected: !!toolsConfig?.socialAuth?.twitch,
      kickConnected: !!toolsConfig?.socialAuth?.kick,
      twitch: toolsConfig?.socialMetrics?.twitch || null,
      kick: toolsConfig?.socialMetrics?.kick || null,
      twitchAccount: toolsConfig?.socialAuth?.twitch
        ? {
            login: toolsConfig.socialAuth.twitch.login,
            displayName: toolsConfig.socialAuth.twitch.displayName,
            profileImageUrl: toolsConfig.socialAuth.twitch.profileImageUrl
          }
        : null,
      kickAccount: toolsConfig?.socialAuth?.kick
        ? { channel: toolsConfig.socialAuth.kick.channel }
        : null
    };
    
    res.json({ success: true, data: { user, blocks, deals: userDeals, stats, social } });
  } catch (err) {
    console.error('Dashboard Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- SITE BUILDER API ---

app.get('/api/site/:id/settings', (req, res) => {
  const settings = db.prepare('SELECT * FROM streamer_site_settings WHERE userId = ?').get(req.params.id);
  res.json({
    success: true,
    settings: {
      navTitle: '',
      slogan: '',
      primaryCtaText: 'Jetzt Bonus sichern',
      primaryCtaUrl: '',
      stickyCtaEnabled: 1,
      stickyCtaText: 'Jetzt registrieren & Bonus aktivieren',
      stickyCtaUrl: '',
      trustBadgeText: 'Verifiziert | 18+ | Verantwortungsvoll spielen',
      urgencyText: 'Nur heute: exklusive Freispiele für neue Spieler',
      abTestEnabled: 0,
      ctaAText: 'Jetzt Bonus sichern',
      ctaAUrl: '',
      ctaBText: 'Bonus für neue Spieler holen',
      ctaBUrl: '',
      conversionBoosterEnabled: 1,
      backgroundTheme: 'dark',
      ...(settings || {})
    }
  });
});

app.put('/api/site/:id/settings', (req, res) => {
  const {
    navTitle,
    slogan,
    primaryCtaText,
    primaryCtaUrl,
    stickyCtaEnabled,
    stickyCtaText,
    stickyCtaUrl,
    trustBadgeText,
    urgencyText,
    abTestEnabled,
    ctaAText,
    ctaAUrl,
    ctaBText,
    ctaBUrl,
    conversionBoosterEnabled,
    backgroundTheme
  } = req.body || {};
  db.prepare(`
    INSERT INTO streamer_site_settings (
      userId, navTitle, slogan, primaryCtaText, primaryCtaUrl, stickyCtaEnabled, stickyCtaText, stickyCtaUrl, trustBadgeText, urgencyText, abTestEnabled, ctaAText, ctaAUrl, ctaBText, ctaBUrl, conversionBoosterEnabled, backgroundTheme
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(userId) DO UPDATE SET
      navTitle = excluded.navTitle,
      slogan = excluded.slogan,
      primaryCtaText = excluded.primaryCtaText,
      primaryCtaUrl = excluded.primaryCtaUrl,
      stickyCtaEnabled = excluded.stickyCtaEnabled,
      stickyCtaText = excluded.stickyCtaText,
      stickyCtaUrl = excluded.stickyCtaUrl,
      trustBadgeText = excluded.trustBadgeText,
      urgencyText = excluded.urgencyText,
      abTestEnabled = excluded.abTestEnabled,
      ctaAText = excluded.ctaAText,
      ctaAUrl = excluded.ctaAUrl,
      ctaBText = excluded.ctaBText,
      ctaBUrl = excluded.ctaBUrl,
      conversionBoosterEnabled = excluded.conversionBoosterEnabled,
      backgroundTheme = excluded.backgroundTheme
  `).run(
    req.params.id,
    navTitle || '',
    slogan || '',
    primaryCtaText || 'Jetzt Bonus sichern',
    primaryCtaUrl || '',
    stickyCtaEnabled ? 1 : 0,
    stickyCtaText || 'Jetzt registrieren & Bonus aktivieren',
    stickyCtaUrl || '',
    trustBadgeText || 'Verifiziert | 18+ | Verantwortungsvoll spielen',
    urgencyText || 'Nur heute: exklusive Freispiele für neue Spieler',
    abTestEnabled ? 1 : 0,
    ctaAText || 'Jetzt Bonus sichern',
    ctaAUrl || '',
    ctaBText || 'Bonus für neue Spieler holen',
    ctaBUrl || '',
    conversionBoosterEnabled ? 1 : 0,
    backgroundTheme || 'dark'
  );
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
  const page = db.prepare('SELECT slug FROM streamer_pages WHERE id = ? AND userId = ?').get(req.params.pageId, req.params.id);
  if (!page) return res.status(404).json({ success: false, error: 'Seite nicht gefunden.' });
  if (page.slug === 'shop') {
    return res.status(400).json({ success: false, error: 'Die Casinos-Seite wird automatisch aus Deals erzeugt.' });
  }
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
    const user = db.prepare(`
      SELECT id, username, siteSlug, templateId, category, customDomain, avatarUrl, toolsConfig
      FROM users
      WHERE lower(siteSlug) = ?
         OR lower(customDomain) = ?
         OR (lower(category) = ? AND instr(category, '.') > 0)
    `).get(slug, slug, slug);
    
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
        { title: 'Casinos', slug: 'shop', type: 'system', sortOrder: 2 },
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
        settings: {
          navTitle: user.username,
          slogan: '',
          primaryCtaText: 'Jetzt Bonus sichern',
          primaryCtaUrl: '',
          stickyCtaEnabled: 1,
          stickyCtaText: 'Jetzt registrieren & Bonus aktivieren',
          stickyCtaUrl: '',
          trustBadgeText: 'Verifiziert | 18+ | Verantwortungsvoll spielen',
          urgencyText: 'Nur heute: exklusive Freispiele für neue Spieler',
          abTestEnabled: 0,
          ctaAText: 'Jetzt Bonus sichern',
          ctaAUrl: '',
          ctaBText: 'Bonus für neue Spieler holen',
          ctaBUrl: '',
          conversionBoosterEnabled: 1,
          backgroundTheme: 'dark',
          ...(settings || {})
        }, 
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

app.post('/api/public/site/:slug/cta-impression', (req, res) => {
  try {
    const slug = String(req.params.slug || '').trim().toLowerCase();
    const user = db.prepare(`
      SELECT id
      FROM users
      WHERE lower(siteSlug) = ?
         OR lower(customDomain) = ?
         OR (lower(category) = ? AND instr(category, '.') > 0)
    `).get(slug, slug, slug);
    if (!user) return res.status(404).json({ success: false, error: 'Streamer not found' });
    const variant = String(req.body?.variant || 'default').toLowerCase();
    db.prepare(`
      INSERT INTO cta_events (userId, slug, variant, eventType, createdAt, ip, userAgent)
      VALUES (?, ?, ?, 'impression', ?, ?, ?)
    `).run(
      user.id,
      req.params.slug,
      ['a', 'b'].includes(variant) ? variant : 'default',
      new Date().toISOString(),
      req.ip,
      req.headers['user-agent'] || ''
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/public/site/:slug/cta/:variant', (req, res) => {
  try {
    const slug = String(req.params.slug || '').trim().toLowerCase();
    const user = db.prepare(`
      SELECT id
      FROM users
      WHERE lower(siteSlug) = ?
         OR lower(customDomain) = ?
         OR (lower(category) = ? AND instr(category, '.') > 0)
    `).get(slug, slug, slug);
    if (!user) return res.status(404).send('Streamer not found');

    const settings = db.prepare('SELECT * FROM streamer_site_settings WHERE userId = ?').get(user.id) || {};
    const variant = String(req.params.variant || 'default').toLowerCase();
    const isAb = !!settings.abTestEnabled;
    let targetUrl = settings.stickyCtaUrl || settings.primaryCtaUrl || '';
    let normalizedVariant = 'default';

    if (isAb && variant === 'a') {
      targetUrl = settings.ctaAUrl || targetUrl;
      normalizedVariant = 'a';
    } else if (isAb && variant === 'b') {
      targetUrl = settings.ctaBUrl || targetUrl;
      normalizedVariant = 'b';
    }

    db.prepare(`
      INSERT INTO cta_events (userId, slug, variant, eventType, createdAt, ip, userAgent)
      VALUES (?, ?, ?, 'click', ?, ?, ?)
    `).run(
      user.id,
      req.params.slug,
      normalizedVariant,
      new Date().toISOString(),
      req.ip,
      req.headers['user-agent'] || ''
    );

    if (!targetUrl) return res.status(400).send('CTA target is not configured');
    res.redirect(targetUrl);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get('/api/user/:id/cta-stats', (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT
        variant,
        SUM(CASE WHEN eventType = 'impression' THEN 1 ELSE 0 END) AS impressions,
        SUM(CASE WHEN eventType = 'click' THEN 1 ELSE 0 END) AS clicks
      FROM cta_events
      WHERE userId = ?
      GROUP BY variant
    `).all(req.params.id);

    const variants = { default: { impressions: 0, clicks: 0 }, a: { impressions: 0, clicks: 0 }, b: { impressions: 0, clicks: 0 } };
    rows.forEach((row) => {
      variants[row.variant] = {
        impressions: Number(row.impressions || 0),
        clicks: Number(row.clicks || 0)
      };
    });

    const withCtr = Object.fromEntries(Object.entries(variants).map(([key, value]) => {
      const ctr = value.impressions > 0 ? Number(((value.clicks / value.impressions) * 100).toFixed(2)) : 0;
      return [key, { ...value, ctr }];
    }));

    res.json({ success: true, stats: withCtr });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/streamer/:slug', (req, res) => {
  try {
    const slug = req.params.slug.toLowerCase().trim();
    console.log('Fetching streamer for slug/domain:', slug);
    const user = db.prepare(`
      SELECT id, username, siteSlug, templateId, category, customDomain, avatarUrl, toolsConfig
      FROM users
      WHERE lower(siteSlug) = ?
         OR lower(customDomain) = ?
         OR (lower(category) = ? AND instr(category, '.') > 0)
    `).get(slug, slug, slug);
    
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
  console.log(`Database path: ${activeDbPath}`);
});
