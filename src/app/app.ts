import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  signal,
  ViewChild,
} from '@angular/core';
import { ColorPicker } from 'color-picker';

@Component({
  selector: 'app-root',
  imports: [ColorPicker],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App implements AfterViewInit, OnDestroy {
  protected readonly title = signal('angular-color-picker');
  color = signal('#2889e9');
  originalColor = signal('#2889e9');

  @ViewChild('resizableContainer') resizableContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('resizeHandle') resizeHandle!: ElementRef<HTMLDivElement>;

  private resizeObserver?: ResizeObserver;
  private isDragging = false;
  private startX = 0;
  private startY = 0;
  private startWidth = 0;
  private startHeight = 0;

  ngAfterViewInit() {
    this.resizeObserver = new ResizeObserver(() => {
      window.dispatchEvent(new Event('resize'));
    });
    this.resizeObserver.observe(this.resizableContainer.nativeElement);

    this.resizeHandle.nativeElement.addEventListener('mousedown', this.onMouseDown);
  }

  ngOnDestroy() {
    this.resizeObserver?.disconnect();
    this.resizeHandle.nativeElement.removeEventListener('mousedown', this.onMouseDown);
  }

  onMouseDown = (e: MouseEvent) => {
    e.preventDefault();
    this.isDragging = true;
    this.startX = e.clientX;
    this.startY = e.clientY;
    const rect = this.resizableContainer.nativeElement.getBoundingClientRect();
    this.startWidth = rect.width;
    this.startHeight = rect.height;

    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseUp);
  };

  onMouseMove = (e: MouseEvent) => {
    if (!this.isDragging) return;
    const dx = e.clientX - this.startX;
    const dy = e.clientY - this.startY;
    const newWidth = Math.max(150, this.startWidth + dx);
    const newHeight = Math.max(100, this.startHeight + dy);
    this.resizableContainer.nativeElement.style.width = `${newWidth}px`;
    this.resizableContainer.nativeElement.style.height = `${newHeight}px`;
  };

  onMouseUp = () => {
    this.isDragging = false;
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
  };

  public onChangeColor(color: string | null) {
    this.color.set(color || '#FFFFFF');
  }

  public saveColor() {
    this.originalColor.set(this.color());
  }

  public async activateEyedropper() {
    if (!('EyeDropper' in window)) {
      return;
    }
    try {
      const eyeDropper = new (window as any).EyeDropper();
      const result = await eyeDropper.open();
      this.color.set(result.sRGBHex);
    } catch {
      // user cancelled
    }
  }
}
