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
  backgroundImage?: HTMLImageElement | null,
  customColors?: string[],
  skipBackgroundFill?: boolean
): void {
  const cfg = { ...defaultConfig, ...config };
  const colors = customColors && customColors.length > 0 ? customColors : colorSchemes[colorScheme];
  const { width, height } = canvas;

  if (!skipBackgroundFill) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
    ctx.fillRect(0, 0, width, height);
  }

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
    case "spectrumAnalyzer":
      drawSpectrumAnalyzer(ctx, canvas, audioData, colors, cfg);
      break;
    case "equalizer":
      drawEqualizer(ctx, canvas, audioData, colors, cfg);
      break;
    case "audioBars":
      drawAudioBars(ctx, canvas, audioData, colors, cfg);
      break;
    case "perlinFluid":
      drawPerlinFluid(ctx, canvas, audioData, colors, cfg);
      break;
    case "audioBlob":
      drawAudioBlob(ctx, canvas, audioData, colors, cfg);
      break;
    case "kaleidoscope":
      drawKaleidoscope(ctx, canvas, audioData, colors, cfg);
      break;
    case "endlessMaze":
      drawEndlessMaze(ctx, canvas, audioData, colors, cfg);
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

function drawSpectrumAnalyzer(
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
  const barWidth = (width / barCount) * 0.8;
  const gap = (width / barCount) * 0.2;

  for (let i = 0; i < barCount; i++) {
    const value = frequencyData[i * step] * config.sensitivity;
    const barHeight = (value / 255) * height * 0.85;
    const x = i * (barWidth + gap);
    const y = height - barHeight;

    const segments = 20;
    const segmentHeight = barHeight / segments;

    for (let s = 0; s < segments; s++) {
      const segY = height - (s + 1) * segmentHeight;
      const intensity = s / segments;
      const colorIndex = Math.floor(intensity * (colors.length - 1));
      
      ctx.fillStyle = colors[colorIndex];
      ctx.shadowColor = colors[colorIndex];
      ctx.shadowBlur = 5 * config.glowIntensity;
      
      if (segY >= y) {
        ctx.fillRect(x, segY, barWidth, segmentHeight - 1);
      }
    }

    ctx.fillStyle = colors[0];
    ctx.shadowColor = colors[0];
    ctx.shadowBlur = 10 * config.glowIntensity;
    ctx.fillRect(x, y - 4, barWidth, 3);
  }
  ctx.shadowBlur = 0;
}

function drawEqualizer(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  audioData: AudioData,
  colors: string[],
  config: VisualizerConfig
): void {
  const { width, height } = canvas;
  const { frequencyData, bassLevel, midLevel, trebleLevel } = audioData;
  const bands = 10;
  const bandWidth = width / bands - 10;

  const levels = [bassLevel, bassLevel * 0.9, midLevel * 1.1, midLevel, midLevel * 0.95, 
                  midLevel * 0.9, trebleLevel * 1.1, trebleLevel, trebleLevel * 0.8, trebleLevel * 0.6];

  for (let i = 0; i < bands; i++) {
    const value = (levels[i] / 255) * config.sensitivity;
    const barHeight = value * height * 0.8;
    const x = i * (bandWidth + 10) + 5;
    const centerY = height / 2;

    const gradient = ctx.createLinearGradient(x, centerY - barHeight / 2, x, centerY + barHeight / 2);
    const colorIndex = Math.floor((i / bands) * colors.length);
    gradient.addColorStop(0, colors[colorIndex % colors.length]);
    gradient.addColorStop(0.5, colors[(colorIndex + 1) % colors.length]);
    gradient.addColorStop(1, colors[colorIndex % colors.length]);

    ctx.fillStyle = gradient;
    ctx.shadowColor = colors[colorIndex % colors.length];
    ctx.shadowBlur = 15 * config.glowIntensity;

    const radius = 5;
    ctx.beginPath();
    ctx.roundRect(x, centerY - barHeight / 2, bandWidth, barHeight, radius);
    ctx.fill();
  }
  ctx.shadowBlur = 0;
}

function drawAudioBars(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  audioData: AudioData,
  colors: string[],
  config: VisualizerConfig
): void {
  const { width, height } = canvas;
  const { frequencyData, timeDomainData } = audioData;
  const barCount = config.barCount;
  const step = Math.floor(frequencyData.length / barCount);
  const barWidth = width / barCount - 1;

  for (let i = 0; i < barCount; i++) {
    const freqValue = frequencyData[i * step] * config.sensitivity;
    const timeValue = timeDomainData[i * step];
    const combinedValue = (freqValue + (timeValue - 128) * 2) / 2;
    const barHeight = (Math.abs(combinedValue) / 255) * height * 0.9;
    
    const x = i * (barWidth + 1);
    const centerY = height / 2;

    const colorIndex = Math.floor((i / barCount) * colors.length);
    const gradient = ctx.createLinearGradient(x, centerY - barHeight, x, centerY + barHeight);
    gradient.addColorStop(0, colors[colorIndex % colors.length] + "00");
    gradient.addColorStop(0.3, colors[colorIndex % colors.length]);
    gradient.addColorStop(0.5, colors[(colorIndex + 1) % colors.length]);
    gradient.addColorStop(0.7, colors[colorIndex % colors.length]);
    gradient.addColorStop(1, colors[colorIndex % colors.length] + "00");

    ctx.fillStyle = gradient;
    ctx.shadowColor = colors[colorIndex % colors.length];
    ctx.shadowBlur = 8 * config.glowIntensity;

    ctx.fillRect(x, centerY - barHeight / 2, barWidth, barHeight);
  }
  ctx.shadowBlur = 0;
}

// Value noise implementation for organic flowing effects
function noise2D(x: number, y: number): number {
  const permutation = [151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,175,74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,89,18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,250,124,123,5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,223,183,170,213,119,248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,218,246,97,228,251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,14,239,107,49,192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180];
  
  const xi = Math.floor(x) & 255;
  const yi = Math.floor(y) & 255;
  const xf = x - Math.floor(x);
  const yf = y - Math.floor(y);
  
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  
  const aa = permutation[(permutation[xi] + yi) & 255];
  const ab = permutation[(permutation[xi] + yi + 1) & 255];
  const ba = permutation[(permutation[(xi + 1) & 255] + yi) & 255];
  const bb = permutation[(permutation[(xi + 1) & 255] + yi + 1) & 255];
  
  const x1 = (1 - u) * ((aa & 1) === 0 ? xf : -xf) + u * ((ba & 1) === 0 ? xf - 1 : -(xf - 1));
  const x2 = (1 - u) * ((ab & 1) === 0 ? xf : -xf) + u * ((bb & 1) === 0 ? xf - 1 : -(xf - 1));
  
  return (1 - v) * x1 + v * x2;
}

function drawPerlinFluid(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  audioData: AudioData,
  colors: string[],
  config: VisualizerConfig
): void {
  const { width, height } = canvas;
  const { bassLevel, midLevel, trebleLevel, averageFrequency } = audioData;
  const time = Date.now() * 0.0005;
  
  const resolution = 8;
  const cols = Math.ceil(width / resolution);
  const rows = Math.ceil(height / resolution);
  
  const bassNorm = bassLevel / 255;
  const midNorm = midLevel / 255;
  const trebleNorm = trebleLevel / 255;
  
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const nx = x / cols;
      const ny = y / rows;
      
      const noiseVal = noise2D(
        nx * 4 + time + bassNorm * 2,
        ny * 4 + time * 0.7 + midNorm
      );
      
      const noiseVal2 = noise2D(
        nx * 8 + time * 1.5,
        ny * 8 + time * 0.5 + trebleNorm * 3
      );
      
      const combined = (noiseVal + noiseVal2 * 0.5 + 1) / 2;
      const intensity = combined * config.sensitivity * (0.5 + averageFrequency / 255);
      
      const colorIndex = Math.floor(combined * (colors.length - 1));
      
      const baseColor = colors[colorIndex];
      const alpha = Math.min(255, Math.max(0, Math.floor(intensity * 200 + 55)));
      
      ctx.fillStyle = baseColor + alpha.toString(16).padStart(2, '0');
      ctx.fillRect(x * resolution, y * resolution, resolution, resolution);
    }
  }
  
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 3; i++) {
    const layerTime = time + i * 0.3;
    const amplitude = (i === 0 ? bassNorm : i === 1 ? midNorm : trebleNorm) * 100 * config.sensitivity;
    
    ctx.beginPath();
    for (let x = 0; x <= width; x += 3) {
      const nx = x / width;
      const noiseY = noise2D(nx * 3 + layerTime, i + layerTime * 0.5);
      const y = height / 2 + noiseY * amplitude + (i - 1) * 50;
      
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    
    ctx.strokeStyle = colors[i % colors.length] + '80';
    ctx.lineWidth = 3 + bassNorm * 5;
    ctx.shadowColor = colors[i % colors.length];
    ctx.shadowBlur = 20 * config.glowIntensity;
    ctx.stroke();
  }
  ctx.globalCompositeOperation = 'source-over';
  ctx.shadowBlur = 0;
}

