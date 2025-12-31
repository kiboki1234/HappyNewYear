import { TimeSystem } from '../time/timeSystem';
import { OrbitMode } from '../time/types';
import { CameraController, CameraPreset } from '../scene/Camera';
import { Earth } from '../bodies/Earth';
import { OrbitRing } from '../bodies/OrbitRing';
import { SceneManager } from '../scene/SceneManager';

export class Controls {
    private timeSystem: TimeSystem;
    private cameraController: CameraController;
    private earth: Earth;
    private orbitRing: OrbitRing;
    private sceneManager: SceneManager;

    private playPauseBtn: HTMLButtonElement;
    private timeScaleSlider: HTMLInputElement;
    private timeScaleValue: HTMLElement;
    private resetBtn: HTMLButtonElement;

    private atmosphereToggle: HTMLInputElement;
    private cloudsToggle: HTMLInputElement;
    private bloomToggle: HTMLInputElement;
    private orbitToggle: HTMLInputElement;

    private cameraGeneralBtn: HTMLButtonElement;
    private cameraFollowBtn: HTMLButtonElement;
    private cameraCloseBtn: HTMLButtonElement;

    constructor(
        timeSystem: TimeSystem,
        cameraController: CameraController,
        earth: Earth,
        orbitRing: OrbitRing,
        sceneManager: SceneManager
    ) {
        this.timeSystem = timeSystem;
        this.cameraController = cameraController;
        this.earth = earth;
        this.orbitRing = orbitRing;
        this.sceneManager = sceneManager;

        // Get DOM elements
        this.playPauseBtn = document.getElementById('playPause') as HTMLButtonElement;
        this.timeScaleSlider = document.getElementById('timeScale') as HTMLInputElement;
        this.timeScaleValue = document.getElementById('timeScaleValue')!;
        this.resetBtn = document.getElementById('reset') as HTMLButtonElement;

        this.atmosphereToggle = document.getElementById('atmosphereToggle') as HTMLInputElement;
        this.cloudsToggle = document.getElementById('cloudsToggle') as HTMLInputElement;
        this.bloomToggle = document.getElementById('bloomToggle') as HTMLInputElement;
        this.orbitToggle = document.getElementById('orbitToggle') as HTMLInputElement;

        this.cameraGeneralBtn = document.getElementById('cameraGeneral') as HTMLButtonElement;
        this.cameraFollowBtn = document.getElementById('cameraFollow') as HTMLButtonElement;
        this.cameraCloseBtn = document.getElementById('cameraClose') as HTMLButtonElement;

        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        // Play/Pause
        this.playPauseBtn.addEventListener('click', () => {
            const isPaused = this.timeSystem.isPausedState();
            this.timeSystem.setPaused(!isPaused);
            this.playPauseBtn.textContent = isPaused ? '⏸ Pause' : '▶ Play';
        });

        // Time scale
        this.timeScaleSlider.addEventListener('input', () => {
            const scale = parseFloat(this.timeScaleSlider.value);
            this.timeSystem.setTimeScale(scale);
            this.updateTimeScaleDisplay(scale);
        });

        // Reset
        this.resetBtn.addEventListener('click', () => {
            this.timeSystem.reset();
            this.timeScaleSlider.value = '1';
            this.updateTimeScaleDisplay(1);
            this.playPauseBtn.textContent = '⏸ Pause';
            this.cameraController.reset();
        });

        // Visual toggles
        this.atmosphereToggle.addEventListener('change', () => {
            this.earth.setAtmosphereVisible(this.atmosphereToggle.checked);
        });

        this.cloudsToggle.addEventListener('change', () => {
            this.earth.setCloudsVisible(this.cloudsToggle.checked);
        });

        this.bloomToggle.addEventListener('change', () => {
            this.sceneManager.setBloomEnabled(this.bloomToggle.checked);
        });

        this.orbitToggle.addEventListener('change', () => {
            this.orbitRing.setVisible(this.orbitToggle.checked);
        });

        // Camera presets
        this.cameraGeneralBtn.addEventListener('click', () => {
            this.cameraController.applyPreset(CameraPreset.GENERAL);
        });

        this.cameraFollowBtn.addEventListener('click', () => {
            this.cameraController.applyPreset(CameraPreset.FOLLOW_EARTH);
        });

        this.cameraCloseBtn.addEventListener('click', () => {
            this.cameraController.applyPreset(CameraPreset.CLOSE_EARTH);
        });
    }

    private updateTimeScaleDisplay(scale: number): void {
        if (scale === 0) {
            this.timeScaleValue.textContent = 'Paused';
        } else if (scale < 60) {
            this.timeScaleValue.textContent = `${scale.toFixed(1)}x`;
        } else if (scale < 3600) {
            const minutes = (scale / 60).toFixed(1);
            this.timeScaleValue.textContent = `${minutes}min/sec`;
        } else if (scale < 86400) {
            const hours = (scale / 3600).toFixed(1);
            this.timeScaleValue.textContent = `${hours}hr/sec`;
        } else {
            const days = (scale / 86400).toFixed(1);
            this.timeScaleValue.textContent = `${days}day/sec`;
        }
    }
}
