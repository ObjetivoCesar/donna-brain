# Daily Flow Assistant (Mobile App)

## 1. Resumen del Proyecto

**Daily Flow Assistant** es una aplicación móvil nativa (iOS y Android) de asistencia personal. Su objetivo es estructurar y optimizar la rutina diaria del usuario, combinando gestión de horarios, planes de nutrición/entrenamiento y un sistema de apoyo emocional inteligente.

Esta versión se construye desde cero utilizando **React Native con Expo**, abandonando el prototipo web anterior para adoptar una arquitectura robusta, fiable y centrada en el móvil.

## 2. Pilares de la Arquitectura

- **Plataforma:** React Native con Expo (Router).
- **Navegación:** Navegación por pestañas (Tabs) para los tres pilares: **Vivir**, **Motivación** y **Trabajo**.
- **Persistencia y Offline-First:** La funcionalidad crítica (horarios, progreso, apoyo básico) debe funcionar sin conexión a internet. Se usará almacenamiento local (`AsyncStorage` o `SQLite`).
- **Tareas en Segundo Plano:** Las notificaciones, alarmas y recordatorios se gestionarán con `expo-notifications` y `expo-task-manager` para garantizar su ejecución aunque la app esté cerrada.
- **Acceso Nativo:** Se utilizarán APIs nativas (`expo-av` para audio, `expo-haptics`, etc.) para una experiencia de usuario superior.
- **Estrategia de IA Híbrida:** El "Botón de Auxilio" combinará un modelo de clasificación en el dispositivo (on-device) para respuestas instantáneas y offline, con llamadas a la API de Gemini para casos más complejos que requieran conexión.

## 3. Stack Tecnológico

- **Core:** React Native, Expo
- **Lenguaje:** TypeScript
- **Navegación:** Expo Router
- **Notificaciones/Background:** `expo-notifications`, `expo-task-manager`
- **Audio:** `expo-av`
- **Almacenamiento:** `AsyncStorage` (inicialmente), `expo-sqlite` (potencialmente)
- **IA (Online):** Google Gemini API

## 4. Próximos Pasos

Consulte el archivo `tareas.md` para ver el plan de desarrollo detallado.
