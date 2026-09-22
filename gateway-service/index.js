const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = 3000;

app.use(cors());

// 1. Usuarios (Spring Boot en puerto 8080)
app.use('/api/auth', createProxyMiddleware({
    target: 'http://127.0.0.1:8080',
    changeOrigin: true,
    pathRewrite: {
        '^/api/auth': ''
    }
}));

// 2. Productos (Node.js en puerto 3001)
app.use(createProxyMiddleware({
    target: 'http://127.0.0.1:3001',
    changeOrigin: true,
    pathFilter: '/api/productos',
    pathRewrite: {
        '^/api/productos': '/productos'
    }
}));

// 3. Compras (Node.js en puerto 3002)
app.use('/api/compras', createProxyMiddleware({
    target: 'http://127.0.0.1:3002',
    changeOrigin: true,
    pathRewrite: {
        '^/api/compras': ''
    }
}));

app.listen(PORT, () => {
    console.log(`API Gateway corriendo en http://localhost:${PORT}`);
});