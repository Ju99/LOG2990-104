import { TestBed } from '@angular/core/testing';
import { MouseButton, mouseEventLClick, mouseEventRClick } from '@app/constants';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { PipetteService } from './pipette.service';
// tslint:disable

describe('PipetteService', () => {
    let service: PipetteService;
    let canvas: HTMLCanvasElement;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let pixelOnZoomSpy: jasmine.Spy<any>;
    let zoomCtxStub: CanvasRenderingContext2D;
    let zoomCanvasStub: HTMLCanvasElement;
    let mouseEventLeft: MouseEvent;
    

    let baseCtxStub: CanvasRenderingContext2D;
    let previewCanvasStub: HTMLCanvasElement;
    
    const WIDTH_DRAWING_CANVAS = 100;
    const HEIGHT_DRAWING_CANVAS = 100;
    const WIDTH_ZOOM_CANVAS = 50;
    const HEIGHT_ZOOM_CANVAS = 50;

    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'setIsToolInUse']);

        canvas = document.createElement('canvas');
        canvas.width = WIDTH_DRAWING_CANVAS;
        canvas.height = HEIGHT_DRAWING_CANVAS;
     
        baseCtxStub = canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCanvasStub = canvas as HTMLCanvasElement;
     
        baseCtxStub.fillStyle = '#000000';
        baseCtxStub.fillRect(0, 0, canvas.width, canvas.height);
        baseCtxStub.fill();
        baseCtxStub.stroke();

        const zoomCanvas = document.createElement('canvas') as HTMLCanvasElement;
        zoomCanvas.width = WIDTH_ZOOM_CANVAS;
        zoomCanvas.height = HEIGHT_ZOOM_CANVAS;
        zoomCanvasStub = zoomCanvas;
        zoomCtxStub = zoomCanvasStub.getContext('2d') as CanvasRenderingContext2D;

        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawServiceSpy }],
        });
        service = TestBed.inject(PipetteService);

        service['drawingService'].canvas = canvas;
        service['drawingService'].baseCtx = baseCtxStub;
        service['drawingService'].previewCanvas = previewCanvasStub;
        
        service.zoom = zoomCanvasStub;
        service.zoomCtx = zoomCtxStub;
        pixelOnZoomSpy = spyOn<any>(service, 'pixelOnZoom').and.callThrough();

        mouseEventLeft = {
            offsetX: 25,
            offsetY: 25,
            button: MouseButton.Left,
        } as MouseEvent;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('onMouseDown should emit a PrimaryColor with left click', () => {
        const imageData = new ImageData(10, 10);
        const expectedColor = imageData.data;
        spyOn(service, 'getPositionFromMouse').and.returnValue({ x: mouseEventLClick.x, y: mouseEventLClick.y });
        const updatePixelColorSpy = spyOn(service.colorManagerService, 'updatePixelColor');
        const emitSpy = spyOn(service.primaryColor, 'emit');
        pixelOnZoomSpy.and.returnValue(expectedColor);

        service.onMouseDown(mouseEventLClick);

        expect(updatePixelColorSpy).toHaveBeenCalled();
        expect(emitSpy).toHaveBeenCalled();
    });

    it('onMouseDown should emit a secondaryColor with right click', () => {
        const imageData = new ImageData(10, 10);
        const expectedColor = imageData.data;
        spyOn(service, 'getPositionFromMouse').and.returnValue({ x: mouseEventRClick.x, y: mouseEventRClick.y });
        const updatePixelColorSpy = spyOn(service.colorManagerService, 'updatePixelColor');
        const emitSpy = spyOn(service.secondaryColor, 'emit');
        pixelOnZoomSpy.and.returnValue(expectedColor);

        service.onMouseDown(mouseEventRClick);

        expect(updatePixelColorSpy).toHaveBeenCalled();
        expect(emitSpy).toHaveBeenCalled();
    });

    it(' mouseMove should call handleNearBorder', () => {
        const drawOnZoomSpy = spyOn(service, 'drawOnZoom');
        const nearBorderSpy = spyOn(service, 'nearBorder');
        service.mouseDownCoord = { x: -1, y: -1 };

        service.onMouseMove(mouseEventLeft);
        expect(nearBorderSpy).toHaveBeenCalled();
        expect(service.isNearBorder).toEqual(false);
        expect(drawOnZoomSpy).toHaveBeenCalled();
    });

    it('Should return true when mouse near a border', () => {
        const mouseDownCoord = { x: 0, y: 0 };
        service.nearBorder(mouseDownCoord);
        expect(service.isNearBorder).toEqual(true);
    });

    it('Should return true when mouse outside border', () => {
        const mouseDownCoord = { x: 101, y: 101 };
        service.nearBorder(mouseDownCoord);
        expect(service.isNearBorder).toEqual(true);
    });

    it('Should return false when mouse inside the canvas', () => {
        const mouseDownCoord = { x: 25, y: 25 };
        service.nearBorder(mouseDownCoord);
        expect(service.isNearBorder).toEqual(false);
    });

    it('Should call drawOnZoom when not near a border', () => {
        const drawOnZoom = spyOn(service, 'drawOnZoom');
        service.isNearBorder = false;
        service.showZoom(mouseEventLeft);
        expect(drawOnZoom).toHaveBeenCalled();
    });

    it('Should not call drawOnZoom when near a border', () => {
        const drawOnZoom = spyOn(service, 'drawOnZoom');
        service.isNearBorder = true;
        service.showZoom(mouseEventLeft);
        expect(drawOnZoom).not.toHaveBeenCalled();
    });

    it('Should clear zoom when mouse near a border', () => {
        const clearCanvasSpy = spyOn(service, 'clearCanvas');
        const mouseDownCoord = { x: 0, y: 0 };
        service.nearBorder(mouseDownCoord);
        expect(clearCanvasSpy).toHaveBeenCalled();
    });

});
