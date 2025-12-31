export type Language = 'es' | 'en';

export const translations = {
    es: {
        // HUD
        date: 'Fecha',
        yearProgress: 'Progreso del Año',
        countdown: 'Cuenta Regresiva',
        orbitMode: 'Modo de Órbita',
        fps: 'FPS',
        days: 'días',
        hours: 'horas',
        minutes: 'minutos',
        seconds: 'segundos',

        // Orbit modes
        calendar: 'Calendario',
        realtime: 'Tiempo Real',

        // Controls
        simulation: 'Simulación',
        timeScale: 'Escala de Tiempo',
        pause: 'Pausar',
        resume: 'Reanudar',
        reset: 'Resetear',

        visual: 'Visual',
        atmosphere: 'Atmósfera',
        clouds: 'Nubes',
        bloom: 'Resplandor',
        orbitRing: 'Anillo Orbital',

        camera: 'Cámara',
        general: 'General',
        followEarth: 'Seguir Tierra',
        closeUp: 'Acercamiento',

        controls: 'Controles',
        language: 'Idioma',
        country: 'País / Festividades',
        quality: 'Calidad Gráfica',
        celebration: 'Celebración',

        qualityLevels: {
            low: 'Baja (Mejor rendimiento)',
            medium: 'Media',
            high: 'Alta (Recomendado)',
            ultra: 'Ultra (Requiere GPU potente)'
        },

        // Hand tracking
        handTracking: 'Seguimiento de Manos',
        enable: 'Activar',
        disable: 'Desactivar',
        status: 'Estado',
        active: 'Activo',
        inactive: 'Inactivo',

        // Privacy modal
        privacyTitle: 'Permiso de Cámara Requerido',
        privacyMessage: 'Esta aplicación utiliza tu cámara para el seguimiento de manos, permitiéndote controlar la escena con gestos.',
        privacyPoints: {
            p1: 'Todo el procesamiento se realiza localmente en tu navegador',
            p2: 'Tus datos de cámara NUNCA se envían a ningún servidor',
            p3: 'Puedes desactivar esta función en cualquier momento'
        },
        accept: 'Aceptar',
        decline: 'Rechazar',

        // Holidays
        holidays: {
            // Global
            newYear: 'Año Nuevo',
            valentines: 'San Valentín',
            springEquinox: 'Equinoccio de Primavera',
            earthDay: 'Día de la Tierra',
            mothersDay: 'Día de las Madres',
            summerSolstice: 'Solsticio de Verano',
            christmas: 'Navidad',
            newYearsEve: 'Víspera de Año Nuevo',

            // Ecuador
            carnivalMonday: 'Lunes de Carnaval',
            carnivalTuesday: 'Martes de Carnaval',
            goodFriday: 'Viernes Santo',
            laborDay: 'Día del Trabajo',
            pichinchaBattle: 'Batalla de Pichincha',
            firstCry: 'Primer Grito de Independencia',
            guayaquilIndependence: 'Independencia de Guayaquil',
            allSouls: 'Día de los Difuntos',
            quitoFoundation: 'Fundación de Quito',

            // USA
            mlkDay: 'Día de Martin Luther King Jr.',
            presidentsDay: 'Día de los Presidentes',
            stPatricks: 'San Patricio',
            easter: 'Domingo de Pascua',
            independenceDay: 'Día de la Independencia',
            laborDayUSA: 'Día del Trabajo',
            halloween: 'Halloween',
            thanksgiving: 'Día de Acción de Gracias',

            // Mexico
            constitutionDay: 'Día de la Constitución',
            benitoJuarez: 'Natalicio de Benito Juárez',
            dayOfDead: 'Día de Muertos',
            revolutionDay: 'Día de la Revolución',
            ladyGuadalupe: 'Día de la Virgen de Guadalupe'
        },

        // Countries
        countries: {
            global: 'Global',
            ecuador: 'Ecuador',
            usa: 'Estados Unidos',
            mexico: 'México',
            colombia: 'Colombia',
            peru: 'Perú'
        },

        // Months
        months: {
            short: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
            long: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
        }
    },

    en: {
        // HUD
        date: 'Date',
        yearProgress: 'Year Progress',
        countdown: 'Countdown',
        orbitMode: 'Orbit Mode',
        fps: 'FPS',
        days: 'days',
        hours: 'hours',
        minutes: 'minutes',
        seconds: 'seconds',

        // Orbit modes
        calendar: 'Calendar',
        realtime: 'Real Time',

        // Controls
        simulation: 'Simulation',
        timeScale: 'Time Scale',
        pause: 'Pause',
        resume: 'Resume',
        reset: 'Reset',

        visual: 'Visual',
        atmosphere: 'Atmosphere',
        clouds: 'Clouds',
        bloom: 'Bloom',
        orbitRing: 'Orbit Ring',

        camera: 'Camera',
        general: 'General',
        followEarth: 'Follow Earth',
        closeUp: 'Close Up',

        controls: 'Controls',
        language: 'Language',
        country: 'Country / Holidays',
        quality: 'Graphics Quality',
        celebration: 'Celebration',

        qualityLevels: {
            low: 'Low (Best performance)',
            medium: 'Medium',
            high: 'High (Recommended)',
            ultra: 'Ultra (Requires powerful GPU)'
        },

        // Hand tracking
        handTracking: 'Hand Tracking',
        enable: 'Enable',
        disable: 'Disable',
        status: 'Status',
        active: 'Active',
        inactive: 'Inactive',

        // Privacy modal
        privacyTitle: 'Camera Permission Required',
        privacyMessage: 'This application uses your camera for hand tracking, allowing you to control the scene with gestures.',
        privacyPoints: {
            p1: 'All processing is done locally in your browser',
            p2: 'Your camera data is NEVER sent to any server',
            p3: 'You can disable this feature at any time'
        },
        accept: 'Accept',
        decline: 'Decline',

        // Holidays
        holidays: {
            // Global
            newYear: 'New Year',
            valentines: "Valentine's Day",
            springEquinox: 'Spring Equinox',
            earthDay: 'Earth Day',
            mothersDay: "Mother's Day",
            summerSolstice: 'Summer Solstice',
            christmas: 'Christmas',
            newYearsEve: "New Year's Eve",

            // Ecuador
            carnivalMonday: 'Carnival Monday',
            carnivalTuesday: 'Carnival Tuesday',
            goodFriday: 'Good Friday',
            laborDay: 'Labor Day',
            pichinchaBattle: 'Battle of Pichincha',
            firstCry: 'First Cry of Independence',
            guayaquilIndependence: 'Guayaquil Independence',
            allSouls: 'All Souls\' Day',
            quitoFoundation: 'Quito Foundation',

            // USA
            mlkDay: 'Martin Luther King Jr. Day',
            presidentsDay: 'Presidents\' Day',
            stPatricks: "St. Patrick's Day",
            easter: 'Easter Sunday',
            independenceDay: 'Independence Day',
            laborDayUSA: 'Labor Day',
            halloween: 'Halloween',
            thanksgiving: 'Thanksgiving',

            // Mexico
            constitutionDay: 'Constitution Day',
            benitoJuarez: 'Benito Juárez Birthday',
            dayOfDead: 'Day of the Dead',
            revolutionDay: 'Revolution Day',
            ladyGuadalupe: 'Our Lady of Guadalupe'
        },

        // Countries
        countries: {
            global: 'Global',
            ecuador: 'Ecuador',
            usa: 'United States',
            mexico: 'Mexico',
            colombia: 'Colombia',
            peru: 'Peru'
        },

        // Months
        months: {
            short: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            long: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
        }
    }
};

class I18n {
    private currentLanguage: Language = 'es'; // Spanish by default
    private listeners: Set<() => void> = new Set();

    constructor() {
        // Load saved language preference
        const saved = localStorage.getItem('language') as Language;
        if (saved && (saved === 'es' || saved === 'en')) {
            this.currentLanguage = saved;
        }
    }

    setLanguage(lang: Language): void {
        this.currentLanguage = lang;
        localStorage.setItem('language', lang);
        this.notifyListeners();
    }

    getLanguage(): Language {
        return this.currentLanguage;
    }

    t(key: string): string {
        const keys = key.split('.');
        let value: any = translations[this.currentLanguage];

        for (const k of keys) {
            value = value?.[k];
            if (value === undefined) {
                console.warn(`Translation missing for key: ${key}`);
                return key;
            }
        }

        return value;
    }

    // Subscribe to language changes
    onChange(callback: () => void): void {
        this.listeners.add(callback);
    }

    // Unsubscribe
    off(callback: () => void): void {
        this.listeners.delete(callback);
    }

    private notifyListeners(): void {
        this.listeners.forEach(callback => callback());
    }
}

export const i18n = new I18n();
