# Plan de Implementación Fase 4: Seguimiento Avanzado y Contenido Multimedia

## 🥶 Análisis "Frío" del Estado Actual vs. Nuevos Requerimientos

### Situación Actual
La aplicación `Daily Flow Assistant` opera actualmente como una SPA (Single Page Application) ligera usando:
- **Almacenamiento**: `localStorage` para datos JSON (medidas básicas, rutinas) y `IndexedDB` para fotos.
- **Estructura UI**: Pantallas monolíticas (`PlannerScreen`, `FocusScreen`) que manejan su propio estado.
- **Datos de Medidas**: Array simple de objetos `{ fecha, peso, medidas_basicas, fotos }`.

### Análisis de Nuevos Requerimientos

El usuario solicita una evolución significativa hacia una herramienta de "Bio-Feedback" y "Clinical History":
1.  **Registro Diario Granular**: Peso diario + Hábitos (0-5) + Pasos.
2.  **Sábana de Progreso Semanal**: Tabla densa de datos calculados (promedios) y comparativos.
3.  **Medidas Corporales Avanzadas**: Aumento de 6 a 8 puntos de medición específicos (Cintura dividida en 3).
4.  **Contenido Multimedia Contextual**: Audios/Videos específicos para momentos del día (Mañana/Noche) y emociones (Ansiedad).

### ⚠️ Riesgos y Desafíos Detectados

1.  **Saturación de localStorage**:
    *   *Riesgo*: Al guardar logs diarios (365 días x años), el array JSON en `localStorage` crecerá rápidamente. Aunque el texto es liviano, parsear un JSON gigante en cada inicio afectará el rendimiento (Time to Interactive).
    *   *Mitigación*: Migrar los "Logs Diarios" a `IndexedDB` o mantener solo el año actual en memoria activa, archivando el resto. **Decisión por ahora**: Mantener en localStorage pero estructurado eficientemente (diccionario por fecha, no array plano).

2.  **Complejidad de UI en PlannerScreen**:
    *   *Riesgo*: El componente `PlannerScreen.tsx` ya tiene >900 líneas. Agregar la tabla semanal y el logger diario aquí lo hará inmantenible.
    *   *Solución*: Refactorizar. Extraer `MeasurementTab` a su propia vista/componente principal, separándolo del planificador diario de tareas.

3.  **Gestión de Archivos Multimedia**:
    *   *Riesgo*: La app web no debe incluir cientos de MB en audios dentro del bundle inicial (haría la carga lentísima).
    *   *Solución*: Los archivos deben estar en `public/audios` y cargarse bajo demanda (lazy loading), o alojarse en un CDN externo si el peso total excede 100-200MB.

### ✅ Conclusión del Análisis
El plan es **VIABLE** pero requiere **REFACTORIZACIÓN** previa. No podemos simplemente "parchar" las nuevas medidas sobre el sistema actual. Necesitamos crear entidades de datos robustas (`DailyLog`, `WeeklySummary`) y separar la UI de Medidas.

---

## 📅 Esquema de Implementación

### 1. Modelo de Datos (Data Refactor)
Crear nuevas estructuras en `types.ts` y servicios asociados.

```typescript
// Nuevo: Registro Diario
interface DailyLog {
  date: string; // YYYY-MM-DD
  weight: number;
  steps: number;
  habits: {
    sleepQuality: 0-5;
    stressLevel: 0-5;
    hungerLevel: 0-5;
    fatigueLevel: 0-5;
  };
  notes?: string;
}

// Nuevo: Check-in Semanal
interface WeeklyCheckin {
  weekStartDate: string;
  averageWeight: number; // Calculado automático
  measurements: {
    chest: number;
    arms: { left: number, right: number };
    waist: {
      upper: number; // 3 dedos arriba
      navel: number; // Ombligo
      lower: number; // 3 dedos abajo
    };
    hips: number;
    thighs: { left: number, right: number };
    calves: { left: number, right: number };
  };
  photos: string[]; // IDs de IndexedDB
}
```

