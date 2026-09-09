import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ColorPicker } from 'color-picker';

@Component({
  selector: 'app-root',
  imports: [ColorPicker],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly title = signal('angular-color-picker');
  color = '#2889e9';
  originalColor = '#2889e9';

  public onChangeColor(color: string | null) {
    this.color = color || '#FFFFFF';
  }

  public saveColor() {
    this.originalColor = this.color;
  }

  public async activateEyedropper() {
    if (!('EyeDropper' in window)) {
      return;
    }
    try {
      const eyeDropper = new (window as any).EyeDropper();
      const result = await eyeDropper.open();
      this.color = result.sRGBHex;
    } catch {
      // пользователь отменил выбор
    }
  }
}
