const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const db = require('./database');

const app = express();
const PORT = 3002;

const SECRET_KEY = Buffer.from(
    's5z2b514R6lrNOwLidNrzT9bHtBnlO+0yO5SOzY3Cdg=',
    'utf8'
);

app.use(cors());
app.use(express.json());

const verificarToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return res.status(401).json({
            error: 'Acceso denegado. Token no proporcionado.'
        });
    }

    const token = authHeader.startsWith('Bearer ')
        ? authHeader.slice(7)
        : authHeader;
 
        console.log('AUTH HEADER:', authHeader);
         console.log('TOKEN:', token);

    jwt.verify(token, SECRET_KEY, (err, decoded) => {

        if (err) {
            console.log('ERROR JWT:', err.message);

            return res.status(403).json({
                error: 'Token inválido o expirado.',
                detalle: err.message
            });
        }

        console.log('JWT VALIDADO:', decoded);

        req.usuario = decoded.sub || decoded.username;

        next();
    });
};

app.post('/comprar', verificarToken, async (req, res) => {

   console.log('BODY RECIBIDO:', req.body);

    const { producto_id, cantidad } = req.body || {};
    const usuario = req.usuario;

    if (!producto_id || !cantidad) {
        return res.status(400).json({
            error: 'Debe enviar producto_id y cantidad.'
        });
    }

    try {

        await axios.put(
            `http://localhost:3001/productos/${producto_id}/stock`,
            {
                cantidad: cantidad
            }
        );

        const stmt = db.prepare(
            "INSERT INTO compras (usuario, producto_id, cantidad) VALUES (?, ?, ?)"
        );

        stmt.run(
            usuario,
            producto_id,
            cantidad,
            function (err) {

                if (err) {
                    return res.status(500).json({
                        error: err.message
                    });
                }

                res.json({
                    mensaje: 'Compra realizada con éxito',
                    compraId: this.lastID,
                    usuario,
                    producto_id,
                    cantidad
                });
            }
        );

        stmt.finalize();

    } catch (error) {

        if (error.response) {
            return res.status(error.response.status).json({
                error:
                    error.response.data.error ||
                    'Error al procesar la compra'
            });
        }

        res.status(500).json({
            error: 'No se pudo conectar con el microservicio de Productos.'
        });
    }
});

app.get('/compras', verificarToken, (req, res) => {

    db.all(
        "SELECT * FROM compras WHERE usuario = ?",
        [req.usuario],
        (err, rows) => {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            res.json(rows);
        }
    );
});

app.listen(PORT, () => {
    console.log(
        `Microservicio de COMPRAS corriendo en http://localhost:${PORT}`
    );
});