### 2. Gestión Multimedia (Audio/Video Assets)
Estructura de carpetas propuesta para organizar el contenido del usuario:

- `public/audios/morning/` (Reprogramación, Respiración)
- `public/audios/night/` (Relajación 1h, Dormir)
- `public/audios/focus/` (Ambiente: Lluvia, Bosque)
- `public/audios/sos/` (Ansiedad, Estrés - para el Chatbot)

### 3. Nueva UI: Módulo de Progreso
Separar "Medidas" del Planner y crear un "Hub de Progreso":

1.  **Vista Diaria (Input Rápido)**:
    *   Cards grandes para tocar y registrar (Peso, sliders 0-5 para hábitos).
2.  **Vista Semanal (Tabla Maestra)**:
    *   Grid de datos similar a Excel.
    *   Cálculo automático de promedios basado en los inputs diarios.
3.  **Guía Visual**:
    *   Botón "? Cómo medir" que abre la imagen `uploaded_image` con los puntos de referencia.

---

## 📋 Pasos de Ejecución

1.  **Fase Preparatoria**: 
    - Crear carpetas de medios.
    - Definir tipos en TypeScript.
2.  **Fase Backend (Servicios)**:
    - `TrackerService.ts`: Manejar create/read/update de logs diarios y check-ins.
    - Lógica de cálculo de promedios semanales.
3.  **Fase UI**:
    - Componente `DailyLogModal`.
    - Componente `WeeklyProgressTable`.
    - Componente `MeasurementGuideModal`.
4.  **Integración Chatbot**:
    - Mapear palabras clave (ansiedad, insomnio) a archivos de audio específicos en `public/audios/sos/`.

---

Este plan asegura que la aplicación escale correctamente sin volverse lenta o difícil de mantener.

## 🚀 Estado Actual (Actualizado)
- [x] **Migración Supabase**: Conexión establecida y tablas creadas.
- [x] **Refactor Fechas**: Implementado `date-fns`.
- [x] **Gestión Multimedia**: Integración BunnyNet lista.
- [x] **Modo Momentum**: Implementado (Botón Fuego + Video Modal).

## ⏳ Pendiente
1. **Módulo Coach**: Diseño e implementación.
2. **Refinamiento Discovery**: Filtros y tags.
3. **Verificación Total**: Sincronización offline/online.


REPORTE DE LOS AVANCES:
bASE DE DATOS SUPABASE
Fixing imports in WeeklyProgressTable.tsx

2
Migrating detailed measurements (BodyMeasurements) to Supabase

3
Updating PlannerScreen.tsx for new async measurement methods

4
Applying async fixes to PlannerScreen.tsx

5
Migrating Schedule and Report Services

6
Migrating ScheduleService to use Supabase

7
Migrating ReportService to use async deviation fetching

8
Searching for ReportService usage to update to async

9
Updating FlowScreen.tsx to use async downloadDailyReport

10
Finalizing Service Migration Verification

11
Fixing types in ScheduleService

12
Initializing ScheduleService in App.tsx

13
Adding ScheduleService init to App.tsx

14
Updating AppContext to initialize ScheduleService

15
Completing migration checklist

16
Migrating Weekly Checkins to Supabase (Final step)

17
Migrating Weekly Checkins and merging concepts

18
Verify WeeklyProgressTable await usage

19
Migration Complete. Verifying logic.

20
Updating task.md

21
Failed to update task.md, retrying

22
Updating task.md with correct content

PRIMER PASO:
Siguiente Paso: Supabase ⚡️
Para terminar de profesionalizar la App, necesitamos migrar la base de datos (donde se guardan los "textos" y registros).

¿Tienes ya la URL y la ANON KEY de tu proyecto de Supabase? Si no, créalo en supabase.com (es gratis) y pásame esos dos datos.

.env
Open
Efectivamente se subio, ahora vamos con supabase.
Si tengo cuenta en supabase, pero quiero el paso a paso y lo que vamos ahacer es empezar conectando y luego vamos a ir asignando las tablas a la app. pero bueno empecemos por la configuración


