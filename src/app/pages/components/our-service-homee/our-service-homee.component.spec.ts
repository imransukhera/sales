import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OurServiceHomeeComponent } from './our-service-homee.component';

describe('OurServiceHomeeComponent', () => {
  let component: OurServiceHomeeComponent;
  let fixture: ComponentFixture<OurServiceHomeeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OurServiceHomeeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OurServiceHomeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
