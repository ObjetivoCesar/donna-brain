# Daily Flow Assistant

## 1. Resumen del Proyecto

**Daily Flow Assistant** es una aplicación web de asistencia personal diseñada para estructurar y optimizar la rutina diaria de un individuo de alto rendimiento. La aplicación combina la gestión de horarios, planes de nutrición y entrenamiento con un sistema de apoyo emocional inteligente, impulsado por la API de Gemini de Google.

El objetivo principal es proporcionar una herramienta integral que no solo organice las tareas diarias, sino que también ofrezca apoyo proactivo para mantener la disciplina, la motivación y el bienestar mental del usuario.

## ✨ Características Principales

### 🧠 Gestión de Energía y Foco
- **3 Modos Mentales**: Flow (Creatividad), Focus (Productividad), Planner (Organización).
- **Ambientes Sonoros**: Biblioteca de audios (Binaural, Lluvia, Café, etc.) para modular el estado mental.
- **Bloques de Tiempo**: Estructura visual del día dividida en bloques manejables.

### 🏋️ Sistema de Entrenamiento Avanzado (Nuevo)
- **Tracker en Vivo**: Registro de series, peso, repeticiones y RPE en tiempo real.
- **Cronómetro Inteligente**: Timer de descanso configurable con alertas.
- **Sobrecarga Progresiva**: Detección automática de metas cumplidas y sugerencias de progreso.
- **Historial Detallado**: Visualización de rendimiento serie por serie para detectar fatiga.

### 📊 Seguimiento Corporal (Nuevo)
- **Registro de Medidas**: Control de peso y medidas corporales (pecho, brazos, cintura, etc.).
- **Galería de Progreso**: Almacenamiento seguro de fotos de evolución física.
- **Gráficas e Historial**: Visualización cronológica de cambios.

### ⚡ Gestión TDAH
- **Registro de Desviaciones**: Sistema sin culpa para registrar cambios de planes.
- **Reportes Diarios**: Generación automática de informes Markdown con estadísticas de adherencia.
- **Interfaz Calmada**: Diseño minimalista oscuro para reducir la sobreestimulación visual.

- **Panel de Control Dinámico (Pilar "Vivir"):**
  - Visualización del progreso del día a través de una barra de progreso.
  - Reloj digital para mantener la noción del tiempo.
  - Muestra la actividad actual según el horario programado para el día de la semana (Lunes-Viernes, Sábado, Domingo).
  - Acceso rápido a detalles de la actividad (rutinas de ejercicio, ingredientes de comidas) a través de una ventana "Caja de Luz".

- **Biblioteca de Audios de Apoyo (Botón de Auxilio):**
  - Un sistema de apoyo emocional activado por el "Botón de Auxilio".
  - **Interfaz simplificada:** Muestra las 8 categorías emocionales disponibles en una cuadrícula visual.
  - **Selección directa:** El usuario selecciona la emoción que mejor describe su estado actual.
  - **Reproductor integrado:** Incluye controles de play/pause, barra de progreso y visualización del tiempo.
  - **Categorías disponibles:**
    - Cansancio o desmotivación
    - Incertidumbre emocional
    - Inspiración o creatividad
    - Impulso positivo
    - Inseguridad o miedo al rechazo
    - Postergación o duda
    - Vergüenza o autoexigencia
    - Entusiasmo o nuevos comienzos
  - Cada categoría reproduce un archivo de audio `.mp3` pregrabado específico ubicado en `/public/audios/`.
  - **Nota:** La implementación anterior con IA de Gemini para clasificación automática está disponible en `ChatbotService.ts` y `GeminiService.ts` pero actualmente deshabilitada en favor de esta interfaz más directa y confiable.

- **Sistema de Notificaciones y Alarmas (TDAH-Friendly):**
  - Sistema de doble alerta diseñado específicamente para romper el hiperfoco.
  - **Alerta de 5 minutos antes:** Notificación suave con 3 beeps cortos para preparar la transición.
  - **Alerta en el momento exacto:** Notificación urgente con alarma insistente de 10 segundos (patrón de beeps repetitivos).
  - Utiliza Web Audio API para generar sonidos programáticamente (no requiere archivos de audio).
  - Requiere permiso del navegador para notificaciones y audio (activado mediante el botón de campana 🔔).

- **Fondos Dinámicos Contextuales:**
  - El fondo de pantalla cambia automáticamente según la categoría de la actividad actual del horario.
  - **Categorías:**
    - `living`: Actividades de cuidado personal, alimentación, ejercicio, descanso.
    - `motivation`: Meditación, reflexión, lectura, desarrollo personal.
    - `work`: Bloques de trabajo, desarrollo de objetivos, productividad.
  - Cada categoría tiene su propio fondo visual único (`living-bg.webp`, `motivation-bg.webp`, `work-bg.webp`).
  - El sistema detecta la actividad actual basándose en la hora y el día de la semana.

