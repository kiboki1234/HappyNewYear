# Happy New Year - Solar System 3D 🌍✨

A professional 3D web application featuring the Sun and Earth in real-time, with Earth's orbit synchronized to complete exactly at midnight on New Year's Day in the America/Guayaquil timezone (UTC-05).

## Features

- **Real-time Calendar Synchronization**: Earth completes its orbit precisely at midnight on January 1st
- **Professional Visuals**: 
  - Animated Sun with glow, corona, and procedural shaders
  - Earth with PBR textures, atmosphere, clouds, and night lights
  - Bloom post-processing and cinematic tone mapping
- **Interactive Controls**:
  - Simulation controls (play/pause, time scale)
  - Camera presets (general view, follow Earth, close-up)
  - Visual toggles (atmosphere, clouds, bloom, orbit ring)
- **Optional Hand Gesture Control**:
  - Control zoom with pinch gestures
  - Reset camera with open palm
  - All processing done locally (no video sent to servers)
- **Timezone Aware**: Configured for America/Guayaquil (UTC-05)

## Installation

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   ```

3. **Build for Production**:
   ```bash
   npm run build
   ```

4. **Preview Production Build**:
   ```bash
   npm run preview
   ```

## Controls

### Mouse/Keyboard
- **Left Click + Drag**: Rotate camera
- **Right Click + Drag**: Pan camera
- **Scroll**: Zoom in/out

### Hand Gestures (Optional)
Enable hand tracking in the controls panel to use:

- **Pinch** (thumb + index finger): Control zoom
- **Open Palm**: Reset camera view
- **Point**: Highlight objects (coming soon)

### Simulation Controls
- **Play/Pause**: Toggle time simulation
- **Time Scale**: Speed up or slow down time (up to 1 day per second)
- **Reset**: Return to current real-world time

### Visual Options
- Toggle atmosphere, clouds, bloom effects, and orbit ring visibility

### Camera Presets
- **General View**: Overview of the solar system
- **Follow Earth**: Camera follows Earth's orbit
- **Close to Earth**: Close-up view of Earth

## Assets

The application uses procedural textures as fallbacks, but for best quality, you can add real Earth textures:

1. Download Earth textures (8K recommended):
   - Day texture: `earth_day.jpg`
   - Night lights: `earth_night.jpg`
   - Normal map: `earth_normal.jpg`
   - Specular/water mask: `earth_specular.jpg`
   - Clouds: `earth_clouds.jpg`

2. Place them in `/public/assets/`

Free textures available at:
- [NASA Visible Earth](https://visibleearth.nasa.gov/)
- [Solar System Scope](https://www.solarsystemscope.com/textures/)

## Privacy - Hand Tracking

When you enable hand gesture control:

✓ All video processing happens **locally in your browser**  
✓ **No video is sent to any server**  
✓ You can disable it at any time  
✓ Camera access can be revoked in browser settings  

The application uses MediaPipe Hand Landmarker, which runs entirely client-side.

## Technical Details

- **Framework**: Vite + TypeScript
- **3D Engine**: Three.js
- **Hand Tracking**: MediaPipe Tasks Vision
- **Timezone**: date-fns-tz
- **Rendering**: WebGL with ACESFilmic tone mapping
- **Post-processing**: Bloom effects via EffectComposer

## Troubleshooting

### Performance Issues
- Lower the DPR in `config.ts` (default: 2)
- Disable bloom in visual options
- Disable clouds/atmosphere for better performance

### Hand Tracking Not Working
- Ensure your browser supports WebRTC and MediaPipe
- Check camera permissions in browser settings
- Try using a different browser (Chrome/Edge recommended)
- Ensure good lighting conditions

### Bloom Too Strong
- Adjust bloom strength in the controls panel
- Modify bloom settings in `config.ts`

## Project Structure

```
src/
├── main.ts              # Application entry point
├── config.ts            # Configuration
├── time/                # Time system & calendar logic
├── scene/               # Scene, camera, starfield
├── bodies/              # Sun, Earth, orbit ring
├── ui/                  # HUD, controls, modal
├── input/               # Hand tracking & gestures
└── styles/              # CSS
```

## License

MIT License - Feel free to use and modify for your projects!

## Credits

- **Earth Implementation Reference**: Special thanks to [bobbyroe/threejs-earth](https://github.com/bobbyroe/threejs-earth) for the excellent reference on realistic Earth rendering, including textures and cloud implementation.
- **Built with**: Three.js, MediaPipe, and love for space 🚀
