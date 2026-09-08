import { CameraFilter, FilterId } from '../types/camera';

export const CAMERA_FILTERS: CameraFilter[] = [
  {
    id: 'original',
    name: 'Original',
    subtitle: 'Sin filtro',
    cssFilter: 'none',
    description: 'Colores puros del sensor sin alteraciones.',
    coreImageFilter: '// Original - Passthrough\nlet outputImage = inputImage'
  },
  {
    id: 'vivo',
    name: 'Vivo',
    subtitle: 'Vibrant',
    cssFilter: 'saturate(1.35) contrast(1.08) brightness(1.03)',
    description: 'Acentúa los tonos oceánicos y la luminosidad de la piel.',
    coreImageFilter: `// CIColorControls (Saturación y Contraste vivo)\nlet filter = CIFilter.colorControls()\nfilter.inputImage = inputImage\nfilter.saturation = 1.35\nfilter.contrast = 1.08\nfilter.brightness = 0.03\nlet outputImage = filter.outputImage`
  },
  {
    id: 'calido',
    name: 'Cálido',
    subtitle: 'Warm Gold',
    cssFilter: 'sepia(0.22) saturate(1.18) hue-rotate(-8deg) brightness(1.02)',
    description: 'Temperatura dorada de atardecer en playa.',
    coreImageFilter: `// CITemperatureAndTint (Cálido Sunset)\nlet filter = CIFilter.temperatureAndTint()\nfilter.inputImage = inputImage\nfilter.neutral = CIVector(x: 6500, y: 0)\nfilter.targetNeutral = CIVector(x: 5200, y: 0) // Desplazamiento a luz cálida\nlet outputImage = filter.outputImage`
  },
  {
    id: 'frio',
    name: 'Frío',
    subtitle: 'Cool Ocean',
    cssFilter: 'saturate(1.1) hue-rotate(12deg) brightness(1.04) contrast(1.05)',
    description: 'Realza los azules marinos profundos y blancos cristalinos.',
    coreImageFilter: `// CITemperatureAndTint (Frío Marino)\nlet filter = CIFilter.temperatureAndTint()\nfilter.inputImage = inputImage\nfilter.neutral = CIVector(x: 6500, y: 0)\nfilter.targetNeutral = CIVector(x: 7800, y: 0) // Desplazamiento a tonos fríos\nlet outputImage = filter.outputImage`
  },
  {
    id: 'bn',
    name: 'B & N',
    subtitle: 'Monochrome',
    cssFilter: 'grayscale(1) contrast(1.22) brightness(0.98)',
    description: 'Clásico blanco y negro con textura y grano cinematográfico.',
    coreImageFilter: `// CIPhotoEffectMono + CIColorControls\nlet monoFilter = CIFilter.photoEffectMono()\nmonoFilter.inputImage = inputImage\nlet contrastFilter = CIFilter.colorControls()\ncontrastFilter.inputImage = monoFilter.outputImage\ncontrastFilter.contrast = 1.22\nlet outputImage = contrastFilter.outputImage`
  },
  {
    id: 'contraste_alto',
    name: 'Alto Contraste',
    subtitle: 'High Key',
    cssFilter: 'contrast(1.4) saturate(1.2) brightness(1.05)',
    description: 'Impacto visual fuerte para fotografía publicitaria de marca.',
    coreImageFilter: `// CIToneCurve / CIColorControls\nlet filter = CIFilter.colorControls()\nfilter.inputImage = inputImage\nfilter.contrast = 1.40\nfilter.saturation = 1.20\nfilter.brightness = 0.05\nlet outputImage = filter.outputImage`
  }
];

export function getFilterById(id: FilterId): CameraFilter {
  return CAMERA_FILTERS.find(f => f.id === id) || CAMERA_FILTERS[0];
}

/**
 * Applies CSS filter to context if supported (best effort for previews)
 */
