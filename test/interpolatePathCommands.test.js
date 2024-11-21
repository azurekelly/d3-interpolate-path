import { it, expect } from 'vitest';
import { interpolatePathCommands } from '../src/interpolatePath';

const APPROX_MAX_T = 0.999999999999;

it('interpolatePathCommands() interpolates line to line: len(A) = len(b)', () => {
  const a = [
    { type: 'M', x: 0, y: 0 },
    { type: 'L', x: 10, y: 10 },
    { type: 'L', x: 100, y: 100 },
  ];

  const b = [
    { type: 'M', x: 10, y: 10 },
    { type: 'L', x: 20, y: 20 },
    { type: 'L', x: 200, y: 200 },
  ];

  const interpolator = interpolatePathCommands(a, b);

  expect(interpolator(0)).toEqual(a);
  expect(interpolator(1)).toEqual(b);
  expect(interpolator(0.5)).toEqual([
    { type: 'M', x: 5, y: 5 },
    { type: 'L', x: 15, y: 15 },
    { type: 'L', x: 150, y: 150 },
  ]);
});

it('interpolatePathCommands() interpolates line to line: len(A) > len(b)', () => {
  const aCommands = [
    { type: 'M', x: 0, y: 0 },
    { type: 'L', x: 10, y: 10 },
    { type: 'L', x: 100, y: 100 },
  ];
  const bCommands = [
    { type: 'M', x: 10, y: 10 },
    { type: 'L', x: 20, y: 20 },
  ];

  const interpolator = interpolatePathCommands(aCommands, bCommands);

  expect(interpolator(0)).toEqual(aCommands);

  // should not be extended anymore and should match exactly
  expect(interpolator(1)).toEqual(bCommands);

  expect(interpolator(APPROX_MAX_T)).toApproxMatchCommands([
    { type: 'M', x: 10, y: 10 },
    { type: 'L', x: 15, y: 15 },
    { type: 'L', x: 20, y: 20 },
  ]);

  // should be half way between the last point of B and the last point of A
  // here we get 12.5 since we split the 10,10-20,20 segment and end at L15,15
  expect(interpolator(0.5)).toEqual([
    { type: 'M', x: 5, y: 5 },
    { type: 'L', x: 12.5, y: 12.5 },
    { type: 'L', x: 60, y: 60 },
  ]);
});

it('interpolatePathCommands() interpolates line to line: len(A) < len(b)', () => {
  const a = [
    { type: 'M', x: 0, y: 0 },
    { type: 'L', x: 10, y: 10 },
  ];
  const b = [
    { type: 'M', x: 10, y: 10 },
    { type: 'L', x: 20, y: 20 },
    { type: 'L', x: 200, y: 200 },
  ];

  const interpolator = interpolatePathCommands(a, b);

  // should be extended to match the length of b
  expect(interpolator(0)).toEqual([
    { type: 'M', x: 0, y: 0 },
    { type: 'L', x: 5, y: 5 },
    { type: 'L', x: 10, y: 10 },
  ]);

  expect(interpolator(APPROX_MAX_T)).toApproxMatchCommands([
    { type: 'M', x: 10, y: 10 },
    { type: 'L', x: 20, y: 20 },
    { type: 'L', x: 200, y: 200 },
  ]);

  // should be half way between the last point of B and the last point of A
  expect(interpolator(0.5)).toEqual([
    { type: 'M', x: 5, y: 5 },
    { type: 'L', x: 12.5, y: 12.5 },
    { type: 'L', x: 105, y: 105 },
  ]);
});

it('interpolatePathCommands() interpolates line to line: len(A)=1', () => {
  const a = [{ type: 'M', x: 0, y: 0 }, { type: 'Z' }];
  const b = [
    { type: 'M', x: 10, y: 10 },
    { type: 'L', x: 20, y: 20 },
    { type: 'L', x: 200, y: 200 },
  ];

  const interpolator = interpolatePathCommands(a, b);

  // should be extended to match the length of b
  expect(interpolator(0)).toEqual([
    { type: 'M', x: 0, y: 0 },
    { type: 'L', x: 0, y: 0 },
    { type: 'L', x: 0, y: 0 },
  ]);
  expect(interpolator(1)).toEqual(b);

  // should be half way between the last point of B and the last point of A
  expect(interpolator(0.5)).toEqual([
    { type: 'M', x: 5, y: 5 },
    { type: 'L', x: 10, y: 10 },
    { type: 'L', x: 100, y: 100 },
  ]);
});

