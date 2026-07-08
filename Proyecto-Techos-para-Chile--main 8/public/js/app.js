// Este archivo controla toda la página: login, registro, donar,
// y el panel de cada rol después de iniciar sesión.

// Cuando carga la página, si ya había una sesión guardada, entramos directo a la app
document.addEventListener('DOMContentLoaded', function () {
  cablearTabs();
  cablearFormularios();

  const usuario = Sesion.usuario();
  if (usuario && Sesion.token()) {
    entrarAlApp(usuario);
  }
});

// Muestra un mensaje de error o de éxito debajo de un formulario
function mostrarMensaje(idDiv, texto, esError) {
  const div = document.getElementById(idDiv);
  if (!div) return;
  const clase = esError ? 'msg-error' : 'msg-ok';
  div.innerHTML = '<div class="msg ' + clase + '">' + texto + '</div>';
  setTimeout(function () { div.innerHTML = ''; }, 5000);
}

// ---------------------------------------------------------------------------
// Pestañas de la landing (Iniciar sesión / Crear cuenta / Donar)
// ---------------------------------------------------------------------------
function cablearTabs() {
  const botones = document.querySelectorAll('.tab-btn');
  for (let i = 0; i < botones.length; i++) {
    botones[i].addEventListener('click', function () {
      for (let j = 0; j < botones.length; j++) botones[j].classList.remove('activo');
      this.classList.add('activo');

      const tab = this.dataset.tab;
      document.getElementById('form-login').classList.toggle('oculto', tab !== 'login');
      document.getElementById('form-registro').classList.toggle('oculto', tab !== 'registro');
    });
  }
}

// ---------------------------------------------------------------------------
// Formularios
// ---------------------------------------------------------------------------
function cablearFormularios() {
  document.getElementById('form-login').addEventListener('submit', async function (e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
      const data = await api('/auth/login', { method: 'POST', auth: false, body: { email, password } });
      Sesion.guardar(data.token, data.usuario);
      entrarAlApp(data.usuario);
    } catch (err) {
      mostrarMensaje('msg-auth', err.message, true);
    }
  });

  document.getElementById('form-registro').addEventListener('submit', async function (e) {
    e.preventDefault();
    const nombre = document.getElementById('reg-nombre').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;

    try {
      const data = await api('/auth/registro', { method: 'POST', auth: false, body: { nombre, email, password } });
      Sesion.guardar(data.token, data.usuario);
      entrarAlApp(data.usuario);
    } catch (err) {
      mostrarMensaje('msg-auth', err.message, true);
    }
  });



  document.getElementById('btn-salir').addEventListener('click', function () {
    Sesion.salir();
    window.location.reload();
  });

  document.getElementById('form-material').addEventListener('submit', crearMaterial);
  document.getElementById('form-cuadrilla').addEventListener('submit', crearCuadrilla);
  document.getElementById('form-nuevo-usuario').addEventListener('submit', crearUsuario);
  document.getElementById('form-donar-app').addEventListener('submit', donarDesdeApp);
  document.getElementById('form-horas').addEventListener('submit', registrarHoras);

  const botonesFiltro = document.querySelectorAll('[data-filtro-stock]');
  for (let i = 0; i < botonesFiltro.length; i++) {
    botonesFiltro[i].addEventListener('click', function () {
      cargarStock(this.dataset.filtroStock);
    });
  }
}

