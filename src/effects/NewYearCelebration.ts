import { Fireworks } from './Fireworks';
import { Confetti } from './Confetti';
import { i18n } from '../i18n/translations';
import * as THREE from 'three';

export class NewYearCelebration {
    private fireworks: Fireworks;
    private confetti: Confetti;
    private messageElement: HTMLDivElement | null = null;
    private isActive: boolean = false;

    constructor(scene: THREE.Scene) {
        this.fireworks = new Fireworks(scene);
        this.confetti = new Confetti(scene);
        this.createMessageElement();
    }

    private createMessageElement(): void {
        this.messageElement = document.createElement('div');
        this.messageElement.style.position = 'fixed';
        this.messageElement.style.top = '50%';
        this.messageElement.style.left = '50%';
        this.messageElement.style.transform = 'translate(-50%, -50%)';
        this.messageElement.style.fontSize = '72px';
        this.messageElement.style.fontWeight = 'bold';
        this.messageElement.style.color = '#FFD700';
        this.messageElement.style.textAlign = 'center';
        this.messageElement.style.textShadow = '0 0 20px rgba(255, 215, 0, 0.8), 0 0 40px rgba(255, 215, 0, 0.6)';
        this.messageElement.style.fontFamily = 'Arial, sans-serif';
        this.messageElement.style.zIndex = '10001';
        this.messageElement.style.display = 'none';
        this.messageElement.style.pointerEvents = 'none';
        this.messageElement.style.animation = 'pulse 1s ease-in-out infinite';

        // Add pulsing animation
        const style = document.createElement('style');
        style.textContent = `
      @keyframes pulse {
        0%, 100% { transform: translate(-50%, -50%) scale(1); }
        50% { transform: translate(-50%, -50%) scale(1.1); }
      }
    `;
        document.head.appendChild(style);

        document.body.appendChild(this.messageElement);
    }

    trigger(): void {
        if (this.isActive) return;

        this.isActive = true;

        // Show message
        if (this.messageElement) {
            const message = i18n.getLanguage() === 'es'
                ? '🎆 ¡FELIZ AÑO NUEVO! 🎆'
                : '🎆 HAPPY NEW YEAR! 🎆';
            this.messageElement.textContent = message;
            this.messageElement.style.display = 'block';
        }

        // Launch fireworks celebration
        this.fireworks.celebrate();

        // Start confetti
        this.confetti.start();

        // Continue launching fireworks for dramatic effect
        for (let i = 0; i < 15; i++) {
            setTimeout(() => this.fireworks.launch(), i * 500 + 2000);
        }

        // Hide message after 5 seconds
        setTimeout(() => {
            if (this.messageElement) {
                this.messageElement.style.display = 'none';
            }
            this.isActive = false;
        }, 8000);
    }

    update(deltaTime: number): void {
        this.fireworks.update(deltaTime);
        this.confetti.update(deltaTime);
    }

    dispose(): void {
        this.fireworks.dispose();
        this.confetti.dispose();
        if (this.messageElement) {
            this.messageElement.remove();
        }
    }
}
