# 📘 Manual Integral: Daily Flow Assistant (TDAH & Fitness)

> **Versión del Documento:** 2.0 (Fase de Producción en Nube)
> **Última Actualización:** Diciembre 2024

---

## 🏗️ 1. ¿Qué es esta aplicación?

**Daily Flow Assistant** es una "Segunda Cerebro" diseñado específicamente para personas con TDAH que buscan optimizar su vida diaria y su físico. No es solo una agenda, es un **sistema de comportamiento**.

### Filosofía Central
*   **Reducir la Fricción:** Todo está a un clic. Menos pasos = más probabilidades de hacerlo.
*   **Visualización del Progreso:** Lo que no se mide, no se mejora. Gráficos, fotos y tablas claras.
*   **Gestión de Energía, no solo de Tiempo:** El "Daily Flow" se adapta a tu nivel de energía (Baja/Media/Alta).

---

## 🚀 2. Guía de Funcionalidad (Navegación 4-Tabs)

El sistema se organiza en 4 pilares fundamentales, accesibles desde la barra inferior:

### ☀️ 1. Mi día (Ejecución)
*   **Propósito:** Tu centro de mando para el "Ahora".
*   **Funcionalidades:**
    *   **Actividad Actual:** Tarjeta grande que te dice qué hacer en este momento.
    *   **Reloj Digital:** Para mantenerte consciente del tiempo.
    *   **Botón Auxilio:** Acceso rápido a audios de crisis (Ansiedad, Pánico).
    *   **Informe Diario:** Genera un reporte de cómo te fue (incluyendo desviaciones si no cumpliste el plan).

### 📝 2. Registro (Tracking)
*   **Propósito:** Donde mides tu progreso físico y mental.
*   **Funcionalidades:**
    *   **Pestaña Progreso:** Tabla semanal de peso, hábitos y medidas.
    *   **Pestaña Nutrición:** Dashboard de calorías y macros (integrado con IA).
    *   **Pestaña Entreno:** Vista de tu rutina de hoy con botón para iniciar "Live Workout".
    *   **Fotos:** Galería de evolución visual.

### 🧘 3. Apoyo (Bienestar)
*   **Propósito:** Herramientas para tu cerebro y estado emocional.
*   **Funcionalidades:**
    *   **Modo Enfoque:** Temporizador Pomodoro + Sonidos Ambientales (Lluvia, Bosque, Café).
    *   **Reproductor Global:** El audio sigue sonando aunque cambies de pestaña.
    *   **Biblioteca SOS:** Audios guiados para reprogramación y calma.

### ⚙️ 4. Ajustes (Gestión)
*   **Propósito:** El "Admin Panel" de tu vida.
*   **Funcionalidades:**
    *   **Editar Horario:** Modifica tu rutina diaria (Lunes a Domingo).
    *   **Editar Comidas:** Ajusta tu plan nutricional.
    *   **Editar Rutinas:** Cambia tus ejercicios y metas.
    *   **Data:** Exportar/Importar copias de seguridad.

---

## ⚙️ 3. Arquitectura Técnica (Estado Actual)

### 🌐 A. Almacenamiento en la Nube (Supabase + BunnyNet)

#### **Base de Datos: Supabase (PostgreSQL)**
*   **Estado Actual:** Todos tus datos textuales (logs diarios, medidas, horarios, desviaciones, informes) se guardan en **Supabase**, una base de datos en la nube.
*   **Ventajas:**
    *   ✅ **Acceso Multi-Dispositivo:** Puedes abrir la app desde tu PC, celular o tablet y ver los mismos datos.
    *   ✅ **Backup Automático:** Supabase hace respaldos automáticos. No pierdes nada si borras el caché del navegador.
    *   ✅ **Escalabilidad:** Soporta años de registros sin ralentizarse.
*   **Tablas Principales:**
    *   `daily_logs`: Registros diarios (peso, pasos, hábitos).
    *   `weekly_checkins`: Check-ins semanales con medidas corporales.
    *   `scheduled_activities`: Tu horario personalizado.
    *   `activity_deviations`: Cambios de plan registrados.
    *   `daily_reports`: Historial de informes generados.

#### **Almacenamiento de Fotos: BunnyNet CDN**
*   **Estado Actual:** Las fotos de progreso se suben a **BunnyNet**, un servicio de almacenamiento en la nube optimizado para imágenes.
*   **Ventajas:**
    *   ✅ **Sin Límites de Tamaño:** Puedes subir cientos de fotos sin llenar tu navegador.
    *   ✅ **Carga Rápida:** Las fotos se sirven desde un CDN global (más rápido que tu hosting).
    *   ✅ **Seguridad:** Las URLs son únicas y solo tú puedes acceder a ellas.