// ---------------------------------------------------------------------------
// Entrar a la app: arma el menú según el rol y muestra el primer panel
// ---------------------------------------------------------------------------
function entrarAlApp(usuario) {
  document.getElementById('vista-publica').classList.add('oculto');
  document.getElementById('vista-app').classList.remove('oculto');

  const rol = usuario.rol;
  document.getElementById('badge-rol').textContent = nombreDelRol(rol);

  // El menú lateral es distinto para cada rol.
  const nav = document.getElementById('nav-app');
  nav.innerHTML = '';

  if (rol === 'admin') {
    agregarBotonNav(nav, 'Usuarios', 'usuarios');
    agregarBotonNav(nav, 'Bodega', 'bodega');
    agregarBotonNav(nav, 'Cuadrillas', 'cuadrillas');
    agregarBotonNav(nav, 'Voluntarios', 'voluntarios');
    agregarBotonNav(nav, 'Donaciones', 'donaciones');
    agregarBotonNav(nav, 'Mi cuadrilla', 'mi-cuadrilla');
    agregarBotonNav(nav, 'Registrar horas', 'registrar-horas');
    agregarBotonNav(nav, 'Mis horas', 'mis-horas');
    agregarBotonNav(nav, 'Horas proyectos', 'horas-proyecto');
  } else if (rol === 'coordinador_logistica') {
    agregarBotonNav(nav, 'Bodega', 'bodega');
    agregarBotonNav(nav, 'Donaciones', 'donaciones');
    agregarBotonNav(nav, 'Registrar horas', 'registrar-horas');
    agregarBotonNav(nav, 'Mis horas', 'mis-horas');
  } else if (rol === 'colaborador') {
    agregarBotonNav(nav, 'Bodega', 'bodega');
    agregarBotonNav(nav, 'Registrar horas', 'registrar-horas');
    agregarBotonNav(nav, 'Mis horas', 'mis-horas');
  } else if (rol === 'encargado_cuadrillas') {
    agregarBotonNav(nav, 'Cuadrillas', 'cuadrillas');
    agregarBotonNav(nav, 'Voluntarios', 'voluntarios');
    agregarBotonNav(nav, 'Mi cuadrilla', 'mi-cuadrilla');
    agregarBotonNav(nav, 'Registrar horas', 'registrar-horas');
    agregarBotonNav(nav, 'Mis horas', 'mis-horas');
    agregarBotonNav(nav, 'Horas proyectos', 'horas-proyecto');
  } else if (rol === 'visitante') {
    agregarBotonNav(nav, 'Donar', 'donar');
    agregarBotonNav(nav, 'Mis donaciones', 'mis-donaciones');
  }

  // El panel de bodega se ve distinto para colaborador (solo retira, no crea materiales)
  const esColaborador = rol === 'colaborador';
  document.getElementById('bloque-crear-material').classList.toggle('oculto', esColaborador);
  document.getElementById('sub-bodega').textContent = esColaborador
    ? 'Retira lo que necesites para tu tarea en terreno.'
    : 'Ingresa materiales nuevos y controla su estado.';

  // Abrir el primer panel del menú
  const primerBoton = nav.querySelector('.nav-item');
  if (primerBoton) primerBoton.click();
}

function nombreDelRol(rol) {
  if (rol === 'admin') return 'Administrador';
  if (rol === 'coordinador_logistica') return 'Bodega';
  if (rol === 'colaborador') return 'Colaborador';
  if (rol === 'encargado_cuadrillas') return 'Encargado de cuadrillas';
  if (rol === 'visitante') return 'Visitante';
  return rol;
}

function agregarBotonNav(nav, texto, idPanel) {
  const boton = document.createElement('button');
  boton.className = 'nav-item';
  boton.textContent = texto;
  boton.addEventListener('click', function () {
    mostrarPanel(idPanel, boton);
  });
  nav.appendChild(boton);
}

function mostrarPanel(idPanel, boton) {
  const paneles = document.querySelectorAll('.panel');
  for (let i = 0; i < paneles.length; i++) paneles[i].classList.remove('activo');
  document.getElementById('panel-' + idPanel).classList.add('activo');

  const botones = document.querySelectorAll('.nav-item');
  for (let i = 0; i < botones.length; i++) botones[i].classList.remove('activo');
  boton.classList.add('activo');

  if (idPanel === 'usuarios') cargarUsuarios();
  if (idPanel === 'bodega') cargarStock('');
  if (idPanel === 'cuadrillas') cargarCuadrillas();
  if (idPanel === 'voluntarios') cargarVoluntarios();
  if (idPanel === 'donaciones') cargarDonaciones();
  if (idPanel === 'mis-donaciones') cargarMisDonaciones();
  if (idPanel === 'donar') verificarPendienteDonar();
  if (idPanel === 'mi-cuadrilla') cargarMiCuadrilla();
  if (idPanel === 'registrar-horas') cargarProyectosEnSelect();
  if (idPanel === 'mis-horas') cargarMisHoras();
  if (idPanel === 'horas-proyecto') cargarHorasProyecto();
}

