import * as THREE from 'three';
import { CONFIG } from '../config';

export class Earth {
    public mesh: THREE.Mesh;
    public lightsMesh: THREE.Mesh;
    public cloudMesh: THREE.Mesh;
    public glowMesh: THREE.Mesh;
    private earthGroup: THREE.Group;
    private rotationSpeed: number = 0.002;
    private cloudRotationSpeed: number = 0.0023;

    constructor() {
        this.earthGroup = new THREE.Group();
        // Tilt Earth's axis (23.4 degrees)
        this.earthGroup.rotation.z = -23.4 * Math.PI / 180;

        const loader = new THREE.TextureLoader();
        const detail = 12;
        const geometry = new THREE.IcosahedronGeometry(CONFIG.EARTH_RADIUS, detail);

        // Main Earth mesh with day texture, specular and bump maps
        const earthMaterial = new THREE.MeshPhongMaterial({
            map: loader.load('/assets/earth/00_earthmap1k.jpg'),
            specularMap: loader.load('/assets/earth/02_earthspec1k.jpg'),
            bumpMap: loader.load('/assets/earth/01_earthbump1k.jpg'),
            bumpScale: 0.04,
        });
        this.mesh = new THREE.Mesh(geometry, earthMaterial);
        this.earthGroup.add(this.mesh);

        // Lights mesh (city lights at night) - uses additive blending
        const lightsMaterial = new THREE.MeshBasicMaterial({
            map: loader.load('/assets/earth/03_earthlights1k.jpg'),
            blending: THREE.AdditiveBlending,
        });
        this.lightsMesh = new THREE.Mesh(geometry, lightsMaterial);
        this.earthGroup.add(this.lightsMesh);

        // Clouds mesh with transparency
        const cloudsMaterial = new THREE.MeshStandardMaterial({
            map: loader.load('/assets/earth/04_earthcloudmap.jpg'),
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
            alphaMap: loader.load('/assets/earth/05_earthcloudmaptrans.jpg'),
        });
        this.cloudMesh = new THREE.Mesh(geometry, cloudsMaterial);
        this.cloudMesh.scale.setScalar(1.003);
        this.cloudMesh.visible = CONFIG.CLOUDS.enabled;
        this.earthGroup.add(this.cloudMesh);

        // Atmospheric glow using Fresnel shader
        const fresnelMaterial = this.getFresnelMat();
        this.glowMesh = new THREE.Mesh(geometry, fresnelMaterial);
        this.glowMesh.scale.setScalar(1.01);
        this.glowMesh.visible = CONFIG.ATMOSPHERE.enabled;
        this.earthGroup.add(this.glowMesh);
    }

    private getFresnelMat(): THREE.ShaderMaterial {
        return new THREE.ShaderMaterial({
            uniforms: {
                color1: { value: new THREE.Color(0x3a8bc2) },
                color2: { value: new THREE.Color(0x66ccff) },
                fresnelBias: { value: 0.1 },
                fresnelScale: { value: 1.0 },
                fresnelPower: { value: 4.0 },
            },
            vertexShader: `
        uniform float fresnelBias;
        uniform float fresnelScale;
        uniform float fresnelPower;
        
        varying float vReflectionFactor;
        
        void main() {
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          
          vec3 worldNormal = normalize(mat3(modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz) * normal);
          
          vec3 I = worldPosition.xyz - cameraPosition;
          
          vReflectionFactor = fresnelBias + fresnelScale * pow(1.0 + dot(normalize(I), worldNormal), fresnelPower);
          
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
            fragmentShader: `
        uniform vec3 color1;
        uniform vec3 color2;
        
        varying float vReflectionFactor;
        
        void main() {
          float f = clamp(vReflectionFactor, 0.0, 1.0);
          gl_FragColor = vec4(mix(color1, color2, vec3(f)), f);
        }
      `,
            transparent: true,
            blending: THREE.AdditiveBlending,
        });
    }

    addToScene(scene: THREE.Scene): void {
        scene.add(this.earthGroup);
    }

    update(orbitAngle: number): void {
        // Adjust angle so 0 degrees (Jan 1) is at the top (12 o'clock position)
        const adjustedAngle = orbitAngle - Math.PI / 2;

        // Update orbital position
        const x = Math.cos(adjustedAngle) * CONFIG.EARTH_ORBIT_RADIUS;
        const z = Math.sin(adjustedAngle) * CONFIG.EARTH_ORBIT_RADIUS;

        this.earthGroup.position.set(x, 0, z);

        // Rotate all layers (maintaining original rotation speeds from repo)
        this.mesh.rotation.y += this.rotationSpeed;
        this.lightsMesh.rotation.y += this.rotationSpeed;
        this.cloudMesh.rotation.y += this.cloudRotationSpeed;
        this.glowMesh.rotation.y += this.rotationSpeed;
    }

    setAtmosphereVisible(visible: boolean): void {
        this.glowMesh.visible = visible;
    }

    setCloudsVisible(visible: boolean): void {
        this.cloudMesh.visible = visible;
    }

    // Expose the group for camera tracking
    get position(): THREE.Vector3 {
        return this.earthGroup.position;
    }
}
