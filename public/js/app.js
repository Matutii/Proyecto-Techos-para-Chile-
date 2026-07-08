// Este archivo controla toda la página: login, registro, donar,
// y el panel de cada rol después de iniciar sesión.

// Cuando carga la página, si ya había una sesión guardada, la validamos contra
// el backend antes de entrar (un token guardado por otra corrida de la app en
// este mismo puerto, con otro JWT_SECRET, no debe darse por válido a ciegas).
document.addEventListener('DOMContentLoaded', async function () {
  cablearTabs();
  cablearFormularios();

  const usuario = Sesion.usuario();
  if (usuario && Sesion.token()) {
    try {
      await api('/auth/perfil');
      entrarAlApp(usuario);
    } catch (err) {
      Sesion.salir();
    }
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
      document.getElementById('form-donar-publico').classList.toggle('oculto', tab !== 'donar');
      document.getElementById('form-voluntario').classList.toggle('oculto', tab !== 'voluntario');
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

  document.getElementById('form-donar-publico').addEventListener('submit', async function (e) {
    e.preventDefault();
    const nombre = document.getElementById('don-nombre').value;
    const email = document.getElementById('don-email').value;
    const monto = document.getElementById('don-monto').value;
    const metodo = document.getElementById('don-metodo').value;

    try {
      await api('/donaciones', {
        method: 'POST',
        auth: false,
        body: { donanteNombre: nombre, donanteEmail: email, monto: Number(monto), metodoPago: metodo },
      });
      mostrarMensaje('msg-auth', '¡Gracias por tu donación!', false);
      e.target.reset();
    } catch (err) {
      mostrarMensaje('msg-auth', err.message, true);
    }
  });

  document.getElementById('form-voluntario').addEventListener('submit', async function (e) {
    e.preventDefault();
    const experiencia = document.getElementById('vol-experiencia').value;

    try {
      await api('/voluntarios/inscripcion', {
        method: 'POST',
        auth: false,
        body: {
          nombre: document.getElementById('vol-nombre').value,
          apellido: document.getElementById('vol-apellido').value,
          email: document.getElementById('vol-email').value,
          telefono: document.getElementById('vol-telefono').value || undefined,
          datosMedicos: document.getElementById('vol-datos-medicos').value,
          contactoEmergenciaNombre: document.getElementById('vol-contacto-nombre').value,
          contactoEmergenciaTelefono: document.getElementById('vol-contacto-telefono').value,
          terminosAceptados: document.getElementById('vol-terminos').checked,
          experienciaAnos: experiencia === '' ? undefined : Number(experiencia),
          habilidades: document.getElementById('vol-habilidades').value || undefined,
        },
      });
      mostrarMensaje('msg-auth', '¡Gracias por inscribirte! Tu postulación quedó registrada.', false);
      e.target.reset();
    } catch (err) {
      mostrarMensaje('msg-auth', err.message, true);
    }
  });

  document.getElementById('btn-salir').addEventListener('click', function () {
    Sesion.salir();
    window.location.reload();
  });

  document.getElementById('form-material').addEventListener('submit', crearMaterial);
  document.getElementById('form-entrada').addEventListener('submit', registrarEntrada);
  document.getElementById('form-asignar').addEventListener('submit', asignarAProyecto);
  document.getElementById('form-cuadrilla').addEventListener('submit', crearCuadrilla);
  document.getElementById('form-editar-cuadrilla').addEventListener('submit', editarCuadrilla);
  document.getElementById('form-agregar-voluntario').addEventListener('submit', agregarVoluntarioACuadrilla);
  document.getElementById('form-nuevo-usuario').addEventListener('submit', crearUsuario);
  document.getElementById('form-donar-app').addEventListener('submit', donarDesdeApp);

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
    agregarBotonNav(nav, 'Stock por proyecto', 'stock-proyectos');
    agregarBotonNav(nav, 'Proyectos', 'proyectos');
    agregarBotonNav(nav, 'Cuadrillas', 'cuadrillas');
    agregarBotonNav(nav, 'Voluntarios', 'voluntarios');
    agregarBotonNav(nav, 'Donaciones', 'donaciones');
  } else if (rol === 'coordinador_logistica') {
    agregarBotonNav(nav, 'Bodega', 'bodega');
    agregarBotonNav(nav, 'Stock por proyecto', 'stock-proyectos');
    agregarBotonNav(nav, 'Proyectos', 'proyectos');
    agregarBotonNav(nav, 'Donaciones', 'donaciones');
  } else if (rol === 'colaborador') {
    agregarBotonNav(nav, 'Bodega', 'bodega');
  } else if (rol === 'encargado_cuadrillas') {
    agregarBotonNav(nav, 'Cuadrillas', 'cuadrillas');
    agregarBotonNav(nav, 'Voluntarios', 'voluntarios');
  } else if (rol === 'visitante') {
    agregarBotonNav(nav, 'Donar', 'donar');
  }

  // El panel de bodega se ve distinto para colaborador (solo retira, no crea ni asigna materiales)
  const esColaborador = rol === 'colaborador';
  document.getElementById('bloque-crear-material').classList.toggle('oculto', esColaborador);
  document.getElementById('bloque-acciones-bodega').classList.toggle('oculto', esColaborador);
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
  if (idPanel === 'bodega') { cargarStock(''); cargarProyectosParaAsignar(); }
  if (idPanel === 'stock-proyectos') cargarStockPorProyectos();
  if (idPanel === 'proyectos') cargarProyectos();
  if (idPanel === 'cuadrillas') cargarCuadrillas();
  if (idPanel === 'voluntarios') cargarVoluntarios();
  if (idPanel === 'donaciones') cargarDonaciones();
}

// ---------------------------------------------------------------------------
// Bodega
// ---------------------------------------------------------------------------
let ultimosMateriales = [];

async function cargarStock(estado) {
  const contenedor = document.getElementById('tabla-stock');
  contenedor.innerHTML = 'Cargando...';

  try {
    const ruta = estado ? '/stock?estado=' + estado : '/stock';
    const materiales = await api(ruta);
    ultimosMateriales = materiales;
    poblarSelectsDeMaterial(materiales);

    if (materiales.length === 0) {
      contenedor.innerHTML = '<div class="vacio">No hay materiales para mostrar.</div>';
      return;
    }

    const rol = Sesion.usuario().rol;
    let html = '<table><thead><tr><th>Material</th><th>Cantidad</th><th>Umbral</th><th>Estado</th><th></th></tr></thead><tbody>';

    for (let i = 0; i < materiales.length; i++) {
      const m = materiales[i];

      let colorBadge = 'badge-mid';
      if (m.estado === 'Disponible') colorBadge = 'badge-ok';
      if (m.estado === 'Agotado') colorBadge = 'badge-warn';
      if (m.estado === 'Bajo_Stock') colorBadge = 'badge-yellow';

      let acciones = '—';
      if (rol === 'colaborador') {
        acciones = '<button class="btn btn-ghost btn-sm" onclick="retirarMaterial(' + m.id + ')">Retirar</button>';
      } else if (rol === 'admin' || rol === 'coordinador_logistica') {
        acciones =
          '<label style="font-size:12px;"><input type="checkbox" onchange="toggleEnCamino(' + m.id + ', this.checked)"' +
          (m.enCaminoManual ? ' checked' : '') + '> En camino</label>';
      }

      html += '<tr><td>' + m.nombre + '</td>' +
        '<td>' + m.cantidadDisponible + '</td>' +
        '<td>' + m.umbralBajoStock + '</td>' +
        '<td><span class="badge ' + colorBadge + '">' + m.estado.replace('_', ' ') + '</span></td>' +
        '<td>' + acciones + '</td></tr>';
    }

    html += '</tbody></table>';
    contenedor.innerHTML = html;
  } catch (err) {
    contenedor.innerHTML = '<div class="msg msg-error">' + err.message + '</div>';
  }
}

function poblarSelectsDeMaterial(materiales) {
  const selects = [document.getElementById('ent-material-id'), document.getElementById('asig-material-id')];
  for (let s = 0; s < selects.length; s++) {
    const select = selects[s];
    if (!select) continue;
    select.innerHTML = '';
    for (let i = 0; i < materiales.length; i++) {
      const opt = document.createElement('option');
      opt.value = materiales[i].id;
      opt.textContent = materiales[i].nombre;
      select.appendChild(opt);
    }
  }
}

async function cargarProyectosParaAsignar() {
  const select = document.getElementById('asig-proyecto-id');
  if (!select) return;
  try {
    const proyectos = await api('/proyectos');
    select.innerHTML = '';
    for (let i = 0; i < proyectos.length; i++) {
      const opt = document.createElement('option');
      opt.value = proyectos[i].id;
      opt.textContent = proyectos[i].nombre;
      select.appendChild(opt);
    }
  } catch (err) {
    select.innerHTML = '';
  }
}

async function retirarMaterial(id) {
  const cantidad = prompt('¿Cuántas unidades quieres retirar?');
  if (!cantidad) return;

  try {
    await api('/stock/' + id + '/retiro', { method: 'PATCH', body: { cantidad: Number(cantidad), observacion: 'Retiro desde la plataforma' } });
    cargarStock('');
    mostrarMensaje('msg-stock', 'Retiro registrado.', false);
  } catch (err) {
    mostrarMensaje('msg-stock', err.message, true);
  }
}

async function toggleEnCamino(id, enCaminoManual) {
  try {
    await api('/stock/' + id + '/en-camino', { method: 'PATCH', body: { enCaminoManual: enCaminoManual } });
    cargarStock('');
  } catch (err) {
    mostrarMensaje('msg-stock', err.message, true);
  }
}

async function crearMaterial(e) {
  e.preventDefault();
  const nombre = document.getElementById('mat-nombre').value;
  const descripcion = document.getElementById('mat-desc').value;
  const cantidadDisponible = document.getElementById('mat-cantidad').value;
  const umbralBajoStock = document.getElementById('mat-umbral').value;

  try {
    await api('/stock', {
      method: 'POST',
      body: {
        nombre: nombre,
        descripcion: descripcion,
        cantidadDisponible: cantidadDisponible === '' ? undefined : Number(cantidadDisponible),
        umbralBajoStock: Number(umbralBajoStock),
      },
    });
    mostrarMensaje('msg-material', 'Material agregado.', false);
    e.target.reset();
    cargarStock('');
  } catch (err) {
    mostrarMensaje('msg-material', err.message, true);
  }
}

async function registrarEntrada(e) {
  e.preventDefault();
  const materialId = document.getElementById('ent-material-id').value;
  const cantidad = document.getElementById('ent-cantidad').value;
  const observacion = document.getElementById('ent-observacion').value;

  try {
    await api('/stock/' + materialId + '/entrada', {
      method: 'POST',
      body: { cantidad: Number(cantidad), observacion: observacion || undefined },
    });
    mostrarMensaje('msg-entrada', 'Entrada registrada.', false);
    e.target.reset();
    cargarStock('');
  } catch (err) {
    mostrarMensaje('msg-entrada', err.message, true);
  }
}

async function asignarAProyecto(e) {
  e.preventDefault();
  const materialId = document.getElementById('asig-material-id').value;
  const proyectoId = document.getElementById('asig-proyecto-id').value;
  const cantidad = document.getElementById('asig-cantidad').value;

  try {
    await api('/stock/' + materialId + '/asignar', {
      method: 'POST',
      body: { proyectoId: Number(proyectoId), cantidad: Number(cantidad) },
    });
    mostrarMensaje('msg-asignar', 'Material asignado al proyecto.', false);
    e.target.reset();
    cargarStock('');
  } catch (err) {
    mostrarMensaje('msg-asignar', err.message, true);
  }
}

async function cargarStockPorProyectos() {
  const contenedor = document.getElementById('tabla-stock-proyectos');
  contenedor.innerHTML = 'Cargando...';

  try {
    const data = await api('/stock/proyectos');
    const proyectos = data.proyectos;

    if (proyectos.length === 0) {
      contenedor.innerHTML = '<div class="vacio">No hay proyectos registrados.</div>';
      return;
    }

    let html = '<table><thead><tr><th>Proyecto</th><th>Disponibles</th><th>Bajo stock</th><th>Agotados</th><th>En camino</th></tr></thead><tbody>';
    for (let i = 0; i < proyectos.length; i++) {
      const p = proyectos[i];
      html += '<tr><td>' + p.nombre + '</td><td>' + p.disponibles + '</td><td>' + p.bajoStock + '</td>' +
        '<td>' + p.agotados + '</td><td>' + p.enCamino + '</td></tr>';
    }
    html += '</tbody></table>';
    contenedor.innerHTML = html;
  } catch (err) {
    contenedor.innerHTML = '<div class="msg msg-error">' + err.message + '</div>';
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

    let html = '<table><thead><tr><th>Nombre</th><th>Especialidad</th><th>Estado</th><th>Voluntarios</th><th></th></tr></thead><tbody>';
    for (let i = 0; i < cuadrillas.length; i++) {
      const c = cuadrillas[i];
      const cantidadVoluntarios = c.voluntarios ? c.voluntarios.length : 0;
      html += '<tr><td>' + c.nombre + '</td><td>' + c.especialidad + '</td>' +
        '<td><span class="badge badge-mid">' + c.estado + '</span></td>' +
        '<td>' + cantidadVoluntarios + '</td>' +
        '<td><button class="btn btn-ghost btn-sm" onclick="verDetalleCuadrilla(' + c.id + ')">Ver detalle</button></td></tr>';
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
// Detalle de cuadrilla: voluntarios asignados, edición, agregar voluntario
// ---------------------------------------------------------------------------
let cuadrillaSeleccionadaId = null;

async function verDetalleCuadrilla(id) {
  cuadrillaSeleccionadaId = id;
  const bloque = document.getElementById('bloque-detalle-cuadrilla');
  bloque.classList.remove('oculto');

  try {
    const c = await api('/cuadrillas/' + id);

    document.getElementById('detalle-cuadrilla-titulo').textContent = c.nombre;
    document.getElementById('ecu-nombre').value = c.nombre;
    document.getElementById('ecu-especialidad').value = c.especialidad;
    document.getElementById('ecu-estado').value = c.estado;

    const asignaciones = c.voluntarios || [];
    const contenedor = document.getElementById('tabla-voluntarios-cuadrilla');
    if (asignaciones.length === 0) {
      contenedor.innerHTML = '<div class="vacio">Todavía no hay voluntarios en esta cuadrilla.</div>';
    } else {
      let html = '<table><thead><tr><th>Nombre</th><th>Email</th></tr></thead><tbody>';
      for (let i = 0; i < asignaciones.length; i++) {
        const v = asignaciones[i].voluntario;
        if (!v) continue;
        html += '<tr><td>' + v.nombre + ' ' + v.apellido + '</td><td>' + v.email + '</td></tr>';
      }
      html += '</tbody></table>';
      contenedor.innerHTML = html;
    }

    await poblarSelectVoluntariosDisponibles(asignaciones);
  } catch (err) {
    mostrarMensaje('msg-detalle-cuadrilla', err.message, true);
  }
}

async function poblarSelectVoluntariosDisponibles(asignaciones) {
  const select = document.getElementById('agv-voluntario-id');
  select.innerHTML = '';

  try {
    const voluntarios = await api('/voluntarios');
    const idsAsignados = asignaciones.map(function (a) { return a.voluntarioId; });

    for (let i = 0; i < voluntarios.length; i++) {
      const v = voluntarios[i];
      if (idsAsignados.indexOf(v.id) !== -1) continue;
      const opt = document.createElement('option');
      opt.value = v.id;
      opt.textContent = v.nombre + ' ' + v.apellido;
      select.appendChild(opt);
    }
  } catch (err) {
    // si no se pueden cargar los voluntarios, el select queda vacío
  }
}

async function editarCuadrilla(e) {
  e.preventDefault();
  if (!cuadrillaSeleccionadaId) return;

  try {
    await api('/cuadrillas/' + cuadrillaSeleccionadaId, {
      method: 'PUT',
      body: {
        nombre: document.getElementById('ecu-nombre').value,
        especialidad: document.getElementById('ecu-especialidad').value,
        estado: document.getElementById('ecu-estado').value,
      },
    });
    mostrarMensaje('msg-detalle-cuadrilla', 'Cuadrilla actualizada.', false);
    cargarCuadrillas();
    verDetalleCuadrilla(cuadrillaSeleccionadaId);
  } catch (err) {
    mostrarMensaje('msg-detalle-cuadrilla', err.message, true);
  }
}

async function agregarVoluntarioACuadrilla(e) {
  e.preventDefault();
  if (!cuadrillaSeleccionadaId) return;

  const voluntarioId = document.getElementById('agv-voluntario-id').value;
  if (!voluntarioId) return;

  try {
    await api('/cuadrillas/' + cuadrillaSeleccionadaId + '/voluntarios', {
      method: 'POST',
      body: { voluntarioId: Number(voluntarioId) },
    });
    mostrarMensaje('msg-detalle-cuadrilla', 'Voluntario agregado.', false);
    cargarCuadrillas();
    verDetalleCuadrilla(cuadrillaSeleccionadaId);
  } catch (err) {
    mostrarMensaje('msg-detalle-cuadrilla', err.message, true);
  }
}

// ---------------------------------------------------------------------------
// Proyectos (solo lectura)
// ---------------------------------------------------------------------------
async function cargarProyectos() {
  const contenedor = document.getElementById('tabla-proyectos');
  contenedor.innerHTML = 'Cargando...';

  try {
    const proyectos = await api('/proyectos');

    if (proyectos.length === 0) {
      contenedor.innerHTML = '<div class="vacio">Todavía no hay proyectos registrados.</div>';
      return;
    }

    let html = '<table><thead><tr><th>Nombre</th><th>Descripción</th><th>Estado</th></tr></thead><tbody>';
    for (let i = 0; i < proyectos.length; i++) {
      const p = proyectos[i];
      html += '<tr><td>' + p.nombre + '</td><td>' + (p.descripcion || '—') + '</td>' +
        '<td><span class="badge badge-mid">' + p.estado + '</span></td></tr>';
    }
    html += '</tbody></table>';
    contenedor.innerHTML = html;
  } catch (err) {
    contenedor.innerHTML = '<div class="msg msg-error">' + err.message + '</div>';
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

    let html = '<table><thead><tr><th>Donante</th><th>Monto</th><th>Método</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>';
    for (let i = 0; i < donaciones.length; i++) {
      const d = donaciones[i];
      const nombreDonante = d.donanteNombre || 'Anónimo';
      const colorBadge = d.estado === 'confirmada' ? 'badge-ok' : (d.estado === 'rechazada' ? 'badge-warn' : 'badge-mid');

      let acciones = '—';
      if (d.estado === 'pendiente') {
        acciones = '<button class="btn btn-ghost btn-sm" onclick="cambiarEstadoDonacion(' + d.id + ', \'confirmada\')">Aceptar</button> ' +
          '<button class="btn btn-ghost btn-sm" onclick="cambiarEstadoDonacion(' + d.id + ', \'rechazada\')">Rechazar</button>';
      }

      html += '<tr><td>' + nombreDonante + '</td><td>$' + Number(d.monto).toLocaleString('es-CL') + '</td>' +
        '<td>' + (d.metodoPago || '—') + '</td>' +
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

  try {
    await api('/donaciones', { method: 'POST', body: { monto: Number(monto), metodoPago: metodo } });
    mostrarMensaje('msg-donar-app', '¡Gracias por tu donación!', false);
    e.target.reset();
  } catch (err) {
    mostrarMensaje('msg-donar-app', err.message, true);
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