// ---------------------------------------------------------------------------
// Bodega
// ---------------------------------------------------------------------------
async function cargarStock(estado) {
  const contenedor = document.getElementById('tabla-stock');
  contenedor.innerHTML = 'Cargando...';

  try {
    const ruta = estado ? '/stock?estado=' + estado : '/stock';
    const materiales = await api(ruta);

    if (materiales.length === 0) {
      contenedor.innerHTML = '<div class="vacio">No hay materiales para mostrar.</div>';
      return;
    }

    const rol = Sesion.usuario().rol;
    let html = '<table><thead><tr><th>Material</th><th>Estado</th><th>Proyecto</th><th></th></tr></thead><tbody>';

    for (let i = 0; i < materiales.length; i++) {
      const m = materiales[i];
      const nombreProyecto = m.proyecto ? m.proyecto.nombre : '—';

      let colorBadge = 'badge-mid';
      if (m.estado === 'Disponible') colorBadge = 'badge-ok';
      if (m.estado === 'Agotado') colorBadge = 'badge-warn';

      let acciones = '—';
      if (rol === 'colaborador' && m.estado === 'Disponible') {
        acciones = '<button class="btn btn-ghost btn-sm" onclick="retirarMaterial(' + m.id + ')">Retirar</button>';
      } else if (rol === 'admin' || rol === 'coordinador_logistica') {
        acciones =
          '<select onchange="cambiarEstadoMaterial(' + m.id + ', this.value)">' +
          '<option value="Disponible"' + (m.estado === 'Disponible' ? ' selected' : '') + '>Disponible</option>' +
          '<option value="Agotado"' + (m.estado === 'Agotado' ? ' selected' : '') + '>Agotado</option>' +
          '<option value="En_camino"' + (m.estado === 'En_camino' ? ' selected' : '') + '>En camino</option>' +
          '</select>';
      }

      html += '<tr><td>' + m.nombre + '</td>' +
        '<td><span class="badge ' + colorBadge + '">' + m.estado + '</span></td>' +
        '<td>' + nombreProyecto + '</td>' +
        '<td>' + acciones + '</td></tr>';
    }

    html += '</tbody></table>';
    contenedor.innerHTML = html;
  } catch (err) {
    contenedor.innerHTML = '<div class="msg msg-error">' + err.message + '</div>';
  }
}

async function retirarMaterial(id) {
  try {
    await api('/stock/' + id + '/retiro', { method: 'PATCH', body: { observacion: 'Retiro desde la plataforma' } });
    cargarStock('');
  } catch (err) {
    mostrarMensaje('msg-material', err.message, true);
  }
}

async function cambiarEstadoMaterial(id, estado) {
  try {
    await api('/stock/' + id + '/estado', { method: 'PATCH', body: { estado: estado } });
    cargarStock('');
  } catch (err) {
    mostrarMensaje('msg-material', err.message, true);
  }
}

async function crearMaterial(e) {
  e.preventDefault();
  const nombre = document.getElementById('mat-nombre').value;
  const descripcion = document.getElementById('mat-desc').value;

  try {
    await api('/stock', { method: 'POST', body: { nombre: nombre, descripcion: descripcion } });
    mostrarMensaje('msg-material', 'Material agregado.', false);
    e.target.reset();
    cargarStock('');
  } catch (err) {
    mostrarMensaje('msg-material', err.message, true);
  }
}

// ---------------------------------------------------------------------------
// Cuadrillas
// ---------------------------------------------------------------------------
async function cargarCuadrillas() {
  const contenedor = document.getElementById('tabla-cuadrillas');
  contenedor.innerHTML = 'Cargando...';

  try {
    const cuadrillas = await api('/cuadrillas');

    if (cuadrillas.length === 0) {
      contenedor.innerHTML = '<div class="vacio">Todavía no hay cuadrillas creadas.</div>';
      return;
    }

    let html = '<table><thead><tr><th>Nombre</th><th>Especialidad</th><th>Estado</th><th>Voluntarios</th></tr></thead><tbody>';
    for (let i = 0; i < cuadrillas.length; i++) {
      const c = cuadrillas[i];
      const cantidadVoluntarios = c.voluntarios ? c.voluntarios.length : 0;
      html += '<tr><td>' + c.nombre + '</td><td>' + c.especialidad + '</td>' +
        '<td><span class="badge badge-mid">' + c.estado + '</span></td>' +
        '<td>' + cantidadVoluntarios + '</td></tr>';
    }
    html += '</tbody></table>';
    contenedor.innerHTML = html;
  } catch (err) {
    contenedor.innerHTML = '<div class="msg msg-error">' + err.message + '</div>';
  }
}

