import { ScheduledActivity, Meal, Workout } from '../../types';

export const scheduleLunesViernes: ScheduledActivity[] = [
  { time: "4:30-4:35", activity: "Respiración consciente", focus: "Activar oxigenación y sistema nervioso" },
  { time: "4:35-4:50", activity: "Reprogramación mental con audio", focus: "Reforzar propósito y enfoque mental" },
  { time: "4:50-4:55", activity: "Aseo personal y preparación", focus: "Activación física rápida" },
  { time: "4:55-5:00", activity: "Batido preentreno", focus: "Energía inmediata antes del gimnasio" },
  { time: "5:00-6:45", activity: "Entrenamiento en gimnasio", focus: "Desarrollo y definición muscular" },
  { time: "6:45-7:20", activity: "Ducha, orden personal y espacio", focus: "Recuperación y disciplina ambiental" },
  { time: "7:20-7:40", activity: "Meditación matutina", focus: "Calma mental y conexión interior" },
  { time: "7:40-8:00", activity: "Desayuno postentreno", focus: "Recuperación muscular y nutrición" },
  { time: "8:00-10:40", activity: "Desarrollo de objetivos", focus: "Productividad y ejecución estratégica" },
  { time: "10:40-11:00", activity: "Meditación / pausa mental", focus: "Regulación emocional y concentración" },
  { time: "11:00-13:00", activity: "Continuación de trabajo", focus: "Profundización en metas y tareas" },
  { time: "13:00-13:30", activity: "Almuerzo", focus: "Nutrición completa y equilibrio energético" },
  { time: "13:30-14:00", activity: "Visita a padres / tiempo familiar", focus: "Conexión emocional y balance" },
  { time: "14:00-14:30", activity: "Siesta breve", focus: "Recuperación cognitiva y física" },
  { time: "14:30-16:30", activity: "Segundo bloque de trabajo", focus: "Avance en proyectos y objetivos" },
  { time: "16:30-16:50", activity: "Meditación de enfoque", focus: "Reajuste mental y visualización de metas" },
  { time: "17:00-17:20", activity: "Merienda / batido de media tarde", focus: "Energía sostenida y enfoque mental" },
  { time: "17:20-19:00", activity: "Trabajo final / revisión", focus: "Cierre de pendientes y organización" },
  { time: "19:00-20:00", activity: "Cena ligera", focus: "Nutrición consciente y digestión suave" },
  { time: "20:00-22:00", activity: "Tiempo personal / lectura / reflexión", focus: "Crecimiento interior y relajación" },
  { time: "22:00-22:20", activity: "Preparación para el siguiente día", focus: "Organización y autocalificación" },
  { time: "22:20-23:00", activity: "Descanso / relajación / sueño", focus: "Recuperación total y regeneración muscular" },
];

export const nutritionalPlanLunesViernes: Meal[] = [
    { time: "4:30 a.m.", meal: "Hidratación + Activación", description: "1 vaso de agua con limón + 5 minutos de respiración consciente." },
    { time: "4:35 a.m.", meal: "Reprogramación / Pre-entreno", description: "1 café negro sin azúcar + 1 cucharadita de miel + 10 almendras." },
    { time: "6:45 a.m.", meal: "Post entreno", description: "Batido de recuperación: 1 plátano maduro + 1 scoop de proteína (30 g) + 1 cucharadita de mantequilla de maní + 300 ml de agua + 3 cubos de hielo." },
    { time: "8:00 a.m.", meal: "Desayuno", description: "Desayuno fuerte energético: 4 claras + 2 huevos enteros revueltos con espinaca, cebolla y tomate. 2 rebanadas de pan integral o avena cocida con canela. 1 vaso de agua tibia." },
    { time: "10:30 a.m.", meal: "Snack de media mañana", description: "Snack regenerativo: 1 manzana + 15 nueces o almendras." },
    { time: "1:00 p.m.", meal: "Almuerzo", description: "Comida base: 150 g de pechuga de pollo a la plancha o pescado blanco. ½ taza de arroz integral o quinoa + ensalada mixta (brócoli, pepino, zanhoria) + 1 cucharada de aceite de oliva." },
    { time: "4:30 p.m.", meal: "Merienda ligera / media tarde", description: "Batido de soporte: ½ aguacate + 1 scoop de proteína + 1 cucharadita de cacao puro + 250 ml de agua + 1 cubo de hielo." },
    { time: "7:00 p.m.", meal: "Cena ligera", description: "Cena funcional: 1 porción de pescado al vapor o tofu + vegetales cocidos (brócoli, zanahoria, calabacín) + 1 cucharada de semillas de chía." },
    { time: "10:00 p.m.", meal: "Pre descanso", description: "Infusión relajante: 1 taza de manzanilla o té de valeriana." },
];

