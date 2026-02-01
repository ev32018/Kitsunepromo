import type { AudioData } from "./audioAnalyzer";
import type { VisualizationType, ColorScheme } from "@shared/schema";

export interface VisualizerConfig {
  sensitivity: number;
  smoothing: number;
  barCount: number;
  particleCount: number;
  glowIntensity: number;
  rotationSpeed: number;
  colorIntensity: number;
  mirrorMode: boolean;
}

const defaultConfig: VisualizerConfig = {
  sensitivity: 1.5,
  smoothing: 0.8,
  barCount: 64,
  particleCount: 150,
  glowIntensity: 1,
  rotationSpeed: 0.5,
  colorIntensity: 1,
  mirrorMode: false,
};

export const colorSchemes: Record<ColorScheme, string[]> = {
  neon: ["#ff00ff", "#00ffff", "#ff0080", "#80ff00", "#0080ff"],
  sunset: ["#ff6b35", "#f7c59f", "#efa00b", "#d65108", "#591f0a"],
  ocean: ["#0077b6", "#00b4d8", "#90e0ef", "#caf0f8", "#03045e"],
  galaxy: ["#7400b8", "#6930c3", "#5e60ce", "#5390d9", "#4ea8de"],
  fire: ["#ff0000", "#ff4500", "#ff8c00", "#ffa500", "#ffcc00"],
  matrix: ["#00ff00", "#00cc00", "#009900", "#006600", "#003300"],
  pastel: ["#ffadad", "#ffd6a5", "#fdffb6", "#caffbf", "#9bf6ff"],
  monochrome: ["#ffffff", "#cccccc", "#999999", "#666666", "#333333"],
};

let particles: Array<{
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  color: string;
}> = [];

let rotation = 0;

export function drawVisualization(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  audioData: AudioData,
  type: VisualizationType,
  colorScheme: ColorScheme,
  config: Partial<VisualizerConfig> = {},
  backgroundImage?: HTMLImageElement | null
): void {
  const cfg = { ...defaultConfig, ...config };
  const colors = colorSchemes[colorScheme];
  const { width, height } = canvas;

  ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
  ctx.fillRect(0, 0, width, height);

  if (backgroundImage) {
    ctx.globalAlpha = 0.3;
    ctx.drawImage(backgroundImage, 0, 0, width, height);
    ctx.globalAlpha = 1;
  }

  rotation += cfg.rotationSpeed * 0.01;

  switch (type) {
    case "bars":
      drawBars(ctx, canvas, audioData, colors, cfg);
      break;
    case "waveform":
      drawWaveform(ctx, canvas, audioData, colors, cfg);
      break;
    case "circular":
      drawCircular(ctx, canvas, audioData, colors, cfg);
      break;
    case "particles":
      drawParticles(ctx, canvas, audioData, colors, cfg);
      break;
    case "fluid":
      drawFluid(ctx, canvas, audioData, colors, cfg);
      break;
    case "spectrum3d":
      drawSpectrum3D(ctx, canvas, audioData, colors, cfg);
      break;
    case "radialBurst":
      drawRadialBurst(ctx, canvas, audioData, colors, cfg);
      break;
    case "mountainRange":
      drawMountainRange(ctx, canvas, audioData, colors, cfg);
      break;
  }
}

function drawBars(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  audioData: AudioData,
  colors: string[],
  config: VisualizerConfig
): void {
  const { width, height } = canvas;
  const { frequencyData, bassLevel } = audioData;
  const barCount = config.barCount;
  const barWidth = width / barCount - 2;
  const step = Math.floor(frequencyData.length / barCount);

  for (let i = 0; i < barCount; i++) {
    const value = frequencyData[i * step] * config.sensitivity;
    const barHeight = (value / 255) * height * 0.8;
    const x = i * (barWidth + 2);
    const y = height - barHeight;

    const gradient = ctx.createLinearGradient(x, height, x, y);
    const colorIndex = Math.floor((i / barCount) * colors.length);
    gradient.addColorStop(0, colors[colorIndex % colors.length]);
    gradient.addColorStop(1, colors[(colorIndex + 1) % colors.length]);

    ctx.fillStyle = gradient;
    ctx.shadowColor = colors[colorIndex % colors.length];
    ctx.shadowBlur = 10 * config.glowIntensity * (bassLevel / 128);

    if (config.mirrorMode) {
      ctx.fillRect(x, height / 2 - barHeight / 2, barWidth, barHeight / 2);
      ctx.fillRect(x, height / 2, barWidth, barHeight / 2);
    } else {
      ctx.fillRect(x, y, barWidth, barHeight);
    }
  }
  ctx.shadowBlur = 0;
}

