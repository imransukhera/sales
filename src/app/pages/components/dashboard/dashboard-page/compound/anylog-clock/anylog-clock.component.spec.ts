import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnylogClockComponent } from './anylog-clock.component';

describe('AnylogClockComponent', () => {
  let component: AnylogClockComponent;
  let fixture: ComponentFixture<AnylogClockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnylogClockComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AnylogClockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
