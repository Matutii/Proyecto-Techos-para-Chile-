const COLORES = {
  // Stock
  Disponible: '#1a7f37',
  Bajo_Stock: '#9a6700',
  Agotado: '#cf222e',
  En_camino: '#0969da',
  // Voluntarios
  Pendiente: '#9a6700',
  Activo: '#1a7f37',
  Rechazado: '#cf222e',
  // Donaciones
  pendiente: '#9a6700',
  confirmada: '#1a7f37',
  rechazada: '#cf222e',
  // Cuadrillas
  En_formacion: '#9a6700',
  Lista_para_asignacion: '#1a7f37',
  Disuelta: '#57606a',
};

export function EstadoBadge({ estado }) {
  const color = COLORES[estado] || '#57606a';

  return (
    <span
      className="badge"
      style={{ backgroundColor: `${color}1a`, color, borderColor: color }}
    >
      {estado?.replaceAll('_', ' ')}
    </span>
  );
}
