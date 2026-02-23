import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NocTableComponent } from './noc-table.component';

describe('NocTableComponent', () => {
  let component: NocTableComponent;
  let fixture: ComponentFixture<NocTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NocTableComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NocTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
