# BoxCrafter 3D: Kinetic Cube Odyssey 📦⚡

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Engine: Unity 6](https://img.shields.io/badge/Unity-6000.6.7f1%20URP-black.svg?logo=unity)](https://unity.com/)
[![Web: 3D Canvas / WebGL](https://img.shields.io/badge/Web-Isometric%203D%20%7C%2060%20FPS-00f0ff.svg)](web/index.html)
[![Audio: Web Audio API](https://img.shields.io/badge/Audio-Procedural%20Synthesis-ff007f.svg)](web/js/audio.js)
[![Tests: Passing](https://img.shields.io/badge/Tests-88%2F88%20Passing-00ff88.svg)](tests/game_logic_test.js)

**BoxCrafter 3D** is a stylish, physics-based 3D kinetic box puzzle and arcade game. It combines edge-rolling kinematics, spatial logic puzzles, high-speed endless running, and physics tower stacking into an interactive experience playable both on the web and inside Unity 6 (Universal Render Pipeline).

---

## 🎮 Playable Game Modes

| Mode | Genre | Description |
| :--- | :--- | :--- |
| **Cube Puzzle (Sokoban)** | Spatial Logic | 6 progressive stages. Roll across grid tiles, push kinetic crates onto pressure plates, dodge pulsing lasers, and collect energy cores. Includes full Undo (`Ctrl+Z`) and move counter. |
| **Cyber Dash** | Endless Runner | High-speed 3D procedural runner. Dodge moving hazard barriers, leap across voids, collect floating energy gems, and chain speed combos. |
| **Tower Stacker** | Physics Balance | Drop oscillating cubes to stack the tallest kinetic skyscraper. Rewards timing and precision with harmonic chords and particle bursts. |

---

## ✨ Standout Features & Improvements

- **Edge-Hinged Kinematic Rolling**: Player cubes realistically pivot around bottom contact edges rather than sliding like a sphere.
- **Squash-and-Stretch Kinematics**: Dynamic scale deformation on jumps, landing impacts, and wall bumps.
- **100% Procedural Audio Engine**: Powered by the Web Audio API. Synthesizes mechanical thuds, chime bells, laser hums, and synthwave ambient pads without requiring external audio files.
- **Dynamic 3D Particle Systems**: Real-time dust puffs, electrical laser sparks, victory confetti showers, and pressure plate shockwaves.
- **Responsive Glassmorphism UI**: Frosted-glass HUD with live score, moves, timer, theme picker, and mobile on-screen virtual D-Pad.
- **4 Visual Themes**:
  - `Cyber Neon` (Cyan & Magenta glowing grid)
  - `Solar Dawn` (Warm sunset amber & violet)
  - `Matrix Green` (Digital terminal phosphor)
  - `Minimalist Dark` (Clean slate graphite & stark white)
- **State Persistence**: Remembers best scores, theme preferences, and completed stages via `localStorage`.

---

## 🕹️ Controls

| Action | Desktop Keyboard | Mobile / Tablet |
| :--- | :--- | :--- |
| **Roll / Steer** | <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> or <kbd>↑</kbd> <kbd>←</kbd> <kbd>↓</kbd> <kbd>→</kbd> | On-Screen D-Pad (▲ ◀ ▼ ▶) |
| **Jump / Action** | <kbd>Space</kbd> | On-Screen **JUMP** Button |
| **Undo Move** | <kbd>U</kbd> or <kbd>Ctrl</kbd> + <kbd>Z</kbd> | Tap `Undo` Button |
| **Restart Level** | <kbd>R</kbd> | Tap `Restart` Button |
| **Mute / Unmute** | <kbd>M</kbd> | Tap Audio Speaker Icon |

---

## 🚀 Quick Start (Play in Browser)

You can launch and play the game in seconds using any local HTTP server:

```bash
# Option 1: Using Node.js
npm start

# Option 2: Using Python 3
python3 -m http.server 3000

# Open http://localhost:3000 in your browser!
```

To run the automated physics and level test suite:
```bash
npm test
```

---

## 🏗️ Project Architecture

```
isd/
├── index.html                 # Web launcher entrypoint (GitHub Pages ready)
├── package.json               # Node metadata, start & test scripts
├── LICENSE                    # MIT License
├── NOTICE.md                  # Attribution & derivative works notice
├── README.md                  # Project documentation & guide
│
├── web/                       # Playable Interactive 3D Web Game
│   ├── index.html             # UI overlay, canvas, and modals
│   ├── css/
│   │   └── style.css          # Glassmorphism, animations, responsive design
│   └── js/
│       ├── audio.js           # Procedural Web Audio synthesizer
│       ├── particles.js       # 3D Particle emitter system
│       ├── renderer.js        # Isometric 3D canvas rendering engine
│       ├── levels.js          # Handcrafted puzzle stages & procedural track
│       └── game.js            # Game loop, state machine, physics & input
│
├── tests/
│   └── game_logic_test.js     # 88-assertion automated test suite
│
├── Assets/                    # Unity 6 URP Source Assets
│   ├── Scripts/               # Production C# Game Architecture
│   │   ├── PlayerController.cs # Edge-rolling kinematics & squash-and-stretch
│   │   ├── PushableBox.cs     # Grid checking and box pushing logic
│   │   ├── PressurePlate.cs   # Trigger plate activation & visual feedback
│   │   ├── LevelManager.cs    # Stage progression & win/lose evaluation
│   │   ├── GameUI.cs          # HUD, pause overlay, move/timer display
│   │   ├── CameraFollow.cs    # Smooth damp isometric follow & screen shake
│   │   ├── AudioManager.cs    # Procedural sound clip playback & pitch variation
│   │   └── Hazard.cs          # Oscillating laser hazards & obstacles
│   ├── Scenes/                # SampleScene.unity
│   ├── Settings/              # Universal Render Pipeline settings
│   └── InputSystem_Actions    # Input System bindings
│
├── Packages/
│   └── manifest.json          # Unity package dependencies
└── ProjectSettings/           # Unity project settings (configured for BoxCrafter 3D)
```

---

## 🛠️ Opening in Unity 6

1. Open **Unity Hub**.
2. Click **Add** -> **Add project from disk**.
3. Select this folder (`isd`).
4. Ensure the editor version is set to **Unity 6 (6000.6.7f1)**.
5. Open `Assets/Scenes/SampleScene.unity`.
6. Attach the controllers from `Assets/Scripts/` to your scene objects.

---

## 📜 Attribution & License

- **License**: Released under the [MIT License](LICENSE).
- **Attribution**:
  - Based on architectural scaffolding from [https://github.com/Abhay750/box_game](https://github.com/Abhay750/box_game) by **Abhay750**.
  - Base project template configurations provided by **Unity Technologies**.
  - All gameplay logic, 3D isometric canvas engine, procedural Web Audio synthesizer, levels, and C# mechanics authored by the BoxCrafter 3D contributors.
  - See [NOTICE.md](NOTICE.md) for full attribution details.

