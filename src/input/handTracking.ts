import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { CONFIG } from '../config';

export class HandTracking {
    private handLandmarker: HandLandmarker | null = null;
    private video: HTMLVideoElement | null = null;
    private canvas: HTMLCanvasElement | null = null;
    private ctx: CanvasRenderingContext2D | null = null;
    private isActive: boolean = false;
    private lastTime: number = 0;
    private frameInterval: number = 1000 / CONFIG.HAND_TRACKING.fps;

    public onLandmarksDetected?: (landmarks: any[], handedness: any[]) => void;
    private isDebugViewVisible: boolean = true;

    setDebugViewVisible(visible: boolean): void {
        this.isDebugViewVisible = visible;
        if (this.canvas) {
            this.canvas.style.display = visible ? 'block' : 'none';
        }
    }

    async initialize(): Promise<boolean> {
        try {
            const vision = await FilesetResolver.forVisionTasks(
                'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
            );

            this.handLandmarker = await HandLandmarker.createFromOptions(vision, {
                baseOptions: {
                    modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
                    delegate: 'GPU'
                },
                runningMode: 'VIDEO',
                numHands: 2,
                minHandDetectionConfidence: 0.5,
                minHandPresenceConfidence: 0.5,
                minTrackingConfidence: 0.5
            });

            return true;
        } catch (error) {
            console.error('Failed to initialize hand tracking:', error);
            return false;
        }
    }

    async startCamera(): Promise<boolean> {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: CONFIG.HAND_TRACKING.videoWidth,
                    height: CONFIG.HAND_TRACKING.videoHeight,
                    facingMode: 'user'
                }
            });

            this.video = document.createElement('video');
            this.video.srcObject = stream;
            this.video.style.display = 'none';
            document.body.appendChild(this.video);

            await this.video.play();

            // Create visible debug canvas
            this.canvas = document.createElement('canvas');
            this.canvas.id = 'handTrackingCanvas';
            this.canvas.width = CONFIG.HAND_TRACKING.videoWidth;
            this.canvas.height = CONFIG.HAND_TRACKING.videoHeight;
            document.body.appendChild(this.canvas);
            this.ctx = this.canvas.getContext('2d');

            this.isActive = true;
            this.lastTime = performance.now();

            return true;
        } catch (error) {
            console.error('Failed to access camera:', error);
            return false;
        }
    }

    stopCamera(): void {
        if (this.video && this.video.srcObject) {
            const stream = this.video.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            this.video.remove();
            this.video = null;
        }

        if (this.canvas) {
            this.canvas.remove();
            this.canvas = null;
        }

        this.isActive = false;
    }

    processFrame(): void {
        if (!this.isActive || !this.handLandmarker || !this.video || !this.ctx) {
            return;
        }

        const now = performance.now();
        const elapsed = now - this.lastTime;

        if (elapsed < this.frameInterval) {
            return;
        }

        this.lastTime = now;

        // Draw video to canvas
        this.ctx.drawImage(
            this.video,
            0, 0,
            CONFIG.HAND_TRACKING.videoWidth,
            CONFIG.HAND_TRACKING.videoHeight
        );

        // Detect hands
        const results = this.handLandmarker.detectForVideo(this.video, now);

        // Draw detected hands on canvas
        if (results.landmarks && results.landmarks.length > 0) {
            this.drawHands(results.landmarks);

            if (this.onLandmarksDetected) {
                this.onLandmarksDetected(results.landmarks, results.handednesses || []);
            }
        }
    }

    private drawHands(landmarks: any[]): void {
        if (!this.ctx) return;

        // Clear with semi-transparent black for trail effect
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.fillRect(0, 0, CONFIG.HAND_TRACKING.videoWidth, CONFIG.HAND_TRACKING.videoHeight);

        // Draw each hand
        landmarks.forEach(hand => {
            // Draw landmarks
            hand.forEach((landmark: any) => {
                const x = landmark.x * CONFIG.HAND_TRACKING.videoWidth;
                const y = landmark.y * CONFIG.HAND_TRACKING.videoHeight;

                this.ctx!.fillStyle = '#4fc3f7';
                this.ctx!.beginPath();
                this.ctx!.arc(x, y, 5, 0, Math.PI * 2);
                this.ctx!.fill();
            });

            // Draw connections
            const connections = [
                [0, 1], [1, 2], [2, 3], [3, 4],  // Thumb
                [0, 5], [5, 6], [6, 7], [7, 8],  // Index
                [0, 9], [9, 10], [10, 11], [11, 12],  // Middle
                [0, 13], [13, 14], [14, 15], [15, 16],  // Ring
                [0, 17], [17, 18], [18, 19], [19, 20],  // Pinky
                [5, 9], [9, 13], [13, 17]  // Palm
            ];

            this.ctx!.strokeStyle = '#ffffff';
            this.ctx!.lineWidth = 2;
            connections.forEach(([start, end]) => {
                const startLm = hand[start];
                const endLm = hand[end];
                const x1 = startLm.x * CONFIG.HAND_TRACKING.videoWidth;
                const y1 = startLm.y * CONFIG.HAND_TRACKING.videoHeight;
                const x2 = endLm.x * CONFIG.HAND_TRACKING.videoWidth;
                const y2 = endLm.y * CONFIG.HAND_TRACKING.videoHeight;

                this.ctx!.beginPath();
                this.ctx!.moveTo(x1, y1);
                this.ctx!.lineTo(x2, y2);
                this.ctx!.stroke();
            });
        });
    }

    isActivated(): boolean {
        return this.isActive;
    }

    dispose(): void {
        this.stopCamera();
        this.handLandmarker = null;
    }
}
