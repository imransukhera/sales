import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewBugDetailComponent } from './view-bug-detail.component';

describe('ViewBugDetailComponent', () => {
  let component: ViewBugDetailComponent;
  let fixture: ComponentFixture<ViewBugDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewBugDetailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewBugDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
