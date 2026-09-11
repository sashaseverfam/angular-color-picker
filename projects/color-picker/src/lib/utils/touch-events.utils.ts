export function isTouchEvent(event: Event): event is TouchEvent {
  try {
    return event instanceof TouchEvent;
  } catch {
    return false;
  }
}
