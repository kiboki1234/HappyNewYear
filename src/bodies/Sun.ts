import * as THREE from 'three';
import { CONFIG } from '../config';

export class Sun {
    public mesh: THREE.Mesh;
    public light: THREE.DirectionalLight;
    public ambientLight: THREE.AmbientLight;
    private coronaMesh: THREE.Mesh;
    private glowSprite: THREE.Sprite;
    private time: number = 0;

    constructor() {
        this.mesh = this.createSun();
        this.coronaMesh = this.createCorona();
        this.glowSprite = this.createGlowSprite();

        // Create scientifically accurate lighting
        this.light = this.createDirectionalLight();
        this.ambientLight = this.createAmbientLight();
    }

    private createSun(): THREE.Mesh {
        const geometry = new THREE.SphereGeometry(CONFIG.SUN_RADIUS, 64, 64);
        const textureLoader = new THREE.TextureLoader();

        // Enhanced shader material for realistic sun surface
        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                sunTexture: { value: null }
            },
            vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
            fragmentShader: `
        uniform float time;
        uniform sampler2D sunTexture;
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        // Improved noise function for surface turbulence
        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
        
        float snoise(vec2 v) {
          const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                              0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                             -0.577350269189626,  // -1.0 + 2.0 * C.x
                              0.024390243902439); // 1.0 / 41.0
          vec2 i  = floor(v + dot(v, C.yy));
          vec2 x0 = v -   i + dot(i, C.xx);
          vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
          vec4 x12 = x0.xyxy + C.xxzz;
          x12.xy -= i1;
          i = mod289(i);
          vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
          vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
          m = m*m;
          m = m*m;
          vec3 x = 2.0 * fract(p * C.www) - 1.0;
          vec3 h = abs(x) - 0.5;
          vec3 ox = floor(x + 0.5);
          vec3 a0 = x - ox;
          m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
          vec3 g;
          g.x  = a0.x  * x0.x  + h.x  * x0.y;
          g.yz = a0.yz * x12.xz + h.yz * x12.yw;
          return 130.0 * dot(m, g);
        }
        
        void main() {
          // Animated surface turbulence
          vec2 uv = vUv;
          float noise1 = snoise(uv * 3.0 + time * 0.1);
          float noise2 = snoise(uv * 6.0 - time * 0.15);
          float noise3 = snoise(uv * 12.0 + time * 0.08);
          
          // Combine noise layers for plasma effect
          float turbulence = noise1 * 0.5 + noise2 * 0.3 + noise3 * 0.2;
          
          // Base sun colors (realistic solar spectrum)
          vec3 orangeCore = vec3(1.0, 0.4, 0.1);      // Core - deep orange
          vec3 yellowMid = vec3(1.0, 0.85, 0.3);      // Mid - yellow-orange
          vec3 whiteSurface = vec3(1.0, 0.95, 0.8);   // Surface - white-yellow
          
          // Mix colors based on turbulence
          vec3 color = mix(orangeCore, yellowMid, smoothstep(-0.5, 0.0, turbulence));
          color = mix(color, whiteSurface, smoothstep(0.0, 0.5, turbulence));
          
          // Add solar flares / bright spots
          float flare = pow(max(0.0, snoise(uv * 8.0 + time * 0.2)), 3.0);
          color += vec3(1.0, 0.9, 0.7) * flare * 0.5;
          
          // Limb darkening effect (sun appears darker at edges)
          float limbDarkening = dot(vNormal, vec3(0.0, 0.0, 1.0));
          limbDarkening = pow(max(0.0, limbDarkening), 0.7);
          color *= 0.7 + 0.3 * limbDarkening;
          
          // Boost overall brightness
          color *= 1.3;
          
          gl_FragColor = vec4(color, 1.0);
        }
      `
        });

        // Try to load sun texture if available
        textureLoader.load(
            '/assets/sun/sun_texture.jpg',
            (texture) => {
                material.uniforms.sunTexture.value = texture;
                material.needsUpdate = true;
            },
            undefined,
            () => { } // Silently fail, use procedural
        );

        return new THREE.Mesh(geometry, material);
    }

    private createCorona(): THREE.Mesh {
        const geometry = new THREE.SphereGeometry(CONFIG.SUN_RADIUS * 1.05, 32, 32);

        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 }
            },
            vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
            fragmentShader: `
        uniform float time;
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        float noise(vec2 p) {
          return sin(p.x * 5.0 + time * 0.5) * sin(p.y * 5.0 + time * 0.3) * 0.5 + 0.5;
        }
        
        void main() {
          // Fresnel effect for corona glow
          vec3 viewDirection = normalize(cameraPosition - vPosition);
          float fresnel = 1.0 - max(0.0, dot(viewDirection, vNormal));
          fresnel = pow(fresnel, 2.0);
          
          // Animated corona turbulence
          vec2 uv = vec2(atan(vNormal.z, vNormal.x), acos(vNormal.y));
          float turbulence = noise(uv * 10.0);
          
          // Corona color (orange-red glow)
          vec3 coronaColor = vec3(1.0, 0.5, 0.2);
          coronaColor = mix(coronaColor, vec3(1.0, 0.7, 0.3), turbulence);
          
          float alpha = fresnel * 0.6;
          gl_FragColor = vec4(coronaColor, alpha);
        }
      `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            side: THREE.BackSide,
            depthWrite: false
        });

        return new THREE.Mesh(geometry, material);
    }

    private createGlowSprite(): THREE.Sprite {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d')!;

        // Create radial gradient for lens flare effect
        const gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.1, 'rgba(255, 240, 200, 0.9)');
        gradient.addColorStop(0.3, 'rgba(255, 200, 100, 0.5)');
        gradient.addColorStop(0.5, 'rgba(255, 150, 50, 0.2)');
        gradient.addColorStop(1, 'rgba(255, 100, 0, 0)');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 512, 512);

        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({
            map: texture,
            blending: THREE.AdditiveBlending,
            transparent: true,
            opacity: 0.7
        });

        const sprite = new THREE.Sprite(material);
        sprite.scale.set(CONFIG.SUN_RADIUS * 4, CONFIG.SUN_RADIUS * 4, 1);
        return sprite;
    }

    private createDirectionalLight(): THREE.DirectionalLight {
        // Scientifically accurate sun light
        // Color temperature: ~5778K (yellowish-white)
        const sunColor = new THREE.Color(0xfffaf0); // Warm white

        // Intensity in Three.js units (physically-based)
        // Sun provides about 120,000 lux on Earth
        const light = new THREE.DirectionalLight(sunColor, 3.0);

        // Position at origin (sun's location)
        light.position.set(0, 0, 0);

        // Point towards the scene center for proper illumination
        light.target.position.set(CONFIG.EARTH_ORBIT_RADIUS, 0, 0);

        return light;
    }

    private createAmbientLight(): THREE.AmbientLight {
        // Very subtle ambient light (starlight + cosmic background)
        // Should be much dimmer than sun
        return new THREE.AmbientLight(0x111122, 0.05);
    }

    addToScene(scene: THREE.Scene): void {
        scene.add(this.mesh);
        scene.add(this.coronaMesh);
        scene.add(this.glowSprite);
        scene.add(this.light);
        scene.add(this.light.target);
        scene.add(this.ambientLight);
    }

    update(deltaTime: number): void {
        this.time += deltaTime * 0.3;

        // Update sun surface shader
        const sunMaterial = this.mesh.material as THREE.ShaderMaterial;
        sunMaterial.uniforms.time.value = this.time;

        // Update corona shader
        const coronaMaterial = this.coronaMesh.material as THREE.ShaderMaterial;
        coronaMaterial.uniforms.time.value = this.time;

        // Slow rotation for surface features
        this.mesh.rotation.y += deltaTime * 0.01;
        this.coronaMesh.rotation.y += deltaTime * 0.015;
    }

    // Update light direction to point towards Earth
    updateLightDirection(earthPosition: THREE.Vector3): void {
        this.light.target.position.copy(earthPosition);
        this.light.target.updateMatrixWorld();
    }
}