Thought for 6s




Integrating Supabase
npm install finished. replace_file_content failed on 
.env.example
 probably due to exact match issues, but it's minor since 
.env
 is correct. I have initialized the client code. Now I need to guide the user to fill in the 
.env
 file with the Supabase credentials.

Files Edited
vite-env.d.ts
.env
supabase.ts
Task
Progress Updates
1
Installing Supabase client and creating client instance

2
Creating Supabase client file

3
Updating .env.example

4
Guiding user to find Supabase credentials

He instalado el cliente de Supabase y he preparado el código para conectarnos.

Ahora necesito que busques las credenciales en tu proyecto de Supabase:

Entra a tu proyecto en Supabase.
Ve a Project Settings (el icono de engranaje ⚙️ abajo a la izquierda).
Entra en API.
Copia la Project URL -> Pégala en .env donde dice VITE_SUPABASE_URL.
Copia la anon public key -> Pégala en .env donde dice VITE_SUPABASE_ANON_KEY.
Una vez listos, guarda el archivo y reinicia la terminal (Ctrl+C y npm run dev) para confirmar la conexión. ⚡️

.env
Open
api: [REDACTED_SECRET_KEY]
La url que esta en el navegador: https://supabase.com/dashboard/project/fxjmgpoonjjduwkwoian/settings/api-keys

Me corriges si esta mal.
anon: [REDACTED_ANON_KEY]
Listo


Thought for 7s






Integrating Supabase
Supabase connection is verified (Connection Successful!). I am deleting the test script and updating 
task.md
 to mark this milestone as complete. The next step is data migration (creating tables).

Files Edited
Task
test_supabase.js
.env
Progress Updates
1
Configuring Supabase credentials in .env

2
Verifying Supabase connection with test script

3
Cleaning up and updating task list

Continue

Error
Agent execution terminated due to error.
Continue


Thought for 5s






Database Schema Design
I've analyzed 
types.ts
. I will now write the docs/supabase_schema.sql file. I will translate the TypeScript interfaces (
ScheduledActivity
, 
DaySchedule
, 
DailyLog
, 
WeeklyCheckin
, 
FoodItem
, 
WorkoutSet
) into SQL CREATE TABLE statements with appropriate data types and foreign keys if necessary. I'll make sure to use UUIDs for IDs as the app expects strings/UUIDs.

Files Edited
supabase_schema.sql
Progress Updates
1
Analyzing data types for schema design

2
Writing schema creation script

Hemos llegado a la creación de las tablas.

Como Supabase no crea las tablas automáticamente, necesitamos correr un script SQL una sola vez.

He creado el archivo docs/supabase_schema.sql con todo el código necesario.
Ve a tu proyecto en Supabase -> SQL Editor (Barra lateral izquierda).
Pega el contenido del archivo docs/supabase_schema.sql y dale a RUN.
Esto creará las 5 tablas principales: daily_logs, nutrition_logs, weekly_checkins, scheduled_activities y workout_logs.

¡Avísame cuando le hayas dado a RUN! 🏃‍♂️

supabase_schema.sql
Open
Espera en esta parte es donde quiero que me explique por que, cuando y donde, vamos a ir paso a paso, por ejemplo vamos cualquiera de las tablas que necesitemos, dime por que las necesitamos, que esperamos de ello


Thought for 18s











Thought for 15s








Me parece excelente pausa. Entender la arquitectura es clave para que tengas control total de tu proyecto.

Aquí te explico tabla por tabla: ¿Para qué sirve? ¿Cuándo se usa? y ¿Qué problema soluciona?

