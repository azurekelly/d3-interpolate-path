import { expect } from 'vitest';

expect.extend({
  toApproxMatchPath(path1, path2) {
    const { isNot } = this;
    return {
      pass: approximatelyEqual(path1, path2),
      message: () =>
        `expected '${path1}' ${
          isNot ? 'not ' : ''
        }to approximately match '${path2}'`,
      expected: path2,
      actual: path1,
    };
  },
  toApproxMatchCommands(path1Commands, path2Commands) {
    const { isNot } = this;
    return {
      pass: approximatelyEqualCommands(path1Commands, path2Commands),
      // TODO message could be improved, diff shows mismatch between values when they're approximately equal
      // this makes it hard to tell which values are causing the actual error
      message: () =>
        `expected commands ${isNot ? 'not ' : ''}to approximately match`,
      expected: path2Commands,
      actual: path1Commands,
    };
  },
});

// helper to ensure path1 and path2 are roughly equal
function approximatelyEqual(path1, path2) {
  // convert to numbers and letters
  const path1Items = pathToItems(path1);
  const path2Items = pathToItems(path2);
  const epsilon = 0.001;

  if (path1Items.length !== path2Items.length) {
    return false;
  }

  for (let i = 0; i < path1Items.length; i++) {
    if (typeof path1Items[i] === 'string' && path1Items[i] !== path2Items[i]) {
      return false;
    }

    // otherwise it's a number, check if approximately equal
    if (Math.abs(path1Items[i] - path2Items[i]) > epsilon) {
      return false;
    }
  }

  return true;
}

// helper to convert a path string to an array (e.g. 'M5,5 L10,10' => ['M', 5, 5, 'L', 10, 10]
function pathToItems(path) {
  return path
    .replace(/\s/g, '')
    .split(/([A-Z,])/)
    .filter((d) => d !== '' && d !== ',')
    .map((d) => (isNaN(+d) ? d : +d));
}

// helper to ensure path1 and path2 are roughly equal
function approximatelyEqualCommands(path1Commands, path2Commands) {
  const epsilon = 0.001;

  if (path1Commands.length !== path2Commands.length) {
    return false;
  }

  for (let i = 0; i < path1Commands.length; i++) {
    const path1Command = path1Commands[i];
    const path2Command = path2Commands[i];
    if (Object.keys(path1Command).length !== Object.keys(path2Command).length) {
      return false;
    }

    for (let key in path1Commands[i]) {
      if (
        typeof path1Command[key] === 'string' &&
        path1Command[key] !== path2Command[key]
      ) {
        return false;
      }

      // otherwise it's a number, check if approximately equal
      if (Math.abs(path1Command[key] - path2Command[key]) > epsilon) {
        return false;
      }
    }
  }

  return true;
}
