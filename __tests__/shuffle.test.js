const shuffle = require("../src/shuffle");

describe("shuffle should return an array", () => {
  // Test 1
  test('returns an array', () => {
    const inputArr = [1, 2, 3, 4, 5];
    const shuffledArr = shuffle(inputArr);
    expect(Array.isArray(shuffledArr)).toBe(true);
  });

  // Test 2
  test('returns an array of the same length as the input', () => {
    const inputArr = [1, 2, 3, 4, 5];
    const shuffledArr = shuffle(inputArr);
    expect(shuffledArr.length).toBe(inputArr.length);
  });
});

// Run npm test -t shuffle