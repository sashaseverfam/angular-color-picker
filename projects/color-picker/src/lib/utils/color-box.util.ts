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

  if (isTouchEvent(e) && e.changedTouches.length > 0) {
    x = e.changedTouches[0].pageX - left;
    y = e.changedTouches[0].pageY - top;
  }

  x = Math.max(0, Math.min(width, x));
  y = Math.max(0, Math.min(height, y));

  return { x, y };
}

export function getValueStyle(
  element: Element,
  parameter: 'width' | 'height' | 'left' | 'top'
): number {
  const computedStyle = getComputedStyle(element);
  const raw = computedStyle.getPropertyValue(parameter) || '0px';
  const match = raw.match(/\d+/);
  return match && match[0] ? +match[0] : 0;
}

export function isStartEvent(e: Event): boolean {
  return e.type === 'mousedown' || e.type === 'touchstart';
}

export function isMoveEvent(e: Event): boolean {
  return e.type === 'mousemove' || e.type === 'touchmove';
}

export function isEndEvent(e: Event): boolean {
  return (
    e.type === 'mouseup' || e.type === 'touchend' || e.type === 'touchcancel'
  );
}
