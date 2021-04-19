import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ExportService } from '@app/services/export-image/export.service';
import { ExportModalComponent } from './export-modal.component';
// tslint:disable
describe('ExportModalComponent', () => {
    let component: ExportModalComponent;
    let fixture: ComponentFixture<ExportModalComponent>;
    let exportServiceSpy: ExportService;
    const mockDialogRef = {
        close: jasmine.createSpy('close'),
    };

    beforeEach(async(() => {
        exportServiceSpy = jasmine.createSpyObj('ExportService', ['baseCtx', 'canvas', 'drawingTitle', 'exportDrawing', 'uploadToImgur']);

        TestBed.configureTestingModule({
            declarations: [ExportModalComponent],
            imports: [
                MatIconModule,
                MatDialogModule,
                MatInputModule,
                MatFormFieldModule,
                FormsModule,
                BrowserAnimationsModule,
                MatTooltipModule,
                MatSelectModule,
                ReactiveFormsModule,
                BrowserAnimationsModule,
            ],
            providers: [
                {
                    provide: MatDialogRef,
                    useValue: mockDialogRef,
                },
                {
                    provide: ExportService,
                    useValue: exportServiceSpy,
                },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ExportModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should export drawing if validate string ', () => {
        spyOn(component, 'validateString').and.returnValue(true);
        component.exportDrawing();
        expect(exportServiceSpy.exportDrawing).toHaveBeenCalled();
    });

    it('should ask to verify format when trying to export but invalid string ', () => {
        spyOn(component, 'validateString').and.returnValue(false);
        const alerSpy = spyOn(window, 'alert').and.stub();
        component.exportDrawing();
        expect(alerSpy).toHaveBeenCalled();
    });

    it('should call service upload to imgur ', () => {
        component.uploadToImgur();
        expect(exportServiceSpy.uploadToImgur).toHaveBeenCalled();
    });

    it('should verify if input string is valid', () => {
        const result = component.validateString('abc');
        expect(result).toBeTruthy;
    });

    it('should change to imgur is selected', () => {
        component.imgurIsSelected = false;
        component.changeImgurSelection(true);
        expect(component.imgurIsSelected).toBe(true);
    });

    it('should change imgur url to empty string when close modal', () => {
        component['exportService'].imgurURL = 'blablabla';
        component.closeModal();
        expect(component['exportService'].imgurURL).toEqual('');
    });
});
