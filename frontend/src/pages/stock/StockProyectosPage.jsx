import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { stockApi } from '../../api/stock.api';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';

export function StockProyectosPage() {
  const { token } = useAuth();
  const [proyectos, setProyectos] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    stockApi
      .vistaPorProyectos(token)
      .then((datos) => setProyectos(datos.proyectos))
      .catch(setError);
  }, [token]);

  return (
    <div>
      <Link to="/stock">&larr; Volver a Stock</Link>
      <h1>Stock por proyecto</h1>

      <ErrorState error={error} />

      {proyectos === null ? (
        <LoadingState />
      ) : (
        <div className="cards-resumen">
          {proyectos.map((p) => (
            <div className="card" key={p.id}>
              <h3>{p.nombre}</h3>
              <p>Disponibles: {p.disponibles}</p>
              <p>Bajo stock: {p.bajoStock}</p>
              <p>Agotados: {p.agotados}</p>
              <p>En camino: {p.enCamino}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
