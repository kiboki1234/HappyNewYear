import * as THREE from 'three';
import { CONFIG } from '../config';

export class Starfield {
    private points: THREE.Points;

    constructor() {
        this.points = this.createStarfield();
    }

    private createStarfield(): THREE.Points {
        const starCount = 5000;
        const positions = new Float32Array(starCount * 3);
        const colors = new Float32Array(starCount * 3);
        const sizes = new Float32Array(starCount);

        for (let i = 0; i < starCount; i++) {
            // Random position on a sphere
            const radius = 100 + Math.random() * 50;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);

            positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = radius * Math.cos(phi);

            // Random star color (white to slightly blue/yellow)
            const temp = Math.random();
            if (temp > 0.8) {
                // Blue stars
                colors[i * 3] = 0.8;
                colors[i * 3 + 1] = 0.9;
                colors[i * 3 + 2] = 1.0;
            } else if (temp < 0.2) {
                // Yellow stars
                colors[i * 3] = 1.0;
                colors[i * 3 + 1] = 0.95;
                colors[i * 3 + 2] = 0.8;
            } else {
                // White stars
                colors[i * 3] = 1.0;
                colors[i * 3 + 1] = 1.0;
                colors[i * 3 + 2] = 1.0;
            }

            sizes[i] = Math.random() * 2 + 0.5;
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const material = new THREE.PointsMaterial({
            size: 0.5,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            sizeAttenuation: true,
            depthWrite: false
        });

        return new THREE.Points(geometry, material);
    }

    addToScene(scene: THREE.Scene): void {
        scene.add(this.points);
    }

    update(deltaTime: number): void {
        // Gentle rotation
        this.points.rotation.y += deltaTime * 0.001;
    }
}
