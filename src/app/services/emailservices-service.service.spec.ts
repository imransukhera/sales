import { TestBed } from '@angular/core/testing';

import { EmailservicesServiceService } from './emailservices-service.service';

describe('EmailservicesServiceService', () => {
  let service: EmailservicesServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmailservicesServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