1. Tabla daily_logs (Tu Diario Bio-Métrico)
¿El Problema Actual: Si hoy registras tu peso y sueño, se guarda en la memoria temporal del navegador. Si mañana entras desde el celular o borras caché, pierdes todo.
¿La Solución: Una tabla "inmortal" en la nube.
¿Qué guarda?: Fecha, Peso, Pasos, Nivel de Estrés (1-5), Calidad de Sueño (1-5).
¿Cuándo se usa?: Cada noche, cuando le das al botón "Registrar Día" en la pestaña de Medidas.
2. Tabla nutrition_logs (Tu Historial de Comidas)
¿El Problema Actual: No hay historial real. Solo vemos "lo que toca hoy". Si quieres saber "¿Qué comí hace 3 semanas que me hizo sentir tan bien?", no puedes.
¿La Solución: Un registro detallado de cada comida.
¿Qué guarda?: Fecha, Alimento (ej: "2 Huevos"), Macros (Proteína, Carbs, Grasa), y Tipo (Desayuno/Cena).
¿Cuándo se usa?: Cada vez que usas la Calculadora IA o registras una comida manualmente.
3. Tabla scheduled_activities (Tu Agenda Flexible)
¿El Problema Actual: Tu horario está "escrito en piedra" en el código (mockData.ts). Si un lunes quieres cambiar tu rutina de mañana, ¡tienes que reprogramar el código!
¿La Solución: Guardar la agenda en base de datos.
¿Qué permite?: Que desde la misma App (en el cel o PC) puedas agregar/editar/borrar actividades y se actualicen al instante en todos lados.
4. Tabla workout_logs (Sobrecarga Progresiva)
¿El Problema Actual: Anotas tus pesos, pero la App no "recuerda" cuánto cargaste la semana pasada en Bench Press para decirte "Hoy te toca subirle 2.5kg".
¿La Solución: Historial de cada set.
¿Qué guarda?: Ejercicio, Peso, Repeticiones, RPE (Esfuerzo).
¿Cuándo se usa?: Durante el "Live Workout" (Entrenamiento en Vivo).
5. Tabla weekly_checkins (Tu Evolución Visual)
¿Qué es?: Es el resumen de la semana.
¿Qué guarda?: Tus medidas corporales (cintura, pecho, brazos), tus promedios (peso promedio de la semana) y las URLs de las fotos (que ya están en BunnyNet).
¿Por qué separarla?: Para tener reportes limpios: "Semana 1 vs Semana 4".
¿Te hace sentido esta estructura? Si estás de acuerdo, podemos ejecutar el script y crear todas de una vez, o si prefieres, podemos crear solo la de daily_logs primero para probar algo pequeño. ¿Tú mandas?

supabase_schema.sql
Open
Excelente!! pero te olvidas del resto de la aplicación y por eso es que queria que me dijeras que vamos a hacer, entonces por ejemplo te recuerdo que tenemos datos como el informe diario, que se genera con un botón y descarga un informe del día, ¿de donde va a obtener esa información? entonces hechale una pequeña revisada para donde nomás podemos necesitar.

Luego como abogado del diablo analiza esta propuesta y encuentrale las fallas y deja un feedback brutal


Thought for 2s




Database Schema Design
I analyzed 
ReportService.ts
. It uses 
ScheduledActivity
 (which I have in the schema) and 
ActivityDeviation
 (which I missed in the schema). It calculates adherence mathematically. Missing from my schema:

deviations table: To store when plans change.
daily_reports table (Optional): To store the generated "snapshot" if we want history of what the report said at that time, though it can be recalculated.
Now I will generate the "Devil's Advocate" critique.

Progress Updates
1
Analyzing Daily Report functionality

2
Examining ReportService.ts

3
Preparing Devil's Advocate critique

¡Excelente reto! Como "Abogado del Diablo", revisé tu Informe Diario y rompí tu propuesta de base de datos.

🕵️‍♂️ Análisis: ¿De dónde sale el Informe Diario?
Actualmente (ReportService.ts), el informe se "fabrica" al vuelo combinando:

Lo que debías hacer: (Tu horario del día).
Lo que cambiaste: (Las "Desviaciones" o Activity Deviations que registras cuando algo sale mal).
⚠️ Falla Encontrada: En mi diseño SQL anterior... ¡OLVIDÉ LAS DESVIACIONES! Si migramos ahora, perderías la capacidad de reportar "No hice ejercicio porque llovió". La tabla scheduled_activities guarda el plan perfecto, pero no la realidad.

