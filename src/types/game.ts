export type WeatherType = 'clear' | 'cloudy' | 'rain' | 'fog';
export type TimeOfDay = 'morning' | 'day' | 'evening' | 'night';
export type CameraMode = 'thirdPerson' | 'cockpit' | 'frontBumper' | 'cinematic';
export type RoadSurfaceType = 'asphalt' | 'wetAsphalt' | 'highway' | 'villageTar' | 'mud' | 'dirt' | 'ghat';

export interface RoutePoint {
  id: string;
  name: string;
  teluguName: string;
  distanceKm: number;
  worldZ: number; // Z-coordinate in 3D world
  type: 'depot' | 'busStand' | 'villageStop' | 'tollPlaza' | 'railwayCrossing' | 'fuelStation' | 'washStation' | 'ghat' | 'terminal';
  description: string;
  speedLimit: number;
}

export interface BusCondition {
  engine: number; // 0 - 100%
  brakes: number; // 0 - 100%
  tyres: number; // 0 - 100%
  body: number; // 0 - 100%
  cleanliness: number; // 0 - 100%
}

export interface BusTelemetry {
  speedKmh: number;
  rpm: number;
  gear: number; // -1 for Reverse, 0 for Neutral, 1 to 6
  maxGears: number;
  automaticTransmission: boolean;
  throttle: number;
  brake: number;
  steering: number;
  airPressureBar: number; // normal ~8.5 bar
  engineTempC: number;
  fuelPercent: number; // 0 - 100%
  headlights: boolean;
  highBeam: boolean;
  leftIndicator: boolean;
  rightIndicator: boolean;
  hazardLights: boolean;
  interiorLights: boolean;
  doorsOpen: boolean;
  wipersActive: boolean;
  hornActive: boolean;
  currentSurface: RoadSurfaceType;
  inclineAngle: number; // degrees
  speedBreakerBump: number; // vertical impulse
}

export interface PassengerTicket {
  id: string;
  ticketNo: string;
  origin: string;
  destination: string;
  passengerType: 'Adult' | 'Student' | 'Senior' | 'Pilgrim';
  fare: number;
  issueTime: string;
  seatNo: number;
}

export interface TripState {
  currentStageIndex: number;
  origin: string;
  destination: string;
  currentLocationName: string;
  currentTeluguName: string;
  nextStopName: string;
  nextStopDistanceKm: number;
  totalDistanceKm: number;
  traveledKm: number;
  passengersOnboard: number;
  maxPassengers: number;
  totalFareCollected: number;
  fuelExpenses: number;
  tollExpenses: number;
  serviceExpenses: number;
  departureTime: string;
  elapsedSeconds: number;
  tickets: PassengerTicket[];
  drivingScore: number; // 0 - 100
  violations: string[];
  isTripCompleted: boolean;
}

export interface TrafficVehicleData {
  id: number;
  type: 'auto' | 'lorry' | 'car' | 'bike' | 'rtcBus';
  z: number;
  x: number;
  speed: number;
  targetSpeed: number;
  lane: number; // 0 = left lane, 1 = right/overtake lane
  direction: 1 | -1; // 1 = forward (same direction), -1 = oncoming
  color: string;
}

export interface ServiceShopItem {
  id: string;
  name: string;
  teluguName: string;
  cost: number;
  durationMs: number;
  restorePart: keyof BusCondition;
  restoreAmount: number;
}
