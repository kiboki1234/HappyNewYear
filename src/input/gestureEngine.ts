export enum GestureType {
    NONE = 'none',
    PINCH = 'pinch',
    GRAB = 'grab',
    POINT = 'point',
    OPEN_PALM = 'open_palm',
    PALM_MOVE = 'palm_move',  // Open palm with movement (orbit)
    PINCH_MOVE = 'pinch_move'  // Pinch with movement (pan)
}

export interface Gesture {
    type: GestureType;
    confidence: number;
    position: { x: number; y: number; z: number } | null;
    velocity: { x: number; y: number; z: number } | null;  // Movement speed
    delta: { x: number; y: number; z: number } | null;     // Position change
    pinchDistance: number | null;  // Distance between thumb and index (for zoom)
    twoHandDistance: number | null;  // Distance between both hands' index fingers
    handCount: number;  // Number of hands detected
}

export class GestureEngine {
    private smoothedLandmarks: any[] = [];
    private previousGesture: GestureType = GestureType.NONE;
    private gestureHoldFrames: number = 0;
    private readonly SMOOTHING_FACTOR = 0.5;  // Increased for smoother movement
    private readonly HYSTERESIS_FRAMES = 2; // Gesture must be stable for 2 frames (faster response)

    // Position tracking for movement detection
    private previousPosition: { x: number; y: number; z: number } | null = null;
    private positionHistory: Array<{ x: number; y: number; z: number }> = [];
    private readonly POSITION_HISTORY_SIZE = 5;
    private readonly MOVEMENT_THRESHOLD = 0.01;  // Minimum movement to detect

    recognize(landmarks: any[]): Gesture {
        const handCount = landmarks.length;

        if (handCount === 0) {
            return {
                type: GestureType.NONE,
                confidence: 0,
                position: null,
                velocity: null,
                delta: null,
                pinchDistance: null,
                twoHandDistance: null,
                handCount: 0
            };
        }

        // Use first hand for simplicity
        const hand = landmarks[0];

        // Smooth landmarks
        const smoothedHand = this.smoothLandmarks(hand);

        // Calculate pinch distance (thumb tip to index tip) for single hand
        const thumbTip = smoothedHand[4];
        const indexTip = smoothedHand[8];
        const pinchDistance = this.distance(thumbTip, indexTip);

        // Calculate two-hand distance if both hands present
        let twoHandDistance: number | null = null;
        if (handCount === 2) {
            const hand1IndexTip = landmarks[0][8];  // First hand index finger tip
            const hand2IndexTip = landmarks[1][8];  // Second hand index finger tip
            twoHandDistance = this.distance(hand1IndexTip, hand2IndexTip);
        }

        // Get reference position (middle finger base)
        const currentPosition = {
            x: smoothedHand[9].x,
            y: smoothedHand[9].y,
            z: smoothedHand[9].z
        };

        // Calculate movement
        const delta = this.previousPosition ? {
            x: currentPosition.x - this.previousPosition.x,
            y: currentPosition.y - this.previousPosition.y,
            z: currentPosition.z - this.previousPosition.z
        } : null;

        // Update position history
        this.positionHistory.push(currentPosition);
        if (this.positionHistory.length > this.POSITION_HISTORY_SIZE) {
            this.positionHistory.shift();
        }

        // Calculate velocity (average over history)
        const velocity = this.calculateVelocity();

        // Detect gesture type
        const gestureType = this.detectGesture(smoothedHand, velocity);

        // Apply hysteresis
        if (gestureType === this.previousGesture) {
            this.gestureHoldFrames++;
        } else {
            this.gestureHoldFrames = 0;
            if (gestureType !== GestureType.NONE) {
                console.log('New gesture detected:', gestureType);
            }
        }

        this.previousGesture = gestureType;
        this.previousPosition = currentPosition;

        const isStable = this.gestureHoldFrames >= this.HYSTERESIS_FRAMES;


        return {
            type: isStable ? gestureType : GestureType.NONE,
            confidence: isStable ? 1.0 : this.gestureHoldFrames / this.HYSTERESIS_FRAMES,
            position: currentPosition,
            velocity,
            delta,
            pinchDistance,
            twoHandDistance,
            handCount
        };
    }

