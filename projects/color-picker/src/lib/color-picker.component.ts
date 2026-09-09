import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
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
export class ColorPicker implements OnChanges {
  @Input() eyeColor?: string | null;
  @Input() inColor!: string | null; // hex
  @Input() hasTransparent = true;
  @Input() hasEyeDropper = false;
  @Input() colorDefault = '#000000';

  @Output() changeModel: EventEmitter<string | null> = new EventEmitter<string | null>();
  @Output() changeEnd: EventEmitter<void> = new EventEmitter<void>();
  @Output() startEye: EventEmitter<Event> = new EventEmitter<Event>();

  currentColor: string | null = this.inColor;

  get defaultColor(): string | null {
    return this.hasTransparent ? null : this.colorDefault;
  }

  get isTransparent(): boolean {
    return !this.currentColor && this.hasTransparent;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['inColor']) {
      this.currentColor = this.inColor;
    }
  }

  changeInput(event: Event) {
    const color = (event.target as HTMLInputElement).value;
    this.selectColor(color);
  }

  changeColor(color: string) {
    this.currentColor = color;
    this.changeModel.emit(color);
  }

  selectColor(color: string | null) {
    this.currentColor = color || this.defaultColor;
    this.changeModel.emit(color);
    this.changeEnd.emit();
  }
}
