/*
import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { EllipseService } from '@app/services/tools/ellipse/ellipse.service';
import { RectangleService } from '@app/services/tools/rectangle/rectangle.service';
//tslint:disable
describe('EllipseService', () => {
    let service: EllipseService;
    let canvasTestHelper: CanvasTestHelper;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let rectangleServiceSpy: jasmine.SpyObj<RectangleService>;
    let mouseEvent: MouseEvent;

    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let drawEllipseSpy: jasmine.Spy<any>;
    let drawCircleSpy: jasmine.Spy<any>;
    let mockPathData: Vec2[];
    let baseCtxSpy: jasmine.SpyObj<CanvasRenderingContext2D>;

    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'pathData', 'fill', 'beginPath']);
        rectangleServiceSpy = jasmine.createSpyObj('RectangleService', ['drawRectangle', 'drawSquare', 'setPath']);
        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawServiceSpy },
                { provide: RectangleService, useValue: rectangleServiceSpy },
            ],
        });
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;

        baseCtxSpy = jasmine.createSpyObj('CanvasRenderingContext', ['ellipse', 'beginPath', 'fill', 'stroke']);

        service = TestBed.inject(EllipseService);
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

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('drawShape should call drawRectangle and drawEllipse if Shift key is not pressed', () => {
        service['isShiftShape'] = false;
        rectangleServiceSpy.setPath.and.stub();
        rectangleServiceSpy.drawRectangle.and.stub();
        drawEllipseSpy = spyOn<any>(service, 'drawEllipse').and.stub();

        service.drawShape(previewCtxStub, false);

        expect(rectangleServiceSpy.drawRectangle).toHaveBeenCalled();
        expect(drawEllipseSpy).toHaveBeenCalled();
    });

    it('drawShape should call drawSquare and drawCircle if Shift key is pressed', () => {
        service['isShiftShape'] = true;
        rectangleServiceSpy.setPath.and.stub();
        rectangleServiceSpy.drawSquare.and.stub();
        drawCircleSpy = spyOn<any>(service, 'drawCircle').and.stub();

        service.drawShape(previewCtxStub, false);

        expect(rectangleServiceSpy.drawSquare).toHaveBeenCalled();
        expect(drawCircleSpy).toHaveBeenCalled();
    });

    it('onMouseUp should call drawEllipse if is shiftShape is false', () => {
        service['isShiftShape'] = false;

        drawEllipseSpy = spyOn<any>(service, 'drawEllipse').and.stub();
        service.onMouseUp(mouseEvent);

        expect(drawEllipseSpy).toHaveBeenCalled();
    });

    it('onMouseUp shoud set mouseDown property to false if not already', () => {
        service['origin'] = { x: 10, y: 10 };
        service['size'] = { x: 20, y: 10 };
        service.onMouseUp(mouseEvent);
        expect(service.mouseDown).toBeFalsy();
    });

    it('onMouseUp should call drawCircle on base context if Shift key is pressed', () => {
        service['isShiftShape'] = true;
        drawCircleSpy = spyOn<any>(service, 'drawCircle').and.stub();
        service.onMouseUp(mouseEvent);
        expect(drawCircleSpy).toHaveBeenCalled();
    });

    it('should draw an ellipse ', () => {
        const expectedWidth = 5;
        let updateBorderSpy = spyOn<any>(service, 'updateBorderType');
        baseCtxSpy.ellipse.and.stub();
        service['origin'] = { x: 10, y: 10 };
        service['size'] = { x: 20, y: 10 };
        service.lineWidth = expectedWidth;

        service['drawEllipse'](baseCtxSpy);

        expect(baseCtxSpy.ellipse).toHaveBeenCalled();
        expect(baseCtxSpy.beginPath).toHaveBeenCalled();
        expect(service.lineWidth).toEqual(expectedWidth);
        expect(updateBorderSpy).toHaveBeenCalled();
    });

    it('should draw a circle with shortest x', () => {
        const expectedWidth = 5;
        let updateBorderSpy = spyOn<any>(service, 'updateBorderType');
        baseCtxSpy.ellipse.and.stub();
        service['origin'] = { x: 10, y: 10 };
        service['size'] = { x: 10, y: 30 };
        service.lineWidth = expectedWidth;

        service['drawCircle'](baseCtxSpy);

        expect(baseCtxSpy.ellipse).toHaveBeenCalled();
        expect(baseCtxSpy.beginPath).toHaveBeenCalled();
        expect(service.lineWidth).toEqual(expectedWidth);
        expect(updateBorderSpy).toHaveBeenCalled();
        expect(service['radius']).toBe(5);
    });

    it('should draw a circle with shortest y', () => {
        const expectedWidth = 5;
        let updateBorderSpy = spyOn<any>(service, 'updateBorderType');
        baseCtxSpy.ellipse.and.stub();
        service['origin'] = { x: 10, y: 10 };
        service['size'] = { x: 10, y: 5 };
        service.lineWidth = expectedWidth;

        service['drawCircle'](baseCtxSpy);

        expect(baseCtxSpy.ellipse).toHaveBeenCalled();
        expect(baseCtxSpy.beginPath).toHaveBeenCalled();
        expect(service.lineWidth).toEqual(expectedWidth);
        expect(updateBorderSpy).toHaveBeenCalled();
        expect(service['radius']).toBe(2.5);
    });

    it('should adjust origin for circle drawn on lower left', () => {
        service['pathData'] = [
            { x: 2, y: 2 },
            { x: 0, y: 3 },
        ];
        service['isShiftShape'] = true;
        service['radius'] = 1;

        service.lowerLeft();

        expect(service['origin']).toEqual({ x: 1, y: 3 });
    });

    it('should adjust origin for an ellipse drawn on lower left and is a not shift shape', () => {
        service['pathData'] = [
            { x: 2, y: 2 },
            { x: 0, y: 3 },
        ];
        service['isShiftShape'] = false;
        service['size'] = { x: 2, y: 4 };

        service.lowerLeft();

        expect(service['origin']).toEqual({ x: 1, y: 4 });
    });

    it('should adjust origin for a circle drawn on upper left ', () => {
        service['pathData'] = [
            { x: 2, y: 2 },
            { x: 0, y: 0 },
        ];
        service['isShiftShape'] = true;
        service['radius'] = 1;

        service.upperLeft();

        expect(service['origin']).toEqual({ x: 1, y: 1 });
    });

    it('should adjust origin for a shape drawn on upper left', () => {
        service['pathData'] = [
            { x: 2, y: 2 },
            { x: 0, y: 0 },
        ];
        service['isShiftShape'] = false;
        service['size'] = { x: 2, y: 4 };
        service.upperLeft();
        expect(service['origin']).toEqual({ x: 1, y: 0 });
    });

    it('should adjust origin for a shape drawn on upper right', () => {
        service['pathData'] = [
            { x: 2, y: 2 },
            { x: 0, y: 6 },
        ];
        service['isShiftShape'] = true;
        service['radius'] = 1;

        service.upperRight();

        expect(service['origin']).toEqual({ x: 3, y: 1 });
    });

    it('should adjust origin for a shape drawn on upper right', () => {
        service['pathData'] = [
            { x: 2, y: 2 },
            { x: 0, y: 6 },
        ];
        service['isShiftShape'] = false;
        service['size'] = { x: 2, y: 4 };

        service.upperRight();

        expect(service['origin']).toEqual({ x: 3, y: 0 });
    });

    it('should adjust origin for a circle drawn on lower right', () => {
        service['pathData'] = [
            { x: 2, y: 2 },
            { x: 5, y: 9 },
        ];
        service['isShiftShape'] = true;
        service['radius'] = 1;

        service.lowerRight();

        expect(service['origin']).toEqual({ x: 3, y: 3 });
    });

    it('should adjust origin for a ellipse drawn on lower right', () => {
        service['pathData'] = [
            { x: 2, y: 2 },
            { x: 5, y: 9 },
        ];
        service['isShiftShape'] = false;
        service['size'] = { x: 2, y: 4 };

        service.lowerRight();

        expect(service['origin']).toEqual({ x: 3, y: 4 });
    });
});
*/
