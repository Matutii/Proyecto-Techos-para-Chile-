import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Package, HardHat, Heart, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { voluntariosApi } from '../api/voluntarios.api';
import { stockApi } from '../api/stock.api';
import { cuadrillasApi } from '../api/cuadrillas.api';
import { donacionesApi } from '../api/donaciones.api';
import { LoadingState } from '../components/common/LoadingState';
import { EstadoBadge } from '../components/common/EstadoBadge';
import { RoleGate } from '../components/common/RoleGate';

const COLOR_ESTADO = {
  Disponible: '#1a7f37',
  Bajo_Stock: '#9a6700',
  Agotado: '#cf222e',
  En_camino: '#0969da',
};

function formatearMonto(monto) {
  return Number(monto).toLocaleString('es-CL', { style: 'currency', currency: 'CLP' });
}

// Barra de progreso del material: el umbral queda anclado al 50% del ancho,
// así "por debajo de la mitad" se lee directamente como "bajo stock".
function BarraStock({ cantidad, umbral, estado }) {
  const pct = umbral > 0 ? Math.min(100, (cantidad / (umbral * 2)) * 100) : cantidad > 0 ? 100 : 0;
  const color = COLOR_ESTADO[estado] ?? '#57606a';

  return (
    <div className="barra-stock" role="img" aria-label={`${cantidad} unidades, umbral ${umbral}`}>
      <div className="barra-stock-relleno" style={{ width: `${pct}%`, background: color }} />
      <div className="barra-stock-umbral" title={`Umbral: ${umbral}`} />
    </div>
  );
}

// Sparkline del acumulado de donaciones confirmadas (una sola serie, azul de marca).
function SparklineDonaciones({ donaciones }) {
  const confirmadas = donaciones
    .filter((d) => d.estado === 'confirmada')
    .sort((a, b) => new Date(a.creadoEn) - new Date(b.creadoEn));

  if (confirmadas.length < 2) return null;

  let acumulado = 0;
  const puntos = confirmadas.map((d) => (acumulado += Number(d.monto)));

  const ancho = 220;
  const alto = 48;
  const max = puntos[puntos.length - 1];
  const paso = ancho / (puntos.length - 1);
  const coords = puntos.map((v, i) => [i * paso, alto - (v / max) * (alto - 6) - 3]);
  const linea = coords.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');

  return (
    <svg width={ancho} height={alto} className="sparkline" aria-hidden="true">
      <line x1="0" y1={alto - 1} x2={ancho} y2={alto - 1} stroke="#e3e8ee" strokeWidth="1" />
      <path d={linea} fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={coords[coords.length - 1][0]} cy={coords[coords.length - 1][1]} r="3.5" fill="#2563eb" stroke="#fff" strokeWidth="2" />
    </svg>
  );
}

