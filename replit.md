# Kitsune Promo - Audio Visualization Studio

## Overview
Kitsune Promo is a professional audio visualization web application that creates stunning, synchronized visualizations from audio files with AI-enhanced backgrounds and video export capabilities.

## Features
- **Audio Upload**: Support for MP3, WAV, OGG, FLAC files up to 100MB
- **15 Visualization Styles**: Frequency Bars, Waveform, Circular, Particles, Fluid Waves, 3D Spectrum, Radial Burst, Mountain Range, Spectrum Analyzer, Equalizer, Audio Bars, Perlin Fluid, Audio Blob, Kaleidoscope, Endless Maze
- **Custom Image Effects**: 23 audio-reactive effects organized into categories:
  - Transform: Pulse, Zoom Pulse, Rotation
  - Distortion: Wave Distortion, Glitch, Blur Pulse
  - Color: Color Shift, Chromatic Aberration, Scanlines
  - Overlay: Mirror (horizontal/vertical/both), Vignette
  - Creative: Circle Rotation (concentric circles rotating independently), Rain Mask (animated rain drops), Slice Shift (horizontal/vertical slices), Water Ripple, Pixel Sort, Tunnel Zoom, Shatter (image broken into pieces), Liquid Morph (fluid distortion)
  - Segmented: Spiral Wedges (pie segments rotating), Wave Bands (horizontal strips waving), Grid Warp (grid cells shifting/rotating), Radial Zoom (radial segments zooming)
- **8 Color Schemes**: Neon, Sunset, Ocean, Galaxy, Fire, Matrix, Pastel, Monochrome
- **Custom Color Schemes**: Create custom color palettes with up to 8 colors
- **AI Background Generation**: Generate custom backgrounds using OpenAI's image generation
- **Social Media Aspect Ratios**: 16:9 (YouTube), 9:16 (TikTok/Reels), 1:1 (Instagram), 4:5 (Instagram Portrait) with letterbox color control
- **Blend Modes**: 12 blend modes for visualization-image compositing (normal, multiply, screen, overlay, soft-light, hard-light, color-dodge, color-burn, difference, exclusion, lighten, darken)
- **Ken Burns Effect**: Cinematic pan/zoom for static images with 7 direction modes (zoom-in, zoom-out, pan-left/right/up/down, random)
- **Particle Overlays**: 7 audio-reactive particle types (sparkles, bokeh, confetti, snow, fireflies, bubbles, stars)
- **Text Overlay**: Advanced text overlay with 6 animations (pulse, bounce, glow, wave, fade), 9 positions, font customization, and audio-reactive options
- **Progress Bar**: 5 styles (line, dots, wave, glow, minimal) with customizable colors and position
- **Video Export**: Export as WebM or MP4 in 720p, 1080p, or 1440p with:
  - Frame rate options: 24, 30, 60 fps
  - Fade-in/out effects
  - Loop preview for playback testing
  - Aspect-ratio-aware export with letterboxing
- **Real-time Controls**: Sensitivity, bar count, particle count, glow intensity, rotation speed, mirror mode
- **Fullscreen Mode**: Immersive fullscreen visualization viewing
- **Keyboard Shortcuts**: Space (play/pause), arrows (seek), F (fullscreen), M (mute), ? (help)
- **Waveform Preview**: Visual waveform display with seek-on-click in audio player
- **BPM Detection**: Automatic tempo detection from audio files
- **Presets**: Save and load visualization presets with shareable codes
- **Template Gallery**: 17 professional pre-designed templates organized by category:
  - Social Media: TikTok Viral, Instagram Story, YouTube Intro, Instagram Feed
  - Genre: EDM Energy, Hip-Hop Beats, Lo-fi Chill, Rock Anthem, Classical Elegance, Pop Vibes
  - Style: Cyberpunk, Minimalist, Retro Wave, Neon Dreams, Dark Mode, Ocean Vibes, Galaxy Space
  - Search and filter by category, quick-apply from sidebar
- **Audio Trimming**: Select start/end points for export with visual timeline, time inputs, sliders, and preview functionality
- **Watermark/Logo System**: Drag-and-drop upload with 9 position options, size, opacity, and padding controls
- **Performance Mode**: 4 quality levels (low/medium/high/ultra), FPS options (24/30/60), particle reduction toggle
- **Thumbnail Generator**: Auto-generate thumbnails for 6 social platforms (YouTube, TikTok, Instagram, Twitter, Facebook) with capture time selection and batch download
- **Intro/Outro Fades**: 8 transition effects (fade, fade-blur, fade-zoom, slide directions), customizable duration and background colors
- **Undo/Redo Controls**: Toolbar buttons with visual history indicator, tracks visualization and color scheme changes
- **Batch Export**: Export multiple formats/aspect ratios simultaneously (YouTube + TikTok + Instagram)
- **Waveform Trimmer**: Visual waveform display with beat markers, peak analysis, and precise timeline editing
- **Loop Region Preview**: A-B loop points for testing specific audio sections before export
- **Project Save/Load**: Export and import complete project settings as JSON files
- **Quick Export Presets**: One-click platform-specific configurations (YouTube, TikTok, Instagram, Spotify Canvas, Custom)
- **Audio Normalization**: Auto-adjust audio levels with target presets (-14dB streaming, -16dB broadcast, -9dB loud)
- **Visualization Scheduler**: Schedule different visualization styles for different song sections with transitions
- **Effect Automation**: 14 preset automation patterns with multi-effect blending:
  - Energy: EDM Drop, Bass Reactor
  - Ambient: Chill Vibes, Dreamy
  - Glitch: Glitch Mode, Horror Glitch
  - Weather: Rain Storm, Underwater
  - Creative: Psychedelic, Cosmic Journey, Neon City, Kaleidoscope
  - Retro: Retro VHS
  - Minimal: Minimal Pulse
  - Features:
  - Sequential, random, or beat-sync cycling modes
  - Customizable cycle timing or beats-per-change
  - Automatic effect transitions synced to BPM