async function crearCuadrilla(e) {
  e.preventDefault();
  const nombre = document.getElementById('cu-nombre').value;
  const especialidad = document.getElementById('cu-especialidad').value;

  try {
    await api('/cuadrillas', { method: 'POST', body: { nombre: nombre, especialidad: especialidad } });
    mostrarMensaje('msg-cuadrilla', 'Cuadrilla creada.', false);
    e.target.reset();
    cargarCuadrillas();
  } catch (err) {
    mostrarMensaje('msg-cuadrilla', err.message, true);
  }
}

// ---------------------------------------------------------------------------
// Voluntarios
// ---------------------------------------------------------------------------
async function cargarVoluntarios() {
  const contenedor = document.getElementById('tabla-voluntarios');
  contenedor.innerHTML = 'Cargando...';

  try {
    const voluntarios = await api('/voluntarios');

    if (voluntarios.length === 0) {
      contenedor.innerHTML = '<div class="vacio">Todavía no hay voluntarios inscritos.</div>';
      return;
    }

    let html = '<table><thead><tr><th>Nombre</th><th>Email</th><th>Estado</th></tr></thead><tbody>';
    for (let i = 0; i < voluntarios.length; i++) {
      const v = voluntarios[i];
      html += '<tr><td>' + v.nombre + ' ' + v.apellido + '</td><td>' + v.email + '</td>' +
        '<td><span class="badge badge-mid">' + v.estado + '</span></td></tr>';
    }
    html += '</tbody></table>';
    contenedor.innerHTML = html;
  } catch (err) {
    contenedor.innerHTML = '<div class="msg msg-error">' + err.message + '</div>';
  }
}

// ---------------------------------------------------------------------------
// Donaciones
// ---------------------------------------------------------------------------
async function cargarDonaciones() {
  const contenedor = document.getElementById('tabla-donaciones');
  contenedor.innerHTML = 'Cargando...';

  try {
    const donaciones = await api('/donaciones');

    if (donaciones.length === 0) {
      contenedor.innerHTML = '<div class="vacio">Todavía no se han registrado donaciones.</div>';
      return;
    }

    let html = '<table><thead><tr><th>Donante</th><th>Monto</th><th>Método</th><th>Comprobante</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>';
    for (let i = 0; i < donaciones.length; i++) {
      const d = donaciones[i];
      const nombreDonante = d.donanteNombre || 'Anónimo';
      const colorBadge = d.estado === 'confirmada' ? 'badge-ok' : (d.estado === 'rechazada' ? 'badge-warn' : 'badge-mid');

      const comprobanteHtml = d.comprobante
        ? '<a href="/uploads/' + d.comprobante + '" target="_blank" class="btn btn-ghost btn-sm">Ver</a>'
        : '—';

      let acciones = '—';
      if (d.estado === 'pendiente') {
        acciones = '<button class="btn btn-ghost btn-sm" onclick="cambiarEstadoDonacion(' + d.id + ', \'confirmada\')">Aceptar</button> ' +
          '<button class="btn btn-ghost btn-sm" onclick="cambiarEstadoDonacion(' + d.id + ', \'rechazada\')">Rechazar</button>';
      }

      html += '<tr><td>' + nombreDonante + '</td><td>$' + Number(d.monto).toLocaleString('es-CL') + '</td>' +
        '<td>' + (d.metodoPago || '—') + '</td>' +
        '<td>' + comprobanteHtml + '</td>' +
        '<td><span class="badge ' + colorBadge + '">' + d.estado + '</span></td>' +
        '<td>' + acciones + '</td></tr>';
    }
    html += '</tbody></table>';
    contenedor.innerHTML = html;
  } catch (err) {
    contenedor.innerHTML = '<div class="msg msg-error">' + err.message + '</div>';
  }
}

// Cambia el estado de una donación (aceptar = confirmada, rechazar = rechazada)

async function cambiarEstadoDonacion(id, nuevoEstado) {
  try {
    await api('/donaciones/' + id + '/estado', { method: 'PATCH', body: { estado: nuevoEstado } });
    cargarDonaciones();
  } catch (err) {
    alert(err.message);
  }
}

