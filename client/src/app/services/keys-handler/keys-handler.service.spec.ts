import { TestBed } from '@angular/core/testing';

import { KeysHandlerService } from './keys-handler.service';

describe('KeysHandlerService', () => {
  let service: KeysHandlerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(KeysHandlerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