function drawWaveform(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  audioData: AudioData,
  colors: string[],
  config: VisualizerConfig
): void {
  const { width, height } = canvas;
  const { timeDomainData, bassLevel } = audioData;
  const sliceWidth = width / timeDomainData.length;

  ctx.lineWidth = 3;
  ctx.shadowColor = colors[0];
  ctx.shadowBlur = 15 * config.glowIntensity;

  const gradient = ctx.createLinearGradient(0, 0, width, 0);
  colors.forEach((color, i) => {
    gradient.addColorStop(i / (colors.length - 1), color);
  });
  ctx.strokeStyle = gradient;

  ctx.beginPath();
  let x = 0;

  for (let i = 0; i < timeDomainData.length; i++) {
    const v = timeDomainData[i] / 128.0;
    const y = (v * height) / 2;

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
    x += sliceWidth;
  }

  ctx.stroke();

  if (config.mirrorMode) {
    ctx.save();
    ctx.translate(0, height);
    ctx.scale(1, -1);
    ctx.stroke();
    ctx.restore();
  }

  ctx.shadowBlur = 0;
}

function drawCircular(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  audioData: AudioData,
  colors: string[],
  config: VisualizerConfig
): void {
  const { width, height } = canvas;
  const { frequencyData, bassLevel } = audioData;
  const centerX = width / 2;
  const centerY = height / 2;
  const baseRadius = Math.min(width, height) * 0.25;
  const barCount = config.barCount;
  const step = Math.floor(frequencyData.length / barCount);

  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(rotation);

  for (let i = 0; i < barCount; i++) {
    const value = frequencyData[i * step] * config.sensitivity;
    const barLength = (value / 255) * baseRadius;
    const angle = (i / barCount) * Math.PI * 2;

    const x1 = Math.cos(angle) * baseRadius;
    const y1 = Math.sin(angle) * baseRadius;
    const x2 = Math.cos(angle) * (baseRadius + barLength);
    const y2 = Math.sin(angle) * (baseRadius + barLength);

    const colorIndex = Math.floor((i / barCount) * colors.length);
    ctx.strokeStyle = colors[colorIndex % colors.length];
    ctx.lineWidth = 3;
    ctx.shadowColor = colors[colorIndex % colors.length];
    ctx.shadowBlur = 10 * config.glowIntensity;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    if (config.mirrorMode) {
      ctx.beginPath();
      ctx.moveTo(-x1, -y1);
      ctx.lineTo(-x2, -y2);
      ctx.stroke();
    }
  }

  ctx.beginPath();
  ctx.arc(0, 0, baseRadius * (0.8 + (bassLevel / 255) * 0.4), 0, Math.PI * 2);
  const innerGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, baseRadius);
  innerGradient.addColorStop(0, colors[0] + "40");
  innerGradient.addColorStop(1, colors[colors.length - 1] + "00");
  ctx.fillStyle = innerGradient;
  ctx.fill();

  ctx.restore();
  ctx.shadowBlur = 0;
}

function drawParticles(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  audioData: AudioData,
  colors: string[],
  config: VisualizerConfig
): void {
  const { width, height } = canvas;
  const { bassLevel, trebleLevel, averageFrequency } = audioData;

  const spawnCount = Math.floor((bassLevel / 128) * 5);
  for (let i = 0; i < spawnCount && particles.length < config.particleCount; i++) {
    particles.push({
      x: width / 2 + (Math.random() - 0.5) * 100,
      y: height / 2 + (Math.random() - 0.5) * 100,
      vx: (Math.random() - 0.5) * 4 * (bassLevel / 128),
      vy: (Math.random() - 0.5) * 4 * (bassLevel / 128),
      size: Math.random() * 6 + 2,
      life: 1,
      color: colors[Math.floor(Math.random() * colors.length)],
    });
  }

  particles.forEach((p, index) => {
    p.x += p.vx * config.sensitivity;
    p.y += p.vy * config.sensitivity;
    p.life -= 0.01;
    p.size *= 0.99;

    if (p.life <= 0 || p.x < 0 || p.x > width || p.y < 0 || p.y > height) {
      particles.splice(index, 1);
      return;
    }

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = p.color + Math.floor(p.life * 255).toString(16).padStart(2, "0");
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 15 * config.glowIntensity;
    ctx.fill();
  });

  ctx.shadowBlur = 0;
}

function drawFluid(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  audioData: AudioData,
  colors: string[],
  config: VisualizerConfig
): void {
  const { width, height } = canvas;
  const { frequencyData, bassLevel, midLevel, trebleLevel } = audioData;
  const time = Date.now() * 0.001;

  for (let layer = 0; layer < 3; layer++) {
    ctx.beginPath();
    ctx.moveTo(0, height);

    const layerOffset = layer * (height / 4);
    const frequency = 0.01 + layer * 0.005;
    const amplitude = (frequencyData[layer * 20] / 255) * 100 * config.sensitivity;

    for (let x = 0; x <= width; x += 5) {
      const y =
        height -
        layerOffset -
        Math.sin(x * frequency + time + layer) * amplitude -
        Math.cos(x * frequency * 0.5 + time * 0.5) * (amplitude * 0.5);
      ctx.lineTo(x, y);
    }

    ctx.lineTo(width, height);
    ctx.closePath();

    const gradient = ctx.createLinearGradient(0, height - layerOffset - amplitude, 0, height);
    gradient.addColorStop(0, colors[layer % colors.length] + "80");
    gradient.addColorStop(1, colors[(layer + 1) % colors.length] + "20");
    ctx.fillStyle = gradient;
    ctx.fill();
  }
}