it('interpolatePathCommands() interpolates line to line: len(B)=1', () => {
  const a = [
    { type: 'M', x: 0, y: 0 },
    { type: 'L', x: 10, y: 10 },
    { type: 'L', x: 100, y: 100 },
  ];
  const b = [{ type: 'M', x: 10, y: 10 }, { type: 'Z' }];

  const interpolator = interpolatePathCommands(a, b);

  expect(interpolator(0)).toEqual(a);

  // should not be extended anymore and should match exactly
  expect(interpolator(1)).toEqual(b);

  // should be half way between the last point of B and the last point of A
  expect(interpolator(0.5)).toEqual([
    { type: 'M', x: 5, y: 5 },
    { type: 'L', x: 10, y: 10 },
    { type: 'L', x: 55, y: 55 },
  ]);
});

it('interpolatePathCommands() interpolates line to line: A is null', () => {
  const a = null;
  const b = [
    { type: 'M', x: 10, y: 10 },
    { type: 'L', x: 20, y: 20 },
    { type: 'L', x: 200, y: 200 },
  ];

  const interpolator = interpolatePathCommands(a, b);

  // should be extended to match the length of b
  expect(interpolator(0)).toEqual([
    { type: 'M', x: 10, y: 10 },
    { type: 'L', x: 10, y: 10 },
    { type: 'L', x: 10, y: 10 },
  ]);
  expect(interpolator(1)).toEqual(b);

  // should be half way between the last point of B and the last point of A
  expect(interpolator(0.5)).toEqual([
    { type: 'M', x: 10, y: 10 },
    { type: 'L', x: 15, y: 15 },
    { type: 'L', x: 105, y: 105 },
  ]);
});

it('interpolatePathCommands() interpolates line to line: B is null', () => {
  const a = [
    { type: 'M', x: 0, y: 0 },
    { type: 'L', x: 10, y: 10 },
    { type: 'L', x: 100, y: 100 },
  ];

  const b = null;

  const interpolator = interpolatePathCommands(a, b);

  expect(interpolator(0)).toEqual(a);
  expect(interpolator(1)).toEqual([]);

  // should be halfway towards the first point of a
  expect(interpolator(0.5)).toEqual([
    { type: 'M', x: 0, y: 0 },
    { type: 'L', x: 5, y: 5 },
    { type: 'L', x: 50, y: 50 },
  ]);
});

it('interpolatePathCommands() interpolates line to line: A is null and B is null', () => {
  const a = null;
  const b = null;

  const interpolator = interpolatePathCommands(a, b);

  expect(interpolator(0)).toEqual([]);
  expect(interpolator(1)).toEqual([]);

  // should be halfway towards the first point of a
  expect(interpolator(0.5)).toEqual([]);
});

it('interpolatePathCommands() interpolates where both A and B end in Z', () => {
  const a = [{ type: 'M', x: 0, y: 0 }, { type: 'Z' }];
  const b = [
    { type: 'M', x: 10, y: 10 },
    { type: 'L', x: 20, y: 20 },
    { type: 'Z' },
  ];

  const interpolator = interpolatePathCommands(a, b);

  expect(interpolator(0)).toEqual([
    { type: 'M', x: 0, y: 0 },
    { type: 'L', x: 0, y: 0 },
    { type: 'Z' },
  ]);

  expect(interpolator(1)).toEqual(b);

  // should be halfway towards the first point of a
  expect(interpolator(0.5)).toEqual([
    { type: 'M', x: 5, y: 5 },
    { type: 'L', x: 10, y: 10 },
    { type: 'Z' },
  ]);
});

it('interpolatePathCommands() interpolates where A=null, B ends in Z', () => {
  const a = null;
  const b = [
    { type: 'M', x: 10, y: 10 },
    { type: 'L', x: 20, y: 20 },
    { type: 'Z' },
  ];

  const interpolator = interpolatePathCommands(a, b);

  expect(interpolator(0)).toEqual([
    { type: 'M', x: 10, y: 10 },
    { type: 'L', x: 10, y: 10 },
    { type: 'Z' },
  ]);
  expect(interpolator(1)).toEqual(b);

  // should be halfway towards the first point of a
  expect(interpolator(0.5)).toEqual([
    { type: 'M', x: 10, y: 10 },
    { type: 'L', x: 15, y: 15 },
    { type: 'Z' },
  ]);
});
