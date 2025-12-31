import './styles/main.css';
import { SceneManager } from './scene/SceneManager';
import { TimeSystem } from './time/timeSystem';
import { Sun } from './bodies/Sun';
import { Earth } from './bodies/Earth';
import { OrbitRing } from './bodies/OrbitRing';
import { Starfield } from './scene/Starfield';
import { HUD } from './ui/HUD';
import { Controls } from './ui/Controls';
import { InputRouter } from './input/inputRouter';
import { UITranslator } from './ui/UITranslator';
import { NewYearCelebration } from './effects/NewYearCelebration';
import { GraphicsQuality, DEFAULT_QUALITY, QUALITY_PRESETS } from './config';
import * as THREE from 'three';

class App {
    private sceneManager: SceneManager;
    private timeSystem: TimeSystem;
    private sun: Sun;
    private earth: Earth;
    private orbitRing: OrbitRing;
    private starfield: Starfield;
    private hud: HUD;
    private controls: Controls;
    private inputRouter: InputRouter;
    private celebration: NewYearCelebration;
    private currentQuality: GraphicsQuality = DEFAULT_QUALITY;

    private lastTime: number = 0;
    private fpsFrames: number = 0;
    private fpsTime: number = 0;
    private currentFPS: number = 60;

    constructor() {
        const canvas = document.getElementById('canvas') as HTMLCanvasElement;

        // Initialize UI translator first
        new UITranslator();

        // Initialize scene
        this.sceneManager = new SceneManager(canvas);
        this.timeSystem = new TimeSystem();

        // Create bodies
        this.sun = new Sun();
        this.earth = new Earth();
        this.orbitRing = new OrbitRing();
        this.starfield = new Starfield();

        // Add to scene
        this.sun.addToScene(this.sceneManager.scene);
        this.earth.addToScene(this.sceneManager.scene);
        this.orbitRing.addToScene(this.sceneManager.scene);
        this.starfield.addToScene(this.sceneManager.scene);

        // Setup camera to track orbit ring
        this.orbitRing.setCamera(this.sceneManager.getCameraController().camera);

        // Initialize UI
        this.hud = new HUD();
        this.controls = new Controls(
            this.timeSystem,
            this.sceneManager.getCameraController(),
            this.earth,
            this.orbitRing,
            this.sceneManager
        );

        // Initialize input
        this.inputRouter = new InputRouter(this.sceneManager.getCameraController());

        // Setup celebration system
        this.celebration = new NewYearCelebration(this.sceneManager.scene);

        // Setup quality selector
        this.setupQualitySelector();

        // Setup test celebration button
        this.setupTestCelebrationButton();

        // Setup resize handler
        window.addEventListener('resize', () => this.onWindowResize());

        // Listen for camera preview toggle
        document.addEventListener('toggleCameraPreview', ((e: CustomEvent) => {
            if (this.inputRouter) {
                this.inputRouter.setDebugVisibility(e.detail.visible);
            }
        }) as EventListener);

        // Start render loop
        this.animate(0);
    }

    private setupQualitySelector(): void {
        const qualitySelect = document.getElementById('qualitySelect') as HTMLSelectElement;
        const qualityInfo = document.getElementById('qualityInfo') as HTMLElement;

        if (!qualitySelect) return;

        // Load saved quality preference
        // Load saved quality preference or auto-detect for mobile
        const savedQuality = localStorage.getItem('graphicsQuality') as GraphicsQuality;

        if (savedQuality && Object.values(GraphicsQuality).includes(savedQuality)) {
            this.currentQuality = savedQuality;
            qualitySelect.value = savedQuality;
            this.applyQualitySettings(savedQuality);
        } else {
            // Auto-detect mobile to set lower default quality
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            const defaultQuality = isMobile ? GraphicsQuality.MEDIUM : DEFAULT_QUALITY;

            this.currentQuality = defaultQuality;
            qualitySelect.value = defaultQuality;
            this.applyQualitySettings(defaultQuality);
            console.log(`Auto-detected quality: ${defaultQuality} (Mobile: ${isMobile})`);
        }

        // Listen for changes
        qualitySelect.addEventListener('change', () => {
            const newQuality = qualitySelect.value as GraphicsQuality;
            this.currentQuality = newQuality;
            localStorage.setItem('graphicsQuality', newQuality);

            // Show notification
            if (qualityInfo) {
                qualityInfo.textContent = 'Aplicando cambios...';
            }

            // Apply settings
            this.applyQualitySettings(newQuality);

            // Update notification after applying
            setTimeout(() => {
                if (qualityInfo) {
                    qualityInfo.textContent = `FPS: ${this.currentFPS}`;
                }
            }, 500);

            console.log(`Graphics quality changed to: ${newQuality}`);
        });

        // Update FPS display
        setInterval(() => {
            if (qualityInfo) {
                qualityInfo.textContent = `FPS: ${this.currentFPS}`;
            }
        }, 1000);
    }