export const scheduleSabado: ScheduledActivity[] = [
    { time: "6:00-6:05", activity: "Despertar + Respiración", focus: "Activar el sistema nervioso parasimpático." },
    { time: "6:05-6:20", activity: "Reprogramación mental", focus: "Afirmaciones positivas y visualización guiada para bienestar y productividad." },
    { time: "6:20-7:00", activity: "Aseo personal y organización", focus: "Ducha fría y limpieza inicial del cuarto." },
    { time: "7:00-8:00", activity: "Desayuno regenerativo", focus: "Nutrición para empezar el día." },
    { time: "8:00-10:00", activity: "Organización y limpieza de la casa", focus: "Limpieza general y planificación del hogar." },
    { time: "10:00-13:00", activity: "Bloque de trabajo", focus: "Seguimiento de clientes, análisis de métricas o contenido digital." },
    { time: "13:00-14:00", activity: "Almuerzo familiar", focus: "Conexión y nutrición." },
    { time: "14:00-16:00", activity: "Sesión de calistenia", focus: "Entrenamiento en gimnasio." },
    { time: "16:00-16:30", activity: "Batido post entrenamiento", focus: "Recuperación muscular." },
    { time: "16:30-18:00", activity: "Actividades domésticas / descanso activo", focus: "Actividad ligera y organización." },
    { time: "18:00-19:00", activity: "Cena ligera", focus: "Nutrición balanceada." },
    { time: "19:00-21:00", activity: "Tiempo de distracción / descanso", focus: "Película, lectura o conversación familiar." },
    { time: "21:00-21:30", activity: "Meditación y preparación", focus: "Reflexión del día y agradecimiento." },
    { time: "21:30-23:59", activity: "Descanso", focus: "Dormir. No ingerir alimentos desde las 9:00 p.m." },
];

export const nutritionalPlanSabado: Meal[] = [
    { time: "7:00 a.m.", meal: "Desayuno", description: "2 huevos + 3 claras revueltos, pan integral, aguacate, jugo verde." },
    { time: "10:00 a.m.", meal: "Snack", description: "1 manzana + 10 almendras." },
    { time: "1:00 p.m.", meal: "Almuerzo", description: "Pollo/pescado, arroz integral, ensalada fresca. Evitar limón natural en la ensalada." },
    { time: "4:00 p.m.", meal: "Post Gym", description: "Batido proteico con plátano. Consumir máximo 15 min después de entrenar." },
    { time: "6:00 p.m.", meal: "Cena", description: "Verduras al vapor + proteína liviana. No agregar carbohidratos." },
];

export const scheduleDomingo: ScheduledActivity[] = [
    { time: "8:00-11:00", activity: "Mañana libre", focus: "Desayuno y actividades recreativas suaves." },
    { time: "11:00-13:30", activity: "Snack y descanso", focus: "Actividad libre, lectura o paseo." },
    { time: "13:30-17:00", activity: "Almuerzo familiar", focus: "Conexión familiar y recuperación." },
    { time: "17:00-19:30", activity: "Merienda ligera", focus: "Descanso y relajación." },
    { time: "19:30-22:00", activity: "Cena ligera", focus: "Preparación para la semana." },
    { time: "22:00-23:59", activity: "Descanso", focus: "Infusión relajante y sueño." },
];

