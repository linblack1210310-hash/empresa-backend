const express = require('express');
const cors = require('cors');
const axios = require('axios');
const db = require('./database');

const app = express();
const PORT = 3002;

app.use(cors());
app.use(express.json());

// 1. RUTA PARA REGISTRAR COMPRA Y REDUCIR STOCK
app.post('/comprar', async (req, res) => {
  const producto_id = req.body.producto_id || req.body.id || req.body.productId;
  const cantidad = req.body.cantidad || 1;
  
  // Capturamos el usuario enviado por el frontend (por body o headers) o usamos uno por defecto
  const usuario = req.body.usuario || req.body.username || req.headers['x-usuario'] || 'smith1010'; 

  if (!producto_id) {
    return res.status(400).json({ error: 'Falta el identificador del producto' });
  }

  try {
    const query = `INSERT INTO compras (producto_id, cantidad, usuario, fecha) VALUES (?, ?, ?, datetime('now'))`;
    
    db.run(query, [producto_id, cantidad, usuario], async function(err) {
      if (err) {
        console.error("Error base de datos compras:", err.message);
        return res.status(500).json({ error: 'Error al guardar la compra: ' + err.message });
      }

      // AVISAR AL MICROSERVICIO DE PRODUCTOS (3001) PARA ACTUALIZAR EL STOCK
      try {
        await axios.put(`http://localhost:3001/productos/${producto_id}/stock`, { cantidad });
      } catch (stockError) {
        console.warn("No se pudo actualizar el stock en productos:", stockError.message);
      }

      return res.status(201).json({ 
        success: true, 
        message: 'Compra realizada con éxito y stock actualizado', 
        id: this.lastID 
      });
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// 2. RUTA PARA CONSULTAR HISTORIAL FILTRADO ESTRICTAMENTE POR USUARIO
const obtenerHistorial = (req, res) => {
  // Capturamos el usuario o asignamos 'smith1010' por defecto para evitar mostrar datos globales
  const usuario = req.query.usuario || req.headers['x-usuario'] || 'smith1010';

  let query = `SELECT * FROM compras WHERE usuario = ?`;
  let params = [usuario];

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

app.get('/compras', obtenerHistorial);
app.get('/', obtenerHistorial);

app.listen(PORT, () => {
  console.log(`Compras Service corriendo en http://localhost:${PORT}`);
});