- **Keyboard Shortcut Customization**: Customize all hotkeys with real-time key capture
- **Recent Projects History**: Quick access to last 10 project settings (localStorage)
- **Export Progress with ETA**: Real-time progress bar with estimated time remaining
- **Drag-and-Drop Preset Reordering**: Organize saved presets via drag-and-drop
- **Mobile Responsive Design**: Collapsible sidebar, touch-friendly UI, optimized for tablets and phones

## Tech Stack
- **Frontend**: React, TypeScript, TailwindCSS, Shadcn UI
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **AI**: OpenAI (via Replit AI Integrations) for background generation
- **Audio**: Web Audio API for real-time audio analysis

## Project Structure
```
client/
├── src/
│   ├── components/     # React components
│   │   ├── AudioPlayer.tsx
│   │   ├── AudioUploader.tsx
│   │   ├── VisualizerCanvas.tsx
│   │   ├── VisualizationStylePicker.tsx
│   │   ├── ColorSchemePicker.tsx
│   │   ├── VisualizationControls.tsx
│   │   ├── ExportControls.tsx
│   │   ├── AIBackgroundGenerator.tsx
│   │   ├── PresetManager.tsx
│   │   ├── OverlaySettings.tsx
│   │   ├── CustomColorPicker.tsx
│   │   ├── ImageEffectsSettings.tsx
│   │   ├── AspectRatioSettings.tsx
│   │   ├── BlendModeSettings.tsx
│   │   ├── KenBurnsSettings.tsx
│   │   ├── ParticleOverlaySettings.tsx
│   │   ├── TextOverlaySettings.tsx
│   │   ├── ProgressBarSettings.tsx
│   │   ├── TemplateGallery.tsx
│   │   ├── AudioTrimmer.tsx
│   │   ├── WatermarkSettings.tsx
│   │   ├── PerformanceSettings.tsx
│   │   ├── ThumbnailGenerator.tsx
│   │   ├── FadeSettings.tsx
│   │   ├── UndoRedoControls.tsx
│   │   ├── BatchExport.tsx
│   │   ├── WaveformTrimmer.tsx
│   │   ├── LoopRegion.tsx
│   │   ├── ProjectManager.tsx
│   │   ├── QuickExportPresets.tsx
│   │   ├── AudioNormalization.tsx
│   │   ├── VisualizationScheduler.tsx
│   │   ├── KeyboardShortcutSettings.tsx
│   │   ├── RecentProjects.tsx
│   │   ├── ExportProgress.tsx
│   │   ├── DraggablePresetList.tsx
│   │   └── EffectAutomation.tsx
│   ├── lib/           # Utility libraries
│   │   ├── audioAnalyzer.ts    # Web Audio API wrapper
│   │   ├── visualizers.ts      # Canvas visualization renderers
│   │   └── queryClient.ts      # React Query setup
│   └── pages/         # Page components
│       └── Home.tsx
server/
├── routes.ts          # API endpoints
├── storage.ts         # Database operations
└── db.ts             # Database connection
shared/
└── schema.ts         # Database schema and types
```

## API Endpoints
- `GET /api/projects` - List all projects
- `GET /api/projects/:id` - Get a project
- `POST /api/projects` - Create a project
- `PATCH /api/projects/:id` - Update a project
- `DELETE /api/projects/:id` - Delete a project
- `GET /api/presets` - List all presets
- `POST /api/presets` - Create a preset (auto-generates share code)
- `DELETE /api/presets/:id` - Delete a preset
- `GET /api/presets/share/:code` - Get preset by share code
- `POST /api/generate-background` - Generate AI background image
- `POST /api/upload-audio` - Upload audio file

## Database Schema
- **visualization_projects**: Stores visualization projects with settings
- **visualization_presets**: Stores visualization presets with share codes

## Running the Application
The application runs on port 5000 using `npm run dev` which starts both the Express backend and Vite frontend.

## Keyboard Shortcuts
- **Space**: Play/Pause
- **Left Arrow**: Seek back 5 seconds
- **Right Arrow**: Seek forward 5 seconds
- **F**: Toggle fullscreen
- **M**: Toggle mute
- **?**: Show/hide keyboard shortcuts panel

## Environment Variables
- `DATABASE_URL` - PostgreSQL connection string (auto-configured)
- `AI_INTEGRATIONS_OPENAI_API_KEY` - OpenAI API key (auto-configured via Replit AI Integrations)
- `AI_INTEGRATIONS_OPENAI_BASE_URL` - OpenAI base URL (auto-configured)
