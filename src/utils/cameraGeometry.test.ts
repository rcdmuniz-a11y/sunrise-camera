import assert from 'node:assert/strict';
import test from 'node:test';
import {
  calculateFrameLayout,
  calculateVisibleVideoRegion,
  getFrameState,
  normalizeFrameLayout,
} from './cameraGeometry';

test('9:16 preview maps to the exact centered source crop', () => {
  const region = calculateVisibleVideoRegion(1920, 1080, 360, 640, 1);
  assert.equal(region.sourceHeight, 1080);
  assert.equal(region.sourceWidth, 607.5);
  assert.equal(region.sourceX, 656.25);
  assert.equal(region.sourceY, 0);
});

test('manual frame states are deterministic and normalized', () => {
  const states = ['bottom', 'left', 'top', 'right'] as const;
  const expectedRotations = [0, 270, 180, 90];
  states.forEach((anchor, index) => {
    const first = getFrameState(anchor);
    const repeated = getFrameState(anchor);
    assert.deepEqual(first, repeated);
    assert.equal(first.anchor, anchor);
    assert.equal(first.rotation, expectedRotations[index]);
  });
});

test('left and right rotated bounding boxes touch their exact stage edges', () => {
  const bounds = (anchor: 'left' | 'right') => {
    const state = getFrameState(anchor);
    const x = state.x * 1080;
    const width = state.width * 1080;
    const height = state.height * 1920;
    const rotatedWidth = height;
    return {
      left: x + (width - rotatedWidth) / 2,
      right: x + (width + rotatedWidth) / 2,
    };
  };
  assert.ok(Math.abs(bounds('left').left) < 0.001);
  assert.ok(Math.abs(bounds('right').right - 1080) < 0.001);
});

test('digital zoom keeps the same center and halves the visible region at 2x', () => {
  const one = calculateVisibleVideoRegion(1920, 1080, 360, 640, 1);
  const two = calculateVisibleVideoRegion(1920, 1080, 360, 640, 2);
  assert.equal(two.sourceWidth, one.sourceWidth / 2);
  assert.equal(two.sourceHeight, one.sourceHeight / 2);
  assert.equal(two.sourceX + two.sourceWidth / 2, 960);
  assert.equal(two.sourceY + two.sourceHeight / 2, 540);
});

test('frame bounding box stays inside the stage in every quarter turn', () => {
  const stageWidth = 360;
  const stageHeight = 640;
  for (const angle of [0, 90, 180, 270]) {
    const aspect = angle === 90 || angle === 270 ? 1504 / 291 : 1213 / 459;
    const layout = calculateFrameLayout(stageWidth, stageHeight, angle, aspect);
    const normalized = normalizeFrameLayout(layout, stageWidth, stageHeight);
    assert.ok(Number.isFinite(normalized.x));
    assert.ok(Number.isFinite(normalized.y));
    assert.ok(normalized.width > 0);
    assert.ok(normalized.height > 0);

    const rotated = angle === 90 || angle === 270;
    const boxWidth = rotated ? layout.height : layout.width;
    const boxHeight = rotated ? layout.width : layout.height;
    const boxX = layout.x + (layout.width - boxWidth) / 2;
    const boxY = layout.y + (layout.height - boxHeight) / 2;
    assert.ok(boxX >= -0.001);
    assert.ok(boxY >= -0.001);
    assert.ok(boxX + boxWidth <= stageWidth + 0.001);
    assert.ok(boxY + boxHeight <= stageHeight + 0.001);
  }
});
