import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { SelectionTool } from '@app/classes/selection';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { SelectionUtilsService } from './selection-utils.service';

// tslint:disable
describe('SelectionUtilsService', () => {
    let service: SelectionUtilsService;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let canvasTestHelper: CanvasTestHelper;
    let baseCtxSpy: CanvasRenderingContext2D;
    let previewCtxSpy: CanvasRenderingContext2D;

    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);
        previewCtxSpy = jasmine.createSpyObj('CanvasRenderingContext', [
            'beginPath',
            'stroke',
            'moveTo',
            'lineTo',
            'setLineDash',
            'rect',
            'fill',
            'closePath',
        ]);
        baseCtxSpy = jasmine.createSpyObj('CanvasRenderingContext', [
            'ellipse',
            'save',
            'clip',
            'drawImage',
            'restore',
            'beginPath',
            'fill',
            'closePath',
            'fillRect',
        ]);

        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawServiceSpy }],
        });
        canvasTestHelper = TestBed.inject(CanvasTestHelper);

        service = TestBed.inject(SelectionUtilsService);
        service['drawingService'].baseCtx = baseCtxSpy;
        service['drawingService'].previewCtx = previewCtxSpy;
        service['drawingService'].canvas = canvasTestHelper.canvas;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should initialise parameters', () => {
        service['rectangleService'].lineWidth = 5;
        service['ellipseService'].lineWidth = 4;
        service.initializeToolParameters();
        expect(service['previousLineWidthRectangle']).toBe(5);
        expect(service['previousLineWidthEllipse']).toBe(4);
        expect(service['rectangleService'].isSelection).toBeTruthy;
        expect(service['ellipseService'].isSelection).toBeTruthy;
        expect(service['rectangleService'].lineWidth).toBe(3);
        expect(service['ellipseService'].lineWidth).toBe(3);
        expect(previewCtxSpy.setLineDash).toHaveBeenCalledWith([2]);
    });

    it('should reset parameters', () => {
        service['previousLineWidthRectangle'] = 5;
        service['previousLineWidthEllipse'] = 4;
        service.resetParametersTools();
        expect(service['rectangleService'].mouseDown).toBeFalsy;
        expect(service['rectangleService'].lineWidth).toBe(5);
        expect(service['ellipseService'].mouseDown).toBeFalsy;
        expect(service['ellipseService'].lineWidth).toBe(4);
        expect(previewCtxSpy.setLineDash).toHaveBeenCalledWith([0]);
        expect(service['rectangleService'].isSelection).toBeFalsy;
        expect(service['ellipseService'].isSelection).toBeFalsy;
    });

    it('should return true if mouse in selection area', () => {
        const result = service.mouseInSelectionArea({ x: 0, y: 0 } as Vec2, { x: 50, y: 50 } as Vec2, { x: 20, y: 20 } as Vec2);
        expect(result).toBe(true);
    });

    it('should reajust origin and destination if negative width AND height', () => {
        const selection = new SelectionTool({ x: 100, y: 100 } as Vec2, { x: 50, y: 50 } as Vec2, -50, -50);
        const result = service.reajustOriginAndDestination(selection);
        expect(result.width).toEqual(50);
        expect(result.height).toEqual(50);
        expect(result.origin).toEqual({ x: 50, y: 50 } as Vec2);
        expect(result.destination).toEqual({ x: 100, y: 100 } as Vec2);
    });

    it('should reajust origin and destination if negative width only', () => {
        const selection = new SelectionTool({ x: 50, y: 50 } as Vec2, { x: 10, y: 100 } as Vec2, -40, 50);
        const result = service.reajustOriginAndDestination(selection);
        expect(result.origin).toEqual({ x: 10, y: 50 } as Vec2);
        expect(result.destination).toEqual({ x: 50, y: 100 } as Vec2);
    });

    it('should reajust origin and destination if negative height only', () => {
        const selection = new SelectionTool({ x: 10, y: 100 } as Vec2, { x: 50, y: 50 } as Vec2, 40, -50);
        const result = service.reajustOriginAndDestination(selection);
        expect(result.origin).toEqual({ x: 10, y: 50 } as Vec2);
        expect(result.destination).toEqual({ x: 50, y: 100 } as Vec2);
    });

    it('should not change origin and destination if both are positives', () => {
        const selection = new SelectionTool({ x: 50, y: 50 } as Vec2, { x: 100, y: 100 } as Vec2, 50, 50);
        const result = service.reajustOriginAndDestination(selection);
        expect(result.origin).toEqual({ x: 50, y: 50 } as Vec2);
        expect(result.destination).toEqual({ x: 100, y: 100 } as Vec2);
    });

    it('should create boundary box for ellipse', () => {
        const selection = new SelectionTool({ x: 50, y: 50 } as Vec2, { x: 100, y: 100 } as Vec2, 50, 50);
        selection.isEllipse = true;
        const createControlSpy = spyOn<any>(service, 'createControlPoints').and.stub();
        const ellipseDrawShapeSpy = spyOn<any>(service['ellipseService'], 'drawShape').and.stub();
        const clearPathSpy = spyOn<any>(service['ellipseService'], 'clearPath').and.stub();
        service.createBoundaryBox(selection);
        expect(clearPathSpy).toHaveBeenCalled();
        expect(service['ellipseService'].pathData.pop()).toEqual({ x: 100, y: 100 } as Vec2);
        expect(service['ellipseService'].pathData.pop()).toEqual({ x: 50, y: 50 } as Vec2);
        expect(ellipseDrawShapeSpy).toHaveBeenCalled();
        expect(createControlSpy).toHaveBeenCalled();
    });

    it('should create boundary box for rectangle', () => {
        const selection = new SelectionTool({ x: 50, y: 50 } as Vec2, { x: 100, y: 100 } as Vec2, 50, 50);
        selection.isEllipse = false;
        const createControlSpy = spyOn<any>(service, 'createControlPoints').and.stub();
        const rectangleDrawSpy = spyOn<any>(service['rectangleService'], 'drawShape').and.stub();
        const clearPathSpy = spyOn<any>(service['rectangleService'], 'clearPath').and.stub();
        service.createBoundaryBox(selection);
        expect(clearPathSpy).toHaveBeenCalled();
        expect(service['rectangleService'].pathData.pop()).toEqual({ x: 100, y: 100 } as Vec2);
        expect(service['rectangleService'].pathData.pop()).toEqual({ x: 50, y: 50 } as Vec2);
        expect(rectangleDrawSpy).toHaveBeenCalled();
        expect(createControlSpy).toHaveBeenCalled();
    });

    it('should create boundary box for lasso', () => {
        const selection = new SelectionTool({ x: 50, y: 50 } as Vec2, { x: 100, y: 100 } as Vec2, 50, 50);
        selection.isLasso = true;
        spyOn<any>(service['rectangleService'], 'drawShape').and.stub();
        spyOn<any>(service['rectangleService'], 'clearPath').and.stub();
        const createControlSpy = spyOn<any>(service, 'createControlPoints').and.stub();
        const lassoDrawPolygonSpy = spyOn<any>(service['lassoService'], 'drawPolygon').and.stub();
        service.createBoundaryBox(selection);
        expect(lassoDrawPolygonSpy).toHaveBeenCalled();
        expect(createControlSpy).toHaveBeenCalled();
    });

    it('should create cotrol points', () => {
        const selection = new SelectionTool({ x: 50, y: 50 } as Vec2, { x: 100, y: 100 } as Vec2, 50, 50);

        service.createControlPoints(selection);
        expect(service.controlPointsCoord).toEqual([
            { x: 45, y: 45 } as Vec2,
            { x: 95, y: 45 } as Vec2,
            { x: 95, y: 95 } as Vec2,
            { x: 45, y: 95 } as Vec2,
            { x: 70, y: 45 } as Vec2,
            { x: 95, y: 70 } as Vec2,
            { x: 70, y: 95 } as Vec2,
            { x: 45, y: 70 } as Vec2,
        ]);
    });

    it('should clear underneath if ellipse', () => {
        const selection = new SelectionTool({ x: 50, y: 50 } as Vec2, { x: 100, y: 100 } as Vec2, 50, 50);
        selection.isEllipse = true;
        selection.isLasso = false;
        service.clearUnderneathShape(selection);
        expect(service['drawingService'].baseCtx.fillStyle).toEqual('#FFFFFF');
        expect(baseCtxSpy.beginPath).toHaveBeenCalled();
        expect(baseCtxSpy.ellipse).toHaveBeenCalled();
        expect(baseCtxSpy.fill).toHaveBeenCalled();
        expect(baseCtxSpy.closePath).toHaveBeenCalled();
    });

    it('should clear underneath if lasso', () => {
        const selection = new SelectionTool({ x: 50, y: 50 } as Vec2, { x: 100, y: 100 } as Vec2, 50, 50);
        selection.isEllipse = false;
        selection.isLasso = true;
        selection.clearImageDataPolygon = new ImageData(10, 10);
        const printPolygonSpy = spyOn<any>(service['lassoService'], 'printPolygon').and.stub();
        service.clearUnderneathShape(selection);
        expect(service['drawingService'].baseCtx.fillStyle).toEqual('#FFFFFF');
        expect(baseCtxSpy.beginPath).toHaveBeenCalled();
        expect(printPolygonSpy).toHaveBeenCalled();
    });

    it('should clear underneath if rectangle', () => {
        const selection = new SelectionTool({ x: 50, y: 50 } as Vec2, { x: 100, y: 100 } as Vec2, 50, 50);
        selection.isEllipse = false;
        selection.isLasso = false;
        service.clearUnderneathShape(selection);
        expect(service['drawingService'].baseCtx.fillStyle).toEqual('#FFFFFF');
        expect(baseCtxSpy.beginPath).toHaveBeenCalled();
        expect(baseCtxSpy.fillRect).toHaveBeenCalled();
        expect(baseCtxSpy.closePath).toHaveBeenCalled();
    });

    it('should resize selection with uncleaned underneath', () => {
        const selection = new SelectionTool({ x: 50, y: 50 } as Vec2, { x: 100, y: 100 } as Vec2, 50, 50);
        const mouseCoord = { x: 125, y: 125 };
        const printSpy = spyOn<any>(service['resizeSelectionService'], 'printResize').and.stub();
        const mouseMoveSpy = spyOn<any>(service['resizeSelectionService'], 'onMouseMove').and.stub();
        service.cleanedUnderneath = false;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
        const boundaryBoxSpy = spyOn<any>(service, 'createBoundaryBox').and.stub();
        service.resizeSelection(ctx, mouseCoord, selection);
        expect(mouseMoveSpy).toHaveBeenCalledWith(mouseCoord, selection);
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
        expect(printSpy).toHaveBeenCalled();
        expect(service['origin']).toEqual({ x: 50, y: 50 } as Vec2);
        expect(boundaryBoxSpy).toHaveBeenCalled();
        expect(service.cleanedUnderneath).toBeTruthy;
    });

    it('should resize selection with clean underneath', () => {
        const selection = new SelectionTool({ x: 50, y: 50 } as Vec2, { x: 100, y: 100 } as Vec2, 50, 50);
        const mouseCoord = { x: 125, y: 125 };
        const printSpy = spyOn<any>(service['resizeSelectionService'], 'printResize').and.stub();
        const mouseMoveSpy = spyOn<any>(service['resizeSelectionService'], 'onMouseMove').and.stub();
        service.cleanedUnderneath = true;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
        const boundaryBoxSpy = spyOn<any>(service, 'createBoundaryBox').and.stub();
        service.resizeSelection(ctx, mouseCoord, selection);
        expect(mouseMoveSpy).toHaveBeenCalledWith(mouseCoord, selection);
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
        expect(printSpy).toHaveBeenCalled();
        expect(service['origin']).toEqual({ x: 50, y: 50 } as Vec2);
        expect(boundaryBoxSpy).toHaveBeenCalled();
    });

    it('should end resize selection', () => {
        const reajustSpy = spyOn<any>(service, 'reajustOriginAndDestination').and.callThrough();

        spyOn<any>(service['resizeSelectionService'], 'printResize').and.callFake(() => {
            service['resizeSelectionService'].newOrigin = { x: 0, y: 0 } as Vec2;
            service['resizeSelectionService'].resizeWidth = 10;
            service['resizeSelectionService'].resizeHeight = 5;
        });
        service.endResizeSelection();
        expect(service['isResizing']).toBeFalsy;
        expect(service['cleanedUnderneath']).toBeFalsy;
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalledWith(previewCtxSpy);
        expect(service['origin']).toEqual({ x: 0, y: 0 } as Vec2);
        expect(service['width']).toBe(10);
        expect(service['height']).toBe(5);
        expect(service['destination']).toEqual({ x: 10, y: 5 } as Vec2);
        expect(reajustSpy).toHaveBeenCalled();
    });
});
