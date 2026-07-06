import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Truck,
  Clock,
  Users,
  Ban,
} from 'lucide-react';

const ESTILOS = {
  // Stock
  Disponible: { color: '#1a7f37', Icono: CheckCircle2 },
  Bajo_Stock: { color: '#9a6700', Icono: AlertTriangle },
  Agotado: { color: '#cf222e', Icono: XCircle },
  En_camino: { color: '#0969da', Icono: Truck },
  // Voluntarios
  Pendiente: { color: '#9a6700', Icono: Clock },
  Activo: { color: '#1a7f37', Icono: CheckCircle2 },
  Rechazado: { color: '#cf222e', Icono: XCircle },
  // Donaciones
  pendiente: { color: '#9a6700', Icono: Clock },
  confirmada: { color: '#1a7f37', Icono: CheckCircle2 },
  rechazada: { color: '#cf222e', Icono: XCircle },
  // Cuadrillas
  En_formacion: { color: '#9a6700', Icono: Users },
  Lista_para_asignacion: { color: '#1a7f37', Icono: CheckCircle2 },
  Disuelta: { color: '#57606a', Icono: Ban },
};

export function EstadoBadge({ estado }) {
  const { color, Icono } = ESTILOS[estado] || { color: '#57606a', Icono: null };

  return (
    <span
      className="badge"
      style={{ backgroundColor: `${color}1a`, color, borderColor: color }}
    >
      {Icono && <Icono size={13} strokeWidth={2.5} aria-hidden="true" />}
      {estado?.replaceAll('_', ' ')}
    </span>
  );
}
