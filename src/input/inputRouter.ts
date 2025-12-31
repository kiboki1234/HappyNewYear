import { HandTracking } from './handTracking';
import { GestureEngine, GestureType, Gesture } from './gestureEngine';
import { PrivacyModal } from '../ui/PrivacyModal';
import { CameraController } from '../scene/Camera';
import * as THREE from 'three';

export class InputRouter {
    public handTracking: HandTracking;
    private gestureEngine: GestureEngine;
    private privacyModal: PrivacyModal;
    private cameraController: CameraController;

    private handControlToggle: HTMLInputElement;
    private handControlStatus: HTMLElement;
    private cameraIndicator: HTMLElement;
    private gestureDebug: HTMLDivElement | null = null;

    private isHandControlEnabled: boolean = false;
    private currentGesture: Gesture | null = null;
    private initialPinchDistance: number = 0;
    private initialCameraDistance: number = 0;
    private smoothedPinchDistance: number = 0;
    private readonly PINCH_SMOOTHING = 0.3;  // Lower = smoother
    private readonly PINCH_DEADZONE = 0.002;  // Ignore tiny movements

    // Two-hand zoom tracking
    private smoothedTwoHandDistance: number = 0;
    private initialTwoHandDistance: number = 0;
    private readonly TWO_HAND_SMOOTHING = 0.4;
    private readonly TWO_HAND_DEADZONE = 0.005;

    constructor(cameraController: CameraController) {
        this.handTracking = new HandTracking();
        this.gestureEngine = new GestureEngine();
        this.privacyModal = new PrivacyModal();
        this.cameraController = cameraController;

        this.handControlToggle = document.getElementById('handControlToggle') as HTMLInputElement;
        this.handControlStatus = document.getElementById('handControlStatus')!;
        this.cameraIndicator = document.getElementById('cameraIndicator')!;

        this.cameraIndicator = document.getElementById('cameraIndicator')!;

        this.setupEventListeners();
    }

    public setDebugVisibility(visible: boolean): void {
        // Toggle camera preview canvas
        this.handTracking.setDebugViewVisible(visible);

        // Toggle gesture debug overlay text
        if (this.gestureDebug) {
            this.gestureDebug.style.display = visible ? 'block' : 'none';
        }
    }

    private setupEventListeners(): void {
        this.handControlToggle.addEventListener('change', () => {
            if (this.handControlToggle.checked) {
                this.enableHandControl();
            } else {
                this.disableHandControl();
            }
        });
    }

    private async enableHandControl(): Promise<void> {
        this.privacyModal.show(
            async () => {
                const initialized = await this.handTracking.initialize();
                if (!initialized) {
                    this.showError('Failed to initialize hand tracking');
                    this.handControlToggle.checked = false;
                    return;
                }

                const cameraStarted = await this.handTracking.startCamera();
                if (!cameraStarted) {
                    this.showError('Failed to access camera');
                    this.handControlToggle.checked = false;
                    return;
                }

                this.isHandControlEnabled = true;
                this.handControlStatus.textContent = 'Active';
                this.handControlStatus.className = 'status active';
                this.cameraIndicator.style.display = 'block';

                // Setup landmark callback
                this.handTracking.onLandmarksDetected = (landmarks) => {
                    const gesture = this.gestureEngine.recognize(landmarks);
                    this.handleGesture(gesture);
                };
            },
            () => {
                this.handControlToggle.checked = false;
                this.handControlStatus.textContent = 'Inactive';
                this.handControlStatus.className = 'status inactive';
            }
        );
    }

    private disableHandControl(): void {
        this.handTracking.stopCamera();
        this.gestureEngine.reset();
        this.isHandControlEnabled = false;
        this.handControlStatus.textContent = 'Inactive';
        this.handControlStatus.className = 'status inactive';
        this.cameraIndicator.style.display = 'none';
        this.currentGesture = null;
        this.smoothedPinchDistance = 0;
        this.smoothedTwoHandDistance = 0;
    }

    private handleGesture(gesture: Gesture): void {
        // Lower confidence threshold for better responsiveness
        if (gesture.confidence < 0.6) return;

        const prevGesture = this.currentGesture;
        this.currentGesture = gesture;

        // Prioritize two-hand zoom if both hands are detected
        if (gesture.handCount === 2 && gesture.twoHandDistance !== null) {
            this.handleTwoHandZoom(gesture, prevGesture);
            return;
        }

        switch (gesture.type) {
            case GestureType.PALM_MOVE:
                this.handleOrbit(gesture);
                break;

            case GestureType.PINCH_MOVE:
                this.handlePan(gesture);
                break;

            case GestureType.PINCH:
                this.handlePinch(gesture, prevGesture);
                break;

            case GestureType.OPEN_PALM:
                if (prevGesture?.type !== GestureType.OPEN_PALM && prevGesture?.type !== GestureType.PALM_MOVE) {
                    console.log('Reset camera!');
                    this.cameraController.reset();
                }
                break;

            case GestureType.POINT:
                console.log('Point gesture detected');
                break;

            case GestureType.GRAB:
                console.log('Grab gesture detected');
                break;
        }
    }

