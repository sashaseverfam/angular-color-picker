export function isTouchEvent(event: Event): event is TouchEvent {
  try {
    return event instanceof TouchEvent;
  } catch (e) {
    return false;
  }
}

export function isSingleTouchEvent(event: Event): boolean {
  return isTouchEvent(event) && event.touches.length === 1;
}

export function isDoubleTouchEvent(event: Event): boolean {
  return isTouchEvent(event) && event.touches.length === 2;
}

export function getDistanceBetweenTouches(event: Event): number {
  if (!isDoubleTouchEvent(event)) {
    return 0;
  }

  const { touches } = event as TouchEvent;

  return Math.hypot(
    touches[0].clientX - touches[1].clientX,
    touches[0].clientY - touches[1].clientY
  );
}
