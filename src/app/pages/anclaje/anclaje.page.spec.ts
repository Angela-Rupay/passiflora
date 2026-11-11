import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AnclajePage } from './anclaje.page';

describe('AnclajePage', () => {
  let component: AnclajePage;
  let fixture: ComponentFixture<AnclajePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AnclajePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
