import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { SelectionTool } from '@app/classes/selection';
import { Vec2 } from '@app/classes/vec2';
import { MouseButton } from '@app/constants';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { SelectionService } from '@app/services/tools/selection/selection.service';
import { SelectionUtilsService } from '@app/services/utils/selection-utils.service';
import { MagnetismService } from './magnetism.service';
import { MoveSelectionService } from './move-selection.service';
import { ResizeSelectionService } from './resize-selection.service';

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
    let selectionUtilsSpyServiceSpy: jasmine.SpyObj<SelectionUtilsService>;
    let resizeSelectionServiceSpy: jasmine.SpyObj<ResizeSelectionService>;
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
            'selectAll',
            'createControlPoints',
            'terminateSelection',
            'moveSelectionKeyboard',
            'initialiseServiceDimensions',
            'getSelectionData',
        ]);
        resizeSelectionServiceSpy = jasmine.createSpyObj('ResizeSelectionService', ['checkIfMouseIsOnControlPoint']);
        selectionUtilsSpyServiceSpy = jasmine.createSpyObj('SelectionUtilsService', [
            'clearUnderneathShape',
            'createBoundaryBox',
            'mouseInSelectionArea',
            'resizeSelection',
            'endResizeSelection',
        ]);
        magnetismServiceSpy = jasmine.createSpyObj('MagnetismService', ['activateMagnetism']);

        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawingServiceSpy },
                { provide: SelectionService, useValue: selectionServiceSpy },
                { provide: ResizeSelectionService, useValue: resizeSelectionServiceSpy },
                { provide: SelectionUtilsService, useValue: selectionUtilsSpyServiceSpy },
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

    it('should verify if mouse is on control point', () => {
        service.mouseDown = true;
        selectionServiceSpy.selectionTerminated = false;
        let getPositionSpy = spyOn<any>(service, 'getPositionFromMouse').and.returnValue({ x: 25, y: 25 });
        selectionUtilsSpyServiceSpy.controlPointsCoord = [
            { x: 0, y: 0 },
            { x: 5, y: 0 },
            { x: 10, y: 0 },
        ];
        resizeSelectionServiceSpy.checkIfMouseIsOnControlPoint.and.returnValue(false);
        const expectedResult: Vec2 = { x: 25, y: 25 };

        service.onMouseDown(mouseEventLeft);
        expect(service['initialMousePosition']).toEqual(expectedResult);
        expect(getPositionSpy).toHaveBeenCalled();
        expect(resizeSelectionServiceSpy.checkIfMouseIsOnControlPoint).toHaveBeenCalled();
    });

    it('should not verify if mouse is on control point', () => {
        selectionServiceSpy.selectionTerminated = false;
        let getPositionSpy = spyOn<any>(service, 'getPositionFromMouse').and.stub();
        const expectedResult: Vec2 = { x: 25, y: 25 };

        service.onMouseDown(mouseEventRight);
        expect(service['initialMousePosition']).not.toEqual(expectedResult);
        expect(getPositionSpy).not.toHaveBeenCalled();
    });

    it('should resize selection if selectionTerminated is false and isResizing is true', () => {
        service.mouseDown = true;
        selectionServiceSpy.selectionTerminated = false;
        selectionUtilsSpyServiceSpy.isResizing = true;
        selectionUtilsSpyServiceSpy.resizeSelection.and.stub();

        service.onMouseMove(mouseEventLeft);
        expect(selectionUtilsSpyServiceSpy.resizeSelection).toHaveBeenCalled();
    });

    it('should move selection if selectionTerminated is false and isResizing is false', () => {
        service.mouseDown = true;
        selectionServiceSpy.selectionTerminated = false;
        selectionUtilsSpyServiceSpy.isResizing = false;
        const moveSelectionMouseSpy = spyOn<any>(service, 'moveSelectionMouse').and.stub();
        const clearUnderneathShapeSpy = spyOn<any>(service, 'clearUnderneathShape').and.stub();

        service.onMouseMove(mouseEventLeft);
        expect(moveSelectionMouseSpy).toHaveBeenCalled();
        expect(clearUnderneathShapeSpy).toHaveBeenCalled();
    });

    it('should handle correctly selection if selectionTerminated is true', () => {
        service.mouseDown = true;
        selectionServiceSpy.selectionTerminated = true;
        const handleSpy = spyOn<any>(service, 'handleSelectionWhenNotTerminatedOnMouseMove').and.stub();

        service.onMouseMove(mouseEventLeft);
        expect(handleSpy).toHaveBeenCalled();
    });

    it('should handle resized selection if isResizing is true', () => {
        service.mouseDown = true;
        selectionUtilsSpyServiceSpy.isResizing = true;
        const handleResizedSpy = spyOn<any>(service, 'handleResizedSelectionOnMouseUp').and.stub();

        service.onMouseUp(mouseEventLeft);
        expect(handleResizedSpy).toHaveBeenCalled();
        expect(service.mouseDown).toBeFalse();
    });

    it('should create boundary box if isResizing is false', () => {
        service.mouseDown = true;
        service['newOrigin'] = { x: 20, y: 20 };
        service['selectionData'] = new ImageData(10, 10);
        selectionUtilsSpyServiceSpy.isResizing = false;
        service['selectionObject'] = new SelectionTool({ x: 100, y: 100 }, { x: 100, y: 100 }, 100, 100);

        service.onMouseUp(mouseEventLeft);
        expect(selectionUtilsSpyServiceSpy.createBoundaryBox).toHaveBeenCalled();
        expect(service.mouseDown).toBeFalse();
    });

    it('should not create boundary box if mouse is not down', () => {
        service.mouseDown = false;

        service.onMouseUp(mouseEventLeft);
        expect(selectionUtilsSpyServiceSpy.createBoundaryBox).not.toHaveBeenCalled();
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
        service['selectionObject'] = new SelectionTool({ x: 0, y: 0 }, { x: 10, y: 10 }, 10, 10);
        service['selectionData'] = new ImageData(10, 10);
        service['destination'] = { x: 10, y: 10 };
        service['origin'] = { x: 0, y: 0 };
        service['newOrigin'] = { x: 1, y: 1 };
        service['intervalId'] = setInterval(() => {}, 100);
        const clearIntervalSpy = spyOn<any>(window, 'clearInterval').and.stub();
        spyOn<any>(service, 'clearUnderneathShape').and.stub();
        spyOn<any>(service, 'handleKeyDownArrow').and.callThrough();
        selectionUtilsSpyServiceSpy.createBoundaryBox.and.stub();

        service.handleKeyUp(keyboardEvent);
        expect(clearIntervalSpy).toHaveBeenCalled();
        expect(selectionUtilsSpyServiceSpy.createBoundaryBox).toHaveBeenCalled();
    });

    it('should create boundary box if ArrowRight key is pressed', () => {
        keyboardEvent = { key: 'ArrowRight', preventDefault(): void {} } as KeyboardEvent;
        service['selectionObject'] = new SelectionTool({ x: 0, y: 0 }, { x: 10, y: 10 }, 10, 10);
        service['selectionData'] = new ImageData(10, 10);
        service['destination'] = { x: 10, y: 10 };
        service['origin'] = { x: 0, y: 0 };
        service['newOrigin'] = { x: 1, y: 1 };
        service['intervalId'] = undefined;
        const clearIntervalSpy = spyOn<any>(window, 'clearInterval').and.stub();
        spyOn<any>(service, 'clearUnderneathShape').and.stub();
        spyOn<any>(service, 'handleKeyDownArrow').and.callThrough();
        selectionUtilsSpyServiceSpy.createBoundaryBox.and.stub();

        service.handleKeyUp(keyboardEvent);
        expect(clearIntervalSpy).not.toHaveBeenCalled();
        expect(selectionUtilsSpyServiceSpy.createBoundaryBox).toHaveBeenCalled();
    });

    it('should create boundary box if ArrowUp key is pressed', () => {
        keyboardEvent = { key: 'ArrowUp', preventDefault(): void {} } as KeyboardEvent;
        service['selectionObject'] = new SelectionTool({ x: 0, y: 0 }, { x: 10, y: 10 }, 10, 10);
        service['selectionData'] = new ImageData(10, 10);
        service['destination'] = { x: 10, y: 10 };
        service['origin'] = { x: 0, y: 0 };
        service['newOrigin'] = { x: 1, y: 1 };
        service['intervalId'] = setInterval(() => {}, 100);
        const clearIntervalSpy = spyOn<any>(window, 'clearInterval').and.stub();
        spyOn<any>(service, 'clearUnderneathShape').and.stub();
        spyOn<any>(service, 'handleKeyDownArrow').and.callThrough();
        spyOn<any>(service, 'isArrowPressed').and.returnValue(true);
        selectionUtilsSpyServiceSpy.createBoundaryBox.and.stub();

        service.handleKeyUp(keyboardEvent);
        expect(clearIntervalSpy).not.toHaveBeenCalled();
        expect(selectionUtilsSpyServiceSpy.createBoundaryBox).toHaveBeenCalled();
    });

    it('should create boundary box if ArrowDown key is pressed', () => {
        keyboardEvent = { key: 'ArrowDown', preventDefault(): void {} } as KeyboardEvent;
        service['selectionObject'] = new SelectionTool({ x: 0, y: 0 }, { x: 10, y: 10 }, 10, 10);
        service['selectionData'] = new ImageData(10, 10);
        service['destination'] = { x: 10, y: 10 };
        service['origin'] = { x: 0, y: 0 };
        service['newOrigin'] = { x: 1, y: 1 };
        spyOn<any>(service, 'clearUnderneathShape').and.stub();
        spyOn<any>(service, 'handleKeyDownArrow').and.callThrough();
        selectionUtilsSpyServiceSpy.createBoundaryBox.and.stub();

        service.handleKeyUp(keyboardEvent);
        expect(selectionUtilsSpyServiceSpy.createBoundaryBox).toHaveBeenCalled();
    });

    it('should not create boundary box if key pressed is not an arrow key', () => {
        keyboardEvent = { key: 'Escape', preventDefault(): void {} } as KeyboardEvent;

        service.handleKeyUp(keyboardEvent);
        expect(selectionUtilsSpyServiceSpy.createBoundaryBox).not.toHaveBeenCalled();
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
        magnetismServiceSpy.activateMagnetism.and.returnValue({ x: 3, y: 3 });
        const putImageDataSpy = spyOn(baseCtxStub, 'putImageData').and.stub();

        service['moveSelectionMouse'](baseCtxStub);
        expect(magnetismServiceSpy.activateMagnetism).toHaveBeenCalled();
        expect(putImageDataSpy).toHaveBeenCalled();
    });

    it('should set newSelection attribute of SelectionService to false if selectionTerminated is false and mouse if in selection area', () => {
        spyOn<any>(service, 'initialSelection').and.stub();
        selectionServiceSpy.selectionTerminated = false;
        selectionUtilsSpyServiceSpy.mouseInSelectionArea.and.returnValue(true);

        service['handleSelectionWhenNotTerminatedOnMouseMove']({} as MouseEvent);
        expect(selectionServiceSpy.newSelection).toBeFalse();
    });

    it('should set newSelection attribute of SelectionService to true if selectionTerminated is false and mouse if not in selection area', () => {
        spyOn<any>(service, 'initialSelection').and.stub();
        selectionServiceSpy.selectionTerminated = false;
        selectionUtilsSpyServiceSpy.mouseInSelectionArea.and.returnValue(false);

        service['handleSelectionWhenNotTerminatedOnMouseMove']({} as MouseEvent);
        expect(selectionServiceSpy.newSelection).toBeTrue();
    });

    it('should not change newSelection attribute of SelectionService  selectionTerminated is true', () => {
        spyOn<any>(service, 'initialSelection').and.stub();
        selectionServiceSpy.selectionTerminated = true;

        service['handleSelectionWhenNotTerminatedOnMouseMove']({} as MouseEvent);
        expect(selectionServiceSpy.newSelection).toBeUndefined();
    });

    it('should initialize dimension and get selection data correctly', () => {
        selectionUtilsSpyServiceSpy.endResizeSelection.and.returnValue(new SelectionTool({ x: 0, y: 0 }, { x: 110, y: 110 }, 110, 110));
        selectionServiceSpy.initialiseServiceDimensions.and.stub();
        selectionServiceSpy.getSelectionData.and.stub();

        service['handleResizedSelectionOnMouseUp']();
        expect(service['selectionObject']).toEqual(new SelectionTool({ x: 0, y: 0 }, { x: 110, y: 110 }, 110, 110));
        expect(selectionServiceSpy.selectionObject).toEqual(service['selectionObject']);
        expect(service['origin']).toEqual(service['selectionObject'].origin);
        expect(service['destination']).toEqual(service['selectionObject'].destination);
        expect(service['selectionData']).toEqual(selectionServiceSpy.selection);
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

    it('should put image data on specified context when magnetism is turned on (move with keyboard)', () => {
        service['keysDown'].set(ArrowKeys.Up, false).set(ArrowKeys.Down, false).set(ArrowKeys.Left, true).set(ArrowKeys.Right, false);
        selectionServiceSpy.origin = { x: 100, y: 110 };
        magnetismServiceSpy.squareSize = 20;
        spyOn<any>(service, 'clearUnderneathShape').and.stub();
        drawingServiceSpy.clearCanvas.and.stub();
        service.isMagnetism = true;
        selectionServiceSpy['height'] = 40;
        selectionServiceSpy['width'] = 40;
        magnetismServiceSpy.activateMagnetism.and.returnValue({ x: 80, y: 80 });
        service['selectionData'] = new ImageData(10, 10);
        const putImageDataSpy = spyOn(service['drawingService'].baseCtx, 'putImageData').and.stub();

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
        service['selectionObject'] = new SelectionTool({ x: 0, y: 0 }, { x: 10, y: 10 }, 10, 10);
        selectionUtilsSpyServiceSpy.clearUnderneathShape.and.stub();

        service['clearUnderneathShape']();
        expect(selectionUtilsSpyServiceSpy.clearUnderneathShape).toHaveBeenCalled();
        expect(selectionServiceSpy.clearUnderneath).toBeFalse();
    });

    it('should not clear underneatch shape if clearUnderneath is false', () => {
        selectionServiceSpy.clearUnderneath = false;

        service['clearUnderneathShape']();
        expect(selectionUtilsSpyServiceSpy.clearUnderneathShape).not.toHaveBeenCalled();
    });

    it('should return true if key is in map', () => {
        const getSpy = spyOn<any>(service['keysDown'], 'get').and.returnValue(true);

        const result = service['isArrowPressed']();
        expect(getSpy).toHaveBeenCalled;
        expect(result).toBeTrue();
    });
});
