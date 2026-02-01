export interface AudioData {
  frequencyData: Uint8Array;
  timeDomainData: Uint8Array;
  averageFrequency: number;
  bassLevel: number;
  midLevel: number;
  trebleLevel: number;
}

// Cache for already-connected audio elements (they can only be connected once)
const audioSourceCache = new WeakMap<HTMLAudioElement, {
  context: AudioContext;
  source: MediaElementAudioSourceNode;
}>();

export class AudioAnalyzer {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private isInitialized = false;

  constructor(private fftSize: number = 2048) {}

  async initialize(audioElement: HTMLAudioElement): Promise<void> {
    if (this.isInitialized && this.audioElement === audioElement) {
      return;
    }

    this.cleanup();

    // Check if this audio element was already connected
    const cached = audioSourceCache.get(audioElement);
    if (cached) {
      this.audioContext = cached.context;
      this.sourceNode = cached.source;
    } else {
      this.audioContext = new AudioContext();
      this.sourceNode = this.audioContext.createMediaElementSource(audioElement);
      audioSourceCache.set(audioElement, {
        context: this.audioContext,
        source: this.sourceNode,
      });
    }

    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = this.fftSize;
    this.analyser.smoothingTimeConstant = 0.8;

    this.sourceNode.connect(this.analyser);
    this.analyser.connect(this.audioContext.destination);

    this.audioElement = audioElement;
    this.isInitialized = true;
  }

  getAudioData(): AudioData {
    if (!this.analyser) {
      return {
        frequencyData: new Uint8Array(0),
        timeDomainData: new Uint8Array(0),
        averageFrequency: 0,
        bassLevel: 0,
        midLevel: 0,
        trebleLevel: 0,
      };
    }

    const frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
    const timeDomainData = new Uint8Array(this.analyser.frequencyBinCount);

    this.analyser.getByteFrequencyData(frequencyData);
    this.analyser.getByteTimeDomainData(timeDomainData);

    const averageFrequency = frequencyData.reduce((a, b) => a + b, 0) / frequencyData.length;
    
    const bassEnd = Math.floor(frequencyData.length * 0.1);
    const midEnd = Math.floor(frequencyData.length * 0.5);

    const bassSlice = frequencyData.slice(0, bassEnd);
    const midSlice = frequencyData.slice(bassEnd, midEnd);
    const trebleSlice = frequencyData.slice(midEnd);

    const bassLevel = bassSlice.reduce((a, b) => a + b, 0) / bassSlice.length;
    const midLevel = midSlice.reduce((a, b) => a + b, 0) / midSlice.length;
    const trebleLevel = trebleSlice.reduce((a, b) => a + b, 0) / trebleSlice.length;

    return {
      frequencyData,
      timeDomainData,
      averageFrequency,
      bassLevel,
      midLevel,
      trebleLevel,
    };
  }

  resume(): void {
    this.audioContext?.resume();
  }

  cleanup(): void {
    // Disconnect analyser but don't close context (it's cached for reuse)
    if (this.analyser) {
      this.analyser.disconnect();
      this.analyser = null;
    }
    // Don't disconnect sourceNode or close audioContext - they're cached
    this.sourceNode = null;
    this.audioContext = null;
    this.audioElement = null;
    this.isInitialized = false;
  }
}