    private handleTwoHandZoom(gesture: Gesture, prevGesture: Gesture | null): void {
        if (!gesture.twoHandDistance) return;

        // Initialize on first detection of two hands
        if (prevGesture?.handCount !== 2) {
            console.log('Two-hand zoom started - initial distance:', gesture.twoHandDistance.toFixed(4));
            this.initialTwoHandDistance = gesture.twoHandDistance;
            this.smoothedTwoHandDistance = gesture.twoHandDistance;
            this.initialCameraDistance = this.cameraController.camera.position.length();
            return;
        }

        // Apply smoothing
        this.smoothedTwoHandDistance =
            this.TWO_HAND_SMOOTHING * gesture.twoHandDistance +
            (1 - this.TWO_HAND_SMOOTHING) * this.smoothedTwoHandDistance;

        // Calculate change
        const distanceChange = this.smoothedTwoHandDistance - this.initialTwoHandDistance;

        // Apply deadzone
        if (Math.abs(distanceChange) < this.TWO_HAND_DEADZONE) {
            return;
        }

        // Sensitivity for two-hand zoom (hands apart = zoom out)
        const sensitivity = 100;  // Lower than single hand for more control

        const targetDistance = this.initialCameraDistance + (distanceChange * sensitivity);
        const newDistance = Math.max(5, Math.min(100, targetDistance));

        console.log(`Two-hand zoom: distance=${newDistance.toFixed(1)} (spread=${distanceChange.toFixed(4)})`);

        // Apply with interpolation
        const cam = this.cameraController.camera;
        const target = this.cameraController.controls.target;

        const currentDistance = cam.position.clone().sub(target).length();
        const smoothedDistance = currentDistance + (newDistance - currentDistance) * 0.2;

        const direction = cam.position.clone().sub(target).normalize();
        cam.position.copy(target).add(direction.multiplyScalar(smoothedDistance));

        this.cameraController.controls.update();
    }

    private handleOrbit(gesture: Gesture): void {
        if (!gesture.delta) return;

        // Orbit sensitivity - how much the camera moves per hand movement
        const sensitivity = 3.0;

        // Horizontal rotation (azimuth)
        const deltaAzimuth = -gesture.delta.x * sensitivity;

        // Vertical rotation (polar)
        const deltaPolar = -gesture.delta.y * sensitivity;

        // Get current spherical coordinates
        const cam = this.cameraController.camera;
        const target = this.cameraController.controls.target;

        const offset = cam.position.clone().sub(target);
        const radius = offset.length();

        // Convert to spherical coordinates
        let theta = Math.atan2(offset.x, offset.z);
        let phi = Math.acos(Math.max(-1, Math.min(1, offset.y / radius)));

        // Apply deltas
        theta += deltaAzimuth;
        phi += deltaPolar;

        // Clamp phi to prevent flipping
        phi = Math.max(0.1, Math.min(Math.PI - 0.1, phi));

        // Convert back to Cartesian
        offset.x = radius * Math.sin(phi) * Math.sin(theta);
        offset.y = radius * Math.cos(phi);
        offset.z = radius * Math.sin(phi) * Math.cos(theta);

        cam.position.copy(target).add(offset);
        this.cameraController.controls.update();
    }

    private handlePan(gesture: Gesture): void {
        if (!gesture.delta) return;

        // Pan sensitivity
        const sensitivity = 30.0;

        const cam = this.cameraController.camera;
        const controls = this.cameraController.controls;

        // Get camera's right and up vectors
        const cameraRight = new THREE.Vector3(1, 0, 0);
        const cameraUp = new THREE.Vector3(0, 1, 0);

        cameraRight.applyQuaternion(cam.quaternion);
        cameraUp.applyQuaternion(cam.quaternion);

        // Calculate pan offset
        const panX = -gesture.delta.x * sensitivity;
        const panY = gesture.delta.y * sensitivity;

        const panOffset = cameraRight.multiplyScalar(panX)
            .add(cameraUp.multiplyScalar(panY));

        // Move both camera and target
        cam.position.add(panOffset);
        controls.target.add(panOffset);

        controls.update();
    }

    private handlePinch(gesture: Gesture, prevGesture: Gesture | null): void {
        if (!gesture.pinchDistance) return;

        // Initialize on first pinch
        if (prevGesture?.type !== GestureType.PINCH) {
            // Start of pinch - record initial state
            console.log('Pinch zoom started - initial distance:', gesture.pinchDistance.toFixed(4));
            this.initialPinchDistance = gesture.pinchDistance;
            this.smoothedPinchDistance = gesture.pinchDistance;
            this.initialCameraDistance = this.cameraController.camera.position.length();
            return;  // Don't zoom on first frame, just initialize
        }

        // Apply exponential smoothing to pinch distance for stability
        this.smoothedPinchDistance =
            this.PINCH_SMOOTHING * gesture.pinchDistance +
            (1 - this.PINCH_SMOOTHING) * this.smoothedPinchDistance;

        // Calculate change from initial position
        const pinchChange = this.smoothedPinchDistance - this.initialPinchDistance;

        // Apply deadzone to ignore tiny movements (reduces jitter)
        if (Math.abs(pinchChange) < this.PINCH_DEADZONE) {
            return;  // Too small to register
        }

        // Reduced sensitivity for more precise control
        const sensitivity = 150;  // Lowered from 200 for better precision

        // Calculate new camera distance
        const targetDistance = this.initialCameraDistance + (pinchChange * sensitivity);

        // Clamp distance to reasonable bounds
        const newDistance = Math.max(5, Math.min(100, targetDistance));

        // Apply zoom smoothly with interpolation for even smoother movement
        const cam = this.cameraController.camera;
        const target = this.cameraController.controls.target;

        const currentDistance = cam.position.clone().sub(target).length();
        const smoothedDistance = currentDistance + (newDistance - currentDistance) * 0.15;

        const direction = cam.position.clone().sub(target).normalize();
        cam.position.copy(target).add(direction.multiplyScalar(smoothedDistance));

        this.cameraController.controls.update();
    }

    private showError(message: string): void {
        console.error(message);
        alert(message);
    }

    update(): void {
        if (this.isHandControlEnabled) {
            this.handTracking.processFrame();
        }
    }

    dispose(): void {
        this.disableHandControl();
        this.handTracking.dispose();
    }
}
