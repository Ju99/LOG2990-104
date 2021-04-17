import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { DrawingContextStyle } from '@app/classes/drawing-context-styles';
import { Utils } from '@app/classes/math-utils';
import { Vec2 } from '@app/classes/vec2';
import { DEFAULT_JUNCTION_RADIUS, DEFAULT_LINE_THICKNESS, MouseButton, mouseEventLClick, TypeOfJunctions } from '@app/constants';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { LineService } from './line.service';

// tslint:disable
describe('LineService', () => {
    let service: LineService;
    let leftMouseEvent: MouseEvent;
    let rightMouseEvent: MouseEvent;
    let pathData: Vec2[];
    let canvasTestHelper: CanvasTestHelper;

    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let undoRedoServiceSpy: jasmine.SpyObj<UndoRedoService>;
    let drawLineSpy: jasmine.Spy<any>;
    let drawConstrainedLineSpy: jasmine.Spy<any>;
    let getPositionFromMouseSpy: jasmine.Spy<any>;

    let baseCtxSpy: CanvasRenderingContext2D;
    let previewCtxSpy: CanvasRenderingContext2D;

    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);
        undoRedoServiceSpy = jasmine.createSpyObj('UndoRedoService', ['addToStack', 'setToolInUse']);

        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawServiceSpy },
                { provide: UndoRedoService, useValue: undoRedoServiceSpy },
            ],
        });
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        previewCtxSpy = jasmine.createSpyObj('CanvasRendringContext', [
            'putImageData',
            'beginPath',
            'stroke',
            'lineWidth',
            'getImageData',
            'moveTo',
            'lineTo',
        ]);
        baseCtxSpy = jasmine.createSpyObj('CanvasRendringContext', [
            'putImageData',
            'beginPath',
            'stroke',
            'lineWidth',
            'getImageData',
            'moveTo',
            'lineTo',
            'arc',
            'fill',
        ]);
        service = TestBed.inject(LineService);
        service['drawingService'].baseCtx = baseCtxSpy;
        service['drawingService'].previewCtx = previewCtxSpy;
        service['drawingService'].canvas = canvasTestHelper.canvas;

        leftMouseEvent = {
            x: 25,
            y: 25,
            button: MouseButton.Left,
        } as MouseEvent;

        rightMouseEvent = {
            x: 25,
            y: 25,
            button: MouseButton.Right,
        } as MouseEvent;

        pathData = [
            { x: 10, y: 10 },
            { x: 25, y: 25 },
        ] as Vec2[];
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should have a DEFAULT_JUNCTION_RADIUS, DEFAULT_LINE_THICKNESS and a regular junction type on start', () => {
        const junctionRadius = service.junctionRadius;
        const lineWidth = service.lineWidth;
        const junctionType = service.junctionType;
        expect(junctionRadius).toEqual(DEFAULT_JUNCTION_RADIUS);
        expect(lineWidth).toEqual(DEFAULT_LINE_THICKNESS);
        expect(junctionType).toEqual(TypeOfJunctions.Regular);
    });

    it('should set mouseDown property to true on left click', () => {
        service.onMouseClick(leftMouseEvent);
        expect(service.mouseDown).toBeTruthy();
    });

    it('should set mouseDown property to false on right click', () => {
        service.onMouseClick(rightMouseEvent);
        expect(service.mouseDown).toBeFalsy();
    });

    it('should add closest point from line in coordinates array if shift key is pressed', () => {
        service['hasPressedShiftKey'] = true;
        let calculatePositionSpy = spyOn<any>(service, 'calculatePosition').and.returnValue({ x: 25, y: 25 });

        service.onMouseClick(leftMouseEvent);
        expect(service['coordinates'].length).toEqual(2);
        expect(calculatePositionSpy).toHaveBeenCalled();
    });

    it('should drawPoint on base context if junction type is Circle', () => {
        service['hasPressedShiftKey'] = true;
        let calculatePositionSpy = spyOn<any>(service, 'calculatePosition').and.returnValue({ x: 25, y: 25 });
        let drawPointSpy = spyOn<any>(service, 'drawPoint').and.stub();
        service.junctionType = TypeOfJunctions.Circle;

        service.onMouseClick(leftMouseEvent);
        expect(service['coordinates'].length).toEqual(2);
        expect(calculatePositionSpy).toHaveBeenCalled();
        expect(drawPointSpy).toHaveBeenCalled();
    });

    it('should not draw point on base context if junction type is not circle and shift key is pressed', () => {
        service['hasPressedShiftKey'] = true;
        let calculatePositionSpy = spyOn<any>(service, 'calculatePosition').and.returnValue(undefined);
        let drawPointSpy = spyOn<any>(service, 'drawPoint').and.stub();

        service.onMouseClick(leftMouseEvent);
        expect(calculatePositionSpy).toHaveBeenCalled();
        expect(drawPointSpy).not.toHaveBeenCalled();
    });

    it('should draw point on base context if junction type is circle and shift key is not pressed', () => {
        service['hasPressedShiftKey'] = false;
        let drawPointSpy = spyOn<any>(service, 'drawPoint').and.stub();
        service.junctionType = TypeOfJunctions.Circle;

        service.onMouseClick(leftMouseEvent);
        expect(drawPointSpy).toHaveBeenCalled();
    });

    it('should set mouseDown to false when onMouseDoubleClick is called', () => {
        service.onMouseDoubleClick(leftMouseEvent);
        expect(service.mouseDown).toEqual(false);
    });

    it('should call drawLine on base context when onMouseUp is called and shift key is not pressed', () => {
        const mockMousePosition: Vec2 = { x: 25, y: 25 };
        service['currentSegment'] = pathData;
        service.mouseDown = true;
        service['hasPressedShiftKey'] = false;
        getPositionFromMouseSpy = spyOn(service, 'getPositionFromMouse').and.returnValue(mockMousePosition);
        drawLineSpy = spyOn<any>(service, 'drawLine').and.stub();

        service.onMouseUp(leftMouseEvent);
        expect(getPositionFromMouseSpy).toHaveBeenCalledWith(leftMouseEvent);
        expect(drawLineSpy).toHaveBeenCalled();
    });

    it('should call drawConstrainedLine on base context when mouse was is down and shift key is pressed', () => {
        const mockMousePosition: Vec2 = { x: 25, y: 25 };
        service['currentSegment'] = pathData;
        service.mouseDown = true;
        service['hasPressedShiftKey'] = true;
        spyOn(service, 'getPositionFromMouse').and.returnValue(mockMousePosition);
        drawConstrainedLineSpy = spyOn<any>(service, 'drawConstrainedLine').and.stub();

        service.onMouseUp(leftMouseEvent);
        expect(drawConstrainedLineSpy).toHaveBeenCalled();
    });

    it('should not call drawLine and drawConstrainedLine on base context if mouse was not down', () => {
        const mockMousePosition: Vec2 = { x: 25, y: 25 };
        service['currentSegment'] = pathData;
        service.mouseDown = false;
        spyOn(service, 'getPositionFromMouse').and.returnValue(mockMousePosition);
        drawLineSpy = spyOn<any>(service, 'drawLine').and.stub();
        drawConstrainedLineSpy = spyOn<any>(service, 'drawConstrainedLine').and.stub();

        service.onMouseUp(leftMouseEvent);
        expect(drawLineSpy).not.toHaveBeenCalled();
        expect(drawConstrainedLineSpy).not.toHaveBeenCalled();
    });

    it('should call drawLine on preview context when shift key is not pressed', () => {
        service.mouseDown = true;
        service['hasPressedShiftKey'] = false;
        service['currentSegment'] = pathData;
        drawLineSpy = spyOn<any>(service, 'drawLine').and.stub();

        service.onMouseMove(leftMouseEvent);
        expect(drawLineSpy).toHaveBeenCalled();
    });

    it('should call drawConstrainedLine on preview context when shift key is pressed', () => {
        service.mouseDown = true;
        service['hasPressedShiftKey'] = true;
        service['currentSegment'] = pathData;
        drawConstrainedLineSpy = spyOn<any>(service, 'drawConstrainedLine').and.stub();

        service.onMouseMove(leftMouseEvent);
        expect(drawConstrainedLineSpy).toHaveBeenCalled();
    });

    it('should not draw line on preview context when mouse was not down', () => {
        service.mouseDown = false;
        service['currentSegment'] = pathData;
        drawConstrainedLineSpy = spyOn<any>(service, 'drawConstrainedLine').and.stub();
        drawLineSpy = spyOn<any>(service, 'drawLine').and.stub();

        service.onMouseMove(leftMouseEvent);
        expect(drawConstrainedLineSpy).not.toHaveBeenCalled();
        expect(drawLineSpy).not.toHaveBeenCalled();
    });

    it('should set mouseDown to false when Escape key is pressed', () => {
        let escapeKeyEvent = { key: 'Escape', preventDefault(): void {} } as KeyboardEvent;
        service.handleKeyDown(escapeKeyEvent);
        expect(service.mouseDown).toBeFalse();
    });

    it('should set hasPressedShiftKey to true when Shift key is pressed', () => {
        let shiftKey = { key: 'Shift', preventDefault(): void {} } as KeyboardEvent;
        service.handleKeyDown(shiftKey);
        expect(service['hasPressedShiftKey']).toBeTrue();
    });

    it('should put image data on baseCtx when Backspace key is pressed', () => {
        let backspaceKeyEvent = { key: 'Backspace', preventDefault(): void {} } as KeyboardEvent;
        service.handleKeyDown(backspaceKeyEvent);
        expect(baseCtxSpy.putImageData).toHaveBeenCalled();
    });

    it('should set hasPressedShiftKey to false if shift key is up', () => {
        service['hasPressedShiftKey'] = true;
        let shiftKeyEvent = { key: 'Shift', preventDefault(): void {} } as KeyboardEvent;

        service.handleKeyUp(shiftKeyEvent);
        expect(service['hasPressedShiftKey']).toBeFalse();
    });

    it('should not set hasPressedShiftKey to false if shift key is not up', () => {
        service['hasPressedShiftKey'] = true;
        let shiftKeyEvent = { key: 't', preventDefault(): void {} } as KeyboardEvent;

        service.handleKeyUp(shiftKeyEvent);
        expect(service['hasPressedShiftKey']).toBeTrue();
    });

    it('should return nearest point from current point', () => {
        const currentPoint = { x: 0, y: 0 };
        const basePoint = { x: 0, y: 0 };
        const getNearestPointSpy = spyOn<any>(Utils, 'getNearestPoint').and.returnValue({ x: 0, y: 0 });

        service['calculatePosition'](currentPoint, basePoint);
        expect(getNearestPointSpy).toHaveBeenCalled();
    });

    it('should draw line on base ctx', () => {
        const styles: DrawingContextStyle = {
            strokeStyle: 'black',
            fillStyle: 'black',
            lineWidth: 1,
        };

        service.drawLine(service['drawingService'].baseCtx, pathData, styles);
        expect(service['drawingService'].baseCtx.beginPath).toHaveBeenCalled();
        expect(service['drawingService'].baseCtx.moveTo).toHaveBeenCalled();
        expect(service['drawingService'].baseCtx.lineTo).toHaveBeenCalled();
        expect(service['drawingService'].baseCtx.stroke).toHaveBeenCalled();
    });

    it('should draw constrained line on base ctx', () => {
        const styles: DrawingContextStyle = {
            strokeStyle: 'black',
            fillStyle: 'black',
            lineWidth: 1,
        };
        spyOn<any>(service, 'calculatePosition').and.returnValue({ x: 0, y: 0 });

        service.drawConstrainedLine(service['drawingService'].baseCtx, pathData, styles, mouseEventLClick);
        expect(service['drawingService'].baseCtx.beginPath).toHaveBeenCalled();
        expect(service['drawingService'].baseCtx.moveTo).toHaveBeenCalled();
        expect(service['drawingService'].baseCtx.lineTo).toHaveBeenCalled();
        expect(service['drawingService'].baseCtx.stroke).toHaveBeenCalled();
    });

    it('should not draw constrained line on base ctx', () => {
        const styles: DrawingContextStyle = {
            strokeStyle: 'black',
            fillStyle: 'black',
            lineWidth: 1,
        };
        spyOn<any>(service, 'calculatePosition').and.returnValue(undefined);

        service.drawConstrainedLine(service['drawingService'].baseCtx, pathData, styles, mouseEventLClick);
        expect(service['drawingService'].baseCtx.beginPath).toHaveBeenCalled();
        expect(service['drawingService'].baseCtx.moveTo).not.toHaveBeenCalled();
        expect(service['drawingService'].baseCtx.lineTo).not.toHaveBeenCalled();
        expect(service['drawingService'].baseCtx.stroke).not.toHaveBeenCalled();
    });

    it('should draw point on baseCtx', () => {
        service['drawPoint'](service['drawingService'].baseCtx, { x: 100, y: 100 });
        expect(service['drawingService'].baseCtx.beginPath).toHaveBeenCalled();
        expect(service['drawingService'].baseCtx.arc).toHaveBeenCalled();
        expect(service['drawingService'].baseCtx.stroke).toHaveBeenCalled();
        expect(service['drawingService'].baseCtx.fill).toHaveBeenCalled();
    });
});
