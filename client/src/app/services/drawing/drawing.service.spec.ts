import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from './drawing.service';
// tslint:disable
// tslint:disable: no-magic-numbers
describe('DrawingService', () => {
    let service: DrawingService;
    let canvasTestHelper: CanvasTestHelper;
    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(DrawingService);
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        service.canvas = canvasTestHelper.canvas;
        service.baseCtx = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        service.previewCtx = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        service.gridCtx = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should clear canvas if context is defined as baseCtx', () => {
        service.baseCtx.fillStyle = '#ffffff';
        const beginPathSpy = spyOn<any>(service.baseCtx, 'beginPath').and.stub();
        const fillRectSpy = spyOn<any>(service.baseCtx, 'fillRect').and.stub();
        const closePathSpy = spyOn<any>(service.baseCtx, 'closePath').and.stub();
        service.clearCanvas(service.baseCtx);
        expect(beginPathSpy).toHaveBeenCalled();
        expect(fillRectSpy).toHaveBeenCalled();
        expect(closePathSpy).toHaveBeenCalled();
    });

    it('should return instance of ImageData', () => {
        const result = service.getCanvasData();
        expect(result).toBeInstanceOf(ImageData);
    });

    it('should return instance of Uint8ClampedArray', () => {
        const pixelCoord: Vec2 = { x: 0, y: 0 };
        const result = service.getPixelData(pixelCoord);
        expect(result).toBeInstanceOf(Uint8ClampedArray);
    });

    it('should draw grid on setgrid', () => {
        service.canvas.width = 10;
        service.canvas.height = 10;
        service.gridSpaces = 5;
        const moveToSpy = spyOn(service.gridCtx, 'moveTo');
        const lineToSpy = spyOn(service.gridCtx, 'lineTo');
        service.setGrid();
        expect(moveToSpy).toHaveBeenCalledTimes(6);
        expect(lineToSpy).toHaveBeenCalledTimes(6);
    });
});
