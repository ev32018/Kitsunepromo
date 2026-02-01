# AudioViz - Audio Visualization Studio

## Overview
AudioViz is a professional audio visualization web application that creates stunning, synchronized visualizations from audio files with AI-enhanced backgrounds and video export capabilities.

## Features
- **Audio Upload**: Support for MP3, WAV, OGG, FLAC files up to 100MB
- **8 Visualization Styles**: Frequency Bars, Waveform, Circular, Particles, Fluid Waves, 3D Spectrum, Radial Burst, Mountain Range
- **8 Color Schemes**: Neon, Sunset, Ocean, Galaxy, Fire, Matrix, Pastel, Monochrome
- **AI Background Generation**: Generate custom backgrounds using OpenAI's image generation
- **Video Export**: Export visualizations as WebM or MP4 videos in 720p, 1080p, or 1440p
- **Real-time Controls**: Sensitivity, bar count, particle count, glow intensity, rotation speed, mirror mode

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
│   │   └── AIBackgroundGenerator.tsx
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
- `POST /api/generate-background` - Generate AI background image
- `POST /api/upload-audio` - Upload audio file

## Database Schema
- **visualization_projects**: Stores visualization projects with settings

## Running the Application
The application runs on port 5000 using `npm run dev` which starts both the Express backend and Vite frontend.

## Environment Variables
- `DATABASE_URL` - PostgreSQL connection string (auto-configured)
- `AI_INTEGRATIONS_OPENAI_API_KEY` - OpenAI API key (auto-configured via Replit AI Integrations)
- `AI_INTEGRATIONS_OPENAI_BASE_URL` - OpenAI base URL (auto-configured)
