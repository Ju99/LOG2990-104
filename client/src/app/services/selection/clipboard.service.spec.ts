import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { MoveSelectionService } from '@app/services/selection/move-selection.service';
import { LassoService } from '@app/services/tools/lasso/lasso.service';
import { RectangleService } from '@app/services/tools/rectangle/rectangle.service';
import { SelectionService } from '@app/services/tools/selection/selection.service';
import { ToolManagerService } from '@app/services/tools/tool-manager.service';
import { ClipboardService } from './clipboard.service';

// tslint:disable
describe('ClipboardService', () => {
    let service: ClipboardService;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let selectionServiceSpy: jasmine.SpyObj<SelectionService>;
    let moveSelectionServiceSpy: jasmine.SpyObj<MoveSelectionService>;
    let toolManagerServiceSpy: jasmine.SpyObj<ToolManagerService>;
    let rectangleServiceSpy: jasmine.SpyObj<RectangleService>;
    let lassoServiceSpy: jasmine.SpyObj<LassoService>;

    let canvasTestHelper: CanvasTestHelper;
    let baseCtxSpy: CanvasRenderingContext2D;
    let previewCtxSpy: CanvasRenderingContext2D;

    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);
        toolManagerServiceSpy = jasmine.createSpyObj('ToolManagerService', ['handleHotKeysShortcut']);
        selectionServiceSpy = jasmine.createSpyObj('SelectionService', [
            'printMovedSelection',
            'createBoundaryBox',
            'clearUnderneathShape',
            'terminateSelection',
        ]);
        rectangleServiceSpy = jasmine.createSpyObj('RectangleService', [
            'handleKeyDown',
            'onMouseMove',
            'onMouseDown',
            'onMouseUp',
            'onMouseClick',
            'onMouseDoubleClick',
            'handleKeyUp',
        ]);

        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawServiceSpy },
                { provide: SelectionService, useValue: selectionServiceSpy },
                { provide: MoveSelectionService, useValue: moveSelectionServiceSpy },
                { provide: ToolManagerService, useValue: toolManagerServiceSpy },
                { provide: RectangleService, useValue: rectangleServiceSpy },
                { provide: LassoService, useValue: lassoServiceSpy },
            ],
        });

        service = TestBed.inject(ClipboardService);
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
        service['drawingService'].baseCtx = baseCtxSpy;
        service['drawingService'].previewCtx = previewCtxSpy;
        service['drawingService'].canvas = canvasTestHelper.canvas;
        service['toolManagerService'].currentTool = selectionServiceSpy;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should copy selection', () => {
        selectionServiceSpy.selection = new ImageData(10, 10);
        selectionServiceSpy.width = 100;
        selectionServiceSpy.height = 100;
        selectionServiceSpy.isEllipse = false;
        selectionServiceSpy.isLasso = false;
        service.pasteAvailable = false;

        service.copy();

        expect(service.selectionData).toBe(selectionServiceSpy.selection);
        expect(service.width).toEqual(selectionServiceSpy.width);
        expect(service.height).toEqual(selectionServiceSpy.height);
        expect(service.isEllipse).toEqual(selectionServiceSpy.isEllipse);
        expect(service.isLasso).toEqual(selectionServiceSpy.isLasso);
        expect(service.pasteAvailable).toBeTrue();
        expect(service['toolManagerService'].currentTool).toEqual(selectionServiceSpy);
    });

    it('should paste selection', () => {
        selectionServiceSpy.printMovedSelection.and.stub();
        const initializeSelectionParametersSpy = spyOn<any>(service, 'initializeSelectionParameters').and.stub();
        selectionServiceSpy.createBoundaryBox.and.stub();

        service.paste();

        expect(selectionServiceSpy.printMovedSelection).toHaveBeenCalled();
        expect(initializeSelectionParametersSpy).toHaveBeenCalled();
        expect(selectionServiceSpy.createBoundaryBox).toHaveBeenCalled();
    });

    it('should cut selection', () => {
        const copySpy = spyOn<any>(service, 'copy').and.stub();
        const deleteSpy = spyOn<any>(service, 'delete').and.stub();

        service.cut();

        expect(copySpy).toHaveBeenCalled();
        expect(deleteSpy).toHaveBeenCalled();
    });

    it('should delete selection', () => {
        service['toolManagerService'].currentTool = rectangleServiceSpy;
        selectionServiceSpy.selectionDeleted = false;
        selectionServiceSpy.clearUnderneathShape.and.stub();
        selectionServiceSpy.terminateSelection.and.stub();

        service.delete();

        expect(selectionServiceSpy.selectionDeleted).toBeFalse();
        expect(selectionServiceSpy.clearUnderneathShape).toHaveBeenCalled();
        expect(selectionServiceSpy.terminateSelection).toHaveBeenCalled();
    });

    it('should return true if clipboard actions are available', () => {
        selectionServiceSpy.activeSelection = true;
        const result = service.actionsAreAvailable();
        expect(result).toBeTrue();
    });

    it('should return false if clipboard action are NOT available', () => {
        selectionServiceSpy.activeSelection = false;
        const result = service.actionsAreAvailable();
        expect(result).toBeFalse();
    });

    it('should initialize selection parameters correctly', () => {
        service.selectionData = new ImageData(10, 10);
        service.width = 100;
        service.height = 100;
        service.isLasso = true;
        service.isEllipse = true;

        service.initializeSelectionParameters();

        expect(selectionServiceSpy.selection).toBe(service.selectionData);
        expect(selectionServiceSpy.origin).toEqual({ x: 0, y: 0 });
        expect(selectionServiceSpy.destination).toEqual({ x: service.width, y: service.height });
        expect(selectionServiceSpy.width).toBe(service.width);
        expect(selectionServiceSpy.height).toBe(service.height);
        expect(selectionServiceSpy.isEllipse).toBe(service.isEllipse);
        expect(selectionServiceSpy.isLasso).toBe(service.isLasso);
        expect(selectionServiceSpy.activeSelection).toBeTrue();
        expect(selectionServiceSpy.initialSelection).toBeTrue();
        expect(selectionServiceSpy.imageMoved).toBeTrue();
        expect(selectionServiceSpy.clearUnderneath).toBeTrue();
        expect(selectionServiceSpy.selectionTerminated).toBeFalse();
    });
});