async function donarDesdeApp(e) {
  e.preventDefault();
  const monto = document.getElementById('donapp-monto').value;
  const metodo = document.getElementById('donapp-metodo').value;
  const archivo = document.getElementById('donapp-comprobante').files[0];

  const formData = new FormData();
  formData.append('monto', Number(monto));
  formData.append('metodoPago', metodo);
  formData.append('comprobante', archivo);

  try {
    await apiFormData('/donaciones', formData, 'POST');
    mostrarMensaje('msg-donar-app', 'Donación registrada. Espera a que sea confirmada.', false);
    e.target.reset();
    cargarMisDonaciones();
  } catch (err) {
    mostrarMensaje('msg-donar-app', err.message, true);
  }
}

// ---------------------------------------------------------------------------
// Verificar si el visitante puede donar (no tener pendiente)
// ---------------------------------------------------------------------------
async function verificarPendienteDonar() {
  const form = document.getElementById('form-donar-app');
  const msgDiv = document.getElementById('msg-donar-app');

  try {
    const donaciones = await api('/donaciones/mis-donaciones');
    const tienePendiente = donaciones.some(function (d) { return d.estado === 'pendiente' });

    if (tienePendiente) {
      form.style.display = 'none';
      msgDiv.innerHTML = '<div class="msg msg-info">Ya tienes una donación pendiente de revisión. Espera a que sea confirmada para realizar otra.</div>';
    } else {
      form.style.display = '';
      msgDiv.innerHTML = '';
    }
  } catch (err) {
    // Si hay error (ej. no hay donaciones), mostrar el formulario igual
    form.style.display = '';
  }
}

// ---------------------------------------------------------------------------
// Mi cuadrilla
// ---------------------------------------------------------------------------
async function cargarMiCuadrilla() {
  const contenedor = document.getElementById('info-mi-cuadrilla');
  contenedor.innerHTML = 'Cargando...';

  try {
    const data = await api('/cuadrillas/mi-cuadrilla');

    if (!data.asignado) {
      contenedor.innerHTML = '<div class="card"><div class="msg msg-info">' + data.mensaje + '</div></div>';
      return;
    }

    const c = data.cuadrilla;
    const proyecto = c.proyecto ? c.proyecto.nombre : 'Sin proyecto';
    const fecha = data.desde ? new Date(data.desde).toLocaleDateString('es-CL') : '—';

    contenedor.innerHTML =
      '<div class="card">' +
      '<h3>' + c.nombre + '</h3>' +
      '<p><strong>Especialidad:</strong> ' + c.especialidad + '</p>' +
      '<p><strong>Proyecto:</strong> ' + proyecto + '</p>' +
      '<p><strong>Estado:</strong> <span class="badge badge-mid">' + c.estado + '</span></p>' +
      '<p><strong>Asignado desde:</strong> ' + fecha + '</p>' +
      '</div>';
  } catch (err) {
    contenedor.innerHTML = '<div class="msg msg-error">' + err.message + '</div>';
  }
}

// ---------------------------------------------------------------------------
// Registrar horas de trabajo
// ---------------------------------------------------------------------------
async function cargarProyectosEnSelect() {
  const select = document.getElementById('horas-proyecto');
  try {
    const proyectos = await api('/horas/proyectos');
    select.innerHTML = '<option value="">Selecciona un proyecto</option>';
    for (let i = 0; i < proyectos.length; i++) {
      const p = proyectos[i];
      select.innerHTML += '<option value="' + p.id + '">' + p.nombre + '</option>';
    }
  } catch (err) {
    select.innerHTML = '<option value="">Error al cargar proyectos</option>';
  }
}

async function registrarHoras(e) {
  e.preventDefault();
  const proyectoId = document.getElementById('horas-proyecto').value;
  const horas = document.getElementById('horas-cantidad').value;
  const descripcion = document.getElementById('horas-descripcion').value;

  if (!proyectoId) {
    mostrarMensaje('msg-horas', 'Selecciona un proyecto', true);
    return;
  }

  try {
    const data = await api('/horas', {
      method: 'POST',
      body: { proyectoId: Number(proyectoId), horas: Number(horas), descripcion: descripcion },
    });
    mostrarMensaje('msg-horas', 'Horas registradas correctamente. Total del proyecto: ' + Number(data.proyecto.horasTotales) + ' hrs', false);
    document.getElementById('horas-cantidad').value = '';
    document.getElementById('horas-descripcion').value = '';
  } catch (err) {
    mostrarMensaje('msg-horas', err.message, true);
  }
}

