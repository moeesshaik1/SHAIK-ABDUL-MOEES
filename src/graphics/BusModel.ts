import * as THREE from 'three';

/**
 * Creates dynamic canvas textures for authentic APSRTC bus livery,
 * destination boards in Telugu & English, license plates, and dashboard.
 */
function createLiveryTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Upper body off-white / cream
  ctx.fillStyle = '#F4EFE6';
  ctx.fillRect(0, 0, 1024, 256);

  // Lower body APSRTC iconic rich red / maroon
  ctx.fillStyle = '#A31820';
  ctx.fillRect(0, 256, 1024, 256);

  // Classic golden-yellow and green accent racing stripes
  ctx.fillStyle = '#F5A623';
  ctx.fillRect(0, 235, 1024, 14);

  ctx.fillStyle = '#1D7A46';
  ctx.fillRect(0, 249, 1024, 7);

  // APSRTC Side English lettering
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 36px "Segoe UI", Arial, sans-serif';
  ctx.fillText('A.P.S.R.T.C', 60, 320);

  ctx.fillStyle = '#FDE047';
  ctx.font = 'bold 22px "Segoe UI", Arial, sans-serif';
  ctx.fillText('PALLE VELUGU', 60, 360);

  ctx.fillStyle = '#E2E8F0';
  ctx.font = '600 16px "Segoe UI", Arial, sans-serif';
  ctx.fillText('ANDHRA PRADESH STATE ROAD TRANSPORT CORPORATION', 60, 400);

  // Telugu side emblem text
  ctx.fillStyle = '#FDF6B2';
  ctx.font = 'bold 24px "Segoe UI", Arial, sans-serif';
  ctx.fillText('ఆంధ్రప్రదేశ్ రాష్ట్ర రోడ్డు రవాణా సంస్థ', 60, 440);

  // Telugu depot name
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 18px "Segoe UI", Arial, sans-serif';
  ctx.fillText('కర్నూలు డిపో (KURNOOL DEPOT) • AP-21-Z-1048', 60, 480);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

function createDestinationBoardTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Destination board background (traditional dark green or deep blue board with bright yellow/white text)
  ctx.fillStyle = '#064E3B'; // Forest Green
  ctx.fillRect(0, 0, 1024, 256);

  // Yellow border
  ctx.strokeStyle = '#FACC15';
  ctx.lineWidth = 10;
  ctx.strokeRect(8, 8, 1008, 240);

  // Telugu destination header
  ctx.fillStyle = '#FEF08A';
  ctx.font = 'bold 58px "Noto Sans Telugu", "Segoe UI", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('కర్నూలు ➔ నంద్యాల ➔ శ్రీశైలం', 512, 90);

  // English route title
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 50px "Segoe UI", Arial, sans-serif';
  ctx.fillText('KURNOOL ➔ NANDYAL ➔ SRISAILAM', 512, 170);

  // Express badge
  ctx.fillStyle = '#EF4444';
  ctx.fillRect(400, 195, 224, 46);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 26px "Segoe UI", Arial, sans-serif';
  ctx.fillText('EXPRESS SERVICE', 512, 228);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

function createLicensePlateTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  // Yellow commercial vehicle background
  ctx.fillStyle = '#FBBF24';
  ctx.fillRect(0, 0, 512, 128);

  // Black border
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 8;
  ctx.strokeRect(6, 6, 500, 116);

  // Plate text
  ctx.fillStyle = '#111827';
  ctx.font = 'bold 54px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('AP 21 Z 1234', 256, 85);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export interface BusRig {
  root: THREE.Group;
  busBody: THREE.Group;
  steeringWheel: THREE.Mesh;
  frontDoorLeft: THREE.Mesh;
  frontDoorRight: THREE.Mesh;
  rearDoorLeft: THREE.Mesh;
  rearDoorRight: THREE.Mesh;
  wiperLeft: THREE.Group;
  wiperRight: THREE.Group;
  wheelFL: THREE.Group;
  wheelFR: THREE.Group;
  wheelRL: THREE.Group;
  wheelRR: THREE.Group;
  headlightL: THREE.SpotLight;
  headlightR: THREE.SpotLight;
  headlightGlowMat: THREE.MeshStandardMaterial;
  brakeLightMat: THREE.MeshStandardMaterial;
  leftIndicatorMat: THREE.MeshStandardMaterial;
  rightIndicatorMat: THREE.MeshStandardMaterial;
  interiorLight: THREE.PointLight;
  cameraTarget: THREE.Object3D;
  driverViewTarget: THREE.Object3D;
  frontBumperTarget: THREE.Object3D;
  dirtMat: THREE.MeshStandardMaterial;
}

