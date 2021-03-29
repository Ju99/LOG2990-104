/*
import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { RectangleService } from './rectangle.service';

// tslint:disable
describe('RectangleService', () => {
    let service: RectangleService;
    let canvasTestHelper: CanvasTestHelper;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let mouseEvent: MouseEvent;

    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let drawRectangleSpy: jasmine.Spy<any>;
    let drawSquareSpy: jasmine.Spy<any>;
    let mockPathData: Vec2[];

    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'pathData']);
        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawServiceSpy }],
        });
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;

        service = TestBed.inject(RectangleService);
        service['drawingService'].baseCtx = baseCtxStub; // Jasmine doesnt copy properties with underlying data
        service['drawingService'].previewCtx = previewCtxStub;
        service['drawingService'].canvas = canvasTestHelper.canvas;

        mockPathData = [
            { x: 10, y: 10 },
            { x: 100, y: 100 },
        ];
        service['pathData'] = mockPathData;
        mouseEvent = {
            offsetX: 10,
            offsetY: 10,
            button: 0,
        } as MouseEvent;
    });

    it('drawShape should call drawRectangle is isShiftShape is false', () => {
        service['isShiftShape'] = false;
        drawRectangleSpy = spyOn<any>(service, 'drawRectangle').and.stub();
        service.drawShape(previewCtxStub, false);
        expect(drawRectangleSpy).toHaveBeenCalled();
    });

    it('drawShape should call drawSquare is isShiftShape is true', () => {
        service['isShiftShape'] = true;
        drawSquareSpy = spyOn<any>(service, 'drawSquare');
        service.drawShape(previewCtxStub, false);
        expect(drawSquareSpy).toHaveBeenCalled();
    });

    it('onMouseUp should clear canvas on preview context', () => {
        service.onMouseUp(mouseEvent);
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
    });

    it('onMouseUp should call drawSquare if isShiftShape is true', () => {
        service['isShiftShape'] = true;
        drawSquareSpy = spyOn<any>(service, 'drawSquare');
        service.onMouseUp(mouseEvent);
        expect(drawSquareSpy).toHaveBeenCalled();
    });

    it('onMouseUp should clear path', () => {
        let clearPathSpy = spyOn<any>(service, 'clearPath');
        service.onMouseUp(mouseEvent);
        expect(clearPathSpy).toHaveBeenCalled();
    });

    it('should adjust origin for a shape drawn on lower left', () => {
        let path = [
            { x: 2, y: 2 },
            { x: 0, y: 3 },
        ];
        service['shortestSide'] = 1;
        service.lowerLeft(path);
        expect(service['origin']).toEqual({ x: 1, y: 2 });
    });

    it('should adjust origin for a shape drawn on upper left', () => {
        let path = [
            { x: 2, y: 2 },
            { x: 0, y: 0 },
        ];
        service['shortestSide'] = 2;
        service.upperLeft(path);
        expect(service['origin']).toEqual({ x: 0, y: 0 });
    });

    it('should adjust origin for a shape drawn on upper right', () => {
        let path = [
            { x: 2, y: 2 },
            { x: 0, y: 6 },
        ];
        service['shortestSide'] = 2;
        service.upperRight(path);
        expect(service['origin']).toEqual({ x: 2, y: 0 });
    });

    it('should adjust origin for a shape drawn on lower right', () => {
        let path = [
            { x: 2, y: 2 },
            { x: 5, y: 9 },
        ];
        service['shortestSide'] = 3;
        service.lowerRight(path);
        expect(service['origin']).toEqual({ x: 2, y: 2 });
    });

    it('should draw a square border with shortest x', () => {
        spyOn<any>(service, 'computeSize').and.stub();
        service['size'] = { x: 10, y: 30 };
        service.drawSquare(previewCtxStub, true);
        expect(service['size']).toEqual({ x: 10, y: 30 });
        expect(service['shortestSide']).toBe(10);
    });

    it('should draw a square border with shortest y', () => {
        spyOn<any>(service, 'computeSize').and.stub();
        service['size'] = { x: 50, y: 30 };
        service.drawSquare(previewCtxStub, true);
        expect(service['size']).toEqual({ x: 50, y: 30 });
        expect(service['shortestSide']).toBe(30);
    });

    it('should draw a rectangle as a border shape', () => {
        service.drawRectangle(previewCtxStub, true);
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
    });

    it('setPath should be the one in parameter', () => {
        let newPath = [
            { x: 0, y: 0 },
            { x: 1, y: 1 },
        ];
        service.setPath(newPath);
        expect(service['pathData']).toEqual(newPath);
    });

    it('create a square that is not a shapeBorder', () => {
        let updateBorderSpy = spyOn<any>(service, 'updateBorderType');
        service.drawSquare(previewCtxStub, false);
        expect(updateBorderSpy).toHaveBeenCalled();
    });
});
*/