*   **Proceso:**
    1.  Subes una foto desde el Check-in Semanal.
    2.  La app la comprime automáticamente (80% calidad, máx 1920px).
    3.  Se sube a BunnyNet y se guarda la URL en Supabase.

### 🛡️ B. Resiliencia Offline (SyncQueue)

*   **Problema Resuelto:** Si se va el internet mientras registras datos, antes se perdían. Ahora no.
*   **Solución Implementada:**
    *   Cuando intentas guardar algo (log diario, check-in) y falla la conexión, la app lo detecta automáticamente.
    *   Los datos se guardan en una **"Cola de Sincronización"** local (localStorage).
    *   Cuando recuperas internet (o recargas la app), la cola se procesa automáticamente y sube todo a Supabase.
*   **Indicador Visual:** Verás un mensaje en consola: `"🔄 Processing X offline actions..."` cuando esto ocurra.

### ⚡ C. Optimización de Rendimiento

*   **Problema Resuelto:** Al acumular meses de datos, la app se volvía lenta al cargar todo el historial.
*   **Solución Implementada:**
    *   **Paginación Inteligente:** La tabla de progreso semanal solo carga los últimos **60 días de logs** y **12 semanas de check-ins**.
    *   **Lazy Loading:** Las fotos solo se cargan cuando las abres en la galería.
*   **Resultado:** La app carga igual de rápido aunque tengas 2 años de datos.

### 🔒 D. Seguridad (Preparación Multi-Usuario)

*   **Estado Actual:** La base de datos tiene columnas `user_id` en todas las tablas, pero aún no hay sistema de login.
*   **Uso Actual:** Todas las políticas de seguridad están en modo "permisivo" (cualquiera con la URL puede acceder).
*   **Próximos Pasos:** Cuando implementemos autenticación (Google/Email), activaremos las políticas RLS (Row Level Security) para que cada usuario solo vea sus propios datos.

---

## 🗺️ 4. Hoja de Ruta (Roadmap)

### ✅ Completado (Diciembre 2024)
1.  ✅ **Migración a Supabase:** Base de datos en la nube.
2.  ✅ **Integración BunnyNet:** Fotos en CDN.
3.  ✅ **SyncQueue:** Resiliencia offline.
4.  ✅ **Optimización de Rendimiento:** Paginación y lazy loading.
5.  ✅ **Preparación de Seguridad:** Estructura multi-usuario lista.

### 🔜 Próximos Pasos (Q1 2025)
1.  **Autenticación de Usuarios:** Login con Google/Email.
2.  **App Móvil Nativa:** Empaquetar como app Android/iOS (Capacitor).
3.  **IA Entrenadora:** Análisis de fotos y sugerencias personalizadas.
4.  **Exportación de Fotos:** Incluir fotos en el backup JSON.

### 🔮 Fase Futura
1.  **Gamificación Social:** Comparar progreso (anónimo) con otros usuarios.
2.  **Integración con Wearables:** Sincronizar pasos/sueño desde smartwatch.
3.  **Modo Offline Completo:** Funcionar 100% sin internet y sincronizar después.

---

## 📊 5. Información Técnica para Desarrolladores

### Stack Tecnológico
*   **Frontend:** React + TypeScript + Vite
*   **Base de Datos:** Supabase (PostgreSQL)
*   **CDN de Imágenes:** BunnyNet
*   **Almacenamiento Local:** IndexedDB (fotos temporales) + localStorage (cola de sincronización)
*   **Gestión de Fechas:** date-fns (UTC)

### Variables de Entorno Requeridas
```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
VITE_BUNNY_STORAGE_ZONE=tu-storage-zone
VITE_BUNNY_ACCESS_KEY=tu-access-key
VITE_BUNNY_CDN_URL=https://tu-cdn.b-cdn.net
```

### Servicios Principales
*   `ScheduleService.ts`: Gestión de horarios y cola de sincronización de actividades.
*   `MeasurementService.ts`: Gestión de logs diarios, historial y medidas.
*   `SyncQueue.ts`: Motor de resiliencia offline (gestiona la cola de acciones pendientes).
*   `PhotoStorageService.ts`: Gestión híbrida de fotos (IndexedDB local -> BunnyNet nube).
*   `ReportService.ts`: Generación de informes de adherencia.
*   `AppContext.tsx`: Estado global (Audio, Horario, Actividad Actual).

---

**Nota Final:** Esta aplicación es ahora una **solución profesional en producción**. Todos los datos están respaldados en la nube y la app funciona incluso sin internet gracias al sistema de sincronización automática.
