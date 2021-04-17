import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { IndexService } from '@app/services/index/index.service';
import { Drawing } from '@common/communication/drawing';
import { CarouselComponent } from './carousel.component';
//tslint:disable
describe('CarouselComponent', () => {
    let component: CarouselComponent;
    let fixture: ComponentFixture<CarouselComponent>;
    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;

    let routerSpy = jasmine.createSpyObj('Router', {
        navigate: new Promise<boolean>(() => {
            return;
        }),
    });
    const dialogSpy = jasmine.createSpy('close');

    beforeEach(async(() => {
        drawingServiceSpy = jasmine.createSpyObj('DrawingService', ['']);

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, RouterTestingModule, MatDialogModule, MatProgressSpinnerModule],
            declarations: [CarouselComponent],
            providers: [
                { provide: MatDialogRef, useValue: { close: dialogSpy } },
                { provide: MAT_DIALOG_DATA, useValue: {} },
                { provide: Router, useValue: routerSpy },
                { provide: DrawingService, useValue: drawingServiceSpy },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CarouselComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should update drawing when new tag', () => {
        const searchSpy = spyOn(component, 'searchbyTags').and.stub();
        component.tagInput = 'test';
        component.addTag();
        expect(component.tags.length).toBeGreaterThan(0);
        expect(searchSpy).toHaveBeenCalled();
    });

    it('should update drawing when remove tag', () => {
        const searchSpy = spyOn(component, 'searchbyTags').and.stub();
        const tagToRemove: string = 'testTag';
        const expectedValue: string[] = ['tag1', 'tag3'];
        component.tags = ['tag1', 'testTag', 'tag3'];
        component.removeTag(tagToRemove);
        expect(component.tags).toEqual(expectedValue);
        expect(component.tags.length).toEqual(expectedValue.length);
        expect(searchSpy).toHaveBeenCalled();
    });

    it('should open chosen drawing in editor', (done) => {
        drawingServiceSpy.canvas = document.createElement('canvas');
        routerSpy.navigate.and.returnValue(Promise.resolve());
        component['mainDrawingURL'] = 'poly.png';
        component.openDrawing();

        fixture.whenStable().then(() => {
            fixture.detectChanges();
            expect(routerSpy.navigate).toHaveBeenCalledWith(['editor', { url: 'poly.png' }]);
            done();
            expect(dialogSpy).toHaveBeenCalled();
        });
    });

    it('should change isCanvaEmpty to true when null', () => {
        drawingServiceSpy.canvas = document.createElement('canvas');
        drawingServiceSpy.canvas.width = 100;
        drawingServiceSpy.canvas.height = 100;
        component.isCanvaEmpty = null!;
        component.loadImage();
        expect(component.isCanvaEmpty).toBeTrue();
    });

    it('should not set isCanvaEmpty to true when isCanvasEmpty is not null', () => {
        drawingServiceSpy.canvas = document.createElement('canvas');
        drawingServiceSpy.canvas.width = 100;
        drawingServiceSpy.canvas.height = 100;
        component.isCanvaEmpty = false!;
        component.loadImage();
        expect(component.isCanvaEmpty).toBeFalse();
    });

    it('should open drawing if canvas is NOT empty', () => {
        component.isCanvaEmpty = false;
        component['decision'] = true;
        spyOn<any>(window, 'confirm').and.returnValue(true);
        const openDrawingSpy = spyOn<any>(component, 'openDrawing').and.stub();
        component.loadImage();
        expect(openDrawingSpy).toHaveBeenCalled();
    });

    it('should open drawing if canvas is empty', () => {
        component.isCanvaEmpty = false;

        spyOn<any>(window, 'confirm').and.returnValue(false);
        const openDrawingSpy = spyOn<any>(component, 'openDrawing').and.stub();
        component.loadImage();
        expect(openDrawingSpy).not.toHaveBeenCalled();
    });

    it('should update images when next', () => {
        component['index'] = 0;
        let spyUpdateImageURL = spyOn<any>(component, 'updateImagePlacement');
        let spyMainImage = spyOn<any>(component, 'updateMainImageURL');

        component.nextImages();

        expect(spyUpdateImageURL).toHaveBeenCalled();
        expect(spyMainImage).toHaveBeenCalled();
        expect(component['index']).toEqual(1);
    });

    it('should update images when previous', () => {
        component['index'] = 1;
        let spyUpdateImageURL = spyOn<any>(component, 'updateImagePlacement');
        let spyMainImage = spyOn<any>(component, 'updateMainImageURL');

        component.previousImages();

        expect(spyUpdateImageURL).toHaveBeenCalled();
        expect(spyMainImage).toHaveBeenCalled();
        expect(component['index']).toEqual(0);
    });

    it('should give right modulo', () => {
        let testResult = component.mod(-1, 4);
        expect(testResult).toBe(3);
    });

    it('should put the right image on placement', () => {
        let draw = new Drawing('test', [], 'test.png');
        component.imageCards = [draw];
        component.placement = [];

        component.updateImagePlacement();

        expect(component.placement[0]).toBe(draw);
        expect(component.placement[1]).toBe(draw);
        expect(component.placement[2]).toBe(draw);
    });

    it('should put the right drawing in the middle', () => {
        let draw = new Drawing('test', [], 'test.png');
        component.placement[1] = draw;

        component.updateMainImageURL();

        expect(component['mainDrawingURL']).toBe(draw.imageURL!);
    });

    it('should change to previous when arrowleft pressed', async () => {
        let keyboardEvent = { code: 'ArrowLeft', preventDefault(): void {} } as KeyboardEvent;
        let spy = spyOn(component, 'previousImages').and.stub();

        component.handleKeyDown(keyboardEvent);

        expect(spy).toHaveBeenCalled();
    });

    it('should change to previous when arrowleft pressed', async () => {
        let keyboardEvent = { code: 'ArrowRight', preventDefault(): void {} } as KeyboardEvent;
        let spy = spyOn(component, 'nextImages').and.stub();

        component.handleKeyDown(keyboardEvent);

        expect(spy).toHaveBeenCalled();
    });

    it('should collect all drawings on getDrawings', async () => {
        let getAllDrawingsSpy: jasmine.Spy;
        getAllDrawingsSpy = spyOn(IndexService.prototype, 'getAllDrawings').and.returnValue(Promise.resolve([]));

        component.getDrawings();

        expect(getAllDrawingsSpy).toHaveBeenCalledTimes(1);
    });

    it('should get drawings of tag', async () => {
        let searchByTag: jasmine.Spy;
        component['mainDrawingURL'] = 'http://localhost:3000/api/database/drawings/605a9a7be06fb909f0c904e5.png';
        searchByTag = spyOn(IndexService.prototype, 'searchByTags').and.returnValue(Promise.resolve([]));
        component.searchbyTags();
        expect(searchByTag).toHaveBeenCalled();
    });

    it('should delete drawing', async () => {
        let deleteSpy: jasmine.Spy;
        component['mainDrawingURL'] = 'http://localhost:3000/api/database/drawings/605a9a7be06fb909f0c904e5.png';
        deleteSpy = spyOn(IndexService.prototype, 'deleteDrawingById').and.returnValue(Promise.resolve());
        component.deleteDrawing();
        expect(deleteSpy).toHaveBeenCalled();
    });
});
