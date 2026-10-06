import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { buildAPRTCBus, BusRig } from './graphics/BusModel';
import { buildEnvironment, WorldObjects } from './graphics/EnvironmentBuilder';
import { BusPhysics } from './physics/BusPhysics';
import { soundManager } from './audio/SoundManager';
import {
  WeatherType,
  TimeOfDay,
  CameraMode,
  TripState,
  PassengerTicket,
  BusCondition,
} from './types/game';
import { HUD } from './components/HUD';
import { Minimap } from './components/Minimap';
import { TicketModal } from './components/TicketModal';
import { RefuelModal } from './components/RefuelModal';
import { ServiceModal } from './components/ServiceModal';
import { TripSummaryModal } from './components/TripSummaryModal';
import { MainMenu } from './components/MainMenu';
import { BusRadioPlayer } from './components/BusRadioPlayer';
import { busRadioEngine } from './audio/BusRadioEngine';

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Simulation State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [showMenu, setShowMenu] = useState<boolean>(true);
  const [cameraMode, setCameraMode] = useState<CameraMode>('thirdPerson');
  const [weather, setWeather] = useState<WeatherType>('clear');
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('day');
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Modals
  const [showTicketsModal, setShowTicketsModal] = useState<boolean>(false);
  const [showRefuelModal, setShowRefuelModal] = useState<boolean>(false);
  const [showServiceModal, setShowServiceModal] = useState<boolean>(false);
  const [serviceModalMode, setServiceModalMode] = useState<'wash' | 'service'>('service');
  const [showSummaryModal, setShowSummaryModal] = useState<boolean>(false);
  const [showRadioModal, setShowRadioModal] = useState<boolean>(false);
  const [isRadioMinimized, setIsRadioMinimized] = useState<boolean>(false);
  const [isRadioPlaying, setIsRadioPlaying] = useState<boolean>(false);
  const [nearFacility, setNearFacility] = useState<'fuel' | 'wash' | 'service' | 'toll' | 'busStand' | null>(null);

  // Subscribe to radio play state
  useEffect(() => {
    const unsub = busRadioEngine.subscribePlayState((playing) => {
      setIsRadioPlaying(playing);
    });
    return () => unsub();
  }, []);

  // Physics & Trip State
  const physicsRef = useRef<BusPhysics>(new BusPhysics(0));
  const busRigRef = useRef<BusRig | null>(null);
  const worldRef = useRef<WorldObjects | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  // Driver input states
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const touchThrottleRef = useRef<boolean>(false);
  const touchBrakeRef = useRef<boolean>(false);
  const touchSteerRef = useRef<number>(0);

  // Animation values
  const doorAnimRef = useRef<number>(0); // 0 = closed, 1 = open
  const wiperAnimRef = useRef<number>(0);

  // Telemetry state for React HUD
  const [telemetryState, setTelemetryState] = useState(physicsRef.current.telemetry);
  const [conditionState, setConditionState] = useState(physicsRef.current.condition);

  // Trip tracking
  const [tripState, setTripState] = useState<TripState>(() => {
    const defaultState: TripState = {
      currentStageIndex: 0,
      origin: 'Kurnool Depot',
      destination: 'Srisailam Temple',
      currentLocationName: 'Kurnool APSRTC Depot Yard',
      currentTeluguName: 'కర్నూలు ఆర్టీసీ డిపో',
      nextStopName: 'Kurnool Central Bus Stand',
      nextStopDistanceKm: 2.0,
      totalDistanceKm: 154,
      traveledKm: 0,
      passengersOnboard: 18,
      maxPassengers: 52,
      totalFareCollected: 480,
      fuelExpenses: 0,
      tollExpenses: 0,
      serviceExpenses: 0,
      departureTime: '06:30 AM',
      elapsedSeconds: 0,
      tickets: [
        {
          id: 't-1',
          ticketNo: '004821',
          origin: 'Kurnool',
          destination: 'Srisailam',
          passengerType: 'Adult',
          fare: 160,
          issueTime: '06:28 AM',
          seatNo: 12,
        },
        {
          id: 't-2',
          ticketNo: '004822',
          origin: 'Kurnool',
          destination: 'Nandyal',
          passengerType: 'Student',
          fare: 45,
          issueTime: '06:29 AM',
          seatNo: 13,
        },
      ],
      drivingScore: 98,
      violations: [],
      isTripCompleted: false,
    };

    const saved = localStorage.getItem('ap_rtc_trip_data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return {
            ...defaultState,
            ...parsed,
            drivingScore: Number.isFinite(parsed.drivingScore) ? parsed.drivingScore : defaultState.drivingScore,
            totalFareCollected: Number.isFinite(parsed.totalFareCollected) ? parsed.totalFareCollected : defaultState.totalFareCollected,
            passengersOnboard: Number.isFinite(parsed.passengersOnboard) ? parsed.passengersOnboard : defaultState.passengersOnboard,
            fuelExpenses: Number.isFinite(parsed.fuelExpenses) ? parsed.fuelExpenses : 0,
            tollExpenses: Number.isFinite(parsed.tollExpenses) ? parsed.tollExpenses : 0,
            serviceExpenses: Number.isFinite(parsed.serviceExpenses) ? parsed.serviceExpenses : 0,
            traveledKm: Number.isFinite(parsed.traveledKm) ? parsed.traveledKm : 0,
            nextStopDistanceKm: Number.isFinite(parsed.nextStopDistanceKm) ? parsed.nextStopDistanceKm : 2.0,
          };
        }
      } catch {}
    }
    return defaultState;
  });

  // Save progress periodically
  useEffect(() => {
    localStorage.setItem('ap_rtc_trip_data', JSON.stringify(tripState));
  }, [tripState]);

  // Initialize Three.js Scene and WebGL Engine
  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth || window.innerWidth;
    const height = containerRef.current.clientHeight || window.innerHeight;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(58, width / height, 0.2, 1200);
    cameraRef.current = camera;

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 3. Build Environment & Bus
    const world = buildEnvironment(scene);
    worldRef.current = world;
    physicsRef.current.speedBreakers = world.speedBreakers;

    const busRig = buildAPRTCBus();
    scene.add(busRig.root);
    busRigRef.current = busRig;

    // Initial camera position behind bus
    camera.position.set(0, 5, -12);
    camera.lookAt(busRig.root.position);

    // 4. Handle Window Resize
    const handleResize = () => {
      if (!containerRef.current || !renderer || !camera) return;
      const w = containerRef.current.clientWidth || window.innerWidth;
      const h = containerRef.current.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 5. Main Simulation Animation Loop
    let lastTime = performance.now();
    let lastUiUpdate = 0;
    let animationFrameId: number;

    const animate = (now: number) => {
      animationFrameId = requestAnimationFrame(animate);
      if (!Number.isFinite(now)) now = performance.now();
      const dt = Math.min(Math.max((now - lastTime) / 1000, 0.001), 0.1);
      lastTime = now;

      // Read Inputs
      let throttle = touchThrottleRef.current ? 1 : 0;
      let brake = touchBrakeRef.current ? 1 : 0;
      let steer = touchSteerRef.current;
      let handbrake = false;

      const keys = keysRef.current;
      if (keys['KeyW'] || keys['ArrowUp']) throttle = 1;
      if (keys['KeyS'] || keys['ArrowDown']) brake = 1;
      if (keys['KeyA'] || keys['ArrowLeft']) steer = -1;
      if (keys['KeyD'] || keys['ArrowRight']) steer = 1;
      if (keys['Space']) handbrake = true;

      // Update Vehicle Physics
      const physics = physicsRef.current;
      physics.update(dt, throttle, brake, steer, handbrake);

      // Check Road Surface Type
      const pz = physics.position.z;
      if (pz >= 1350 && pz <= 1650) {
        physics.telemetry.currentSurface = 'mud';
      } else if (pz >= 2400 && pz <= 3250) {
        physics.telemetry.currentSurface = 'ghat';
        // Incline increases on the ghat
        physics.telemetry.inclineAngle = Math.min(8, 2 + ((pz - 2400) / 850) * 6);
      } else if (pz >= 250 && pz <= 1350) {
        physics.telemetry.currentSurface = 'highway';
        physics.telemetry.inclineAngle = 0;
      } else {
        physics.telemetry.currentSurface = weather === 'rain' ? 'wetAsphalt' : 'asphalt';
        physics.telemetry.inclineAngle = 0;
      }

      // Update 3D Bus Mesh Position & Rotation
      if (busRig) {
        busRig.root.position.set(physics.position.x, physics.position.y + physics.suspensionY, physics.position.z);
        busRig.root.rotation.y = physics.rotationY;

        // Suspension roll & acceleration pitch
        busRig.busBody.rotation.z = physics.roll;
        busRig.busBody.rotation.x = -physics.pitch;

        // Steering wheel & front wheels rotation
        busRig.steeringWheel.rotation.z = -physics.telemetry.steering * 3.5;
        busRig.wheelFL.rotation.y = physics.telemetry.steering;
        busRig.wheelFR.rotation.y = physics.telemetry.steering;

        // Wheel spin animation according to speed
        const wheelSpin = (physics.velocity.z / 0.54) * dt;
        busRig.wheelFL.rotation.x += wheelSpin;
        busRig.wheelFR.rotation.x += wheelSpin;
        busRig.wheelRL.rotation.x += wheelSpin;
        busRig.wheelRR.rotation.x += wheelSpin;

        // Doors Animation (E key)
        const targetDoor = physics.telemetry.doorsOpen ? 1 : 0;
        doorAnimRef.current += (targetDoor - doorAnimRef.current) * Math.min(1, dt * 6);
        const doorOffset = doorAnimRef.current * 0.42;
        busRig.frontDoorLeft.position.z = 11.2 * 0.38 - 0.23 + doorOffset;
        busRig.frontDoorRight.position.z = 11.2 * 0.38 + 0.23 - doorOffset;
        busRig.rearDoorLeft.position.z = -11.2 * 0.28 - 0.23 + doorOffset;
        busRig.rearDoorRight.position.z = -11.2 * 0.28 + 0.23 - doorOffset;

        // Wipers Animation
        if (physics.telemetry.wipersActive || weather === 'rain') {
          wiperAnimRef.current += dt * 4.5;
          const wiperAngle = Math.sin(wiperAnimRef.current) * 0.85;
          busRig.wiperLeft.rotation.z = wiperAngle;
          busRig.wiperRight.rotation.z = wiperAngle;
        }

        // Headlights & Tail / Brake lights glow
        const isNight = timeOfDay === 'night' || timeOfDay === 'evening';
        const lightsOn = physics.telemetry.headlights || isNight;
        busRig.headlightL.intensity = lightsOn ? 3.5 : 0;
        busRig.headlightR.intensity = lightsOn ? 3.5 : 0;
        busRig.headlightGlowMat.emissive.setHex(lightsOn ? 0xfffbeb : 0x000000);
        busRig.headlightGlowMat.emissiveIntensity = lightsOn ? 1.0 : 0;

        // Brake lights
        const isBraking = brake > 0.05 || handbrake;
        busRig.brakeLightMat.emissive.setHex(isBraking ? 0xff0000 : 0x220000);
        busRig.brakeLightMat.emissiveIntensity = isBraking ? 2.0 : (lightsOn ? 0.3 : 0);

        // Turn Indicators Blinking (Hazard or turn signals)
        const blink = Math.floor(now / 350) % 2 === 1;
        busRig.leftIndicatorMat.emissive.setHex(physics.telemetry.leftIndicator && blink ? 0xf59e0b : 0x000000);
        busRig.leftIndicatorMat.emissiveIntensity = physics.telemetry.leftIndicator && blink ? 1.5 : 0;
        busRig.rightIndicatorMat.emissive.setHex(physics.telemetry.rightIndicator && blink ? 0xf59e0b : 0x000000);
        busRig.rightIndicatorMat.emissiveIntensity = physics.telemetry.rightIndicator && blink ? 1.5 : 0;

        // Bus cleanliness dirt appearance
        const dirtFactor = Math.max(0, (100 - physics.condition.cleanliness) / 100);
        busRig.dirtMat.opacity = dirtFactor * 0.45;
      }

      // Update Traffic AI Vehicles
      if (world) {
        world.trafficVehicles.forEach((v) => {
          // Move vehicles along their direction
          v.data.z += v.data.speed * dt;
          v.mesh.position.z = v.data.z;

          // Traffic deceleration if approaching player bus
          const distToPlayer = v.data.z - physics.position.z;
          if (v.data.direction === 1 && distToPlayer > 0 && distToPlayer < 18) {
            v.data.speed = Math.max(2, physics.velocity.z * 0.85);
          }

          // Loop traffic back around if too far behind or ahead
          if (v.data.direction === 1 && v.data.z > physics.position.z + 400) {
            v.data.z = physics.position.z - 300;
          } else if (v.data.direction === -1 && v.data.z < physics.position.z - 300) {
            v.data.z = physics.position.z + 400;
          }
        });

        // Dust & Rain Particle Tracking
        if (physics.telemetry.currentSurface === 'mud') {
          world.dustParticles.position.set(physics.position.x, physics.position.y, physics.position.z - 6);
          const mat = world.dustParticles.material as THREE.PointsMaterial;
          mat.opacity = Math.min(0.6, physics.telemetry.speedKmh / 50);
        } else {
          const mat = world.dustParticles.material as THREE.PointsMaterial;
          mat.opacity = 0;
        }

        if (weather === 'rain') {
          world.rainParticles.position.set(physics.position.x, physics.position.y + 12, physics.position.z);
          const rMat = world.rainParticles.material as THREE.PointsMaterial;
          rMat.opacity = 0.65;
        } else {
          const rMat = world.rainParticles.material as THREE.PointsMaterial;
          rMat.opacity = 0;
        }

        // Toll Barrier Automation when passing toll plaza
        if (world.tollBarrier) {
          if (Math.abs(physics.position.z - 780) < 25) {
            // Barrier opens upwards
            world.tollBarrier.rotation.z = Math.min(1.4, world.tollBarrier.rotation.z + dt * 2.5);
          } else {
            world.tollBarrier.rotation.z = Math.max(0, world.tollBarrier.rotation.z - dt * 1.5);
          }
        }
      }

      // Camera Positioning
      if (camera && busRig) {
        if (cameraMode === 'thirdPerson') {
          // Smooth chase camera
          const targetOffset = new THREE.Vector3(0, 4.2, -13.5);
          targetOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), physics.rotationY);
          const desiredPos = busRig.root.position.clone().add(targetOffset);

          camera.position.lerp(desiredPos, Math.min(1, dt * 5.0));
          const lookAtTarget = busRig.root.position.clone().add(new THREE.Vector3(0, 1.8, 4.0));
          camera.lookAt(lookAtTarget);
        } else if (cameraMode === 'cockpit') {
          // Inside driver cabin (Indian RHD seat)
          const cabinWorldPos = new THREE.Vector3();
          busRig.driverViewTarget.getWorldPosition(cabinWorldPos);
          camera.position.copy(cabinWorldPos);

          const forwardLook = new THREE.Vector3(0, 0, 30);
          forwardLook.applyAxisAngle(new THREE.Vector3(0, 1, 0), physics.rotationY);
          camera.lookAt(cabinWorldPos.clone().add(forwardLook));
        } else if (cameraMode === 'frontBumper') {
          // Front bumper road perspective
          const bumperWorldPos = new THREE.Vector3();
          busRig.frontBumperTarget.getWorldPosition(bumperWorldPos);
          camera.position.copy(bumperWorldPos);

          const forwardLook = new THREE.Vector3(0, 0, 40);
          forwardLook.applyAxisAngle(new THREE.Vector3(0, 1, 0), physics.rotationY);
          camera.lookAt(bumperWorldPos.clone().add(forwardLook));
        }
      }

      // Proximity Checks for roadside facilities
      const pPos = physics.position;
      let facilityNear: 'fuel' | 'wash' | 'service' | 'toll' | 'busStand' | null = null;

      if (Math.abs(pPos.z - 25) < 18 && pPos.x > 8) {
        facilityNear = 'fuel';
      } else if (Math.abs(pPos.z - (-25)) < 16 && pPos.x < -10) {
        facilityNear = 'wash';
      } else if (Math.abs(pPos.z - 15) < 18 && pPos.x < -10) {
        facilityNear = 'service';
      } else if (Math.abs(pPos.z - 780) < 14) {
        facilityNear = 'toll';
      } else if (Math.abs(pPos.z - 140) < 22 || Math.abs(pPos.z - 1980) < 25) {
        facilityNear = 'busStand';
      }
      setNearFacility(facilityNear);

      // Check Trip Completion at Srisailam Terminus (Z >= 3180)
      if (pPos.z >= 3180 && !tripState.isTripCompleted) {
        setTripState((prev) => ({
          ...prev,
          isTripCompleted: true,
          currentLocationName: 'Srisailam Temple Bus Terminus',
          currentTeluguName: 'శ్రీశైలం దేవస్థానం బస్ స్టేషన్',
        }));
        setShowSummaryModal(true);
      }

      // Update React Telemetry & Trip State periodically (~20 fps)
      if (now - lastUiUpdate > 50) {
        lastUiUpdate = now;
        setTelemetryState({ ...physics.telemetry });
        setConditionState({ ...physics.condition });

        // Calculate Traveled Km
        const currentZ = Number.isFinite(pPos.z) ? pPos.z : 0;
        const kmTraveled = Math.min(154, Math.max(0, (currentZ / 3200) * 154));
        setTripState((prev) => {
          // Find nearest next stop
          const nextPts = world?.routePoints?.filter((pt) => pt.worldZ > currentZ) || [];
          const nextStop = nextPts[0] || (world?.routePoints ? world.routePoints[world.routePoints.length - 1] : null);
          const nextDist = nextStop && Number.isFinite(nextStop.worldZ)
            ? Math.max(0, ((nextStop.worldZ - currentZ) / 3200) * 154)
            : 0;

          return {
            ...prev,
            traveledKm: kmTraveled,
            nextStopName: nextStop ? nextStop.name : 'Srisailam Hill Terminus',
            nextStopDistanceKm: nextDist,
            currentLocationName: nextPts.length === 0 ? 'Srisailam Terminus' : prev.currentLocationName,
          };
        });
      }

      // Render Scene
      renderer.render(scene, camera);
    };

    animationFrameId = requestAnimationFrame(animate);

    // 6. Keyboard Event Listeners
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.code] = true;

      if (e.code === 'KeyE') {
        physicsRef.current.toggleDoors();
      } else if (e.code === 'KeyL') {
        physicsRef.current.toggleHeadlights();
      } else if (e.code === 'KeyH') {
        soundManager.startHorn();
      } else if (e.code === 'KeyC') {
        setCameraMode((prev) =>
          prev === 'thirdPerson' ? 'cockpit' : prev === 'cockpit' ? 'frontBumper' : 'thirdPerson'
        );
      } else if (e.code === 'KeyM') {
        const muted = soundManager.toggleMute();
        setIsMuted(muted);
      } else if (e.code === 'KeyR') {
        setShowRadioModal((prev) => !prev);
        setIsRadioMinimized(false);
      } else if (e.code === 'KeyT') {
        // Fast trigger toll if near
        handleTollPay();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.code] = false;
      if (e.code === 'KeyH') {
        soundManager.stopHorn();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      soundManager.stopEngine();
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [weather, timeOfDay, cameraMode]);

  // Handle Day/Night & Lighting adjustments
  useEffect(() => {
    if (!worldRef.current || !sceneRef.current) return;
    const world = worldRef.current;
    const scene = sceneRef.current;

    switch (timeOfDay) {
      case 'morning':
        scene.background = new THREE.Color(0xfbcfe8);
        world.sunLight.color.setHex(0xfef08a);
        world.sunLight.intensity = 1.0;
        world.ambientLight.intensity = 0.55;
        world.streetLights.forEach((l) => (l.intensity = 0));
        break;
      case 'day':
        scene.background = new THREE.Color(0x87ceeb);
        world.sunLight.color.setHex(0xfff7ed);
        world.sunLight.intensity = 1.3;
        world.ambientLight.intensity = 0.5;
        world.streetLights.forEach((l) => (l.intensity = 0));
        break;
      case 'evening':
        scene.background = new THREE.Color(0xfdba74);
        world.sunLight.color.setHex(0xf97316);
        world.sunLight.intensity = 0.8;
        world.ambientLight.intensity = 0.35;
        world.streetLights.forEach((l) => (l.intensity = 1.2));
        break;
      case 'night':
        scene.background = new THREE.Color(0x0f172a);
        world.sunLight.color.setHex(0x1e293b);
        world.sunLight.intensity = 0.1;
        world.ambientLight.intensity = 0.15;
        world.streetLights.forEach((l) => (l.intensity = 2.5));
        break;
    }

    if (weather === 'rain') {
      soundManager.setWeatherRain(true);
      scene.fog = new THREE.FogExp2(0x94a3b8, 0.005);
    } else if (weather === 'fog') {
      soundManager.setWeatherRain(false);
      scene.fog = new THREE.FogExp2(0xcfd8dc, 0.008);
    } else {
      soundManager.setWeatherRain(false);
      scene.fog = new THREE.FogExp2(0xd6e4f0, 0.002);
    }
  }, [timeOfDay, weather]);

  // Start game from Menu
  const handleStartGame = () => {
    setShowMenu(false);
    setIsPlaying(true);
    soundManager.init();
    soundManager.startEngine();
  };

  // Facility Interaction Handlers
  const handleTollPay = () => {
    soundManager.playTollBeep();
    setTripState((prev) => ({
      ...prev,
      tollExpenses: prev.tollExpenses + 110,
    }));
  };

  const handleFacilityModalOpen = () => {
    if (nearFacility === 'fuel') {
      setShowRefuelModal(true);
    } else if (nearFacility === 'wash') {
      setServiceModalMode('wash');
      setShowServiceModal(true);
    } else if (nearFacility === 'service') {
      setServiceModalMode('service');
      setShowServiceModal(true);
    } else if (nearFacility === 'toll') {
      handleTollPay();
    } else if (nearFacility === 'busStand') {
      physicsRef.current.toggleDoors();
      handleBoardPassengers();
    }
  };

  // Passenger boarding & conductor ticketing
  const handleBoardPassengers = () => {
    soundManager.playConductorWhistle();
    soundManager.playConductorBell();

    const newPassengers = 6 + Math.floor(Math.random() * 8);
    const addedFare = newPassengers * 85;

    setTripState((prev) => ({
      ...prev,
      passengersOnboard: Math.min(prev.maxPassengers, prev.passengersOnboard + newPassengers),
      totalFareCollected: prev.totalFareCollected + addedFare,
      tickets: [
        ...prev.tickets,
        {
          id: `t-${Date.now()}`,
          ticketNo: `00${4820 + prev.tickets.length + 1}`,
          origin: prev.currentLocationName.includes('Kurnool') ? 'Kurnool' : 'Nandyal',
          destination: 'Srisailam',
          passengerType: 'Adult',
          fare: 85,
          issueTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          seatNo: Math.min(52, prev.passengersOnboard + 1),
        },
      ],
    }));
  };

  const handleIssueTicketManual = (type: PassengerTicket['passengerType'], destination: string) => {
    soundManager.playConductorBell();
    const fare = type === 'Student' ? 45 : type === 'Senior' ? 40 : type === 'Pilgrim' ? 180 : 160;
    setTripState((prev) => ({
      ...prev,
      passengersOnboard: Math.min(prev.maxPassengers, prev.passengersOnboard + 1),
      totalFareCollected: prev.totalFareCollected + fare,
      tickets: [
        ...prev.tickets,
        {
          id: `t-${Date.now()}`,
          ticketNo: `00${4820 + prev.tickets.length + 1}`,
          origin: prev.currentLocationName.includes('Kurnool') ? 'Kurnool' : 'Nandyal',
          destination,
          passengerType: type,
          fare,
          issueTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          seatNo: Math.min(52, prev.passengersOnboard + 1),
        },
      ],
    }));
  };

  const handleFinishRefuel = (newFuel: number, cost: number) => {
    physicsRef.current.telemetry.fuelPercent = newFuel;
    setTripState((prev) => ({
      ...prev,
      fuelExpenses: prev.fuelExpenses + cost,
    }));
    setShowRefuelModal(false);
  };

  const handleFinishService = (newCondition: BusCondition, cost: number) => {
    physicsRef.current.condition = newCondition;
    setTripState((prev) => ({
      ...prev,
      serviceExpenses: prev.serviceExpenses + cost,
    }));
    setShowServiceModal(false);
  };

  const handleRestartTrip = () => {
    physicsRef.current.position.set(0, 0, 0);
    physicsRef.current.velocity.set(0, 0, 0);
    physicsRef.current.rotationY = 0;
    setShowSummaryModal(false);
    setShowMenu(true);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none">
      {/* 3D WebGL Canvas Viewport */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full" />

      {/* Primary Simulator HUD */}
      {isPlaying && (
        <>
          <HUD
            telemetry={telemetryState}
            condition={conditionState}
            trip={tripState}
            cameraMode={cameraMode}
            isMuted={isMuted}
            nearFacility={nearFacility}
            onToggleSound={() => setIsMuted(soundManager.toggleMute())}
            onToggleCamera={() =>
              setCameraMode((prev) =>
                prev === 'thirdPerson' ? 'cockpit' : prev === 'cockpit' ? 'frontBumper' : 'thirdPerson'
              )
            }
            onToggleDoors={() => physicsRef.current.toggleDoors()}
            onToggleLights={() => physicsRef.current.toggleHeadlights()}
            onToggleWipers={() => physicsRef.current.toggleWipers()}
            onToggleHorn={() => {
              soundManager.startHorn();
              setTimeout(() => soundManager.stopHorn(), 350);
            }}
            onToggleTransmission={() => {
              physicsRef.current.telemetry.automaticTransmission =
                !physicsRef.current.telemetry.automaticTransmission;
            }}
            onShiftGear={(g) => physicsRef.current.shiftGear(g)}
            onOpenTickets={() => setShowTicketsModal(true)}
            onOpenRadio={() => {
              setShowRadioModal(true);
              setIsRadioMinimized(false);
            }}
            isRadioPlaying={isRadioPlaying}
            onOpenFacilityModal={handleFacilityModalOpen}
            onThrottleStart={() => (touchThrottleRef.current = true)}
            onThrottleEnd={() => (touchThrottleRef.current = false)}
            onBrakeStart={() => (touchBrakeRef.current = true)}
            onBrakeEnd={() => (touchBrakeRef.current = false)}
            onSteer={(dir) => (touchSteerRef.current = dir)}
          />

          {/* GPS Route Minimap */}
          <Minimap
            playerZ={physicsRef.current.position.z}
            routePoints={worldRef.current?.routePoints || []}
            traffic={worldRef.current?.trafficVehicles.map((t) => t.data) || []}
          />

          {/* Quick Menu Open Button */}
          <button
            onClick={() => setShowMenu(true)}
            className="absolute top-3 left-1/2 -translate-x-1/2 bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 text-[11px] font-bold px-3 py-1 rounded-full shadow-lg backdrop-blur-sm transition"
          >
            MENU / SETTINGS
          </button>
        </>
      )}

      {/* Main Menu & Route Configuration */}
      <MainMenu
        isOpen={showMenu}
        weather={weather}
        timeOfDay={timeOfDay}
        onSetWeather={setWeather}
        onSetTimeOfDay={setTimeOfDay}
        onStartGame={handleStartGame}
        onClose={() => setShowMenu(false)}
        isGameRunning={isPlaying}
      />

      {/* Conductor ETIM Ticket Machine Modal */}
      {showTicketsModal && (
        <TicketModal
          tickets={tripState.tickets}
          totalFare={tripState.totalFareCollected}
          passengersOnboard={tripState.passengersOnboard}
          onClose={() => setShowTicketsModal(false)}
          onIssueTicket={handleIssueTicketManual}
        />
      )}

      {/* Diesel Fuel Bunk Modal */}
      {showRefuelModal && (
        <RefuelModal
          currentFuel={physicsRef.current.telemetry.fuelPercent}
          onFinishRefuel={handleFinishRefuel}
          onClose={() => setShowRefuelModal(false)}
        />
      )}

      {/* Bus Wash & Workshop Modal */}
      {showServiceModal && (
        <ServiceModal
          initialCondition={physicsRef.current.condition}
          mode={serviceModalMode}
          onUpdateCondition={handleFinishService}
          onClose={() => setShowServiceModal(false)}
        />
      )}

      {/* Trip Scorecard Summary Modal */}
      {showSummaryModal && (
        <TripSummaryModal
          trip={tripState}
          onRestart={handleRestartTrip}
          onClose={() => setShowSummaryModal(false)}
        />
      )}

      {/* Bus Cabin Radio, Folk Music & Announcements Player */}
      <BusRadioPlayer
        isOpen={showRadioModal || isRadioMinimized}
        onClose={() => {
          setShowRadioModal(false);
          setIsRadioMinimized(false);
        }}
        isMinimized={isRadioMinimized}
        onToggleMinimize={() => {
          if (!isRadioMinimized) {
            setShowRadioModal(false);
            setIsRadioMinimized(true);
          } else {
            setIsRadioMinimized(false);
            setShowRadioModal(true);
          }
        }}
      />
    </div>
  );
}
