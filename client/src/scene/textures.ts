import * as THREE from 'three';

export interface ProceduralTextureSet {
  contactShadow: THREE.CanvasTexture;
  brushedRoughness: THREE.CanvasTexture;
  vernierDial: THREE.CanvasTexture;
  floorGrid: THREE.CanvasTexture;
  updateFloorGridColor: (accentHex: string, baseHex: string) => void;
  dispose: () => void;
}

export function createProceduralTextures(maxAnisotropy: number): ProceduralTextureSet {
  // 1. Soft radial contact shadow texture (linear/alpha)
  const shadowCanvas = document.createElement('canvas');
  shadowCanvas.width = 256;
  shadowCanvas.height = 256;
  const sCtx = shadowCanvas.getContext('2d')!;
  const grad = sCtx.createRadialGradient(128, 128, 12, 128, 128, 124);
  grad.addColorStop(0, 'rgba(0, 0, 0, 0.78)');
  grad.addColorStop(0.45, 'rgba(0, 0, 0, 0.36)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0.0)');
  sCtx.fillStyle = grad;
  sCtx.fillRect(0, 0, 256, 256);
  const contactShadow = new THREE.CanvasTexture(shadowCanvas);
  contactShadow.needsUpdate = true;

  // 2. Brushed micro-grain roughness texture (NoColorSpace - linear data)
  const brushCanvas = document.createElement('canvas');
  brushCanvas.width = 512;
  brushCanvas.height = 512;
  const bCtx = brushCanvas.getContext('2d')!;
  bCtx.fillStyle = '#808080';
  bCtx.fillRect(0, 0, 512, 512);
  for (let y = 0; y < 512; y++) {
    const streak = 112 + Math.floor(Math.sin(y * 1.73) * 18 + Math.cos(y * 0.41) * 14);
    bCtx.fillStyle = `rgb(${streak}, ${streak}, ${streak})`;
    bCtx.fillRect(0, y, 512, 1);
  }
  for (let i = 0; i < 650; i++) {
    const x = (i * 97) % 512;
    const y = (i * 53) % 512;
    const w = 24 + (i % 64);
    const v = 96 + (i % 48);
    bCtx.fillStyle = `rgba(${v}, ${v}, ${v}, 0.25)`;
    bCtx.fillRect(x, y, w, 1);
  }
  const brushedRoughness = new THREE.CanvasTexture(brushCanvas);
  brushedRoughness.wrapS = THREE.RepeatWrapping;
  brushedRoughness.wrapT = THREE.RepeatWrapping;
  brushedRoughness.repeat.set(3, 3);
  brushedRoughness.anisotropy = maxAnisotropy;
  brushedRoughness.needsUpdate = true;

  // 3. Precision Vernier degree markings texture (sRGB color map)
  const dialCanvas = document.createElement('canvas');
  dialCanvas.width = 2048;
  dialCanvas.height = 256;
  const dCtx = dialCanvas.getContext('2d')!;
  dCtx.fillStyle = '#151922';
  dCtx.fillRect(0, 0, 2048, 256);

  // Subtle horizontal metallic bands
  dCtx.fillStyle = '#1f2633';
  dCtx.fillRect(0, 28, 2048, 6);
  dCtx.fillRect(0, 222, 2048, 6);

  dCtx.strokeStyle = '#e5b869';
  dCtx.fillStyle = '#f3d49b';
  dCtx.font = '500 22px "JetBrains Mono", monospace';
  dCtx.textAlign = 'center';
  dCtx.textBaseline = 'middle';

  const totalTicks = 180;
  for (let i = 0; i < totalTicks; i++) {
    const x = (i / totalTicks) * 2048;
    const isMajor = i % 15 === 0;
    const isMed = i % 5 === 0;
    dCtx.lineWidth = isMajor ? 3 : 1.5;
    const topY = isMajor ? 56 : isMed ? 76 : 94;
    const botY = isMajor ? 156 : isMed ? 142 : 130;
    dCtx.beginPath();
    dCtx.moveTo(x, topY);
    dCtx.lineTo(x, botY);
    dCtx.stroke();

    if (isMajor) {
      const deg = Math.round((i / totalTicks) * 360);
      dCtx.fillText(`${String(deg).padStart(3, '0')}°`, x, 192);
    }
  }
  const vernierDial = new THREE.CanvasTexture(dialCanvas);
  vernierDial.colorSpace = THREE.SRGBColorSpace;
  vernierDial.wrapS = THREE.RepeatWrapping;
  vernierDial.wrapT = THREE.ClampToEdgeWrapping;
  vernierDial.anisotropy = maxAnisotropy;
  vernierDial.needsUpdate = true;

  // 4. Architectural floor subtle grid texture (sRGB)
  const gridCanvas = document.createElement('canvas');
  gridCanvas.width = 512;
  gridCanvas.height = 512;
  const gCtx = gridCanvas.getContext('2d')!;

  const drawFloorGrid = (accentHex: string, baseHex: string) => {
    gCtx.fillStyle = baseHex;
    gCtx.fillRect(0, 0, 512, 512);

    // Subtle micro-grid
    gCtx.strokeStyle = accentHex;
    gCtx.globalAlpha = 0.25;
    gCtx.lineWidth = 1;
    const step = 64;
    for (let i = 0; i <= 512; i += step) {
      gCtx.beginPath();
      gCtx.moveTo(i, 0);
      gCtx.lineTo(i, 512);
      gCtx.stroke();

      gCtx.beginPath();
      gCtx.moveTo(0, i);
      gCtx.lineTo(512, i);
      gCtx.stroke();
    }

    // Major architectural framing lines
    gCtx.globalAlpha = 0.55;
    gCtx.lineWidth = 2;
    gCtx.strokeRect(1, 1, 510, 510);

    // Corner crosshair ticks
    gCtx.globalAlpha = 0.85;
    gCtx.beginPath();
    gCtx.moveTo(0, 14);
    gCtx.lineTo(0, 0);
    gCtx.lineTo(14, 0);
    gCtx.stroke();
    gCtx.globalAlpha = 1.0;
  };

  drawFloorGrid('#27344a', '#0e131d');
  const floorGrid = new THREE.CanvasTexture(gridCanvas);
  floorGrid.colorSpace = THREE.SRGBColorSpace;
  floorGrid.wrapS = THREE.RepeatWrapping;
  floorGrid.wrapT = THREE.RepeatWrapping;
  floorGrid.repeat.set(36, 36);
  floorGrid.anisotropy = maxAnisotropy;
  floorGrid.needsUpdate = true;

  return {
    contactShadow,
    brushedRoughness,
    vernierDial,
    floorGrid,
    updateFloorGridColor: (accentHex: string, baseHex: string) => {
      drawFloorGrid(accentHex, baseHex);
      floorGrid.needsUpdate = true;
    },
    dispose: () => {
      contactShadow.dispose();
      brushedRoughness.dispose();
      vernierDial.dispose();
      floorGrid.dispose();
    },
  };
}
