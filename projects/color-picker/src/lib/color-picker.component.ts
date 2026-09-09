import {
  ChangeDetectionStrategy,
  Component,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ColorBoxComponent } from './components/color-box/color-box.component';

@Component({
  selector: 'lib-color-picker',
  imports: [CommonModule, ColorBoxComponent],
  templateUrl: './color-picker.component.html',
  styleUrls: ['./color-picker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColorPicker {
  inColor = input.required<string | null>();
  eyeColor = input<string | null>(null);
  hasTransparent = input(true);
  hasEyeDropper = input(false);
  colorDefault = input('#000000');

  changeModel = output<string | null>();
  changeEnd = output();
  startEye = output<Event>();

  currentColor = signal<string | null>(null);

  constructor() {
    effect(() => {
      this.currentColor.set(this.inColor());
    });
  }

  get defaultColor(): string | null {
    return this.hasTransparent() ? null : this.colorDefault();
  }

  get isTransparent(): boolean {
    return !this.currentColor() && this.hasTransparent();
  }

  changeInput(event: Event) {
    const color = (event.target as HTMLInputElement).value;
    this.selectColor(color);
  }

  changeColor(color: string) {
    this.currentColor.set(color);
    this.changeModel.emit(color);
  }

  selectColor(color: string | null) {
    this.currentColor.set(color || this.defaultColor);
    this.changeModel.emit(color);
    this.changeEnd.emit();
  }
}
