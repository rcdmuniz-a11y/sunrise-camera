/**
 * Default event frames for Sunrise 3.0
 * Recreated with SVG vector art replicating "Marco Vertical.png" and "Marco Horizontal.png"
 */

export function getVerticalFrameSvg(): string {
  // 1080 x 1920 px (9:16 Vertical Story / Event Format)
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1920" width="1080" height="1920">
  <defs>
    <linearGradient id="vOceanGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#145da0" />
      <stop offset="25%" stop-color="#0e4480" />
      <stop offset="100%" stop-color="#092852" />
    </linearGradient>

    <linearGradient id="vSunGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffb300" />
      <stop offset="100%" stop-color="#f57c00" />
    </linearGradient>

    <linearGradient id="vBrushGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#f57c00" />
      <stop offset="60%" stop-color="#ff9800" />
      <stop offset="100%" stop-color="#f57c00" />
    </linearGradient>

    <filter id="vSunGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="16" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>

    <filter id="vShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#000" flood-opacity="0.45" />
    </filter>
  </defs>

  <!-- Transparent upper 65% for live camera feed -->

  <!-- Organic Wave Crest Overlay (Foam & Deep Ocean) -->
  <g id="wave_container">
    <!-- Back Foam / Water splash shadow -->
    <path d="M 0,1380 C 180,1310 340,1330 520,1390 C 720,1460 900,1430 1080,1410 L 1080,1920 L 0,1920 Z" fill="#0b386b" opacity="0.6" />
    
    <!-- Primary Ocean Wave -->
    <path d="M 0,1400 C 160,1330 360,1330 540,1420 C 720,1500 890,1460 1080,1430 L 1080,1920 L 0,1920 Z" fill="url(#vOceanGrad)" />

    <!-- Wave foam crest highlights -->
    <path d="M 0,1400 C 160,1330 360,1330 540,1420 C 720,1500 890,1460 1080,1430" fill="none" stroke="#60a5fa" stroke-width="5" stroke-dasharray="12 16" opacity="0.5" />
    <path d="M 0,1408 C 160,1338 360,1338 540,1428 C 720,1508 890,1468 1080,1438" fill="none" stroke="#ffffff" stroke-width="3" stroke-dasharray="6 24" opacity="0.75" />
  </g>

  <!-- BRANDING ELEMENTS: SUNRISE 3.0 (Left Side) -->
  <g id="sunrise_logo" transform="translate(60, 1310)" filter="url(#vShadow)">
    <!-- Sunburst Glow & Sea Icons Aura -->
    <circle cx="160" cy="90" r="110" fill="#ffffff" opacity="0.35" filter="url(#vSunGlow)" />
    <g opacity="0.75" stroke="#ffffff" stroke-width="3" fill="none">
      <!-- Starfish / shell icons in aura -->
      <circle cx="90" cy="50" r="14" stroke-width="2.5" />
      <line x1="90" y1="36" x2="90" y2="64" stroke-width="2" />
      <circle cx="135" cy="25" r="12" stroke-width="2.5" />
      <path d="M 170,15 L 185,38 L 210,38 L 190,52 L 198,75 L 175,60 L 152,75 L 160,52 L 140,38 L 165,38 Z" fill="#ffffff" opacity="0.6" transform="scale(0.5) translate(190,-10)" />
      <circle cx="230" cy="55" r="15" stroke-width="2.5" />
    </g>

    <!-- "SUN" Text in vibrant Orange with clean white outline -->
    <g font-family="system-ui, -apple-system, sans-serif" font-weight="900">
      <!-- Shadow/stroke outline for high contrast on any photo background -->
      <text x="35" y="195" font-size="160" fill="#ffffff" letter-spacing="4">SUN</text>
      <text x="35" y="195" font-size="160" fill="url(#vSunGrad)" stroke="#ffffff" stroke-width="9" stroke-linejoin="round" letter-spacing="4">SUN</text>

      <!-- "RISE" in pristine bold White with blue depth -->
      <text x="35" y="380" font-size="200" fill="#092852" letter-spacing="6">RISE</text>
      <text x="35" y="375" font-size="200" fill="#ffffff" stroke="#0e4480" stroke-width="6" stroke-linejoin="round" letter-spacing="6">RISE</text>

      <!-- "3.0" in bright Sunrise Orange -->
      <text x="360" y="390" font-size="82" fill="#ff9800" stroke="#ffffff" stroke-width="5" stroke-linejoin="round">3.0</text>
    </g>
  </g>

  <!-- CAMPAIGN BADGE: # GUARDIANES DEL MAR (Right Side) -->
  <g id="guardianes_del_mar" transform="translate(520, 1540)" filter="url(#vShadow)">
    <!-- Orange brush stroke background -->
    <path d="M 30,50 Q 80,10 260,20 Q 420,15 480,55 Q 500,85 470,115 Q 350,140 180,130 Q 10,125 30,50 Z" fill="url(#vBrushGrad)" />
    <!-- Distressed paint brush edges -->
    <path d="M 15,65 Q 5,80 25,95 L 35,65 Z" fill="#f57c00" />
    <path d="M 480,50 Q 515,65 490,95 L 470,80 Z" fill="#ff9800" />

    <!-- Text: GUARDIANES -->
    <text x="145" y="70" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="44" fill="#ffffff" letter-spacing="3" text-anchor="start">GUARDIANES</text>
    
    <!-- Text: #DEL MAR (Ocean Blue) -->
    <text x="75" y="118" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="52" fill="#092852" letter-spacing="4"># DEL MAR</text>
  </g>
</svg>`;
}

export function getHorizontalFrameSvg(): string {
  // 1920 x 1080 px (16:9 Horizontal / Landscape Format)
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="1920" height="1080">
  <defs>
    <linearGradient id="hOceanGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#145da0" />
      <stop offset="25%" stop-color="#0e4480" />
      <stop offset="100%" stop-color="#092852" />
    </linearGradient>

    <linearGradient id="hSunGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffb300" />
      <stop offset="100%" stop-color="#f57c00" />
    </linearGradient>

    <linearGradient id="hBrushGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#f57c00" />
      <stop offset="60%" stop-color="#ff9800" />
      <stop offset="100%" stop-color="#f57c00" />
    </linearGradient>

    <filter id="hSunGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="14" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>

    <filter id="hShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="5" stdDeviation="6" flood-color="#000" flood-opacity="0.4" />
    </filter>
  </defs>

  <!-- Transparent upper 70% for camera feed -->

  <!-- Wave Band across the bottom -->
  <g id="h_wave_container">
    <path d="M 0,780 C 350,710 750,760 1100,790 C 1450,820 1700,770 1920,750 L 1920,1080 L 0,1080 Z" fill="#0b386b" opacity="0.6" />
    <path d="M 0,800 C 350,730 750,780 1100,810 C 1450,840 1700,790 1920,770 L 1920,1080 L 0,1080 Z" fill="url(#hOceanGrad)" />
    
    <!-- Foam crest lines -->
    <path d="M 0,800 C 350,730 750,780 1100,810 C 1450,840 1700,790 1920,770" fill="none" stroke="#60a5fa" stroke-width="5" stroke-dasharray="14 18" opacity="0.5" />
    <path d="M 0,806 C 350,736 750,786 1100,816 C 1450,846 1700,796 1920,776" fill="none" stroke="#ffffff" stroke-width="3" stroke-dasharray="6 20" opacity="0.75" />
  </g>

  <!-- LEFT: SUNRISE 3.0 -->
  <g id="h_sunrise_logo" transform="translate(60, 740)" filter="url(#hShadow)">
    <circle cx="150" cy="80" r="100" fill="#ffffff" opacity="0.3" filter="url(#hSunGlow)" />
    
    <g font-family="system-ui, -apple-system, sans-serif" font-weight="900">
      <!-- SUN -->
      <text x="30" y="160" font-size="130" fill="url(#hSunGrad)" stroke="#ffffff" stroke-width="8" stroke-linejoin="round" letter-spacing="4">SUN</text>
      <!-- RISE -->
      <text x="30" y="295" font-size="150" fill="#ffffff" stroke="#0e4480" stroke-width="6" stroke-linejoin="round" letter-spacing="4">RISE</text>
      <!-- 3.0 -->
      <text x="270" y="305" font-size="64" fill="#ff9800" stroke="#ffffff" stroke-width="4">3.0</text>
    </g>
  </g>

  <!-- CENTER: DÍA INTERNACIONAL DE LIMPIEZA DE PLAYAS -->
  <g id="center_campaign_badge" transform="translate(560, 840)" filter="url(#hShadow)">
    <!-- Pill background container -->
    <rect x="0" y="0" width="760" height="150" rx="36" fill="#082b54" stroke="#1d4ed8" stroke-width="3" opacity="0.95" />
    
    <text x="380" y="58" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="34" fill="#ffffff" text-anchor="middle" letter-spacing="3">
      DÍA INTERNACIONAL DE
    </text>
    <text x="380" y="118" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="48" fill="#fbbf24" text-anchor="middle" letter-spacing="4">
      LIMPIEZA DE PLAYAS
    </text>
  </g>

  <!-- RIGHT: # GUARDIANES DEL MAR -->
  <g id="h_guardianes_badge" transform="translate(1360, 850)" filter="url(#hShadow)">
    <!-- Brush badge -->
    <path d="M 20,40 Q 60,10 240,15 Q 430,12 490,45 Q 510,75 480,105 Q 360,125 180,120 Q 5,115 20,40 Z" fill="url(#hBrushGrad)" />
    
    <text x="160" y="60" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="38" fill="#ffffff" letter-spacing="2">GUARDIANES</text>
    <text x="70" y="105" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="46" fill="#092852" letter-spacing="3"># DEL MAR</text>
  </g>
</svg>`;
}

export function svgToDataUrl(svgString: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
}

/**
 * Converts an SVG string or loaded image to a transparent PNG Blob
 */
export async function createPngFromSvg(svgString: string, width: number, height: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas 2D context unavailable'));
        return;
      }
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(blob => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to convert canvas to PNG blob'));
      }, 'image/png');
    };
    img.onerror = err => reject(err);
    img.src = svgToDataUrl(svgString);
  });
}
