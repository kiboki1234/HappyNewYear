export interface TimeInfo {
    now: Date;
    startOfYear: Date;
    startOfNextYear: Date;
    yearProgress: number; // [0, 1)
    orbitAngle: number; // radians
    daysInYear: number;
    daysRemaining: number;
    hoursRemaining: number;
    minutesRemaining: number;
    secondsRemaining: number;
}

export enum OrbitMode {
    CALENDAR = 'calendar',
    ASTRONOMICAL = 'astronomical'
}
