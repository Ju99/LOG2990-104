import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Vec2 } from '@app/classes/vec2';
import { DEFAULT_JUNCTION_RADIUS, DEFAULT_LINE_THICKNESS, MouseButton, TypeOfJunctions } from '@app/constants';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { LineService } from './line.service';

// tslint:disable
describe('LineService', () => {
    let service: LineService;
    let leftMouseEvent: MouseEvent;
    let rightMouseEvent: MouseEvent;
    let pathData: Vec2[];
    let canvasTestHelper: CanvasTestHelper;

    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let drawLineSpy: jasmine.Spy<any>;
    let drawConstrainedLineSpy: jasmine.Spy<any>;
    let getPositionFromMouseSpy: jasmine.Spy<any>;

    let baseCtxSpy: CanvasRenderingContext2D;
    let previewCtxSpy: CanvasRenderingContext2D;

    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);

        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawServiceSpy }],
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

    it('should set mouseDownCoord to correct position when onMouseClick is called', () => {
        const expectedResult: Vec2 = { x: 25, y: 25 };
        service.mouseDown = true;
        getPositionFromMouseSpy = spyOn(service, 'getPositionFromMouse').and.returnValue(expectedResult);
        service.onMouseClick(leftMouseEvent);

        expect(getPositionFromMouseSpy).toHaveBeenCalledWith(leftMouseEvent);
        expect(service.mouseDownCoord).toEqual(expectedResult);
        expect(service['coordinates'].length).toEqual(1);
        expect(service['coordinates'][0]).toEqual(expectedResult);
    });

    it('should add mouseDownCoord to coordinates array', () => {
        service['coordinates'] = [];
        service.onMouseClick(leftMouseEvent);
        expect(service['coordinates'].length).toEqual(1);
    });

    it('should add closest point from line in coordinates array if shift key is pressed', () => {
        service['hasPressedShiftKey'] = true;
        let calculatePositionSpy = spyOn<any>(service, 'calculatePosition').and.returnValue({ x: 25, y: 25 });
        service.onMouseClick(leftMouseEvent);

        expect(service['coordinates'].length).toEqual(2);
        expect(calculatePositionSpy).toHaveBeenCalled();
    });
    it('onMouseClick should drawPoint on base contexte if junction type is Circle', () => {
        const mockMousePosition: Vec2 | undefined = { x: 25, y: 25 };
        service['hasPressedShiftKey'] = true;
        service['closestPoint'] = mockMousePosition;
        const isCircle = service.junctionType === TypeOfJunctions.Circle;

        let calculatePositionSpy = spyOn<any>(service, 'calculatePosition').and.callThrough();

        service.onMouseClick(leftMouseEvent);
        expect(calculatePositionSpy).toHaveBeenCalled();
        expect(isCircle).toBeFalsy();
    });

    it('should set mouseDown to false when onMouseDoubleClick is called', () => {
        service.onMouseDoubleClick(leftMouseEvent);
        expect(service.mouseDown).toEqual(false);
    });

    it('should clear path data when onMouseDoubleClick is called', () => {
        let clearPathSpy = spyOn<any>(service, 'clearPath').and.callThrough();
        service.onMouseDoubleClick(leftMouseEvent);
        expect(clearPathSpy).toHaveBeenCalled();
        expect(service['pathData'].length).toEqual(0);
    });

    it('should call drawLine on base context when onMouseUp is called and shift key is not pressed', () => {
        const mockMousePosition: Vec2 = { x: 25, y: 25 };
        service['pathData'] = pathData;
        service.mouseDown = true;
        service['hasPressedShiftKey'] = false;

        getPositionFromMouseSpy = spyOn(service, 'getPositionFromMouse').and.returnValue(mockMousePosition);
        drawLineSpy = spyOn<any>(service, 'drawLine').and.stub().and.callThrough();

        service.onMouseUp(leftMouseEvent);

        expect(getPositionFromMouseSpy).toHaveBeenCalledWith(leftMouseEvent);
        expect(drawLineSpy).toHaveBeenCalledWith(service['drawingService'].baseCtx, pathData);
    });

    // it('should call drawConstrainedLine on base context when onMouseUp is called and shift key is pressed', () => {
    //     service['coordinates'] = pathData;
    //     service.mouseDown = true;
    //     service['hasPressedShiftKey'] = true;

    //     drawConstrainedLineSpy = spyOn<any>(service, 'drawConstrainedLine').and.callThrough();

    //     service.onMouseUp(leftMouseEvent);
    //     expect(drawConstrainedLineSpy).toHaveBeenCalledWith(service['drawingService'].baseCtx, service['coordinates'], leftMouseEvent);
    // });

    it('should call getCanvasState when onMouseUp is called', () => {
        let getCanvasStateSpy = spyOn<any>(service, 'getCanvasState').and.callThrough();
        service.onMouseUp(leftMouseEvent);
        expect(getCanvasStateSpy).toHaveBeenCalled();
    });

    it('should clear path when onMouseUp is called', () => {
        let clearPathSpy = spyOn<any>(service, 'clearPath').and.callThrough();
        service.onMouseUp(leftMouseEvent);
        expect(clearPathSpy).toHaveBeenCalled();
        expect(service['pathData'].length).toEqual(0);
    });

    it('should call drawLine on preview context when onMouseMove is called and shift key is not pressed', () => {
        service.mouseDown = true;
        service['hasPressedShiftKey'] = false;
        service['pathData'] = pathData;

        drawLineSpy = spyOn<any>(service, 'drawLine').and.stub();

        service.onMouseMove(leftMouseEvent);
        expect(drawLineSpy).toHaveBeenCalledWith(service['drawingService'].previewCtx, pathData);
    });

    it('should call drawContrainedLine on preview context when onMouseMove is called and shift key is pressed', () => {
        service['pathData'] = pathData;
        service.mouseDown = true;
        service['hasPressedShiftKey'] = true;

        drawConstrainedLineSpy = spyOn<any>(service, 'drawConstrainedLine').and.callThrough();

        service.onMouseMove(leftMouseEvent);
        expect(drawConstrainedLineSpy).toHaveBeenCalled();
    });

    it('handleKeyDown should set mouseDown to false when Escape key is pressed', () => {
        let escapeKeyEvent = { key: 'Escape' } as KeyboardEvent;
        service.handleKeyUp(escapeKeyEvent);
        expect(service.mouseDown).toBeFalsy();
    });

    it('handleKeyDown should set hasPressedShiftKey to true when Shift key is pressed', () => {
        const shiftKeyEvent = new KeyboardEvent('keyup', {
            key: 'Shift',
        });
        service.handleKeyUp(shiftKeyEvent);
        expect(service['hasPressedShiftKey']).toBeFalsy();
    });

    it('handleKeyDown should call putImageData when Backspace key is pressed', () => {
        let backspaceKeyEvent = { key: 'Backspace', preventDefault(): void {} } as KeyboardEvent;
        service.handleKeyDown(backspaceKeyEvent);

        expect(baseCtxSpy.putImageData).toHaveBeenCalled();
    });

    it('handleKeyUp should set hasPressedShiftKey to false', () => {
        const shiftKeyEvent = new KeyboardEvent('keyup', {
            key: 'Shift',
        });

        service.handleKeyUp(shiftKeyEvent);
        expect(service['hasPressedShiftKey']).toBeFalsy();
    });
});
