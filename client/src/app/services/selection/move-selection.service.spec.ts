import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Vec2 } from '@app/classes/vec2';
import { MouseButton } from '@app/constants';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { SelectionService } from '@app/services/tools/selection/selection.service';
import { MagnetismService } from './magnetism.service';
import { MoveSelectionService } from './move-selection.service';

// tslint:disable
enum ArrowKeys {
    Up = 1,
    Down = 2,
    Left = 3,
    Right = 4,
}

describe('MoveSelectionService', () => {
    let service: MoveSelectionService;
    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
    let selectionServiceSpy: jasmine.SpyObj<SelectionService>;
    let magnetismServiceSpy: jasmine.SpyObj<MagnetismService>;

    let mouseEventLeft: MouseEvent;
    let mouseEventRight: MouseEvent;
    let keyboardEvent: KeyboardEvent;

    let canvasSpy: jasmine.SpyObj<CanvasRenderingContext2D>;
    let canvasTestHelper: CanvasTestHelper;
    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;

    beforeEach(() => {
        drawingServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);
        canvasSpy = jasmine.createSpyObj('CanvasRenderingContext2D', ['putImageData']);
        selectionServiceSpy = jasmine.createSpyObj('SelectionService', [
            'onMouseDown',
            'onMouseMove',
            'onMouseUp',
            'onMouseLeave',
            'handleKeyDown',
            'handleKeyUp',
            'mouseInSelectionArea',
            'selectAll',
            'createControlPoints',
            'clearUnderneathShape',
            'terminateSelection',
            'createBoundaryBox',
            'moveSelectionKeyboard',
        ]);
        magnetismServiceSpy = jasmine.createSpyObj('MagnetismService', ['activateMagnetism']);

        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawingServiceSpy },
                { provide: SelectionService, useValue: selectionServiceSpy },
                { provide: MagnetismService, useValue: magnetismServiceSpy },
            ],
        });

        service = TestBed.inject(MoveSelectionService);
        canvasTestHelper = TestBed.inject(CanvasTestHelper);

        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;

        service['drawingService'].baseCtx = baseCtxStub;
        service['drawingService'].previewCtx = previewCtxStub;
        service['drawingService'].canvas = canvasSpy.canvas;

        mouseEventLeft = {
            x: 25,
            y: 25,
            button: MouseButton.Left,
        } as MouseEvent;

        mouseEventRight = {
            x: 25,
            y: 25,
            button: MouseButton.Right,
        } as MouseEvent;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should clear interval on destroy if timeout is defined', () => {
        service['intervalId'] = setInterval(() => {}, 100);
        const clearIntervalSpy = spyOn<any>(window, 'clearInterval').and.stub();
        service.ngOnDestroy();
        expect(clearIntervalSpy).toHaveBeenCalled();
    });

    it('should not clear interval on destroy if timeout is undefined', () => {
        service['intervalId'] = undefined;
        const clearIntervalSpy = spyOn<any>(window, 'clearInterval').and.stub();
        service.ngOnDestroy();
        expect(clearIntervalSpy).not.toHaveBeenCalled();
    });

    it('should enable magnetism if isChecked is true', () => {
        service.isMagnetism = false;
        service.enableMagnetism(true);
        expect(service.isMagnetism).toBeTrue();
    });

    it('should set initialMousePosition with current mouse position', () => {
        service.mouseDown = true;
        selectionServiceSpy.selectionTerminated = false;
        let getPositionSpy = spyOn<any>(service, 'getPositionFromMouse').and.returnValue({ x: 25, y: 25 });
        const expectedResult: Vec2 = { x: 25, y: 25 };

        service.onMouseDown(mouseEventLeft);
        expect(service['initialMousePosition']).toEqual(expectedResult);
        expect(getPositionSpy).toHaveBeenCalled();
    });

    it('should not set initialMousePosition with current mouse position', () => {
        selectionServiceSpy.selectionTerminated = false;
        let getPositionSpy = spyOn<any>(service, 'getPositionFromMouse').and.stub();
        const expectedResult: Vec2 = { x: 25, y: 25 };

        service.onMouseDown(mouseEventRight);
        expect(service['initialMousePosition']).not.toEqual(expectedResult);
        expect(getPositionSpy).not.toHaveBeenCalled();
    });

    it('should clear previewCtx, move selection and clear underneath shape', () => {
        service.mouseDown = true;
        selectionServiceSpy.selectionTerminated = false;
        let clearUnderneathShapeSpy = spyOn<any>(service, 'clearUnderneathShape').and.stub();
        let moveSelectionMouseSpy = spyOn<any>(service, 'moveSelectionMouse').and.stub();

        service.onMouseMove(mouseEventLeft);
        expect(clearUnderneathShapeSpy).toHaveBeenCalled();
        expect(service['drawingService'].clearCanvas).toHaveBeenCalled();
        expect(moveSelectionMouseSpy).toHaveBeenCalled();
    });

    it('should not clear previewCtx, move selection and clear underneath shape', () => {
        service.mouseDown = false;
        selectionServiceSpy.selectionTerminated = false;
        let clearUnderneathShapeSpy = spyOn<any>(service, 'clearUnderneathShape').and.stub();
        let moveSelectionMouseSpy = spyOn<any>(service, 'moveSelectionMouse').and.stub();

        service.onMouseMove(mouseEventLeft);
        expect(clearUnderneathShapeSpy).not.toHaveBeenCalled();
        expect(service['drawingService'].clearCanvas).not.toHaveBeenCalled();
        expect(moveSelectionMouseSpy).not.toHaveBeenCalled();
    });

    it('should set newSelection to false if selection is not terminated and mouse is still in selection area', () => {
        selectionServiceSpy.selectionTerminated = false;
        selectionServiceSpy.mouseInSelectionArea.and.returnValue(true);

        service.onMouseMove(mouseEventLeft);
        expect(selectionServiceSpy.newSelection).toBeFalse();
    });

    it('should not set newSelection to false if selection is terminated and mouse is not in selection area', () => {
        selectionServiceSpy.selectionTerminated = true;
        spyOn<any>(service, 'initialSelection').and.stub();
        selectionServiceSpy.mouseInSelectionArea.and.stub();

        service.onMouseMove(mouseEventLeft);
        expect(selectionServiceSpy.newSelection).toBeUndefined();
    });

    it('should create boundary box on mouse up', () => {
        service.mouseDown = true;
        service['destination'] = { x: 0, y: 0 };
        service['newOrigin'] = { x: 1, y: 1 };
        service['selectionData'] = new ImageData(10, 10);
        spyOn<any>(service, 'isArrowPressed').and.stub();
        spyOn<any>(service, 'handleKeyDownArrow').and.stub();

        service.onMouseUp(mouseEventLeft);
        expect(selectionServiceSpy.createBoundaryBox).toHaveBeenCalled();
        expect(service.mouseDown).toBeFalse();
    });

    it('should not create boundary box on mouse up', () => {
        service.mouseDown = false;
        service['destination'] = { x: 0, y: 0 };
        service['newOrigin'] = { x: 1, y: 1 };
        service['selectionData'] = new ImageData(10, 10);
        spyOn<any>(service, 'isArrowPressed').and.stub();
        spyOn<any>(service, 'handleKeyDownArrow').and.stub();

        service.onMouseUp(mouseEventLeft);
        expect(selectionServiceSpy.createBoundaryBox).not.toHaveBeenCalled();
        expect(service.mouseDown).toBeFalse();
    });

    it('should terminate selection if Escape key is down and set mouseDown to false', () => {
        service.mouseDown = true;
        keyboardEvent = { key: 'Escape', preventDefault(): void {} } as KeyboardEvent;

        service.handleKeyDown(keyboardEvent);
        expect(selectionServiceSpy.terminateSelection).toHaveBeenCalled();
        expect(service.mouseDown).toBeFalse();
    });

    it('should not terminate selection if Escape key is not down', () => {
        service.mouseDown = true;
        keyboardEvent = { key: 'Shift', preventDefault(): void {} } as KeyboardEvent;

        service.handleKeyDown(keyboardEvent);
        expect(selectionServiceSpy.terminateSelection).not.toHaveBeenCalled();
        expect(service.mouseDown).toBeTrue();
    });

    it('should call handlekeyDownArrow when arrow left key is down', () => {
        selectionServiceSpy.activeSelection = true;
        spyOn<any>(service, 'isArrowPressed').and.returnValue(true);
        spyOn(window, 'setTimeout').and.stub();
        let handleKeyDownArrowSpy = spyOn<any>(service, 'handleKeyDownArrow').and.callThrough();
        spyOn<any>(service, 'moveSelectionKeyboard').and.stub();
        keyboardEvent = { key: 'ArrowLeft', preventDefault(): void {} } as KeyboardEvent;

        service.handleKeyDown(keyboardEvent);
        expect(handleKeyDownArrowSpy).toHaveBeenCalled();
    });

    it('should call handlekeyDownArrow when arrow key right is down', () => {
        selectionServiceSpy.activeSelection = true;
        spyOn(window, 'setTimeout').and.stub();
        let handleKeyDownArrowSpy = spyOn<any>(service, 'handleKeyDownArrow').and.callThrough();
        spyOn<any>(service, 'moveSelectionKeyboard').and.stub();
        keyboardEvent = { key: 'ArrowRight', preventDefault(): void {} } as KeyboardEvent;

        service.handleKeyDown(keyboardEvent);
        expect(handleKeyDownArrowSpy).toHaveBeenCalled();
    });

    it('should call handlekeyDownArrow when arrow key up is down', () => {
        selectionServiceSpy.activeSelection = true;
        spyOn(window, 'setTimeout').and.stub();
        let handleKeyDownArrowSpy = spyOn<any>(service, 'handleKeyDownArrow').and.callThrough();
        spyOn<any>(service, 'moveSelectionKeyboard').and.stub();
        keyboardEvent = { key: 'ArrowUp', preventDefault(): void {} } as KeyboardEvent;

        service.handleKeyDown(keyboardEvent);
        expect(handleKeyDownArrowSpy).toHaveBeenCalled();
    });

    it('should call handlekeyDownArrow when arrow key down is down', () => {
        selectionServiceSpy.activeSelection = true;
        spyOn(window, 'setTimeout').and.stub();
        let handleKeyDownArrowSpy = spyOn<any>(service, 'handleKeyDownArrow').and.callThrough();
        spyOn<any>(service, 'moveSelectionKeyboard').and.stub();
        keyboardEvent = { key: 'ArrowDown', preventDefault(): void {} } as KeyboardEvent;

        service.handleKeyDown(keyboardEvent);
        expect(handleKeyDownArrowSpy).toHaveBeenCalled();
    });

    it('should not call handleKeyDownArrow if key pressed is not an arrowKey', () => {
        selectionServiceSpy.activeSelection = true;
        keyboardEvent = { key: 'Escape', preventDefault(): void {} } as KeyboardEvent;
        let handleKeyDownArrowSpy = spyOn<any>(service, 'handleKeyDownArrow').and.stub();

        service.handleKeyDown(keyboardEvent);
        expect(handleKeyDownArrowSpy).not.toHaveBeenCalled();
    });

    xit('should set valid interval if arrow key is pressed', () => {
        spyOn<any>(service, 'isArrowPressed').and.returnValue(true);
        const setTimeoutSpy = spyOn(window, 'setTimeout').and.stub();
        keyboardEvent = { key: 'ArrowLeft', preventDefault(): void {} } as KeyboardEvent;

        service.handleKeyDown(keyboardEvent);
        expect(setTimeoutSpy).toHaveBeenCalled();
    });

    it('should create boundary box if ArrowLeft key is pressed', () => {
        keyboardEvent = { key: 'ArrowLeft', preventDefault(): void {} } as KeyboardEvent;
        service['selectionData'] = new ImageData(10, 10);
        service['destination'] = { x: 10, y: 10 };
        service['origin'] = { x: 0, y: 0 };
        service['newOrigin'] = { x: 1, y: 1 };
        service['intervalId'] = setInterval(() => {}, 100);
        const clearIntervalSpy = spyOn<any>(window, 'clearInterval').and.stub();
        spyOn<any>(service, 'clearUnderneathShape').and.stub();
        spyOn<any>(service, 'handleKeyDownArrow').and.callThrough();
        selectionServiceSpy.createBoundaryBox.and.stub();

        service.handleKeyUp(keyboardEvent);
        expect(clearIntervalSpy).toHaveBeenCalled();
        expect(selectionServiceSpy.createBoundaryBox).toHaveBeenCalled();
    });

    it('should create boundary box if ArrowRight key is pressed', () => {
        keyboardEvent = { key: 'ArrowRight', preventDefault(): void {} } as KeyboardEvent;
        service['selectionData'] = new ImageData(10, 10);
        service['destination'] = { x: 10, y: 10 };
        service['origin'] = { x: 0, y: 0 };
        service['newOrigin'] = { x: 1, y: 1 };
        service['intervalId'] = undefined;
        const clearIntervalSpy = spyOn<any>(window, 'clearInterval').and.stub();
        spyOn<any>(service, 'clearUnderneathShape').and.stub();
        spyOn<any>(service, 'handleKeyDownArrow').and.callThrough();
        selectionServiceSpy.createBoundaryBox.and.stub();

        service.handleKeyUp(keyboardEvent);
        expect(clearIntervalSpy).not.toHaveBeenCalled();
        expect(selectionServiceSpy.createBoundaryBox).toHaveBeenCalled();
    });

    it('should create boundary box if ArrowUp key is pressed', () => {
        keyboardEvent = { key: 'ArrowUp', preventDefault(): void {} } as KeyboardEvent;
        service['selectionData'] = new ImageData(10, 10);
        service['destination'] = { x: 10, y: 10 };
        service['origin'] = { x: 0, y: 0 };
        service['newOrigin'] = { x: 1, y: 1 };
        service['intervalId'] = setInterval(() => {}, 100);
        const clearIntervalSpy = spyOn<any>(window, 'clearInterval').and.stub();
        spyOn<any>(service, 'clearUnderneathShape').and.stub();
        spyOn<any>(service, 'handleKeyDownArrow').and.callThrough();
        spyOn<any>(service, 'isArrowPressed').and.returnValue(true);
        selectionServiceSpy.createBoundaryBox.and.stub();

        service.handleKeyUp(keyboardEvent);
        expect(clearIntervalSpy).not.toHaveBeenCalled();
        expect(selectionServiceSpy.createBoundaryBox).toHaveBeenCalled();
    });

    it('should create boundary box if ArrowDown key is pressed', () => {
        keyboardEvent = { key: 'ArrowDown', preventDefault(): void {} } as KeyboardEvent;
        service['selectionData'] = new ImageData(10, 10);
        service['destination'] = { x: 10, y: 10 };
        service['origin'] = { x: 0, y: 0 };
        service['newOrigin'] = { x: 1, y: 1 };
        spyOn<any>(service, 'clearUnderneathShape').and.stub();
        spyOn<any>(service, 'handleKeyDownArrow').and.callThrough();
        selectionServiceSpy.createBoundaryBox.and.stub();

        service.handleKeyUp(keyboardEvent);
        expect(selectionServiceSpy.createBoundaryBox).toHaveBeenCalled();
    });

    it('should not create boundary box if key pressed is not an arrow key', () => {
        keyboardEvent = { key: 'Escape', preventDefault(): void {} } as KeyboardEvent;

        service.handleKeyUp(keyboardEvent);
        expect(selectionServiceSpy.createBoundaryBox).not.toHaveBeenCalled();
    });

    it('should put image data on specified context', () => {
        spyOn<any>(service, 'initialSelection').and.stub();
        service['initialMousePosition'] = { x: 0, y: 0 };
        service.mouseDownCoord = { x: 10, y: 10 };
        service['origin'] = { x: 3, y: 3 };
        const putImageDataSpy = spyOn(baseCtxStub, 'putImageData').and.stub();

        service['moveSelectionMouse'](baseCtxStub);
        expect(putImageDataSpy).toHaveBeenCalled();
    });

    it('should put image data on specified context when magnetism is turned on (move with mouse)', () => {
        spyOn<any>(service, 'initialSelection').and.stub();
        service['initialMousePosition'] = { x: 0, y: 0 };
        service.mouseDownCoord = { x: 10, y: 10 };
        service['origin'] = { x: 3, y: 3 };
        service.isMagnetism = true;
        selectionServiceSpy['height'] = 10;
        selectionServiceSpy['width'] = 10;
        service['selectionData'] = new ImageData(10, 10);
        magnetismServiceSpy.activateMagnetism.and.returnValue( { x: 3, y: 3 });
        const putImageDataSpy = spyOn(baseCtxStub, 'putImageData').and.stub();

        service['moveSelectionMouse'](baseCtxStub);
        expect(magnetismServiceSpy.activateMagnetism).toHaveBeenCalled();
        expect(putImageDataSpy).toHaveBeenCalled();
    });

    it('should move selection to right if ArrowRight is pressed', () => {
        service['keysDown'].set(ArrowKeys.Up, false).set(ArrowKeys.Down, false).set(ArrowKeys.Left, false).set(ArrowKeys.Right, true);
        service['newOrigin'] = { x: 10, y: 10 };
        service['selectionData'] = new ImageData(10, 10);
        selectionServiceSpy['origin'] = { x: 0, y: 0 };
        selectionServiceSpy['destination'] = { x: 10, y: 10 };
        spyOn<any>(service, 'clearUnderneathShape').and.stub();
        const putImageDataSpy = spyOn(baseCtxStub, 'putImageData').and.stub();
        const getImageDataSpy = spyOn(baseCtxStub, 'getImageData').and.stub();

        service['moveSelectionKeyboard'](baseCtxStub);
        expect(putImageDataSpy).toHaveBeenCalled();
        expect(getImageDataSpy).toHaveBeenCalled();
        expect(service['origin']).toEqual(service['newOrigin']);
    });

    it('should move selection to left if ArrowLeft is pressed', () => {
        service['keysDown'].set(ArrowKeys.Up, false).set(ArrowKeys.Down, false).set(ArrowKeys.Left, true).set(ArrowKeys.Right, false);
        service['newOrigin'] = { x: 10, y: 10 };
        service['selectionData'] = new ImageData(10, 10);
        selectionServiceSpy['origin'] = { x: 0, y: 0 };
        selectionServiceSpy['destination'] = { x: 10, y: 10 };
        spyOn<any>(service, 'clearUnderneathShape').and.stub();
        const putImageDataSpy = spyOn(baseCtxStub, 'putImageData').and.stub();
        const getImageDataSpy = spyOn(baseCtxStub, 'getImageData').and.stub();

        service['moveSelectionKeyboard'](baseCtxStub);
        expect(putImageDataSpy).toHaveBeenCalled();
        expect(getImageDataSpy).toHaveBeenCalled();
        expect(service['origin']).toEqual(service['newOrigin']);
    });

    it('should move selection down if ArrowDown is pressed', () => {
        service['keysDown'].set(ArrowKeys.Up, false).set(ArrowKeys.Down, true).set(ArrowKeys.Left, false).set(ArrowKeys.Right, false);
        service['newOrigin'] = { x: 10, y: 10 };
        service['selectionData'] = new ImageData(10, 10);
        selectionServiceSpy['origin'] = { x: 0, y: 0 };
        selectionServiceSpy['destination'] = { x: 10, y: 10 };
        spyOn<any>(service, 'clearUnderneathShape').and.stub();
        const putImageDataSpy = spyOn(baseCtxStub, 'putImageData').and.stub();
        const getImageDataSpy = spyOn(baseCtxStub, 'getImageData').and.stub();

        service['moveSelectionKeyboard'](baseCtxStub);
        expect(putImageDataSpy).toHaveBeenCalled();
        expect(getImageDataSpy).toHaveBeenCalled();
        expect(service['origin']).toEqual(service['newOrigin']);
    });

    it('should move selection up if ArrowUp is pressed', () => {
        service['keysDown'].set(ArrowKeys.Up, true).set(ArrowKeys.Down, false).set(ArrowKeys.Left, false).set(ArrowKeys.Right, false);
        service['newOrigin'] = { x: 10, y: 10 };
        service['selectionData'] = new ImageData(10, 10);
        selectionServiceSpy['origin'] = { x: 0, y: 0 };
        selectionServiceSpy['destination'] = { x: 10, y: 10 };
        spyOn<any>(service, 'clearUnderneathShape').and.stub();
        const putImageDataSpy = spyOn(baseCtxStub, 'putImageData').and.stub();
        const getImageDataSpy = spyOn(baseCtxStub, 'getImageData').and.stub();

        service['moveSelectionKeyboard'](baseCtxStub);
        expect(putImageDataSpy).toHaveBeenCalled();
        expect(getImageDataSpy).toHaveBeenCalled();
        expect(service['origin']).toEqual(service['newOrigin']);
    });

    it('should not move selection if no arrow keys are pressed', () => {
        service['keysDown'].set(ArrowKeys.Up, false).set(ArrowKeys.Down, false).set(ArrowKeys.Left, false).set(ArrowKeys.Right, false);
        service['newOrigin'] = { x: 10, y: 10 };
        service['selectionData'] = new ImageData(10, 10);
        selectionServiceSpy['origin'] = { x: 0, y: 0 };
        selectionServiceSpy['destination'] = { x: 10, y: 10 };
        spyOn<any>(service, 'clearUnderneathShape').and.stub();
        const putImageDataSpy = spyOn(baseCtxStub, 'putImageData').and.stub();
        const getImageDataSpy = spyOn(baseCtxStub, 'getImageData').and.stub();

        service['moveSelectionKeyboard'](baseCtxStub);
        expect(putImageDataSpy).toHaveBeenCalled();
        expect(getImageDataSpy).toHaveBeenCalled();
        expect(service['origin']).toEqual(service['newOrigin']);
    });

    it('should put image data on specified context when magnetism is turned on (move with keyboard)', () => {
        service['newOrigin'] = { x: 0, y: 0 };
        service['keysDown'].set(ArrowKeys.Up, false).set(ArrowKeys.Down, false).set(ArrowKeys.Left, true).set(ArrowKeys.Right, false);
        spyOn<any>(service, 'clearUnderneathShape').and.stub();
        drawingServiceSpy.clearCanvas.and.stub();
        service.isMagnetism = true;
        selectionServiceSpy['height'] = 10;
        selectionServiceSpy['width'] = 10;
        magnetismServiceSpy.activateMagnetism.and.returnValue({x:3,y:3});
        const putImageDataSpy = spyOn(service['drawingService'].baseCtx, 'putImageData').and.stub();
        service['selectionData'] = new ImageData(10, 10);

        service['moveSelectionKeyboard'](service['drawingService'].baseCtx);
        expect(magnetismServiceSpy.activateMagnetism).toHaveBeenCalled();
        expect(putImageDataSpy).toHaveBeenCalled();
        expect(service['origin']).toEqual(service['newOrigin']);
    });

    it('should initialize selection parameters', () => {
        selectionServiceSpy.origin = { x: 0, y: 0 };
        selectionServiceSpy.destination = { x: 0, y: 0 };
        selectionServiceSpy.selection = new ImageData(10, 10);
        selectionServiceSpy.initialSelection = true;

        service['initialSelection']();
        expect(service['origin']).toEqual(selectionServiceSpy.origin);
        expect(service['destination']).toEqual(selectionServiceSpy.destination);
        expect(service['selectionData']).toEqual(selectionServiceSpy.selection);
        expect(selectionServiceSpy.initialSelection).toBeFalse();
    });

    it('should clear shape underneath selection', () => {
        selectionServiceSpy.clearUnderneath = true;
        selectionServiceSpy.clearUnderneathShape.and.stub();

        service['clearUnderneathShape']();
        expect(selectionServiceSpy.clearUnderneathShape).toHaveBeenCalled();
        expect(selectionServiceSpy.clearUnderneath).toBeFalse();
    });
});
