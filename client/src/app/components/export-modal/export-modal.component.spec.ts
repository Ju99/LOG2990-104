import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ExportModalComponent } from './export-modal.component';

// tslint:disable
describe('ExportModalComponent', () => {
    let fixture: ComponentFixture<ExportModalComponent>;
    let drawingServiceSpy: DrawingService;
    const mockDialogRef = {
        close: jasmine.createSpy('close'),
    };

    beforeEach(async(() => {
        drawingServiceSpy = new DrawingService();

        TestBed.configureTestingModule({
            declarations: [ExportModalComponent],
            imports: [MatIconModule, MatDialogModule, MatInputModule, MatFormFieldModule, FormsModule, BrowserAnimationsModule, MatTooltipModule],
            providers: [
                {
                    provide: MatDialogRef,
                    useValue: mockDialogRef,
                },
                {
                    provide: DrawingService,
                    useValue: drawingServiceSpy,
                },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ExportModalComponent);
        fixture.detectChanges();
    });
});
