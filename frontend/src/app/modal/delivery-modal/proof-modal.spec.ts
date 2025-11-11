import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProofModal } from './proof-modal';

describe('ProofModal', () => {
  let component: ProofModal;
  let fixture: ComponentFixture<ProofModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProofModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProofModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