// ---------------------------------------------------------------------------
// Mis registros de horas
// ---------------------------------------------------------------------------
async function cargarMisHoras() {
  const contenedor = document.getElementById('tabla-mis-horas');
  contenedor.innerHTML = 'Cargando...';

  try {
    const registros = await api('/horas/mis-registros');

    if (registros.length === 0) {
      contenedor.innerHTML = '<div class="vacio">No has registrado horas todavía.</div>';
      return;
    }

    let html = '<table><thead><tr><th>Proyecto</th><th>Horas</th><th>Descripción</th><th>Fecha</th></tr></thead><tbody>';
    for (let i = 0; i < registros.length; i++) {
      const r = registros[i];
      const fecha = r.registradoEn ? new Date(r.registradoEn).toLocaleDateString('es-CL') : '—';
      html += '<tr><td>' + (r.proyecto ? r.proyecto.nombre : '—') + '</td>' +
        '<td>' + r.horas + '</td>' +
        '<td>' + (r.descripcion || '—') + '</td>' +
        '<td>' + fecha + '</td></tr>';
    }
    html += '</tbody></table>';
    contenedor.innerHTML = html;
  } catch (err) {
    contenedor.innerHTML = '<div class="msg msg-error">' + err.message + '</div>';
  }
}

// ---------------------------------------------------------------------------
// Horas por proyecto (admin, encargado_cuadrillas)
// ---------------------------------------------------------------------------
async function cargarHorasProyecto() {
  const contenedor = document.getElementById('tabla-horas-proyecto');
  contenedor.innerHTML = 'Cargando...';

  try {
    const proyectos = await api('/horas/proyectos');

    if (proyectos.length === 0) {
      contenedor.innerHTML = '<div class="vacio">No hay proyectos registrados.</div>';
      return;
    }

    let html = '<table><thead><tr><th>Proyecto</th><th>Estado</th><th>Horas totales</th><th></th></tr></thead><tbody>';
    for (let i = 0; i < proyectos.length; i++) {
      const p = proyectos[i];
      html += '<tr><td>' + p.nombre + '</td>' +
        '<td><span class="badge badge-mid">' + p.estado + '</span></td>' +
        '<td><strong>' + (p.horasTotales || 0) + '</strong> hrs</td>' +
        '<td><button class="btn btn-ghost btn-sm" onclick="verDetalleHoras(' + p.id + ')">Ver detalle</button></td></tr>';
    }
    html += '</tbody></table>';
    contenedor.innerHTML = html;
  } catch (err) {
    contenedor.innerHTML = '<div class="msg msg-error">' + err.message + '</div>';
  }
}

// Muestra el detalle de horas de un proyecto
async function verDetalleHoras(proyectoId) {
  const contenedor = document.getElementById('tabla-horas-proyecto');

  try {
    const data = await api('/horas/proyecto/' + proyectoId);
    let html = '<button class="btn btn-ghost btn-sm" onclick="cargarHorasProyecto()" style="margin-bottom:12px;">← Volver</button>';

    html += '<div class="card" style="margin-bottom:16px;"><strong>Total: ' + data.totalHoras + ' hrs</strong></div>';

    if (data.registros.length === 0) {
      html += '<div class="vacio">Sin registros.</div>';
    } else {
      html += '<table><thead><tr><th>Usuario</th><th>Horas</th><th>Descripción</th><th>Fecha</th></tr></thead><tbody>';
      for (let i = 0; i < data.registros.length; i++) {
        const r = data.registros[i];
        const nombre = r.usuario ? r.usuario.nombre : '—';
        const fecha = r.registradoEn ? new Date(r.registradoEn).toLocaleDateString('es-CL') : '—';
        html += '<tr><td>' + nombre + '</td><td>' + r.horas + '</td><td>' + (r.descripcion || '—') + '</td><td>' + fecha + '</td></tr>';
      }
      html += '</tbody></table>';
    }

    contenedor.innerHTML = html;
  } catch (err) {
    contenedor.innerHTML = '<div class="msg msg-error">' + err.message + '</div>';
  }
}

