import { TimeInfo } from '../time/types';
import { i18n } from '../i18n/translations';

export class HUD {
    private container: HTMLElement;
    private dateTimeEl: HTMLElement;
    private progressEl: HTMLElement;
    private countdownEl: HTMLElement;
    private modeEl: HTMLElement;
    private fpsEl: HTMLElement;

    constructor() {
        this.container = document.getElementById('hud')!;
        this.dateTimeEl = document.getElementById('datetime')!;
        this.progressEl = document.getElementById('progress')!;
        this.countdownEl = document.getElementById('countdown')!;
        this.modeEl = document.getElementById('mode')!;
        this.fpsEl = document.getElementById('fps')!;

        // Listen for language changes
        i18n.onChange(() => this.forceUpdate = true);
    }

    private forceUpdate = false;
    private lastTimeInfo: TimeInfo | null = null;
    private lastFps = 0;
    private lastOrbitMode = '';

    update(timeInfo: TimeInfo, fps: number, orbitMode: string): void {
        // Store for language change updates
        this.lastTimeInfo = timeInfo;
        this.lastFps = fps;
        this.lastOrbitMode = orbitMode;

        const locale = i18n.getLanguage() === 'es' ? 'es-EC' : 'en-US';

        // Date and time
        const dateStr = timeInfo.now.toLocaleDateString(locale, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        const timeStr = timeInfo.now.toLocaleTimeString(locale);
        this.dateTimeEl.textContent = `${dateStr} - ${timeStr}`;

        // Year progress
        const progressPercent = (timeInfo.yearProgress * 100).toFixed(2);
        this.progressEl.textContent = `${i18n.t('yearProgress')}: ${progressPercent}%`;

        // Countdown
        const { daysRemaining, hoursRemaining, minutesRemaining, secondsRemaining } = timeInfo;
        this.countdownEl.textContent =
            `${i18n.t('countdown')}: ${daysRemaining}${i18n.t('days')[0]} ${hoursRemaining}${i18n.t('hours')[0]} ${minutesRemaining}${i18n.t('minutes')[0]} ${secondsRemaining}${i18n.t('seconds')[0]}`;

        // Mode
        const modeText = orbitMode === 'CALENDAR' ? i18n.t('calendar') : i18n.t('realtime');
        this.modeEl.textContent = `${i18n.t('orbitMode')}: ${modeText}`;

        // FPS
        this.fpsEl.textContent = `${i18n.t('fps')}: ${fps}`;
    }
}
