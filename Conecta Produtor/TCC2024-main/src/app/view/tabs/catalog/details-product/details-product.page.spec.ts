import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetailsProductPage } from './details-product.page';

describe('DetailsProductPage', () => {
  let component: DetailsProductPage;
  let fixture: ComponentFixture<DetailsProductPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailsProductPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
