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

// Ruta para actualizar stock de producto (usada por Compras)
app.put('/productos/:id/stock', (req, res) => {
    const { cantidad } = req.body;
    db.run(
        "UPDATE productos SET stock = stock - ? WHERE id = ? AND stock >= ?",
        [cantidad, req.params.id, cantidad],
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
});

app.listen(PORT, () => {
    console.log(`Microservicio de Productos corriendo en http://localhost:${PORT}`);
});