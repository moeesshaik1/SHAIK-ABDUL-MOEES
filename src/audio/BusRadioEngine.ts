/**
 * Bus Radio Synthesizer & Announcement Engine for AP RTC Bus Simulator
 * 
 * Provides procedural Telugu folk melodies, AIR signature tune, temple bells,
 * dholak/dappu percussion loops, bus stand PA chimes, and synthesized Telugu
 * news bulletins & passenger announcements.
 */

export interface RadioTrack {
  id: string;
  stationId: string;
  stationName: string;
  stationTelugu: string;
  frequency: string;
  title: string;
  titleTelugu: string;
  artist: string;
  category: 'folk' | 'news' | 'devotional' | 'announcement';
  durationSeconds: number;
  speechTextTelugu?: string;
  style: 'air_news' | 'folk_dappu' | 'bhakthi_shiva' | 'bus_announcement' | 'folk_flute' | 'temple_nadaswaram';
}

export interface RadioStation {
  id: string;
  name: string;
  teluguName: string;
  frequency: string;
  description: string;
  color: string;
  tracks: RadioTrack[];
}

export const RADIO_STATIONS: RadioStation[] = [
  {
    id: 'air_kurnool',
    name: 'All India Radio Kurnool',
    teluguName: 'ఆకాశవాణి కర్నూలు',
    frequency: '102.1 FM',
    description: 'Regional news bulletins, agricultural weather, and NH-40 highway updates.',
    color: '#0284c7', // Sky Blue
    tracks: [
      {
        id: 'air_news_1',
        stationId: 'air_kurnool',
        stationName: 'All India Radio Kurnool',
        stationTelugu: 'ఆకాశవాణి కర్నూలు',
        frequency: '102.1 FM',
        title: 'Pranthiya Varthalu - Rayalaseema Regional Bulletin',
        titleTelugu: 'ప్రాంతీయ వార్తలు • కర్నూలు - నంద్యాల - కడప ఎడిషన్',
        artist: 'AIR News Reader',
        category: 'news',
        durationSeconds: 48,
        style: 'air_news',
        speechTextTelugu: 'ఆకాశవాణి... వార్తలు చదువుతున్నది శ్రీనివాసరావు. ముఖ్యాంశాలు: కర్నూలు నుండి నంద్యాల, శ్రీశైలం జాతీయ రహదారిపై వాహనాల రాకపోకలు సాఫీగా సాగుతున్నాయి. నల్లమల అటవీ ఘాట్ రోడ్డులో ప్రయాణించే ఆర్టీసీ బస్సు ప్రయాణికులు జాగ్రత్తలు పాటించాలని రవాణా శాఖ సూచించింది.',
      },
      {
        id: 'air_news_2',
        stationId: 'air_kurnool',
        stationName: 'All India Radio Kurnool',
        stationTelugu: 'ఆకాశవాణి కర్నూలు',
        frequency: '102.1 FM',
        title: 'Rythu Lokam - Agricultural Weather & Reservoirs',
        titleTelugu: 'రైతు లోకం • శ్రీశైలం ప్రాజెక్ట్ నీటిమట్టం వివరాలు',
        artist: 'AIR Krishi Vani',
        category: 'news',
        durationSeconds: 42,
        style: 'air_news',
        speechTextTelugu: 'శ్రీశైలం జలాశయం తాజా నీటిమట్టం మరియు రాయలసీమ ప్రాంతంలో వర్షపాత సమాచారం. రైతులు రాబోయే ఖరీఫ్ పంటలకు సిద్ధం కావాలని వ్యవసాయ అధికారులు కోరారు.',
      },
    ],
  },
  {
    id: 'rayalaseema_folk',
    name: 'Rayalaseema Janapadam',
    teluguName: 'రాయలసీమ జానపదం',
    frequency: '98.4 FM',
    description: 'Energetic Telugu folk rhythms, Dappu beats, and village harvest songs.',
    color: '#ea580c', // Bright Orange
    tracks: [
      {
        id: 'folk_1',
        stationId: 'rayalaseema_folk',
        stationName: 'Rayalaseema Janapadam',
        stationTelugu: 'రాయలసీమ జానపదం',
        frequency: '98.4 FM',
        title: 'Palle Velugu Dappu - Rayalaseema Janapada Geetham',
        titleTelugu: 'పల్లె వెలుగు దప్పుల మోత • సీమ జానపద గీతం',
        artist: 'Seema Janapada Kala Mandali',
        category: 'folk',
        durationSeconds: 65,
        style: 'folk_dappu',
      },
      {
        id: 'folk_2',
        stationId: 'rayalaseema_folk',
        stationName: 'Rayalaseema Janapadam',
        stationTelugu: 'రాయలసీమ జానపదం',
        frequency: '98.4 FM',
        title: 'Gorrela Kaapari Pata - Nallamala Forest Melody',
        titleTelugu: 'గొర్రెల కాపరి వేణుగానం • నల్లమల పల్లె పాట',
        artist: 'Village Folk Troupe',
        category: 'folk',
        durationSeconds: 58,
        style: 'folk_flute',
      },
    ],
  },
  {
    id: 'srisailam_bhakthi',
    name: 'Srisailam Bhakthi Vani',
    teluguName: 'శ్రీశైల భక్తి తరంగాలు',
    frequency: '105.8 FM',
    description: 'Sacred chants, Nadaswaram ragas, and Shiva bhajans for Srisailam pilgrims.',
    color: '#ca8a04', // Sacred Ochre/Gold
    tracks: [
      {
        id: 'bhakthi_1',
        stationId: 'srisailam_bhakthi',
        stationName: 'Srisailam Bhakthi Vani',
        stationTelugu: 'శ్రీశైల భక్తి తరంగాలు',
        frequency: '105.8 FM',
        title: 'Srisaila Mallikarjuna Swamy Suprabhatham',
        titleTelugu: 'మల్లికార్జున స్వామి సుప్రభాతం & నాదస్వరం',
        artist: 'Srisailam Devasthanam Nadaswara Vidwans',
        category: 'devotional',
        durationSeconds: 72,
        style: 'temple_nadaswaram',
        speechTextTelugu: 'ఓం నమః శివాయ... శ్రీ భ్రమరాంబ సమేత మల్లికార్జున స్వామి దేవస్థానం, శ్రీశైలం క్షేత్రానికి విచ్చేయుచున్న భక్తులకు స్వాగతం.',
      },
      {
        id: 'bhakthi_2',
        stationId: 'srisailam_bhakthi',
        stationName: 'Srisailam Bhakthi Vani',
        stationTelugu: 'శ్రీశైల భక్తి తరంగాలు',
        frequency: '105.8 FM',
        title: 'Shiva Shankara Bhakthi Tarangini',
        titleTelugu: 'శివయ్య దివ్య నామ సంకీర్తన • ఆలయ గంటల నాదం',
        artist: 'Bhakthi Sangeetha Mandali',
        category: 'devotional',
        durationSeconds: 60,
        style: 'bhakthi_shiva',
      },
    ],
  },
  {
    id: 'apsrtc_pa',
    name: 'APSRTC Terminal PA',
    teluguName: 'ఆర్టీసీ ప్రయాణ ప్రకటనలు',
    frequency: '94.2 FM',
    description: 'Official bus terminal departure announcements, chimes, and route guidelines.',
    color: '#dc2626', // APSRTC Crimson Red
    tracks: [
      {
        id: 'pa_kurnool',
        stationId: 'apsrtc_pa',
        stationName: 'APSRTC Terminal PA',
        stationTelugu: 'ఆర్టీసీ ప్రయాణ ప్రకటనలు',
        frequency: '94.2 FM',
        title: 'Kurnool Bus Stand Official Departure Chime',
        titleTelugu: 'కర్నూలు బస్ స్టాండ్ అధికారిక ప్రకటన • ప్లాట్‌ఫారమ్ 1',
        artist: 'APSRTC Passenger Information System',
        category: 'announcement',
        durationSeconds: 38,
        style: 'bus_announcement',
        speechTextTelugu: 'శ్రద్ధగా వినండి: కర్నూలు డిపో నుండి నంద్యాల, ఆత్మకూరు మీదుగా శ్రీశైలం వెళ్ళు పల్లె వెలుగు ఎక్స్‌ప్రెస్ బస్సు ప్లాట్‌ఫారమ్ నంబర్ ఒకటి పై సిద్ధంగా ఉంది. ప్రయాణికులు టిక్కెట్లు కొనుగోలు చేసి బస్సులో ఆశీనులు కావాలని కోరుచున్నాము.',
      },
      {
        id: 'pa_ghat',
        stationId: 'apsrtc_pa',
        stationName: 'APSRTC Terminal PA',
        stationTelugu: 'ఆర్టీసీ ప్రయాణ ప్రకటనలు',
        frequency: '94.2 FM',
        title: 'Srisailam Ghat Road Safety Guidelines',
        titleTelugu: 'శ్రీశైలం ఘాట్ రోడ్ ప్రయాణ భద్రతా సూచనలు',
        artist: 'APSRTC Road Safety Cell',
        category: 'announcement',
        durationSeconds: 35,
        style: 'bus_announcement',
        speechTextTelugu: 'ముఖ్య గమనిక: శ్రీశైలం ఘాట్ రోడ్డులో బస్సు నడుస్తున్నప్పుడు ప్రయాణికులు కిటికీల నుండి చేతులు బయట పెట్టరాదు. బస్సు తలుపులు మూసి ఉంచబడతాయి. ప్రయాణికుల సహకారానికి ధన్యవాదాలు.',
      },
    ],
  },
];

class BusRadioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private analyser: GainNode | AnalyserNode | null = null;
  private isPlaying: boolean = false;
  private volume: number = 0.65;
  private currentStationIndex: number = 0;
  private currentTrackIndex: number = 0;
  private playbackTimer: number | null = null;
  private activeOscillators: OscillatorNode[] = [];
  private activeGains: GainNode[] = [];
  private loopIntervalId: number | null = null;
  private onTrackChangeCallbacks: Array<(track: RadioTrack) => void> = [];
  private onPlayStateCallbacks: Array<(isPlaying: boolean) => void> = [];

  constructor() {}

  public init(existingCtx?: AudioContext | null) {
    if (this.ctx) return;
    try {
      if (existingCtx) {
        this.ctx = existingCtx;
      } else {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.ctx = new AudioCtx();
      }

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);

      const analyserNode = this.ctx.createAnalyser();
      analyserNode.fftSize = 64;
      this.analyser = analyserNode;

      this.masterGain.connect(analyserNode);
      analyserNode.connect(this.ctx.destination);
    } catch (e) {
      console.warn('Radio engine init error', e);
    }
  }

  private ensureContext() {
    if (!this.ctx) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public getVisualizerData(): Uint8Array {
    if (!this.analyser || !(this.analyser instanceof AnalyserNode)) {
      return new Uint8Array(16);
    }
    const data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(data);
    return data;
  }

  public getCurrentStation(): RadioStation {
    return RADIO_STATIONS[this.currentStationIndex];
  }

  public getCurrentTrack(): RadioTrack {
    const station = this.getCurrentStation();
    return station.tracks[this.currentTrackIndex] || station.tracks[0];
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public subscribeTrackChange(cb: (track: RadioTrack) => void) {
    this.onTrackChangeCallbacks.push(cb);
    return () => {
      this.onTrackChangeCallbacks = this.onTrackChangeCallbacks.filter((c) => c !== cb);
    };
  }

  public subscribePlayState(cb: (playing: boolean) => void) {
    this.onPlayStateCallbacks.push(cb);
    return () => {
      this.onPlayStateCallbacks = this.onPlayStateCallbacks.filter((c) => c !== cb);
    };
  }

  private notifyTrackChange() {
    const track = this.getCurrentTrack();
    this.onTrackChangeCallbacks.forEach((cb) => cb(track));
  }

  private notifyPlayState() {
    this.onPlayStateCallbacks.forEach((cb) => cb(this.isPlaying));
  }

  public play() {
    this.ensureContext();
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.notifyPlayState();
    this.startTrack(this.getCurrentTrack());
  }

  public pause() {
    if (!this.isPlaying) return;
    this.isPlaying = false;
    this.notifyPlayState();
    this.stopCurrentAudio();
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }

  public togglePlay() {
    if (this.isPlaying) this.pause();
    else this.play();
  }

  public selectStation(stationId: string) {
    const index = RADIO_STATIONS.findIndex((s) => s.id === stationId);
    if (index === -1) return;
    this.currentStationIndex = index;
    this.currentTrackIndex = 0;
    this.playTuningStaticSound();
    if (this.isPlaying) {
      this.stopCurrentAudio();
      this.startTrack(this.getCurrentTrack());
    }
    this.notifyTrackChange();
  }

  public nextTrack() {
    const station = this.getCurrentStation();
    this.currentTrackIndex = (this.currentTrackIndex + 1) % station.tracks.length;
    this.playTuningStaticSound();
    if (this.isPlaying) {
      this.stopCurrentAudio();
      this.startTrack(this.getCurrentTrack());
    }
    this.notifyTrackChange();
  }

  public prevTrack() {
    const station = this.getCurrentStation();
    this.currentTrackIndex = (this.currentTrackIndex - 1 + station.tracks.length) % station.tracks.length;
    this.playTuningStaticSound();
    if (this.isPlaying) {
      this.stopCurrentAudio();
      this.startTrack(this.getCurrentTrack());
    }
    this.notifyTrackChange();
  }

  /**
   * Authentic Radio FM static crackle and sweep when tuning stations
   */
  private playTuningStaticSound() {
    if (!this.ctx || !this.masterGain) return;
    try {
      const t = this.ctx.currentTime;
      const bufferSize = this.ctx.sampleRate * 0.18;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

      const source = this.ctx.createBufferSource();
      source.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2800, t);
      filter.Q.setValueAtTime(3.0, t);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

      source.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      source.start(t);
    } catch {}
  }

  /**
   * Stop all active musical synthesizers and scheduled timers
   */
  private stopCurrentAudio() {
    if (this.playbackTimer) {
      clearTimeout(this.playbackTimer);
      this.playbackTimer = null;
    }
    if (this.loopIntervalId) {
      clearInterval(this.loopIntervalId);
      this.loopIntervalId = null;
    }
    this.activeOscillators.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {}
    });
    this.activeOscillators = [];
    this.activeGains.forEach((g) => {
      try {
        g.disconnect();
      } catch {}
    });
    this.activeGains = [];
  }

  /**
   * Start generating the requested musical/audio style
   */
  private startTrack(track: RadioTrack) {
    this.stopCurrentAudio();
    if (!this.ctx || !this.masterGain) return;

    switch (track.style) {
      case 'air_news':
        this.playAirNewsTheme(track);
        break;
      case 'folk_dappu':
        this.playFolkDappuMusic(track);
        break;
      case 'folk_flute':
        this.playFolkFluteMelody(track);
        break;
      case 'temple_nadaswaram':
        this.playTempleNadaswaram(track);
        break;
      case 'bhakthi_shiva':
        this.playShivaDevotional(track);
        break;
      case 'bus_announcement':
        this.playBusStandAnnouncement(track);
        break;
      default:
        this.playFolkDappuMusic(track);
    }

    // Auto advance to next track when duration finishes
    this.playbackTimer = window.setTimeout(() => {
      if (this.isPlaying) {
        this.nextTrack();
      }
    }, track.durationSeconds * 1000);
  }

  /**
   * 1. Famous All India Radio (AIR) Signature Theme
   * Composed of Tanpura drone + Walter Kaufmann Violin/Flute melodic arpeggios
   */
  private playAirNewsTheme(track: RadioTrack) {
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;

    // Tanpura Drone in D (146.83 Hz & 220 Hz)
    this.createDrone(146.83, 0.12);
    this.createDrone(220.0, 0.08);

    // Iconic AIR Melody Notes (D, F#, A, B, A, F#, E, D)
    const melody = [
      { note: 293.66, dur: 0.6, delay: 0.2 }, // D4
      { note: 369.99, dur: 0.6, delay: 0.8 }, // F#4
      { note: 440.0, dur: 0.7, delay: 1.4 },  // A4
      { note: 493.88, dur: 0.5, delay: 2.1 }, // B4
      { note: 440.0, dur: 0.8, delay: 2.6 },  // A4
      { note: 369.99, dur: 0.6, delay: 3.4 }, // F#4
      { note: 329.63, dur: 0.6, delay: 4.0 }, // E4
      { note: 293.66, dur: 1.2, delay: 4.6 }, // D4
    ];

    melody.forEach((m) => {
      this.playSynthNote(m.note, t + m.delay, m.dur, 'sine', 0.22);
      this.playSynthNote(m.note * 2, t + m.delay, m.dur * 0.9, 'triangle', 0.08);
    });

    // Voice announcement starts right after AIR theme (at t + 6.0 seconds)
    if (track.speechTextTelugu) {
      setTimeout(() => {
        if (this.isPlaying) {
          this.speakTeluguAnnouncement(track.speechTextTelugu!);
        }
      }, 5800);
    }
  }

  /**
   * 2. Rayalaseema Folk Dappu Rhythms & Mandolin
   * Lively energetic folk percussion loop (Dappu bass thumps + high rim clicks + flute)
   */
  private playFolkDappuMusic(track: RadioTrack) {
    if (!this.ctx || !this.masterGain) return;

    // Tanpura Root in E
    this.createDrone(164.81, 0.08);

    // Fast 4/4 Folk Dappu Drum Loop
    let beat = 0;
    const beatInterval = 280; // ~107 BPM folk tempo

    const pentatonicNotes = [329.63, 369.99, 415.3, 493.88, 554.37, 659.25]; // Mohanam / Folk raga

    this.loopIntervalId = window.setInterval(() => {
      if (!this.ctx || !this.isPlaying) return;
      const t = this.ctx.currentTime;

      // Heavy Dappu Thump on beats 1 and 3
      if (beat % 4 === 0 || beat % 4 === 2) {
        this.playDappuBass(t);
      }
      // Dappu stick rim shot on beats 2 and 4
      if (beat % 2 === 1) {
        this.playDappuRim(t);
      }

      // Folk melody note every 2-4 beats
      if (beat % 2 === 0) {
        const noteIdx = Math.floor(Math.random() * pentatonicNotes.length);
        const note = pentatonicNotes[noteIdx];
        this.playSynthNote(note, t, 0.35, 'triangle', 0.18);
      }

      beat++;
    }, beatInterval);
  }

  /**
   * 3. Shepherd Folk Flute & Acoustic Rhythms (Nallamala hills)
   */
  private playFolkFluteMelody(track: RadioTrack) {
    if (!this.ctx || !this.masterGain) return;
    this.createDrone(196.0, 0.1); // G3

    const fluteNotes = [392.0, 440.0, 493.88, 587.33, 659.25, 783.99]; // G Major Folk

    let step = 0;
    this.loopIntervalId = window.setInterval(() => {
      if (!this.ctx || !this.isPlaying) return;
      const t = this.ctx.currentTime;

      // Gentle folk shaker on each step
      this.playShaker(t);

      // Warm bamboo flute note
      if (step % 2 === 0) {
        const note = fluteNotes[step % fluteNotes.length];
        this.playSynthNote(note, t, 0.55, 'sine', 0.25, 0.15); // gentle vibrato
      }

      step++;
    }, 450);
  }

  /**
   * 4. Srisailam Devasthanam Nadaswaram & Temple Bells
   */
  private playTempleNadaswaram(track: RadioTrack) {
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;

    // Deep Om drone
    this.createDrone(110.0, 0.15);
    this.createDrone(165.0, 0.1);

    // Temple Bell Chimes
    this.playTempleBell(t + 0.3);
    this.playTempleBell(t + 3.5);

    // Nadaswaram Raga (Mayamalavagowla notes)
    const nadaswaram = [
      { note: 220.0, dur: 1.2, delay: 1.0 },
      { note: 233.08, dur: 0.8, delay: 2.2 },
      { note: 277.18, dur: 1.4, delay: 3.0 },
      { note: 293.66, dur: 1.0, delay: 4.5 },
      { note: 329.63, dur: 1.8, delay: 5.6 },
    ];

    nadaswaram.forEach((n) => {
      this.playSynthNote(n.note, t + n.delay, n.dur, 'sawtooth', 0.14, 0.1);
    });

    // Devotional welcome announcement
    if (track.speechTextTelugu) {
      setTimeout(() => {
        if (this.isPlaying) {
          this.speakTeluguAnnouncement(track.speechTextTelugu!);
        }
      }, 7000);
    }
  }

  /**
   * 5. Shiva Devotional Bells & Chants
   */
  private playShivaDevotional(track: RadioTrack) {
    if (!this.ctx || !this.masterGain) return;
    this.createDrone(130.81, 0.12);

    let bellStep = 0;
    this.loopIntervalId = window.setInterval(() => {
      if (!this.ctx || !this.isPlaying) return;
      const t = this.ctx.currentTime;

      if (bellStep % 4 === 0) {
        this.playTempleBell(t);
      }
      bellStep++;
    }, 1200);
  }

  /**
   * 6. APSRTC Bus Terminal 3-Tone Chime & PA Announcement
   */
  private playBusStandAnnouncement(track: RadioTrack) {
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;

    // Classic Indian Railway / APSRTC Terminal Chime: C5 (523Hz) -> E5 (659Hz) -> G5 (784Hz) -> C6 (1046Hz)
    const chime = [
      { freq: 523.25, time: 0.1 },
      { freq: 659.25, time: 0.6 },
      { freq: 783.99, time: 1.1 },
      { freq: 1046.5, time: 1.6 },
    ];

    chime.forEach((c) => {
      this.playChimeNote(c.freq, t + c.time);
    });

    // Voice announcement right after chime
    if (track.speechTextTelugu) {
      setTimeout(() => {
        if (this.isPlaying) {
          this.speakTeluguAnnouncement(track.speechTextTelugu!);
        }
      }, 2600);
    }
  }

  /**
   * Spoken Announcements in Telugu via SpeechSynthesis
   */
  private speakTeluguAnnouncement(text: string) {
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.92;
      utterance.pitch = 1.05;
      utterance.volume = this.volume;

      // Try finding Telugu (te-IN) or Indian English/Hindi voice
      const voices = window.speechSynthesis.getVoices();
      const teVoice = voices.find((v) => v.lang.includes('te') || v.lang.includes('TE'));
      const inVoice = voices.find((v) => v.lang.includes('en-IN') || v.lang.includes('hi-IN'));

      if (teVoice) {
        utterance.voice = teVoice;
        utterance.lang = 'te-IN';
      } else if (inVoice) {
        utterance.voice = inVoice;
      }

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error', e);
    }
  }

  // --- AUDIO SYNTHESIS BUILDING BLOCKS ---

  private createDrone(freq: number, gainVal: number) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    gain.gain.setValueAtTime(gainVal * this.volume, this.ctx.currentTime);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    this.activeOscillators.push(osc);
    this.activeGains.push(gain);
  }

  private playSynthNote(
    freq: number,
    startTime: number,
    dur: number,
    type: OscillatorType = 'sine',
    volume: number = 0.2,
    vibrato: number = 0
  ) {
    if (!this.ctx || !this.masterGain) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, startTime);

      if (vibrato > 0) {
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        lfo.frequency.setValueAtTime(5.5, startTime);
        lfoGain.gain.setValueAtTime(freq * vibrato * 0.1, startTime);
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        lfo.start(startTime);
        lfo.stop(startTime + dur);
        this.activeOscillators.push(lfo);
      }

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(volume * this.volume, startTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + dur);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(startTime);
      osc.stop(startTime + dur + 0.05);

      this.activeOscillators.push(osc);
      this.activeGains.push(gain);
    } catch {}
  }

  private playDappuBass(t: number) {
    if (!this.ctx || !this.masterGain) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(110, t);
      osc.frequency.exponentialRampToValueAtTime(38, t + 0.18);

      gain.gain.setValueAtTime(0.35 * this.volume, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 0.25);
    } catch {}
  }

  private playDappuRim(t: number) {
    if (!this.ctx || !this.masterGain) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(580, t);
      osc.frequency.exponentialRampToValueAtTime(180, t + 0.06);

      gain.gain.setValueAtTime(0.25 * this.volume, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 0.1);
    } catch {}
  }

  private playShaker(t: number) {
    if (!this.ctx || !this.masterGain) return;
    try {
      const bufferSize = this.ctx.sampleRate * 0.05;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

      const source = this.ctx.createBufferSource();
      source.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(4500, t);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.08 * this.volume, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

      source.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      source.start(t);
    } catch {}
  }

  private playTempleBell(t: number) {
    if (!this.ctx || !this.masterGain) return;
    try {
      // Bell metallic harmonics
      [1175, 2350, 3520].forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);

        const vol = (idx === 0 ? 0.3 : 0.12) * this.volume;
        gain.gain.setValueAtTime(vol, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 1.8);

        osc.connect(gain);
        gain.connect(this.masterGain!);

        osc.start(t);
        osc.stop(t + 2.0);
      });
    } catch {}
  }

  private playChimeNote(freq: number, t: number) {
    if (!this.ctx || !this.masterGain) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.35 * this.volume, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.55);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 0.6);
    } catch {}
  }
}

export const busRadioEngine = new BusRadioEngine();
