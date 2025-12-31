export const CONFIG = {
    // Timezone configuration
    TIMEZONE: 'America/Guayaquil', // UTC-05

    // Orbital parameters (in AU and degrees)
    EARTH_ORBIT_RADIUS: 50, // Increased for better holiday marker spacing
    EARTH_RADIUS: 2,
    SUN_RADIUS: 5,

    // Rotation speeds (degrees per second at normal time scale)
    EARTH_ROTATION_SPEED: 15, // One full rotation every 24 seconds (demo speed)
    CLOUD_ROTATION_SPEED: 10,

    // Visual settings
    ATMOSPHERE: {
        enabled: true,
        intensity: 1.0
    },

    CLOUDS: {
        enabled: true,
        opacity: 0.4
    },

    NIGHT_LIGHTS: {
        enabled: true,
        intensity: 1.0
    },

    ORBIT_RING: {
        enabled: true,
        showMonthMarkers: true
    },

    // Performance
    MAX_DPR: 2,
    TARGET_FPS: 60,

    // Hand tracking
    HAND_TRACKING: {
        enabled: false, // Default off
        fps: 25,
        videoWidth: 640,
        videoHeight: 360,
        smoothingFactor: 0.3 // EMA smoothing
    },

    // Simulation
    SIMULATION: {
        defaultTimeScale: 1.0, // 1.0 = real time
        maxTimeScale: 365 * 24, // Max: 1 year per hour
        minTimeScale: 0
    }
};

// Export BLOOM separately for post-processing
export const BLOOM = {
    enabled: true,
    strength: 0.5,
    radius: 0.4,
    threshold: 0.85
};

// Graphics quality settings (continued after BLOOM)
export enum GraphicsQuality {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    ULTRA = 'ultra'
}

export const QUALITY_PRESETS = {
    [GraphicsQuality.LOW]: {
        earthDetail: 6,
        sunDetail: 32,
        starCount: 1000,
        cloudOpacity: 0.5,
        bloomEnabled: false,
        maxDPR: 1,
        shadowsEnabled: false,
        antialiasing: false
    },
    [GraphicsQuality.MEDIUM]: {
        earthDetail: 8,
        sunDetail: 48,
        starCount: 1500,
        cloudOpacity: 0.7,
        bloomEnabled: true,
        maxDPR: 1.5,
        shadowsEnabled: false,
        antialiasing: true
    },
    [GraphicsQuality.HIGH]: {
        earthDetail: 10,
        sunDetail: 64,
        starCount: 2000,
        cloudOpacity: 0.8,
        bloomEnabled: true,
        maxDPR: 2,
        shadowsEnabled: true,
        antialiasing: true
    },
    [GraphicsQuality.ULTRA]: {
        earthDetail: 12,
        sunDetail: 128,
        starCount: 3000,
        cloudOpacity: 0.9,
        bloomEnabled: true,
        maxDPR: 2,
        shadowsEnabled: true,
        antialiasing: true
    }
};

// Default quality (can be overridden by user preference)
export const DEFAULT_QUALITY = GraphicsQuality.HIGH;
