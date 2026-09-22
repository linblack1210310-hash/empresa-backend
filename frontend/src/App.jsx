import { useState } from 'react';
import './index.css';

function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [mensaje, setMensaje] = useState('');

  const [productos, setProductos] = useState([]);
  const [compras, setCompras] = useState([]);

  const [logueado, setLogueado] = useState(false);
  const [mostrarHistorial, setMostrarHistorial] = useState(false);
  const [mostrarRegistro, setMostrarRegistro] = useState(false);

  const iniciarSesion = async (e) => {
    e.preventDefault();

    try {
      const respuesta = await fetch(
        'http://localhost:3000/api/auth/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username,
            password,
          }),
        }
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        setMensaje(datos.error || 'Error al iniciar sesión');
        return;
      }

      localStorage.setItem('token', datos.token);

      setMensaje('¡Inicio de sesión exitoso!');
      setLogueado(true);

      cargarProductos();
    } catch (error) {
      console.error(error);
      setMensaje('No se pudo conectar con el servidor');
    }
  };

  const registrarUsuario = async (e) => {
    e.preventDefault();

    try {
      const respuesta = await fetch(
        'http://localhost:3000/api/auth/registrar',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username,
            password,
            rol: 'USER',
          }),
        }
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        setMensaje(
          datos.error || 'No se pudo registrar el usuario'
        );
        return;
      }

      setMensaje(
        'Usuario registrado correctamente. Ahora puedes iniciar sesión.'
      );

      setMostrarRegistro(false);
      setUsername('');
      setPassword('');
    } catch (error) {
      console.error(error);
      setMensaje('No se pudo conectar con el servidor');
    }
  };

  const cargarProductos = async () => {
    try {
      const respuesta = await fetch(
        'http://localhost:3000/api/productos'
      );

      const datos = await respuesta.json();

      setProductos(datos);
    } catch (error) {
      console.error(error);
      setMensaje('No se pudieron cargar los productos');
    }
  };

  const comprarProducto = async (productoId) => {
    const token = localStorage.getItem('token');

    try {
      const respuesta = await fetch(
        'http://localhost:3000/api/compras/comprar',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            producto_id: productoId,
            cantidad: 1,
          }),
        }
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        setMensaje(
          datos.error || 'No se pudo realizar la compra'
        );
        return;
      }

      setMensaje('¡Compra realizada con éxito!');

      cargarProductos();
    } catch (error) {
      console.error(error);
      setMensaje('No se pudo conectar con el servidor');
    }
  };

  const cargarHistorial = async () => {
    const token = localStorage.getItem('token');

    try {
      const respuesta = await fetch(
        'http://localhost:3000/api/compras/compras',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        setMensaje(
          datos.error || 'No se pudo cargar el historial'
        );
        return;
      }

      setCompras(datos);
      setMostrarHistorial(true);
    } catch (error) {
      console.error(error);
      setMensaje('No se pudo conectar con el servidor');
    }
  };

  const cerrarSesion = () => {
    localStorage.removeItem('token');

    setLogueado(false);
    setProductos([]);
    setCompras([]);
    setMostrarHistorial(false);
    setMensaje('');
    setUsername('');
    setPassword('');
  };

  return (
    <div className="app">
      {!logueado ? (
        <div className="auth-container">
          <div className="auth-card">
            <div className="logo">🛒</div>

            <h1>Mi E-Commerce</h1>

            {!mostrarRegistro ? (
              <>
                <p className="subtitle">
                  Inicia sesión para continuar
                </p>

                <form onSubmit={iniciarSesion}>
                  <input
                    type="text"
                    placeholder="Usuario"
                    value={username}
                    onChange={(e) =>
                      setUsername(e.target.value)
                    }
                  />

                  <input
                    type="password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                  />

                  <button className="btn-primary" type="submit">
                    Iniciar sesión
                  </button>
                </form>

                <p className="mensaje">{mensaje}</p>

                <p className="switch-text">
                  ¿No tienes una cuenta?
                </p>

                <button
                  className="btn-secondary"
                  onClick={() => {
                    setMostrarRegistro(true);
                    setMensaje('');
                  }}
                >
                  Crear cuenta
                </button>
              </>
            ) : (
              <>
                <p className="subtitle">Crea tu cuenta</p>

                <form onSubmit={registrarUsuario}>
                  <input
                    type="text"
                    placeholder="Nuevo usuario"
                    value={username}
                    onChange={(e) =>
                      setUsername(e.target.value)
                    }
                  />

                  <input
                    type="password"
                    placeholder="Nueva contraseña"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                  />

                  <button className="btn-primary" type="submit">
                    Registrarse
                  </button>
                </form>

                <p className="mensaje">{mensaje}</p>

                <button
                  className="btn-secondary"
                  onClick={() => {
                    setMostrarRegistro(false);
                    setMensaje('');
                  }}
                >
                  Volver al inicio
                </button>
              </>
            )}
          </div>
        </div>
      ) : (
        <>
          <header className="header">
            <div>
              <h1>🛒 Mi E-Commerce</h1>
              <span>Bienvenido, {username}</span>
            </div>

            <button
              className="btn-logout"
              onClick={cerrarSesion}
            >
              Cerrar sesión
            </button>
          </header>

          <main className="main">
            <div className="title-section">
              <h2>Productos</h2>

              <button
                className="btn-history"
                onClick={cargarHistorial}
              >
                📋 Ver historial
              </button>
            </div>

            <p className="mensaje">{mensaje}</p>

            <div className="products-grid">
              {productos.map((producto) => (
                <div
                  className="product-card"
                  key={producto.id}
                >
                  <div className="product-icon">📦</div>

                  <h3>{producto.nombre}</h3>

                  <p className="price">${producto.precio}</p>

                  <p className="stock">
                    Stock disponible: {producto.stock}
                  </p>

                  <button
                    className="btn-buy"
                    onClick={() =>
                      comprarProducto(producto.id)
                    }
                    disabled={producto.stock <= 0}
                  >
                    {producto.stock > 0
                      ? '🛒 Comprar'
                      : 'Agotado'}
                  </button>
                </div>
              ))}
            </div>

            {mostrarHistorial && (
              <section className="history">
                <h2>📋 Historial de compras</h2>

                {compras.length === 0 ? (
                  <p>No tienes compras registradas.</p>
                ) : (
                  <div className="history-list">
                    {compras.map((compra) => (
                      <div
                        className="history-item"
                        key={compra.id}
                      >
                        <div>
                          <strong>
                            Compra #{compra.id}
                          </strong>

                          <p>
                            Producto #{compra.producto_id}
                          </p>
                        </div>

                        <div>
                          <p>
                            Cantidad: {compra.cantidad}
                          </p>

                          <p>
                            Fecha: {compra.fecha}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}
          </main>
        </>
      )}
    </div>
  );
}

export default App;