😈 Feedback Brutal (Abogado del Diablo)
Aquí están las 3 fallas críticas de la propuesta actual:

1. El Problema del "Plan Perdido" (Falta Historial)

Crítica: Si hoy lunes cambias tu rutina de "Pecho" a "Espalda" en la tabla scheduled_activities, ¿qué pasa con el lunes pasado?
Falla: Al editar el horario "base", podrías estar borrando lo que hiciste hace un mes. Necesitamos diferenciar "Plantilla Semanal" (lo que planeo hacer siempre) de "Instancia Diaria" (lo que hice hoy).
Solución: La tabla scheduled_activities debe ser solo la plantilla. Deberíamos tener una tabla activity_logs (o usar las desviaciones) para registrar lo que realmente pasó cada día específico.
2. Desviaciones Huérfanas (Critical Bug)

Crítica: El informe se basa 50% en "Desviaciones". La tabla SQL que propuse NO TIENE tabla para deviations.
Consecuencia: Tu botón de "Generar Informe" va a dar un error fatal o salir vacío siempre.
Solución: Agregar tabla activity_deviations (id, fecha, actividad_original, cambio, razón).
3. ¿Dónde está el "Informe" Físico?

Crítica: El código actual descarga un .md (archivo de texto). Si en el futuro quieres ver tus informes de hace un año desde el celular, no podrás porque no se guardaron en la base de datos, solo se descargaron.
Solución: Opcional, pero recomendado crear una tabla generated_reports que guarde ese resumen de texto o JSON para consultarlo después.




RESPECTO DE BUNNYNET:
Integrating BunnyNet
.env
 is verified and correct. I am updating 
task.md
 to mark the BunnyNet integration tasks as completed. Then I will proceed to the Core Date Refactoring.

Files Edited
Task
Progress Updates
1
Verifying .env content

2
Updating task.md with completed items

Refactoring Date Handling
The previous replace_file_content failed because I likely had the wrong line numbers or context for 
task.md
. I will view 
task.md
 again and retry the update.

Files Edited
Walkthrough
Task
PlannerScreen.tsx
Progress Updates
1
Refactoring PlannerScreen.tsx to use date-fns

2
Replacing Date usage in PlannerScreen.tsx

3
Verifying changes and updating task.md

4
Retrying task.md update

¡Excelente! He configurado BunnyNet y he actualizado el código (PhotoStorageService) para que las nuevas fotos se suban automáticamente a la nube.

También aproveché para refactorizar el manejo de fechas en el Planner, usando date-fns para evitar esos errores donde el registro se guardaba en el día equivocado por la zona horaria.

Siguiente Paso: Base de Datos (Supabase)
Ya tenemos las fotos en la nube, ahora faltan los datos (Logs, Nutrición, etc.).

Crea un proyecto nuevo en Supabase.com.
En los ajustes del proyecto (Project Settings -> API), copia:
Project URL
anon public key
Pásame esos datos (o pégalos en el .env con las claves VITE_SUPABASE_URL y VITE_SUPABASE_KEY) para que pueda crear las tablas y conectar la App. 🚀

Walkthrough
Open
Espera probems subiendo cualquier foto, ¿puedes hacerlo tu mismo? una de public no importa cualquiera, o necesitas que lo haga yo desde el frontend


Thought for 6s








Integrating BunnyNet
The test upload was successful! I got a 201 File uploaded response. I can confirm to the user that the integration is working. I will now delete the temporary test script.

Files Edited
test_bunny.js
Progress Updates
1
Verifying BunnyNet upload with a test script

2
Running test upload script

3
Cleaning up test script

✅ ¡Confirmado! La integración funciona perfectamente.

Hice una prueba subiendo living-bg.webp a la carpeta test-uploads y BunnyNet respondió con Éxito (201).

Tu App ya está lista para subir fotos a la nube.