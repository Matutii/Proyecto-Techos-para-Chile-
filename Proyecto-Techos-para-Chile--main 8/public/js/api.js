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
    throw new Error(mensaje);
  }

  return datos;
}

// Hace una petición con FormData (para subir archivos)
async function apiFormData(ruta, formData, method) {
  method = method || 'POST';
  const headers = {};
  const token = Sesion.token();
  if (token) headers.Authorization = 'Bearer ' + token;

  const respuesta = await fetch('/api' + ruta, {
    method: method,
    headers: headers,
    body: formData,
  });

  let datos = null;
  try {
    datos = await respuesta.json();
  } catch (e) {
    datos = null;
  }

  if (!respuesta.ok) {
    const mensaje = (datos && datos.error) ? datos.error : 'Error ' + respuesta.status;
    throw new Error(mensaje);
  }

  return datos;
}
