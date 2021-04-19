import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { TypeStyle } from '@app/classes/ellipse';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ShapeService } from '@app/services/tools/shape/shape.service';
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
    let shapeServiceSpy: jasmine.SpyObj<ShapeService>;
    let mockPathData: Vec2[];
    const mouseEventClick = {
        x: 25,
        y: 25,
        button: 0,
    } as MouseEvent;

    const mouseEventLeft = {
        x: 25,
        y: 25,
        button: 1,
    } as MouseEvent;

    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'pathData']);
        shapeServiceSpy = jasmine.createSpyObj('ShapeService', [
            'drawShape',
            'changeType',
            'onMouseDown',
            'clearPath',
            'lowerLeft',
            'upperRight',
            'upperLeft',
            'lowerRight',
        ]);
        previewCtxStub = jasmine.createSpyObj('CanvasRendringContext', [
            'putImageData',
            'beginPath',
            'stroke',
            'lineWidth',
            'getImageData',
            'moveTo',
            'lineTo',
        ]);

        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawServiceSpy },
                { provide: ShapeService, useValue: shapeServiceSpy },
            ],
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
        service.onMouseUp();
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
    });

    it('onMouseUp should call drawSquare if isShiftShape is true', () => {
        service['isShiftShape'] = true;
        drawSquareSpy = spyOn<any>(service, 'drawSquare');
        service.onMouseUp();
        expect(drawSquareSpy).toHaveBeenCalled();
    });

    it('onMouseUp should clear path', () => {
        let clearPathSpy = spyOn<any>(service, 'clearPath');
        service.onMouseUp();
        expect(clearPathSpy).toHaveBeenCalled();
    });

    it('should draw shape on previewCtx', () => {
        service.mouseDown = true;
        const drawShapeSpy = spyOn<any>(service, 'drawShape');
        drawServiceSpy.clearCanvas.and.stub();
        service.onMouseMove(mouseEvent);
        expect(drawShapeSpy).toHaveBeenCalled();
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
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
        const rectSpy = spyOn<any>(previewCtxStub, 'rect').and.stub();
        const strokeSpy = spyOn<any>(previewCtxStub, 'stroke').and.stub();
        service.drawRectangle(previewCtxStub, true);
        expect(rectSpy).toHaveBeenCalled();
        expect(strokeSpy).toHaveBeenCalled();
    });

    it('should NOT draw a rectangle as a border shape', () => {
        const updateBorderSpy = spyOn<any>(service, 'updateBorderType').and.stub();
        service.drawRectangle(previewCtxStub, false);
        expect(updateBorderSpy).toHaveBeenCalled();
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

    it('should change border type to fill', () => {
        service['selectType'] = TypeStyle.Fill;
        service['changeType']();
        expect(service['fillValue']).toBe(true);
        expect(service['strokeValue']).toBe(false);
    });

    it('should change border type to strokefill', () => {
        service['selectType'] = TypeStyle.StrokeFill;
        service['changeType']();
        expect(service['fillValue']).toBe(true);
        expect(service['strokeValue']).toBe(true);
    });

    it('should update tools attribute when mouseDown event', () => {
        spyOn<any>(service, 'getPositionFromMouse').and.returnValue({ x: 25, y: 25 } as Vec2);
        let clearPathSpy = spyOn<any>(service, 'clearPath');
        service['pathData'] = [];
        service.onMouseDown(mouseEventClick);
        expect(clearPathSpy).toHaveBeenCalled();
        expect(service.mouseDownCoord).toEqual({ x: 25, y: 25 } as Vec2);
        expect(service['pathData'].pop()).toEqual({ x: 25, y: 25 } as Vec2);
    });

    it('should update tools attribute when mouseDown event', () => {
        spyOn<any>(service, 'getPositionFromMouse').and.returnValue({ x: 25, y: 25 } as Vec2);
        let clearPathSpy = spyOn<any>(service, 'clearPath');
        service['pathData'] = [{ x: 40, y: 19 } as Vec2];
        service.onMouseDown(mouseEventLeft);
        expect(clearPathSpy).not.toHaveBeenCalled();
        expect(service.mouseDownCoord).not.toEqual({ x: 25, y: 25 } as Vec2);
        expect(service['pathData']).toEqual([{ x: 40, y: 19 } as Vec2]);
    });

    it('should handle shift key down', () => {
        const keyEvent = new KeyboardEvent('keydown', { key: 'Shift' });
        const drawShapeSpy = spyOn<any>(service, 'drawShape').and.stub();
        service['mouseDown'] = true;
        service.handleKeyDown(keyEvent);
        expect(service['isShiftShape']).toBe(true);
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
        expect(drawShapeSpy).toHaveBeenCalled();
    });

    it('should handle key down different than shift', () => {
        const keyEvent = new KeyboardEvent('keydown', { key: 'Alt' });
        const drawShapeSpy = spyOn<any>(service, 'drawShape').and.stub();
        service['mouseDown'] = true;
        service['isShiftShape'] = false;
        service.handleKeyDown(keyEvent);
        expect(service['isShiftShape']).toBe(false);
        expect(drawServiceSpy.clearCanvas).not.toHaveBeenCalled();
        expect(drawShapeSpy).not.toHaveBeenCalled();
    });

    it('should handle shift key up', () => {
        const keyEvent = new KeyboardEvent('keyup', { key: 'Shift' });
        const drawShapeSpy = spyOn<any>(service, 'drawShape').and.stub();
        service.isShiftShape = true;
        service['mouseDown'] = true;
        service.handleKeyUp(keyEvent);
        expect(service['isShiftShape']).toBe(false);
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
        expect(drawShapeSpy).toHaveBeenCalled();
    });

    it('should handle key down different than shift', () => {
        const keyEvent = new KeyboardEvent('keydown', { key: 'Alt' });
        const drawShapeSpy = spyOn<any>(service, 'drawShape').and.stub();
        service['mouseDown'] = true;
        service['isShiftShape'] = true;
        service.handleKeyUp(keyEvent);
        expect(service['isShiftShape']).toBe(true);
        expect(drawServiceSpy.clearCanvas).not.toHaveBeenCalled();
        expect(drawShapeSpy).not.toHaveBeenCalled();
    });

    it('should update border when selection', () => {
        service.isSelection = true;
        const fillSpy = spyOn<any>(service['drawingService'].previewCtx, 'fill').and.stub();
        const strokeSpy = spyOn<any>(service['drawingService'].previewCtx, 'stroke').and.stub();
        service['updateBorderType'](service['drawingService'].previewCtx);
        expect(service['drawingService'].previewCtx.strokeStyle).toEqual('#747171');
        expect(service['drawingService'].previewCtx.fillStyle).toEqual('rgba(116, 113, 113, 0)');
        expect(fillSpy).toHaveBeenCalled();
        expect(strokeSpy).toHaveBeenCalled();
    });

    it('should update border when stroke value is false', () => {
        service.isSelection = false;
        service['strokeValue'] = false;
        const fillSpy = spyOn<any>(service['drawingService'].previewCtx, 'fill').and.stub();
        const strokeSpy = spyOn<any>(service['drawingService'].previewCtx, 'stroke').and.stub();
        service['updateBorderType'](service['drawingService'].previewCtx);
        expect(fillSpy).not.toHaveBeenCalled();
        expect(strokeSpy).not.toHaveBeenCalled();
    });

    it('should update border when fill value', () => {
        service.isSelection = false;
        service['strokeValue'] = false;
        service['fillValue'] = true;
        const fillSpy = spyOn<any>(service['drawingService'].previewCtx, 'fill').and.stub();
        const strokeSpy = spyOn<any>(service['drawingService'].previewCtx, 'stroke').and.stub();
        service['updateBorderType'](service['drawingService'].previewCtx);
        expect(service['drawingService'].previewCtx.fillStyle).toEqual('#ff0000');
        expect(service['drawingService'].previewCtx.strokeStyle).toEqual('rgba(255, 0, 0, 0)');
        expect(fillSpy).toHaveBeenCalled();
        expect(strokeSpy).toHaveBeenCalled();
    });

    it('should update border when fill value and stroke value', () => {
        service.isSelection = false;
        service['strokeValue'] = true;
        service['fillValue'] = true;
        const fillSpy = spyOn<any>(service['drawingService'].previewCtx, 'fill').and.stub();
        const strokeSpy = spyOn<any>(service['drawingService'].previewCtx, 'stroke').and.stub();
        service['updateBorderType'](service['drawingService'].previewCtx);
        expect(service['drawingService'].previewCtx.fillStyle).toEqual('#ff0000');
        expect(service['drawingService'].previewCtx.strokeStyle).toEqual('#00ff00');
        expect(fillSpy).toHaveBeenCalled();
        expect(strokeSpy).toHaveBeenCalled();
    });

    it('should update border when fill value and stroke value', () => {
        service.isSelection = false;
        service['strokeValue'] = true;
        service['fillValue'] = true;
        const fillSpy = spyOn<any>(service['drawingService'].previewCtx, 'fill').and.stub();
        const strokeSpy = spyOn<any>(service['drawingService'].previewCtx, 'stroke').and.stub();
        service['updateBorderType'](service['drawingService'].previewCtx);
        expect(service['drawingService'].previewCtx.fillStyle).toEqual('#ff0000');
        expect(service['drawingService'].previewCtx.strokeStyle).toEqual('#00ff00');
        expect(fillSpy).toHaveBeenCalled();
        expect(strokeSpy).toHaveBeenCalled();
    });

    it('should update border when fill value and stroke value', () => {
        service.isSelection = false;
        service['strokeValue'] = true;
        service['fillValue'] = true;
        const fillSpy = spyOn<any>(service['drawingService'].previewCtx, 'fill').and.stub();
        const strokeSpy = spyOn<any>(service['drawingService'].previewCtx, 'stroke').and.stub();
        service['updateBorderType'](service['drawingService'].previewCtx);
        expect(service['drawingService'].previewCtx.fillStyle).toEqual('#ff0000');
        expect(service['drawingService'].previewCtx.strokeStyle).toEqual('#00ff00');
        expect(fillSpy).toHaveBeenCalled();
        expect(strokeSpy).toHaveBeenCalled();
    });

    it('should update border when fill value and stroke value', () => {
        service.isSelection = false;
        service['strokeValue'] = true;
        service['fillValue'] = true;
        const fillSpy = spyOn<any>(service['drawingService'].previewCtx, 'fill').and.stub();
        const strokeSpy = spyOn<any>(service['drawingService'].previewCtx, 'stroke').and.stub();
        service['updateBorderType'](service['drawingService'].previewCtx);
        expect(service['drawingService'].previewCtx.fillStyle).toEqual('#ff0000');
        expect(service['drawingService'].previewCtx.strokeStyle).toEqual('#00ff00');
        expect(fillSpy).toHaveBeenCalled();
        expect(strokeSpy).toHaveBeenCalled();
    });

    it('should call lower left if mouse go to low-right', () => {
        service['pathData'] = [{ x: 0, y: 0 } as Vec2, { x: 10, y: 10 } as Vec2];
        const lowerRightSpy = spyOn<any>(service, 'lowerRight').and.stub();
        service['findMouseDirection']();
        expect(lowerRightSpy).toHaveBeenCalled();
    });

    it('should call lower left if mouse go to low-left', () => {
        service['pathData'] = [{ x: 10, y: 10 } as Vec2, { x: 5, y: 20 } as Vec2];
        const lowerLeftSpy = spyOn<any>(service, 'lowerLeft').and.stub();
        service['findMouseDirection']();
        expect(lowerLeftSpy).toHaveBeenCalled();
    });

    it('should call upper right if mouse go to upper-right', () => {
        service['pathData'] = [{ x: 10, y: 10 } as Vec2, { x: 20, y: 0 } as Vec2];
        const upperRightSpy = spyOn<any>(service, 'upperRight').and.stub();
        service['findMouseDirection']();
        expect(upperRightSpy).toHaveBeenCalled();
    });

    it('should call upper left if mouse go to upper-left', () => {
        service['pathData'] = [{ x: 10, y: 10 } as Vec2, { x: 0, y: 0 } as Vec2];
        const upperLeftSpy = spyOn<any>(service, 'upperLeft').and.stub();
        service['findMouseDirection']();
        expect(upperLeftSpy).toHaveBeenCalled();
    });

    it('should throw error when pathData is empty', () => {
        service['pathData'] = [];
        expect(function () {
            service['computeSize']();
        }).toThrow(new Error('No data in path'));
    });

    it('should adjust startPoint when x and y higher than endPoint ', () => {
        const startPoint = { x: 10, y: 10 } as Vec2;
        const endPoint = { x: 0, y: 0 } as Vec2;
        const result = service['calculLeftpoint'](startPoint, endPoint);
        expect(result.x).toBe(0);
        expect(result.y).toBe(0);
    });

    it('should adjust startPoint y endPoint is higher than y of startPoint ', () => {
        const startPoint = { x: 10, y: 10 } as Vec2;
        const endPoint = { x: 0, y: 20 } as Vec2;
        const result = service['calculLeftpoint'](startPoint, endPoint);
        expect(result.x).toBe(0);
        expect(result.y).toBe(10);
    });

    it('should adjust startPoint y endPoint is higher than y of startPoint ', () => {
        const startPoint = { x: 10, y: 10 } as Vec2;
        const endPoint = { x: 20, y: 0 } as Vec2;
        const result = service['calculLeftpoint'](startPoint, endPoint);
        expect(result.x).toBe(10);
        expect(result.y).toBe(0);
    });
});
