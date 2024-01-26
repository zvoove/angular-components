import { isInViewport } from './dom';

describe('isInViewport', () => {
  it('should return true if the element is in the viewport', () => {
    const element = document.createElement('div');
    element.style.position = 'absolute';
    element.style.top = '0';
    element.style.left = '0';
    element.style.width = '100px';
    element.style.height = '100px';
    document.body.appendChild(element);

    expect(isInViewport(element)).toBe(true);
  });

  it('should return false if the element is not in the viewport', () => {
    const element = document.createElement('div');
    element.style.position = 'absolute';
    element.style.top = '-1000px';
    element.style.left = '-1000px';
    element.style.width = '100px';
    element.style.height = '100px';
    document.body.appendChild(element);

    expect(isInViewport(element)).toBe(false);
  });
});
