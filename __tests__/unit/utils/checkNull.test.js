const { filterNull, checkNull } = require('../../../src/utils/checkNull');

describe('checkNull utils', () => {
  describe('filterNull', () => {
    it('should remove keys with null values', () => {
      const result = filterNull({ a: 1, b: null, c: 0 });
      expect(result).toEqual({ a: 1, c: 0 });
    });

    it('should keep falsy but non-null values', () => {
      const result = filterNull({ a: 0, b: '', c: false });
      expect(result).toEqual({ a: 0, b: '', c: false });
    });

    it('should return empty object when all values are null', () => {
      const result = filterNull({ a: null, b: null });
      expect(result).toEqual({});
    });
  });

  describe('checkNull', () => {
    it('should return true when object has null value', () => {
      expect(checkNull({ a: null })).toBe(true);
      expect(checkNull({ a: 1, b: null })).toBe(true);
    });

    it('should return false when no null values', () => {
      expect(checkNull({ a: 1 })).toBe(false);
      expect(checkNull({ a: 0, b: '' })).toBe(false);
    });
  });
});