export function buildAPRTCBus(): BusRig {
  const root = new THREE.Group();
  root.name = 'Player_AP_RTC_Bus';

  // 1. Bus Body Group
  const busBody = new THREE.Group();
  busBody.name = 'BusBody';
  root.add(busBody);

  // Materials
  const liveryTex = createLiveryTexture();
  const destBoardTex = createDestinationBoardTexture();
  const plateTex = createLicensePlateTexture();

  const bodyMat = new THREE.MeshStandardMaterial({
    map: liveryTex,
    roughness: 0.35,
    metalness: 0.15,
  });

  const bodyRedMat = new THREE.MeshStandardMaterial({
    color: 0x9e171f, // APSRTC deep crimson
    roughness: 0.3,
    metalness: 0.1,
  });

  const roofMat = new THREE.MeshStandardMaterial({
    color: 0xf5f3ee, // Off-white / cream roof
    roughness: 0.4,
    metalness: 0.05,
  });

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x64748b,
    transparent: true,
    opacity: 0.45,
    roughness: 0.1,
    transmission: 0.6,
    thickness: 0.2,
  });

  const rubberMat = new THREE.MeshStandardMaterial({
    color: 0x1f2421,
    roughness: 0.9,
    metalness: 0.05,
  });

  const chromeMat = new THREE.MeshStandardMaterial({
    color: 0xd4d4d8,
    roughness: 0.2,
    metalness: 0.8,
  });

  const interiorMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.7,
  });

  const seatRexineMat = new THREE.MeshStandardMaterial({
    color: 0x1e3a8a, // Navy blue passenger seats
    roughness: 0.6,
  });

  // Dirt overlay material
  const dirtMat = new THREE.MeshStandardMaterial({
    color: 0x78350f,
    roughness: 0.95,
    transparent: true,
    opacity: 0.0,
  });

  // Lights Materials
  const headlightGlowMat = new THREE.MeshStandardMaterial({
    color: 0xfffbeb,
    emissive: 0x000000,
    emissiveIntensity: 0.0,
    roughness: 0.2,
  });

  const brakeLightMat = new THREE.MeshStandardMaterial({
    color: 0x991b1b,
    emissive: 0x000000,
    emissiveIntensity: 0.0,
    roughness: 0.3,
  });

  const leftIndicatorMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: 0x000000,
    emissiveIntensity: 0.0,
    roughness: 0.3,
  });

  const rightIndicatorMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: 0x000000,
    emissiveIntensity: 0.0,
    roughness: 0.3,
  });

  // Realistic Bus Dimensions (Ashok Leyland Viking / Tata 1512 APSRTC specification)
  // Length: 11.2m, Width: 2.5m, Height: 3.2m
  const busLength = 11.2;
  const busWidth = 2.5;
  const busHeight = 2.8;
  const groundOffset = 0.85;

  // Main Outer Shell
  const mainBodyGeo = new THREE.BoxGeometry(busWidth, busHeight, busLength);
  const mainBody = new THREE.Mesh(mainBodyGeo, bodyMat);
  mainBody.position.y = groundOffset + busHeight / 2;
  mainBody.castShadow = true;
  mainBody.receiveShadow = true;
  busBody.add(mainBody);

  // Roof Crown (Curved aerofoil roof)
  const roofGeo = new THREE.CylinderGeometry(busWidth * 0.52, busWidth * 0.52, busLength * 0.98, 16, 1, false, 0, Math.PI);
  const roof = new THREE.Mesh(roofGeo, roofMat);
  roof.rotation.z = Math.PI / 2;
  roof.rotation.y = Math.PI / 2;
  roof.position.set(0, groundOffset + busHeight + 0.12, 0);
  roof.castShadow = true;
  busBody.add(roof);

  // Roof Luggage Carrier Rails & Back Ladder
  const rackGeo = new THREE.BoxGeometry(busWidth * 0.78, 0.25, busLength * 0.55);
  const rack = new THREE.Mesh(rackGeo, rubberMat);
  rack.position.set(0, groundOffset + busHeight + 0.35, -0.6);
  busBody.add(rack);

  // Back Ladder
  const ladderGeo = new THREE.BoxGeometry(0.35, 2.2, 0.08);
  const ladder = new THREE.Mesh(ladderGeo, chromeMat);
  ladder.position.set(busWidth * 0.38, groundOffset + busHeight * 0.5, -busLength / 2 - 0.06);
  busBody.add(ladder);

  // Heavy Front Bumper
  const frontBumperGeo = new THREE.BoxGeometry(busWidth + 0.12, 0.45, 0.4);
  const frontBumper = new THREE.Mesh(frontBumperGeo, rubberMat);
  frontBumper.position.set(0, groundOffset + 0.22, busLength / 2 + 0.18);
  frontBumper.castShadow = true;
  busBody.add(frontBumper);

  // Heavy Rear Bumper
  const rearBumperGeo = new THREE.BoxGeometry(busWidth + 0.1, 0.45, 0.35);
  const rearBumper = new THREE.Mesh(rearBumperGeo, rubberMat);
  rearBumper.position.set(0, groundOffset + 0.22, -busLength / 2 - 0.15);
  rearBumper.castShadow = true;
  busBody.add(rearBumper);

  // Front Windshield (Angled, split classic Indian RTC double glass)
  const windshieldGeo = new THREE.PlaneGeometry(busWidth * 0.92, 1.25);
  const windshield = new THREE.Mesh(windshieldGeo, glassMat);
  windshield.position.set(0, groundOffset + 1.85, busLength / 2 + 0.03);
  windshield.rotation.x = -0.06;
  busBody.add(windshield);

  // Windshield Center Rubber Divider
  const centerBeadGeo = new THREE.BoxGeometry(0.06, 1.25, 0.05);
  const centerBead = new THREE.Mesh(centerBeadGeo, rubberMat);
  centerBead.position.set(0, groundOffset + 1.85, busLength / 2 + 0.05);
  busBody.add(centerBead);

  // Rear Windshield
  const rearWindowGeo = new THREE.PlaneGeometry(busWidth * 0.85, 0.95);
  const rearWindow = new THREE.Mesh(rearWindowGeo, glassMat);
  rearWindow.position.set(0, groundOffset + 2.0, -busLength / 2 - 0.02);
  rearWindow.rotation.y = Math.PI;
  busBody.add(rearWindow);

  // Side Passenger Windows (Left & Right)
  const numSideWindows = 6;
  const windowSpacing = busLength * 0.135;
  for (let i = 0; i < numSideWindows; i++) {
    const zOffset = -busLength * 0.32 + i * windowSpacing;
    // Right side window
    const winGeo = new THREE.PlaneGeometry(1.15, 0.88);
    const winR = new THREE.Mesh(winGeo, glassMat);
    winR.position.set(busWidth / 2 + 0.02, groundOffset + 1.85, zOffset);
    winR.rotation.y = Math.PI / 2;
    busBody.add(winR);

    // Silver aluminum window frame
    const frameGeo = new THREE.BoxGeometry(0.04, 0.92, 1.2);
    const frameR = new THREE.Mesh(frameGeo, chromeMat);
    frameR.position.set(busWidth / 2 + 0.01, groundOffset + 1.85, zOffset);
    busBody.add(frameR);

    // Left side window
    const winL = new THREE.Mesh(winGeo, glassMat);
    winL.position.set(-busWidth / 2 - 0.02, groundOffset + 1.85, zOffset);
    winL.rotation.y = -Math.PI / 2;
    busBody.add(winL);

    const frameL = new THREE.Mesh(frameGeo, chromeMat);
    frameL.position.set(-busWidth / 2 - 0.01, groundOffset + 1.85, zOffset);
    busBody.add(frameL);
  }

  // Front Destination Board (Mounted above windshield)
  const destBoardGeo = new THREE.BoxGeometry(busWidth * 0.88, 0.48, 0.06);
  const destBoardMat = new THREE.MeshBasicMaterial({ map: destBoardTex });
  const destBoard = new THREE.Mesh(destBoardGeo, destBoardMat);
  destBoard.position.set(0, groundOffset + 2.65, busLength / 2 + 0.04);
  busBody.add(destBoard);

  // Rear Destination Route Tag
  const rearDestBoardGeo = new THREE.BoxGeometry(busWidth * 0.6, 0.32, 0.05);
  const rearDestBoard = new THREE.Mesh(rearDestBoardGeo, destBoardMat);
  rearDestBoard.position.set(0, groundOffset + 2.58, -busLength / 2 - 0.03);
  rearDestBoard.rotation.y = Math.PI;
  busBody.add(rearDestBoard);

  // Number Plates (Front & Back)
  const plateGeo = new THREE.PlaneGeometry(0.75, 0.22);
  const plateMat = new THREE.MeshBasicMaterial({ map: plateTex });

  const frontPlate = new THREE.Mesh(plateGeo, plateMat);
  frontPlate.position.set(0, groundOffset + 0.22, busLength / 2 + 0.4);
  busBody.add(frontPlate);

  const rearPlate = new THREE.Mesh(plateGeo, plateMat);
  rearPlate.position.set(0, groundOffset + 0.22, -busLength / 2 - 0.34);
  rearPlate.rotation.y = Math.PI;
  busBody.add(rearPlate);

  // 2. Headlights & Taillights
  // Front Headlights (Dual round classic Ashok Leyland lights on each side)
  const headGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.08, 16);
  headGeo.rotateX(Math.PI / 2);

  const headL = new THREE.Mesh(headGeo, headlightGlowMat);
  headL.position.set(-0.85, groundOffset + 0.65, busLength / 2 + 0.04);
  busBody.add(headL);

  const headR = new THREE.Mesh(headGeo, headlightGlowMat);
  headR.position.set(0.85, groundOffset + 0.65, busLength / 2 + 0.04);
  busBody.add(headR);

  // Functional SpotLights for Night Driving
  const headlightL = new THREE.SpotLight(0xfff7ed, 0, 55, Math.PI / 5, 0.35, 1.2);
  headlightL.position.set(-0.85, groundOffset + 0.65, busLength / 2 + 0.1);
  const targetL = new THREE.Object3D();
  targetL.position.set(-0.85, groundOffset + 0.2, busLength / 2 + 35);
  busBody.add(headlightL);
  busBody.add(targetL);
  headlightL.target = targetL;

  const headlightR = new THREE.SpotLight(0xfff7ed, 0, 55, Math.PI / 5, 0.35, 1.2);
  headlightR.position.set(0.85, groundOffset + 0.65, busLength / 2 + 0.1);
  const targetR = new THREE.Object3D();
  targetR.position.set(0.85, groundOffset + 0.2, busLength / 2 + 35);
  busBody.add(headlightR);
  busBody.add(targetR);
  headlightR.target = targetR;

  // Tail / Brake Lights (Triple vertical lamps: Indicator, Brake, Reverse)
  const tailGeo = new THREE.BoxGeometry(0.12, 0.28, 0.06);
  const tailL = new THREE.Mesh(tailGeo, brakeLightMat);
  tailL.position.set(-1.0, groundOffset + 0.65, -busLength / 2 - 0.02);
  busBody.add(tailL);

  const tailR = new THREE.Mesh(tailGeo, brakeLightMat);
  tailR.position.set(1.0, groundOffset + 0.65, -busLength / 2 - 0.02);
  busBody.add(tailR);

  // Indicators (Front corners & Rear corners)
  const indGeo = new THREE.BoxGeometry(0.14, 0.12, 0.06);
  const indFL = new THREE.Mesh(indGeo, leftIndicatorMat);
  indFL.position.set(-1.12, groundOffset + 0.65, busLength / 2 + 0.02);
  busBody.add(indFL);

  const indFR = new THREE.Mesh(indGeo, rightIndicatorMat);
  indFR.position.set(1.12, groundOffset + 0.65, busLength / 2 + 0.02);
  busBody.add(indFR);

  const indRL = new THREE.Mesh(indGeo, leftIndicatorMat);
  indRL.position.set(-1.12, groundOffset + 0.65, -busLength / 2 - 0.02);
  busBody.add(indRL);

  const indRR = new THREE.Mesh(indGeo, rightIndicatorMat);
  indRR.position.set(1.12, groundOffset + 0.65, -busLength / 2 - 0.02);
  busBody.add(indRR);

  // Rear-view side mirrors with stalks
  const mirrorStalkGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.65);
  const mirrorPlateGeo = new THREE.BoxGeometry(0.25, 0.5, 0.04);

  // Left Mirror
  const stalkL = new THREE.Mesh(mirrorStalkGeo, chromeMat);
  stalkL.rotation.z = Math.PI / 2.6;
  stalkL.position.set(-busWidth / 2 - 0.22, groundOffset + 2.05, busLength / 2 - 0.2);
  busBody.add(stalkL);

  const mirrorL = new THREE.Mesh(mirrorPlateGeo, rubberMat);
  mirrorL.position.set(-busWidth / 2 - 0.42, groundOffset + 2.15, busLength / 2 - 0.2);
  mirrorL.rotation.y = 0.25;
  busBody.add(mirrorL);

  // Right Mirror
  const stalkR = new THREE.Mesh(mirrorStalkGeo, chromeMat);
  stalkR.rotation.z = -Math.PI / 2.6;
  stalkR.position.set(busWidth / 2 + 0.22, groundOffset + 2.05, busLength / 2 - 0.2);
  busBody.add(stalkR);

  const mirrorR = new THREE.Mesh(mirrorPlateGeo, rubberMat);
  mirrorR.position.set(busWidth / 2 + 0.42, groundOffset + 2.15, busLength / 2 - 0.2);
  mirrorR.rotation.y = -0.25;
  busBody.add(mirrorR);

  // 3. Animated Doors (Front Door and Rear Door on Left Side - Indian Standard)
  // Left side is passenger entry/exit (driving on left)
  const doorWidth = 0.46;
  const doorHeight = 1.95;
  const doorGeo = new THREE.BoxGeometry(0.04, doorHeight, doorWidth);

  // Front Door Leaf 1 & 2
  const frontDoorLeft = new THREE.Mesh(doorGeo, bodyRedMat);
  frontDoorLeft.position.set(-busWidth / 2 - 0.01, groundOffset + doorHeight / 2 + 0.08, busLength * 0.38 - 0.23);
  busBody.add(frontDoorLeft);

  const frontDoorRight = new THREE.Mesh(doorGeo, bodyRedMat);
  frontDoorRight.position.set(-busWidth / 2 - 0.01, groundOffset + doorHeight / 2 + 0.08, busLength * 0.38 + 0.23);
  busBody.add(frontDoorRight);

  // Rear Door Leaf 1 & 2
  const rearDoorLeft = new THREE.Mesh(doorGeo, bodyRedMat);
  rearDoorLeft.position.set(-busWidth / 2 - 0.01, groundOffset + doorHeight / 2 + 0.08, -busLength * 0.28 - 0.23);
  busBody.add(rearDoorLeft);

  const rearDoorRight = new THREE.Mesh(doorGeo, bodyRedMat);
  rearDoorRight.position.set(-busWidth / 2 - 0.01, groundOffset + doorHeight / 2 + 0.08, -busLength * 0.28 + 0.23);
  busBody.add(rearDoorRight);

  // 4. Animated Windshield Wipers
  const wiperLeft = new THREE.Group();
  wiperLeft.position.set(-0.4, groundOffset + 1.28, busLength / 2 + 0.06);
  const wiperBladeGeo = new THREE.BoxGeometry(0.03, 0.75, 0.03);
  const wiperMeshL = new THREE.Mesh(wiperBladeGeo, rubberMat);
  wiperMeshL.position.y = 0.38;
  wiperLeft.add(wiperMeshL);
  busBody.add(wiperLeft);

  const wiperRight = new THREE.Group();
  wiperRight.position.set(0.4, groundOffset + 1.28, busLength / 2 + 0.06);
  const wiperMeshR = new THREE.Mesh(wiperBladeGeo, rubberMat);
  wiperMeshR.position.y = 0.38;
  wiperRight.add(wiperMeshR);
  busBody.add(wiperRight);

  // 5. Interior & Driver Cabin
  const cabin = new THREE.Group();
  cabin.name = 'DriverCabin';
  busBody.add(cabin);

  // Dashboard Table
  const dashGeo = new THREE.BoxGeometry(busWidth * 0.85, 0.75, 0.95);
  const dash = new THREE.Mesh(dashGeo, interiorMat);
  dash.position.set(0, groundOffset + 1.15, busLength / 2 - 0.7);
  cabin.add(dash);

  // Driver Seat (Right side for Indian RHD)
  const seatBaseGeo = new THREE.BoxGeometry(0.55, 0.45, 0.55);
  const seatBackGeo = new THREE.BoxGeometry(0.55, 0.85, 0.15);
  const driverSeat = new THREE.Group();
  driverSeat.name = 'DriverSeat';
  const seatBase = new THREE.Mesh(seatBaseGeo, seatRexineMat);
  const seatBack = new THREE.Mesh(seatBackGeo, seatRexineMat);
  seatBack.position.set(0, 0.55, -0.22);
  driverSeat.add(seatBase);
  driverSeat.add(seatBack);
  // In India, driver sits on the RIGHT
  driverSeat.position.set(0.68, groundOffset + 0.7, busLength / 2 - 1.55);
  cabin.add(driverSeat);

  // Functional Steering Wheel (Rotates with steering)
  const steerWheelGeo = new THREE.TorusGeometry(0.24, 0.035, 12, 28);
  const steeringWheel = new THREE.Mesh(steerWheelGeo, rubberMat);
  steeringWheel.name = 'SteeringWheel';
  // Column
  const steerColGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.7);
  const steerCol = new THREE.Mesh(steerColGeo, chromeMat);
  steerCol.position.y = -0.3;
  steerCol.rotation.x = -0.3;
  steeringWheel.add(steerCol);

  steeringWheel.position.set(0.68, groundOffset + 1.45, busLength / 2 - 1.15);
  steeringWheel.rotation.x = 0.55;
  cabin.add(steeringWheel);

  // Passenger Seats (Rows of seats on both sides of central aisle)
  const passengerSeatsGroup = new THREE.Group();
  passengerSeatsGroup.name = 'PassengerSeats';
  const numRows = 7;
  for (let r = 0; r < numRows; r++) {
    const rowZ = busLength * 0.22 - r * 1.1;
    // Left pair of seats
    const seatL = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.75, 0.5), seatRexineMat);
    seatL.position.set(-0.68, groundOffset + 0.75, rowZ);
    passengerSeatsGroup.add(seatL);

    // Right pair of seats
    const seatR = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.75, 0.5), seatRexineMat);
    seatR.position.set(0.68, groundOffset + 0.75, rowZ);
    passengerSeatsGroup.add(seatR);
  }
  busBody.add(passengerSeatsGroup);

  // Interior Night Lamp
  const interiorLight = new THREE.PointLight(0xfff1b8, 0, 14, 1.5);
  interiorLight.position.set(0, groundOffset + 2.5, 0);
  busBody.add(interiorLight);

  // 6. Wheels (Front Left, Front Right, Rear Left Dual, Rear Right Dual)
  function createWheel(isRearDual: boolean): THREE.Group {
    const wheelGroup = new THREE.Group();
    const tyreRadius = 0.54;
    const tyreWidth = isRearDual ? 0.52 : 0.28;

    const tyreGeo = new THREE.CylinderGeometry(tyreRadius, tyreRadius, tyreWidth, 24);
    tyreGeo.rotateZ(Math.PI / 2);
    const tyre = new THREE.Mesh(tyreGeo, rubberMat);
    tyre.castShadow = true;
    wheelGroup.add(tyre);

    // Metallic Rim with Lug Nuts
    const rimRadius = tyreRadius * 0.62;
    const rimGeo = new THREE.CylinderGeometry(rimRadius, rimRadius, tyreWidth + 0.02, 16);
    rimGeo.rotateZ(Math.PI / 2);
    const rim = new THREE.Mesh(rimGeo, chromeMat);
    wheelGroup.add(rim);

    // Center Hub Cap (Red APSRTC style)
    const hubGeo = new THREE.CylinderGeometry(rimRadius * 0.38, rimRadius * 0.38, tyreWidth + 0.06, 12);
    hubGeo.rotateZ(Math.PI / 2);
    const hub = new THREE.Mesh(hubGeo, bodyRedMat);
    wheelGroup.add(hub);

    return wheelGroup;
  }

  const wheelFL = createWheel(false);
  wheelFL.name = 'Wheel_FL';
  wheelFL.position.set(-busWidth / 2 - 0.05, 0.54, busLength * 0.32);
  root.add(wheelFL);

  const wheelFR = createWheel(false);
  wheelFR.name = 'Wheel_FR';
  wheelFR.position.set(busWidth / 2 + 0.05, 0.54, busLength * 0.32);
  root.add(wheelFR);

  const wheelRL = createWheel(true);
  wheelRL.name = 'Wheel_RL';
  wheelRL.position.set(-busWidth / 2 - 0.12, 0.54, -busLength * 0.28);
  root.add(wheelRL);

  const wheelRR = createWheel(true);
  wheelRR.name = 'Wheel_RR';
  wheelRR.position.set(busWidth / 2 + 0.12, 0.54, -busLength * 0.28);
  root.add(wheelRR);

  // 7. Camera Targets
  // Chase third person target
  const cameraTarget = new THREE.Object3D();
  cameraTarget.name = 'CameraTarget';
  cameraTarget.position.set(0, groundOffset + 1.2, 0);
  root.add(cameraTarget);

  // Cockpit Driver View target (Right hand driver seat eye level looking forward)
  const driverViewTarget = new THREE.Object3D();
  driverViewTarget.name = 'DriverViewTarget';
  driverViewTarget.position.set(0.68, groundOffset + 1.75, busLength / 2 - 1.45);
  busBody.add(driverViewTarget);

  // Front Bumper Camera target
  const frontBumperTarget = new THREE.Object3D();
  frontBumperTarget.name = 'FrontBumperTarget';
  frontBumperTarget.position.set(0, groundOffset + 0.7, busLength / 2 + 0.6);
  busBody.add(frontBumperTarget);

  return {
    root,
    busBody,
    steeringWheel,
    frontDoorLeft,
    frontDoorRight,
    rearDoorLeft,
    rearDoorRight,
    wiperLeft,
    wiperRight,
    wheelFL,
    wheelFR,
    wheelRL,
    wheelRR,
    headlightL,
    headlightR,
    headlightGlowMat,
    brakeLightMat,
    leftIndicatorMat,
    rightIndicatorMat,
    interiorLight,
    cameraTarget,
    driverViewTarget,
    frontBumperTarget,
    dirtMat,
  };
}
