import * as THREE from 'three';

export class Fireworks {
    private particles: THREE.Points[] = [];
    private scene: THREE.Scene;
    private activeBursts: number = 0;
    private maxBursts: number = 20;

    constructor(scene: THREE.Scene) {
        this.scene = scene;
    }

    // Launch a single firework
    launch(position?: THREE.Vector3): void {
        if (this.activeBursts >= this.maxBursts) return;

        const startPos = position || new THREE.Vector3(
            (Math.random() - 0.5) * 100,
            -20,
            (Math.random() - 0.5) * 100
        );

        const particleCount = 100;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const velocities = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        // Random color for this firework
        const baseColor = new THREE.Color();
        baseColor.setHSL(Math.random(), 1.0, 0.5);

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = startPos.x;
            positions[i * 3 + 1] = startPos.y + Math.random() * 30 + 20; // Explode at height
            positions[i * 3 + 2] = startPos.z;

            // Spherical explosion velocities
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            const speed = Math.random() * 15 + 10;

            velocities[i * 3] = Math.sin(phi) * Math.cos(theta) * speed;
            velocities[i * 3 + 1] = Math.cos(phi) * speed;
            velocities[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * speed;

            // Slight color variation
            const color = baseColor.clone();
            color.offsetHSL(0, 0, Math.random() * 0.2 - 0.1);
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 1.0,
            vertexColors: true,
            transparent: true,
            opacity: 1.0,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        const particles = new THREE.Points(geometry, material);
        (particles as any).life = 0;
        (particles as any).maxLife = 2.0; // 2 seconds lifetime

        this.particles.push(particles);
        this.scene.add(particles);
        this.activeBursts++;
    }

    // Launch multiple fireworks for celebration
    celebrate(): void {
        const burstCount = 10;
        for (let i = 0; i < burstCount; i++) {
            setTimeout(() => this.launch(), i * 200);
        }
    }

    update(deltaTime: number): void {
        const gravity = new THREE.Vector3(0, -10, 0);

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            const life = (particle as any).life;
            const maxLife = (particle as any).maxLife;

            if (life >= maxLife) {
                this.scene.remove(particle);
                particle.geometry.dispose();
                (particle.material as THREE.Material).dispose();
                this.particles.splice(i, 1);
                this.activeBursts--;
                continue;
            }

            (particle as any).life += deltaTime;

            const positions = particle.geometry.attributes.position;
            const velocities = (particle.geometry.attributes as any).velocity;

            for (let j = 0; j < positions.count; j++) {
                // Update velocity with gravity
                velocities.array[j * 3 + 1] += gravity.y * deltaTime;

                // Update position
                positions.array[j * 3] += velocities.array[j * 3] * deltaTime;
                positions.array[j * 3 + 1] += velocities.array[j * 3 + 1] * deltaTime;
                positions.array[j * 3 + 2] += velocities.array[j * 3 + 2] * deltaTime;
            }

            positions.needsUpdate = true;

            // Fade out
            const opacity = 1.0 - (life / maxLife);
            (particle.material as THREE.PointsMaterial).opacity = opacity;
        }
    }

    dispose(): void {
        this.particles.forEach(particle => {
            this.scene.remove(particle);
            particle.geometry.dispose();
            (particle.material as THREE.Material).dispose();
        });
        this.particles = [];
    }
}
