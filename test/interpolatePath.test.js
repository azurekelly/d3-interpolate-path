import { it, expect } from 'vitest';
import interpolatePath from '../src/interpolatePath';
import { largePathA, largePathB } from './interpolatePath.testData';

const APPROX_MAX_T = 0.999999999999;

it('interpolatePath() interpolates line to line: len(A) = len(b)', () => {
  const a = 'M0,0L10,10L100,100';
  const b = 'M10,10L20,20L200,200';

  const interpolator = interpolatePath(a, b);

  expect(interpolator(0)).toBe(a);
  expect(interpolator(1)).toBe(b);
  expect(interpolator(0.5)).toBe('M5,5L15,15L150,150');
});

it('interpolatePath() interpolates line to line: len(A) > len(b)', () => {
  const a = 'M0,0L10,10L100,100';
  const b = 'M10,10L20,20';

  const interpolator = interpolatePath(a, b);

  expect(interpolator(0)).toBe(a);

  // should not be extended anymore and should match exactly
  expect(interpolator(1)).toBe(b);
  expect(interpolator(APPROX_MAX_T)).toApproxMatchPath('M10,10L15,15L20,20');

  // should be half way between the last point of B and the last point of A
  // here we get 12.5 since we split the 10,10-20,20 segment and end at L15,15
  expect(interpolator(0.5)).toBe('M5,5L12.5,12.5L60,60');
});

it('interpolatePath() interpolates line to line w/ snapEndsToInput: len(A) > len(b)', () => {
  const a = 'M0,0L10,10L100,100';
  const b = 'M10,10L20,20';

  const interpolator = interpolatePath(a, b, { snapEndsToInput: false });

  expect(interpolator(0)).toBe(a);

  // should be extended
  expect(interpolator(1)).not.toBe(b);
  expect(interpolator(APPROX_MAX_T)).toApproxMatchPath('M10,10L15,15L20,20');

  // should be half way between the last point of B and the last point of A
  // here we get 12.5 since we split the 10,10-20,20 segment and end at L15,15
  expect(interpolator(0.5)).toBe('M5,5L12.5,12.5L60,60');
});

it('interpolatePath() interpolates line to line: len(A) < len(b)', () => {
  const a = 'M0,0L10,10';
  const b = 'M10,10L20,20L200,200';

  const interpolator = interpolatePath(a, b);

  // should be extended to match the length of b
  expect(interpolator(0)).toBe('M0,0L5,5L10,10');
  expect(interpolator(APPROX_MAX_T)).toApproxMatchPath('M10,10L20,20L200,200');

  // should be half way between the last point of B and the last point of A
  expect(interpolator(0.5)).toBe('M5,5L12.5,12.5L105,105');
});

it('interpolatePath() interpolates line to line: len(A)=1', () => {
  const a = 'M0,0Z';
  const b = 'M10,10L20,20L200,200';

  const interpolator = interpolatePath(a, b);

  // should be extended to match the length of b
  expect(interpolator(0)).toBe('M0,0L0,0L0,0');
  expect(interpolator(1)).toBe(b);

  // should be half way between the last point of B and the last point of A
  expect(interpolator(0.5)).toBe('M5,5L10,10L100,100');
});

it('interpolatePath() interpolates line to line: len(B)=1', () => {
  const a = 'M0,0L10,10L100,100';
  const b = 'M10,10Z';

  const interpolator = interpolatePath(a, b);

  expect(interpolator(0)).toBe(a);

  // should not be extended anymore and should match exactly
  expect(interpolator(1)).toBe(b);

  // should be half way between the last point of B and the last point of A
  expect(interpolator(0.5)).toBe('M5,5L10,10L55,55');
});

it('interpolatePath() interpolates line to line: A is null', () => {
  const a = null;
  const b = 'M10,10L20,20L200,200';

  const interpolator = interpolatePath(a, b);

  // should be extended to match the length of b
  expect(interpolator(0)).toBe('M10,10L10,10L10,10');
  expect(interpolator(1)).toBe(b);

  // should be half way between the last point of B and the last point of A
  expect(interpolator(0.5)).toBe('M10,10L15,15L105,105');
});

it('interpolatePath() interpolates line to line: B is null', () => {
  const a = 'M0,0L10,10L100,100';
  const b = null;

  const interpolator = interpolatePath(a, b);

  expect(interpolator(0)).toBe(a);
  expect(interpolator(1)).toBe('');

  // should be halfway towards the first point of a
  expect(interpolator(0.5)).toBe('M0,0L5,5L50,50');
});

