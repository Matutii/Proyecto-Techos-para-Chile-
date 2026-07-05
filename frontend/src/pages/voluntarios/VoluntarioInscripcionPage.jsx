import { useState } from 'react';
import { voluntariosApi } from '../../api/voluntarios.api';
import { ErrorState } from '../../components/common/ErrorState';

const ESTADO_INICIAL = {
  nombre: '',
  apellido: '',
  email: '',
  telefono: '',
  datosMedicos: '',
  contactoEmergenciaNombre: '',
  contactoEmergenciaTelefono: '',
  terminosAceptados: false,
  experienciaAnos: '',
  habilidades: '',
};

export function VoluntarioInscripcionPage() {
  const [form, setForm] = useState(ESTADO_INICIAL);
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [exito, setExito] = useState(false);

  function actualizar(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      await voluntariosApi.inscribir({
        nombre: form.nombre,
        apellido: form.apellido,
        email: form.email,
        telefono: form.telefono || undefined,
        datosMedicos: form.datosMedicos,
        contactoEmergenciaNombre: form.contactoEmergenciaNombre,
        contactoEmergenciaTelefono: form.contactoEmergenciaTelefono,
        terminosAceptados: form.terminosAceptados,
        experienciaAnos: form.experienciaAnos === '' ? undefined : Number(form.experienciaAnos),
        habilidades: form.habilidades || undefined,
      });
      setExito(true);
      setForm(ESTADO_INICIAL);
    } catch (err) {
      setError(err);
    } finally {
      setEnviando(false);
    }
  }

  if (exito) {
    return (
      <div className="login-pantalla">
        <div className="login-card">
          <h1>¡Gracias por inscribirte!</h1>
          <p>Tu inscripción quedó registrada.</p>
          <button type="button" className="boton-primario" onClick={() => setExito(false)}>
            Inscribir otro voluntario
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="login-pantalla">
      <form className="login-card" onSubmit={handleSubmit} style={{ width: 420 }}>
        <h1>Inscripción de voluntarios</h1>

        <label htmlFor="nombre">Nombre</label>
        <input id="nombre" value={form.nombre} onChange={(e) => actualizar('nombre', e.target.value)} required minLength={3} maxLength={100} />

        <label htmlFor="apellido">Apellido</label>
        <input id="apellido" value={form.apellido} onChange={(e) => actualizar('apellido', e.target.value)} required minLength={3} maxLength={100} />

        <label htmlFor="email">Email</label>
        <input id="email" type="email" value={form.email} onChange={(e) => actualizar('email', e.target.value)} required />

        <label htmlFor="telefono">Teléfono (opcional)</label>
        <input id="telefono" value={form.telefono} onChange={(e) => actualizar('telefono', e.target.value)} minLength={6} maxLength={20} />

        <label htmlFor="datosMedicos">Datos médicos</label>
        <textarea
          id="datosMedicos"
          value={form.datosMedicos}
          onChange={(e) => actualizar('datosMedicos', e.target.value)}
          required
          minLength={5}
          maxLength={1000}
        />

        <label htmlFor="contactoNombre">Contacto de emergencia — nombre</label>
        <input
          id="contactoNombre"
          value={form.contactoEmergenciaNombre}
          onChange={(e) => actualizar('contactoEmergenciaNombre', e.target.value)}
          required
          minLength={3}
          maxLength={100}
        />

        <label htmlFor="contactoTelefono">Contacto de emergencia — teléfono</label>
        <input
          id="contactoTelefono"
          value={form.contactoEmergenciaTelefono}
          onChange={(e) => actualizar('contactoEmergenciaTelefono', e.target.value)}
          required
          minLength={6}
          maxLength={20}
        />

        <label htmlFor="experienciaAnos">Años de experiencia (opcional)</label>
        <input
          id="experienciaAnos"
          type="number"
          min={0}
          max={70}
          value={form.experienciaAnos}
          onChange={(e) => actualizar('experienciaAnos', e.target.value)}
        />

        <label htmlFor="habilidades">Habilidades (opcional)</label>
        <textarea
          id="habilidades"
          value={form.habilidades}
          onChange={(e) => actualizar('habilidades', e.target.value)}
          maxLength={1000}
        />

        <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
          <input
            type="checkbox"
            checked={form.terminosAceptados}
            onChange={(e) => actualizar('terminosAceptados', e.target.checked)}
            required
          />
          Acepto los términos y condiciones
        </label>

        <ErrorState error={error} />

        <button type="submit" className="boton-primario" disabled={enviando}>
          {enviando ? 'Enviando...' : 'Inscribirme'}
        </button>
      </form>
    </div>
  );
}
