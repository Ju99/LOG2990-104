import { TestBed } from '@angular/core/testing';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { DrawingData } from '@common/communication/drawing-data';
import { AutoSaveService } from './auto-save.service';

// tslint:disable
describe('AutoSaveService', () => {
    let service: AutoSaveService;
    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
    let baseCtxSpy: CanvasRenderingContext2D;

    let drawingTest: DrawingData = {
        title: '',
        labels: [],
        width: 100,
        height: 100,
        body: 'dataurl',
    };

    beforeEach(() => {
        drawingServiceSpy = jasmine.createSpyObj('DrawingService', ['']);
        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawingServiceSpy }],
        });
        service = TestBed.inject(AutoSaveService);
        baseCtxSpy = jasmine.createSpyObj('CanvasRenderingContext', ['drawImage']);
        service['drawingService'].baseCtx = baseCtxSpy;
        localStorage.clear();
    });

    afterEach(() => {
        localStorage.clear();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should save canvas state', () => {
        expect(localStorage.length).toEqual(0);
        service.saveCanvasState(drawingTest);
        expect(localStorage.length).toEqual(1);
    });

    it('should draw image on canvas', () => {
        service.saveCanvasState(drawingTest);
        service.loadImage();

        if (service['canvasImage'].onload) {
            service['canvasImage'].onload({} as any);
        }
        expect(drawingServiceSpy.baseCtx.drawImage).toHaveBeenCalled();
    });

    it('should NOT call drawImage if local storage item is undefined', () => {
        service.loadImage();
        if (service['canvasImage'].onload) {
            service['canvasImage'].onload({} as any);
        }
        expect(drawingServiceSpy.baseCtx.drawImage).not.toHaveBeenCalled();
    });

    it('should clear local storage', () => {
        localStorage.setItem('key1', 'value1');
        localStorage.setItem('key2', 'value2');
        expect(localStorage.length).toEqual(2);
        service.clearLocalStorage();
        expect(localStorage.length).toEqual(0);
    });

    it('should return true if localStorage is empty', () => {
        localStorage.clear();
        const result = service.localStorageIsEmpty();
        expect(result).toBeTrue();
    });

    it('should return false if localStorage is NOT empty', () => {
        localStorage.setItem('key', 'value');
        const result = service.localStorageIsEmpty();
        expect(result).toBeFalse();
    });
});
