const Database = require('better-sqlite3');
const db = new Database('leads.db');

try {
    db.exec('ALTER TABLE users ADD COLUMN avatarUrl TEXT');
    console.log('Spalte avatarUrl erfolgreich hinzugefügt.');
} catch (err) {
    if (err.message.includes('duplicate column name')) {
        console.log('Spalte avatarUrl existiert bereits.');
    } else {
        console.error('Fehler bei avatarUrl:', err.message);
    }
}

try {
    db.exec("ALTER TABLE users ADD COLUMN toolsConfig TEXT DEFAULT '{}'");
    console.log('Spalte toolsConfig erfolgreich hinzugefügt.');
} catch (err) {
    if (err.message.includes('duplicate column name')) {
        console.log('Spalte toolsConfig existiert bereits.');
    } else {
        console.error('Fehler bei toolsConfig:', err.message);
    }
}

db.close();
