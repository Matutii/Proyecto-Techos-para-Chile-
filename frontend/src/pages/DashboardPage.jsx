import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { voluntariosApi } from '../api/voluntarios.api';
import { stockApi } from '../api/stock.api';
import { cuadrillasApi } from '../api/cuadrillas.api';
import { donacionesApi } from '../api/donaciones.api';
import { LoadingState } from '../components/common/LoadingState';
import { RoleGate } from '../components/common/RoleGate';

export function DashboardPage() {
  const { token, puedeGestionar } = useAuth();
  const puedeVerDonaciones = puedeGestionar();
  const [conteos, setConteos] = useState(null);
  const [errores, setErrores] = useState({});
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let activo = true;

    async function cargar() {
      const promesas = [
        voluntariosApi.listar(token),
        stockApi.listar(token),
        cuadrillasApi.listar(token),
        puedeVerDonaciones ? donacionesApi.listar(token) : Promise.resolve(null),
      ];

      const resultados = await Promise.allSettled(promesas);

      if (!activo) return;

      const [voluntarios, stock, cuadrillas, donaciones] = resultados;
      const nuevosErrores = {};

      const contarOMarcarError = (resultado, clave) => {
        if (resultado.status === 'fulfilled') {
          return resultado.value === null ? null : resultado.value.length;
        }
        nuevosErrores[clave] = resultado.reason?.message || 'No disponible';
        return null;
      };

      setConteos({
        voluntarios: contarOMarcarError(voluntarios, 'voluntarios'),
        materiales: contarOMarcarError(stock, 'materiales'),
        cuadrillas: contarOMarcarError(cuadrillas, 'cuadrillas'),
        donaciones: contarOMarcarError(donaciones, 'donaciones'),
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

  return (
    <div>
      <h1>Dashboard</h1>
      <div className="cards-resumen">
        <div className="card">
          <div className="card-valor">{conteos.voluntarios ?? '—'}</div>
          <div className="card-etiqueta">Voluntarios</div>
          {errores.voluntarios && <div className="estado-error">{errores.voluntarios}</div>}
        </div>

        <div className="card">
          <div className="card-valor">{conteos.materiales ?? '—'}</div>
          <div className="card-etiqueta">Materiales</div>
          {errores.materiales && <div className="estado-error">{errores.materiales}</div>}
        </div>

        <div className="card">
          <div className="card-valor">{conteos.cuadrillas ?? '—'}</div>
          <div className="card-etiqueta">Cuadrillas</div>
          {errores.cuadrillas && <div className="estado-error">{errores.cuadrillas}</div>}
        </div>

        <RoleGate>
          <div className="card">
            <div className="card-valor">{conteos.donaciones ?? '—'}</div>
            <div className="card-etiqueta">Donaciones</div>
            {errores.donaciones && <div className="estado-error">{errores.donaciones}</div>}
          </div>
        </RoleGate>
      </div>
    </div>
  );
}