    private calculateVelocity(): { x: number; y: number; z: number } | null {
        if (this.positionHistory.length < 2) return null;

        let vx = 0, vy = 0, vz = 0;
        const count = this.positionHistory.length - 1;

        for (let i = 1; i < this.positionHistory.length; i++) {
            vx += this.positionHistory[i].x - this.positionHistory[i - 1].x;
            vy += this.positionHistory[i].y - this.positionHistory[i - 1].y;
            vz += this.positionHistory[i].z - this.positionHistory[i - 1].z;
        }

        return {
            x: vx / count,
            y: vy / count,
            z: vz / count
        };
    }
    private smoothLandmarks(landmarks: any[]): any[] {
        if (this.smoothedLandmarks.length === 0) {
            this.smoothedLandmarks = landmarks.map(lm => ({ ...lm }));
            return this.smoothedLandmarks;
        }

        // EMA smoothing
        for (let i = 0; i < landmarks.length; i++) {
            this.smoothedLandmarks[i].x =
                this.SMOOTHING_FACTOR * landmarks[i].x +
                (1 - this.SMOOTHING_FACTOR) * this.smoothedLandmarks[i].x;

            this.smoothedLandmarks[i].y =
                this.SMOOTHING_FACTOR * landmarks[i].y +
                (1 - this.SMOOTHING_FACTOR) * this.smoothedLandmarks[i].y;

            this.smoothedLandmarks[i].z =
                this.SMOOTHING_FACTOR * landmarks[i].z +
                (1 - this.SMOOTHING_FACTOR) * this.smoothedLandmarks[i].z;
        }

        return this.smoothedLandmarks;
    }

    private detectGesture(landmarks: any[], velocity: { x: number; y: number; z: number } | null): GestureType {
        // MediaPipe hand landmark indices:
        // 4: thumb tip, 8: index tip, 12: middle tip, 16: ring tip, 20: pinky tip
        // 0: wrist, 5: index base, 9: middle base, 13: ring base, 17: pinky base

        const thumbTip = landmarks[4];
        const indexTip = landmarks[8];
        const middleTip = landmarks[12];
        const ringTip = landmarks[16];
        const pinkyTip = landmarks[20];

        const indexBase = landmarks[5];
        const middleBase = landmarks[9];
        const ringBase = landmarks[13];
        const pinkyBase = landmarks[17];
        const wrist = landmarks[0];

        // Check if hand is moving
        const isMoving = velocity ?
            Math.sqrt(velocity.x ** 2 + velocity.y ** 2) > this.MOVEMENT_THRESHOLD : false;

        // Pinch detection (thumb and index close)
        const thumbIndexDist = this.distance(thumbTip, indexTip);
        const isPinching = thumbIndexDist < 0.05;

        // Finger extension detection
        const indexExtended = this.distance(indexTip, indexBase) > this.distance(indexBase, wrist) * 0.5;
        const middleExtended = this.distance(middleTip, middleBase) > this.distance(middleBase, wrist) * 0.5;
        const ringExtended = this.distance(ringTip, ringBase) > this.distance(ringBase, wrist) * 0.5;
        const pinkyExtended = this.distance(pinkyTip, pinkyBase) > this.distance(pinkyBase, wrist) * 0.5;
        const allFingersExtended = indexExtended && middleExtended && ringExtended && pinkyExtended;

        // Prioritize movement-based gestures
        if (isPinching && isMoving) {
            return GestureType.PINCH_MOVE;  // Pan camera
        }

        if (allFingersExtended && isMoving) {
            return GestureType.PALM_MOVE;   // Orbit camera
        }

        // Static gestures
        if (isPinching) {
            return GestureType.PINCH;  // Zoom (depth-based)
        }

        if (allFingersExtended) {
            return GestureType.OPEN_PALM;  // Reset or idle
        }

        // Point detection (only index extended)
        if (indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
            return GestureType.POINT;
        }

        // Grab detection (all fingers curled)
        if (!indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
            return GestureType.GRAB;
        }

        return GestureType.NONE;
    }

    private distance(p1: any, p2: any): number {
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dz = p1.z - p2.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    reset(): void {
        this.smoothedLandmarks = [];
        this.previousGesture = GestureType.NONE;
        this.gestureHoldFrames = 0;
        this.previousPosition = null;
        this.positionHistory = [];
    }
}
