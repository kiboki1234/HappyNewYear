import * as THREE from 'three';

export class Confetti {
    private particles: THREE.Points;
    private scene: THREE.Scene;
    private active: boolean = false;
    private duration: number = 0;
    private maxDuration: number = 5.0; // 5 seconds

    constructor(scene: THREE.Scene) {
        this.scene = scene;
        this.particles = this.createConfetti();
    }

    private createConfetti(): THREE.Points {
        const particleCount = 500;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const velocities = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const rotations = new Float32Array(particleCount);
        const rotationSpeeds = new Float32Array(particleCount);

        // Preset confetti colors
        const confettiColors = [
            new THREE.Color(0xff0000), // Red
            new THREE.Color(0x00ff00), // Green
            new THREE.Color(0x0000ff), // Blue
            new THREE.Color(0xffff00), // Yellow
            new THREE.Color(0xff00ff), // Magenta
            new THREE.Color(0x00ffff), // Cyan
            new THREE.Color(0xffa500), // Orange
            new THREE.Color(0xff1493), // Pink
        ];

        for (let i = 0; i < particleCount; i++) {
            // Start from sky, spread across scene
            positions[i * 3] = (Math.random() - 0.5) * 200;
            positions[i * 3 + 1] = Math.random() * 50 + 50;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 200;

            // Random velocities (mostly downward and outward)
            velocities[i * 3] = (Math.random() - 0.5) * 10;
            velocities[i * 3 + 1] = Math.random() * 5 - 15; // Falling
            velocities[i * 3 + 2] = (Math.random() - 0.5) * 10;

            // Random color from palette
            const color = confettiColors[Math.floor(Math.random() * confettiColors.length)];
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;

            rotations[i] = Math.random() * Math.PI * 2;
            rotationSpeeds[i] = (Math.random() - 0.5) * 5;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('rotation', new THREE.BufferAttribute(rotations, 1));
        geometry.setAttribute('rotationSpeed', new THREE.BufferAttribute(rotationSpeeds, 1));

        const material = new THREE.PointsMaterial({
            size: 1.5,
            vertexColors: true,
            transparent: true,
            opacity: 1.0,
            blending: THREE.NormalBlending,
        });

        const particles = new THREE.Points(geometry, material);
        particles.visible = false;

        return particles;
    }

    start(): void {
        if (this.active) return;

        this.active = true;
        this.duration = 0;
        this.particles.visible = true;
        this.scene.add(this.particles);
    }

    update(deltaTime: number): void {
        if (!this.active) return;

        this.duration += deltaTime;

        if (this.duration >= this.maxDuration) {
            this.stop();
            return;
        }

        const positions = this.particles.geometry.attributes.position;
        const velocities = (this.particles.geometry.attributes as any).velocity;
        const rotations = (this.particles.geometry.attributes as any).rotation;
        const rotationSpeeds = (this.particles.geometry.attributes as any).rotationSpeed;

        const gravity = -20;
        const drag = 0.98;

        for (let i = 0; i < positions.count; i++) {
            // Apply gravity
            velocities.array[i * 3 + 1] += gravity * deltaTime;

            // Apply drag
            velocities.array[i * 3] *= drag;
            velocities.array[i * 3 + 1] *= drag;
            velocities.array[i * 3 + 2] *= drag;

            // Update position
            positions.array[i * 3] += velocities.array[i * 3] * deltaTime;
            positions.array[i * 3 + 1] += velocities.array[i * 3 + 1] * deltaTime;
            positions.array[i * 3 + 2] += velocities.array[i * 3 + 2] * deltaTime;

            // Update rotation
            rotations.array[i] += rotationSpeeds.array[i] * deltaTime;

            // Reset if fallen too far
            if (positions.array[i * 3 + 1] < -50) {
                positions.array[i * 3 + 1] = 50;
                velocities.array[i * 3 + 1] = 0;
            }
        }

        positions.needsUpdate = true;
        rotations.needsUpdate = true;

        // Fade out near end
        const fadeStart = this.maxDuration - 1.0;
        if (this.duration > fadeStart) {
            const opacity = 1.0 - ((this.duration - fadeStart) / 1.0);
            (this.particles.material as THREE.PointsMaterial).opacity = opacity;
        }
    }

    stop(): void {
        this.active = false;
        this.particles.visible = false;
        (this.particles.material as THREE.PointsMaterial).opacity = 1.0;
    }

    dispose(): void {
        this.scene.remove(this.particles);
        this.particles.geometry.dispose();
        (this.particles.material as THREE.Material).dispose();
    }
}
