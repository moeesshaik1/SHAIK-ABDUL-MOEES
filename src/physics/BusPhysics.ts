import * as THREE from 'three';
import { BusTelemetry, BusCondition, RoadSurfaceType } from '../types/game';
import { soundManager } from '../audio/SoundManager';

export interface SpeedBreaker {
  z: number;
  width: number;
  height: number;
}

export class BusPhysics {
  public position: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  public velocity: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  public rotationY: number = 0; // heading angle in radians
  public roll: number = 0; // cornering roll
  public pitch: number = 0; // acceleration/braking pitch
  public suspensionY: number = 0;

  public telemetry: BusTelemetry = {
    speedKmh: 0,
    rpm: 750,
    gear: 1,
    maxGears: 6,
    automaticTransmission: true,
    throttle: 0,
    brake: 0,
    steering: 0,
    airPressureBar: 8.5,
    engineTempC: 82,
    fuelPercent: 88,
    headlights: false,
    highBeam: false,
    leftIndicator: false,
    rightIndicator: false,
    hazardLights: false,
    interiorLights: false,
    doorsOpen: false,
    wipersActive: false,
    hornActive: false,
    currentSurface: 'asphalt',
    inclineAngle: 0,
    speedBreakerBump: 0,
  };

  public condition: BusCondition = {
    engine: 92,
    brakes: 94,
    tyres: 88,
    body: 96,
    cleanliness: 85,
  };

  // Speed breakers along the road
  public speedBreakers: SpeedBreaker[] = [];

  // Gear transmission ratios (Ashok Leyland 6-speed synchromesh gearbox)
  private gearRatios: { [key: number]: number } = {
    [-1]: -6.8, // Reverse
    0: 0,       // Neutral
    1: 7.2,     // 1st Gear (High torque crawler/starting)
    2: 4.3,     // 2nd Gear
    3: 2.7,     // 3rd Gear
    4: 1.8,     // 4th Gear
    5: 1.25,    // 5th Gear
    6: 0.85,    // 6th Gear (Highway overdrive)
  };

  // Max speeds per gear in km/h
  private maxSpeedPerGear: { [key: number]: number } = {
    [-1]: 18,
    0: 0,
    1: 22,
    2: 38,
    3: 56,
    4: 76,
    5: 95,
    6: 115,
  };

  private lastBrakeActive: boolean = false;
  private airCompressorPumping: boolean = false;
  private bumpImpulse: number = 0;

  constructor(initialZ: number = 0) {
    this.position.set(0, 0, initialZ);
  }

