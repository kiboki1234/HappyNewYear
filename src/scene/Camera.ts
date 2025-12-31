import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CONFIG } from '../config';

export enum CameraPreset {
    GENERAL = 'general',
    FOLLOW_EARTH = 'follow_earth',
    CLOSE_EARTH = 'close_earth'
}

export class CameraController {
    public camera: THREE.PerspectiveCamera;
    public controls: OrbitControls;
    private currentPreset: CameraPreset = CameraPreset.GENERAL;
    private followEarth: boolean = false;

    constructor(canvas: HTMLCanvasElement) {
        this.camera = new THREE.PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            0.1,
            500
        );

        this.controls = new OrbitControls(this.camera, canvas);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 5;
        this.controls.maxDistance = 100;

        this.applyPreset(CameraPreset.GENERAL);
    }

    applyPreset(preset: CameraPreset): void {
        this.currentPreset = preset;

        switch (preset) {
            case CameraPreset.GENERAL:
                this.camera.position.set(25, 20, 25);
                this.controls.target.set(0, 0, 0);
                this.followEarth = false;
                break;

            case CameraPreset.FOLLOW_EARTH:
                this.camera.position.set(
                    CONFIG.EARTH_ORBIT_RADIUS + 10,
                    10,
                    CONFIG.EARTH_ORBIT_RADIUS + 10
                );
                this.followEarth = true;
                break;

            case CameraPreset.CLOSE_EARTH:
                this.camera.position.set(
                    CONFIG.EARTH_ORBIT_RADIUS + 3,
                    2,
                    CONFIG.EARTH_ORBIT_RADIUS + 3
                );
                this.followEarth = true;
                break;
        }

        this.controls.update();
    }

    update(earthPosition?: THREE.Vector3): void {
        if (this.followEarth && earthPosition) {
            this.controls.target.copy(earthPosition);
        }
        this.controls.update();
    }

    reset(): void {
        this.applyPreset(CameraPreset.GENERAL);
    }

    onWindowResize(): void {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
    }
}
