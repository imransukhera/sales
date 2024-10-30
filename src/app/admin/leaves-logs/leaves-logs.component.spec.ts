import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeavesLogsComponent } from './leaves-logs.component';

describe('LeavesLogsComponent', () => {
  let component: LeavesLogsComponent;
  let fixture: ComponentFixture<LeavesLogsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeavesLogsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LeavesLogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