  public update(
    dt: number,
    inputThrottle: number,
    inputBrake: number,
    inputSteer: number,
    handbrake: boolean = false
  ) {
    if (!Number.isFinite(dt) || dt <= 0) return;
    dt = Math.min(dt, 0.1);

    // Clamp inputs
    const throttleInput = Math.max(0, Math.min(1, inputThrottle));
    let brakeInput = Math.max(0, Math.min(1, inputBrake));
    if (handbrake) brakeInput = 1.0;

    // Safety interlock: Cannot throttle if passenger doors are open!
    let effectiveThrottle = throttleInput;
    if (this.telemetry.doorsOpen) {
      effectiveThrottle = 0;
    }

    // Steering smoothing & speed sensitivity (heavy bus turns slower at high speeds)
    const currentSpeed = Math.abs(this.velocity.z);
    const speedRatio = Math.min(currentSpeed / 25, 1);
    const maxSteerAngle = 0.52 - speedRatio * 0.28; // radians
    const targetSteer = inputSteer * maxSteerAngle;
    this.telemetry.steering += (targetSteer - this.telemetry.steering) * Math.min(1, dt * 6.0);
    if (!Number.isFinite(this.telemetry.steering)) this.telemetry.steering = 0;

    // Road surface friction modifier
    let surfaceGrip = 1.0;
    switch (this.telemetry.currentSurface) {
      case 'asphalt':
      case 'highway':
        surfaceGrip = 1.0;
        break;
      case 'villageTar':
        surfaceGrip = 0.92;
        break;
      case 'wetAsphalt':
        surfaceGrip = 0.72;
        break;
      case 'dirt':
        surfaceGrip = 0.62;
        break;
      case 'mud':
        surfaceGrip = 0.44; // significant wheel slip in mud!
        break;
      case 'ghat':
        surfaceGrip = 0.88;
        break;
    }

    // Tyre condition affects grip
    surfaceGrip *= (0.7 + (Math.max(0, this.condition.tyres) / 100) * 0.3);

    // Incline resistance (Ghat roads slope up or down)
    const inclineForce = -Math.sin(this.telemetry.inclineAngle * (Math.PI / 180)) * 9.81 * 1.8;

    // Transmission & Automatic Gear logic
    if (this.telemetry.automaticTransmission) {
      const speedKmh = currentSpeed * 3.6;
      if (this.velocity.z < -0.5 && effectiveThrottle === 0 && brakeInput > 0.2) {
        // Reverse if braking while stopped or moving backward
        this.telemetry.gear = -1;
      } else if (this.telemetry.gear === -1 && speedKmh < 1 && effectiveThrottle > 0) {
        this.telemetry.gear = 1;
      } else if (this.telemetry.gear > 0) {
        if (speedKmh < 16) this.telemetry.gear = 1;
        else if (speedKmh < 32) this.telemetry.gear = 2;
        else if (speedKmh < 50) this.telemetry.gear = 3;
        else if (speedKmh < 68) this.telemetry.gear = 4;
        else if (speedKmh < 88) this.telemetry.gear = 5;
        else this.telemetry.gear = 6;
      }
    }

    // Engine Power Calculation (Ashok Leyland H-series 6-cylinder diesel: 160 HP, 550 Nm torque)
    const currentGearRatio = this.gearRatios[this.telemetry.gear] || 1;
    const maxGearSpeed = Math.max(10, this.maxSpeedPerGear[this.telemetry.gear] || 25);
    const speedRatioInGear = Math.min(1, (currentSpeed * 3.6) / maxGearSpeed);

    // RPM model: 750 (idle) to 2400 (max)
    let targetRpm = 750;
    if (this.telemetry.gear === 0) {
      targetRpm = 750 + effectiveThrottle * 1650;
    } else {
      targetRpm = 750 + speedRatioInGear * 1450 + effectiveThrottle * 350;
    }
    this.telemetry.rpm += (targetRpm - this.telemetry.rpm) * Math.min(1, dt * 7);
    if (!Number.isFinite(this.telemetry.rpm)) this.telemetry.rpm = 750;

    // Engine drive force (heavy inertia)
    const baseTorque = 14.5 * (Math.max(10, this.condition.engine) / 100);
    let driveForce = 0;
    if (this.telemetry.gear > 0) {
      const gearMultiplier = Math.max(0.6, currentGearRatio / 2.2);
      driveForce = effectiveThrottle * baseTorque * gearMultiplier * surfaceGrip;
    } else if (this.telemetry.gear === -1) {
      driveForce = -effectiveThrottle * baseTorque * 1.5 * surfaceGrip;
    }

    // Air Brake simulation
    if (brakeInput > 0.1) {
      if (!this.lastBrakeActive) {
        soundManager.playAirBrakeHiss();
      }
      this.lastBrakeActive = true;
      // Air depletion
      this.telemetry.airPressureBar = Math.max(2.5, this.telemetry.airPressureBar - brakeInput * dt * 0.18);
    } else {
      this.lastBrakeActive = false;
      // Compressor rebuilds air pressure up to 8.5 bar
      if (this.telemetry.airPressureBar < 8.5) {
        this.telemetry.airPressureBar = Math.min(8.5, this.telemetry.airPressureBar + dt * 0.28);
      }
    }
    if (!Number.isFinite(this.telemetry.airPressureBar)) this.telemetry.airPressureBar = 8.5;

    // Brake efficiency depends on air pressure and brake pad condition
    const airEfficiency = Math.min(1.0, this.telemetry.airPressureBar / 6.0);
    const brakeForce = brakeInput * 24.0 * (Math.max(10, this.condition.brakes) / 100) * airEfficiency * surfaceGrip;

    // Aerodynamic and rolling drag (rolling resistance only opposes motion when actually moving)
    const rollingResistance = currentSpeed > 0.05 ? 1.2 : 0;
    const drag = 0.05 * currentSpeed * currentSpeed;

    // Forward Acceleration
    let netForwardAccel = 0;
    if (this.telemetry.gear > 0) {
      netForwardAccel = driveForce - drag - (this.velocity.z > 0 ? rollingResistance : 0) + inclineForce;
      if (currentSpeed > 0.1 && brakeForce > 0) {
        netForwardAccel -= brakeForce;
      }
    } else if (this.telemetry.gear === -1) {
      netForwardAccel = driveForce + drag + (this.velocity.z < 0 ? rollingResistance : 0) + inclineForce;
      if (currentSpeed > 0.1 && brakeForce > 0) {
        netForwardAccel += brakeForce;
      }
    } else {
      // Neutral coasting
      netForwardAccel = -Math.sign(this.velocity.z) * (drag + rollingResistance) + inclineForce;
      if (brakeForce > 0) {
        netForwardAccel -= Math.sign(this.velocity.z) * brakeForce;
      }
    }

    // Integrate forward velocity
    this.velocity.z += netForwardAccel * dt;

    // Zero out velocity when stopped and braking or idling near zero
    if (Math.abs(this.velocity.z) < 0.25 && (brakeInput > 0.2 || (effectiveThrottle === 0 && Math.abs(inclineForce) < 0.5))) {
      this.velocity.z = 0;
    }
    if (!Number.isFinite(this.velocity.z)) this.velocity.z = 0;

    // Bus Heading Steering (turning angle proportional to forward velocity)
    if (Math.abs(this.velocity.z) > 0.1) {
      const turnRate = this.telemetry.steering * (this.velocity.z / 6.0) * (surfaceGrip > 0.5 ? 1 : 0.6);
      this.rotationY += turnRate * dt;
    }
    if (!Number.isFinite(this.rotationY)) this.rotationY = 0;

    // Lateral friction / tire grip (prevent excessive sideways sliding while allowing mild mud slip)
    this.velocity.x *= (1 - Math.min(1, dt * (surfaceGrip > 0.5 ? 9.0 : 3.5)));
    if (!Number.isFinite(this.velocity.x)) this.velocity.x = 0;

    // Forward motion according to heading
    const forwardX = Math.sin(this.rotationY) * this.velocity.z;
    const forwardZ = Math.cos(this.rotationY) * this.velocity.z;

    this.position.x += (forwardX + this.velocity.x) * dt;
    this.position.z += forwardZ * dt;
    if (!Number.isFinite(this.position.x)) this.position.x = 0;
    if (!Number.isFinite(this.position.z)) this.position.z = 0;

    // Update telemetry speed
    this.telemetry.speedKmh = Math.abs(this.velocity.z) * 3.6;
    if (!Number.isFinite(this.telemetry.speedKmh)) this.telemetry.speedKmh = 0;
    this.telemetry.throttle = effectiveThrottle;
    this.telemetry.brake = brakeInput;

    // Realistic Speed Breaker Fix (Smooth rounded profile, compression, NEVER catapult bus into air)
    this.checkSpeedBreakers(dt);

    // Body roll when cornering (inertia leans bus outward)
    const lateralG = (this.telemetry.steering * currentSpeed * 0.15);
    const targetRoll = -lateralG * 0.08;
    this.roll += (targetRoll - this.roll) * Math.min(1, dt * 5.0);
    if (!Number.isFinite(this.roll)) this.roll = 0;

    // Body pitch when accelerating/braking
    const targetPitch = (netForwardAccel * 0.012);
    this.pitch += (targetPitch - this.pitch) * Math.min(1, dt * 4.0);
    if (!Number.isFinite(this.pitch)) this.pitch = 0;

    // Suspension vertical movement
    this.suspensionY += (this.bumpImpulse - this.suspensionY) * Math.min(1, dt * 8.0);
    this.bumpImpulse *= (1 - Math.min(1, dt * 10.0));
    if (!Number.isFinite(this.suspensionY)) this.suspensionY = 0;

    // Engine temperature and fuel consumption
    const fuelBurnRate = (0.0004 + effectiveThrottle * 0.0012 + (this.telemetry.speedKmh / 120) * 0.0008) * dt;
    this.telemetry.fuelPercent = Math.max(0, this.telemetry.fuelPercent - fuelBurnRate);
    if (!Number.isFinite(this.telemetry.fuelPercent)) this.telemetry.fuelPercent = 88;

    const targetTemp = 82 + effectiveThrottle * 12 + (this.telemetry.inclineAngle > 3 ? 10 : 0);
    this.telemetry.engineTempC += (targetTemp - this.telemetry.engineTempC) * (dt * 0.04);
    if (!Number.isFinite(this.telemetry.engineTempC)) this.telemetry.engineTempC = 82;

    // Bus cleanliness decreases faster on mud or rainy roads
    let dirtAccumulation = 0.002 * (this.telemetry.speedKmh / 60) * dt;
    if (this.telemetry.currentSurface === 'mud') dirtAccumulation *= 6.0;
    else if (this.telemetry.currentSurface === 'dirt') dirtAccumulation *= 3.0;
    this.condition.cleanliness = Math.max(10, this.condition.cleanliness - dirtAccumulation);
    if (!Number.isFinite(this.condition.cleanliness)) this.condition.cleanliness = 85;

    // Audio sync
    soundManager.updateEngine(this.telemetry.rpm, effectiveThrottle, this.telemetry.speedKmh);
  }

