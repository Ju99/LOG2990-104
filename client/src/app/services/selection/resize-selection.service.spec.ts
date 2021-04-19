import { TestBed } from '@angular/core/testing';
import { ResizeSelectionService } from './resize-selection.service';

describe('ResizeSelectionService', () => {
    let service: ResizeSelectionService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ResizeSelectionService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