export function applyCanvasFilter(
  ctx: CanvasRenderingContext2D,
  filterId: FilterId,
  exposureEV: number = 0,
  brightnessAdj: number = 0
) {
  const baseFilter = getFilterById(filterId);
  const exposureBrightness = 1 + exposureEV * 0.15 + brightnessAdj * 0.2;
  const brightnessFilter = `brightness(${Math.max(0.2, exposureBrightness)})`;

  if (baseFilter.id === 'original') {
    ctx.filter = brightnessFilter;
  } else {
    ctx.filter = `${baseFilter.cssFilter} ${brightnessFilter}`;
  }
}

/**
 * Direct pixel processing engine.
 * Guarantees that selected filters (B&W, Warm, Cool, Vivid, High Contrast)
 * and exposure are 100% burned into the final photo pixels across all devices,
 * completely bypassing iOS Safari's WebKit canvas ctx.filter video bugs.
 */
export function applyPixelFilterToCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  filterId: FilterId,
  exposureEV: number = 0,
  brightnessAdj: number = 0
) {
  const exposureMultiplier = Math.max(0.1, 1 + exposureEV * 0.18 + brightnessAdj * 0.22);
  const isOriginal = filterId === 'original';

  if (isOriginal && Math.abs(exposureMultiplier - 1.0) < 0.02) {
    return;
  }

  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;
  const totalPixels = data.length;

  for (let i = 0; i < totalPixels; i += 4) {
    let r = data[i] * exposureMultiplier;
    let g = data[i + 1] * exposureMultiplier;
    let b = data[i + 2] * exposureMultiplier;

    switch (filterId) {
      case 'bn': {
        // High quality monochrome with cinematic contrast
        let lum = 0.299 * r + 0.587 * g + 0.114 * b;
        lum = (lum - 128) * 1.25 + 128;
        r = lum;
        g = lum;
        b = lum;
        break;
      }
      case 'calido': {
        // Warm sunset gold
        r = r * 1.15 + 14;
        g = g * 1.03 + 6;
        b = b * 0.86 - 8;
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        r = lum + (r - lum) * 1.2;
        g = lum + (g - lum) * 1.2;
        b = lum + (b - lum) * 1.2;
        break;
      }
      case 'frio': {
        // Cool ocean tint & crisp contrast
        r = r * 0.88 - 4;
        g = g * 1.02 + 4;
        b = b * 1.18 + 16;
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        r = (lum + (r - lum) * 1.12 - 128) * 1.06 + 128;
        g = (lum + (g - lum) * 1.12 - 128) * 1.06 + 128;
        b = (lum + (b - lum) * 1.12 - 128) * 1.06 + 128;
        break;
      }
      case 'vivo': {
        // Vivid saturation (+38%) and contrast (+8%)
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        r = lum + (r - lum) * 1.38;
        g = lum + (g - lum) * 1.38;
        b = lum + (b - lum) * 1.38;
        r = (r - 128) * 1.08 + 128 + 3;
        g = (g - 128) * 1.08 + 128 + 3;
        b = (b - 128) * 1.08 + 128 + 3;
        break;
      }
      case 'contraste_alto': {
        // High Key dramatic contrast
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        r = lum + (r - lum) * 1.25;
        g = lum + (g - lum) * 1.25;
        b = lum + (b - lum) * 1.25;
        r = (r - 128) * 1.4 + 128 + 6;
        g = (g - 128) * 1.4 + 128 + 6;
        b = (b - 128) * 1.4 + 128 + 6;
        break;
      }
      case 'original':
      default:
        // Original with brightness/exposure
        break;
    }

    data[i] = r < 0 ? 0 : r > 255 ? 255 : r;
    data[i + 1] = g < 0 ? 0 : g > 255 ? 255 : g;
    data[i + 2] = b < 0 ? 0 : b > 255 ? 255 : b;
  }

  ctx.putImageData(imgData, 0, 0);
}
