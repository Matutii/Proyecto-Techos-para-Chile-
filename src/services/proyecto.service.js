const { AppDataSource } = require('../config/configDb.mjs');

const proyectoRepo = () => AppDataSource.getRepository('Proyecto');

// Lista todos los proyectos ordenados por nombre
async function listarProyectos() {
  return await proyectoRepo().find({
    order: { nombre: 'ASC' },
  });
}

module.exports = {
  listarProyectos,
};
