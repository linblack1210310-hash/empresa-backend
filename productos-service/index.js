const express = require('express');
const cors = require('cors');
const db = require('./database');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Ruta para obtener todos los productos
app.get('/productos', (req, res) => {
    db.all("SELECT * FROM productos", [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

app.get('/', (req, res) => {
    db.all("SELECT * FROM productos", [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Ruta para obtener un producto por ID
app.get('/productos/:id', (req, res) => {
    db.get("SELECT * FROM productos WHERE id = ?", [req.params.id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }
        res.json(row);
    });
});

// FUNCIÓN AUXILIAR PARA ACTUALIZAR STOCK (Reutilizable para cualquier ruta)
const actualizarStockLogic = (req, res) => {
    const { cantidad } = req.body;
    const { id } = req.params;

    db.run(
        "UPDATE productos SET stock = stock - ? WHERE id = ? AND stock >= ?",
        [cantidad || 1, id, cantidad || 1],
        function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (this.changes === 0) {
                return res.status(400).json({ error: "Stock insuficiente o producto no encontrado" });
            }
            res.json({ mensaje: "Stock actualizado correctamente" });
        }
    );
};

// Aceptamos AMBAS rutas para evitar cualquier error 404 de comunicación
app.put('/productos/:id/stock', actualizarStockLogic);
app.put('/productos/:id/reducir', actualizarStockLogic);

app.listen(PORT, () => {
    console.log(`Microservicio de Productos corriendo en http://localhost:${PORT}`);
});