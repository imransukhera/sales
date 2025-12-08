import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookAppoitmentComponent } from './book-appoitment.component';

describe('BookAppoitmentComponent', () => {
  let component: BookAppoitmentComponent;
  let fixture: ComponentFixture<BookAppoitmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookAppoitmentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BookAppoitmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
