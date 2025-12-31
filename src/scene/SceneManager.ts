import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { CameraController } from './Camera';
import { CONFIG, BLOOM } from '../config';

export class SceneManager {
    public scene: THREE.Scene;
    public renderer: THREE.WebGLRenderer;
    public composer: EffectComposer;
    private cameraController: CameraController;
    private bloomPass: UnrealBloomPass;

    constructor(canvas: HTMLCanvasElement) {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000000);

        this.renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: true,
            alpha: false
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, CONFIG.MAX_DPR));
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;

        this.cameraController = new CameraController(canvas);

        // Setup post-processing
        this.composer = new EffectComposer(this.renderer);
        const renderPass = new RenderPass(this.scene, this.cameraController.camera);
        this.composer.addPass(renderPass);

        this.bloomPass = new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            BLOOM.strength,
            BLOOM.radius,
            BLOOM.threshold
        );
        this.bloomPass.enabled = BLOOM.enabled;
        this.composer.addPass(this.bloomPass);
    }

    getCameraController(): CameraController {
        return this.cameraController;
    }

    render(): void {
        this.composer.render();
    }

    update(earthPosition?: THREE.Vector3): void {
        this.cameraController.update(earthPosition);
    }

    onWindowResize(): void {
        this.cameraController.onWindowResize();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.composer.setSize(window.innerWidth, window.innerHeight);
    }

    setBloomEnabled(enabled: boolean): void {
        this.bloomPass.enabled = enabled;
    }

    setBloomStrength(strength: number): void {
        this.bloomPass.strength = strength;
    }
}
