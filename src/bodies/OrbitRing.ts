import * as THREE from 'three';
import { CONFIG } from '../config';
import { i18n } from '../i18n/translations';
import { getHolidaysForCountry, DEFAULT_COUNTRY, type Country, type Holiday } from '../data/holidays';

export class OrbitRing {
    private group: THREE.Group;
    private ring!: THREE.Line;
    private monthMarkers: THREE.Group;
    private holidayMarkers: THREE.Mesh[] = [];
    private holidaySprites: THREE.Sprite[] = [];
    private raycaster: THREE.Raycaster;
    private mouse: THREE.Vector2;
    private camera: THREE.Camera | null = null;
    private hoveredHoliday: number = -1;
    private tooltipElement!: HTMLDivElement;
    private currentCountry: Country = DEFAULT_COUNTRY;
    private holidays: Holiday[] = [];

    constructor() {
        this.group = new THREE.Group();
        this.monthMarkers = new THREE.Group();
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        // Load initial holidays
        this.holidays = getHolidaysForCountry(this.currentCountry);

        this.createRing();
        this.createMonthMarkers();
        this.createHolidayMarkers();
        this.createTooltip();

        // Setup mouse move listener
        window.addEventListener('mousemove', this.onMouseMove.bind(this));

        // Listen for language changes and update sprites
        i18n.onChange(() => this.updateHolidayLabels());

        // Setup country selector
        this.setupCountrySelector();
    }

    private setupCountrySelector(): void {
        const countrySelect = document.getElementById('countrySelect') as HTMLSelectElement;
        if (countrySelect) {
            countrySelect.value = this.currentCountry;
            countrySelect.addEventListener('change', () => {
                this.setCountry(countrySelect.value as Country);
            });
        }
    }

    setCountry(country: Country): void {
        if (this.currentCountry === country) return;

        this.currentCountry = country;
        this.holidays = getHolidaysForCountry(country);

        // Clear existing holiday markers
        this.clearHolidayMarkers();

        // Recreate with new holidays
        this.createHolidayMarkers();
    }

    private clearHolidayMarkers(): void {
        // Remove all existing markers and sprites from scene
        this.holidayMarkers.forEach(marker => this.group.remove(marker));
        this.holidaySprites.forEach(sprite => this.group.remove(sprite));

        // Clear arrays
        this.holidayMarkers = [];
        this.holidaySprites = [];
        this.hoveredHoliday = -1;
    }

