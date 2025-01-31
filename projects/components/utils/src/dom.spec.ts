import { isInViewport } from './dom';

describe('isInViewport', () => {
  it('should return true if the element is in the viewport', () => {
    const element = {
      getBoundingClientRect: () => ({
        top: 0,
        left: 0,
        bottom: 50,
        right: 50,
      }),
    } as unknown as Element;

    expect(isInViewport(element)).toBe(true);
  });

  it('should return false if the element is not in the viewport', () => {
    const element = {
      getBoundingClientRect: () => ({
        top: -1000,
        left: -1000,
        bottom: 100,
        right: 100,
      }),
    } as unknown as Element;

    expect(isInViewport(element)).toBe(false);
  });
});
