import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz';
import { CONFIG } from '../config';
import { TimeInfo, OrbitMode } from './types';

export class TimeSystem {
    private timezone: string;
    private currentTime: Date;
    private timeScale: number = 1.0;
    private isPaused: boolean = false;
    private orbitMode: OrbitMode = OrbitMode.CALENDAR;
    private simulatedOffset: number = 0; // milliseconds

    constructor(timezone: string = CONFIG.TIMEZONE) {
        this.timezone = timezone;
        this.currentTime = this.getNowInTimezone();
    }

    private getNowInTimezone(): Date {
        return utcToZonedTime(new Date(), this.timezone);
    }

    private isLeapYear(year: number): boolean {
        return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    }

    private getStartOfYear(date: Date): Date {
        const year = date.getFullYear();
        // Create date in timezone
        const startStr = `${year}-01-01T00:00:00`;
        return utcToZonedTime(zonedTimeToUtc(startStr, this.timezone), this.timezone);
    }

    private getStartOfNextYear(date: Date): Date {
        const year = date.getFullYear() + 1;
        const startStr = `${year}-01-01T00:00:00`;
        return utcToZonedTime(zonedTimeToUtc(startStr, this.timezone), this.timezone);
    }

    update(deltaTimeSeconds: number): void {
        if (!this.isPaused) {
            const deltaMs = deltaTimeSeconds * 1000 * this.timeScale;
            this.simulatedOffset += deltaMs;
        }
    }

    getCurrentTime(): Date {
        const realNow = this.getNowInTimezone();
        return new Date(realNow.getTime() + this.simulatedOffset);
    }

    getTimeInfo(): TimeInfo {
        const now = this.getCurrentTime();
        const startOfYear = this.getStartOfYear(now);
        const startOfNextYear = this.getStartOfNextYear(now);

        const yearDuration = startOfNextYear.getTime() - startOfYear.getTime();
        const elapsed = now.getTime() - startOfYear.getTime();
        const yearProgress = Math.max(0, Math.min(elapsed / yearDuration, 0.9999));

        const orbitAngle = 2 * Math.PI * yearProgress;

        const remaining = startOfNextYear.getTime() - now.getTime();
        const daysRemaining = Math.floor(remaining / (1000 * 60 * 60 * 24));
        const hoursRemaining = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutesRemaining = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        const secondsRemaining = Math.floor((remaining % (1000 * 60)) / 1000);

        const daysInYear = this.isLeapYear(now.getFullYear()) ? 366 : 365;

        return {
            now,
            startOfYear,
            startOfNextYear,
            yearProgress,
            orbitAngle,
            daysInYear,
            daysRemaining,
            hoursRemaining,
            minutesRemaining,
            secondsRemaining
        };
    }

    setTimeScale(scale: number): void {
        this.timeScale = Math.max(0, Math.min(scale, CONFIG.SIMULATION.maxTimeScale));
    }

    getTimeScale(): number {
        return this.timeScale;
    }

    setPaused(paused: boolean): void {
        this.isPaused = paused;
    }

    isPausedState(): boolean {
        return this.isPaused;
    }

    setOrbitMode(mode: OrbitMode): void {
        this.orbitMode = mode;
    }

    getOrbitMode(): OrbitMode {
        return this.orbitMode;
    }

    // Jump to a specific date (for scrubber)
    jumpToDate(date: Date): void {
        const now = this.getNowInTimezone();
        const targetInTz = utcToZonedTime(date, this.timezone);
        this.simulatedOffset = targetInTz.getTime() - now.getTime();
    }

    reset(): void {
        this.simulatedOffset = 0;
        this.timeScale = 1.0;
        this.isPaused = false;
    }
}
