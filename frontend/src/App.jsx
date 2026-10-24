/**
 * ============================================================================
 * COMPONENTE PRINCIPAL (App.jsx) - ADIVINA EL NÚMERO
 * Evaluación II - Programación Web (Ciclo 02, 2026)
 * Tecnologías: React.js, Vite, Bootstrap, CSS moderno
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';

// URL base de la API del backend Express (puerto 3000)
const API_URL = 'http://localhost:3000';

function App() {
  /**
   * ==========================================================================
   * ESTADOS DEL JUEGO (useState)
   * ==========================================================================
   */
  // 1. Número escrito actualmente en el input del formulario
  const [numeroIngresado, setNumeroIngresado] = useState('');

  // 2. Mensaje recibido del servidor ('El número secreto es MAYOR...', etc.)
  const [mensajeServidor, setMensajeServidor] = useState(
    'Introduce un número entre 1 y 100 para comenzar.'
  );

  // 3. Tipo de resultado actual: 'inicio' | 'mayor' | 'menor' | 'correcto' | 'error'
  const [tipoResultado, setTipoResultado] = useState('inicio');

  // 4. Bandera booleana para saber si el usuario ya adivinó el número
  const [haGanado, setHaGanado] = useState(false);

  // 5. Historial dinámico con todos los intentos realizados en la sesión actual
  // Estructura de cada elemento: { id, numero, resultado, mensaje, hora }
  const [historialIntentos, setHistorialIntentos] = useState([]);

  // 6. Estado de carga durante las peticiones asíncronas al backend
  const [cargando, setCargando] = useState(false);

  /**
   * ==========================================================================
   * EFECTO (useEffect) - REQUISITO TÉCNICO OBLIGATORIO
   * ==========================================================================
   * Actualiza dinámicamente el título de la pestaña del navegador según el
   * estado del juego y la cantidad de intentos realizados.
   */
  useEffect(() => {
    if (haGanado) {
      document.title = '🎉 ¡Ganaste! | Adivina el Número';
    } else if (historialIntentos.length > 0) {
      document.title = `(${historialIntentos.length} intentos) Adivina el Número`;
    } else {
      document.title = '🎯 Adivina el Número | AstraCode';
    }
  }, [haGanado, historialIntentos.length]);

  /**
   * Dispara una animación de confeti en toda la pantalla cuando el usuario gana.
   */
  const lanzarConfeti = () => {
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch (e) {
      console.log('Efecto visual opcional completado');
    }
  };

  /**
   * ==========================================================================
   * MANEJADOR DEL FORMULARIO: ENVIAR INTENTO (POST /guess)
   * ==========================================================================
   */
  const manejarEnvioIntento = async (evento) => {
    // Evita la recarga automática de la página que hace el navegador por defecto
    evento.preventDefault();

    // Validación en el cliente antes de consumir la API
    const valorNumerico = parseInt(numeroIngresado, 10);
    if (isNaN(valorNumerico) || valorNumerico < 1 || valorNumerico > 100) {
      setMensajeServidor('Por favor ingresa un número válido entre 1 y 100.');
      setTipoResultado('error');
      return;
    }

    setCargando(true);

    try {
      // Petición POST al endpoint /guess enviando el número en el body como JSON
      const respuesta = await fetch(`${API_URL}/guess`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ numero: valorNumerico })
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        // En caso de que el backend retorne código de error (ej: 400 Bad Request)
        setMensajeServidor(datos.error || 'Ocurrió un error en la validación.');
        setTipoResultado('error');
        return;
      }

      // Actualizamos los estados según la respuesta del backend
      setMensajeServidor(datos.mensaje);
      setTipoResultado(datos.resultado);

      // Creamos un nuevo registro para el historial
      const nuevoRegistro = {
        id: Date.now(),
        numero: valorNumerico,
        resultado: datos.resultado,
        mensaje: datos.mensaje,
        intentoNumero: datos.totalIntentos
      };

      // Inmutabilidad de React: agregamos el nuevo intento al inicio del arreglo
      setHistorialIntentos((historialAnterior) => [nuevoRegistro, ...historialAnterior]);

      // Si el número es correcto, activamos el estado de victoria y lanzamos confeti
      if (datos.resultado === 'correcto' || datos.ganador) {
        setHaGanado(true);
        lanzarConfeti();
      }

      // Limpiamos el input numérico para el siguiente intento
      setNumeroIngresado('');
    } catch (error) {
      console.error('Error al enviar el intento:', error);
      setMensajeServidor('No se pudo conectar con el servidor backend. ¿Está encendido?');
      setTipoResultado('error');
    } finally {
      setCargando(false);
    }
  };

  /**
   * ==========================================================================
   * MANEJADOR DE REINICIO: NUEVO JUEGO (POST /reset)
   * ==========================================================================
   */
  const manejarReinicioJuego = async () => {
    setCargando(true);
    try {
      const respuesta = await fetch(`${API_URL}/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const datos = await respuesta.json();

      if (respuesta.ok) {
        // Reiniciamos todos los estados de React al valor por defecto
        setNumeroIngresado('');
        setMensajeServidor(datos.mensaje || 'Nuevo juego iniciado. ¡Adivina el nuevo número!');
        setTipoResultado('inicio');
        setHaGanado(false);
        setHistorialIntentos([]);
      }
    } catch (error) {
      console.error('Error al reiniciar el juego:', error);
      setMensajeServidor('Error al contactar con el servidor para reiniciar.');
      setTipoResultado('error');
    } finally {
      setCargando(false);
    }
  };

  /**
   * Helper para determinar el color de alerta de Bootstrap según el resultado
   */
  const obtenerColorAlerta = () => {
    switch (tipoResultado) {
      case 'correcto':
        return 'alert-success';
      case 'mayor':
        return 'alert-primary';
      case 'menor':
        return 'alert-warning';
      case 'error':
        return 'alert-danger';
      default:
        return 'alert-info';
    }
  };

  /**
   * Helper para obtener el ícono representativo
   */
  const obtenerIconoResultado = () => {
    switch (tipoResultado) {
      case 'correcto':
        return '🎉';
      case 'mayor':
        return '⬆️';
      case 'menor':
        return '⬇️';
      case 'error':
        return '⚠️';
      default:
        return '🎯';
    }
  };

  return (
    <div className="container py-4 flex-grow-1 d-flex flex-column justify-content-center">
      {/* CABECERA PRINCIPAL */}
      <header className="text-center mb-4">
        <h1 className="fw-bold display-5 text-white mb-2">🎯 Adivina el Número</h1>
        <p className="text-light opacity-75 lead mb-0">
          El servidor ha pensado un número entre <strong>1 y 100</strong>. ¿Podrás adivinarlo?
        </p>
      </header>

      {/* CONTENEDOR PRINCIPAL */}
      <div className="row g-4 justify-content-center">
        {/* COLUMNA IZQUIERDA: ÁREA DE JUEGO */}
        <div className="col-12 col-lg-6">
          <div className="glass-card p-4 p-md-5 h-100 d-flex flex-column justify-content-between">
            <div>
              {/* TARJETA DE MENSAJE / FEEDBACK DEL SERVIDOR */}
              <div
                className={`alert ${obtenerColorAlerta()} border-0 shadow-sm d-flex align-items-center gap-3 mb-4 animate-pop`}
                role="alert"
              >
                <span style={{ fontSize: '2rem' }}>{obtenerIconoResultado()}</span>
                <div>
                  <h6 className="alert-heading mb-1 fw-bold">
                    {tipoResultado === 'correcto'
                      ? '¡Victoria!'
                      : tipoResultado === 'error'
                      ? 'Atención'
                      : tipoResultado === 'mayor'
                      ? 'Pista: Es Mayor'
                      : tipoResultado === 'menor'
                      ? 'Pista: Es Menor'
                      : 'Listo para jugar'}
                  </h6>
                  <p className="mb-0 small">{mensajeServidor}</p>
                </div>
              </div>

              {/* FORMULARIO DE INTENTO */}
              <form onSubmit={manejarEnvioIntento}>
                <div className="mb-4">
                  <label htmlFor="inputNumero" className="form-label text-light fw-semibold">
                    Tu número (1 - 100):
                  </label>
                  <div className="input-group input-group-lg">
                    <input
                      id="inputNumero"
                      type="number"
                      className="form-control text-center fw-bold fs-3 bg-dark text-white border-secondary"
                      placeholder="?"
                      min="1"
                      max="100"
                      value={numeroIngresado}
                      onChange={(e) => setNumeroIngresado(e.target.value)}
                      disabled={haGanado || cargando}
                      autoFocus
                      required
                    />
                    <button
                      type="submit"
                      className="btn btn-primary fw-bold px-4"
                      disabled={haGanado || cargando || !numeroIngresado}
                    >
                      {cargando ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          Enviando...
                        </>
                      ) : (
                        'Probar 🚀'
                      )}
                    </button>
                  </div>
                  <div className="form-text text-light opacity-50 text-center mt-2">
                    Ingresa un número y presiona Enter o clic en "Probar"
                  </div>
                </div>
              </form>
            </div>

            {/* BOTONES DE ACCIÓN: REINICIAR */}
            <div className="pt-3 border-top border-secondary border-opacity-50 d-flex justify-content-between align-items-center">
              <div>
                <span className="badge bg-secondary me-2">
                  Intentos: {historialIntentos.length}
                </span>
                {haGanado && (
                  <span className="badge bg-success animate-pop">¡Juego Completado!</span>
                )}
              </div>

              <button
                type="button"
                onClick={manejarReinicioJuego}
                className={`btn ${haGanado ? 'btn-success btn-lg px-4' : 'btn-outline-light btn-sm'}`}
                disabled={cargando}
              >
                🔄 {haGanado ? 'Jugar de Nuevo' : 'Reiniciar Partida'}
              </button>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: HISTORIAL DINÁMICO */}
        <div className="col-12 col-lg-5">
          <div className="glass-card p-4 h-100 d-flex flex-column">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold text-white mb-0">📋 Historial de Intentos</h5>
              <span className="badge bg-primary rounded-pill">
                {historialIntentos.length} registro(s)
              </span>
            </div>

            <p className="small text-light opacity-75 mb-3">
              Registro dinámico de los números enviados en la sesión actual:
            </p>

            <div
              className="flex-grow-1 overflow-auto pe-1"
              style={{ maxHeight: '380px' }}
            >
              {historialIntentos.length === 0 ? (
                <div className="text-center py-5 text-light opacity-50">
                  <div className="display-6 mb-2">🎲</div>
                  <p className="mb-0">Aún no has hecho ningún intento.</p>
                  <small>¡Envía tu primer número para comenzar el registro!</small>
                </div>
              ) : (
                <div className="d-flex flex-column gap-2">
                  {/* RENDERIZADO DINÁMICO CON .map() */}
                  {historialIntentos.map((item, index) => {
                    const badgeColor =
                      item.resultado === 'correcto'
                        ? 'bg-success'
                        : item.resultado === 'mayor'
                        ? 'bg-primary'
                        : 'bg-warning text-dark';

                    const textoResultado =
                      item.resultado === 'correcto'
                        ? '¡Acertaste! 🎯'
                        : item.resultado === 'mayor'
                        ? 'Secreto es MAYOR ⬆️'
                        : 'Secreto es MENOR ⬇️';

                    return (
                      <div
                        key={item.id}
                        className={`history-item ${item.resultado} p-3 rounded bg-dark bg-opacity-50 d-flex justify-content-between align-items-center animate-pop`}
                      >
                        <div className="d-flex align-items-center gap-3">
                          <span className="badge bg-secondary rounded-circle px-2 py-1">
                            #{item.intentoNumero || historialIntentos.length - index}
                          </span>
                          <div>
                            <span className="fs-5 fw-bold text-white">
                              {item.numero}
                            </span>
                          </div>
                        </div>
                        <div>
                          <span className={`badge ${badgeColor} badge-custom`}>
                            {textoResultado}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* PIE DE PÁGINA */}
      <footer className="text-center text-light opacity-50 small mt-4">
        Evaluación II - Programación Web • Equipo AstraCode • React + Node.js Express
      </footer>
    </div>
  );
}

export default App;
