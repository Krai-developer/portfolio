export type CameraPreset = 'workspace' | 'holograms' | 'structures';

export interface Vec3Tuple {
  x: number;
  y: number;
  z: number;
}

export interface MouseNdc {
  x: number; // -1 to 1
  y: number; // -1 to 1
}

export interface CameraPose {
  position: Vec3Tuple;
  target: Vec3Tuple;
  fov: number;
  cyanLightMultiplier: number;
  amberLightMultiplier: number;
  fogDensity: number;
}

export interface PanelTransform {
  position: Vec3Tuple;
  rotation: Vec3Tuple;
}

export interface ContactFormInput {
  name: string;
  email: string;
  projectType: string;
  message: string;
}

export interface ContactValidationResult {
  valid: boolean;
  errors: Partial<Record<keyof ContactFormInput, string>>;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function smoothstep(t: number): number {
  const c = clamp(t, 0, 1);
  return c * c * (3 - 2 * c);
}

/**
 * Frame-rate independent exponential damping.
 */
export function dampValue(
  current: number,
  target: number,
  lambda: number,
  dt: number,
): number {
  if (dt <= 0) return current;
  const factor = 1 - Math.exp(-lambda * Math.min(dt, 0.1));
  return current + (target - current) * factor;
}

/**
 * Computes the desired 3D camera pose and atmosphere shift from scroll progress,
 * active camera preset, viewport aspect ratio, and normalized mouse coordinates.
 *
 * Desktop framing offsets the camera target slightly left (-X) so the hero
 * workstation and holographic screens sit cleanly on the right side of the frame,
 * leaving breathing room for the left-aligned Hero typography.
 */
export function computeScrollCameraPose(
  rawScrollProgress: number,
  preset: CameraPreset,
  viewportAspect: number,
  mouse: MouseNdc,
  reducedMotion: boolean,
): CameraPose {
  const scroll = clamp(rawScrollProgress, 0, 1);
  const easedScroll = smoothstep(scroll);
  const isCompact = viewportAspect < 1.15;

  // Base preset anchors (tuned for wide desktop with right-weighted workstation)
  let basePos: Vec3Tuple;
  let baseTarget: Vec3Tuple;
  let baseFov: number;

  if (preset === 'holograms') {
    basePos = isCompact ? { x: 0.0, y: 1.85, z: 6.4 } : { x: -1.1, y: 1.98, z: 4.15 };
    baseTarget = isCompact ? { x: 0.0, y: 1.72, z: -0.2 } : { x: -0.1, y: 1.88, z: -0.22 };
    baseFov = isCompact ? 50 : 42;
  } else if (preset === 'structures') {
    basePos = isCompact ? { x: 0.25, y: 2.45, z: 6.9 } : { x: -0.2, y: 2.42, z: 4.9 };
    baseTarget = isCompact ? { x: 0.05, y: 2.15, z: -0.3 } : { x: 0.0, y: 2.28, z: -0.32 };
    baseFov = isCompact ? 52 : 44;
  } else {
    // Full-frame centered diagonal 3/4 composition matching the reference image edge-to-edge
    // (pulled back cleanly so full desk, legs, chair, warm amber bar, and right shelves are visible)
    basePos = isCompact ? { x: -0.32, y: 1.68, z: 7.8 } : { x: -1.18, y: 1.66, z: 6.45 };
    baseTarget = isCompact ? { x: 0.0, y: 1.62, z: -0.24 } : { x: -0.15, y: 1.62, z: -0.24 };
    baseFov = isCompact ? 52 : 46;
  }

  // Scroll choreography: glide forward and gently orbit across the holographic workspace.
  const scrollPosOffset: Vec3Tuple = {
    x: lerp(0, isCompact ? 0.38 : 1.25, easedScroll),
    y: lerp(0, 0.42, easedScroll),
    z: lerp(0, -1.55, easedScroll),
  };

  const scrollTargetOffset: Vec3Tuple = {
    x: lerp(0, isCompact ? 0.18 : 0.92, easedScroll),
    y: lerp(0, 0.24, easedScroll),
    z: lerp(0, -0.58, easedScroll),
  };

  // Mouse parallax (disabled when reducedMotion is active)
  const mx = reducedMotion ? 0 : clamp(mouse.x, -1, 1);
  const my = reducedMotion ? 0 : clamp(mouse.y, -1, 1);
  const parallaxStrength = isCompact ? 0.16 : 0.36;

  const position: Vec3Tuple = {
    x: basePos.x + scrollPosOffset.x + mx * parallaxStrength,
    y: basePos.y + scrollPosOffset.y + my * (parallaxStrength * 0.52),
    z: basePos.z + scrollPosOffset.z - Math.abs(mx) * 0.1,
  };

  const target: Vec3Tuple = {
    x: baseTarget.x + scrollTargetOffset.x + mx * 0.15,
    y: baseTarget.y + scrollTargetOffset.y + my * 0.09,
    z: baseTarget.z + scrollTargetOffset.z,
  };

  const fov = baseFov + lerp(0, 4.2, easedScroll);
  const cyanLightMultiplier = lerp(1.0, 1.28, easedScroll);
  const amberLightMultiplier = lerp(1.0, 0.85, easedScroll);
  const fogDensity = lerp(0.034, 0.05, easedScroll);

  return {
    position,
    target,
    fov,
    cyanLightMultiplier,
    amberLightMultiplier,
    fogDensity,
  };
}

/**
 * Computes responsive 3D position and rotation offsets for an individual
 * holographic panel based on mouse position, scroll progress, and idle time.
 */
export function computePanelParallaxTransform(
  basePos: Vec3Tuple,
  baseRot: Vec3Tuple,
  mouse: MouseNdc,
  scrollProgress: number,
  depthFactor: number,
  elapsed: number,
  phase: number,
  reducedMotion: boolean,
): PanelTransform {
  const scroll = smoothstep(clamp(scrollProgress, 0, 1));
  const mx = reducedMotion ? 0 : clamp(mouse.x, -1, 1);
  const my = reducedMotion ? 0 : clamp(mouse.y, -1, 1);

  const floatY = reducedMotion ? 0 : Math.sin(elapsed * 1.15 + phase) * 0.045;
  const floatZ = reducedMotion ? 0 : Math.cos(elapsed * 0.85 + phase) * 0.025;

  // Spread panels outward slightly as camera moves in during scroll
  const spreadSign = basePos.x >= 0 ? 1 : -1;
  const scrollShiftX = spreadSign * scroll * 0.42 * depthFactor;
  const scrollShiftY = scroll * 0.24 * depthFactor;
  const scrollShiftZ = scroll * 0.28 * depthFactor;

  return {
    position: {
      x: basePos.x + mx * 0.14 * depthFactor + scrollShiftX,
      y: basePos.y + my * 0.09 * depthFactor + floatY + scrollShiftY,
      z: basePos.z + floatZ + scrollShiftZ,
    },
    rotation: {
      x: baseRot.x - my * 0.07 * depthFactor,
      y: baseRot.y + mx * 0.11 * depthFactor - spreadSign * scroll * 0.12,
      z: baseRot.z,
    },
  };
}

/**
 * Deterministic normalized [0, 1) travel progress along a neural network spline.
 */
export function computePulseAlongCurve(
  elapsed: number,
  phase: number,
  speed: number,
): number {
  const raw = (elapsed * speed + phase) % 1;
  return raw < 0 ? raw + 1 : raw;
}

/**
 * Validates the contact form input before submitting.
 */
export function validateContactForm(
  input: ContactFormInput,
): ContactValidationResult {
  const errors: Partial<Record<keyof ContactFormInput, string>> = {};
  const trimmedName = input.name.trim();
  const trimmedEmail = input.email.trim();
  const trimmedMessage = input.message.trim();

  if (trimmedName.length < 2) {
    errors.name = 'Please enter your name (at least 2 characters).';
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailPattern.test(trimmedEmail)) {
    errors.email = 'Please enter a valid email address.';
  }

  if (trimmedMessage.length < 10) {
    errors.message = 'Please share a brief note about your project (at least 10 characters).';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
