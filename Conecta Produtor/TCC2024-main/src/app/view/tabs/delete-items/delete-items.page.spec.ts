import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DeleteItemsPage } from './delete-items.page';

describe('DeleteItemsPage', () => {
  let component: DeleteItemsPage;
  let fixture: ComponentFixture<DeleteItemsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteItemsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
