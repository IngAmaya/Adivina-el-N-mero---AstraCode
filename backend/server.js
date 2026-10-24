/**
 * ============================================================================
 * SERVIDOR BACKEND - ADIVINA EL NÚMERO
 * Evaluación II - Programación Web (Ciclo 02, 2026)
 * Tecnologías: Node.js, Express, JavaScript moderno (ES Modules)
 * ============================================================================
 */

import express from "express";
import cors from "cors";

// 1. Inicialización de la aplicación Express
const app = express();
const PUERTO = process.env.PORT || 3000;

// 2. Middlewares esenciales
// cors(): Permite que el frontend (ejecutado en Vite, puerto 5173) haga peticiones a este servidor (puerto 3000)
app.use(cors());

// express.json(): Permite que Express entienda y procese cuerpos de petición (body) en formato JSON
app.use(express.json());

/**
 * Función auxiliar para generar un número entero aleatorio entre 1 y 100.
 * - Math.random() genera un decimal entre 0 y 0.999...
 * - Multiplicado por 100 da un rango de 0 a 99.999...
 * - Math.floor() redondea hacia abajo (0 a 99)
 * - Sumando +1 obtenemos el rango deseado de 1 a 100 inclusive.
 */
const generarNumeroAleatorio = () => Math.floor(Math.random() * 100) + 1;

// 3. Variable en memoria que almacena el número secreto generado al iniciar el servidor
let numeroSecreto = generarNumeroAleatorio();
let totalIntentos = 0; // Contador de intentos de la partida actual

// Imprimimos en consola solo para depuración del desarrollador
console.log(`[INIT] Juego iniciado. Número secreto inicial generado: ${numeroSecreto}`);

/**
 * ============================================================================
 * RUTAS DE LA API (ENDPOINTS)
 * ============================================================================
 */

/**
 * RUTA BASE / INFORMATIVA (GET /)
 * Sirve para verificar rápidamente desde el navegador si el servidor está encendido.
 */
app.get("/", (req, res) => {
  res.json({
    ok: true,
    mensaje: "Servidor Backend de 'Adivina el Número' funcionando correctamente.",
    endpoints: {
      adivinar: "POST /guess",
      reiniciar: "POST /reset"
    }
  });
});

/**
 * RUTA: POST /guess
 * PROPÓSITO: Recibe el número propuesto por el cliente y responde indicando
 *            si el número secreto es "mayor", "menor" o "correcto".
 * 
 * BODY ESPERADO: { "numero": 45 }
 * RESPUESTA: {
 *   "resultado": "mayor" | "menor" | "correcto",
 *   "mensaje": "El número secreto es mayor",
 *   "intento": 45,
 *   "totalIntentos": 1
 * }
 */
app.post("/guess", (req, res) => {
  const { numero } = req.body;

  // Validación de entrada: verificar que se haya enviado un valor
  if (numero === undefined || numero === null || numero === "") {
    return res.status(400).json({
      ok: false,
      error: "Debes enviar un número en el cuerpo de la petición: { numero: <valor> }"
    });
  }

  // Conversión explícita a número entero
  const intentoUsuario = parseInt(numero, 10);

  // Validación: asegurar que sea un número válido y esté dentro del rango 1 a 100
  if (Number.isNaN(intentoUsuario) || intentoUsuario < 1 || intentoUsuario > 100) {
    return res.status(400).json({
      ok: false,
      error: "El número debe ser un entero válido entre 1 y 100."
    });
  }

  // Incrementamos el contador de intentos
  totalIntentos += 1;

  // Comparación lógica con el número secreto
  if (intentoUsuario < numeroSecreto) {
    return res.status(200).json({
      ok: true,
      resultado: "mayor",
      mensaje: `El número secreto es MAYOR que ${intentoUsuario}.`,
      intento: intentoUsuario,
      totalIntentos
    });
  }

  if (intentoUsuario > numeroSecreto) {
    return res.status(200).json({
      ok: true,
      resultado: "menor",
      mensaje: `El número secreto es MENOR que ${intentoUsuario}.`,
      intento: intentoUsuario,
      totalIntentos
    });
  }

  // Si no es menor ni mayor, entonces es el correcto
  return res.status(200).json({
    ok: true,
    resultado: "correcto",
    mensaje: `¡Felicidades! Has adivinado el número secreto (${numeroSecreto}) en ${totalIntentos} intento(s).`,
    intento: intentoUsuario,
    totalIntentos,
    ganador: true
  });
});

/**
 * RUTA: POST /reset
 * PROPÓSITO: Generar un nuevo número secreto para reiniciar el juego.
 * 
 * RESPUESTA: {
 *   "ok": true,
 *   "mensaje": "Nuevo juego iniciado. Se ha generado un nuevo número secreto.",
 *   "totalIntentosAnterior": 4
 * }
 */
app.post("/reset", (req, res) => {
  const intentosAnteriores = totalIntentos;
  
  // Se genera un nuevo número secreto y se reinicia el contador
  numeroSecreto = generarNumeroAleatorio();
  totalIntentos = 0;

  console.log(`[RESET] Juego reiniciado. Nuevo número secreto generado: ${numeroSecreto}`);

  return res.status(200).json({
    ok: true,
    mensaje: "Nuevo juego iniciado. Se ha generado un nuevo número secreto.",
    totalIntentosAnterior: intentosAnteriores
  });
});

// 4. Encendido del servidor en el puerto especificado
app.listen(PUERTO, () => {
  console.log(`=======================================================`);
  console.log(` Servidor de 'Adivina el Número' corriendo en el puerto ${PUERTO}`);
  console.log(` URL Local: http://localhost:${PUERTO}`);
  console.log(`=======================================================`);
});
