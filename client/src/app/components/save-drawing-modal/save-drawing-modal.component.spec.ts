import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { IndexService } from '@app/services/index/index.service';
import { of } from 'rxjs';
import { SaveDrawingModalComponent } from './save-drawing-modal.component';

// tslint:disable
describe('SaveDrawingModalComponent', () => {
    let component: SaveDrawingModalComponent;
    let fixture: ComponentFixture<SaveDrawingModalComponent>;
    let indexServiceSpy: jasmine.SpyObj<any>;
    let drawingServiceSpy: DrawingService;
    const mockDialogRef = {
        close: jasmine.createSpy('close'),
    };

    beforeEach(async(() => {
        drawingServiceSpy = new DrawingService();
        indexServiceSpy = jasmine.createSpyObj('IndexService', ['postDrawing']);

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
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('removeTag should remove tag in tags[] array', () => {
        const tagToRemove: string = 'testTag';
        const expectedValue: string[] = ['tag1', 'tag3'];
        component.tags = ['tag1', 'testTag', 'tag3'];
        component.removeTag(tagToRemove);
        expect(component.tags).toEqual(expectedValue);
        expect(component.tags.length).toEqual(expectedValue.length);
    });

    it('addTag should add tag to tags[] array', () => {
        const expectedValue: string[] = ['testTag'];
        component.tags = [];
        component.tagInput = 'testTag';
        component.addTag();
        expect(component.tags).toEqual(expectedValue);
        expect(component.tags.length).toEqual(expectedValue.length);
    });

    xit('sendToServer should close matdialog if drawing has been sent', () => {
        // // drawingServiceSpy.canvas = new CanvasTestHelper().canvas;
        // // console.log(drawingServiceSpy.canvas);
        // // spyOn(drawingServiceSpy.canvas, 'toDataURL').and.returnValue('data');
        // indexServiceSpy.postDrawing.and.returnValue(of(null));
        // spyOn(component, 'validateString').and.returnValue(true);
        // component.message = {
        //     title: 'title',
        //     labels: ['tags'],
        //     height: 0,
        //     width: 0,
        //     body: 'data',
        // };
        // component.sendToServer();
        // expect(mockDialogRef.close).toHaveBeenCalled();
    });

    it('sendToServer should not close matdialog if drawing has not been sent', () => {
        component.drawingTitle = 'invalid@#$%^';
        component.tags = ['blabla'];
        indexServiceSpy.postDrawing.and.returnValue(of(null));
        spyOn(component, 'validateString').and.returnValue(false);
        component.sendToServer();
        expect(mockDialogRef.close).not.toHaveBeenCalled();
    });

    it('validateTagDuplicate should return true if tag is duplicate', () => {
        component.tags = ['tag1', 'tag2', 'tag3'];
        component.tagInput = 'tag3';
        component.validateTagDuplicate();
        expect(component.validateTagDuplicate).toBeTruthy();
    });
});
