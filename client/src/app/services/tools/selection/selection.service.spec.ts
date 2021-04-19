import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Utils } from '@app/classes/math-utils';
import { SelectionTool } from '@app/classes/selection';
import { mouseEventLClick } from '@app/constants';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ResizeSelectionService } from '@app/services/selection/resize-selection.service';
import { RectangleService } from '@app/services/tools//rectangle/rectangle.service';
import { EllipseService } from '@app/services/tools/ellipse/ellipse.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { SelectionUtilsService } from '@app/services/utils/selection-utils.service';
import { EllipseSelectionService } from './ellipse-selection/ellipse-selection.service';
import { LassoService } from './lasso/lasso.service';
import { SelectionService } from './selection.service';

// tslint:disable
describe('SelectionService', () => {
    let service: SelectionService;
    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
    let rectangleServiceSpy: jasmine.SpyObj<RectangleService>;
    let ellipseServiceSpy: jasmine.SpyObj<EllipseService>;
    let ellipseSelectionServiceSpy: jasmine.SpyObj<EllipseSelectionService>;
    let lassoServiceSpy: jasmine.SpyObj<LassoService>;
    let selectionUtilsServiceSpy: jasmine.SpyObj<SelectionUtilsService>;
    let resizeSelectionServiceSpy: jasmine.SpyObj<ResizeSelectionService>;
    let undoRedoServiceSpy: jasmine.SpyObj<UndoRedoService>;

    let canvasSpy: jasmine.SpyObj<CanvasRenderingContext2D>;
    let canvasTestHelper: CanvasTestHelper;
    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;

    beforeEach(() => {
        drawingServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);
        rectangleServiceSpy = jasmine.createSpyObj('RectangleService', ['onMouseDown', 'onMouseMove', 'handleKeyDown', 'handleKeyUp']);
        ellipseServiceSpy = jasmine.createSpyObj('EllipseService', ['onMouseDown', 'onMouseMove', 'handleKeyDown', 'handleKeyUp']);
        ellipseSelectionServiceSpy = jasmine.createSpyObj('EllipseSelectionService', ['printEllipse', 'checkPixelInEllipse']);
        lassoServiceSpy = jasmine.createSpyObj('LassoService', [
            'onMouseClick',
            'onMouseDown',
            'onMouseMove',
            'onMouseUp',
            'handleKeyDown',
            'handleKeyUp',
            'resetAttributes',
            'printPolygon',
            'checkPixelInPolygon',
        ]);
        selectionUtilsServiceSpy = jasmine.createSpyObj('SelectionUtilsService', [
            'resizeSelection',
            'resetParametersTools',
            'initializeToolParameters',
            'mouseInSelectionArea',
            'createBoundaryBox',
            'endResizeSelection',
            'createControlPoints',
            'reajustOriginAndDestination',
        ]);
        resizeSelectionServiceSpy = jasmine.createSpyObj('ResizeSelectionService', ['handleKeyDown', 'handleKeyUp', 'checkIfMouseIsOnControlPoint']);
        undoRedoServiceSpy = jasmine.createSpyObj('UndoRedoService', ['addToStack', 'setToolInUse']);
        canvasSpy = jasmine.createSpyObj('CanvasRenderingContext2D', ['getImageData']);

        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawingServiceSpy },
                { provide: RectangleService, useValue: rectangleServiceSpy },
                { provide: EllipseService, useValue: ellipseServiceSpy },
                { provide: EllipseSelectionService, useValue: ellipseSelectionServiceSpy },
                { provide: LassoService, useValue: lassoServiceSpy },
                { provide: SelectionUtilsService, useValue: selectionUtilsServiceSpy },
                { provide: ResizeSelectionService, useValue: resizeSelectionServiceSpy },
                { provide: UndoRedoService, useValue: undoRedoServiceSpy },
                { provide: CanvasRenderingContext2D, useValue: canvasSpy },
            ],
        });
        service = TestBed.inject(SelectionService);

        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        service['drawingService'].baseCtx = baseCtxStub;
        service['drawingService'].previewCtx = previewCtxStub;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should call onMouseClick of LassoService if selection is Lasso on mouse click', () => {
        service.isLasso = true;
        lassoServiceSpy.selectionOver = false;
        service.newSelection = true;
        selectionUtilsServiceSpy.isResizing = false;
        service.selectionTerminated = true;

        service.onMouseClick(mouseEventLClick);
        expect(service.selectionTerminated).toBeFalse();
        expect(lassoServiceSpy.onMouseClick).toHaveBeenCalledWith(mouseEventLClick);
    });

    it('should not call onMouseClick of LassoService if selection is not Lasso on mouse click', () => {
        service.isLasso = false;
        lassoServiceSpy.selectionOver = false;
        service.newSelection = true;
        selectionUtilsServiceSpy.isResizing = false;
        service.selectionTerminated = true;

        service.onMouseClick(mouseEventLClick);
        expect(service.selectionTerminated).toBeTrue();
        expect(lassoServiceSpy.onMouseClick).not.toHaveBeenCalledWith(mouseEventLClick);
    });

    it('should handle selection correctly on mouse down', () => {
        const activeSelectionSpy = spyOn<any>(service, 'handleActiveSelectionOnMouseDown').and.stub();
        const resizedSelectionSpy = spyOn<any>(service, 'handleResizedSelectionOnMouseDown').and.stub();
        const activeLassoSelectionSpy = spyOn<any>(service, 'handleActiveLassoSelectionOnMouseDown').and.stub();

        service.onMouseDown(mouseEventLClick);
        expect(service.mouseDown).toBeTrue();
        expect(activeSelectionSpy).toHaveBeenCalled();
        expect(resizedSelectionSpy).toHaveBeenCalled();
        expect(activeLassoSelectionSpy).toHaveBeenCalled();
    });

    it('should resize selection correctly if Lasso is selected', () => {
        service.isLasso = true;
        lassoServiceSpy.selectionOver = false;
        service.mouseDown = true;
        selectionUtilsServiceSpy.isResizing = true;
        service.onMouseMove(mouseEventLClick);
        expect(lassoServiceSpy.onMouseMove).toHaveBeenCalled();
        expect(selectionUtilsServiceSpy.resizeSelection).toHaveBeenCalled();
    });
    it('should not resize selection correctly if Lasso is selected', () => {
        service.isLasso = false;
        lassoServiceSpy.selectionOver = false;
        service.mouseDown = false;
        service.isEllipse = true;
        selectionUtilsServiceSpy.isResizing = false;
        service.onMouseMove(mouseEventLClick);
        expect(lassoServiceSpy.onMouseMove).not.toHaveBeenCalled();
        expect(selectionUtilsServiceSpy.resizeSelection).not.toHaveBeenCalled();
    });

    it('should call onMouseMove of ellipseService if isEllipse is true', () => {
        service.isLasso = true;
        lassoServiceSpy.selectionOver = false;
        service.mouseDown = true;
        selectionUtilsServiceSpy.isResizing = false;
        service.isEllipse = true;
        const mouseEventLClick = {
            x: 25,
            y: 25,
            button: 0,
        } as MouseEvent;
        service.onMouseMove(mouseEventLClick);
        expect(lassoServiceSpy.onMouseMove).toHaveBeenCalled();
        expect(selectionUtilsServiceSpy.resizeSelection).not.toHaveBeenCalled();
    });

    it('should call onMouseUp of LassoService if isLasso is true', () => {
        service.isLasso = true;
        lassoServiceSpy.selectionOver = false;
        const handleLassoSelectionWhenOverSpy = spyOn<any>(service, 'handleLassoSelectionWhenOverOnMouseUp').and.stub();
        const handleResizedSelectionSpy = spyOn<any>(service, 'handleResizedSelectionOnMouseUp').and.stub();
        const handleActiveSelection = spyOn<any>(service, 'handleActiveSelectionOnMouseUp').and.stub();

        service.onMouseUp(mouseEventLClick);
        expect(lassoServiceSpy.onMouseUp).toHaveBeenCalled();
        expect(handleLassoSelectionWhenOverSpy).toHaveBeenCalled();
        expect(handleResizedSelectionSpy).toHaveBeenCalled();
        expect(handleActiveSelection).toHaveBeenCalled();
    });
    it('should call onMouseUp of LassoService if isEllipse is true', () => {
        service.isLasso = true;
        lassoServiceSpy.selectionOver = false;
        const handleLassoSelectionWhenOverSpy = spyOn<any>(service, 'handleLassoSelectionWhenOverOnMouseUp').and.stub();
        const handleResizedSelectionSpy = spyOn<any>(service, 'handleResizedSelectionOnMouseUp').and.stub();
        const handleActiveSelection = spyOn<any>(service, 'handleActiveSelectionOnMouseUp').and.stub();

        service.onMouseUp(mouseEventLClick);
        expect(lassoServiceSpy.onMouseUp).toHaveBeenCalled();
        expect(handleLassoSelectionWhenOverSpy).toHaveBeenCalled();
        expect(handleResizedSelectionSpy).toHaveBeenCalled();
        expect(handleActiveSelection).toHaveBeenCalled();
    });

    it('should not call onMouseUp of LassoService if isLasso is false', () => {
        service.isLasso = false;
        lassoServiceSpy.selectionOver = false;
        const handleLassoSelectionWhenOverSpy = spyOn<any>(service, 'handleLassoSelectionWhenOverOnMouseUp').and.stub();
        const handleResizedSelectionSpy = spyOn<any>(service, 'handleResizedSelectionOnMouseUp').and.stub();
        const handleActiveSelection = spyOn<any>(service, 'handleActiveSelectionOnMouseUp').and.stub();

        service.onMouseUp(mouseEventLClick);
        expect(lassoServiceSpy.onMouseUp).not.toHaveBeenCalled();
        expect(handleLassoSelectionWhenOverSpy).toHaveBeenCalled();
        expect(handleResizedSelectionSpy).toHaveBeenCalled();
        expect(handleActiveSelection).toHaveBeenCalled();
    });

    it('should call onMouseUp if mouse is down and selection is not Lasso on mouse leave', () => {
        service.mouseDown = true;
        service.isLasso = false;
        const onMouseUpSpy = spyOn<any>(service, 'onMouseUp').and.stub();

        service.onMouseLeave(mouseEventLClick);
        expect(onMouseUpSpy).toHaveBeenCalled();
    });

    it('should not call onMouseUp if mouse is not down or selection is Lasso on mouse leave', () => {
        service.mouseDown = false;
        service.isLasso = true;
        const onMouseUpSpy = spyOn<any>(service, 'onMouseUp').and.stub();

        service.onMouseLeave(mouseEventLClick);
        expect(onMouseUpSpy).not.toHaveBeenCalled();
    });

    it('should terminate selection if Escape key is pressed', () => {
        const keyboardEvent = { key: 'Escape', preventDefault(): void {} } as KeyboardEvent;
        const terminateSelectionSpy = spyOn<any>(service, 'terminateSelection').and.stub();

        service.handleKeyDown(keyboardEvent);
        expect(terminateSelectionSpy).toHaveBeenCalled();
    });

    it('should call handleKeyDown of resizeSelectionService if Shift key is pressed', () => {
        const keyboardEvent = { key: 'Shift', preventDefault(): void {} } as KeyboardEvent;
        resizeSelectionServiceSpy.handleKeyDown.and.stub();
        ellipseServiceSpy.handleKeyDown.and.stub();
        lassoServiceSpy.handleKeyDown.and.stub();
        rectangleServiceSpy.handleKeyDown.and.stub();

        service.handleKeyDown(keyboardEvent);
        expect(resizeSelectionServiceSpy.handleKeyDown).toHaveBeenCalled();
        expect(resizeSelectionServiceSpy.handleKeyDown).toHaveBeenCalled();
        expect(ellipseServiceSpy.handleKeyDown).not.toHaveBeenCalled();
        expect(lassoServiceSpy.handleKeyDown).not.toHaveBeenCalled();
        expect(rectangleServiceSpy.handleKeyDown).toHaveBeenCalled();
    });

    it('should not call handleKeyDown of resizeSelectionService if Shift key is not pressed', () => {
        const keyboardEvent = { key: 'x', preventDefault(): void {} } as KeyboardEvent;
        resizeSelectionServiceSpy.handleKeyDown.and.stub();
        ellipseServiceSpy.handleKeyDown.and.stub();
        lassoServiceSpy.handleKeyDown.and.stub();
        rectangleServiceSpy.handleKeyDown.and.stub();

        service.handleKeyDown(keyboardEvent);
        expect(resizeSelectionServiceSpy.handleKeyDown).not.toHaveBeenCalled();
        expect(ellipseServiceSpy.handleKeyDown).not.toHaveBeenCalled();
        expect(lassoServiceSpy.handleKeyDown).not.toHaveBeenCalled();
        expect(rectangleServiceSpy.handleKeyDown).toHaveBeenCalled();
    });

    it('should call handleKeyDown of ellipseService if isEllipse is true', () => {
        const keyboardEvent = {} as KeyboardEvent;
        service.isEllipse = true;
        service.isLasso = false;
        ellipseServiceSpy.handleKeyDown.and.stub();
        lassoServiceSpy.handleKeyDown.and.stub();
        rectangleServiceSpy.handleKeyDown.and.stub();

        service.handleKeyDown(keyboardEvent);
        expect(ellipseServiceSpy.handleKeyDown).toHaveBeenCalled();
        expect(lassoServiceSpy.handleKeyDown).not.toHaveBeenCalled();
        expect(rectangleServiceSpy.handleKeyDown).not.toHaveBeenCalled();
    });

    it('should call handleKeyDown of lassoService if isLasso is true', () => {
        const keyboardEvent = {} as KeyboardEvent;
        service.isEllipse = false;
        service.isLasso = true;
        ellipseServiceSpy.handleKeyDown.and.stub();
        lassoServiceSpy.handleKeyDown.and.stub();
        rectangleServiceSpy.handleKeyDown.and.stub();

        service.handleKeyDown(keyboardEvent);
        expect(ellipseServiceSpy.handleKeyDown).not.toHaveBeenCalled();
        expect(lassoServiceSpy.handleKeyDown).toHaveBeenCalled();
        expect(rectangleServiceSpy.handleKeyDown).not.toHaveBeenCalled();
    });

    it('should call handleKeyUp of resizeSelectionService if Shift key is pressed', () => {
        const keyboardEvent = { key: 'Shift', preventDefault(): void {} } as KeyboardEvent;
        resizeSelectionServiceSpy.handleKeyUp.and.stub();
        ellipseServiceSpy.handleKeyUp.and.stub();
        lassoServiceSpy.handleKeyUp.and.stub();
        rectangleServiceSpy.handleKeyUp.and.stub();

        service.handleKeyUp(keyboardEvent);
        expect(resizeSelectionServiceSpy.handleKeyUp).toHaveBeenCalled();
        expect(ellipseServiceSpy.handleKeyUp).not.toHaveBeenCalled();
        expect(lassoServiceSpy.handleKeyUp).not.toHaveBeenCalled();
        expect(rectangleServiceSpy.handleKeyUp).toHaveBeenCalled();
    });

    it('should not call handleKeyUp of resizeSelectionService if Shift key is not pressed', () => {
        const keyboardEvent = { key: 'x', preventDefault(): void {} } as KeyboardEvent;
        resizeSelectionServiceSpy.handleKeyUp.and.stub();
        ellipseServiceSpy.handleKeyUp.and.stub();
        lassoServiceSpy.handleKeyUp.and.stub();
        rectangleServiceSpy.handleKeyUp.and.stub();

        service.handleKeyUp(keyboardEvent);
        expect(resizeSelectionServiceSpy.handleKeyUp).not.toHaveBeenCalled();
        expect(ellipseServiceSpy.handleKeyUp).not.toHaveBeenCalled();
        expect(lassoServiceSpy.handleKeyUp).not.toHaveBeenCalled();
        expect(rectangleServiceSpy.handleKeyUp).toHaveBeenCalled();
    });

    it('should call handleKeyUp of ellipseService if isEllipse is true', () => {
        const keyboardEvent = {} as KeyboardEvent;
        service.isEllipse = true;
        service.isLasso = false;
        resizeSelectionServiceSpy.handleKeyUp.and.stub();
        ellipseServiceSpy.handleKeyUp.and.stub();
        lassoServiceSpy.handleKeyUp.and.stub();
        rectangleServiceSpy.handleKeyUp.and.stub();

        service.handleKeyUp(keyboardEvent);
        expect(resizeSelectionServiceSpy.handleKeyUp).not.toHaveBeenCalled();
        expect(ellipseServiceSpy.handleKeyUp).toHaveBeenCalled();
        expect(lassoServiceSpy.handleKeyUp).not.toHaveBeenCalled();
        expect(rectangleServiceSpy.handleKeyUp).not.toHaveBeenCalled();
    });

    it('should call handleKeyUp of lassoService if isLasso is true', () => {
        const keyboardEvent = {} as KeyboardEvent;
        service.isEllipse = false;
        service.isLasso = true;
        resizeSelectionServiceSpy.handleKeyUp.and.stub();
        ellipseServiceSpy.handleKeyUp.and.stub();
        lassoServiceSpy.handleKeyUp.and.stub();
        rectangleServiceSpy.handleKeyUp.and.stub();

        service.handleKeyUp(keyboardEvent);
        expect(resizeSelectionServiceSpy.handleKeyUp).not.toHaveBeenCalled();
        expect(ellipseServiceSpy.handleKeyUp).not.toHaveBeenCalled();
        expect(lassoServiceSpy.handleKeyUp).toHaveBeenCalled();
        expect(rectangleServiceSpy.handleKeyUp).not.toHaveBeenCalled();
    });

    it('should get image data from baseCtx and set attributes correctly when selecting all canvas', () => {
        const printMovedSelectionSpy = spyOn<any>(service, 'printMovedSelection').and.stub();
        drawingServiceSpy.canvas = document.createElement('canvas');
        const getImageDataSpy = spyOn<any>(service['drawingService'].baseCtx, 'getImageData').and.returnValue(new Image(10, 10));
        service.destination = { x: 10, y: 10 };

        service.selectAll();
        expect(printMovedSelectionSpy).toHaveBeenCalled();
        expect(getImageDataSpy).toHaveBeenCalled();
        expect(selectionUtilsServiceSpy.createBoundaryBox).toHaveBeenCalled();
        expect(service.height).toEqual(service.destination.y);
    });

    it('should terminate selection correctly if activeSelection is true and selectionDeleted is false', () => {
        service.activeSelection = true;
        service.selectionDeleted = false;
        const printMovedSelectionSpy = spyOn<any>(service, 'printMovedSelection').and.stub();
        drawingServiceSpy.clearCanvas.and.stub();
        selectionUtilsServiceSpy.resetParametersTools.and.stub();
        lassoServiceSpy.resetAttributes.and.stub();

        service.terminateSelection();
        expect(printMovedSelectionSpy).toHaveBeenCalled();
        expect(drawingServiceSpy.clearCanvas).toHaveBeenCalled();
        expect(selectionUtilsServiceSpy.resetParametersTools).toHaveBeenCalled();
        expect(lassoServiceSpy.selectionOver).toBeFalse();
        expect(service.activeSelection).toBeFalse();
        expect(service.newSelection).toBeTrue();
        expect(service.imageMoved).toBeFalse();
        expect(service.selectionTerminated).toBeTrue();
        expect(service.mouseDown).toBeFalse();
    });

    it('should terminate selection correctly if activeSelection is true and selectionDeleted is false', () => {
        service.activeSelection = true;
        service.selectionDeleted = true;
        const printMovedSelectionSpy = spyOn<any>(service, 'printMovedSelection').and.stub();
        drawingServiceSpy.clearCanvas.and.stub();
        selectionUtilsServiceSpy.resetParametersTools.and.stub();
        lassoServiceSpy.resetAttributes.and.stub();

        service.terminateSelection();
        expect(printMovedSelectionSpy).not.toHaveBeenCalled();
        expect(drawingServiceSpy.clearCanvas).toHaveBeenCalled();
        expect(selectionUtilsServiceSpy.resetParametersTools).toHaveBeenCalled();
        expect(lassoServiceSpy.selectionOver).toBeFalse();
        expect(service.activeSelection).toBeFalse();
        expect(service.newSelection).toBeTrue();
        expect(service.imageMoved).toBeFalse();
        expect(service.selectionTerminated).toBeTrue();
        expect(service.mouseDown).toBeFalse();
    });

    it('should not terminate selection if activeSelection is false and selectionDeleted is false', () => {
        service.activeSelection = false;
        const printMovedSelectionSpy = spyOn<any>(service, 'printMovedSelection').and.stub();

        service.terminateSelection();
        expect(printMovedSelectionSpy).not.toHaveBeenCalled();
        expect(drawingServiceSpy.clearCanvas).not.toHaveBeenCalled();
        expect(selectionUtilsServiceSpy.resetParametersTools).not.toHaveBeenCalled();
    });

    it('should put image data on baseCtx of selection if Rectangle selection is selected', () => {
        service.imageMoved = true;
        service.origin = { x: 100, y: 100 };
        const origin = { x: 100, y: 100 };
        const destination = { x: 200, y: 200 };
        service.selectionObject = new SelectionTool(origin, destination, 100, 100);
        const putImageDataSpy = spyOn<any>(service['drawingService'].baseCtx, 'putImageData').and.stub();
        const addToUndoStackSpy = spyOn<any>(service, 'addToUndoStack').and.stub();

        service.printMovedSelection();
        expect(service.imageMoved).toBeFalse();
        expect(service.selectionObject.origin).toEqual(service.origin);
        expect(putImageDataSpy).toHaveBeenCalled();
        expect(addToUndoStackSpy).toHaveBeenCalled();
    });

    it('should print ellipse if Ellipse selection is selected', () => {
        service.imageMoved = true;
        service.origin = { x: 100, y: 100 };
        const origin = { x: 100, y: 100 };
        const destination = { x: 200, y: 200 };
        service.selectionObject = new SelectionTool(origin, destination, 100, 100);
        service.isEllipse = true;
        service.isLasso = false;
        ellipseSelectionServiceSpy.printEllipse.and.stub();
        const addToUndoStackSpy = spyOn<any>(service, 'addToUndoStack').and.stub();

        service.printMovedSelection();
        expect(service.imageMoved).toBeFalse();
        expect(service.selectionObject.origin).toEqual(service.origin);
        expect(ellipseSelectionServiceSpy.printEllipse).toHaveBeenCalled();
        expect(addToUndoStackSpy).toHaveBeenCalled();
    });

    it('should print polygon if Lasso selection is selected', () => {
        service.imageMoved = true;
        service.origin = { x: 100, y: 100 };
        const origin = { x: 100, y: 100 };
        const destination = { x: 200, y: 200 };
        service.selectionObject = new SelectionTool(origin, destination, 100, 100);
        service.isEllipse = false;
        service.isLasso = true;
        lassoServiceSpy.printPolygon.and.stub();
        const addToUndoStackSpy = spyOn<any>(service, 'addToUndoStack').and.stub();

        service.printMovedSelection();
        expect(service.imageMoved).toBeFalse();
        expect(service.selectionObject.origin).toEqual(service.origin);
        expect(lassoServiceSpy.printPolygon).toHaveBeenCalled();
        expect(addToUndoStackSpy).toHaveBeenCalled();
    });

    it('should not print moved selection if image was not moved', () => {
        const addToUndoStackSpy = spyOn<any>(service, 'addToUndoStack').and.stub();
        ellipseSelectionServiceSpy.printEllipse.and.stub();
        lassoServiceSpy.printPolygon.and.stub();
        const putImageDataSpy = spyOn<any>(service['drawingService'].baseCtx, 'putImageData').and.stub();

        service.printMovedSelection();
        expect(ellipseSelectionServiceSpy.printEllipse).not.toHaveBeenCalled();
        expect(lassoServiceSpy.printPolygon).not.toHaveBeenCalled();
        expect(putImageDataSpy).not.toHaveBeenCalled();
        expect(addToUndoStackSpy).not.toHaveBeenCalled();
    });

    it('should get selection data correctly if Rectangle selection is selected', () => {
        service.origin = { x: 10, y: 10 };
        service.destination = { x: 30, y: 30 };
        service.width = 20;
        service.height = 20;
        service.selectionObject = new SelectionTool(service.origin, service.destination, service.width, service.height);
        const getImageDataSpy = spyOn<any>(service['drawingService'].baseCtx, 'getImageData').and.returnValue(new ImageData(10, 10));
        const initialSelectionObjectSpy = spyOn<any>(service, 'initialseSelectionObject').and.stub();
        service.isEllipse = false;
        service.isLasso = false;

        service.getSelectionData(service['drawingService'].baseCtx);
        expect(getImageDataSpy).toHaveBeenCalled();
        expect(initialSelectionObjectSpy).toHaveBeenCalled();
        expect(service.selectionObject.image).toEqual(service.selection);
    });

    it('should get selection data correctly if Ellipse selection is selected', () => {
        service.origin = { x: 10, y: 10 };
        service.destination = { x: 30, y: 30 };
        service.width = 20;
        service.height = 20;
        service.selectionObject = new SelectionTool(service.origin, service.destination, service.width, service.height);
        const getImageDataSpy = spyOn<any>(service['drawingService'].baseCtx, 'getImageData').and.returnValue(new ImageData(10, 10));
        const initialSelectionObjectSpy = spyOn<any>(service, 'initialseSelectionObject').and.stub();
        service.isEllipse = true;
        ellipseSelectionServiceSpy.checkPixelInEllipse.and.stub();
        service.isLasso = false;

        service.getSelectionData(service['drawingService'].baseCtx);
        expect(getImageDataSpy).toHaveBeenCalled();
        expect(initialSelectionObjectSpy).toHaveBeenCalled();
        expect(ellipseSelectionServiceSpy.checkPixelInEllipse).toHaveBeenCalled();
        expect(service.selectionObject.image).toEqual(service.selection);
    });

    it('should get selection data correctly if Lasso selection is selected', () => {
        service.origin = { x: 10, y: 10 };
        service.destination = { x: 30, y: 30 };
        service.width = 20;
        service.height = 20;
        service.selectionObject = new SelectionTool(service.origin, service.destination, service.width, service.height);
        const getImageDataSpy = spyOn<any>(service['drawingService'].baseCtx, 'getImageData').and.returnValue(new ImageData(10, 10));
        const initialSelectionObjectSpy = spyOn<any>(service, 'initialseSelectionObject').and.stub();
        service.isEllipse = false;
        lassoServiceSpy.checkPixelInPolygon.and.stub();
        service.isLasso = true;

        service.getSelectionData(service['drawingService'].baseCtx);
        expect(getImageDataSpy).toHaveBeenCalled();
        expect(initialSelectionObjectSpy).toHaveBeenCalled();
        expect(lassoServiceSpy.checkPixelInPolygon).toHaveBeenCalled();
        expect(service.selectionObject.image).toEqual(service.selection);
    });

    it('should initialize service dimensions correctly', () => {
        const origin = { x: 0, y: 0 };
        const destination = { x: 100, y: 100 };
        service.selectionObject = new SelectionTool(origin, destination, destination.x - origin.x, destination.y - origin.y);

        service.initialiseServiceDimensions();
        expect(service.origin).toEqual(service.selectionObject.origin);
        expect(service.destination).toEqual(service.selectionObject.destination);
        expect(service.width).toEqual(service.selectionObject.width);
        expect(service.height).toEqual(service.selectionObject.height);
    });

    it('should verify if mouse is on a control point', () => {
        service.mouseDown = true;
        service.activeSelection = true;
        service.isEllipse = true;
        selectionUtilsServiceSpy.controlPointsCoord = [{ x: 10, y: 10 }];
        resizeSelectionServiceSpy.checkIfMouseIsOnControlPoint.and.returnValue(false);

        service['handleActiveSelectionOnMouseDown'](mouseEventLClick);
        expect(service.clearUnderneath).toBeTrue();
    });

    it('should not verify if mouse is on a control point if activeSelection is false', () => {
        service.mouseDown = true;
        service.isEllipse = true;
        service.activeSelection = false;
        resizeSelectionServiceSpy.checkIfMouseIsOnControlPoint.and.stub();
        service.clearUnderneath = false;
        service['handleActiveSelectionOnMouseDown'](mouseEventLClick);
        expect(resizeSelectionServiceSpy.checkIfMouseIsOnControlPoint).not.toHaveBeenCalled();
    });

    it('should not verify if mouse is on a control point if mouseDown is false', () => {
        service.mouseDown = false;

        resizeSelectionServiceSpy.checkIfMouseIsOnControlPoint.and.stub();

        service['handleActiveSelectionOnMouseDown'](mouseEventLClick);
        expect(resizeSelectionServiceSpy.checkIfMouseIsOnControlPoint).not.toHaveBeenCalled();
    });

    it('should not verify if mouse is on a control point if mouseDown is false', () => {
        service.mouseDown = true;
        service.isEllipse = false;
        selectionUtilsServiceSpy.isResizing = false;
        service.activeSelection = false;
        resizeSelectionServiceSpy.checkIfMouseIsOnControlPoint.and.stub();

        service['handleActiveSelectionOnMouseDown'](mouseEventLClick);
        expect(resizeSelectionServiceSpy.checkIfMouseIsOnControlPoint).not.toHaveBeenCalled();
        expect(ellipseServiceSpy.onMouseDown).not.toHaveBeenCalled();
    });

    it('should print moved selection if isLasso is false, isEllipse is false and isResizing is false', () => {
        service.mouseDown = true;
        service.isLasso = false;
        selectionUtilsServiceSpy.isResizing = false;
        service.isEllipse = false;
        selectionUtilsServiceSpy.initializeToolParameters();
        service.activeSelection = true;
        service['handleResizedSelectionOnMouseDown'](mouseEventLClick);
        expect(ellipseServiceSpy.onMouseDown).not.toHaveBeenCalled();
    });

    it('should  not check Control Point if activeSelection is false', () => {
        service.mouseDown = true;
        service.activeSelection = false;
        service['handleResizedSelectionOnMouseDown'](mouseEventLClick);
        expect(resizeSelectionServiceSpy.checkIfMouseIsOnControlPoint).not.toHaveBeenCalled();
    });

    it('should not print moved selection if isLasso is true and isResizing is true', () => {
        service.mouseDown = false;
        service.isLasso = true;
        selectionUtilsServiceSpy.isResizing = true;
        service.isEllipse = false;
        const printMovedSelectionSpy = spyOn<any>(service, 'printMovedSelection').and.stub();

        service['handleResizedSelectionOnMouseDown'](mouseEventLClick);
        expect(printMovedSelectionSpy).not.toHaveBeenCalled();
        expect(ellipseServiceSpy.onMouseDown).not.toHaveBeenCalled();
    });

    it('should terminate selection if isLasso is true, newSelection is true and activeSelection is true', () => {
        service.isLasso = true;
        service.newSelection = true;
        service.activeSelection = true;
        const terminateSelectionSpy = spyOn<any>(service, 'terminateSelection').and.stub();

        service['handleActiveLassoSelectionOnMouseDown'](mouseEventLClick);
        expect(lassoServiceSpy.selectionOver).toBeFalse();
        expect(terminateSelectionSpy).toHaveBeenCalled();
    });

    it('should not terminate selection if isLasso is false, newSelection is false or activeSelection is false', () => {
        service.isLasso = false;
        service.newSelection = true;
        service.activeSelection = true;
        const terminateSelectionSpy = spyOn<any>(service, 'terminateSelection').and.stub();

        service['handleActiveLassoSelectionOnMouseDown'](mouseEventLClick);
        expect(terminateSelectionSpy).not.toHaveBeenCalled();
    });

    it('should change newSelection to false if selectionTerminated is false and mouse is in selection area', () => {
        service.activeSelection = true;
        service.selectionTerminated = false;
        selectionUtilsServiceSpy.mouseInSelectionArea.and.returnValue(true);

        service['handleActiveSelectionOnMouseMove'](mouseEventLClick);
        expect(service.newSelection).toBeFalse();
    });

    it('should change newSelection to true if selectionTerminated is false and mouse is in selection area', () => {
        service.activeSelection = true;
        service.selectionTerminated = false;
        selectionUtilsServiceSpy.mouseInSelectionArea.and.returnValue(false);

        service['handleActiveSelectionOnMouseMove'](mouseEventLClick);
        expect(service.newSelection).toBeTrue();
    });

    it('should not change newSelection to true if selectionTerminated is true', () => {
        service.activeSelection = false;
        service.selectionTerminated = true;
        selectionUtilsServiceSpy.mouseInSelectionArea.and.stub();

        service['handleActiveSelectionOnMouseMove'](mouseEventLClick);
        expect(selectionUtilsServiceSpy.mouseInSelectionArea).not.toHaveBeenCalled();
    });

    it('should create boundary box if selectionOver is true', () => {
        lassoServiceSpy.selectionOver = true;
        service.isLasso = true;
        service.origin = { x: 10, y: 10 };
        service.selectionObject = new SelectionTool({ x: 0, y: 0 }, { x: 100, y: 100 }, 100, 100);
        const calculateDimensionSpy = spyOn<any>(service, 'calculateDimension').and.stub();
        const getSelectionDataSpy = spyOn<any>(service, 'getSelectionData').and.stub();
        service.selectionObject = new SelectionTool({ x: 0, y: 0 }, { x: 0, y: 0 }, 0, 0);
        service['handleLassoSelectionWhenOverOnMouseUp'](mouseEventLClick);
        expect(service.activeSelection).toBeTrue();
        expect(service.initialSelection).toBeTrue();
        expect(service.clearUnderneath).toBeTrue();
        expect(service.selectionObject).toEqual(new SelectionTool({ x: 0, y: 0 }, { x: 0, y: 0 }, 0, 0));
        expect(calculateDimensionSpy).toHaveBeenCalled();
        expect(getSelectionDataSpy).toHaveBeenCalled();
        expect(selectionUtilsServiceSpy.createBoundaryBox).toHaveBeenCalled();
    });

    it('should not create boundary box if selectionOver is false', () => {
        lassoServiceSpy.selectionOver = false;
        service.isLasso = false;
        service.activeSelection = false;
        service['handleLassoSelectionWhenOverOnMouseUp'](mouseEventLClick);
        expect(service.activeSelection).toBeFalse();
        expect(selectionUtilsServiceSpy.createBoundaryBox).not.toHaveBeenCalled();
    });

    it('should get selection data if isResizing is true', () => {
        selectionUtilsServiceSpy.isResizing = true;
        selectionUtilsServiceSpy.endResizeSelection.and.returnValue(new SelectionTool({ x: 0, y: 0 }, { x: 100, y: 100 }, 100, 100));
        const initialiseServiceDimensionsSpy = spyOn<any>(service, 'initialiseServiceDimensions').and.stub();
        const getSelectionDataSpy = spyOn<any>(service, 'getSelectionData').and.stub();

        service['handleResizedSelectionOnMouseUp']();
        expect(service.selectionObject).toEqual(new SelectionTool({ x: 0, y: 0 }, { x: 100, y: 100 }, 100, 100));
        expect(initialiseServiceDimensionsSpy).toHaveBeenCalled();
        expect(getSelectionDataSpy).toHaveBeenCalled();
    });

    it('should not get selection data if isResizing is false', () => {
        selectionUtilsServiceSpy.isResizing = false;
        const initialiseServiceDimensionsSpy = spyOn<any>(service, 'initialiseServiceDimensions').and.stub();
        const getSelectionDataSpy = spyOn<any>(service, 'getSelectionData').and.stub();

        service['handleResizedSelectionOnMouseUp']();
        expect(initialiseServiceDimensionsSpy).not.toHaveBeenCalled();
        expect(getSelectionDataSpy).not.toHaveBeenCalled();
    });

    it('should create control point on mouse up if isLasso is false', () => {
        service.mouseDown = true;
        service.isLasso = false;
        const calculateDimensionSpy = spyOn<any>(service, 'calculateDimension').and.stub();
        const getSelectionDataSpy = spyOn<any>(service, 'getSelectionData').and.stub();
        selectionUtilsServiceSpy.createControlPoints.and.stub();
        selectionUtilsServiceSpy.resetParametersTools.and.stub();

        service.selectionObject = new SelectionTool({ x: 0, y: 0 }, { x: 100, y: 100 }, 100, 100);

        service['handleActiveSelectionOnMouseUp']();
        expect(service.activeSelection).toBeTrue();
        expect(service.mouseDown).toBeFalse();
        expect(calculateDimensionSpy).toHaveBeenCalled();
        expect(getSelectionDataSpy).toHaveBeenCalled();
        expect(selectionUtilsServiceSpy.createControlPoints).toHaveBeenCalled();
        expect(selectionUtilsServiceSpy.resetParametersTools).toHaveBeenCalled();
    });

    it('should not create control point if isLasso if true', () => {
        service.mouseDown = false;
        service.isLasso = true;
        const calculateDimensionSpy = spyOn<any>(service, 'calculateDimension').and.stub();
        const getSelectionDataSpy = spyOn<any>(service, 'getSelectionData').and.stub();

        service['handleActiveSelectionOnMouseUp']();
        expect(calculateDimensionSpy).not.toHaveBeenCalled();
        expect(getSelectionDataSpy).not.toHaveBeenCalled();
        expect(selectionUtilsServiceSpy.createControlPoints).not.toHaveBeenCalled();
        expect(selectionUtilsServiceSpy.resetParametersTools).not.toHaveBeenCalled();
    });

    it('should reajust origin and destination if selection is rectangle', () => {
        service.isEllipse = false;
        service.isLasso = false;
        rectangleServiceSpy.pathData = [
            { x: 0, y: 0 },
            { x: 10, y: 0 },
            { x: 0, y: 10 },
            { x: 10, y: 10 },
        ];
        const initialseSelectionObjectSpy = spyOn<any>(service, 'initialseSelectionObject').and.stub();
        const initialiseServiceDimensionsSpy = spyOn<any>(service, 'initialiseServiceDimensions').and.stub();

        service['calculateDimension']();
        expect(initialseSelectionObjectSpy).toHaveBeenCalled();
        expect(selectionUtilsServiceSpy.reajustOriginAndDestination).toHaveBeenCalled();
        expect(initialiseServiceDimensionsSpy).toHaveBeenCalled();
    });

    it('should reajust origin and destination if selection is ellipse', () => {
        service.isEllipse = true;
        service.isLasso = false;
        ellipseServiceSpy.pathData = [
            { x: 0, y: 0 },
            { x: 10, y: 0 },
            { x: 0, y: 10 },
            { x: 10, y: 10 },
        ];
        const initialseSelectionObjectSpy = spyOn<any>(service, 'initialseSelectionObject').and.stub();
        const initialiseServiceDimensionsSpy = spyOn<any>(service, 'initialiseServiceDimensions').and.stub();

        service['calculateDimension']();
        expect(initialseSelectionObjectSpy).toHaveBeenCalled();
        expect(selectionUtilsServiceSpy.reajustOriginAndDestination).toHaveBeenCalled();
        expect(initialiseServiceDimensionsSpy).toHaveBeenCalled();
    });

    it('should reajust origin and destination if selection is lasso', () => {
        service.isEllipse = false;
        service.isLasso = true;
        spyOn<any>(Utils, 'findMinCoord').and.returnValue({ x: 10, y: 10 });
        spyOn<any>(Utils, 'findMaxCoord').and.returnValue({ x: 20, y: 200 });
        const initialseSelectionObjectSpy = spyOn<any>(service, 'initialseSelectionObject').and.stub();
        const initialiseServiceDimensionsSpy = spyOn<any>(service, 'initialiseServiceDimensions').and.stub();

        service['calculateDimension']();
        expect(initialseSelectionObjectSpy).toHaveBeenCalled();
        expect(selectionUtilsServiceSpy.reajustOriginAndDestination).toHaveBeenCalled();
        expect(initialiseServiceDimensionsSpy).toHaveBeenCalled();
    });

    it('should initialize selection object parameter correctly if selection is lasso', () => {
        service.selectionObject = new SelectionTool({ x: 0, y: 0 }, { x: 10, y: 10 }, 10, 10);
        service.origin = { x: 0, y: 0 };
        service.destination = { x: 110, y: 110 };
        service.width = 110;
        service.height = 110;
        service.selection = new ImageData(100, 100);
        service.isLasso = true;
        service.isEllipse = false;
        spyOn<any>(service['drawingService'].baseCtx, 'getImageData').and.returnValue(new ImageData(10, 10));

        service['initialseSelectionObject']();
        expect(service.selectionObject.origin).toEqual(service.origin);
        expect(service.selectionObject.destination).toEqual(service.destination);
        expect(service.selectionObject.width).toEqual(service.width);
        expect(service.selectionObject.height).toEqual(service.height);
        expect(service.selectionObject.image).toEqual(service.selection);
        expect(service.selectionObject.isEllipse).toEqual(service.isEllipse);
        expect(service.selectionObject.isLasso).toEqual(service.isLasso);
        expect(service.selectionObject.polygonCoords).toEqual(lassoServiceSpy.polygonCoords);
        expect(service.selectionObject.clearImageDataPolygon).toEqual(new ImageData(10, 10));
    });

    it('should initialize selection object parameter correctly if selection is not lasso', () => {
        service.selectionObject = new SelectionTool({ x: 0, y: 0 }, { x: 10, y: 10 }, 10, 10);
        service.origin = { x: 0, y: 0 };
        service.destination = { x: 110, y: 110 };
        service.width = 110;
        service.height = 110;
        service.selection = new ImageData(100, 100);
        service.isLasso = false;
        service.isEllipse = false;
        spyOn<any>(service['drawingService'].baseCtx, 'getImageData').and.returnValue(new ImageData(10, 10));

        service['initialseSelectionObject']();
        expect(service.selectionObject.origin).toEqual(service.origin);
        expect(service.selectionObject.destination).toEqual(service.destination);
        expect(service.selectionObject.width).toEqual(service.width);
        expect(service.selectionObject.height).toEqual(service.height);
        expect(service.selectionObject.image).toEqual(service.selection);
        expect(service.selectionObject.isEllipse).toEqual(service.isEllipse);
        expect(service.selectionObject.isLasso).toEqual(service.isLasso);
    });

    it('should add to undo stack', () => {
        const origin = { x: 0, y: 0 };
        const destination = { x: 100, y: 100 };
        service.selectionObject = new SelectionTool(origin, destination, destination.x - origin.x, destination.y - origin.y);
        const initialseSelectionObjectSpy = spyOn<any>(service, 'initialseSelectionObject').and.stub();
        undoRedoServiceSpy.addToStack.and.stub();
        undoRedoServiceSpy.setToolInUse.and.stub();

        service['addToUndoStack']();
        expect(initialseSelectionObjectSpy).toHaveBeenCalled();
        expect(undoRedoServiceSpy.addToStack).toHaveBeenCalledWith(service.selectionObject);
        expect(undoRedoServiceSpy.setToolInUse).toHaveBeenCalledWith(false);
    });
});