function drawSpectrum3D(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  audioData: AudioData,
  colors: string[],
  config: VisualizerConfig
): void {
  const { width, height } = canvas;
  const { frequencyData } = audioData;
  const barCount = config.barCount;
  const step = Math.floor(frequencyData.length / barCount);
  const perspective = 0.7;

  for (let i = barCount - 1; i >= 0; i--) {
    const value = frequencyData[i * step] * config.sensitivity;
    const barHeight = (value / 255) * height * 0.5;
    const depth = i / barCount;

    const x = width * 0.1 + (width * 0.8 * i) / barCount;
    const y = height * 0.7 - depth * height * 0.3;
    const barWidth = (width * 0.8) / barCount - 2;
    const scaledHeight = barHeight * (1 - depth * perspective);

    const colorIndex = Math.floor((i / barCount) * colors.length);
    const alpha = 1 - depth * 0.5;

    ctx.fillStyle = colors[colorIndex % colors.length] + Math.floor(alpha * 255).toString(16).padStart(2, "0");
    ctx.shadowColor = colors[colorIndex % colors.length];
    ctx.shadowBlur = 10 * config.glowIntensity * (1 - depth);

    ctx.fillRect(x, y - scaledHeight, barWidth * (1 - depth * 0.3), scaledHeight);
  }
  ctx.shadowBlur = 0;
}

function drawRadialBurst(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  audioData: AudioData,
  colors: string[],
  config: VisualizerConfig
): void {
  const { width, height } = canvas;
  const { frequencyData, bassLevel, trebleLevel } = audioData;
  const centerX = width / 2;
  const centerY = height / 2;
  const rays = config.barCount;
  const step = Math.floor(frequencyData.length / rays);

  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(rotation * 2);

  for (let i = 0; i < rays; i++) {
    const value = frequencyData[i * step] * config.sensitivity;
    const length = (value / 255) * Math.min(width, height) * 0.4;
    const angle = (i / rays) * Math.PI * 2;

    const gradient = ctx.createLinearGradient(0, 0, Math.cos(angle) * length, Math.sin(angle) * length);
    const colorIndex = Math.floor((i / rays) * colors.length);
    gradient.addColorStop(0, colors[colorIndex % colors.length] + "ff");
    gradient.addColorStop(1, colors[(colorIndex + 1) % colors.length] + "00");

    ctx.strokeStyle = gradient;
    ctx.lineWidth = 2 + (bassLevel / 128) * 3;
    ctx.shadowColor = colors[colorIndex % colors.length];
    ctx.shadowBlur = 15 * config.glowIntensity;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(angle) * length, Math.sin(angle) * length);
    ctx.stroke();
  }

  ctx.restore();
  ctx.shadowBlur = 0;
}

function drawMountainRange(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  audioData: AudioData,
  colors: string[],
  config: VisualizerConfig
): void {
  const { width, height } = canvas;
  const { frequencyData, bassLevel } = audioData;
  const layers = 4;
  const step = Math.floor(frequencyData.length / config.barCount);

  for (let layer = layers - 1; layer >= 0; layer--) {
    ctx.beginPath();
    ctx.moveTo(0, height);

    const layerHeight = height * (0.3 + layer * 0.15);
    const layerOffset = layer * 20;

    for (let i = 0; i <= config.barCount; i++) {
      const value = frequencyData[((i + layerOffset) % config.barCount) * step] * config.sensitivity;
      const x = (i / config.barCount) * width;
      const peak = (value / 255) * layerHeight * (1 - layer * 0.2);
      const y = height - layerHeight * 0.3 - peak;

      if (i === 0) {
        ctx.moveTo(x, height);
        ctx.lineTo(x, y);
      } else {
        const prevX = ((i - 1) / config.barCount) * width;
        const cpX = (x + prevX) / 2;
        ctx.quadraticCurveTo(prevX, y, cpX, y);
        ctx.lineTo(x, y);
      }
    }

    ctx.lineTo(width, height);
    ctx.closePath();

    const gradient = ctx.createLinearGradient(0, height - layerHeight, 0, height);
    gradient.addColorStop(0, colors[layer % colors.length] + "cc");
    gradient.addColorStop(1, colors[(layer + 1) % colors.length] + "40");
    ctx.fillStyle = gradient;
    ctx.shadowColor = colors[layer % colors.length];
    ctx.shadowBlur = 8 * config.glowIntensity;
    ctx.fill();
  }
  ctx.shadowBlur = 0;
}

export function clearParticles(): void {
  particles = [];
}

export function resetRotation(): void {
  rotation = 0;
}