export const nutritionalPlanDomingo: Meal[] = [
    { time: "8:00 a.m.", meal: "Desayuno", description: "Avena cocida con canela, 1 cucharadita de miel, ½ manzana en cubos, y 1 taza de café sin azúcar." },
    { time: "11:00 a.m.", meal: "Snack", description: "1 yogurt natural con 10 nueces." },
    { time: "1:30 p.m.", meal: "Almuerzo familiar", description: "Pollo al horno o pescado a la parrilla, ensalada verde variada, ½ taza de arroz o papa cocida, agua natural." },
    { time: "5:00 p.m.", meal: "Merienda ligera", description: "1 batido natural (1 plátano + 1 cucharadita de cacao + 200 ml de agua)." },
    { time: "7:30 p.m.", meal: "Cena ligera", description: "Sopa de verduras o crema de zapallo, 1 rebanada de pan integral, té de manzanilla." },
    { time: "10:00 p.m.", meal: "Antes de dormir", description: "Infusión relajante de valeriana o toronjil. Sin alimentos sólidos." },
];

export const weeklyWorkout: Workout[] = [
    {
        day: "Lunes",
        focus: "Pecho y Tríceps",
        duration: "5:00 - 6:45 a.m.",
        exercises: [
            { name: "Press de banca con barra", setsReps: "4x10" },
            { name: "Press inclinado con mancuernas", setsReps: "4x12" },
            { name: "Aperturas en banco plano", setsReps: "3x15" },
            { name: "Fondos entre paralelas", setsReps: "3x12" },
            { name: "Press francés con barra Z", setsReps: "3x12" },
            { name: "Extensión de triceps con cuerda", setsReps: "3x15" },
        ],
        final: "10 minutos de planchas isométricas + estiramiento de pectorales."
    },
    {
        day: "Martes",
        focus: "Espalda y Bíceps",
        exercises: [
            { name: "Dominadas asistidas o libres", setsReps: "4x10" },
            { name: "Remo con barra", setsReps: "4x12" },
            { name: "Jalón al pecho", setsReps: "3x15" },
            { name: "Curl con barra recta", setsReps: "3x12" },
            { name: "Curl alterno con giro", setsReps: "3x15" },
            { name: "Curl concentrado", setsReps: "3x12" },
        ],
        final: "10 minutos de abdominales (bicicleta + elevaciones de piernas)."
    },
    {
        day: "Miércoles",
        focus: "Piernas (día fuerte)",
        exercises: [
            { name: "Sentadilla en Smith", setsReps: "5x10" },
            { name: "Prensa inclinada", setsReps: "4x12" },
            { name: "Peso muerto rumano", setsReps: "4x10" },
            { name: "Extensiones de cuadriceps", setsReps: "3x15" },
            { name: "Curl femoral acostado", setsReps: "3x15" },
            { name: "Elevaciones de talones de pie", setsReps: "4x20" },
        ],
        final: "Caminata 10 min + estiramiento profundo."
    },
    {
        day: "Jueves",
        focus: "Hombros y Core",
        exercises: [
            { name: "Press militar con barra", setsReps: "4x10" },
            { name: "Elevaciones laterales", setsReps: "4x12" },
            { name: "Pájaros (posterior)", setsReps: "3x15" },
            { name: "Encogimientos con mancuernas", setsReps: "3x20" },
            { name: "Plancha lateral", setsReps: "3x1 min por lado" },
            { name: "Crunch con cuerda", setsReps: "3x15" },
        ]
    },
    {
        day: "Viernes",
        focus: "Full Body + Cardio",
        exercises: [
            { name: "Sentadillas frontales", setsReps: "3x15" },
            { name: "Peso muerto convencional", setsReps: "3x12" },
            { name: "Press de banca", setsReps: "3x12" },
            { name: "Remo con barra", setsReps: "3x12" },
            { name: "Curl de bíceps + extensiones de triceps (bisérie)", setsReps: "3x15" },
        ],
        final: "Cardio final: caminata inclinada 20 min o bicicleta estática 25 min."
    },
    {
        day: "Sábado",
        focus: "Sesión de calistenia",
        exercises: [
            { name: "Dominadas asistidas", setsReps: "4x10" },
            { name: "Flexiones de brazos", setsReps: "4x15" },
            { name: "Sentadillas con peso corporal", setsReps: "4x20" },
            { name: "Fondos en paralelas", setsReps: "3x12" },
            { name: "Plancha isométrica", setsReps: "3x1 min" },
        ],
        final: "10 min de estiramiento + respiración consciente."
    }
];
