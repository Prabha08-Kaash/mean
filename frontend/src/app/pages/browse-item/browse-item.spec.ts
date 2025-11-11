import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrowseItem } from './browse-item';

describe('BrowseItem', () => {
  let component: BrowseItem;
  let fixture: ComponentFixture<BrowseItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrowseItem]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BrowseItem);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
