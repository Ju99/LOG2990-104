import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { IndexService } from '@app/services/index/index.service';
import { DrawingData } from '@common/communication/drawing-data';
import { SaveDrawingModalComponent } from './save-drawing-modal.component';

// tslint:disable
describe('SaveDrawingModalComponent', () => {
    let component: SaveDrawingModalComponent;
    let fixture: ComponentFixture<SaveDrawingModalComponent>;
    let indexServiceSpy: jasmine.SpyObj<any>;
    let drawingServiceSpy: DrawingService;
    let canvasTestHelper: CanvasTestHelper;
    let baseCtxSpy: CanvasRenderingContext2D;
    const mockDialogRef = {
        close: jasmine.createSpy('close'),
    };

    beforeEach(async(() => {
        indexServiceSpy = jasmine.createSpyObj('IndexService', ['postDrawing']);
        drawingServiceSpy = jasmine.createSpyObj('DrawingService', ['']);

        TestBed.configureTestingModule({
            declarations: [SaveDrawingModalComponent],
            imports: [MatIconModule, MatDialogModule, MatInputModule, MatFormFieldModule, FormsModule, BrowserAnimationsModule, MatTooltipModule],
            providers: [
                {
                    provide: MatDialogRef,
                    useValue: mockDialogRef,
                },
                {
                    provide: IndexService,
                    useValue: indexServiceSpy,
                },
                {
                    provide: DrawingService,
                    useValue: drawingServiceSpy,
                },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SaveDrawingModalComponent);
        component = fixture.componentInstance;

        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        component['drawingService'].baseCtx = baseCtxSpy;
        component['drawingService'].canvas = canvasTestHelper.canvas;

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('removeTag should remove tag in tags array', () => {
        const tagToRemove: string = 'testTag';
        const expectedValue: string[] = ['tag1', 'tag3'];
        component.tags = ['tag1', 'testTag', 'tag3'];
        component.removeTag(tagToRemove);
        expect(component.tags).toEqual(expectedValue);
        expect(component.tags.length).toEqual(expectedValue.length);
    });

    it('addTag should add tag to tags array', () => {
        const expectedValue: string[] = ['testTag'];
        component.tags = [];
        component.tagInput = 'testTag';
        component.addTag();
        expect(component.tags).toEqual(expectedValue);
        expect(component.tags.length).toEqual(expectedValue.length);
    });

    it('addTag should not add tag if string is not valid', () => {
        spyOn<any>(component, 'validateNumberOfTags').and.returnValue(false);
        component.addTag();
        expect(component.tags.length).toEqual(0);
    });

    it('should send drawing to server if title is valid', async () => {
        spyOn(component, 'validateString').and.returnValue(true);
        spyOn<any>(component['drawingService'].canvas, 'toDataURL').and.returnValue('datalurl');

        const message: DrawingData = {
            title: 'valid',
            labels: ['tag'],
            height: 100,
            width: 100,
            body: 'data-url',
        };
        const getDrawingDataSpy = spyOn<any>(component, 'getDrawingData').and.returnValue(message);
        indexServiceSpy.postDrawing.and.callFake(() => {
            return Promise.resolve();
        });

        component.sendToServer();
        expect(getDrawingDataSpy).toHaveBeenCalled();
        expect(indexServiceSpy.postDrawing).toHaveBeenCalled();
    });

    it('should not send drawing to server if title is invalid', async () => {
        spyOn(component, 'validateString').and.returnValue(false);
        const getDrawingDataSpy = spyOn<any>(component, 'getDrawingData').and.stub();

        component.sendToServer();
        expect(getDrawingDataSpy).not.toHaveBeenCalled();
        expect(indexServiceSpy.postDrawing).not.toHaveBeenCalled();
    });

    it('shoul display an alert error message if drawing is not send to server', async () => {
        spyOn(component, 'validateString').and.returnValue(true);
        spyOn<any>(component['drawingService'].canvas, 'toDataURL').and.returnValue('datalurl');
        const alertSpy = spyOn<any>(window, 'alert').and.stub();

        const message: DrawingData = {
            title: 'valid',
            labels: ['tag'],
            height: 100,
            width: 100,
            body: 'data-url',
        };
        const getDrawingDataSpy = spyOn<any>(component, 'getDrawingData').and.returnValue(message);

        indexServiceSpy.postDrawing.and.callFake(() => {
            return Promise.reject(alert('error message'));
        });

        component.sendToServer();
        expect(getDrawingDataSpy).toHaveBeenCalled();
        expect(indexServiceSpy.postDrawing).toHaveBeenCalled();
        expect(alertSpy).toHaveBeenCalled();
    });

    it('validateTagDuplicate should return true if tag is duplicate', () => {
        component.tags = ['tag1', 'tag2', 'tag3'];
        component.tagInput = 'tag3';
        component.validateTagDuplicate();
        expect(component.validateTagDuplicate).toBeTruthy();
    });

    xit('should return correct drawing data', () => {
        spyOn<any>(drawingServiceSpy.canvas, 'toDataURL').and.returnValue('dataurl');

        component.drawingTitle = 'title';
        component.tags = ['tag'];
        component['drawingService'].baseCtx.canvas.height = 100;
        component['drawingService'].baseCtx.canvas.width = 100;

        const expectedResult = {
            title: 'title',
            tags: ['tags'],
            height: 100,
            width: 100,
            body: 'dataurl',
        };

        const result = component['getDrawingData']();
        expect(result).toEqual(expectedResult);
    });
});