// ---------------------------------------------------------------------------
// Mis donaciones (visitante)
// ---------------------------------------------------------------------------
async function cargarMisDonaciones() {
  const contenedor = document.getElementById('tabla-mis-donaciones');
  contenedor.innerHTML = 'Cargando...';

  try {
    const donaciones = await api('/donaciones/mis-donaciones');

    if (donaciones.length === 0) {
      contenedor.innerHTML = '<div class="vacio">Todavía no has hecho ninguna donación.</div>';
      return;
    }

    const tienePendiente = donaciones.some(function (d) { return d.estado === 'pendiente'; });

    let html = '<table><thead><tr><th>Monto</th><th>Método</th><th>Estado</th><th>Fecha</th></tr></thead><tbody>';
    for (let i = 0; i < donaciones.length; i++) {
      const d = donaciones[i];
      const colorBadge = d.estado === 'confirmada' ? 'badge-ok' : (d.estado === 'rechazada' ? 'badge-warn' : 'badge-mid');

      let estadoTexto = d.estado;
      if (d.estado === 'confirmada') estadoTexto = 'Recibida con éxito';
      if (d.estado === 'rechazada') estadoTexto = 'Rechazada';
      if (d.estado === 'pendiente') estadoTexto = 'Pendiente de revisión';

      const fecha = d.creadoEn ? new Date(d.creadoEn).toLocaleDateString('es-CL') : '—';

      html += '<tr><td>$' + Number(d.monto).toLocaleString('es-CL') + '</td>' +
        '<td>' + (d.metodoPago || '—') + '</td>' +
        '<td><span class="badge ' + colorBadge + '">' + estadoTexto + '</span></td>' +
        '<td>' + fecha + '</td></tr>';
    }
    html += '</tbody></table>';

    if (tienePendiente) {
      html = '<div class="msg msg-info">Tienes una donación pendiente de revisión. Espera a que sea confirmada para realizar otra.</div>' + html;
    }

    contenedor.innerHTML = html;
  } catch (err) {
    contenedor.innerHTML = '<div class="msg msg-error">' + err.message + '</div>';
  }
}

// ---------------------------------------------------------------------------
// Usuarios (solo admin)
// ---------------------------------------------------------------------------
async function cargarUsuarios() {
  const contenedor = document.getElementById('tabla-usuarios');
  contenedor.innerHTML = 'Cargando...';

  try {
    const usuarios = await api('/usuarios');

    if (usuarios.length === 0) {
      contenedor.innerHTML = '<div class="vacio">No hay usuarios.</div>';
      return;
    }

    let html = '<table><thead><tr><th>Nombre</th><th>Rol</th><th>Estado</th><th></th></tr></thead><tbody>';
    for (let i = 0; i < usuarios.length; i++) {
      const u = usuarios[i];
      const colorBadge = u.activo ? 'badge-ok' : 'badge-warn';
      const textoEstado = u.activo ? 'activo' : 'inactivo';
      const textoBoton = u.activo ? 'Desactivar' : 'Activar';
      html += '<tr><td>' + u.nombre + '</td><td>' + nombreDelRol(u.rol) + '</td>' +
        '<td><span class="badge ' + colorBadge + '">' + textoEstado + '</span></td>' +
        '<td><button class="btn btn-ghost btn-sm" onclick="cambiarActivoUsuario(' + u.id + ', ' + u.activo + ')">' + textoBoton + '</button></td></tr>';
    }
    html += '</tbody></table>';
    contenedor.innerHTML = html;
  } catch (err) {
    contenedor.innerHTML = '<div class="msg msg-error">' + err.message + '</div>';
  }
}

async function cambiarActivoUsuario(id, activoActual) {
  try {
    await api('/usuarios/' + id, { method: 'PATCH', body: { activo: !activoActual } });
    cargarUsuarios();
  } catch (err) {
    mostrarMensaje('msg-usuarios', err.message, true);
  }
}

async function crearUsuario(e) {
  e.preventDefault();
  const nombre = document.getElementById('nu-nombre').value;
  const email = document.getElementById('nu-email').value;
  const password = document.getElementById('nu-password').value;
  const rol = document.getElementById('nu-rol').value;

  try {
    await api('/usuarios', { method: 'POST', body: { nombre: nombre, email: email, password: password, rol: rol } });
    mostrarMensaje('msg-usuarios', 'Usuario creado.', false);
    e.target.reset();
    cargarUsuarios();
  } catch (err) {
    mostrarMensaje('msg-usuarios', err.message, true);
  }
}