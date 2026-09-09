# Angular Color Picker

Angular color picker component with shade and saturation selection. Renders on Canvas, auto-scales and recalculates sizes on container resize.

## Installation

```bash
npm install @sashaseverfam/angular-color-picker
```

## Requirements

- Angular 21.2+
- Uses `OnPush` change detection

## Usage

### 1. Import

Standalone component — import directly in your component's `imports`:

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ColorPicker } from '@sashaseverfam/angular-color-picker';

@Component({
  selector: 'app-root',
  imports: [ColorPicker],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  color = signal('#2889e9');

  onColorChange(color: string | null) {
    this.color.set(color);
  }
}
```

```html
<lib-color-picker
  [inColor]="color()"
  (changeModel)="onColorChange($event)"
/>
```

## API

### Inputs

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `inColor` | `string \| null` | **required** | Current color (hex). Supports `#RGB` and `#RRGGBB`. |
| `colorDefault` | `string` | `'#000000'` | Default color when `hasTransparent = false` and no color is selected. |
| `hasTransparent` | `boolean` | `true` | Show "no color" (transparent) button. |
| `hasEyeDropper` | `boolean` | `false` | Show eyedropper icon. |
| `eyeColor` | `string \| null` | — | Color for eyedropper preview (separate from selected color). |

### Outputs

| Output | Type | Description |
|--------|------|-------------|
| `changeModel` | `string \| null` | Emits on every color change (input field, palette selection). |
| `changeEnd` | `void` | Emits when selection ends (mouse/touch release). |
| `startEye` | `Event` | Emits on eyedropper icon click. |

### Selector

```html
<lib-color-picker></lib-color-picker>
```

## Examples

### Basic

```html
<lib-color-picker
  [inColor]="'#ff5733'"
  (changeModel)="onColorChange($event)"
/>
```

### Without transparency

```html
<lib-color-picker
  [inColor]="color()"
  [hasTransparent]="false"
  [colorDefault]="'#ffffff'"
  (changeModel)="onColorChange($event)"
/>
```

### With eyedropper

```html
<lib-color-picker
  [inColor]="color()"
  [hasEyeDropper]="true"
  [eyeColor]="originalColor()"
  (changeModel)="onColorChange($event)"
  (changeEnd)="saveColor()"
  (startEye)="activateEyedropper()"
/>
```

## Styles

Component uses SCSS. Base styles are included automatically via `styleUrls`.

To customize, override CSS variables or styles via `::ng-deep`:

```scss
lib-color-picker {
  --color-box-border: #eaeaea;
  --color-box-radius: 3px;
}
```

## License

MIT