  /**
   * CRITICAL SPEED BREAKER LOGIC:
   * Replaces crude high-jump colliders with realistic low-profile smooth sinusoidal compression.
   * Low speed: Smooth suspension compression.
   * Medium speed: Noticeable thud and cabin shake.
   * High speed: Strong suspension reaction, but the bus remains firmly grounded on the tarmac!
   */
  private checkSpeedBreakers(dt: number) {
    const currentZ = this.position.z;
    const speed = Math.abs(this.velocity.z);

    for (const breaker of this.speedBreakers) {
      const dist = Math.abs(currentZ - breaker.z);
      if (dist < breaker.width / 2) {
        // Bus is currently traversing the speed breaker profile
        // Cosine hump shape profile from 0 to peak height
        const normalizedPos = (dist / (breaker.width / 2));
        const humpProfile = 0.5 * (1 + Math.cos(normalizedPos * Math.PI)); // 0 to 1
        const physicalHeight = breaker.height * humpProfile;

        // Controlled vertical impulse (max 0.12m bump, dampened)
        this.bumpImpulse = Math.min(0.12, physicalHeight * 0.8 + (speed / 15) * 0.04);

        // Sound trigger
        if (speed > 1.0 && Math.abs(currentZ - breaker.z) < 0.6 && this.telemetry.speedBreakerBump === 0) {
          const intensity = Math.min(1.0, speed / 12.0);
          soundManager.playSpeedBreakerThud(intensity);
          this.telemetry.speedBreakerBump = intensity;
        }

        // Low deceleration bump resistance (doesn't launch into air, but absorbs kinetic energy)
        if (speed > 5) {
          this.velocity.z *= 0.985;
        }
        return;
      }
    }

    this.telemetry.speedBreakerBump = 0;
  }

  public shiftGear(gear: number) {
    if (gear >= -1 && gear <= this.telemetry.maxGears) {
      this.telemetry.gear = gear;
      soundManager.playDoorSound(false); // subtle gear clunk
    }
  }

  public toggleDoors() {
    this.telemetry.doorsOpen = !this.telemetry.doorsOpen;
    soundManager.playDoorSound(this.telemetry.doorsOpen);
  }

  public toggleHeadlights() {
    this.telemetry.headlights = !this.telemetry.headlights;
  }

  public toggleWipers() {
    this.telemetry.wipersActive = !this.telemetry.wipersActive;
  }
}