it('interpolatePath() interpolates line to line: A is null and B is null', () => {
  const a = null;
  const b = null;

  const interpolator = interpolatePath(a, b);

  expect(interpolator(0)).toBe('');
  expect(interpolator(1)).toBe('');

  // should be halfway towards the first point of a
  expect(interpolator(0.5)).toBe('');
});

it('interpolatePath() interpolates where both A and B end in Z', () => {
  const a = 'M0,0Z';
  const b = 'M10,10L20,20Z';

  const interpolator = interpolatePath(a, b);

  expect(interpolator(0)).toBe('M0,0L0,0Z');
  expect(interpolator(1)).toBe(b);

  // should be halfway towards the first point of a
  expect(interpolator(0.5)).toBe('M5,5L10,10Z');
});

it('interpolatePath() interpolates where A=null, B ends in Z', () => {
  const a = null;
  const b = 'M10,10L20,20Z';

  const interpolator = interpolatePath(a, b);

  expect(interpolator(0)).toBe('M10,10L10,10Z');
  expect(interpolator(1)).toBe(b);

  // should be halfway towards the first point of a
  expect(interpolator(0.5)).toBe('M10,10L15,15Z');
});

it('interpolatePath() interpolates A command using integer value', () => {
  const a = 'A10,10,0,0,1,20,20';
  const b = 'A20,20,40,1,0,10,10';

  const interpolator = interpolatePath(a, b);

  // should be extended to match the length of b
  expect(interpolator(0)).toBe(a);
  expect(interpolator(1)).toBe(b);

  // should be half way between the last point of B and the last point of A
  expect(interpolator(0.5)).toBe('A15,15,20,1,1,15,15');
  expect(interpolator(0.75)).toBe('A17.5,17.5,30,1,0,12.5,12.5');
  expect(interpolator(0.25)).toBe('A12.5,12.5,10,0,1,17.5,17.5');
});

it('interpolatePath() interpolates with other valid `d` characters', () => {
  const a =
    'M0,0m0,0L0,0l0,0H0V0Q0,0,0,0q0,0,0,0C0,0,0,0,0,0c0,0,0,0,0,0T0,0t0,0' +
    'S0,0,0,0s0,0,0,0A0,0,0,0,0,0,0';
  const b =
    'M4,4m4,4L4,4l4,4H4V4Q4,4,4,4q4,4,4,4C4,4,4,4,4,4c4,4,4,4,4,4T4,4t4,4' +
    'S4,4,4,4s4,4,4,4A4,4,1,1,1,4,4';

  const interpolator = interpolatePath(a, b);

  expect(interpolator(0)).toBe(a);
  expect(interpolator(1)).toBe(b);

  // should be halfway towards the first point of a
  expect(
    interpolator(0.5),
    'M2,2m2,2L2,2l2,2H2V2Q2,2,2,2q2,2,2,2C2,2,2,2,2,2c2,2,2,2,2,2' +
      'T2,2t2,2S2,2,2,2s2,2,2,2A2,2,0.5,1,1,2,2'
  );
});

it('interpolatePath() converts points in A to match types in B', () => {
  const a = 'M2,2 L3,3          C4,4,4,4,4,4 C5,5,5,5,5,5  L6,6  L7,7';
  const b = 'M4,4 C5,5,5,5,5,5  L6,6         S7,7,7,7      H8    V9';

  const interpolator = interpolatePath(a, b);

  expect(interpolator(0)).toBe('M2,2C3,3,3,3,3,3L4,4S5,5,5,5H6V7');
  expect(interpolator(1)).toBe(b);

  // should be halfway towards the first point of a
  expect(interpolator(0.5)).toBe('M3,3C4,4,4,4,4,4L5,5S6,6,6,6H7V8');
});

it('interpolatePath() interpolates curves of different length', () => {
  const a = 'M0,0C1,1,2,2,4,4C3,3,4,4,6,6';
  const b = 'M2,2C5,5,6,6,4,4C6,6,7,7,5,5C8,8,9,9,6,6C10,10,11,11,7,7';

  const interpolator = interpolatePath(a, b);

  expect(interpolator(0)).toBe(
    'M0,0C0.5,0.5,1,1,1.625,1.625C2.25,2.25,3,3,4,4C3.5,3.5,3.5,3.5,3.875,3.875C4.25,4.25,5,5,6,6'
  );

  expect(interpolator(1)).toBe(b);

  // should be halfway towards the first point of a
  expect(interpolator(0.5)).toBe(
    'M1,1C2.75,2.75,3.5,3.5,2.8125,2.8125C4.125,4.125,5,5,' +
      '4.5,4.5C5.75,5.75,6.25,6.25,4.9375,4.9375C7.125,7.125,8,8,6.5,6.5'
  );
});

