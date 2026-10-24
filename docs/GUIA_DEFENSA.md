# 📖 Documentación y Guía de Defensa Técnica
## Proyecto: "Adivina el Número" (Integración Frontend - Backend)
**Asignatura:** Programación Web — Ciclo 02, 2026  
**Equipo:** AstraCode  
**Evaluación:** Evaluación II (20% de la nota final)  

---

## 📑 Tabla de Contenidos
1. [Visión General y Arquitectura](#1-visión-general-y-arquitectura)
2. [Estructura del Proyecto y GitFlow](#2-estructura-del-proyecto-y-gitflow)
3. [Explicación Detallada del Backend (Express)](#3-explicación-detallada-del-backend-express)
4. [Explicación Detallada del Frontend (React + Vite)](#4-explicación-detallada-del-frontend-react--vite)
5. [Comunicación API y Flujo de Datos](#5-comunicación-api-y-flujo-de-datos)
6. [Simulador de Preguntas y Respuestas para la Defensa (70% de la nota)](#6-simulador-de-preguntas-y-respuestas-para-la-defensa)
7. [Instrucciones de Instalación y Ejecución](#7-instrucciones-de-instalación-y-ejecución)

---

## 1. Visión General y Arquitectura

El sistema implementa una arquitectura desacoplada **Cliente - Servidor** basada en el protocolo **HTTP** y principios **REST**:

* **Backend (Servidor API REST):** Desarrollado con **Node.js** y **Express**. Es la única entidad que conoce la regla del juego y el número secreto generado en memoria (número entero entre 1 y 100).
* **Frontend (Cliente Web SPA):** Desarrollado con **React.js** y empaquetado con **Vite**. Ofrece una interfaz interactiva y reactiva que no recarga la página, controlando el estado local con *Hooks* (`useState`, `useEffect`) y comunicándose con el servidor a través de peticiones asíncronas (`fetch` con promesas `async/await`).

```
 +------------------------+                      +--------------------------+
 |   FRONTEND (React)     |   POST /guess (JSON) |     BACKEND (Express)    |
 |   Puerto 5173          | -------------------> |     Puerto 3000          |
 |   - Formulario         | <------------------- |  - Genera núm. secreto   |
 |   - useState           |   { resultado, ... } |  - Compara mayor/menor   |
 |   - Historial (.map)   |                      |  - Controla intentos     |
 |   - Confeti al ganar   |   POST /reset (JSON) |                          |
 |                        | -------------------> |  - Genera nuevo número   |
 +------------------------+                      +--------------------------+
```

---

## 2. Estructura del Proyecto y GitFlow

Se siguió la metodología de ramificación **GitFlow**:
* **`main`**: Rama de producción que almacena versiones estables.
* **`develop`**: Rama base de integración donde convergen las características.
* **`feature/backend`**: Rama de desarrollo para el servidor Express y sus endpoints.
* **`feature/frontend`**: Rama de desarrollo para la interfaz en React y consumo de la API.

```text
Adivina el Número - AstraCode/
├── backend/
│   ├── package.json        # Configuración de dependencias de Node.js (express, cors)
│   └── server.js           # Servidor Express, lógica y endpoints
├── frontend/
│   ├── index.html          # HTML raíz para la SPA
│   ├── package.json        # Dependencias (react, bootstrap, canvas-confetti, vite)
│   ├── vite.config.js      # Configuración del bundler Vite
│   └── src/
│       ├── main.jsx        # Punto de entrada de React (createRoot)
│       ├── App.jsx         # Componente principal, estados (useState) y consumo API
│       └── index.css       # Estilos personalizados (glassmorphism y animaciones)
├── docs/
│   └── GUIA_DEFENSA.md     # Este documento de estudio y preparación
├── .gitignore              # Ignora node_modules, logs y compilados
└── README.md               # Instrucciones de inicio rápido
```

---

## 3. Explicación Detallada del Backend (Express)

El archivo central es `backend/server.js`. A continuación se explica cada bloque clave:

### A. Middlewares esenciales
1. **`cors()`**:
   * *¿Qué es?* Cross-Origin Resource Sharing.
   * *¿Por qué se usa?* Por seguridad, los navegadores bloquean peticiones que se originan en un dominio/puerto (Vite en `localhost:5173`) hacia otro puerto diferente (Express en `localhost:3000`). `cors()` le indica al navegador que acepte peticiones desde el frontend.
2. **`express.json()`**:
   * *¿Por qué se usa?* Cuando el frontend envía un `fetch` con encabezado `'Content-Type': 'application/json'`, Express no sabe leer el cuerpo (`req.body`) por defecto. Este middleware parsea el JSON entrante y lo deja disponible en `req.body`.

### B. Generación del Número Aleatorio
```javascript
const generarNumeroAleatorio = () => Math.floor(Math.random() * 100) + 1;
```
* **`Math.random()`**: Genera un número decimal pseudoaleatorio en el rango $[0, 1)$ (es decir, de $0$ hasta $0.999999...$).
* **`* 100`**: Escala el rango a $[0, 100)$ (de $0$ hasta $99.9999...$).
* **`Math.floor(...)`**: Trunca los decimales y redondea hacia abajo, dando enteros de $0$ a $99$.
* **`+ 1`**: Desplaza el rango a enteros de **$1$ a $100$** inclusive.

### C. Endpoint: `POST /guess`
* **Entrada esperada:** `{ "numero": 42 }`
* **Validaciones:**
  * Si el campo `numero` está ausente o vacío $\rightarrow$ Responde con código HTTP `400 Bad Request`.
  * Si el valor no es un entero entre 1 y 100 $\rightarrow$ Responde con `400 Bad Request`.
* **Comparación:**
  * Si `intentoUsuario < numeroSecreto` $\rightarrow$ Responde `{ resultado: "mayor", mensaje: "El número secreto es MAYOR..." }`.
  * Si `intentoUsuario > numeroSecreto` $\rightarrow$ Responde `{ resultado: "menor", mensaje: "El número secreto es MENOR..." }`.
  * Si `intentoUsuario === numeroSecreto` $\rightarrow$ Responde `{ resultado: "correcto", ganador: true, ... }`.

### D. Endpoint: `POST /reset`
* Invoca nuevamente a `generarNumeroAleatorio()`.
* Reinicia la variable `numeroSecreto` y pone el contador de intentos en $0$.
* Responde con un JSON confirmando el reinicio del juego.

---

## 4. Explicación Detallada del Frontend (React + Vite)

El archivo central es `frontend/src/App.jsx`. A continuación se detallan los elementos de evaluación solicitados por la guía:

### A. Uso de `useState` (Gestión del Estado)
En React, la vista reacciona a los cambios en el estado. Se definieron 6 estados bien diferenciados:
1. `const [numeroIngresado, setNumeroIngresado] = useState('')`: Controla el valor en tiempo real del input numérico (formulario controlado).
2. `const [mensajeServidor, setMensajeServidor] = useState(...)`: Almacena el mensaje devuelto por el servidor para mostrárselo al usuario.
3. `const [tipoResultado, setTipoResultado] = useState('inicio')`: Guarda el tipo de resultado (`'inicio'`, `'mayor'`, `'menor'`, `'correcto'`, `'error'`) para cambiar dinámicamente colores de alerta e íconos.
4. `const [haGanado, setHaGanado] = useState(false)`: Estado booleano. Cuando es `true`, deshabilita el input y botón de probar, y resalta la opción de "Jugar de nuevo".
5. `const [historialIntentos, setHistorialIntentos] = useState([])`: Arreglo que almacena los objetos de cada intento realizado en la sesión.
6. `const [cargando, setCargando] = useState(false)`: Estado booleano para deshabilitar botones y mostrar un spinner de carga mientras se espera la respuesta del backend.

### B. Uso de `useEffect` (Efecto Secundario de Montaje)
```javascript
useEffect(() => {
  verificarEstadoServidor();
}, []);
```
* **¿Qué hace?** Se ejecuta **una única vez** al cargarse el componente en el navegador gracias al arreglo de dependencias vacío `[]`.
* **Propósito:** Hace un ping a la ruta base de Express (`GET /`) para avisar visualmente en la cabecera si el servidor está conectado o apagado.

### C. Prevención de Recarga en Formularios (`evento.preventDefault()`)
Los formularios HTML por defecto realizan una petición `GET`/`POST` que recarga toda la página. En una Single Page Application (SPA) con React, se usa `evento.preventDefault()` para cancelar esa recarga y manejar la petición de forma asíncrona mediante JavaScript.

### D. Renderizado Dinámico con `.map()`
```jsx
{historialIntentos.map((item, index) => (
  <div key={item.id} className={`history-item ${item.resultado} ...`}>
    <span>#{item.intentoNumero}</span>
    <span>{item.numero}</span>
    <span>{item.resultado}</span>
  </div>
))}
```
* **Iterador `.map()`:** Transforma cada objeto del arreglo `historialIntentos` en un elemento JSX visual.
* **Propiedad `key={item.id}`:** Obligatoria en React para que el algoritmo de reconciliación (*Virtual DOM*) identifique qué elemento cambió, se agregó o se eliminó de manera eficiente sin re-renderizar toda la lista.

---

## 5. Comunicación API y Flujo de Datos

Toda la comunicación utiliza el estándar de **Promesas** mediante la sintaxis moderna `async / await` y manejo de excepciones con `try / catch / finally`:

```javascript
try {
  const respuesta = await fetch('http://localhost:3000/guess', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ numero: valorNumerico })
  });
  const datos = await respuesta.json();
  // Actualización de estado en React...
} catch (error) {
  // Manejo de errores de conexión...
} finally {
  setCargando(false);
}
```

---

## 6. Simulador de Preguntas y Respuestas para la Defensa
> [!IMPORTANT]
> **El 70% de la nota final depende de tu defensa oral (40% personal + 30% grupal).**  
> Estudia estas preguntas típicas que el docente suele realizar:

### P1: ¿Por qué fue necesario instalar y configurar el paquete `cors` en Express?
> **Respuesta ideal:**  
> *"Por la política del mismo origen (Same-Origin Policy) que implementan los navegadores web. Nuestro frontend en React se ejecuta en `http://localhost:5173` y el backend en `http://localhost:3000`. Al ser orígenes (puertos) diferentes, el navegador bloquea las solicitudes AJAX/Fetch a menos que el servidor Express envíe las cabeceras de CORS permitiendo el acceso."*

---

### P2: ¿Dónde se almacena el número secreto y qué ocurriría si reiniciamos el servidor Express?
> **Respuesta ideal:**  
> *"Se almacena en memoria RAM dentro de una variable de JavaScript (`let numeroSecreto`) en el servidor. Como es almacenamiento en memoria volátil y no en base de datos persistente, si el servidor se reinicia o se cae, se ejecutará de nuevo el código inicial y se generará un número secreto completamente nuevo."*

---

### P3: ¿Por qué en React no hacemos `historialIntentos.push(nuevoIntento)` y en su lugar usamos `setHistorialIntentos(prev => [nuevoIntento, ...prev])`?
> **Respuesta ideal:**  
> *"Por el principio de **inmutabilidad** de React. Si mutamos el arreglo directamente con `.push()`, la referencia en memoria del arreglo sigue siendo la misma y React no detecta que el estado cambió, por lo que no volvería a pintar la lista en la pantalla. Usando el operador spread `[...]` creamos un nuevo arreglo en memoria, lo que dispara correctamente el re-renderizado del componente."*

---

### P4: ¿Qué hace `e.preventDefault()` en la función `manejarEnvioIntento`?
> **Respuesta ideal:**  
> *"Previene el comportamiento predeterminado que tienen los navegadores ante el evento `submit` de un formulario HTML, el cual consiste en recargar la página completa enviando los datos por la URL. Al cancelarlo con `preventDefault()`, mantenemos la experiencia de Single Page Application (SPA) y enviamos los datos en segundo plano usando `fetch`."*

---

### P5: ¿Qué diferencia hay entre `let` y `const` en el proyecto? Pon un ejemplo del código.
> **Respuesta ideal:**  
> *"Ambos tienen alcance de bloque (*block scope*). Usamos `const` para identificadores que no van a ser reasignados, como la instancia de Express (`const app`), la función de generación aleatoria o los estados devueltos por `useState`. Usamos `let` cuando el valor necesita ser reasignado, como la variable `let numeroSecreto` o `let totalIntentos` en el servidor, las cuales cambian de valor cada vez que se reinicia el juego o se realiza un intento."*

---

### P6: ¿Para qué sirve el segundo parámetro `[]` en `useEffect`?
> **Respuesta ideal:**  
> *"Es el arreglo de dependencias. Si pasamos un arreglo vacío `[]`, le indicamos a React que el efecto secundario solo debe ejecutarse una vez, exactamente cuando el componente se monta por primera vez en el DOM (equivalente al antiguo `componentDidMount`). Si no pusiéramos el arreglo, se ejecutaría en cada renderizado, provocando peticiones continuas e innecesarias al backend."*

---

### P7: ¿Qué significa que una función sea `async` y devuelva una Promesa?
> **Respuesta ideal:**  
> *"Una función declarada con `async` siempre retorna una Promesa y nos permite utilizar la palabra clave `await` dentro de ella. `await` pausa la ejecución lineal de esa función específica hasta que la operación asíncrona (como `fetch` esperando la respuesta de red) se resuelva o falle, permitiendo escribir código asíncrono limpio y legible que se lee casi de forma síncrona sin caer en el anidamiento excesivo de `.then()` y `.catch()`."*

---

## 7. Instrucciones de Instalación y Ejecución

Si clonas este repositorio en cualquier computadora nueva, sigue estos sencillos pasos:

### 1. Clonar el repositorio
```bash
git clone https://github.com/IngAmaya/Adivina-el-N-mero---AstraCode.git
cd "Adivina-el-N-mero---AstraCode"
```

### 2. Iniciar el Backend (Terminal 1)
```bash
cd backend
npm install
npm start
```
*El servidor iniciará en `http://localhost:3000`*.

### 3. Iniciar el Frontend (Terminal 2)
```bash
cd frontend
npm install
npm run dev
```
*Abre tu navegador en `http://localhost:5173` para jugar*.
