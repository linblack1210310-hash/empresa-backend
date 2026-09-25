const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'productos.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error al conectar con SQLite (Productos):', err.message);
    } else {
        console.log('Conectado a la base de datos SQLite de Productos.');
    }
});

// Crear tabla e insertar datos iniciales de forma segura
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS productos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            precio REAL NOT NULL,
            stock INTEGER NOT NULL
        )
    `, (err) => {
        if (!err) {
            db.get("SELECT COUNT(*) AS count FROM productos", (err, row) => {
                if (row && row.count === 0) {
                    const stmt = db.prepare("INSERT INTO productos (nombre, precio, stock) VALUES (?, ?, ?)");
                    stmt.run("Laptop Gaming", 1200.00, 10);
                    stmt.run("Mouse Inalámbrico", 25.50, 50);
                    stmt.run("Teclado Mecánico", 80.00, 20);
                    stmt.finalize();
                    console.log("Productos de prueba agregados.");
                }
            });
        }
    });
});

module.exports = db;