    private applyQualitySettings(quality: GraphicsQuality): void {
        const preset = QUALITY_PRESETS[quality];

        // Update renderer pixel ratio
        this.sceneManager.renderer.setPixelRatio(Math.min(window.devicePixelRatio, preset.maxDPR));

        // Update bloom settings
        this.sceneManager.setBloomEnabled(preset.bloomEnabled);
        if (preset.bloomEnabled) {
            // Adjust bloom strength based on quality
            const bloomStrength = quality === GraphicsQuality.ULTRA ? 0.8 :
                quality === GraphicsQuality.HIGH ? 0.5 : 0.3;
            this.sceneManager.setBloomStrength(bloomStrength);
        }

        // Update cloud opacity
        if (this.earth.cloudMesh) {
            const material = this.earth.cloudMesh.material as THREE.MeshStandardMaterial;
            material.opacity = preset.cloudOpacity;
        }

        // Update starfield density (if we have access to recreate it)
        // This would require recreating the starfield, so we'll skip for now

        console.log(`Applied quality settings: ${quality}`, preset);
    }

    private checkNewYearCelebration(timeInfo: any): void {
        const currentYear = timeInfo.now.getFullYear();
        const month = timeInfo.now.getMonth();
        const day = timeInfo.now.getDate();
        const hour = timeInfo.now.getHours();
        const minute = timeInfo.now.getMinutes();

        // Check if we're at the start of any major holiday (within first minute)
        const isCelebrationMoment = hour === 0 && minute === 0;

        if (!isCelebrationMoment) return;

        // Major holidays to celebrate
        const celebrations = [
            { month: 0, day: 1 },   // New Year
            { month: 1, day: 14 },  // Valentine's
            { month: 11, day: 25 }, // Christmas
            { month: 11, day: 31 }, // New Year's Eve
        ];

        const isHoliday = celebrations.some(h => h.month === month && h.day === day);

        if (isHoliday) {
            // Create unique key for this holiday
            const holidayKey = `${currentYear}-${month}-${day}`;
            const lastCelebrated = localStorage.getItem('lastCelebration');

            if (lastCelebrated !== holidayKey) {
                this.celebration.trigger();
                localStorage.setItem('lastCelebration', holidayKey);
            }
        }
    }

    private setupTestCelebrationButton(): void {
        const testBtn = document.getElementById('testCelebrationBtn');
        if (testBtn) {
            testBtn.addEventListener('click', () => {
                console.log('Manual celebration triggered!');
                this.celebration.trigger();
            });
        }
    }

    private animate = (currentTime: number): void => {
        requestAnimationFrame(this.animate);

        const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.1);
        this.lastTime = currentTime;

        // Calculate FPS
        this.fpsFrames++;
        this.fpsTime += deltaTime;
        if (this.fpsTime >= 1.0) {
            this.currentFPS = Math.round(this.fpsFrames / this.fpsTime);
            this.fpsFrames = 0;
            this.fpsTime = 0;
        }

        // Update systems
        this.timeSystem.update(deltaTime);
        const timeInfo = this.timeSystem.getTimeInfo();

        // Check for New Year celebration
        this.checkNewYearCelebration(timeInfo);

        // Update bodies
        this.sun.update(deltaTime);
        this.earth.update(timeInfo.orbitAngle);
        this.starfield.update(deltaTime);

        // Update sun light to point at Earth for realistic illumination
        this.sun.updateLightDirection(this.earth.position);

        // Calculate current day of year for holiday highlighting
        const startOfYear = new Date(timeInfo.now.getFullYear(), 0, 1);
        const dayOfYear = Math.floor((timeInfo.now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        this.orbitRing.update(dayOfYear);

        // Update celebration effects
        this.celebration.update(deltaTime);

        // Update scene
        this.sceneManager.update(this.earth.position);

        // Update UI
        this.hud.update(timeInfo, this.currentFPS, this.timeSystem.getOrbitMode());

        // Update hand tracking
        this.inputRouter.update();

        // Render
        this.sceneManager.render();
    };

    private onWindowResize(): void {
        this.sceneManager.onWindowResize();
    }
}

// Start the application
new App();
