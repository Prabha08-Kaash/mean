import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrivatePolicy } from './private-policy';

describe('PrivatePolicy', () => {
  let component: PrivatePolicy;
  let fixture: ComponentFixture<PrivatePolicy>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrivatePolicy]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrivatePolicy);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
