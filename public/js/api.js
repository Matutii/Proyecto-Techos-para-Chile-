// Guarda y recupera la sesión del usuario en el localStorage del navegador
const Sesion = {
  guardar: function (token, usuario) {
    localStorage.setItem('token', token);
    localStorage.setItem('usuario', JSON.stringify(usuario));
  },
  token: function () {
    return localStorage.getItem('token');
  },
  usuario: function () {
    const texto = localStorage.getItem('usuario');
    if (!texto) return null;
    return JSON.parse(texto);
  },
  salir: function () {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
  },
};

// Hace una petición al backend (agregando el token si el usuario está logueado)
// options.method: 'GET', 'POST', 'PATCH', etc.
// options.body: objeto que se manda como JSON
// options.auth: si es false, no manda el token aunque exista (para login/registro/donar público)
async function api(ruta, options) {
  options = options || {};
  const metodo = options.method || 'GET';

  const headers = { 'Content-Type': 'application/json' };
  if (options.auth !== false) {
    const token = Sesion.token();
    if (token) headers.Authorization = 'Bearer ' + token;
  }

  const respuesta = await fetch('/api' + ruta, {
    method: metodo,
    headers: headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  let datos = null;
  try {
    datos = await respuesta.json();
  } catch (e) {
    datos = null;
  }

  if (!respuesta.ok) {
    const mensaje = (datos && datos.error) ? datos.error : 'Error ' + respuesta.status;

    // Si el token quedó inválido a mitad de uso (expiró, o quedó de otra
    // corrida de la app con otro JWT_SECRET), cerramos sesión y volvemos
    // a la pantalla pública en vez de seguir mostrando "Token inválido".
    if (respuesta.status === 401 && options.auth !== false) {
      Sesion.salir();
      window.location.reload();
    }

    throw new Error(mensaje);
  }

  return datos;
}