export function DashboardPage() {
  const { token, usuario, puedeGestionar } = useAuth();
  const puedeVerDonaciones = puedeGestionar();
  const [datos, setDatos] = useState(null);
  const [errores, setErrores] = useState({});
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let activo = true;

    async function cargar() {
      const resultados = await Promise.allSettled([
        voluntariosApi.listar(token),
        stockApi.listar(token),
        cuadrillasApi.listar(token),
        puedeVerDonaciones ? donacionesApi.listar(token) : Promise.resolve(null),
      ]);

      if (!activo) return;

      const [voluntarios, stock, cuadrillas, donaciones] = resultados;
      const nuevosErrores = {};

      const valorOError = (resultado, clave) => {
        if (resultado.status === 'fulfilled') return resultado.value;
        nuevosErrores[clave] = resultado.reason?.message || 'No disponible';
        return null;
      };

      setDatos({
        voluntarios: valorOError(voluntarios, 'voluntarios'),
        materiales: valorOError(stock, 'materiales'),
        cuadrillas: valorOError(cuadrillas, 'cuadrillas'),
        donaciones: valorOError(donaciones, 'donaciones'),
      });
      setErrores(nuevosErrores);
      setCargando(false);
    }

    cargar();

    return () => {
      activo = false;
    };
  }, [token, puedeVerDonaciones]);

  if (cargando) return <LoadingState mensaje="Cargando resumen..." />;

  const { voluntarios, materiales, cuadrillas, donaciones } = datos;

  const voluntariosActivos = voluntarios?.filter((v) => v.estado === 'Activo').length ?? 0;
  const materialesCriticos = materiales?.filter((m) => m.estado === 'Bajo_Stock' || m.estado === 'Agotado') ?? [];
  const cuadrillasListas = cuadrillas?.filter((c) => c.estado === 'Lista_para_asignacion').length ?? 0;
  const donacionesPendientes = donaciones?.filter((d) => d.estado === 'pendiente').length ?? 0;
  const confirmadas = donaciones?.filter((d) => d.estado === 'confirmada') ?? [];
  const totalConfirmado = confirmadas.reduce((suma, d) => suma + Number(d.monto), 0);
  const ultimasDonaciones = donaciones?.slice(0, 5) ?? [];

  const fecha = new Date().toLocaleDateString('es-CL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const cards = [
    {
      to: '/voluntarios',
      clase: 'acento-verde',
      Icono: Users,
      valor: voluntarios?.length ?? '—',
      etiqueta: 'Voluntarios',
      sub: errores.voluntarios ?? `${voluntariosActivos} activos`,
    },
    {
      to: '/stock',
      clase: 'acento-azul',
      Icono: Package,
      valor: materiales?.length ?? '—',
      etiqueta: 'Materiales',
      sub:
        errores.materiales ??
        (materialesCriticos.length > 0 ? `${materialesCriticos.length} requieren atención` : 'Stock saludable'),
    },
    {
      to: '/cuadrillas',
      clase: 'acento-naranja',
      Icono: HardHat,
      valor: cuadrillas?.length ?? '—',
      etiqueta: 'Cuadrillas',
      sub: errores.cuadrillas ?? `${cuadrillasListas} listas para asignación`,
    },
  ];

  return (
    <div>
      <div className="dashboard-encabezado">
        <div>
          <h1>Hola, {usuario?.nombre?.split(' ')[0] ?? 'bienvenido'} 👋</h1>
          <p className="dashboard-fecha">{fecha}</p>
        </div>
      </div>

      <div className="cards-resumen">
        {cards.map(({ to, clase, Icono, valor, etiqueta, sub }) => (
          <Link key={to} to={to} className={`card stat-card ${clase}`}>
            <div className="stat-icono">
              <Icono size={20} strokeWidth={2} aria-hidden="true" />
            </div>
            <div className="card-valor">{valor}</div>
            <div className="card-etiqueta">{etiqueta}</div>
            <div className="stat-sub">{sub}</div>
          </Link>
        ))}

        <RoleGate>
          <Link to="/donaciones" className="card stat-card acento-violeta">
            <div className="stat-icono">
              <Heart size={20} strokeWidth={2} aria-hidden="true" />
            </div>
            <div className="card-valor">{donaciones?.length ?? '—'}</div>
            <div className="card-etiqueta">Donaciones</div>
            <div className="stat-sub">{errores.donaciones ?? `${donacionesPendientes} pendientes`}</div>
          </Link>
        </RoleGate>
      </div>

      <RoleGate>
        {donaciones !== null && (
          <section className="card panel panel-recaudacion">
            <div className="panel-encabezado">
              <h2>
                <TrendingUp size={17} strokeWidth={2.2} aria-hidden="true" /> Total recaudado (confirmado)
              </h2>
            </div>
            <div className="recaudacion-cuerpo">
              <div>
                <div className="recaudacion-monto">{formatearMonto(totalConfirmado)}</div>
                <p className="estado-info recaudacion-detalle">
                  {confirmadas.length} donación{confirmadas.length === 1 ? '' : 'es'} confirmada
                  {confirmadas.length === 1 ? '' : 's'}
                </p>
              </div>
              <SparklineDonaciones donaciones={donaciones} />
            </div>
          </section>
        )}
      </RoleGate>

      <div className="dashboard-paneles">
        <section className="card panel">
          <div className="panel-encabezado">
            <h2>Materiales que requieren atención</h2>
            <Link to="/stock" className="panel-link">
              Ver stock &rarr;
            </Link>
          </div>
          {materiales === null ? (
            <p className="estado-info">No disponible.</p>
          ) : materialesCriticos.length === 0 ? (
            <p className="estado-info">Todo en orden: ningún material en bajo stock ni agotado.</p>
          ) : (
            <ul className="panel-lista">
              {materialesCriticos.map((m) => (
                <li key={m.id} className="panel-item panel-item-material">
                  <div className="panel-item-info">
                    <Link to={`/stock/${m.id}`}>{m.nombre}</Link>
                    <span className="panel-item-detalle">
                      {m.cantidadDisponible} / umbral {m.umbralBajoStock}
                    </span>
                  </div>
                  <BarraStock cantidad={m.cantidadDisponible} umbral={m.umbralBajoStock} estado={m.estado} />
                  <EstadoBadge estado={m.estado} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <RoleGate>
          <section className="card panel">
            <div className="panel-encabezado">
              <h2>Últimas donaciones</h2>
              <Link to="/donaciones" className="panel-link">
                Ver todas &rarr;
              </Link>
            </div>
            {donaciones === null ? (
              <p className="estado-info">No disponible.</p>
            ) : ultimasDonaciones.length === 0 ? (
              <p className="estado-info">Todavía no hay donaciones registradas.</p>
            ) : (
              <ul className="panel-lista">
                {ultimasDonaciones.map((d) => (
                  <li key={d.id} className="panel-item">
                    <span>{d.donanteNombre ?? 'Anónimo'}</span>
                    <span className="panel-item-detalle">{formatearMonto(d.monto)}</span>
                    <EstadoBadge estado={d.estado} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </RoleGate>
      </div>
    </div>
  );
}
