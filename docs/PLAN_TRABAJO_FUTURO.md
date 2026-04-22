# 📅 Plan de Trabajo: Fase de Profesionalización

**Objetivo:** Transformar el prototipo local en una aplicación robusta conectada a la nube.

---

## 🛑 Tareas para el Usuario (MAÑANA)

1.  **Crear Base de Datos MySQL:**
    *   Entrar al cPanel.
    *   Crear una nueva Base de Datos (ej: `dailyflow_db`).
    *   Crear un Usuario de Base de Datos y asignarle todos los privilegios.
    *   **Anotar:** Host, Nombre de BD, Usuario y Contraseña.

2.  **Configurar BunnyNet (Si decides usarlo):**
    *   Crear una "Storage Zone" para las fotos.
    *   Obtener las API Keys (Access Key).
    *   *(Alternativa: Usar el mismo hosting del cPanel para guardar archivos, pero BunnyNet es mejor).*

3.  **Subir Archivos al Hosting (Backend):**
    *   Necesitaremos una carpeta en tu hosting (ej: `api.tudesarrollo.com` o `midominio.com/api`) donde alojaremos los scripts PHP o Node.js que conectarán la App con la Base de Datos.

4.  **Recopilar y Subir Audios (Faltantes):**
    *   **Prioridad:** Necesarios para que el "Focus Hub" suene.
    *   **Ruta:** Ponerlos en `public/audios/focus/`.
    *   **Archivos requeridos:**
        *   `rain.mp3` (Lluvia)
        *   `forest.mp3` (Bosque)
        *   `cafe.mp3` (Cafetería / Ruido Blanco)
        *   `fire.mp3` (Fuego / Hoguera)
    *   *(Nota: Puedes usar archivos que ya tengas o descargar libres de derechos)*.

---

## 👨‍💻 Tareas de Desarrollo (YO - Antigravity)

### 1. Backend & API (Conexión Nube)
*   **Crear API Endpoints:** Scripts sencillos para recibir datos desde la App y guardarlos en MySQL.
    *   `POST /sync-data`: Para guardar todo el estado.
    *   `GET /fetch-data`: Para recuperar el estado al iniciar.
*   **Conector BunnyNet:** Script para recibir la foto desde la app y subirla a BunnyNet, devolviendo la URL pública.

### 2. Refactorización de "Core" (Solidez)
*   **Fechas Robustas:**
    *   Instalar `date-fns`.
    *   Reemplazar todos los `new Date()` artesanales por funciones estandarizadas (UTC) para evitar problemas de zona horaria.
*   **Promedios Dinámicos:**
    *   Modificar la lógica para que los promedios semanales **siempre se recalculen** al ver el historial, eliminando el problema de los "promedios congelados".

### 3. Optimización de Fotos
*   **Compresión Cliente-Lado:**
    *   Implementar una utilidad que reduzca las fotos (ej: a 1080p y 80% calidad) *antes* de intentar subirlas o guardarlas, ahorrando datos y memoria.

4.  **Cerebro de Nutrición (IA):**
    *   **Retomar Lógica IA:** Conectar el botón "Calc IA" del modal con un endpoint real (OpenAI/Gemini) para procesar texto natural ("2 huevos y pan") y devolver JSON de macros.
    *   *Nota: Usaremos la integración que ya "teníamos" o adaptaremos el prompt actual.*

---

---

## 🏛️ Estrategia de Datos: "Adiós al Caos Local"

Para cumplir con tu requerimiento de que los datos **JAMÁS estén dispersos** y sean un registro **100% fiable**, migraremos de "guardarlo todo en un archivo gigante" a una **Base de Datos Relacional (MySQL)** con tablas estructuradas.

### ¿Por qué tablas?
Actualmente, si se daña un archivo, se pierde todo. Con tablas, cada registro es independiente y seguro.

### Esquema Propuesto (Schema)

1.  **Tabla `Usuarios`**:
    *   Tu perfil, configuración y credenciales.
2.  **Tabla `Registros_Diarios` (Daily Logs)**:
    *   *Columnas:* Fecha, Peso, Sueño, Estrés, Pasos, Nivel de Energía.
    *   *Ventaja:* Podemos sacar gráficas de cualquier rango de fechas instantáneamente.
3.  **Tabla `Nutricion_Logs`**:
    *   *Columnas:* Fecha, Hora, Tipo (Desayuno/Comida), Alimento, Kcal, Prot, Carb, Fat.
    *   *Ventaja:* Historial perfecto de qué comiste cada día.
4.  **Tabla `Medidas_Semanales`**:
    *   *Columnas:* Semana_Inicio, Pecho, Cintura, Brazos, etc.
5.  **Tabla `Galeria_Fotos`**:
    *   *Columnas:* ID, Fecha, URL_Foto (BunnyNet), Tipo (Frente/Espalda).
    *   *Ventaja:* Las fotos no pesan en la app, solo guardamos el "link".

---

## 📝 Resumen del Flujo de Mañana
1.  **Tú** me das las credenciales (BD y BunnyNet).
2.  **Yo** creo el "puente" (API) para que la app deje de guardar solo en tu navegador y empiece a guardar en tu servidor.
3.  **Hacemos una prueba de fuego:** Borramos el caché del navegador y vemos cómo recupera todos tus datos desde la nube. ☁️🚀