- **Navegación por Pilares:**
  - La aplicación se estructura en tres pilares conceptuales: **Vivir**, **Motivación** y **Trabajo**.
  - Cada pilar tiene un fondo visual único para crear una atmósfera adecuada.
  - La navegación es fluida a través de una barra de navegación inferior.

## 3. Stack Tecnológico

- **Frontend:** React.js, TypeScript
- **Estilos:** TailwindCSS
- **Inteligencia Artificial:** Google Gemini API (`gemini-2.5-flash`)
- **Entorno de Desarrollo:** Plataforma de Prototipado Web (con soporte para import maps)

## 4. Estructura de Archivos Clave

- `public/`: Contiene los activos estáticos.
  - `images/`: Fondos de pantalla para los pilares.
  - `audios/`: Archivos de audio `.mp3` para el asistente de IA.
  - `chatbot_config.json`: Archivo de configuración que mapea las intenciones a los identificadores de audio.
- `src/`: Código fuente de la aplicación.
  - `components/`: Componentes reutilizables de React (Reloj, Modales, Barra de Progreso, etc.).
    - `AudioLibraryModal.tsx`: Modal de biblioteca de audios con reproductor integrado (reemplaza al chatbot).
    - `ChatbotModal.tsx`: Modal de chatbot con IA (actualmente no utilizado).
  - `screens/`: Componentes que representan las pantallas principales de cada pilar.
  - `services/`: Lógica de negocio desacoplada de la UI.
    - `ChatbotService.ts`: Orquesta la lógica del asistente (con fallback de keywords + IA, actualmente no utilizado).
    - `GeminiService.ts`: Encapsula la comunicación con la API de Gemini (actualmente no utilizado).
    - `AudioService.ts`: Gestiona la reproducción de audio.
    - `useScheduledNotifications.ts`: Hook personalizado para el sistema de notificaciones y alarmas automáticas.
  - `data/`: Datos estáticos de la aplicación (horarios, planes nutricionales, etc.).
  - `types.ts`: Definiciones de tipos TypeScript, incluyendo `ScheduledActivity` con categorías para fondos dinámicos.

## 5. Integración del Plan de Entrenamiento del Coach

La aplicación carga automáticamente las rutinas del coach en un horario semanal fijo:

- **Lunes**: TORSO A (Press plano, Press militar, Fondos, Jalón, Remo T, Curl inclinado)
- **Martes**: PIERNA A (Sentadilla hack, Curl femoral, Búlgaras, Extensiones tobillo, Plancha)
- **Miércoles**: Cardio y Calistenia (Bicicleta, estiramientos, flexiones, dominadas, sentadillas, fondos, plancha, movilidad - SIN PESAS)
- **Jueves**: TORSO B (Press muy inclinado, Press semi inclinado, Dominadas, Remo mancuerna, Elevaciones laterales, Press francés)
- **Viernes**: PIERNA B (Sentadilla pendular, Hip thrust, Femoral sentado, Extensiones rodilla, Extensiones tobillo sentado, Crunch abdominal)
- **Sábado/Domingo**: Descanso

### Rutina Matutina (Lunes-Viernes):
- **4:30-4:40**: Respiración consciente + Audio de reprogramación (10 min)
- **4:40-4:45**: Vestirse y aseo personal (5 min)
- **4:45-4:52**: Preparar batido preentreno (7 min)
- **4:52-5:00**: Trotar al gimnasio (8 min)
- **5:00-6:45**: Entrenamiento (1h 45min)

### Características del Sistema de Entrenamiento:
- Cada ejercicio tiene un **UUID único** para mantener el historial intacto al reordenar
- **Selector de día** en el Planner para revisar cualquier día de la semana
- **Tracker en vivo** para registrar series, peso, repeticiones y RPE
- **Historial detallado** por ejercicio con detección de sobrecarga progresiva

## 6. Notas Técnicas Importantes

### Compatibilidad con Navegadores
⚠️ **IMPORTANTE**: Este proyecto usa módulos ES6 y está diseñado para ejecutarse en navegadores modernos. 

**Errores Comunes:**
- ❌ **NO usar `require()`** en componentes React - causa error `require is not defined`
- ✅ **SÍ usar `import`** para todos los módulos y servicios
- ✅ Ejemplo correcto: `import { ScheduleService } from '../services/ScheduleService';`

### Gestión de Estado
- El `ScheduleService` es un **Singleton** que maneja toda la persistencia en `localStorage`
- Los horarios se almacenan por día de la semana (0-6) para permitir configuraciones específicas
- Las rutinas del coach se cargan automáticamente en la inicialización

## 7. Próximos Pasos

Consulte el archivo `tareas.md` para ver una lista detallada de las próximas tareas de desarrollo.
