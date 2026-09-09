import { ColorBoxConvertService } from '../../services/color-box-convert.service';
import { ColorBoxCanvasService } from '../../services/color-box-canvas.service';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DOCUMENT,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { debounceTime, fromEvent, Subscription } from 'rxjs';
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
export class ColorBoxComponent implements OnDestroy, OnChanges {
  private readonly convertService = inject(ColorBoxConvertService);
  private readonly canvasService = inject(ColorBoxCanvasService);
  private readonly cdr = inject(ChangeDetectorRef);

  private readonly window = inject(WINDOW);
  private readonly document = inject(DOCUMENT);

  @Input() inputColorPicker = '#fff';

  @Output() changeColor = new EventEmitter<string>();
  @Output() selectColor = new EventEmitter<string>();

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

  red: unknown;
  green: unknown;
  blue: unknown;
  hex!: string;

  private _subs: Subscription[] = [];
  set subs(sub: Subscription) {
    this._subs.push(sub);
  }

  constructor() {
    afterNextRender(() => {
      this.init();
    });
  }

  private init(): void {
    const spectrumCanvasElement = this.spectrumCanvas?.nativeElement;
    const hueCanvasElement = this.hueCanvas?.nativeElement;

    this.canvasService.init(spectrumCanvasElement, hueCanvasElement);

    this.createRectangleSpectrumListeners(spectrumCanvasElement);
    this.createHueSpectrumListeners(hueCanvasElement);
    this.colorToPosition(this.inputColorPicker);

    this.subs = fromEvent(this.window, 'resize')
      .pipe(debounceTime(300))
      .subscribe(() => {
        this.refreshColorPickerBox();
        this.cdr.detectChanges();
      });
  }

  ngOnDestroy() {
    this._subs.forEach((s) => s.unsubscribe());
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['inputColorPicker'] && this.inputColorPicker !== this.changeHex) {
      this.changeHex = this.inputColorPicker;
      const hsl = this.convertService.hexToHsl(this.changeHex);
      this.hue = hsl.h;
      this.colorToPosition(this.inputColorPicker);
    }
  }

  private refreshColorPickerBox(): void {
    const hsl = this.convertService.hexToHsl(this.changeHex);
    this.hue = hsl.h;
    this.canvasService.createRectangleSpectrum(
      this.getHueColor(this.hue),
      this.spectrumCanvas?.nativeElement,
    );
    this.refreshPositionCursors();
  }

  private refreshPositionCursors() {
    const spectrumCanvasElement = this.spectrumCanvas?.nativeElement;
    const curWidth = getValueStyle(spectrumCanvasElement, 'width');
    const curHeight = getValueStyle(spectrumCanvasElement, 'height');
    const initWidth = this.canvasService.widthSpectrum;
    const initHeight = this.canvasService.heigthSpectrum;

    if (curWidth !== initWidth || curHeight !== initHeight) {
      this.colorToPosition(this.changeHex);
      this.canvasService.widthSpectrum = curWidth;
      this.canvasService.heigthSpectrum = curHeight;
    }
  }

  private createRectangleSpectrumListeners(canvas: HTMLCanvasElement) {
    const getSpectrumColor = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();

      const spectrumRect = this.canvasService.spectrumRect;
      const { x, y } = getEventRectCoords(e, spectrumRect);
      const xRatio = (x / spectrumRect.width) * 100;
      const yRatio = (y / spectrumRect.height) * 100;
      const hsvValue = 1 - yRatio / 100;
      const hsvSaturation = xRatio / 100;

      this.lightness = (hsvValue / 2) * (2 - hsvSaturation);

      const saturationDevider = 1 - Math.abs(2 * this.lightness - 1);
      this.saturation =
        saturationDevider === 0 ? 0 : (hsvValue * hsvSaturation) / saturationDevider;

      const color = `hsl ${this.hue} ${this.saturation} ${this.lightness}`;

      this.updateSpectrumCursor(x, y);
      this.setColorValues(color);

      if (isStartEvent(e)) {
        this.changeColorEmit(this.hex);
      }

      if (isMoveEvent(e)) {
        this.changeColorEmit(this.hex);
      }

      if (isEndEvent(e)) {
        this.changeColorEmit(this.hex);
        this.selectColor.emit(this.hex);
      }
    };

    canvas.addEventListener('mousedown', (e: MouseEvent) => {
      this.eventHandler(e, getSpectrumColor);
    });

    canvas.addEventListener('touchstart', (e: TouchEvent) => {
      this.eventHandler(e, getSpectrumColor);
    });
  }

  private createHueSpectrumListeners(canvas: HTMLCanvasElement) {
    const getHueColor = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();

      const hueRect = this.canvasService.hueRect;
      const { x } = getEventRectCoords(e, hueRect);

      const percent = x / hueRect.width;
      this.hue = 360 * percent;

      const hueColor = `hsl(${this.hue} 100% 50%)`;
      const color = `hsl(
        ${this.hue}
        ${this.saturation * 100}%
        ${this.lightness * 100}%
      )`;

      this.canvasService.createRectangleSpectrum(hueColor, this.spectrumCanvas?.nativeElement);

      this.updateHueCursor(x);
      this.setColorValues(color);

      if (isStartEvent(e)) {
        this.changeColorEmit(this.hex);
      }

      if (isMoveEvent(e)) {
        this.changeColorEmit(this.hex);
      }

      if (isEndEvent(e)) {
        this.changeColorEmit(this.hex);
        this.selectColor.emit(this.hex);
      }
    };

    canvas.addEventListener('mousedown', (e: MouseEvent | TouchEvent) => {
      this.eventHandler(e, getHueColor);
    });

    canvas.addEventListener('touchstart', (e: TouchEvent) => {
      this.eventHandler(e, getHueColor);
    });
  }

  changeColorEmit(hex: string) {
    this.changeHex = hex;
    this.changeColor.emit(this.hex);
  }

  private setColorValues(color: string) {
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
      this.spectrumCursor.nativeElement.style.left = x + 'px';
      this.spectrumCursor.nativeElement.style.top = y + 'px';
    }
  }

  private updateHueCursor(x: number): void {
    if (this.hueCursor) {
      this.hueCursor.nativeElement.style.left = x + 'px';
    }
  }

  private colorToPosition(hexColor: string) {
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
  ) {
    handler(e);

    if (!this.window || !this.document) {
      return;
    }

    if (e instanceof MouseEvent) {
      this.document.addEventListener('mousemove', handler);

      const mouseUpEvent = (e: MouseEvent) => {
        handler(e);
        this.document.removeEventListener('mousemove', handler);
        this.document.removeEventListener('mouseup', mouseUpEvent);
      };
      this.document.addEventListener('mouseup', mouseUpEvent);
    }

    if (isTouchEvent(e)) {
      this.document.addEventListener('touchmove', handler);

      const touchUpEvent = (e: TouchEvent) => {
        handler(e);
        this.document.removeEventListener('touchmove', handler);
        this.document.removeEventListener('touchend', touchUpEvent);
        this.document.removeEventListener('touchcancel', touchUpEvent);
      };
      this.document.addEventListener('touchend', touchUpEvent);
      this.document.addEventListener('touchcancel', touchUpEvent);
    }
  }
}
