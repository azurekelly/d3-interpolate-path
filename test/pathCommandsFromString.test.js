import { describe, it, expect } from 'vitest';
import { pathCommandsFromString } from '../src/interpolatePath';

describe('Test pathCommandsFromString()', () => {
  describe('Test command types', () => {
    it('parses all absolute command types', () => {
      expect(
        pathCommandsFromString(
          'M 0 0 L 10 15 H 5 V 0 C 10 10 5 10 15 20 S 20 20 5 10 Q 10 5 15 10 T 20 20 A 10 15 0 0 1 20 10 Z'
        )
      ).toEqual([
        { type: 'M', x: 0, y: 0 },
        { type: 'L', x: 10, y: 15 },
        { type: 'H', x: 5 },
        { type: 'V', y: 0 },
        { type: 'C', x1: 10, y1: 10, x2: 5, y2: 10, x: 15, y: 20 },
        { type: 'S', x2: 20, y2: 20, x: 5, y: 10 },
        { type: 'Q', x1: 10, y1: 5, x: 15, y: 10 },
        { type: 'T', x: 20, y: 20 },
        {
          type: 'A',
          rx: 10,
          ry: 15,
          xAxisRotation: 0,
          largeArcFlag: 0,
          sweepFlag: 1,
          x: 20,
          y: 10,
        },
        { type: 'Z' },
      ]);
    });

    it('parses all relative command types', () => {
      expect(
        pathCommandsFromString(
          'm 0 0 l 10 15 h 5 v 0 c 10 10 5 10 15 20 s 20 20 5 10 q 10 5 15 10 t 20 20 a 10 15 0 0 1 20 10 z'
        )
      ).toEqual([
        { type: 'm', x: 0, y: 0 },
        { type: 'l', x: 10, y: 15 },
        { type: 'h', x: 5 },
        { type: 'v', y: 0 },
        { type: 'c', x1: 10, y1: 10, x2: 5, y2: 10, x: 15, y: 20 },
        { type: 's', x2: 20, y2: 20, x: 5, y: 10 },
        { type: 'q', x1: 10, y1: 5, x: 15, y: 10 },
        { type: 't', x: 20, y: 20 },
        {
          type: 'a',
          rx: 10,
          ry: 15,
          xAxisRotation: 0,
          largeArcFlag: 0,
          sweepFlag: 1,
          x: 20,
          y: 10,
        },
        { type: 'z' },
      ]);
    });

    it('parses implicit L command for repeated M coordinates', () => {
      expect(pathCommandsFromString('M 0 0 10 10 15 15 20 5')).toEqual([
        { type: 'M', x: 0, y: 0 },
        { type: 'L', x: 10, y: 10 },
        { type: 'L', x: 15, y: 15 },
        { type: 'L', x: 20, y: 5 },
      ]);
      expect(pathCommandsFromString('m 0 0 10 10 15 15 20 5')).toEqual([
        { type: 'm', x: 0, y: 0 },
        { type: 'l', x: 10, y: 10 },
        { type: 'l', x: 15, y: 15 },
        { type: 'l', x: 20, y: 5 },
      ]);
    });

    it('parses implicit repeated commands for line commands', () => {
      expect(
        pathCommandsFromString('M 0 0 L 10 10 15 15 20 5 H 10 15 20 V 5 10 15')
      ).toEqual([
        { type: 'M', x: 0, y: 0 },
        { type: 'L', x: 10, y: 10 },
        { type: 'L', x: 15, y: 15 },
        { type: 'L', x: 20, y: 5 },
        { type: 'H', x: 10 },
        { type: 'H', x: 15 },
        { type: 'H', x: 20 },
        { type: 'V', y: 5 },
        { type: 'V', y: 10 },
        { type: 'V', y: 15 },
      ]);
      expect(
        pathCommandsFromString('m 0 0 l 10 10 15 15 20 5 h 10 15 20 v 5 10 15')
      ).toEqual([
        { type: 'm', x: 0, y: 0 },
        { type: 'l', x: 10, y: 10 },
        { type: 'l', x: 15, y: 15 },
        { type: 'l', x: 20, y: 5 },
        { type: 'h', x: 10 },
        { type: 'h', x: 15 },
        { type: 'h', x: 20 },
        { type: 'v', y: 5 },
        { type: 'v', y: 10 },
        { type: 'v', y: 15 },
      ]);
    });

    it('parses implicit repeated commands for cubic bezier commands', () => {
      expect(
        pathCommandsFromString(
          'M 0 0 C 10 10 15 15 20 5 15 20 5 10 10 5 S 10 5 0 20 10 15 0 10'
        )
      ).toEqual([
        { type: 'M', x: 0, y: 0 },
        { type: 'C', x1: 10, y1: 10, x2: 15, y2: 15, x: 20, y: 5 },
        { type: 'C', x1: 15, y1: 20, x2: 5, y2: 10, x: 10, y: 5 },
        { type: 'S', x2: 10, y2: 5, x: 0, y: 20 },
        { type: 'S', x2: 10, y2: 15, x: 0, y: 10 },
      ]);
      expect(
        pathCommandsFromString(
          'm 0 0 c 10 10 15 15 20 5 15 20 5 10 10 5 s 10 5 0 20 10 15 0 10'
        )
      ).toEqual([
        { type: 'm', x: 0, y: 0 },
        { type: 'c', x1: 10, y1: 10, x2: 15, y2: 15, x: 20, y: 5 },
        { type: 'c', x1: 15, y1: 20, x2: 5, y2: 10, x: 10, y: 5 },
        { type: 's', x2: 10, y2: 5, x: 0, y: 20 },
        { type: 's', x2: 10, y2: 15, x: 0, y: 10 },
      ]);
    });

    it('parses implicit repeated commands for quadratic bezier commands', () => {
      expect(
        pathCommandsFromString(
          'M 0 0 Q 10 10 15 15 20 5 10 5 T 10 15 0 10 20 20'
        )
      ).toEqual([
        { type: 'M', x: 0, y: 0 },
        { type: 'Q', x1: 10, y1: 10, x: 15, y: 15 },
        { type: 'Q', x1: 20, y1: 5, x: 10, y: 5 },
        { type: 'T', x: 10, y: 15 },
        { type: 'T', x: 0, y: 10 },
        { type: 'T', x: 20, y: 20 },
      ]);
      expect(
        pathCommandsFromString(
          'm 0 0 q 10 10 15 15 20 5 10 5 t 10 15 0 10 20 20'
        )
      ).toEqual([
        { type: 'm', x: 0, y: 0 },
        { type: 'q', x1: 10, y1: 10, x: 15, y: 15 },
        { type: 'q', x1: 20, y1: 5, x: 10, y: 5 },
        { type: 't', x: 10, y: 15 },
        { type: 't', x: 0, y: 10 },
        { type: 't', x: 20, y: 20 },
      ]);
    });

    it('parses implicit repeated commands for arc command', () => {
      expect(
        pathCommandsFromString('M 0 0 A 10 15 0 0 1 10 10 20 5 90 1 0 20 20')
      ).toEqual([
        { type: 'M', x: 0, y: 0 },
        {
          type: 'A',
          rx: 10,
          ry: 15,
          xAxisRotation: 0,
          largeArcFlag: 0,
          sweepFlag: 1,
          x: 10,
          y: 10,
        },
        {
          type: 'A',
          rx: 20,
          ry: 5,
          xAxisRotation: 90,
          largeArcFlag: 1,
          sweepFlag: 0,
          x: 20,
          y: 20,
        },
      ]);
      expect(
        pathCommandsFromString('m 0 0 a 10 15 0 0 1 10 10 20 5 90 1 0 20 20')
      ).toEqual([
        { type: 'm', x: 0, y: 0 },
        {
          type: 'a',
          rx: 10,
          ry: 15,
          xAxisRotation: 0,
          largeArcFlag: 0,
          sweepFlag: 1,
          x: 10,
          y: 10,
        },
        {
          type: 'a',
          rx: 20,
          ry: 5,
          xAxisRotation: 90,
          largeArcFlag: 1,
          sweepFlag: 0,
          x: 20,
          y: 20,
        },
      ]);
    });

    it('returns empty array for empty string', () => {
      expect(pathCommandsFromString('')).toEqual([]);
    });

    it('returns empty array for whitespace-only string', () => {
      expect(pathCommandsFromString('  \r\n ')).toEqual([]);
    });
  });

  describe('Test coordinates', () => {
    it('parses negative numbers', () => {
      expect(pathCommandsFromString('M -10 -5 L -15 -10')).toEqual([
        { type: 'M', x: -10, y: -5 },
        { type: 'L', x: -15, y: -10 },
      ]);
    });

    it('parses decimal numbers', () => {
      expect(pathCommandsFromString('M 10.5 15.5 L 15.5 5.5')).toEqual([
        { type: 'M', x: 10.5, y: 15.5 },
        { type: 'L', x: 15.5, y: 5.5 },
      ]);
    });

    it('parses leading decimal numbers', () => {
      expect(pathCommandsFromString('M10 .5 L .5 5.5')).toEqual([
        { type: 'M', x: 10, y: 0.5 },
        { type: 'L', x: 0.5, y: 5.5 },
      ]);
    });

    it('parses negative leading decimal numbers', () => {
      expect(pathCommandsFromString('M 10 -.5 L -.5 5.5')).toEqual([
        { type: 'M', x: 10, y: -0.5 },
        { type: 'L', x: -0.5, y: 5.5 },
      ]);
    });

    it('parses scientific notation numbers', () => {
      expect(pathCommandsFromString('M 10E1 -0.5e2 L 15.5E10 -10e-1')).toEqual([
        { type: 'M', x: 10e1, y: -0.5e2 },
        { type: 'L', x: 15.5e10, y: -10e-1 },
      ]);
    });

    it('ignores leading and trailing zeros', () => {
      expect(pathCommandsFromString('M 00010 00.5 L 15 5.50')).toEqual([
        { type: 'M', x: 10, y: 0.5 },
        { type: 'L', x: 15, y: 5.5 },
      ]);
    });
  });

  describe('Test seperators', () => {
    it('parses whitespace separated strings', () => {
      expect(pathCommandsFromString('M 10 10 L 15 15')).toEqual([
        { type: 'M', x: 10, y: 10 },
        { type: 'L', x: 15, y: 15 },
      ]);
    });

    it('parses comma separated strings', () => {
      expect(pathCommandsFromString('M10,10L,15,15')).toEqual([
        { type: 'M', x: 10, y: 10 },
        { type: 'L', x: 15, y: 15 },
      ]);
    });

    it('parses implicit seperator on negative numbers', () => {
      expect(pathCommandsFromString('M10-10L-15-15')).toEqual([
        { type: 'M', x: 10, y: -10 },
        { type: 'L', x: -15, y: -15 },
      ]);
    });

    it('parses implicit seperator on leading decimal numbers', () => {
      expect(pathCommandsFromString('M.5,10L15,15C5.5.5,10,.5.5.5')).toEqual([
        { type: 'M', x: 0.5, y: 10 },
        { type: 'L', x: 15, y: 15 },
        { type: 'C', x1: 5.5, y1: 0.5, x2: 10, y2: 0.5, x: 0.5, y: 0.5 },
      ]);
    });

    it('ignores leading and trailing whitespace', () => {
      expect(pathCommandsFromString('   M 10 10 L 15 15 \r\n')).toEqual([
        { type: 'M', x: 10, y: 10 },
        { type: 'L', x: 15, y: 15 },
      ]);
    });
  });
});
