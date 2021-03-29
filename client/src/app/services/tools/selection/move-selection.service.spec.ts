import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { MoveSelectionService } from './move-selection.service';
import { SelectionService } from './selection.service';

// tslint:disable
describe('MoveSelectionService', () => {
    let service: MoveSelectionService;
    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
    let selectionService: SelectionService;

    let mouseEventLeft: MouseEvent;
    let keyboardEvent: KeyboardEvent;

    let canvasSpy: jasmine.SpyObj<CanvasRenderingContext2D>;
    let canvasTestHelper: CanvasTestHelper;
    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;

    beforeEach(() => {
        drawingServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);
        canvasSpy = jasmine.createSpyObj('CanvasRenderingContext2D', ['putImageData']);
        selectionService = jasmine.createSpyObj('SelectionService', [
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
        ]);

        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawingServiceSpy },
                { provide: SelectionService, useValue: selectionService },
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
            button: 0,
        } as MouseEvent;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('onMouseDown should set mouseDownCoord to correct position', () => {
        const expectedResult: Vec2 = { x: 25, y: 25 };
        service.mouseDown = true;
        selectionService.selectionTerminated = false;

        let getPositionSpy = spyOn<any>(service, 'getPositionFromMouse').and.returnValue({ x: 25, y: 25 });

        service.onMouseDown(mouseEventLeft);
        expect(service['initialMousePosition']).toEqual(expectedResult);
        expect(getPositionSpy).toHaveBeenCalled();
    });

    it('onMouseMove should clear underneath shape', () => {
        service.mouseDown = true;
        selectionService.selectionTerminated = false;
        let clearUnderneathShapeSpy = spyOn<any>(service, 'clearUnderneathShape').and.stub();
        spyOn<any>(service, 'moveSelectionMouse').and.stub();
        service.onMouseMove(mouseEventLeft);
        expect(clearUnderneathShapeSpy).toHaveBeenCalled();
    });

    it('onMouseMove should call initialSelection', () => {
        selectionService.selectionTerminated = false;
        let initialSelectionSpy = spyOn<any>(service, 'initialSelection').and.callThrough();
        service.onMouseMove(mouseEventLeft);
        expect(initialSelectionSpy).toHaveBeenCalled();
        expect(selectionService.mouseInSelectionArea).toHaveBeenCalled();
    });

    it('should call terminateSelection if Escape key is down and set mouseDown to false', () => {
        service.mouseDown = true;
        keyboardEvent = { key: 'Escape', preventDefault(): void {} } as KeyboardEvent;
        service.handleKeyDown(keyboardEvent);
        expect(selectionService.terminateSelection).toHaveBeenCalled();
        expect(service.mouseDown).toBeFalse();
    });

    it('should call handlekeyDownArrow when arrow left key is down', () => {
        selectionService.activeSelection = true;
        spyOn(window, 'setTimeout').and.stub();
        let handleKeyDownArrowSpy = spyOn<any>(service, 'handleKeyDownArrow').and.callThrough();
        spyOn<any>(service, 'moveSelectionKeyboard').and.stub();
        keyboardEvent = { key: 'ArrowLeft', preventDefault(): void {} } as KeyboardEvent;
        service.handleKeyDown(keyboardEvent);
        expect(handleKeyDownArrowSpy).toHaveBeenCalled();
    });

    it('should call handlekeyDownArrow when arrow key right is down', () => {
        selectionService.activeSelection = true;
        spyOn(window, 'setTimeout').and.stub();
        let handleKeyDownArrowSpy = spyOn<any>(service, 'handleKeyDownArrow').and.callThrough();
        spyOn<any>(service, 'moveSelectionKeyboard').and.stub();
        keyboardEvent = { key: 'ArrowRight', preventDefault(): void {} } as KeyboardEvent;
        service.handleKeyDown(keyboardEvent);
        expect(handleKeyDownArrowSpy).toHaveBeenCalled();
    });

    it('should call handlekeyDownArrow when arrow key up is down', () => {
        selectionService.activeSelection = true;
        spyOn(window, 'setTimeout').and.stub();
        let handleKeyDownArrowSpy = spyOn<any>(service, 'handleKeyDownArrow').and.callThrough();
        spyOn<any>(service, 'moveSelectionKeyboard').and.stub();
        keyboardEvent = { key: 'ArrowUp', preventDefault(): void {} } as KeyboardEvent;
        service.handleKeyDown(keyboardEvent);
        expect(handleKeyDownArrowSpy).toHaveBeenCalled();
    });

    it('should call handlekeyDownArrow when arrow key down is down', () => {
        selectionService.activeSelection = true;
        spyOn(window, 'setTimeout').and.stub();
        let handleKeyDownArrowSpy = spyOn<any>(service, 'handleKeyDownArrow').and.callThrough();
        spyOn<any>(service, 'moveSelectionKeyboard').and.stub();
        keyboardEvent = { key: 'ArrowDown', preventDefault(): void {} } as KeyboardEvent;
        service.handleKeyDown(keyboardEvent);
        expect(handleKeyDownArrowSpy).toHaveBeenCalled();
    });
});
