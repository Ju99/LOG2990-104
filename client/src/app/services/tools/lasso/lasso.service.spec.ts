import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { DrawingContextStyle } from '@app/classes/drawing-context-styles';
import { Segment, Utils } from '@app/classes/math-utils';
import { Vec2 } from '@app/classes/vec2';
import { MouseButton } from '@app/constants';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { LassoService } from '@app/services/tools/lasso/lasso.service';
import { LineService } from '@app/services/tools/line/line.service';

// tslint:disable
describe('LassoService', () => {
    let service: LassoService;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let lineServiceSpy: jasmine.SpyObj<LineService>;

    let canvasTestHelper: CanvasTestHelper;
    let baseCtxSpy: CanvasRenderingContext2D;
    let previewCtxSpy: CanvasRenderingContext2D;
    let lassoPreviewCtxSpy: CanvasRenderingContext2D;

    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);
        lineServiceSpy = jasmine.createSpyObj('LineService', ['drawLine', 'calculatePosition']);
        previewCtxSpy = jasmine.createSpyObj('CanvasRenderingContext', ['beginPath', 'stroke', 'moveTo', 'lineTo', 'setLineDash']);
        lassoPreviewCtxSpy = jasmine.createSpyObj('CanvasRenderingContext', ['beginPath', 'stroke', 'moveTo', 'lineTo', 'setLineDash']);
        baseCtxSpy = jasmine.createSpyObj('CanvasRenderingContext', ['beginPath', 'stroke', 'moveTo', 'lineTo']);

        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawServiceSpy },
                { provide: LineService, useValue: lineServiceSpy },
            ],
        });
        canvasTestHelper = TestBed.inject(CanvasTestHelper);

        service = TestBed.inject(LassoService);
        service['drawingService'].baseCtx = baseCtxSpy;
        service['drawingService'].previewCtx = previewCtxSpy;
        service['drawingService'].lassoPreviewCtx = lassoPreviewCtxSpy;
        service['drawingService'].canvas = canvasTestHelper.canvas;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should add mouse position to currentSegment vector when mouse is clicked', () => {
        const leftMouseEvent = {
            x: 25,
            y: 25,
            button: MouseButton.Left,
        } as MouseEvent;

        service.onMouseClick(leftMouseEvent);
        expect(service['currentSegment'].length).toEqual(1);
    });

    it('should NOT add mouseDownCoord to current segment if isOutside attribute is true', () => {
        const leftMouseEvent = {
            x: 25,
            y: 25,
            button: MouseButton.Left,
        } as MouseEvent;
        service['isOutside'] = true;

        service.onMouseClick(leftMouseEvent);
        expect(service['currentSegment'].length).toEqual(0);
    });

    it('should NOT draw line at all on previewCtx if left mouse button was not down', () => {
        const righttMouseEvent = {
            x: 25,
            y: 25,
            button: MouseButton.Right,
        } as MouseEvent;
        service.onMouseMove(righttMouseEvent);
        const drawConstrainedLineSpy = spyOn<any>(service, 'drawConstrainedLine').and.stub();
        lineServiceSpy.drawLine.and.stub();
        expect(drawConstrainedLineSpy).not.toHaveBeenCalled();
        expect(lineServiceSpy.drawLine).not.toHaveBeenCalled();
    });

    it('should set areIntersected attribute to false if currentSegment is outside canvas', () => {
        const leftMouseEvent = {
            x: 25,
            y: 25,
            button: MouseButton.Left,
        } as MouseEvent;
        service.mouseDown = true;
        service.polygonCoords = [
            { x: 0, y: 0 },
            { x: 10, y: 0 },
            { x: 10, y: 10 },
            { x: 0, y: 10 },
        ];
        spyOn<any>(service, 'currentSegmentIntersectsCanvas').and.returnValue(false);
        service.onMouseMove(leftMouseEvent);
        expect(service['areIntesected']).toBeFalse();
    });

    it('should draw constrained line on preview context if Shift key is pressed', () => {
        const leftMouseEvent = {
            x: 25,
            y: 25,
            button: MouseButton.Left,
        } as MouseEvent;
        service.mouseDown = true;
        service.polygonCoords = [
            { x: 0, y: 0 },
            { x: 10, y: 0 },
            { x: 10, y: 10 },
            { x: 0, y: 10 },
        ];
        service['shiftKeyDown'] = true;
        const drawConstrainedLineSpy = spyOn<any>(service, 'drawConstrainedLine').and.stub();
        service.onMouseMove(leftMouseEvent);
        expect(drawConstrainedLineSpy).toHaveBeenCalled();
    });

    it('should draw normal line on preview context if Shift Key is up', () => {
        const leftMouseEvent = {
            x: 25,
            y: 25,
            button: MouseButton.Left,
        } as MouseEvent;
        service.mouseDown = true;
        service.polygonCoords = [
            { x: 0, y: 0 },
            { x: 10, y: 0 },
            { x: 10, y: 10 },
            { x: 0, y: 10 },
        ];
        service['shiftKeyDown'] = false;
        service.onMouseMove(leftMouseEvent);
        expect(lineServiceSpy.drawLine).toHaveBeenCalled();
    });

    it('should set isOutside attribute to true if mouse position is outside canvas', () => {
        const leftMouseEvent = {
            x: 200,
            y: 200,
            button: MouseButton.Left,
        } as MouseEvent;
        service['isOutside'] = false;
        service['areIntesected'] = false;
        spyOn<any>(service, 'mouseClickOutsideCanvas').and.returnValue(true);
        service.onMouseUp(leftMouseEvent);
        expect(service['isOutside']).toBeTrue();
    });

    it('should draw constrained line on lassoPreview context if Shift key is pressed', () => {
        const leftMouseEvent = {
            x: 25,
            y: 25,
            button: MouseButton.Left,
        } as MouseEvent;
        service.mouseDown = true;
        service.polygonCoords = [
            { x: 0, y: 0 },
            { x: 10, y: 0 },
            { x: 10, y: 10 },
            { x: 0, y: 10 },
        ];
        service['shiftKeyDown'] = true;
        const drawConstrainedLineSpy = spyOn<any>(service, 'drawConstrainedLine').and.stub();
        service.onMouseUp(leftMouseEvent);
        expect(drawConstrainedLineSpy).toHaveBeenCalled();
    });

    it('should NOT draw line at all on lassoPreviewCtx if left mouse button was not down', () => {
        const righttMouseEvent = {
            x: 25,
            y: 25,
            button: MouseButton.Right,
        } as MouseEvent;
        service.onMouseUp(righttMouseEvent);
        const drawConstrainedLineSpy = spyOn<any>(service, 'drawConstrainedLine').and.stub();
        lineServiceSpy.drawLine.and.stub();
        expect(drawConstrainedLineSpy).not.toHaveBeenCalled();
        expect(lineServiceSpy.drawLine).not.toHaveBeenCalled();
    });

    it('should draw normal line on lassoPreview context if Shift key is up', () => {
        const leftMouseEvent = {
            x: 25,
            y: 25,
            button: MouseButton.Left,
        } as MouseEvent;
        service.mouseDown = true;
        service.polygonCoords = [
            { x: 0, y: 0 },
            { x: 10, y: 0 },
            { x: 10, y: 10 },
            { x: 0, y: 10 },
        ];
        service['shiftKeyDown'] = false;
        service.onMouseUp(leftMouseEvent);
        expect(lineServiceSpy.drawLine).toHaveBeenCalled();
    });

    it('should not draw line if areIntersected attribute is true', () => {
        const leftMouseEvent = {
            x: 25,
            y: 25,
            button: MouseButton.Left,
        } as MouseEvent;
        service['areIntesected'] = true;
        const drawConstrainedLineSpy = spyOn<any>(service, 'drawConstrainedLine').and.stub();
        service.onMouseUp(leftMouseEvent);
        expect(lineServiceSpy.drawLine).not.toHaveBeenCalled();
        expect(drawConstrainedLineSpy).not.toHaveBeenCalled();
    });

    it('should draw all lines of polygon', () => {
        const origin: Vec2 = { x: 0, y: 0 };
        service.polygonCoords = [
            { x: 0, y: 0 },
            { x: 10, y: 0 },
            { x: 10, y: 10 },
            { x: 0, y: 10 },
        ];
        let translatePolygonSpy = spyOn(Utils, 'translatePolygon').and.stub();
        let findMinCoordSpy = spyOn(Utils, 'findMinCoord').and.stub();

        service.drawPolygon(service['drawingService'].previewCtx, origin);

        expect(translatePolygonSpy).toHaveBeenCalled();
        expect(findMinCoordSpy).toHaveBeenCalled();
        expect(lineServiceSpy.drawLine).toHaveBeenCalledTimes(4);
    });

    it('should draw constrained line if closestPoint is defined', () => {
        const leftMouseEvent = {
            x: 25,
            y: 25,
            button: MouseButton.Left,
        } as MouseEvent;
        const path: Vec2[] = [
            { x: 0, y: 0 },
            { x: 10, y: 0 },
            { x: 10, y: 10 },
            { x: 0, y: 10 },
        ];
        const styles: DrawingContextStyle = {
            strokeStyle: 'black',
            fillStyle: 'black',
            lineWidth: 1,
        };
        lineServiceSpy.calculatePosition.and.returnValue({ x: 10, y: 10 });
        service.drawConstrainedLine(service['drawingService'].previewCtx, path, styles, leftMouseEvent);
        expect(previewCtxSpy.moveTo).toHaveBeenCalled();
        expect(previewCtxSpy.lineTo).toHaveBeenCalled();
        expect(previewCtxSpy.stroke).toHaveBeenCalled();
    });

    it('should return correct Path2D of the polygon', () => {
        service.polygonCoords = [
            { x: 0, y: 0 },
            { x: 10, y: 0 },
            { x: 10, y: 10 },
            { x: 0, y: 10 },
        ];
        const result = service.calculatePath2d();
        expect(result).toBeDefined();
    });

    it('should automatically close polygon when mouse is in the closure area', () => {
        service.mouseDown = true;
        service['selectionOver'] = false;
        const leftMouseEvent = {
            x: 25,
            y: 25,
            button: MouseButton.Left,
        } as MouseEvent;
        service['nbSegments'] = 5;
        service['areIntesected'] = false;
        service.polygonCoords = [
            { x: 25, y: 26 },
            { x: 26, y: 26 },
            { x: 27, y: 26 },
            { x: 28, y: 26 },
        ];
        spyOn<any>(Utils, 'pointInCircle').and.returnValue(true);
        spyOn<any>(service, 'clearCurrentSegment').and.callThrough();
        service['mouseIsInClosureArea'](leftMouseEvent);
        expect(service.mouseDown).toBeFalse();
        expect(service['selectionOver']).toBeTrue();
        expect(service['drawingService'].clearCanvas).toHaveBeenCalledTimes(2);
        expect(lineServiceSpy.drawLine).toHaveBeenCalled();
    });

    it('should draw all lines except the last drawn', () => {
        service.polygonCoords = [
            { x: 0, y: 0 },
            { x: 10, y: 0 },
            { x: 10, y: 10 },
            { x: 0, y: 10 },
        ];
        service['redrawPreviousState']();
        expect(service['drawingService'].clearCanvas).toHaveBeenCalled();
        expect(lineServiceSpy.drawLine).toHaveBeenCalled();
        expect(service['currentSegment'].length).toEqual(0);
    });

    it('should reset all attribute and clear canvases if Escape is pressed', () => {
        service.mouseDown = true;
        service['nbSegments'] = 4;
        service['areIntesected'] = true;
        service['shiftKeyDown'] = true;
        service['currentSegment'] = [
            { x: 0, y: 0 },
            { x: 10, y: 10 },
            { x: 20, y: 20 },
        ];
        service.polygonCoords = [
            { x: 0, y: 0 },
            { x: 10, y: 10 },
            { x: 20, y: 20 },
        ];
        const escapeKeyEvent = new KeyboardEvent('keydown', {
            key: 'Escape',
        });
        service.handleKeyDown(escapeKeyEvent);

        expect(service.mouseDown).toBeFalse();
        expect(service['nbSegments']).toEqual(0);
        expect(service['areIntesected']).toBeFalse();
        expect(service['shiftKeyDown']).toBeFalse();
        expect(service['currentSegment'].length).toEqual(0);
        expect(service.polygonCoords.length).toEqual(0);
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalledTimes(2);
    });

    it('should call redrawPreviousState if Backspace key is pressed', () => {
        const redrawPreviousStateSpy = spyOn<any>(service, 'redrawPreviousState').and.stub();
        const backspaceKeyEvent = new KeyboardEvent('keydown', {
            key: 'Backspace',
        });
        service.handleKeyDown(backspaceKeyEvent);
        expect(redrawPreviousStateSpy).toHaveBeenCalled();
    });

    it('should set shiftKeyDown attribute to true if Shift key is pressed', () => {
        service['shiftKeyDown'] = false;
        const shiftKeyEvent = new KeyboardEvent('keydown', {
            key: 'Shift',
        });
        service.handleKeyDown(shiftKeyEvent);
        expect(service['shiftKeyDown']).toBeTrue();
    });

    it('should NOT set shiftKeyDown attribute to true if Shift key is not pressed', () => {
        service['shiftKeyDown'] = false;
        const otherKeyEvent = new KeyboardEvent('keyup', {
            key: 'Escape',
        });
        service.handleKeyUp(otherKeyEvent);
        expect(service['shiftKeyDown']).toBeFalse();
    });

    it('should set shiftKeyDown attribute to false if Shift key is up', () => {
        service['shiftKeyDown'] = true;
        const shiftKeyEvent = new KeyboardEvent('keyup', {
            key: 'Shift',
        });
        service.handleKeyUp(shiftKeyEvent);
        expect(service['shiftKeyDown']).toBeFalse();
    });

    it('should return true if two segments are confused', () => {
        const segment1: Segment = {
            initial: { x: 1, y: 4 },
            final: { x: 2, y: 2 },
        };
        const segment2: Segment = {
            initial: { x: 1, y: 4 },
            final: { x: 2, y: 2 },
        };
        const result = service['segmentsAreConfused'](segment1, segment2);
        expect(result).toBeTrue();
    });

    it('should return false if two segments are NOT confused', () => {
        const segment1: Segment = {
            initial: { x: 1, y: 4 },
            final: { x: 2, y: 2 },
        };
        const segment2: Segment = {
            initial: { x: 2, y: 2 },
            final: { x: 4, y: 3 },
        };
        const result = service['segmentsAreConfused'](segment1, segment2);
        expect(result).toBeFalse();
    });

    it('should set areIntersected attribute to true if two segments intersect', () => {
        service.mouseDownCoord = { x: 0, y: 2 };
        service['areIntesected'] = false;
        service.polygonCoords = [
            { x: 0, y: 0 },
            { x: 2, y: 4 },
            { x: 3, y: 2 },
        ];
        service['checkIfCurrentSegmentIntersectWithPolygon']();
        expect(service['areIntesected']).toBeTrue();
    });

    it('should set areIntersected attribute to true if two segments are confused', () => {
        service.mouseDownCoord = { x: 2, y: 4 };
        service['areIntesected'] = false;
        service.polygonCoords = [
            { x: 0, y: 0 },
            { x: 2, y: 4 },
            { x: 3, y: 2 },
        ];
        service['checkIfCurrentSegmentIntersectWithPolygon']();
        expect(service['areIntesected']).toBeTrue();
    });

    it('should set areIntersected attribute to false if two segments does NOT intersect', () => {
        service.mouseDownCoord = { x: 2, y: 1 };
        service['areIntesected'] = true;
        service.polygonCoords = [
            { x: 0, y: 0 },
            { x: 2, y: 4 },
            { x: 3, y: 2 },
        ];
        service['checkIfCurrentSegmentIntersectWithPolygon']();
        expect(service['areIntesected']).toBeFalse();
    });

    it('should set areIntersected attribute to true if current segment is outside the canvas', () => {
        const segment: Segment = {
            initial: { x: 50, y: 50 },
            final: { x: 200, y: 50 },
        };
        service['areIntesected'] = false;
        spyOn<any>(Utils, 'segmentsDoIntersect').and.callThrough();
        const result = service['currentSegmentIntersectsCanvas'](segment);
        expect(service['areIntesected']).toBeTrue();
        expect(result).toBeTrue();
    });

    it('should clear current segment', () => {
        service['currentSegment'] = [
            { x: 0, y: 0 },
            { x: 1, y: 1 },
            { x: 2, y: 2 },
            { x: 3, y: 3 },
        ];
        service['clearCurrentSegment']();
        expect(service['currentSegment'].length).toEqual(0);
    });

    it("should clear all polygon's coordinates", () => {
        service.polygonCoords = [
            { x: 0, y: 0 },
            { x: 10, y: 0 },
            { x: 10, y: 10 },
            { x: 0, y: 10 },
        ];
        service['clearPolygonCoords']();
        expect(service.polygonCoords.length).toEqual(0);
    });

    it('should NOT draw constrained line if closestPoint is not defined', () => {
        const lefttMouseEvent = {
            x: 25,
            y: 25,
            button: MouseButton.Left,
        } as MouseEvent;

        service.polygonCoords = [
            { x: 0, y: 0 },
            { x: 1, y: 1 },
            { x: 2, y: 2 },
            { x: 3, y: 3 },
        ];
        const styles: DrawingContextStyle = {
            strokeStyle: 'black',
            fillStyle: 'black',
            lineWidth: 1,
        } as DrawingContextStyle;

        lineServiceSpy.calculatePosition.and.returnValue(undefined);
        service['drawConstrainedLine'](service['drawingService'].baseCtx, service.polygonCoords, styles, lefttMouseEvent);
        expect(previewCtxSpy.moveTo).not.toHaveBeenCalled();
        expect(previewCtxSpy.lineTo).not.toHaveBeenCalled();
        expect(previewCtxSpy.stroke).not.toHaveBeenCalled();
    });
});