it('interpolatePath() handles the case where path commands are followed by a space', () => {
  // IE bug fix.
  const a = 'M 0 0 L 10 10 L 100 100';
  const b = 'M10,10L20,20';

  const interpolator = interpolatePath(a, b);

  expect(interpolator(0)).toBe('M0,0L10,10L100,100');

  // should not be extended anymore and should match exactly
  expect(interpolator(1)).toBe(b);
  expect(interpolator(APPROX_MAX_T)).toApproxMatchPath('M10,10L15,15L20,20');

  // should be half way between the last point of B and the last point of A
  // here we get 12.5 since we split the 10,10-20,20 segment and end at L15,15
  expect(interpolator(0.5)).toBe('M5,5L12.5,12.5L60,60');
});

it('interpolatePath() includes M when extending if it is the only item', () => {
  const a = 'M0,0';
  const b = 'M10,10L20,20L30,30';

  const interpolator = interpolatePath(a, b);

  expect(interpolator(0)).toBe('M0,0L0,0L0,0');

  // should not be extended anymore and should match exactly
  expect(interpolator(1)).toBe(b);

  // should be half way between the last point of B and the last point of A
  expect(interpolator(0.5)).toBe('M5,5L10,10L15,15');
});

it('interpolatePath() handles negative numbers properly', () => {
  const a = 'M0,0L0,0';
  const b = 'M-10,-10L20,20';

  const interpolator = interpolatePath(a, b);

  expect(interpolator(0)).toBe('M0,0L0,0');
  expect(interpolator(1)).toBe(b);

  // should be half way between the last point of B and the last point of A
  expect(interpolator(0.5)).toBe('M-5,-5L10,10');
});

it('interpolatePath() handles numbers in scientific notation properly', () => {
  const a = 'M0.000000e+0,0L0,0';
  const b = 'M-1.000000e+1,-10L20,2.000000e+1';

  const interpolator = interpolatePath(a, b);

  expect(interpolator(0)).toBe('M0,0L0,0');
  expect(interpolator(1)).toBe(b);

  // should be half way between the last point of B and the last point of A
  expect(interpolator(0.5)).toBe('M-5,-5L10,10');
});

it('interpolatePath() handles leading spaces', () => {
  const a = '       M0,0L10,10L100,100';
  const b = `

        \tM10,10L20,20L200,200`;

  const interpolator = interpolatePath(a, b);

  expect(interpolator(0)).toBe('M0,0L10,10L100,100');
  expect(interpolator(1)).toBe(b);
  expect(interpolator(0.5)).toBe('M5,5L15,15L150,150');
});

it('interpolatePath() interpolates line to line multiple times', () => {
  const a = 'M0,0L10,10L100,100';
  const b = 'M10,10L20,20L200,200';

  const interpolator = interpolatePath(a, b);

  expect(interpolator(0)).toBe(a);
  expect(interpolator(1)).toBe(b);
  expect(interpolator(0.5)).toBe('M5,5L15,15L150,150');
  expect(interpolator(0)).toBe(a);
  expect(interpolator(0.25)).toBe('M2.5,2.5L12.5,12.5L125,125');
  expect(interpolator(1)).toBe(b);
  expect(interpolator(0.5)).toBe('M5,5L15,15L150,150');
  expect(interpolator(0.25)).toBe('M2.5,2.5L12.5,12.5L125,125');
  expect(interpolator(0)).toBe(a);
  expect(interpolator(1)).toBe(b);
  expect(interpolator(0.5)).toBe('M5,5L15,15L150,150');
  expect(interpolator(0.25)).toBe('M2.5,2.5L12.5,12.5L125,125');
});

it('interpolatePath() speed check', () => {
  console.time('build interpolator   ');
  const interpolator = interpolatePath(largePathA, largePathB);
  console.timeEnd('build interpolator   ');

  console.time('interpolate all      ');
  console.time('interpolate t=0      ');
  expect(interpolator(0)).toBeTruthy();
  console.timeEnd('interpolate t=0      ');
  console.time('interpolate t=0.5    ');
  expect(interpolator(0.5)).toBeTruthy();
  console.timeEnd('interpolate t=0.5    ');
  console.time('interpolate t=1      ');
  expect(interpolator(1)).toBeTruthy();
  console.timeEnd('interpolate t=1      ');
  console.timeEnd('interpolate all      ');
});
