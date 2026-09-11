import { ColorBoxConvertService } from '../../services/color-box-convert.service';
import { ColorBoxCanvasService } from '../../services/color-box-canvas.service';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  DOCUMENT,
  effect,
  ElementRef,
  inject,
  input,
  output,
  ViewChild,
} from '@angular/core';
import { debounceTime, fromEvent } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  getEventRectCoords,
  getValueStyle,
  isEndEvent,
  isMoveEvent,
  isStartEvent,
} from '../../utils/color-box.util';
import { WINDOW, WINDOW_PROVIDERS } from '../../providers/window.providers';
import { isTouchEvent } from '../../utils/touch-events.utils';

@Component({
  selector: 'color-box',
  templateUrl: './color-box.component.html',
  styleUrls: ['./color-box.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [...WINDOW_PROVIDERS, ColorBoxCanvasService],
  standalone: true,
})
export class ColorBoxComponent {
  private readonly convertService = inject(ColorBoxConvertService);
  private readonly canvasService = inject(ColorBoxCanvasService);
  private readonly cdr = inject(ChangeDetectorRef);

  private readonly window = inject(WINDOW);
  private readonly document = inject(DOCUMENT);

  inputColorPicker = input('#fff');

  changeColor = output<string>();
  selectColor = output<string>();

  @ViewChild('spectrumCursor', { static: false, read: ElementRef })
  spectrumCursor?: ElementRef;
  @ViewChild('spectrumCanvas', { static: false, read: ElementRef })
  spectrumCanvas?: ElementRef;
  @ViewChild('hueCursor', { static: false, read: ElementRef })
  hueCursor?: ElementRef;
  @ViewChild('hueCanvas', { static: false, read: ElementRef })
  hueCanvas?: ElementRef;

  currentColor = '';
  changeHex = '';

  hue = 0;
  saturation = 1;
  lightness = 0.5;

  red = 0;
  green = 0;
  blue = 0;
  hex = '';

  private readonly destroyRef = inject(DestroyRef);

  private _activeDocListeners: Array<{
    type: string;
    handler: EventListener;
  }> = [];

  constructor() {
    afterNextRender(() => {
      this.init();
    });

    effect(() => {
      const color = this.inputColorPicker();
      if (color && color !== this.changeHex) {
        this.changeHex = color;
        const hsl = this.convertService.hexToHsl(this.changeHex);
        this.hue = hsl.h;
        this.colorToPosition(color);
      }
    });
  }

  ngOnDestroy(): void {
    this.removeDocumentListeners();
  }

  private init(): void {
    const spectrumCanvasElement = this.spectrumCanvas?.nativeElement;
    const hueCanvasElement = this.hueCanvas?.nativeElement;

    this.canvasService.init(spectrumCanvasElement, hueCanvasElement);

    this.createRectangleSpectrumListeners(spectrumCanvasElement);
    this.createHueSpectrumListeners(hueCanvasElement);
    this.colorToPosition(this.inputColorPicker());

    fromEvent(this.window, 'resize')
      .pipe(debounceTime(300), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.refreshColorPickerBox();
        this.cdr.detectChanges();
      });
  }

  private refreshColorPickerBox(): void {
    const spectrumCanvasElement = this.spectrumCanvas?.nativeElement;
    const hueCanvasElement = this.hueCanvas?.nativeElement;

    if (spectrumCanvasElement) {
      const curWidth = getValueStyle(spectrumCanvasElement, 'width');
      const curHeight = getValueStyle(spectrumCanvasElement, 'height');
      spectrumCanvasElement.width = curWidth;
      spectrumCanvasElement.height = curHeight;
    }

    if (hueCanvasElement) {
      const curWidth = getValueStyle(hueCanvasElement, 'width');
      const curHeight = getValueStyle(hueCanvasElement, 'height');
      hueCanvasElement.width = curWidth;
      hueCanvasElement.height = curHeight;
    }

    const hsl = this.convertService.hexToHsl(this.changeHex);
    this.hue = hsl.h;
    this.canvasService.createRectangleSpectrum(
      this.getHueColor(this.hue),
      spectrumCanvasElement,
    );
    this.canvasService.createHueSpectrum(hueCanvasElement);
    this.refreshPositionCursors();
  }

  private refreshPositionCursors(): void {
    const spectrumCanvasElement = this.spectrumCanvas?.nativeElement;
    const curWidth = getValueStyle(spectrumCanvasElement, 'width');
    const curHeight = getValueStyle(spectrumCanvasElement, 'height');
    const initWidth = this.canvasService.widthSpectrum;
    const initHeight = this.canvasService.heightSpectrum;

    if (curWidth !== initWidth || curHeight !== initHeight) {
      this.colorToPosition(this.changeHex);
      this.canvasService.widthSpectrum = curWidth;
      this.canvasService.heightSpectrum = curHeight;
    }
  }

  private createRectangleSpectrumListeners(canvas: HTMLCanvasElement): void {
    const handler = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();

      const rect = this.canvasService.spectrumRect;
      const { x, y } = getEventRectCoords(e, rect);
      const xRatio = (x / rect.width) * 100;
      const yRatio = (y / rect.height) * 100;
      const hsvValue = 1 - yRatio / 100;
      const hsvSaturation = xRatio / 100;

      this.lightness = Math.max(0, Math.min(1,
        (hsvValue / 2) * (2 - hsvSaturation)
      ));

      const saturationDivider = 1 - Math.abs(2 * this.lightness - 1);
      this.saturation = Math.max(0, Math.min(1,
        saturationDivider === 0 ? 0 : (hsvValue * hsvSaturation) / saturationDivider
      ));

      this.updateSpectrumCursor(x, y);
      this.emitColor(e);
    };

    canvas.addEventListener('mousedown', (e: MouseEvent) => {
      this.eventHandler(e, handler);
    });

    canvas.addEventListener('touchstart', (e: TouchEvent) => {
      this.eventHandler(e, handler);
    });
  }

  private createHueSpectrumListeners(canvas: HTMLCanvasElement): void {
    const handler = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();

      const rect = this.canvasService.hueRect;
      const { x } = getEventRectCoords(e, rect);

      const percent = rect.width > 0 ? x / rect.width : 0;
      this.hue = Math.max(0, Math.min(360, 360 * percent));

      const hueColor = `hsl(${this.hue} 100% 50%)`;
      this.canvasService.createRectangleSpectrum(hueColor, this.spectrumCanvas?.nativeElement);

      this.updateHueCursor(x);
      this.emitColor(e);
    };

    canvas.addEventListener('mousedown', (e: MouseEvent) => {
      this.eventHandler(e, handler);
    });

    canvas.addEventListener('touchstart', (e: TouchEvent) => {
      this.eventHandler(e, handler);
    });
  }

  private emitColor(e: MouseEvent | TouchEvent): void {
    const color = `hsl(${this.hue} ${this.saturation * 100}% ${this.lightness * 100}%)`;
    this.setColorValues(color);

    if (isStartEvent(e) || isMoveEvent(e)) {
      this.changeColorEmit(this.hex);
    }

    if (isEndEvent(e)) {
      this.changeColorEmit(this.hex);
      this.selectColor.emit(this.hex);
    }
  }

  changeColorEmit(hex: string): void {
    this.changeHex = hex;
    this.changeColor.emit(this.hex);
  }

  private setColorValues(color: string): void {
    this.currentColor = color;

    const [red, green, blue] = this.convertService.hslToRgb(
      this.hue,
      this.saturation,
      this.lightness,
    );

    this.red = red;
    this.green = green;
    this.blue = blue;
    this.hex = this.convertService.hslToHex(this.hue / 360, this.saturation, this.lightness);
  }

  private updateSpectrumCursor(x: number, y: number): void {
    if (this.spectrumCursor) {
      this.spectrumCursor.nativeElement.style.left = `${x}px`;
      this.spectrumCursor.nativeElement.style.top = `${y}px`;
    }
  }

  private updateHueCursor(x: number): void {
    if (this.hueCursor) {
      this.hueCursor.nativeElement.style.left = `${x}px`;
    }
  }

  private colorToPosition(hexColor: string): void {
    const spectrumRect = this.canvasService.spectrumRect;
    const hueRect = this.canvasService.hueRect;

    const hsl = this.convertService.hexToHsl(hexColor);
    this.hue = hsl.h;

    const [, hsvs, hsvv] = this.convertService.hexToHsv(hexColor);
    const x = spectrumRect.width * hsvs;
    const y = spectrumRect.height * (1 - hsvv);
    const hueX = (this.hue / 360) * hueRect.width;

    this.updateSpectrumCursor(x, y);
    this.updateHueCursor(hueX);

    this.canvasService.createRectangleSpectrum(
      this.getHueColor(this.hue),
      this.spectrumCanvas?.nativeElement,
    );
  }

  private getHueColor(h: number): string {
    return `hsl(${h} 100% 50%)`;
  }

  private eventHandler(
    e: MouseEvent | TouchEvent,
    handler: (event: MouseEvent | TouchEvent) => void,
  ): void {
    handler(e);

    if (!this.window || !this.document) {
      return;
    }

    if (e instanceof MouseEvent) {
      this.addDocumentListener('mousemove', handler as EventListener);
      this.addDocumentListener('mouseup', ((upEvent: MouseEvent) => {
        handler(upEvent);
        this.removeDocumentListeners();
      }) as EventListener);
    }

    if (isTouchEvent(e)) {
      this.addDocumentListener('touchmove', handler as EventListener);
      this.addDocumentListener('touchend', ((upEvent: TouchEvent) => {
        handler(upEvent);
        this.removeDocumentListeners();
      }) as EventListener);
      this.addDocumentListener('touchcancel', ((upEvent: TouchEvent) => {
        handler(upEvent);
        this.removeDocumentListeners();
      }) as EventListener);
    }
  }

  private addDocumentListener(type: string, handler: EventListener): void {
    this.document.addEventListener(type, handler);
    this._activeDocListeners.push({ type, handler });
  }

  private removeDocumentListeners(): void {
    for (const { type, handler } of this._activeDocListeners) {
      this.document.removeEventListener(type, handler);
    }
    this._activeDocListeners = [];
  }
}
