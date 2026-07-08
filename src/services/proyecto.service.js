const { AppDataSource } = require('../config/configDb.mjs');

const proyectoRepo = () => AppDataSource.getRepository('Proyecto');

function errorNoEncontrado(mensaje) {
  const err = new Error(mensaje);
  err.status = 404;
  return err;
}

// Lista todos los proyectos ordenados por nombre
async function listarProyectos() {
  return await proyectoRepo().find({
    order: { nombre: 'ASC' },
  });
}

// Crea un nuevo proyecto
async function crearProyecto(datos) {
  return await proyectoRepo().save({
    nombre: datos.nombre,
    descripcion: datos.descripcion || null,
    estado: datos.estado || 'activo',
  });
}

// Actualiza nombre, descripción y/o estado de un proyecto existente
async function actualizarProyecto(id, datos) {
  const proyecto = await proyectoRepo().findOne({ where: { id: Number(id) } });

  if (!proyecto) {
    throw errorNoEncontrado('Proyecto no encontrado');
  }

  if (datos.nombre !== undefined) proyecto.nombre = datos.nombre;
  if (datos.descripcion !== undefined) proyecto.descripcion = datos.descripcion;
  if (datos.estado !== undefined) proyecto.estado = datos.estado;

  await proyectoRepo().save(proyecto);

  return proyecto;
}

module.exports = {
  listarProyectos,
  crearProyecto,
  actualizarProyecto,
};
