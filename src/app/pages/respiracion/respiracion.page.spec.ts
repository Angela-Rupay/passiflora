import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RespiracionPage } from './respiracion.page';

describe('RespiracionPage', () => {
  let component: RespiracionPage;
  let fixture: ComponentFixture<RespiracionPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RespiracionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
