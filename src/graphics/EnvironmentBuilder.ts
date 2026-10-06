import * as THREE from 'three';
import { RoutePoint, TrafficVehicleData, WeatherType, TimeOfDay } from '../types/game';
import { SpeedBreaker } from '../physics/BusPhysics';

export interface WorldObjects {
  scene: THREE.Scene;
  routePoints: RoutePoint[];
  speedBreakers: SpeedBreaker[];
  tollBarrier: THREE.Group | null;
  railwayBarrier: THREE.Group | null;
  trafficVehicles: Array<{
    mesh: THREE.Group;
    data: TrafficVehicleData;
  }>;
  streetLights: THREE.Light[];
  dustParticles: THREE.Points;
  rainParticles: THREE.Points;
  sunLight: THREE.DirectionalLight;
  ambientLight: THREE.AmbientLight;
  hemiLight: THREE.HemisphereLight;
}

/**
 * Creates canvas textures for road markings, Indian highway signboards, milestones, etc.
 */
function createMilestoneTexture(kmTelugu: string, kmEnglish: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Indian NH milestone standard: Yellow top (National Highway), White body
  ctx.fillStyle = '#F59E0B'; // NH Yellow
  ctx.fillRect(0, 0, 256, 160);

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 160, 256, 352);

  // Highway code
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 36px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('NH 40', 128, 100);

  // Telugu destination & distance
  ctx.fillStyle = '#111827';
  ctx.font = 'bold 34px sans-serif';
  ctx.fillText(kmTelugu, 128, 260);

  // English destination & distance
  ctx.font = 'bold 30px sans-serif';
  ctx.fillText(kmEnglish, 128, 380);

  return new THREE.CanvasTexture(canvas);
}

function createSignboardTexture(telugu: string, english: string, subtext?: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Green Highway Signboard with white border
  ctx.fillStyle = '#065F46';
  ctx.fillRect(0, 0, 512, 256);
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 10;
  ctx.strokeRect(10, 10, 492, 236);

  ctx.fillStyle = '#FEF08A';
  ctx.font = 'bold 44px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(telugu, 256, 85);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 38px sans-serif';
  ctx.fillText(english, 256, 165);

  if (subtext) {
    ctx.fillStyle = '#93C5FD';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText(subtext, 256, 220);
  }

  return new THREE.CanvasTexture(canvas);
}

