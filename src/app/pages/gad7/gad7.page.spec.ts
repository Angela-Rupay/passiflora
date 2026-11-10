import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Gad7Page } from './gad7.page';

describe('Gad7Page', () => {
  let component: Gad7Page;
  let fixture: ComponentFixture<Gad7Page>;

  beforeEach(() => {
    fixture = TestBed.createComponent(Gad7Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
