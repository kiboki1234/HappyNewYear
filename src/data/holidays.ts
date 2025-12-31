export type Country = 'ecuador' | 'usa' | 'mexico' | 'colombia' | 'peru' | 'global';

export interface Holiday {
    translationKey: string;
    day: number;
    month: number;
    color: number;
    emoji: string;
    countries: Country[]; // Which countries celebrate this
}

// Global holidays - celebrated worldwide
export const GLOBAL_HOLIDAYS: Holiday[] = [
    { emoji: '🎆', translationKey: 'holidays.newYear', month: 1, day: 1, color: 0xffd700, countries: ['global'] },
    { emoji: '❤️', translationKey: 'holidays.valentines', month: 2, day: 14, color: 0xff69b4, countries: ['global'] },
    { emoji: '🌸', translationKey: 'holidays.springEquinox', month: 3, day: 20, color: 0xffb6c1, countries: ['global'] },
    { emoji: '🌍', translationKey: 'holidays.earthDay', month: 4, day: 22, color: 0x00ff7f, countries: ['global'] },
    { emoji: '👨‍👩‍👧', translationKey: 'holidays.mothersDay', month: 5, day: 12, color: 0xff69b4, countries: ['global'] },
    { emoji: '☀️', translationKey: 'holidays.summerSolstice', month: 6, day: 21, color: 0xffff00, countries: ['global'] },
    { emoji: '🎄', translationKey: 'holidays.christmas', month: 12, day: 25, color: 0xff0000, countries: ['global'] },
    { emoji: '🎊', translationKey: 'holidays.newYearsEve', month: 12, day: 31, color: 0xff00ff, countries: ['global'] }
];

// Ecuador-specific holidays
export const ECUADOR_HOLIDAYS: Holiday[] = [
    { emoji: '🎭', translationKey: 'holidays.carnivalMonday', month: 2, day: 12, color: 0xff1493, countries: ['ecuador'] },
    { emoji: '🎭', translationKey: 'holidays.carnivalTuesday', month: 2, day: 13, color: 0xff1493, countries: ['ecuador'] },
    { emoji: '✝️', translationKey: 'holidays.goodFriday', month: 3, day: 29, color: 0x8b4513, countries: ['ecuador'] },
    { emoji: '⚒️', translationKey: 'holidays.laborDay', month: 5, day: 1, color: 0xff0000, countries: ['ecuador'] },
    { emoji: '⚔️', translationKey: 'holidays.pichinchaBattle', month: 5, day: 24, color: 0x0066cc, countries: ['ecuador'] },
    { emoji: '🔔', translationKey: 'holidays.firstCry', month: 8, day: 10, color: 0xffdd00, countries: ['ecuador'] },
    { emoji: '🏛️', translationKey: 'holidays.guayaquilIndependence', month: 10, day: 9, color: 0x0066cc, countries: ['ecuador'] },
    { emoji: '🕯️', translationKey: 'holidays.allSouls', month: 11, day: 2, color: 0x800080, countries: ['ecuador'] },
    { emoji: '🏙️', translationKey: 'holidays.quitoFoundation', month: 12, day: 6, color: 0xffdd00, countries: ['ecuador'] }
];

// USA-specific holidays
export const USA_HOLIDAYS: Holiday[] = [
    { emoji: '🦅', translationKey: 'holidays.mlkDay', month: 1, day: 20, color: 0x000080, countries: ['usa'] },
    { emoji: '👔', translationKey: 'holidays.presidentsDay', month: 2, day: 17, color: 0x0066cc, countries: ['usa'] },
    { emoji: '🍀', translationKey: 'holidays.stPatricks', month: 3, day: 17, color: 0x00ff00, countries: ['usa'] },
    { emoji: '🐰', translationKey: 'holidays.easter', month: 4, day: 20, color: 0xffa500, countries: ['usa'] },
    { emoji: '🇺🇸', translationKey: 'holidays.independenceDay', month: 7, day: 4, color: 0xff0000, countries: ['usa'] },
    { emoji: '⚒️', translationKey: 'holidays.laborDayUSA', month: 9, day: 2, color: 0xff0000, countries: ['usa'] },
    { emoji: '🎃', translationKey: 'holidays.halloween', month: 10, day: 31, color: 0xff6600, countries: ['usa'] },
    { emoji: '🦃', translationKey: 'holidays.thanksgiving', month: 11, day: 28, color: 0xff8c00, countries: ['usa'] }
];

// Mexico-specific holidays
export const MEXICO_HOLIDAYS: Holiday[] = [
    { emoji: '✝️', translationKey: 'holidays.constitutionDay', month: 2, day: 5, color: 0x8b4513, countries: ['mexico'] },
    { emoji: '👨', translationKey: 'holidays.benitoJuarez', month: 3, day: 21, color: 0x006847, countries: ['mexico'] },
    { emoji: '🇲🇽', translationKey: 'holidays.independenceDay', month: 9, day: 16, color: 0x006847, countries: ['mexico'] },
    { emoji: '💀', translationKey: 'holidays.dayOfDead', month: 11, day: 2, color: 0xff6600, countries: ['mexico'] },
    { emoji: '🎊', translationKey: 'holidays.revolutionDay', month: 11, day: 20, color: 0xff0000, countries: ['mexico'] },
    { emoji: '👸', translationKey: 'holidays.ladyGuadalupe', month: 12, day: 12, color: 0x0066cc, countries: ['mexico'] }
];

// Get holidays for a specific country (includes global holidays)
export function getHolidaysForCountry(country: Country): Holiday[] {
    const holidays = [...GLOBAL_HOLIDAYS];

    switch (country) {
        case 'ecuador':
            holidays.push(...ECUADOR_HOLIDAYS);
            break;
        case 'usa':
            holidays.push(...USA_HOLIDAYS);
            break;
        case 'mexico':
            holidays.push(...MEXICO_HOLIDAYS);
            break;
        // Add more countries as needed
    }

    // Sort by date
    return holidays.sort((a, b) => {
        if (a.month !== b.month) return a.month - b.month;
        return a.day - b.day;
    });
}

export const DEFAULT_COUNTRY: Country = 'ecuador';
