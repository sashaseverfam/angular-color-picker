# Angular Color Picker

Angular-компонент палитры цветов с выбором оттенка и насыщенности. Рендерится на Canvas, автоматически масштабируется и пересчитывает размеры при изменении контейнера.

## Установка

```bash
npm install @sashaseverfam/angular-color-picker
```

## Требования

- Angular 21.2+
- Используется `OnPush` change detection

## Использование

### 1. Импорт

Компонент standalone, импортируйте напрямую в `imports` вашего компонента:

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

## API

### Inputs

| Input | Тип | Дефолт | Описание |
|-------|-----|--------|----------|
| `inColor` | `string \| null` | — | Текущий цвет (hex). Поддерживает `#RGB` и `#RRGGBB`. |
| `colorDefault` | `string` | `'#000000'` | Цвет по умолчанию, если `hasTransparent = false` и цвет не выбран. |
| `hasTransparent` | `boolean` | `true` | Показывать ли кнопку «без цвета» (прозрачный). |
| `hasEyeDropper` | `boolean` | `false` | Показывать ли иконку пипетки. |
| `eyeColor` | `string \| null` | — | Цвет для превью пипетки (отдельно от выбранного). |

### Outputs

| Output | Тип | Описание |
|--------|-----|----------|
| `changeModel` | `string \| null` | Эмитится при каждом изменении цвета (ввод в поле, выбор на палитре). |
| `changeEnd` | `void` | Эмитится при завершении выбора (отпускание кнопки мыши / пальца). |
| `startEye` | `Event` | Эмитится при клике на иконку пипетки. |

### Селектор

```html
<lib-color-picker></lib-color-picker>
```

## Примеры

### Базовый

```html
<lib-color-picker
  [inColor]="'#ff5733'"
  (changeModel)="onColorChange($event)"
/>
```

### Без прозрачности

```html
<lib-color-picker
  [inColor]="color"
  [hasTransparent]="false"
  [colorDefault]="'#ffffff'"
  (changeModel)="onColorChange($event)"
/>
```

### С пипеткой

```html
<lib-color-picker
  [inColor]="color"
  [hasEyeDropper]="true"
  [eyeColor]="originalColor"
  (changeModel)="onColorChange($event)"
  (changeEnd)="saveColor()"
  (startEye)="activateEyedropper()"
/>
```

## Стили

Компонент использует SCSS. Базовые стили подключаются автоматически через `styleUrls`.

Для кастомизации переопределите CSS-переменные или стили через `::ng-deep`:

```scss
lib-color-picker {
  --color-box-border: #eaeaea;
  --color-box-radius: 3px;
}
```

## Лицензия

MIT
