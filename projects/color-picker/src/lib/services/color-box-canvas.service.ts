import { Injectable } from '@angular/core';
import { getValueStyle } from '../utils/color-box.util';

@Injectable()
export class ColorBoxCanvasService {
  private _spectrumCanvas?: HTMLCanvasElement;
  private _hueCanvas?: HTMLCanvasElement;

  get spectrumRect(): DOMRect {
    return this._spectrumCanvas?.getBoundingClientRect() ?? new DOMRect();
  }

  get hueRect(): DOMRect {
    return this._hueCanvas?.getBoundingClientRect() ?? new DOMRect();
  }

  _widthSpectrum: number | null = null;
  get widthSpectrum(): number | null {
    return this._widthSpectrum;
  }
  set widthSpectrum(value: number | null) {
    this._widthSpectrum = value;
  }

  _heigthSpectrum: number | null = null;
  get heigthSpectrum(): number | null {
    return this._heigthSpectrum;
  }
  set heigthSpectrum(value: number | null) {
    this._heigthSpectrum = value;
  }

  public init(spectrumCanvas: HTMLCanvasElement, hueCanvas: HTMLCanvasElement) {
    this._spectrumCanvas = spectrumCanvas;
    this._hueCanvas = hueCanvas;

    const spectrumWidth = getValueStyle(this._spectrumCanvas, 'width');
    const spectrumHeight = getValueStyle(this._spectrumCanvas, 'height');
    const hueWidth = getValueStyle(this._hueCanvas, 'width');
    const hueHeight = getValueStyle(this._hueCanvas, 'height');

    this._spectrumCanvas.width = spectrumWidth;
    this._spectrumCanvas.height = spectrumHeight;
    this._hueCanvas.width = hueWidth;
    this._hueCanvas.height = hueHeight;

    this._widthSpectrum = spectrumWidth;
    this._heigthSpectrum = spectrumHeight;

    this.createRectangleSpectrum('red', this._spectrumCanvas);
    this.createHueSpectrum(this._hueCanvas);
  }

  public createRectangleSpectrum(
    color: string,
    canvas?: HTMLCanvasElement
  ): void {
    const context = canvas?.getContext('2d');

    if (!canvas || !context) {
      return;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = color;
    context.fillRect(0, 0, canvas.width, canvas.height);

    const whiteGradient = context.createLinearGradient(0, 0, canvas.width, 0);
    whiteGradient.addColorStop(0, '#fff');
    whiteGradient.addColorStop(1, 'transparent');
    context.fillStyle = whiteGradient;
    context.fillRect(0, 0, canvas.width, canvas.height);

    const blackGradient = context.createLinearGradient(0, 0, 0, canvas.height);
    blackGradient.addColorStop(0, 'transparent');
    blackGradient.addColorStop(1, '#000');
    context.fillStyle = blackGradient;
    context.fillRect(0, 0, canvas.width, canvas.height);
  }

  public createHueSpectrum(canvas?: HTMLCanvasElement): void {
    const context = canvas?.getContext('2d');

    if (!canvas || !context) {
      return;
    }

    const hueGradient = context.createLinearGradient(0, 0, canvas.width, 0);
    hueGradient.addColorStop(0.0, 'hsl(360, 100%, 50%)');
    hueGradient.addColorStop(0.17, 'hsl(61.2, 100%, 50%)');
    hueGradient.addColorStop(0.33, 'hsl(118.8, 100%, 50%)');
    hueGradient.addColorStop(0.5, 'hsl(180, 100%, 50%)');
    hueGradient.addColorStop(0.67, 'hsl(241.2, 100%, 50%)');
    hueGradient.addColorStop(0.83, 'hsl(298.8, 100%, 50%)');
    hueGradient.addColorStop(1.0, 'hsl(0, 100%, 50%)');
    context.fillStyle = hueGradient;
    context.fillRect(0, 0, canvas.width, canvas.height);
  }
}
