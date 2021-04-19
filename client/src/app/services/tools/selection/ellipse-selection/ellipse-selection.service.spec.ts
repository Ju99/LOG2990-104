import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { SelectionTool } from '@app/classes/selection';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { EllipseSelectionService } from './ellipse-selection.service';

// tslint:disable
describe('EllipseSelectionService', () => {
    let service: EllipseSelectionService;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let canvasTestHelper: CanvasTestHelper;
    let baseCtxSpy: CanvasRenderingContext2D;
    let previewCtxSpy: CanvasRenderingContext2D;

    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['']);
        previewCtxSpy = jasmine.createSpyObj('CanvasRenderingContext', ['beginPath', 'stroke', 'moveTo', 'lineTo', 'setLineDash']);
        baseCtxSpy = jasmine.createSpyObj('CanvasRenderingContext', ['ellipse', 'save', 'clip', 'drawImage', 'restore']);

        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawServiceSpy }],
        });
        canvasTestHelper = TestBed.inject(CanvasTestHelper);

        service = TestBed.inject(EllipseSelectionService);
        service['drawingService'].baseCtx = baseCtxSpy;
        service['drawingService'].previewCtx = previewCtxSpy;
        service['drawingService'].canvas = canvasTestHelper.canvas;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should check if pixel is in ellipse', () => {
        const selection = new SelectionTool({ x: 0, y: 0 } as Vec2, { x: 100, y: 50 } as Vec2, 100, 50);
        selection.image = new ImageData(100, 50);
        let result = service.checkPixelInEllipse(selection);
        expect(result).toEqual(selection.image);
    });

    it('should check if pixel is in circle', () => {
        service['ellipseService'].isShiftShape = true;
        const selection = new SelectionTool({ x: 0, y: 0 } as Vec2, { x: 50, y: 50 } as Vec2, 50, 50);
        selection.image = new ImageData(100, 50);
        let result = service.checkPixelInEllipse(selection);
        expect(result).toEqual(selection.image);
    });

    it('should print ellipse', () => {
        const selection = new SelectionTool({ x: 0, y: 0 } as Vec2, { x: 20, y: 20 } as Vec2, 20, 20);
        selection.image = new ImageData(20, 20);
        service.printEllipse(selection);
        expect(baseCtxSpy.save).toHaveBeenCalled();
        expect(baseCtxSpy.clip).toHaveBeenCalled();
        expect(baseCtxSpy.drawImage).toHaveBeenCalled();
        expect(baseCtxSpy.restore).toHaveBeenCalled();
    });
});