function drawAudioBlob(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  audioData: AudioData,
  colors: string[],
  config: VisualizerConfig
): void {
  const { width, height } = canvas;
  const { frequencyData, bassLevel, midLevel, trebleLevel } = audioData;
  const centerX = width / 2;
  const centerY = height / 2;
  const time = Date.now() * 0.002;
  
  const baseRadius = Math.min(width, height) * 0.25;
  const bassNorm = bassLevel / 255;
  const midNorm = midLevel / 255;
  const trebleNorm = trebleLevel / 255;
  
  for (let layer = 2; layer >= 0; layer--) {
    const points = 128;
    const layerRadius = baseRadius * (0.6 + layer * 0.25);
    const layerAmplitude = 30 + layer * 20;
    
    ctx.beginPath();
    
    for (let i = 0; i <= points; i++) {
      const angle = (i / points) * Math.PI * 2;
      const freqIndex = Math.floor((i / points) * (frequencyData.length / 4));
      const freqValue = frequencyData[freqIndex] / 255;
      
      const noise1 = Math.sin(angle * 3 + time + layer) * 0.3;
      const noise2 = Math.sin(angle * 5 - time * 0.7) * 0.2;
      const noise3 = Math.cos(angle * 7 + time * 1.3) * 0.15;
      
      const displacement = (
        freqValue * config.sensitivity +
        bassNorm * 0.5 * Math.sin(angle * 2 + time) +
        midNorm * 0.3 * Math.sin(angle * 4 - time) +
        trebleNorm * 0.2 * Math.sin(angle * 8 + time * 2) +
        noise1 + noise2 + noise3
      ) * layerAmplitude;
      
      const r = layerRadius + displacement;
      const x = centerX + Math.cos(angle + rotation * (layer + 1) * 0.5) * r;
      const y = centerY + Math.sin(angle + rotation * (layer + 1) * 0.5) * r;
      
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    
    ctx.closePath();
    
    const gradient = ctx.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, layerRadius + layerAmplitude
    );
    const colorIndex = layer % colors.length;
    gradient.addColorStop(0, colors[colorIndex] + '40');
    gradient.addColorStop(0.5, colors[(colorIndex + 1) % colors.length] + '60');
    gradient.addColorStop(1, colors[(colorIndex + 2) % colors.length] + '20');
    
    ctx.fillStyle = gradient;
    ctx.shadowColor = colors[colorIndex];
    ctx.shadowBlur = 30 * config.glowIntensity * (1 + bassNorm);
    ctx.fill();
    
    ctx.strokeStyle = colors[colorIndex] + '80';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  
  const coreGradient = ctx.createRadialGradient(
    centerX, centerY, 0,
    centerX, centerY, baseRadius * 0.4
  );
  coreGradient.addColorStop(0, colors[0] + 'ff');
  coreGradient.addColorStop(0.5, colors[1 % colors.length] + '80');
  coreGradient.addColorStop(1, colors[2 % colors.length] + '00');
  
  ctx.beginPath();
  ctx.arc(centerX, centerY, baseRadius * 0.4 * (1 + bassNorm * 0.3), 0, Math.PI * 2);
  ctx.fillStyle = coreGradient;
  ctx.shadowColor = colors[0];
  ctx.shadowBlur = 40 * config.glowIntensity;
  ctx.fill();
  
  ctx.shadowBlur = 0;
}

function drawKaleidoscope(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  audioData: AudioData,
  colors: string[],
  config: VisualizerConfig
): void {
  const { width, height } = canvas;
  const { frequencyData, bassLevel, midLevel, trebleLevel, timeDomainData } = audioData;
  const centerX = width / 2;
  const centerY = height / 2;
  const time = Date.now() * 0.001;
  
  const segments = 8;
  const angleStep = (Math.PI * 2) / segments;
  
  const bassNorm = bassLevel / 255;
  const midNorm = midLevel / 255;
  const trebleNorm = trebleLevel / 255;
  
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(rotation);
  
  for (let seg = 0; seg < segments; seg++) {
    ctx.save();
    ctx.rotate(seg * angleStep);
    
    if (seg % 2 === 1) {
      ctx.scale(-1, 1);
    }
    
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, Math.min(width, height) * 0.5, 0, angleStep);
    ctx.closePath();
    ctx.clip();
    
    const numShapes = 12;
    for (let i = 0; i < numShapes; i++) {
      const freqIndex = Math.floor((i / numShapes) * (frequencyData.length / 4));
      const freqValue = frequencyData[freqIndex] / 255 * config.sensitivity;
      
      const angle = (i / numShapes) * angleStep * 0.8;
      const baseDistance = 30 + i * 25;
      const distance = baseDistance + freqValue * 80;
      
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;
      
      const size = 10 + freqValue * 40 + bassNorm * 20;
      const colorIndex = (i + seg) % colors.length;
      
      const shapeType = i % 3;
      
      ctx.beginPath();
      if (shapeType === 0) {
        ctx.arc(x, y, size, 0, Math.PI * 2);
      } else if (shapeType === 1) {
        const points = 6;
        for (let p = 0; p <= points; p++) {
          const pAngle = (p / points) * Math.PI * 2 + time;
          const pRadius = size * (0.8 + Math.sin(pAngle * 3 + time) * 0.2);
          const px = x + Math.cos(pAngle) * pRadius;
          const py = y + Math.sin(pAngle) * pRadius;
          if (p === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
      } else {
        const sides = 4;
        for (let s = 0; s <= sides; s++) {
          const sAngle = (s / sides) * Math.PI * 2 + time * 0.5 + rotation;
          const px = x + Math.cos(sAngle) * size;
          const py = y + Math.sin(sAngle) * size;
          if (s === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
      }
      ctx.closePath();
      
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
      gradient.addColorStop(0, colors[colorIndex] + 'cc');
      gradient.addColorStop(0.6, colors[(colorIndex + 1) % colors.length] + '80');
      gradient.addColorStop(1, colors[(colorIndex + 2) % colors.length] + '00');
      
      ctx.fillStyle = gradient;
      ctx.shadowColor = colors[colorIndex];
      ctx.shadowBlur = 15 * config.glowIntensity;
      ctx.fill();
    }
    
    const wavePoints = 32;
    ctx.beginPath();
    for (let i = 0; i <= wavePoints; i++) {
      const wAngle = (i / wavePoints) * angleStep;
      const waveIndex = Math.floor((i / wavePoints) * timeDomainData.length);
      const waveValue = (timeDomainData[waveIndex] - 128) / 128;
      const waveRadius = 100 + waveValue * 50 * config.sensitivity + midNorm * 30;
      
      const wx = Math.cos(wAngle) * waveRadius;
      const wy = Math.sin(wAngle) * waveRadius;
      
      if (i === 0) ctx.moveTo(wx, wy);
      else ctx.lineTo(wx, wy);
    }
    
    ctx.strokeStyle = colors[seg % colors.length] + '60';
    ctx.lineWidth = 2 + bassNorm * 3;
    ctx.shadowColor = colors[seg % colors.length];
    ctx.shadowBlur = 10 * config.glowIntensity;
    ctx.stroke();
    
    ctx.restore();
  }
  
  ctx.restore();
  ctx.shadowBlur = 0;
}

// Hexagonal grid state for flowing energy network
interface HexNode {
  x: number;
  y: number;
  energy: number;
  targetEnergy: number;
  phase: number;
  connections: number[];
}

let hexNodes: HexNode[] = [];
let energyPulses: { from: number; to: number; progress: number; color: number }[] = [];
let lastHexInit = 0;

function initHexGrid(width: number, height: number, spacing: number): void {
  hexNodes = [];
  const hexWidth = spacing * 1.5;
  const hexHeight = spacing * Math.sqrt(3);
  
  const cols = Math.ceil(width / hexWidth) + 2;
  const rows = Math.ceil(height / (hexHeight * 0.75)) + 2;
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * hexWidth + (row % 2) * (hexWidth / 2);
      const y = row * hexHeight * 0.75;
      
      const nodeIndex = hexNodes.length;
      const connections: number[] = [];
      
      if (col > 0) connections.push(nodeIndex - 1);
      if (row > 0) {
        const prevRowStart = (row - 1) * cols;
        if (row % 2 === 0) {
          if (col > 0) connections.push(prevRowStart + col - 1);
          connections.push(prevRowStart + col);
        } else {
          connections.push(prevRowStart + col);
          if (col < cols - 1) connections.push(prevRowStart + col + 1);
        }
      }
      
      hexNodes.push({
        x,
        y,
        energy: Math.random() * 0.3,
        targetEnergy: 0,
        phase: Math.random() * Math.PI * 2,
        connections
      });
    }
  }
}

function drawEndlessMaze(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  audioData: AudioData,
  colors: string[],
  config: VisualizerConfig
): void {
  const { width, height } = canvas;
  const { frequencyData, bassLevel, midLevel, trebleLevel } = audioData;
  const time = Date.now() * 0.001;
  
  const spacing = 50;
  const bassNorm = bassLevel / 255;
  const midNorm = midLevel / 255;
  const trebleNorm = trebleLevel / 255;
  
  if (hexNodes.length === 0 || Date.now() - lastHexInit > 10000) {
    initHexGrid(width + spacing * 2, height + spacing * 2, spacing);
    lastHexInit = Date.now();
  }
  
  hexNodes.forEach((node, i) => {
    const freqIndex = Math.floor((i / hexNodes.length) * (frequencyData.length / 2));
    node.targetEnergy = (frequencyData[freqIndex] / 255) * config.sensitivity;
    node.energy += (node.targetEnergy - node.energy) * 0.15;
    node.phase += 0.02 + node.energy * 0.05;
  });
  
  if (bassNorm > 0.5 && Math.random() < bassNorm * 0.3) {
    const startNode = Math.floor(Math.random() * hexNodes.length);
    const node = hexNodes[startNode];
    if (node.connections.length > 0) {
      const endNode = node.connections[Math.floor(Math.random() * node.connections.length)];
      energyPulses.push({
        from: startNode,
        to: endNode,
        progress: 0,
        color: Math.floor(Math.random() * colors.length)
      });
    }
  }
  
  energyPulses = energyPulses.filter(pulse => {
    pulse.progress += 0.03 + bassNorm * 0.04;
    if (pulse.progress >= 1) {
      const node = hexNodes[pulse.to];
      if (node && node.connections.length > 0 && Math.random() < 0.7) {
        const nextNode = node.connections[Math.floor(Math.random() * node.connections.length)];
        if (nextNode !== pulse.from) {
          energyPulses.push({
            from: pulse.to,
            to: nextNode,
            progress: 0,
            color: pulse.color
          });
        }
      }
      return false;
    }
    return true;
  });
  
  if (energyPulses.length > 100) {
    energyPulses = energyPulses.slice(-80);
  }
  
  ctx.lineCap = 'round';
  hexNodes.forEach((node, i) => {
    node.connections.forEach(connIndex => {
      if (connIndex < i) return;
      const connNode = hexNodes[connIndex];
      if (!connNode) return;
      
      const avgEnergy = (node.energy + connNode.energy) / 2;
      const alpha = Math.min(255, Math.floor(40 + avgEnergy * 150));
      
      const colorIndex = Math.floor((i + time) % colors.length);
      
      ctx.beginPath();
      ctx.moveTo(node.x, node.y);
      ctx.lineTo(connNode.x, connNode.y);
      ctx.strokeStyle = colors[colorIndex] + alpha.toString(16).padStart(2, '0');
      ctx.lineWidth = 1 + avgEnergy * 3;
      ctx.shadowColor = colors[colorIndex];
      ctx.shadowBlur = avgEnergy * 10 * config.glowIntensity;
      ctx.stroke();
    });
  });
  
  energyPulses.forEach(pulse => {
    const fromNode = hexNodes[pulse.from];
    const toNode = hexNodes[pulse.to];
    if (!fromNode || !toNode) return;
    
    const x = fromNode.x + (toNode.x - fromNode.x) * pulse.progress;
    const y = fromNode.y + (toNode.y - fromNode.y) * pulse.progress;
    
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, 15 + bassNorm * 10);
    gradient.addColorStop(0, colors[pulse.color] + 'ff');
    gradient.addColorStop(0.5, colors[pulse.color] + '80');
    gradient.addColorStop(1, colors[pulse.color] + '00');
    
    ctx.beginPath();
    ctx.arc(x, y, 8 + bassNorm * 6, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.shadowColor = colors[pulse.color];
    ctx.shadowBlur = 20 * config.glowIntensity;
    ctx.fill();
  });
  
  hexNodes.forEach((node, i) => {
    const pulse = Math.sin(node.phase) * 0.3 + 0.7;
    const size = (4 + node.energy * 12) * pulse;
    
    const colorIndex = Math.floor((i * 0.1 + time * 0.5) % colors.length);
    const nextColorIndex = (colorIndex + 1) % colors.length;
    
    const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, size * 2);
    gradient.addColorStop(0, colors[colorIndex]);
    gradient.addColorStop(0.6, colors[nextColorIndex] + 'aa');
    gradient.addColorStop(1, colors[colorIndex] + '00');
    
    ctx.beginPath();
    ctx.arc(node.x, node.y, size, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.shadowColor = colors[colorIndex];
    ctx.shadowBlur = (5 + node.energy * 15) * config.glowIntensity;
    ctx.fill();
    
    if (node.energy > 0.6) {
      ctx.beginPath();
      for (let j = 0; j < 6; j++) {
        const angle = (j / 6) * Math.PI * 2 + node.phase;
        const ringSize = size * 2 + node.energy * 10;
        const px = node.x + Math.cos(angle) * ringSize;
        const py = node.y + Math.sin(angle) * ringSize;
        if (j === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.strokeStyle = colors[colorIndex] + '40';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  });
  
  ctx.shadowBlur = 0;
}

export interface ImageEffectSettings {
  enabled: boolean;
  hideVisualization: boolean;
  pulse: boolean;
  pulseIntensity: number;
  wave: boolean;
  waveIntensity: number;
  colorShift: boolean;
  colorShiftIntensity: number;
  glitch: boolean;
  glitchIntensity: number;
  zoom: boolean;
  zoomIntensity: number;
  blur: boolean;
  blurIntensity: number;
  chromatic: boolean;
  chromaticIntensity: number;
  rotation: boolean;
  rotationIntensity: number;
  mirror: boolean;
  mirrorMode: 'horizontal' | 'vertical' | 'quad';
  scanlines: boolean;
  scanlinesIntensity: number;
  vignette: boolean;
  vignetteIntensity: number;
  // Creative effects
  circleRotation: boolean;
  circleRotationIntensity: number;
  circleRotationCount: number;
  rainMask: boolean;
  rainMaskIntensity: number;
  rainMaskSpeed: number;
  sliceShift: boolean;
  sliceShiftIntensity: number;
  sliceShiftDirection: 'horizontal' | 'vertical' | 'both';
  ripple: boolean;
  rippleIntensity: number;
  rippleSpeed: number;
  pixelSort: boolean;
  pixelSortIntensity: number;
  tunnelZoom: boolean;
  tunnelZoomIntensity: number;
  shatter: boolean;
  shatterIntensity: number;
  shatterPieces: number;
  liquidMorph: boolean;
  liquidMorphIntensity: number;
}

let imageRotation = 0;

export function resetImageRotation(): void {
  imageRotation = 0;
}

export function applyImageEffects(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  audioData: AudioData,
  image: HTMLImageElement,
  effects: ImageEffectSettings
): void {
  const { width, height } = canvas;
  const { bassLevel, midLevel, trebleLevel } = audioData;
  const time = Date.now() * 0.001;
  
  const bassNorm = bassLevel / 255;
  const midNorm = midLevel / 255;
  const trebleNorm = trebleLevel / 255;
  const avgNorm = (bassNorm + midNorm + trebleNorm) / 3;
  
  ctx.save();
  
  // Calculate scale from pulse and zoom effects
  let scale = 1;
  if (effects.pulse) {
    scale += bassNorm * effects.pulseIntensity * 0.15;
  }
  if (effects.zoom) {
    scale += midNorm * effects.zoomIntensity * 0.1;
  }
  
  // Calculate rotation
  if (effects.rotation) {
    imageRotation += (0.005 + midNorm * 0.02) * effects.rotationIntensity;
  }
  
  const imgAspect = image.width / image.height;
  const canvasAspect = width / height;
  
  let drawWidth: number, drawHeight: number;
  if (imgAspect > canvasAspect) {
    drawHeight = height * scale * 1.2; // Extra for rotation
    drawWidth = drawHeight * imgAspect;
  } else {
    drawWidth = width * scale * 1.2;
    drawHeight = drawWidth / imgAspect;
  }
  
  // Apply blur effect using filter
  if (effects.blur) {
    const blurAmount = (1 - bassNorm) * effects.blurIntensity * 8;
    ctx.filter = `blur(${blurAmount}px)`;
  }
  
  ctx.translate(width / 2, height / 2);
  
  if (effects.rotation) {
    ctx.rotate(imageRotation);
  }
  
  // Draw based on mirror mode
  if (effects.mirror) {
    const halfW = drawWidth / 2;
    const halfH = drawHeight / 2;
    
    if (effects.mirrorMode === 'horizontal') {
      // Draw left half
      ctx.save();
      ctx.beginPath();
      ctx.rect(-halfW, -halfH, halfW, drawHeight);
      ctx.clip();
      ctx.drawImage(image, -halfW, -halfH, drawWidth, drawHeight);
      ctx.restore();
      // Draw mirrored right half
      ctx.save();
      ctx.translate(0, 0);
      ctx.scale(-1, 1);
      ctx.beginPath();
      ctx.rect(-halfW, -halfH, halfW, drawHeight);
      ctx.clip();
      ctx.drawImage(image, -halfW, -halfH, drawWidth, drawHeight);
      ctx.restore();
    } else if (effects.mirrorMode === 'vertical') {
      // Draw top half
      ctx.save();
      ctx.beginPath();
      ctx.rect(-halfW, -halfH, drawWidth, halfH);
      ctx.clip();
      ctx.drawImage(image, -halfW, -halfH, drawWidth, drawHeight);
      ctx.restore();
      // Draw mirrored bottom half
      ctx.save();
      ctx.scale(1, -1);
      ctx.beginPath();
      ctx.rect(-halfW, -halfH, drawWidth, halfH);
      ctx.clip();
      ctx.drawImage(image, -halfW, -halfH, drawWidth, drawHeight);
      ctx.restore();
    } else if (effects.mirrorMode === 'quad') {
      // Four-way mirror
      const qw = halfW / 2;
      const qh = halfH / 2;
      for (let mx = -1; mx <= 1; mx += 2) {
        for (let my = -1; my <= 1; my += 2) {
          ctx.save();
          ctx.scale(mx, my);
          ctx.beginPath();
          ctx.rect(0, 0, halfW, halfH);
          ctx.clip();
          ctx.drawImage(image, -halfW, -halfH, drawWidth, drawHeight);
          ctx.restore();
        }
      }
    }
  } else if (effects.wave) {
    // Wave distortion effect
    const segments = 20;
    const segHeight = drawHeight / segments;
    
    for (let i = 0; i < segments; i++) {
      const waveOffset = Math.sin(time * 2 + i * 0.3) * midNorm * effects.waveIntensity * 30;
      
      ctx.save();
      ctx.beginPath();
      ctx.rect(-drawWidth / 2 + waveOffset, -drawHeight / 2 + i * segHeight, drawWidth, segHeight + 1);
      ctx.clip();
      ctx.drawImage(image, -drawWidth / 2 + waveOffset, -drawHeight / 2, drawWidth, drawHeight);
      ctx.restore();
    }
  } else {
    ctx.drawImage(image, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
  }
  
  ctx.filter = 'none';
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  
  // Color shift overlay
  if (effects.colorShift && trebleNorm > 0.2) {
    ctx.globalCompositeOperation = 'overlay';
    const hue = (time * 50 + trebleNorm * 100) % 360;
    ctx.fillStyle = `hsla(${hue}, 70%, 50%, ${trebleNorm * effects.colorShiftIntensity * 0.3})`;
    ctx.fillRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'source-over';
  }
  
  // Chromatic aberration (RGB split)
  if (effects.chromatic && avgNorm > 0.2) {
    const offset = avgNorm * effects.chromaticIntensity * 10;
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.3 * effects.chromaticIntensity;
    
    // Red channel offset
    ctx.drawImage(canvas, offset, 0);
    // Cyan channel offset  
    ctx.drawImage(canvas, -offset, 0);
    
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }
  
  // Glitch effect
  if (effects.glitch && bassNorm > 0.4) {
    const glitchChance = bassNorm * effects.glitchIntensity;
    
    if (Math.random() < glitchChance * 0.3) {
      const numSlices = Math.floor(3 + Math.random() * 5);
      
      for (let i = 0; i < numSlices; i++) {
        const sliceY = Math.random() * height;
        const sliceHeight = 5 + Math.random() * 30;
        const sliceOffset = (Math.random() - 0.5) * 50 * effects.glitchIntensity;
        
        try {
          const imageData = ctx.getImageData(0, sliceY, width, sliceHeight);
          ctx.putImageData(imageData, sliceOffset, sliceY);
        } catch (e) {
          // Ignore cross-origin errors
        }
      }
    }
    
    if (Math.random() < glitchChance * 0.2) {
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = `rgba(255, 0, 0, ${effects.glitchIntensity * 0.1})`;
      ctx.fillRect(2, 0, width, height);
      ctx.fillStyle = `rgba(0, 255, 255, ${effects.glitchIntensity * 0.1})`;
      ctx.fillRect(-2, 0, width, height);
      ctx.globalCompositeOperation = 'source-over';
    }
  }
  
  // Scanlines overlay
  if (effects.scanlines) {
    ctx.globalAlpha = effects.scanlinesIntensity * 0.4;
    const lineSpacing = 3;
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.lineWidth = 1;
    for (let y = 0; y < height; y += lineSpacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
  
  // Vignette effect
  if (effects.vignette) {
    const gradient = ctx.createRadialGradient(
      width / 2, height / 2, height * 0.2,
      width / 2, height / 2, height * (0.8 + (1 - effects.vignetteIntensity) * 0.4)
    );
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(1, `rgba(0, 0, 0, ${0.4 + effects.vignetteIntensity * 0.5 + bassNorm * 0.1})`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }
  
  // Circle Rotation Effect - concentric circles rotating independently
  if (effects.circleRotation) {
    const circleCount = effects.circleRotationCount || 5;
    const maxRadius = Math.max(width, height) * 0.8;
    
    // Create a temporary canvas for the original image
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext('2d')!;
    tempCtx.drawImage(image, 0, 0, width, height);
    
    // Clear the main canvas area where we'll draw
    ctx.save();
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);
    
    // Draw each ring from outer to inner
    for (let i = circleCount - 1; i >= 0; i--) {
      const outerRadius = maxRadius * ((i + 1) / circleCount);
      const innerRadius = i === 0 ? 0 : maxRadius * (i / circleCount);
      
      // Alternate rotation direction and vary speed per ring
      const direction = i % 2 === 0 ? 1 : -1;
      const speedMultiplier = 0.3 + (i * 0.15);
      const audioReactive = bassNorm * effects.circleRotationIntensity * 0.5;
      const angle = (time * speedMultiplier * direction * effects.circleRotationIntensity) + (audioReactive * direction);
      
      ctx.save();
      ctx.translate(width / 2, height / 2);
      
      // Create ring-shaped clipping path
      ctx.beginPath();
      ctx.arc(0, 0, outerRadius, 0, Math.PI * 2);
      if (innerRadius > 0) {
        ctx.arc(0, 0, innerRadius, 0, Math.PI * 2, true);
      }
      ctx.clip();
      
      // Rotate and draw the image for this ring
      ctx.rotate(angle);
      ctx.drawImage(tempCanvas, -width / 2, -height / 2, width, height);
      
      ctx.restore();
    }
    ctx.restore();
  }
  
  // Rain Mask Effect - realistic animated rain drops
  if (effects.rainMask) {
    ctx.save();
    const baseDropCount = 150;
    const dropCount = Math.floor(baseDropCount * effects.rainMaskIntensity);
    const rainSpeed = (effects.rainMaskSpeed || 0.5) * 400;
    
    // Layer 1: Background rain (smaller, faster, more transparent)
    ctx.globalAlpha = 0.3 * effects.rainMaskIntensity;
    for (let i = 0; i < dropCount; i++) {
      // Use pseudo-random positioning based on index
      const seed1 = Math.sin(i * 127.1) * 43758.5453;
      const seed2 = Math.cos(i * 269.5) * 7919.0;
      const x = (((seed1 % 1) + 1) % 1) * width;
      const speedVariation = 0.8 + (((seed2 % 1) + 1) % 1) * 0.4;
      const startOffset = (((Math.sin(i * 43.7) * 12345.6) % 1) + 1) % 1;
      
      // Calculate Y position with looping
      const totalDistance = height + 100;
      const baseY = ((time * rainSpeed * speedVariation + startOffset * totalDistance) % totalDistance) - 50;
      
      // Rain drop properties
      const dropLength = 15 + avgNorm * 25;
      const dropWidth = 1;
      
      // Draw rain drop as a gradient line
      const gradient = ctx.createLinearGradient(x, baseY, x, baseY + dropLength);
      gradient.addColorStop(0, 'rgba(200, 220, 255, 0)');
      gradient.addColorStop(0.3, 'rgba(200, 220, 255, 0.6)');
      gradient.addColorStop(1, 'rgba(200, 220, 255, 0.9)');
      
      ctx.strokeStyle = gradient;
      ctx.lineWidth = dropWidth;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x, baseY);
      ctx.lineTo(x - 1, baseY + dropLength);
      ctx.stroke();
    }
    
    // Layer 2: Foreground rain (larger, slower, more visible)
    ctx.globalAlpha = 0.5 * effects.rainMaskIntensity;
    const foregroundDrops = Math.floor(dropCount * 0.3);
    for (let i = 0; i < foregroundDrops; i++) {
      const seed1 = Math.sin(i * 317.9) * 23456.7;
      const seed2 = Math.cos(i * 419.3) * 8761.2;
      const x = (((seed1 % 1) + 1) % 1) * width;
      const speedVariation = 0.6 + (((seed2 % 1) + 1) % 1) * 0.3;
      const startOffset = (((Math.sin(i * 73.1) * 54321.0) % 1) + 1) % 1;
      
      const totalDistance = height + 150;
      const baseY = ((time * rainSpeed * 0.7 * speedVariation + startOffset * totalDistance) % totalDistance) - 75;
      
      const dropLength = 30 + avgNorm * 40 + bassNorm * 20;
      const dropWidth = 2;
      
      const gradient = ctx.createLinearGradient(x, baseY, x, baseY + dropLength);
      gradient.addColorStop(0, 'rgba(180, 200, 255, 0)');
      gradient.addColorStop(0.2, 'rgba(180, 200, 255, 0.4)');
      gradient.addColorStop(1, 'rgba(220, 235, 255, 0.8)');
      
      ctx.strokeStyle = gradient;
      ctx.lineWidth = dropWidth;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x, baseY);
      ctx.lineTo(x - 2, baseY + dropLength);
      ctx.stroke();
    }
    
    // Layer 3: Splash effects at bottom
    ctx.globalAlpha = 0.4 * effects.rainMaskIntensity;
    const splashCount = Math.floor(dropCount * 0.15);
    for (let i = 0; i < splashCount; i++) {
      const seed = Math.sin(i * 547.3 + time * 2) * 98765.4;
      const x = (((seed % 1) + 1) % 1) * width;
      const splashPhase = ((time * 3 + i * 0.7) % 1);
      
      if (splashPhase < 0.3) {
        const splashSize = splashPhase * 15 * effects.rainMaskIntensity;
        const splashY = height - 10 - Math.random() * 20;
        const opacity = (0.3 - splashPhase) / 0.3;
        
        ctx.strokeStyle = `rgba(200, 220, 255, ${opacity * 0.5})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x, splashY, splashSize, Math.PI, 2 * Math.PI);
        ctx.stroke();
      }
    }
    
    ctx.globalAlpha = 1;
    ctx.restore();
  }
  
  // Slice Shift Effect - horizontal/vertical slices that shift with audio
  if (effects.sliceShift) {
    const sliceCount = 12;
    const direction = effects.sliceShiftDirection || 'horizontal';
    
    try {
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = new Uint32Array(imageData.data.buffer);
      
      if (direction === 'horizontal' || direction === 'both') {
        const sliceHeight = Math.floor(height / sliceCount);
        for (let i = 0; i < sliceCount; i++) {
          const offset = Math.sin(time * 2 + i * 0.5) * midNorm * effects.sliceShiftIntensity * 30;
          const intOffset = Math.floor(offset);
          
          for (let y = i * sliceHeight; y < (i + 1) * sliceHeight && y < height; y++) {
            const rowStart = y * width;
            const row = new Uint32Array(width);
            for (let x = 0; x < width; x++) {
              const srcX = (x - intOffset + width) % width;
              row[x] = data[rowStart + srcX];
            }
            for (let x = 0; x < width; x++) {
              data[rowStart + x] = row[x];
            }
          }
        }
      }
      
      if (direction === 'vertical' || direction === 'both') {
        const sliceWidth = Math.floor(width / sliceCount);
        for (let i = 0; i < sliceCount; i++) {
          const offset = Math.cos(time * 2 + i * 0.5) * bassNorm * effects.sliceShiftIntensity * 30;
          const intOffset = Math.floor(offset);
          
          for (let x = i * sliceWidth; x < (i + 1) * sliceWidth && x < width; x++) {
            const col: number[] = [];
            for (let y = 0; y < height; y++) {
              col.push(data[y * width + x]);
            }
            for (let y = 0; y < height; y++) {
              const srcY = (y - intOffset + height) % height;
              data[y * width + x] = col[srcY];
            }
          }
        }
      }
      
      ctx.putImageData(imageData, 0, 0);
    } catch (e) {
      // Ignore cross-origin errors
    }
  }
  
  // Water Ripple Effect - circular ripples emanating from center
  if (effects.ripple) {
    ctx.save();
    const rippleCount = 5;
    const speed = effects.rippleSpeed || 0.5;
    
    ctx.globalCompositeOperation = 'overlay';
    
    for (let i = 0; i < rippleCount; i++) {
      const phase = (time * speed + i / rippleCount) % 1;
      const radius = phase * Math.max(width, height) * 0.8;
      const opacity = (1 - phase) * effects.rippleIntensity * 0.3 * (1 + bassNorm);
      
      ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
      ctx.lineWidth = 3 + bassNorm * 5;
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, radius, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    ctx.globalCompositeOperation = 'source-over';
    ctx.restore();
  }
  
  // Pixel Sort Effect - audio-reactive pixel sorting glitch with threshold-based segments
  if (effects.pixelSort) {
    try {
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;
      
      // Brightness threshold for sorting - pixels above this get sorted
      const threshold = 80 + (1 - effects.pixelSortIntensity) * 120;
      // How many rows to affect
      const affectedRows = Math.floor(height * 0.4 * effects.pixelSortIntensity * (0.5 + bassNorm * 0.5));
      // Starting position oscillates with audio
      const startY = Math.floor(height * 0.3 + Math.sin(time * 0.5) * height * 0.15);
      
      for (let y = startY; y < Math.min(startY + affectedRows, height); y++) {
        // Find segments of bright pixels to sort
        let segmentStart = -1;
        
        for (let x = 0; x <= width; x++) {
          const idx = (y * width + x) * 4;
          const brightness = x < width ? (data[idx] + data[idx + 1] + data[idx + 2]) / 3 : 0;
          
          if (brightness > threshold && segmentStart === -1) {
            // Start new segment
            segmentStart = x;
          } else if ((brightness <= threshold || x === width) && segmentStart !== -1) {
            // End segment and sort it
            const segmentLength = x - segmentStart;
            
            if (segmentLength > 3) { // Only sort segments with enough pixels
              const pixels: { brightness: number; r: number; g: number; b: number; a: number }[] = [];
              
              for (let sx = segmentStart; sx < x; sx++) {
                const sIdx = (y * width + sx) * 4;
                pixels.push({
                  brightness: (data[sIdx] + data[sIdx + 1] + data[sIdx + 2]) / 3,
                  r: data[sIdx],
                  g: data[sIdx + 1],
                  b: data[sIdx + 2],
                  a: data[sIdx + 3]
                });
              }
              
              // Sort by brightness (creates the pixel sort glitch effect)
              pixels.sort((a, b) => a.brightness - b.brightness);
              
              // Write sorted pixels back
              for (let sx = 0; sx < pixels.length; sx++) {
                const sIdx = (y * width + (segmentStart + sx)) * 4;
                data[sIdx] = pixels[sx].r;
                data[sIdx + 1] = pixels[sx].g;
                data[sIdx + 2] = pixels[sx].b;
                data[sIdx + 3] = pixels[sx].a;
              }
            }
            
            segmentStart = -1;
          }
        }
      }
      
      ctx.putImageData(imageData, 0, 0);
    } catch (e) {
      // Ignore cross-origin errors
    }
  }
  
  // Tunnel Zoom Effect - zooming tunnel through the image
  if (effects.tunnelZoom) {
    ctx.save();
    ctx.translate(width / 2, height / 2);
    
    const layers = 8;
    for (let i = layers - 1; i >= 0; i--) {
      const phase = ((time * effects.tunnelZoomIntensity * 0.5 + i / layers) % 1);
      const scale = 0.3 + phase * 1.5;
      const opacity = (1 - phase * 0.7) * (1 + bassNorm * 0.5);
      
      ctx.save();
      ctx.globalAlpha = opacity * 0.3;
      ctx.scale(scale, scale);
      ctx.drawImage(image, -width / 2, -height / 2, width, height);
      ctx.restore();
    }
    
    ctx.restore();
  }
  
  // Shatter Effect - image broken into pieces that react to audio
  if (effects.shatter) {
    // Create a temporary canvas with the original image
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext('2d')!;
    tempCtx.drawImage(image, 0, 0, width, height);
    
    // Clear the canvas with black background for visible gaps
    ctx.save();
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);
    
    const pieces = effects.shatterPieces || 12;
    const angleStep = (Math.PI * 2) / pieces;
    
    // Base displacement that's always visible, plus audio-reactive component
    const baseDisplacement = 15 * effects.shatterIntensity;
    const audioDisplacement = bassNorm * effects.shatterIntensity * 50;
    const totalDisplacement = baseDisplacement + audioDisplacement;
    
    for (let i = 0; i < pieces; i++) {
      const angle = i * angleStep;
      const nextAngle = (i + 1) * angleStep;
      
      // Each piece has its own slight rotation
      const pieceRotation = Math.sin(time * 0.5 + i * 0.7) * effects.shatterIntensity * 0.15 * (0.5 + avgNorm);
      
      // Displacement direction from center
      const midAngle = angle + angleStep / 2;
      const dx = Math.cos(midAngle) * totalDisplacement;
      const dy = Math.sin(midAngle) * totalDisplacement;
      
      ctx.save();
      ctx.translate(width / 2, height / 2);
      
      // Create pie slice clip path
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, Math.max(width, height), angle, nextAngle);
      ctx.closePath();
      ctx.clip();
      
      // Apply displacement and rotation for this piece
      ctx.translate(dx, dy);
      ctx.rotate(pieceRotation);
      
      // Draw the image piece
      ctx.drawImage(tempCanvas, -width / 2, -height / 2, width, height);
      
      // Add a subtle edge highlight to make pieces more visible
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 * effects.shatterIntensity})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(angle - pieceRotation) * Math.max(width, height), Math.sin(angle - pieceRotation) * Math.max(width, height));
      ctx.stroke();
      
      ctx.restore();
    }
    ctx.restore();
  }
  
  // Liquid Morph Effect - fluid-like distortion
  if (effects.liquidMorph) {
    try {
      const imageData = ctx.getImageData(0, 0, width, height);
      const srcData = new Uint8ClampedArray(imageData.data);
      const data = imageData.data;
      const intensity = effects.liquidMorphIntensity;
      
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const offsetX = Math.sin(y * 0.02 + time * 2) * intensity * 15 * (1 + midNorm);
          const offsetY = Math.cos(x * 0.02 + time * 1.5) * intensity * 15 * (1 + bassNorm);
          
          let srcX = Math.floor(x + offsetX);
          let srcY = Math.floor(y + offsetY);
          
          srcX = Math.max(0, Math.min(width - 1, srcX));
          srcY = Math.max(0, Math.min(height - 1, srcY));
          
          const dstIdx = (y * width + x) * 4;
          const srcIdx = (srcY * width + srcX) * 4;
          
          data[dstIdx] = srcData[srcIdx];
          data[dstIdx + 1] = srcData[srcIdx + 1];
          data[dstIdx + 2] = srcData[srcIdx + 2];
          data[dstIdx + 3] = srcData[srcIdx + 3];
        }
      }
      
      ctx.putImageData(imageData, 0, 0);
    } catch (e) {
      // Ignore cross-origin errors
    }
  }
  
  ctx.restore();
}

export function clearParticles(): void {
  particles = [];
}

export function resetRotation(): void {
  rotation = 0;
}

// Overlay particle system
interface OverlayParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  hue: number;
  life: number;
}

let overlayParticles: OverlayParticle[] = [];

export interface ParticleOverlayConfig {
  enabled: boolean;
  type: 'sparkles' | 'bokeh' | 'confetti' | 'snow' | 'fireflies' | 'bubbles' | 'stars';
  count: number;
  size: number;
  speed: number;
  audioReactive: boolean;
  color: string;
}

export function drawParticleOverlay(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  audioData: AudioData,
  config: ParticleOverlayConfig
): void {
  if (!config.enabled) return;
  
  const { width, height } = canvas;
  const { bassLevel, midLevel, trebleLevel } = audioData;
  const audioIntensity = config.audioReactive ? (bassLevel + midLevel + trebleLevel) / (255 * 3) : 0.5;
  
  // Initialize particles if needed
  while (overlayParticles.length < config.count) {
    overlayParticles.push(createOverlayParticle(width, height, config));
  }
  while (overlayParticles.length > config.count) {
    overlayParticles.pop();
  }
  
  ctx.save();
  
  overlayParticles.forEach((p, i) => {
    // Update particle
    p.x += p.vx * config.speed * (1 + audioIntensity * 0.5);
    p.y += p.vy * config.speed * (1 + audioIntensity * 0.5);
    p.life -= 0.002;
    
    // Reset if out of bounds or dead
    if (p.x < -50 || p.x > width + 50 || p.y < -50 || p.y > height + 50 || p.life <= 0) {
      overlayParticles[i] = createOverlayParticle(width, height, config);
      return;
    }
    
    const size = p.size * config.size * 20 * (1 + audioIntensity * 0.3);
    const opacity = p.opacity * p.life * (config.audioReactive ? (0.5 + audioIntensity * 0.5) : 1);
    
    ctx.globalAlpha = opacity;
    
    switch (config.type) {
      case 'sparkles':
        drawSparkle(ctx, p.x, p.y, size, config.color);
        break;
      case 'bokeh':
        drawBokeh(ctx, p.x, p.y, size * 2, config.color, opacity);
        break;
      case 'confetti':
        drawConfetti(ctx, p.x, p.y, size, p.hue);
        break;
      case 'snow':
        drawSnow(ctx, p.x, p.y, size, config.color);
        break;
      case 'fireflies':
        drawFirefly(ctx, p.x, p.y, size, audioIntensity);
        break;
      case 'bubbles':
        drawBubble(ctx, p.x, p.y, size * 1.5, config.color);
        break;
      case 'stars':
        drawStar(ctx, p.x, p.y, size, config.color);
        break;
    }
  });
  
  ctx.globalAlpha = 1;
  ctx.restore();
}

function createOverlayParticle(width: number, height: number, config: ParticleOverlayConfig): OverlayParticle {
  const type = config.type;
  let vx = 0, vy = 0;
  
  switch (type) {
    case 'snow':
      vx = (Math.random() - 0.5) * 0.5;
      vy = 0.5 + Math.random() * 0.5;
      break;
    case 'bubbles':
      vx = (Math.random() - 0.5) * 0.3;
      vy = -(0.3 + Math.random() * 0.5);
      break;
    case 'confetti':
      vx = (Math.random() - 0.5) * 2;
      vy = 0.5 + Math.random();
      break;
    default:
      vx = (Math.random() - 0.5) * 0.5;
      vy = (Math.random() - 0.5) * 0.5;
  }
  
  return {
    x: Math.random() * width,
    y: type === 'bubbles' ? height + 20 : (type === 'snow' || type === 'confetti') ? -20 : Math.random() * height,
    vx,
    vy,
    size: 0.3 + Math.random() * 0.7,
    opacity: 0.3 + Math.random() * 0.7,
    hue: Math.random() * 360,
    life: 0.5 + Math.random() * 0.5,
  };
}

function drawSparkle(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI) / 2;
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(angle) * size, y + Math.sin(angle) * size);
  }
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x, y, size * 0.3, 0, Math.PI * 2);
  ctx.fill();
}

function drawBokeh(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, opacity: number) {
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
  gradient.addColorStop(0, color);
  gradient.addColorStop(0.5, color.replace(')', `, ${opacity * 0.5})`).replace('rgb', 'rgba'));
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, size, 0, Math.PI * 2);
  ctx.fill();
}

function drawConfetti(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, hue: number) {
  ctx.fillStyle = `hsl(${hue}, 80%, 60%)`;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(hue);
  ctx.fillRect(-size / 2, -size / 4, size, size / 2);
  ctx.restore();
}

function drawSnow(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, size, 0, Math.PI * 2);
  ctx.fill();
}

function drawFirefly(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, intensity: number) {
  const glow = size * (1 + intensity * 2);
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, glow);
  gradient.addColorStop(0, `rgba(255, 255, 150, ${0.8 + intensity * 0.2})`);
  gradient.addColorStop(0.3, `rgba(255, 255, 100, ${0.4 + intensity * 0.3})`);
  gradient.addColorStop(1, 'rgba(255, 255, 0, 0)');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, glow, 0, Math.PI * 2);
  ctx.fill();
}

function drawBubble(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(x, y, size, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x - size * 0.3, y - size * 0.3, size * 0.2, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.fill();
}

function drawStar(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
    const innerAngle = angle + Math.PI / 5;
    if (i === 0) {
      ctx.moveTo(x + Math.cos(angle) * size, y + Math.sin(angle) * size);
    } else {
      ctx.lineTo(x + Math.cos(angle) * size, y + Math.sin(angle) * size);
    }
    ctx.lineTo(x + Math.cos(innerAngle) * size * 0.4, y + Math.sin(innerAngle) * size * 0.4);
  }
  ctx.closePath();
  ctx.fill();
}

// Progress bar rendering
export interface ProgressBarConfig {
  enabled: boolean;
  style: 'line' | 'dots' | 'wave' | 'glow' | 'minimal';
  position: 'bottom' | 'top' | 'center';
  height: number;
  color: string;
  backgroundColor: string;
  showTime: boolean;
}

export function drawProgressBar(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  currentTime: number,
  duration: number,
  audioData: AudioData,
  config: ProgressBarConfig
): void {
  if (!config.enabled || duration <= 0) return;
  
  const { width, height } = canvas;
  const progress = currentTime / duration;
  const { bassLevel } = audioData;
  const bassNorm = bassLevel / 255;
  
  let y: number;
  switch (config.position) {
    case 'top':
      y = 20;
      break;
    case 'center':
      y = height / 2;
      break;
    default:
      y = height - 20;
  }
  
  const barWidth = width - 40;
  const barHeight = config.height;
  const startX = 20;
  
  ctx.save();
  
  // Background
  ctx.fillStyle = config.backgroundColor;
  ctx.beginPath();
  ctx.roundRect(startX, y - barHeight / 2, barWidth, barHeight, barHeight / 2);
  ctx.fill();
  
  // Progress
  const progressWidth = barWidth * progress;
  
  switch (config.style) {
    case 'glow':
      ctx.shadowColor = config.color;
      ctx.shadowBlur = 10 + bassNorm * 10;
      ctx.fillStyle = config.color;
      ctx.beginPath();
      ctx.roundRect(startX, y - barHeight / 2, progressWidth, barHeight, barHeight / 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      break;
    case 'wave':
      ctx.fillStyle = config.color;
      ctx.beginPath();
      ctx.moveTo(startX, y + barHeight / 2);
      for (let x = 0; x < progressWidth; x += 2) {
        const wave = Math.sin(x * 0.1 + Date.now() * 0.005) * bassNorm * 5;
        ctx.lineTo(startX + x, y + wave);
      }
      ctx.lineTo(startX + progressWidth, y + barHeight / 2);
      ctx.closePath();
      ctx.fill();
      break;
    case 'dots':
      const dotCount = 30;
      const dotSpacing = barWidth / dotCount;
      for (let i = 0; i < dotCount; i++) {
        const dotX = startX + i * dotSpacing + dotSpacing / 2;
        const isActive = i / dotCount <= progress;
        ctx.fillStyle = isActive ? config.color : config.backgroundColor;
        ctx.beginPath();
        ctx.arc(dotX, y, barHeight / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    case 'minimal':
      ctx.fillStyle = config.color;
      ctx.fillRect(startX, y - 1, progressWidth, 2);
      break;
    default:
      ctx.fillStyle = config.color;
      ctx.beginPath();
      ctx.roundRect(startX, y - barHeight / 2, progressWidth, barHeight, barHeight / 2);
      ctx.fill();
  }
  
  // Time display
  if (config.showTime) {
    const formatTime = (t: number) => {
      const mins = Math.floor(t / 60);
      const secs = Math.floor(t % 60);
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    };
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(formatTime(currentTime), startX, y + barHeight / 2 + 16);
    ctx.textAlign = 'right';
    ctx.fillText(formatTime(duration), startX + barWidth, y + barHeight / 2 + 16);
  }
  
  ctx.restore();
}

// Text overlay rendering
export interface TextOverlayConfig {
  text: string;
  position: 'top-left' | 'top-center' | 'top-right' | 'center-left' | 'center' | 'center-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  fontSize: number;
  fontFamily: string;
  color: string;
  strokeColor: string;
  strokeWidth: number;
  animation: 'none' | 'pulse' | 'bounce' | 'glow' | 'wave' | 'typewriter' | 'fade';
  audioReactive: boolean;
  opacity: number;
}

export function drawTextOverlay(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  audioData: AudioData,
  config: TextOverlayConfig,
  time: number
): void {
  if (!config.text) return;
  
  const { width, height } = canvas;
  const { bassLevel, midLevel, trebleLevel } = audioData;
  const avgLevel = (bassLevel + midLevel + trebleLevel) / (255 * 3);
  
  let x: number, y: number;
  let textAlign: CanvasTextAlign = 'center';
  let textBaseline: CanvasTextBaseline = 'middle';
  
  const padding = 40;
  
  switch (config.position) {
    case 'top-left':
      x = padding; y = padding;
      textAlign = 'left'; textBaseline = 'top';
      break;
    case 'top-center':
      x = width / 2; y = padding;
      textAlign = 'center'; textBaseline = 'top';
      break;
    case 'top-right':
      x = width - padding; y = padding;
      textAlign = 'right'; textBaseline = 'top';
      break;
    case 'center-left':
      x = padding; y = height / 2;
      textAlign = 'left'; textBaseline = 'middle';
      break;
    case 'center':
      x = width / 2; y = height / 2;
      textAlign = 'center'; textBaseline = 'middle';
      break;
    case 'center-right':
      x = width - padding; y = height / 2;
      textAlign = 'right'; textBaseline = 'middle';
      break;
    case 'bottom-left':
      x = padding; y = height - padding;
      textAlign = 'left'; textBaseline = 'bottom';
      break;
    case 'bottom-center':
      x = width / 2; y = height - padding;
      textAlign = 'center'; textBaseline = 'bottom';
      break;
    case 'bottom-right':
      x = width - padding; y = height - padding;
      textAlign = 'right'; textBaseline = 'bottom';
      break;
    default:
      x = width / 2; y = height - padding;
      textAlign = 'center'; textBaseline = 'bottom';
  }
  
  ctx.save();
  
  let fontSize = config.fontSize;
  let offsetY = 0;
  let opacity = config.opacity;
  
  // Apply animations
  switch (config.animation) {
    case 'pulse':
      const pulseScale = config.audioReactive ? 1 + avgLevel * 0.2 : 1 + Math.sin(time * 3) * 0.1;
      fontSize *= pulseScale;
      break;
    case 'bounce':
      offsetY = Math.sin(time * 4) * 10 * (config.audioReactive ? avgLevel : 0.5);
      break;
    case 'glow':
      ctx.shadowColor = config.color;
      ctx.shadowBlur = 10 + (config.audioReactive ? avgLevel * 20 : Math.sin(time * 2) * 10);
      break;
    case 'wave':
      offsetY = Math.sin(time * 2) * 5;
      break;
    case 'fade':
      opacity *= 0.5 + Math.sin(time * 2) * 0.5;
      break;
  }
  
  ctx.globalAlpha = opacity;
  ctx.font = `bold ${fontSize}px ${config.fontFamily}`;
  ctx.textAlign = textAlign;
  ctx.textBaseline = textBaseline;
  
  // Stroke
  if (config.strokeWidth > 0) {
    ctx.strokeStyle = config.strokeColor;
    ctx.lineWidth = config.strokeWidth * 2;
    ctx.lineJoin = 'round';
    ctx.strokeText(config.text, x, y + offsetY);
  }
  
  // Fill
  ctx.fillStyle = config.color;
  ctx.fillText(config.text, x, y + offsetY);
  
  ctx.restore();
}

// Ken Burns effect state
let kenBurnsOffset = { x: 0, y: 0, zoom: 1, direction: 0 };

export interface KenBurnsConfig {
  enabled: boolean;
  direction: 'zoom-in' | 'zoom-out' | 'pan-left' | 'pan-right' | 'pan-up' | 'pan-down' | 'random';
  speed: number;
  intensity: number;
}

export function getKenBurnsTransform(config: KenBurnsConfig, deltaTime: number): { x: number; y: number; scale: number } {
  if (!config.enabled) {
    return { x: 0, y: 0, scale: 1 };
  }
  
  const speed = config.speed * 0.001;
  const intensity = config.intensity;
  
  // Random direction change
  if (config.direction === 'random' && Math.random() < 0.001) {
    kenBurnsOffset.direction = Math.floor(Math.random() * 6);
  }
  
  const dir = config.direction === 'random' ? kenBurnsOffset.direction : 
    ['zoom-in', 'zoom-out', 'pan-left', 'pan-right', 'pan-up', 'pan-down'].indexOf(config.direction);
  
  switch (dir) {
    case 0: // zoom-in
      kenBurnsOffset.zoom = Math.min(1 + intensity, kenBurnsOffset.zoom + speed);
      break;
    case 1: // zoom-out
      kenBurnsOffset.zoom = Math.max(1, kenBurnsOffset.zoom - speed);
      if (kenBurnsOffset.zoom <= 1) kenBurnsOffset.zoom = 1 + intensity;
      break;
    case 2: // pan-left
      kenBurnsOffset.x -= speed * intensity * 100;
      if (kenBurnsOffset.x < -intensity * 50) kenBurnsOffset.x = intensity * 50;
      break;
    case 3: // pan-right
      kenBurnsOffset.x += speed * intensity * 100;
      if (kenBurnsOffset.x > intensity * 50) kenBurnsOffset.x = -intensity * 50;
      break;
    case 4: // pan-up
      kenBurnsOffset.y -= speed * intensity * 100;
      if (kenBurnsOffset.y < -intensity * 50) kenBurnsOffset.y = intensity * 50;
      break;
    case 5: // pan-down
      kenBurnsOffset.y += speed * intensity * 100;
      if (kenBurnsOffset.y > intensity * 50) kenBurnsOffset.y = -intensity * 50;
      break;
  }
  
  return {
    x: kenBurnsOffset.x,
    y: kenBurnsOffset.y,
    scale: kenBurnsOffset.zoom
  };
}

export function resetKenBurns(): void {
  kenBurnsOffset = { x: 0, y: 0, zoom: 1, direction: 0 };
}

export function clearOverlayParticles(): void {
  overlayParticles = [];
}

// Watermark rendering
export interface WatermarkConfig {
  enabled: boolean;
  imageUrl: string | null;
  position: 'top-left' | 'top-center' | 'top-right' | 'center-left' | 'center' | 'center-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  size: number;
  opacity: number;
  padding: number;
}

const watermarkImageCache: Map<string, HTMLImageElement> = new Map();

export function drawWatermark(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  config: WatermarkConfig
): void {
  if (!config.enabled || !config.imageUrl) return;

  let img = watermarkImageCache.get(config.imageUrl);
  if (!img) {
    img = new window.Image();
    img.src = config.imageUrl;
    watermarkImageCache.set(config.imageUrl, img);
  }

  if (!img.complete) return;

  const { width, height } = canvas;
  const maxDim = Math.min(width, height) * (config.size / 100);
  const aspectRatio = img.width / img.height;
  
  let drawWidth: number, drawHeight: number;
  if (aspectRatio > 1) {
    drawWidth = maxDim;
    drawHeight = maxDim / aspectRatio;
  } else {
    drawHeight = maxDim;
    drawWidth = maxDim * aspectRatio;
  }

  let x: number, y: number;
  const padding = config.padding;

  switch (config.position) {
    case 'top-left':
      x = padding;
      y = padding;
      break;
    case 'top-center':
      x = (width - drawWidth) / 2;
      y = padding;
      break;
    case 'top-right':
      x = width - drawWidth - padding;
      y = padding;
      break;
    case 'center-left':
      x = padding;
      y = (height - drawHeight) / 2;
      break;
    case 'center':
      x = (width - drawWidth) / 2;
      y = (height - drawHeight) / 2;
      break;
    case 'center-right':
      x = width - drawWidth - padding;
      y = (height - drawHeight) / 2;
      break;
    case 'bottom-left':
      x = padding;
      y = height - drawHeight - padding;
      break;
    case 'bottom-center':
      x = (width - drawWidth) / 2;
      y = height - drawHeight - padding;
      break;
    case 'bottom-right':
    default:
      x = width - drawWidth - padding;
      y = height - drawHeight - padding;
      break;
  }

  ctx.save();
  ctx.globalAlpha = config.opacity;
  ctx.drawImage(img, x, y, drawWidth, drawHeight);
  ctx.restore();
}
