import { isTouchEvent } from './touch-events.utils';

export function getEventRectCoords(
  e: Event,
  { height, width, left, top }: DOMRect
): { x: number; y: number } {
  let x = 0;
  let y = 0;

  if (e instanceof MouseEvent) {
    x = e.pageX - left;
    y = e.pageY - top;
  }

  if (isTouchEvent(e)) {
    x = e.changedTouches[0].pageX - left;
    y = e.changedTouches[0].pageY - top;
  }

  if (x > width) {
    x = width;
  }

  if (x < 0) {
    x = 0;
  }

  if (y > height) {
    y = height;
  }

  if (y < 0) {
    y = 0.1;
  }

  return { x, y };
}

export function getValueStyle(
  element: Element,
  parameter: 'width' | 'height' | 'left' | 'top'
): number {
  const computedStyle = getComputedStyle(element);
  let value;
  if (parameter === 'width') {
    value = (computedStyle.getPropertyValue(parameter) || '0px').match(/\d+/);
  }

  if (parameter === 'height') {
    value = (computedStyle.getPropertyValue(parameter) || '0px').match(/\d+/);
  }

  if (parameter === 'left') {
    value = (computedStyle.getPropertyValue(parameter) || '0px').match(/\d+/);
  }

  if (parameter === 'top') {
    value = (computedStyle.getPropertyValue(parameter) || '0px').match(/\d+/);
  }

  const val = value || [];
  let result = 0;
  if (val[0]) {
    result = +val[0];
  }

  return result || 0;
}

export function isStartEvent(e: Event) {
  return e.type === 'mousedown' || e.type === 'touchstart';
}

export function isMoveEvent(e: Event) {
  return e.type === 'mousemove' || e.type === 'touchmove';
}

export function isEndEvent(e: Event) {
  return (
    e.type === 'mouseup' || e.type === 'touchend' || e.type === 'touchcancel'
  );
}
