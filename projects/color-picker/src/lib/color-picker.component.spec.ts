import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ColorPicker } from './color-picker.component';

describe('ColorPicker', () => {
  let component: ColorPicker;
  let fixture: ComponentFixture<ColorPicker>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ColorPicker],
    }).compileComponents();

    fixture = TestBed.createComponent(ColorPicker);
    fixture.componentRef.setInput('inColor', '#000000');
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
