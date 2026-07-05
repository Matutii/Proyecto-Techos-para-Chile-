export function ErrorState({ error }) {
  if (!error) return null;

  const mensaje = typeof error === 'string' ? error : error.message || 'Ocurrió un error';

  return <p className="estado-error">{mensaje}</p>;
}
