# 🎯 Adivina el Número - AstraCode
> **Evaluación II - Programación Web (Ciclo 02, 2026)**  
> Aplicación Web con integración Frontend (React + Vite) y Backend (Node.js + Express).

---

## 📌 Descripción del Proyecto
Este proyecto implementa el **Ejercicio 1: "Adivina el Número"** propuesto en la guía de evaluación. Consiste en un juego interactivo donde:
1. El **Backend (Express)** genera un número aleatorio entre 1 y 100 y expone endpoints REST para adivinar (`POST /guess`) y reiniciar la partida (`POST /reset`).
2. El **Frontend (React + Vite)** provee un formulario con validaciones, control de estado reactivo mediante `useState`, historial dinámico de intentos usando `.map()`, efectos visuales con Bootstrap y animaciones de victoria con confeti.

---

## 🛠️ Tecnologías Utilizadas
* **Backend:** Node.js, Express, CORS, JavaScript Moderno (ES Modules).
* **Frontend:** React 18, Vite, Bootstrap 5, CSS personalizado, Canvas-Confetti.
* **Control de Versiones:** Git & GitHub siguiendo la metodología **GitFlow** (`main`, `develop`).

---

## 🚀 Puesta en Marcha Local

### 1. Clonar el Repositorio
```bash
git clone https://github.com/IngAmaya/Adivina-el-N-mero---AstraCode.git
cd "Adivina-el-N-mero---AstraCode"
```

### 2. Ejecutar el Servidor Backend
En una terminal:
```bash
cd backend
npm install
npm start
```
> El servidor quedará escuchando en `http://localhost:3000`.

### 3. Ejecutar la Aplicación Frontend
En otra terminal separada:
```bash
cd frontend
npm install
npm run dev
```
> La interfaz quedará disponible en `http://localhost:5173`.

---

## 👥 Equipo AstraCode
* **Integrantes:**
  * Pablo Andrés Amaya Tenorio - 00096325
  * Elías Fernando Rivera Martínez - 00137525
* **Materia:** Programación Web (Ciclo 02, 2026)
