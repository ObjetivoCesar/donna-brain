# Plan de Desarrollo - Daily Flow Assistant (Móvil)

Este documento describe las fases y tareas para la creación de la aplicación móvil nativa.

---

### Fase 1: Fundamentos y Estructura (MVP Offline)

El objetivo de esta fase es construir el esqueleto de la aplicación con su funcionalidad principal disponible sin conexión a internet.

-   **Tarea 1.1: Limpieza y Estructura del Proyecto.**
    -   [x] Eliminar componentes y archivos de ejemplo del template de Expo.
    -   [x] Crear la estructura de directorios: `app/(tabs)`, `assets`, `components`, `constants`, `hooks`, `services`, `data`.

-   **Tarea 1.2: Implementar Navegación por Pestañas.**
    -   [x] Configurar `Expo Router` para tener una navegación de 3 pestañas (Tabs) en la parte inferior.
    -   [x] Asignar un icono a cada pestaña: "Vivir", "Motivación", "Trabajo".
    -   [x] Crear las pantallas iniciales para cada pestaña.

-   **Tarea 1.3: Módulo de Horario y Actividad Actual (Offline).**
    -   [x] Portar la lógica de `mockData.ts` del proyecto web al directorio `data` del móvil.
    -   [x] Crear un servicio (`ScheduleService`) que determine la actividad actual basándose en la hora del dispositivo.
    -   [x] Mostrar la actividad actual en la pestaña "Vivir".

-   **Tarea 1.4: Implementar el "Botón de Auxilio" (Versión Offline).**
    -   [x] Crear el botón de UI.
    -   [x] Implementar la lógica de clasificación de intención *en el dispositivo* (on-device) usando palabras clave, sin llamar a Gemini.
    -   [x] Integrar `expo-av` para reproducir archivos de audio locales (`.mp3`) basados en la intención detectada.
    -   [x] Añadir los archivos de audio al proyecto en `assets/audio`.

---

### Fase 2: Notificaciones y Persistencia

-   **Tarea 2.1: Sistema de Notificaciones Proactivas.**
    -   [x] Integrar `expo-notifications`.
    -   [x] Configurar `expo-task-manager` para que una tarea en segundo plano verifique el horario.
    -   [x] Programar notificaciones locales para alertar al usuario sobre el inicio de la siguiente actividad, incluso si la app está cerrada.

-   **Tarea 2.2: Persistencia del Estado.**
    -   [x] Utilizar `AsyncStorage` para guardar el progreso diario del usuario.
    -   [x] La barra de progreso debe reflejar el estado guardado al reiniciar la app.

---

### Fase 3: Conectividad e IA Avanzada

-   **Tarea 3.1: Integrar API de Gemini.**
    -   [ ] Crear un `GeminiService` en el proyecto móvil.
    -   [ ] Modificar el "Botón de Auxilio" para que, si hay conexión a internet, use la API de Gemini para una clasificación de intención más precisa.
    -   [ ] Mantener el sistema de clasificación local como fallback si no hay conexión.

---