export function buildEnvironment(scene: THREE.Scene): WorldObjects {
  const streetLights: THREE.Light[] = [];
  const speedBreakers: SpeedBreaker[] = [];

  // 1. Lighting Setup
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
  scene.add(ambientLight);

  const hemiLight = new THREE.HemisphereLight(0x87ceeb, 0x3d3024, 0.45);
  scene.add(hemiLight);

  const sunLight = new THREE.DirectionalLight(0xfff7ed, 1.2);
  sunLight.position.set(120, 180, 100);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 2048;
  sunLight.shadow.mapSize.height = 2048;
  sunLight.shadow.camera.near = 0.5;
  sunLight.shadow.camera.far = 450;
  const d = 160;
  sunLight.shadow.camera.left = -d;
  sunLight.shadow.camera.right = d;
  sunLight.shadow.camera.top = d;
  sunLight.shadow.camera.bottom = -d;
  scene.add(sunLight);

  // Fog for atmospheric depth and ghat mist
  scene.fog = new THREE.FogExp2(0xd6e4f0, 0.0022);

  // Ground base terrain
  const groundGeo = new THREE.PlaneGeometry(600, 3600);
  const groundMat = new THREE.MeshStandardMaterial({
    color: 0x47553b, // Andhra Deccan dry-green vegetation
    roughness: 0.9,
  });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(0, -0.05, 1200);
  ground.receiveShadow = true;
  scene.add(ground);

  // 2. Define the Complete Authentic Route (KURNOOL → NANDYAL → SRISAILAM)
  const routePoints: RoutePoint[] = [
    {
      id: 'kurnool_depot',
      name: 'Kurnool APSRTC Depot',
      teluguName: 'కర్నూలు ఆర్టీసీ డిపో',
      distanceKm: 0,
      worldZ: 0,
      type: 'depot',
      description: 'Vehicle inspection yard, fuel bunk, and bus wash facility.',
      speedLimit: 25,
    },
    {
      id: 'kurnool_stand',
      name: 'Kurnool Central Bus Stand',
      teluguName: 'కర్నూలు బస్ స్టేషన్',
      distanceKm: 2,
      worldZ: 140,
      type: 'busStand',
      description: 'Major regional terminal. Board passengers for Nandyal & Srisailam.',
      speedLimit: 30,
    },
    {
      id: 'nh40_highway',
      name: 'NH-40 Rayalaseema Highway',
      teluguName: 'ఎన్.హెచ్ 40 జాతీయ రహదారి',
      distanceKm: 22,
      worldZ: 420,
      type: 'villageStop',
      description: 'High-speed 4-lane national highway corridor.',
      speedLimit: 80,
    },
    {
      id: 'toll_plaza',
      name: 'Gargeyapuram Toll Plaza',
      teluguName: 'గారేయాపురం టోల్ ప్లాజా',
      distanceKm: 35,
      worldZ: 780,
      type: 'tollPlaza',
      description: 'FASTag electronic toll collection. Fee ₹110.',
      speedLimit: 20,
    },
    {
      id: 'orvakal_village',
      name: 'Orvakal Rock Garden Village',
      teluguName: 'ఓర్వకల్లు గ్రామం',
      distanceKm: 48,
      worldZ: 1100,
      type: 'villageStop',
      description: 'Rural village bus stop, tea stalls, and local passengers.',
      speedLimit: 40,
    },
    {
      id: 'mud_shortcut',
      name: 'Velgode Mud & Dirt Segment',
      teluguName: 'వెలుగోడు గ్రామీణ మట్టి రోడ్డు',
      distanceKm: 65,
      worldZ: 1450,
      type: 'villageStop',
      description: 'Unpaved village trail. Wet mud and slippery ruts.',
      speedLimit: 35,
    },
    {
      id: 'railway_gate',
      name: 'Nandyal Level Railway Crossing',
      teluguName: 'నంద్యాల రైల్వే గేట్',
      distanceKm: 72,
      worldZ: 1750,
      type: 'railwayCrossing',
      description: 'South Central Railway crossing with boom barriers.',
      speedLimit: 20,
    },
    {
      id: 'nandyal_stand',
      name: 'Nandyal APSRTC Bus Station',
      teluguName: 'నంద్యాల బస్ స్టేషన్',
      distanceKm: 78,
      worldZ: 1980,
      type: 'busStand',
      description: 'Major midpoint stop. Passenger interchange for pilgrims.',
      speedLimit: 30,
    },
    {
      id: 'dornala_forest',
      name: 'Nallamala Tiger Reserve Forest',
      teluguName: 'నల్లమల అటవీ చెక్‌పోస్ట్',
      distanceKm: 112,
      worldZ: 2350,
      type: 'villageStop',
      description: 'Dense deciduous forest checkpost and wildlife corridor.',
      speedLimit: 40,
    },
    {
      id: 'srisailam_ghat',
      name: 'Srisailam Ghat Hairpin Bends',
      teluguName: 'శ్రీశైలం ఘాట్ రోడ్ (హేర్‌పిన్ మలుపులు)',
      distanceKm: 138,
      worldZ: 2750,
      type: 'ghat',
      description: 'Steep hill climb with 12 hairpin bends and valley views.',
      speedLimit: 30,
    },
    {
      id: 'srisailam_temple_stand',
      name: 'Srisailam Hill Bus Station',
      teluguName: 'శ్రీశైలం దేవస్థానం బస్ స్టేషన్',
      distanceKm: 154,
      worldZ: 3200,
      type: 'terminal',
      description: 'Holy shrine destination. Final journey completion!',
      speedLimit: 25,
    },
  ];

  // 3. Procedural Road Building along Z axis
  const asphaltMat = new THREE.MeshStandardMaterial({
    color: 0x22262b,
    roughness: 0.85,
    metalness: 0.05,
  });

  const highwayMat = new THREE.MeshStandardMaterial({
    color: 0x1b1e22,
    roughness: 0.75,
  });

  const dirtMudMat = new THREE.MeshStandardMaterial({
    color: 0x5a3d28,
    roughness: 0.95,
  });

  const whiteLineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const yellowLineMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });

  // Build Road Segments
  const roadWidth = 14;
  const totalLength = 3400;

  // Segment 1: Kurnool City & Highway (Z: -50 to 1350)
  const highwayGeo = new THREE.PlaneGeometry(roadWidth, 1400);
  const highwayMesh = new THREE.Mesh(highwayGeo, highwayMat);
  highwayMesh.rotation.x = -Math.PI / 2;
  highwayMesh.position.set(0, 0.01, 650);
  highwayMesh.receiveShadow = true;
  scene.add(highwayMesh);

  // Highway Median Barrier (Z: 250 to 750)
  const medianGeo = new THREE.BoxGeometry(0.8, 0.55, 500);
  const medianMat = new THREE.MeshStandardMaterial({ color: 0x475569 });
  const median = new THREE.Mesh(medianGeo, medianMat);
  median.position.set(0, 0.28, 500);
  scene.add(median);

  // Center Lane White Markings
  for (let z = -40; z < 1350; z += 12) {
    const dashL = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 5), whiteLineMat);
    dashL.rotation.x = -Math.PI / 2;
    dashL.position.set(-3.2, 0.02, z);
    scene.add(dashL);

    const dashR = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 5), whiteLineMat);
    dashR.rotation.x = -Math.PI / 2;
    dashR.position.set(3.2, 0.02, z);
    scene.add(dashR);
  }

  // Segment 2: Mud & Dirt Shortcut (Z: 1350 to 1650)
  const mudGeo = new THREE.PlaneGeometry(roadWidth * 0.9, 300);
  const mudMesh = new THREE.Mesh(mudGeo, dirtMudMat);
  mudMesh.rotation.x = -Math.PI / 2;
  mudMesh.position.set(0, 0.01, 1500);
  mudMesh.receiveShadow = true;
  scene.add(mudMesh);

  // Segment 3: Nandyal Town & Rural Highway (Z: 1650 to 2400)
  const townRoadGeo = new THREE.PlaneGeometry(roadWidth * 0.95, 750);
  const townRoad = new THREE.Mesh(townRoadGeo, asphaltMat);
  townRoad.rotation.x = -Math.PI / 2;
  townRoad.position.set(0, 0.01, 2025);
  townRoad.receiveShadow = true;
  scene.add(townRoad);

  // Center double yellow lines for rural 2-lane road
  for (let z = 1660; z < 2400; z += 8) {
    const yl = new THREE.Mesh(new THREE.PlaneGeometry(0.15, 5), yellowLineMat);
    yl.rotation.x = -Math.PI / 2;
    yl.position.set(0, 0.02, z);
    scene.add(yl);
  }

  // Segment 4: Srisailam Ghat Road (Z: 2400 to 3300)
  // Winding serpentine mountain curves with guardrails
  const ghatGeo = new THREE.PlaneGeometry(12, 900);
  const ghatMesh = new THREE.Mesh(ghatGeo, asphaltMat);
  ghatMesh.rotation.x = -Math.PI / 2;
  ghatMesh.position.set(0, 0.01, 2850);
  scene.add(ghatMesh);

  // Ghat Mountain Rocks & Valley Cliffs
  const rockMat = new THREE.MeshStandardMaterial({
    color: 0x574838,
    roughness: 0.95,
  });

  for (let gz = 2450; gz < 3250; gz += 45) {
    // Mountain wall on the right
    const cliffGeo = new THREE.ConeGeometry(18 + Math.random() * 8, 22 + Math.random() * 15, 6);
    const cliff = new THREE.Mesh(cliffGeo, rockMat);
    cliff.position.set(22 + Math.random() * 5, 10, gz);
    cliff.castShadow = true;
    scene.add(cliff);

    // Guard rails on the left (valley side)
    const railGeo = new THREE.BoxGeometry(0.3, 0.85, 38);
    const railMat = new THREE.MeshStandardMaterial({ color: 0xef4444 }); // Red & white ghat warning rails
    const rail = new THREE.Mesh(railGeo, railMat);
    rail.position.set(-6.8, 0.42, gz);
    scene.add(rail);

    // Reflective cat-eyes studs on ghat curves
    const studGeo = new THREE.BoxGeometry(0.15, 0.06, 0.15);
    const studMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      emissive: 0xfacc15,
      emissiveIntensity: 0.5,
    });
    const stud = new THREE.Mesh(studGeo, studMat);
    stud.position.set(-6.2, 0.05, gz);
    scene.add(stud);
  }

  // 4. LOW-PROFILE SPEED BREAKERS (Prompt Rule 4: Fix speed breaker launch bug)
  // Correct realistic height (0.07m), smooth rounded profile, yellow/black stripes!
  const breakerPositions = [80, 240, 720, 1080, 1720, 1940, 2700];
  const breakerMat = new THREE.MeshStandardMaterial({
    color: 0xd97706, // Indian yellow & black hazard striped road hump
    roughness: 0.7,
  });

  breakerPositions.forEach((zPos) => {
    // Semi-cylinder profile for smooth sinusoidal wheel roll
    const breakerGeo = new THREE.CylinderGeometry(0.9, 0.9, roadWidth * 0.9, 16, 1, false, 0, Math.PI);
    const breakerMesh = new THREE.Mesh(breakerGeo, breakerMat);
    breakerMesh.rotation.z = Math.PI / 2;
    breakerMesh.position.set(0, 0.04, zPos);
    breakerMesh.scale.set(0.08, 0.95, 0.95);
    scene.add(breakerMesh);

    // Add to physics registry
    speedBreakers.push({
      z: zPos,
      width: 1.8,
      height: 0.07, // 7 cm realistic low-profile Indian IRC standard speed breaker
    });

    // Warning sign before breaker
    const signTex = createSignboardTexture('వేగ నిరోధకం', 'SPEED BREAKER', 'SLOW DOWN');
    const signMesh = new THREE.Mesh(
      new THREE.BoxGeometry(2.5, 1.4, 0.1),
      new THREE.MeshBasicMaterial({ map: signTex })
    );
    signMesh.position.set(-7.5, 2.2, zPos - 25);
    scene.add(signMesh);
  });

  // 5. KURNOOL DEPOT & FACILITIES (Starting Hub)
  // Maintenance Workshop Shed
  const shedGeo = new THREE.BoxGeometry(24, 7, 35);
  const shedMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6 });
  const workshopShed = new THREE.Mesh(shedGeo, shedMat);
  workshopShed.position.set(-22, 3.5, 15);
  workshopShed.castShadow = true;
  scene.add(workshopShed);

  const depotSignTex = createSignboardTexture('కర్నూలు ఆర్టీసీ డిపో', 'APSRTC DEPOT - KURNOOL', 'WORKSHOP & SERVICE');
  const depotSign = new THREE.Mesh(new THREE.BoxGeometry(10, 2.2, 0.1), new THREE.MeshBasicMaterial({ map: depotSignTex }));
  depotSign.position.set(-22, 7.8, 30);
  scene.add(depotSign);

  // Diesel Fuel Bunk Station (Refueling Area)
  const canopyGeo = new THREE.BoxGeometry(14, 0.6, 20);
  const canopyMat = new THREE.MeshStandardMaterial({ color: 0xd97706 });
  const canopy = new THREE.Mesh(canopyGeo, canopyMat);
  canopy.position.set(16, 5.5, 25);
  scene.add(canopy);

  // Canopy Pillars
  [-4, 4].forEach((px) => {
    [-7, 7].forEach((pz) => {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 5.5), new THREE.MeshStandardMaterial({ color: 0xffffff }));
      col.position.set(16 + px, 2.75, 25 + pz);
      scene.add(col);
    });
  });

  // Diesel Dispenser Pumps
  const pumpMat = new THREE.MeshStandardMaterial({ color: 0x059669 });
  const pump = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.2, 0.8), pumpMat);
  pump.position.set(16, 1.1, 25);
  scene.add(pump);

  const fuelSignTex = createSignboardTexture('డీజిల్ బంక్', 'DIESEL FUEL BUNK', 'HIGH SPEED DIESEL');
  const fuelSign = new THREE.Mesh(new THREE.BoxGeometry(6, 1.2, 0.1), new THREE.MeshBasicMaterial({ map: fuelSignTex }));
  fuelSign.position.set(16, 6.2, 35);
  scene.add(fuelSign);

  // Bus Wash Facility Station
  const washBayGeo = new THREE.BoxGeometry(10, 6, 16);
  const washBayMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, wireframe: false, roughness: 0.5 });
  const washBay = new THREE.Mesh(washBayGeo, washBayMat);
  washBay.position.set(-20, 3, -25);
  scene.add(washBay);

  const washSignTex = createSignboardTexture('బస్ వాష్ స్టేషన్', 'AUTOMATIC BUS WASH', 'HIGH PRESSURE FOAM');
  const washSign = new THREE.Mesh(new THREE.BoxGeometry(8, 1.5, 0.1), new THREE.MeshBasicMaterial({ map: washSignTex }));
  washSign.position.set(-20, 6.5, -16);
  scene.add(washSign);

  // 6. KURNOOL CENTRAL BUS TERMINAL (Z = 140)
  const terminalBuildingGeo = new THREE.BoxGeometry(45, 9, 20);
  const termMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.5 });
  const terminalBuilding = new THREE.Mesh(terminalBuildingGeo, termMat);
  terminalBuilding.position.set(-30, 4.5, 140);
  terminalBuilding.castShadow = true;
  scene.add(terminalBuilding);

  const kurnoolSignTex = createSignboardTexture('కర్నూలు బస్ స్టేషన్', 'KURNOOL BUS TERMINAL', 'PLATFORM 1 & 2 • APSRTC');
  const kurnoolSign = new THREE.Mesh(new THREE.BoxGeometry(22, 3, 0.15), new THREE.MeshBasicMaterial({ map: kurnoolSignTex }));
  kurnoolSign.position.set(-25, 9.5, 150);
  scene.add(kurnoolSign);

  // Bus Terminal Passenger Shelter Platform
  const platformGeo = new THREE.BoxGeometry(12, 0.4, 40);
  const platform = new THREE.Mesh(platformGeo, new THREE.MeshStandardMaterial({ color: 0x94a3b8 }));
  platform.position.set(-8.5, 0.2, 140);
  scene.add(platform);

  // 7. TOLL PLAZA (Gargeyapuram Toll Plaza at Z = 780)
  const tollCanopyGeo = new THREE.BoxGeometry(28, 0.8, 14);
  const tollCanopy = new THREE.Mesh(tollCanopyGeo, new THREE.MeshStandardMaterial({ color: 0x1e3a8a }));
  tollCanopy.position.set(0, 6.2, 780);
  scene.add(tollCanopy);

  // Toll Booth Cabins
  [-6, 0, 6].forEach((tx) => {
    const boothGeo = new THREE.BoxGeometry(2.2, 3.2, 4.5);
    const booth = new THREE.Mesh(boothGeo, new THREE.MeshStandardMaterial({ color: 0xffffff }));
    booth.position.set(tx, 1.6, 780);
    scene.add(booth);
  });

  const tollSignTex = createSignboardTexture('గారేయాపురం టోల్ ప్లాజా', 'GARGYAPURAM TOLL PLAZA', 'FASTag LANE • TOLL ₹110');
  const tollSign = new THREE.Mesh(new THREE.BoxGeometry(18, 2.4, 0.15), new THREE.MeshBasicMaterial({ map: tollSignTex }));
  tollSign.position.set(0, 7.5, 773);
  scene.add(tollSign);

  // Movable Toll Barrier Gate
  const tollBarrier = new THREE.Group();
  const barrierArmGeo = new THREE.BoxGeometry(5.5, 0.16, 0.16);
  const barrierArmMat = new THREE.MeshStandardMaterial({ color: 0xef4444 });
  const barrierArm = new THREE.Mesh(barrierArmGeo, barrierArmMat);
  barrierArm.position.x = 2.75;
  tollBarrier.add(barrierArm);
  tollBarrier.position.set(-5.5, 1.2, 783);
  scene.add(tollBarrier);

  // 8. RAILWAY CROSSING (Z = 1750)
  // Tracks crossing perpendicular to the road
  const trackMat = new THREE.MeshStandardMaterial({ color: 0x52525b, metalness: 0.8 });
  [-0.7, 0.7].forEach((oz) => {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(32, 0.18, 0.12), trackMat);
    rail.position.set(0, 0.08, 1750 + oz);
    scene.add(rail);
  });

  // Railway Boom Barrier
  const railwayBarrier = new THREE.Group();
  const rArmGeo = new THREE.BoxGeometry(7, 0.18, 0.18);
  const rArmMat = new THREE.MeshStandardMaterial({ color: 0xd97706 });
  const rArm = new THREE.Mesh(rArmGeo, rArmMat);
  rArm.position.x = 3.5;
  railwayBarrier.add(rArm);
  railwayBarrier.position.set(-6.5, 1.2, 1745);
  scene.add(railwayBarrier);

  // 9. NANDYAL BUS STATION (Z = 1980)
  const nandyalBuilding = new THREE.Mesh(new THREE.BoxGeometry(38, 8, 18), termMat);
  nandyalBuilding.position.set(28, 4, 1980);
  scene.add(nandyalBuilding);

  const nandyalSignTex = createSignboardTexture('నంద్యాల బస్ స్టేషన్', 'NANDYAL BUS STATION', 'APSRTC • SRISAILAM PLATFORM');
  const nandyalSign = new THREE.Mesh(new THREE.BoxGeometry(18, 2.5, 0.15), new THREE.MeshBasicMaterial({ map: nandyalSignTex }));
  nandyalSign.position.set(22, 8.5, 1970);
  scene.add(nandyalSign);

  // 10. SRISAILAM HILL TERMINAL (Z = 3200)
  const srisailamBuilding = new THREE.Mesh(
    new THREE.BoxGeometry(40, 9, 22),
    new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.6 }) // Temple ochre/gold
  );
  srisailamBuilding.position.set(-25, 4.5, 3200);
  scene.add(srisailamBuilding);

  const srisailamSignTex = createSignboardTexture('శ్రీశైలం దేవస్థానం బస్ స్టేషన్', 'SRISAILAM TEMPLE BUS TERMINUS', 'TRIP COMPLETE • యాత్ర సమాప్తం');
  const srisailamSign = new THREE.Mesh(new THREE.BoxGeometry(24, 3.2, 0.15), new THREE.MeshBasicMaterial({ map: srisailamSignTex }));
  srisailamSign.position.set(-22, 9.8, 3190);
  scene.add(srisailamSign);

  // 11. Environment Decor: Trees, Electric Poles, Village Huts, Milestones
  // Indian Neem & Banyan Trees
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4a2e18, roughness: 0.9 });
  const leavesMat = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.8 });
  const treeGeo = new THREE.CylinderGeometry(0.35, 0.45, 4.5);
  const foliageGeo = new THREE.DodecahedronGeometry(3.5);

  for (let tz = 20; tz < 3300; tz += 50) {
    [-18 - Math.random() * 8, 18 + Math.random() * 8].forEach((tx) => {
      const tree = new THREE.Group();
      const trunk = new THREE.Mesh(treeGeo, trunkMat);
      trunk.position.y = 2.25;
      trunk.castShadow = true;
      const foliage = new THREE.Mesh(foliageGeo, leavesMat);
      foliage.position.y = 5.5;
      foliage.castShadow = true;
      tree.add(trunk);
      tree.add(foliage);
      tree.position.set(tx, 0, tz + (Math.random() * 20 - 10));
      scene.add(tree);
    });
  }

  // Street Lights along highway and bus stands
  const poleMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.7 });
  for (let lz = 60; lz < 1000; lz += 75) {
    const pole = new THREE.Group();
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 8.5), poleMat);
    stem.position.y = 4.25;
    const arm = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.12, 0.12), poleMat);
    arm.position.set(1.1, 8.4, 0);
    pole.add(stem);
    pole.add(arm);
    pole.position.set(-8.5, 0, lz);
    scene.add(pole);

    const light = new THREE.PointLight(0xfff7ed, 0, 35, 1.8);
    light.position.set(-6.5, 8.2, lz);
    scene.add(light);
    streetLights.push(light);
  }

  // Milestones
  const milestoneMat = new THREE.MeshBasicMaterial({
    map: createMilestoneTexture('నంద్యాల 72 కి.మీ', 'NANDYAL 72 KM'),
  });
  const msMesh = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.3, 0.4), milestoneMat);
  msMesh.position.set(-7.5, 0.65, 300);
  scene.add(msMesh);

  const ms2Mesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.7, 1.3, 0.4),
    new THREE.MeshBasicMaterial({ map: createMilestoneTexture('శ్రీశైలం 82 కి.మీ', 'SRISAILAM 82 KM') })
  );
  ms2Mesh.position.set(-7.5, 0.65, 2150);
  scene.add(ms2Mesh);

  // 12. Active Indian Traffic AI Vehicles (Section 15 & 16)
  // Left-side driving! Models: Auto-rickshaw, Tata lorry truck, Sedan car, Bike, RTC Bus
  const trafficVehicles: Array<{ mesh: THREE.Group; data: TrafficVehicleData }> = [];

  function createAutoRickshaw(): THREE.Group {
    const auto = new THREE.Group();
    // Yellow hood, green body (traditional Indian CNG auto)
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.1, 2.5), new THREE.MeshStandardMaterial({ color: 0x15803d }));
    body.position.y = 0.85;
    const canopy = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.85, 2.4), new THREE.MeshStandardMaterial({ color: 0xeab308 }));
    canopy.position.y = 1.8;
    auto.add(body);
    auto.add(canopy);
    return auto;
  }

  function createTataLorry(): THREE.Group {
    const lorry = new THREE.Group();
    // Cabin with colorful decorations
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.5, 2.2), new THREE.MeshStandardMaterial({ color: 0x0284c7 }));
    cabin.position.set(0, 1.9, 2.6);
    // Cargo bed (Timber / Container body)
    const cargo = new THREE.Mesh(new THREE.BoxGeometry(2.5, 2.2, 5.5), new THREE.MeshStandardMaterial({ color: 0xb45309 }));
    cargo.position.set(0, 1.8, -1.2);
    lorry.add(cabin);
    lorry.add(cargo);
    return lorry;
  }

  function createCar(colorHex: number): THREE.Group {
    const car = new THREE.Group();
    const lower = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.75, 4.4), new THREE.MeshStandardMaterial({ color: colorHex }));
    lower.position.y = 0.55;
    const upper = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.65, 2.5), new THREE.MeshStandardMaterial({ color: 0x1e293b }));
    upper.position.set(0, 1.2, -0.3);
    car.add(lower);
    car.add(upper);
    return car;
  }

  // Populate active traffic along the road
  const trafficInitData: Array<{ type: TrafficVehicleData['type']; z: number; lane: number; dir: 1 | -1; color: string }> = [
    { type: 'auto', z: 120, lane: -2.8, dir: 1, color: '#eab308' },
    { type: 'car', z: 320, lane: -3.2, dir: 1, color: '#ffffff' },
    { type: 'lorry', z: 540, lane: 3.2, dir: -1, color: '#0284c7' }, // oncoming
    { type: 'auto', z: 680, lane: -2.5, dir: 1, color: '#eab308' },
    { type: 'car', z: 920, lane: 3.4, dir: -1, color: '#dc2626' },
    { type: 'lorry', z: 1250, lane: -3.0, dir: 1, color: '#15803d' },
    { type: 'auto', z: 1820, lane: 3.0, dir: -1, color: '#eab308' },
    { type: 'car', z: 2200, lane: -3.2, dir: 1, color: '#f3f4f6' },
    { type: 'lorry', z: 2650, lane: 3.2, dir: -1, color: '#b45309' },
    { type: 'car', z: 2950, lane: -3.0, dir: 1, color: '#059669' },
  ];

  trafficInitData.forEach((t, idx) => {
    let mesh: THREE.Group;
    if (t.type === 'auto') mesh = createAutoRickshaw();
    else if (t.type === 'lorry') mesh = createTataLorry();
    else mesh = createCar(parseInt(t.color.replace('#', '0x')));

    mesh.position.set(t.lane, 0, t.z);
    if (t.dir === -1) {
      mesh.rotation.y = Math.PI; // oncoming facing towards player
    }
    scene.add(mesh);

    trafficVehicles.push({
      mesh,
      data: {
        id: idx,
        type: t.type,
        z: t.z,
        x: t.lane,
        speed: (t.type === 'auto' ? 8 : t.type === 'lorry' ? 12 : 16) * t.dir,
        targetSpeed: (t.type === 'auto' ? 8 : t.type === 'lorry' ? 12 : 16) * t.dir,
        lane: t.lane,
        direction: t.dir,
        color: t.color,
      },
    });
  });

  // 13. Weather Particles (Rain and Dust)
  // Dust particles for mud/dirt roads
  const dustCount = 450;
  const dustGeo = new THREE.BufferGeometry();
  const dustPos = new Float32Array(dustCount * 3);
  for (let i = 0; i < dustCount * 3; i += 3) {
    dustPos[i] = (Math.random() - 0.5) * 20;
    dustPos[i + 1] = Math.random() * 2.5;
    dustPos[i + 2] = (Math.random() - 0.5) * 25;
  }
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
  const dustMat = new THREE.PointsMaterial({
    color: 0x92613d,
    size: 0.35,
    transparent: true,
    opacity: 0.0, // enabled dynamically on mud
  });
  const dustParticles = new THREE.Points(dustGeo, dustMat);
  scene.add(dustParticles);

  // Rain particles
  const rainCount = 1800;
  const rainGeo = new THREE.BufferGeometry();
  const rainPos = new Float32Array(rainCount * 3);
  for (let i = 0; i < rainCount * 3; i += 3) {
    rainPos[i] = (Math.random() - 0.5) * 60;
    rainPos[i + 1] = Math.random() * 35;
    rainPos[i + 2] = (Math.random() - 0.5) * 60;
  }
  rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
  const rainMat = new THREE.PointsMaterial({
    color: 0x93c5fd,
    size: 0.22,
    transparent: true,
    opacity: 0.0,
  });
  const rainParticles = new THREE.Points(rainGeo, rainMat);
  scene.add(rainParticles);

  return {
    scene,
    routePoints,
    speedBreakers,
    tollBarrier,
    railwayBarrier,
    trafficVehicles,
    streetLights,
    dustParticles,
    rainParticles,
    sunLight,
    ambientLight,
    hemiLight,
  };
}