    private createRing(): void {
        const points: THREE.Vector3[] = [];
        const segments = 256;

        for (let i = 0; i <= segments; i++) {
            // Adjust so 0 progress (Jan 1) is at top
            const angle = (i / segments) * Math.PI * 2 - Math.PI / 2;
            const x = Math.cos(angle) * CONFIG.EARTH_ORBIT_RADIUS;
            const z = Math.sin(angle) * CONFIG.EARTH_ORBIT_RADIUS;
            points.push(new THREE.Vector3(x, 0, z));
        }

        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
            color: 0x4488ff,
            transparent: true,
            opacity: 0.2
        });

        this.ring = new THREE.Line(geometry, material);
        this.group.add(this.ring);
    }

    private createMonthMarkers(): void {
        for (let month = 0; month < 12; month++) {
            // Adjust so month 0 (January) is at top
            const angle = (month / 12) * Math.PI * 2 - Math.PI / 2;
            const x = Math.cos(angle) * CONFIG.EARTH_ORBIT_RADIUS;
            const z = Math.sin(angle) * CONFIG.EARTH_ORBIT_RADIUS;

            const geometry = new THREE.SphereGeometry(0.3, 8, 8);
            const material = new THREE.MeshBasicMaterial({ color: 0x6666ff });
            const marker = new THREE.Mesh(geometry, material);
            marker.position.set(x, 0, z);

            this.monthMarkers.add(marker);
        }
    }

    private createHolidayMarkers(): void {
        this.holidays.forEach((holiday, index) => {
            // Calculate day of year
            const daysInMonths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
            let dayOfYear = holiday.day;
            for (let i = 0; i < holiday.month - 1; i++) {
                dayOfYear += daysInMonths[i];
            }

            // Convert to angle (adjust so Jan 1 is at top)
            const yearProgress = (dayOfYear - 1) / 365;
            const angle = yearProgress * Math.PI * 2 - Math.PI / 2;
            const x = Math.cos(angle) * CONFIG.EARTH_ORBIT_RADIUS;
            const z = Math.sin(angle) * CONFIG.EARTH_ORBIT_RADIUS;

            // Create subtle marker (small sphere)
            const geometry = new THREE.SphereGeometry(0.5, 16, 16);
            const material = new THREE.MeshBasicMaterial({
                color: holiday.color,
                transparent: true,
                opacity: 0.6
            });
            const marker = new THREE.Mesh(geometry, material);
            marker.position.set(x, 0.5, z);
            marker.userData = { holidayIndex: index };

            this.holidayMarkers.push(marker);
            this.group.add(marker);

            // Create sprite label (hidden by default)
            const sprite = this.createHolidaySprite(holiday, x, z);
            this.holidaySprites.push(sprite);
            this.group.add(sprite);
        });
    }

    private createHolidaySprite(holiday: Holiday, x: number, z: number): THREE.Sprite {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d')!;
        canvas.width = 512;
        canvas.height = 128;

        context.fillStyle = `#${holiday.color.toString(16).padStart(6, '0')}`;
        context.font = 'bold 48px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        const translatedName = i18n.t(holiday.translationKey);
        context.fillText(`${holiday.emoji} ${translatedName}`, canvas.width / 2, canvas.height / 2);

        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            opacity: 0
        });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.position.set(x, 4, z);
        sprite.scale.set(10, 2.5, 1);

        return sprite;
    }

    private updateHolidayLabels(): void {
        this.holidays.forEach((holiday, index) => {
            if (index >= this.holidaySprites.length) return;

            const sprite = this.holidaySprites[index];
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d')!;
            canvas.width = 512;
            canvas.height = 128;

            context.fillStyle = `#${holiday.color.toString(16).padStart(6, '0')}`;
            context.font = 'bold 48px Arial';
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            const translatedName = i18n.t(holiday.translationKey);
            context.fillText(`${holiday.emoji} ${translatedName}`, canvas.width / 2, canvas.height / 2);

            const texture = new THREE.CanvasTexture(canvas);
            (sprite.material as THREE.SpriteMaterial).map = texture;
            (sprite.material as THREE.SpriteMaterial).needsUpdate = true;
        });
    }

    private createTooltip(): void {
        this.tooltipElement = document.createElement('div');
        this.tooltipElement.style.position = 'fixed';
        this.tooltipElement.style.padding = '12px 16px';
        this.tooltipElement.style.background = 'rgba(0, 0, 0, 0.9)';
        this.tooltipElement.style.color = 'white';
        this.tooltipElement.style.borderRadius = '8px';
        this.tooltipElement.style.pointerEvents = 'none';
        this.tooltipElement.style.fontFamily = 'Arial, sans-serif';
        this.tooltipElement.style.fontSize = '14px';
        this.tooltipElement.style.zIndex = '10000';
        this.tooltipElement.style.display = 'none';
        this.tooltipElement.style.border = '2px solid #ffd700';
        document.body.appendChild(this.tooltipElement);
    }

    private onMouseMove(event: MouseEvent): void {
        if (!this.camera) return;

        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.holidayMarkers);

        if (intersects.length > 0) {
            const holidayIndex = intersects[0].object.userData.holidayIndex;

            if (this.hoveredHoliday !== holidayIndex) {
                this.hoveredHoliday = holidayIndex;
                this.showHolidayInfo(holidayIndex, event.clientX, event.clientY);
            } else {
                this.tooltipElement.style.left = `${event.clientX + 15}px`;
                this.tooltipElement.style.top = `${event.clientY + 15}px`;
            }
        } else {
            if (this.hoveredHoliday !== -1) {
                this.hideHolidayInfo();
                this.hoveredHoliday = -1;
            }
        }
    }

    private showHolidayInfo(index: number, x: number, y: number): void {
        if (index >= this.holidays.length) return;
        const holiday = this.holidays[index];

        const sprite = this.holidaySprites[index];
        const spriteMaterial = sprite.material as THREE.SpriteMaterial;
        spriteMaterial.opacity = 1;

        this.holidayMarkers[index].scale.set(1.5, 1.5, 1.5);

        const monthNames = i18n.t('months.short');
        const translatedName = i18n.t(holiday.translationKey);
        this.tooltipElement.innerHTML = `
      <div style="font-size: 18px; margin-bottom: 4px;">${holiday.emoji} <strong>${translatedName}</strong></div>
      <div style="color: #ffd700;">${(monthNames as any)[holiday.month - 1]} ${holiday.day}</div>
    `;
        this.tooltipElement.style.display = 'block';
        this.tooltipElement.style.left = `${x + 15}px`;
        this.tooltipElement.style.top = `${y + 15}px`;
    }

    private hideHolidayInfo(): void {
        this.holidaySprites.forEach(sprite => {
            const spriteMaterial = sprite.material as THREE.SpriteMaterial;
            spriteMaterial.opacity = 0;
        });

        this.holidayMarkers.forEach(marker => {
            marker.scale.set(1, 1, 1);
        });

        this.tooltipElement.style.display = 'none';
    }

    addToScene(scene: THREE.Scene): void {
        scene.add(this.group);
    }

    setVisible(visible: boolean): void {
        this.ring.visible = visible;
        this.monthMarkers.visible = visible;
        this.holidayMarkers.forEach(marker => marker.visible = visible);
        this.holidaySprites.forEach(sprite => sprite.visible = visible);
    }

    setCamera(camera: THREE.Camera): void {
        this.camera = camera;
    }

    update(currentDayOfYear?: number): void {
        if (currentDayOfYear !== undefined) {
            this.holidays.forEach((holiday, index) => {
                if (index >= this.holidayMarkers.length) return;

                const daysInMonths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
                let dayOfYear = holiday.day;
                for (let i = 0; i < holiday.month - 1; i++) {
                    dayOfYear += daysInMonths[i];
                }

                const marker = this.holidayMarkers[index];
                const sprite = this.holidaySprites[index];
                const spriteMaterial = sprite.material as THREE.SpriteMaterial;

                const isActive = Math.abs(currentDayOfYear - dayOfYear) < 1;

                if (isActive) {
                    marker.scale.set(2.5, 2.5, 2.5);
                    spriteMaterial.opacity = 1;
                } else if (this.hoveredHoliday !== index) {
                    marker.scale.set(1, 1, 1);
                    spriteMaterial.opacity = 0;
                }
            });
        }
    }

    dispose(): void {
        window.removeEventListener('mousemove', this.onMouseMove.bind(this));
        if (this.tooltipElement) {
            this.tooltipElement.remove();
        }
    }
}
