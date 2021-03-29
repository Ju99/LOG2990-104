import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { DOUBLE_MATH, MouseButton } from '@app/constants';
import { ColorOrder } from '@app/interfaces-enums/color-order';
import { TypeStyle } from '@app/interfaces-enums/type-style';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { PolygonService } from './polygon.service';

//tslint:disable
describe('PolygonService', () => {
    let polygonService: PolygonService;
    let canvasTestHelper: CanvasTestHelper;
    let mouseEvent: MouseEvent;

    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let ctxPreviewPerimeterSpy: jasmine.Spy<any>;
    let drawPolygonSpy: jasmine.Spy<any>;
    let changeSelectedTypeSpy: jasmine.Spy<any>;
    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;

    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'pathData']);

        TestBed.configureTestingModule({ providers: [{ provide: DrawingService, useValue: drawServiceSpy }] });

        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;

        polygonService = TestBed.inject(PolygonService);
        changeSelectedTypeSpy = spyOn<any>(polygonService, 'changeSelectedType').and.callThrough();
        ctxPreviewPerimeterSpy = spyOn<any>(polygonService, 'ctxPreviewPerimeter').and.callThrough();
        drawPolygonSpy = spyOn<any>(polygonService, 'drawPolygon').and.callThrough();

        polygonService['drawingService'].baseCtx = baseCtxStub;
        polygonService['drawingService'].previewCtx = previewCtxStub;
        polygonService['drawingService'].canvas = canvasTestHelper.canvas;

        polygonService['firstPoint'] = { x: 25, y: 25 };
        polygonService['finalPoint'] = { x: 0, y: 0 };
        polygonService['pointCircleCenter'] = { x: 25, y: 25 };
        polygonService['lineWidth'] = 2;
        polygonService['selectType'] = TypeStyle.Stroke;
        polygonService['colorManager'].selectedColor[ColorOrder.PrimaryColor].inString = '#FFFFFF';
        polygonService['colorManager'].selectedColor[ColorOrder.SecondaryColor].inString = '#23AABB';
        polygonService['mouseDown'] = true;
        polygonService['radius'] = 2;
        polygonService['pointCircleCenter'] = { x: 25, y: 25 };
        mouseEvent = {
            offsetX: 25,
            offsetY: 25,
            button: MouseButton.Left,
        } as MouseEvent;
    });

    it('should be created', () => {
        expect(polygonService).toBeTruthy();
    });

    it('onMouseUp should call clearCanvas if mouse was down', () => {
        polygonService.onMouseUp(mouseEvent);

        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
        expect(polygonService['mouseDown']).toEqual(false);
    });

    it('onMouseUp should  not call clearCanvas if mouse was not down', () => {
        polygonService['mouseDown'] = false;

        polygonService.onMouseUp(mouseEvent);

        expect(drawServiceSpy.clearCanvas).not.toHaveBeenCalled();
    });

    it('onMouseUp should call drawPolygon if mouse was down', () => {
        polygonService.onMouseUp(mouseEvent);
        expect(drawPolygonSpy).toHaveBeenCalled();
    });

    it('onMouseUp should not call drawPolygon if mouse was not down', () => {
        polygonService.mouseDown = false;
        polygonService.onMouseUp(mouseEvent);
        expect(drawPolygonSpy).toHaveBeenCalledTimes(0);
    });

    it('onMouseMove should call drawPolygon and ctxPreviewPerimeter', () => {
        polygonService.mouseDown = true;
        polygonService.onMouseMove(mouseEvent);

        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
        expect(drawPolygonSpy).toHaveBeenCalled();
        expect(ctxPreviewPerimeterSpy).toHaveBeenCalled();
    });

    it('onMouseMove should not call drawPolygon if mouseDown is false', () => {
        polygonService['mouseDown'] = false;

        polygonService.onMouseMove(mouseEvent);

        expect(drawPolygonSpy).not.toHaveBeenCalled();
    });

    it('onMouseMove with perimeter drawing style should call drawPolygon and ctxPreviewPerimeter', () => {
        polygonService['selectType'] = TypeStyle.Stroke;

        polygonService.onMouseMove(mouseEvent);

        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
        expect(drawPolygonSpy).toHaveBeenCalled();
        expect(ctxPreviewPerimeterSpy).toHaveBeenCalled();
    });

    it('onMouseMove with plain drawing style should call drawPolygon and ctxPreviewPerimeter', () => {
        polygonService['selectType'] = TypeStyle.Fill;

        polygonService.onMouseMove(mouseEvent);

        expect(polygonService['pointCircleCenter']).toEqual({ x: 25, y: 25 });
    });

    it('onMouseMove with plain drawing style should call drawPolygon and ctxPreviewPerimeter', () => {
        polygonService['selectType'] = TypeStyle.StrokeFill;

        polygonService.onMouseMove(mouseEvent);

        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
        expect(drawPolygonSpy).toHaveBeenCalled();
        expect(ctxPreviewPerimeterSpy).toHaveBeenCalled();
    });

    it('drawPolygon should initialize Polygon Variables', () => {
        let initializePolygonVariablesSpy = spyOn<any>(polygonService, 'initializePolygonVariables');

        polygonService['drawPolygon'](baseCtxStub);
        expect(initializePolygonVariablesSpy).not.toBeUndefined();
    });

    it('drawPolygon should update canvas path line while respecting sides number', () => {
        let lineSpy = spyOn<any>(polygonService['drawingService'].baseCtx, 'lineTo').and.callThrough();
        polygonService.sides = 4;
        polygonService['drawPolygon'](baseCtxStub);
        expect(lineSpy).toHaveBeenCalled();
    });
    it('drawPolygon should call changeSelectedType', () => {
        polygonService['drawPolygon'](baseCtxStub);
        expect(changeSelectedTypeSpy).toHaveBeenCalled();
    });

    it('drawPolygon should update strokeStyle with secondary and fillStyle with primary', () => {
        polygonService['firstPoint'] = { x: 25, y: 25 };
        polygonService['finalPoint'] = { x: 0, y: 0 };
        polygonService['pointCircleCenter'] = { x: 25, y: 25 };
        polygonService['lineWidth'] = 2;

        polygonService['colorManager'].selectedColor[ColorOrder.PrimaryColor].inString = '#000000';
        polygonService['colorManager'].selectedColor[ColorOrder.SecondaryColor].inString = '#000000';
        polygonService.drawPolygon(baseCtxStub);

        expect(baseCtxStub.strokeStyle).toEqual('#000000');
        expect(baseCtxStub.fillStyle).toEqual('#000000');
        expect(baseCtxStub.lineWidth).toEqual(2);
    });

    it('drawPolygon should call initializePolygoneVariables and changeSelectedType', () => {
        polygonService.drawPolygon(previewCtxStub);
        polygonService.drawPolygon(previewCtxStub);
        expect(changeSelectedTypeSpy).toHaveBeenCalled();
    });

    it('getCircleCenter should be called while initializing polygon Variables', () => {
        const getCircleCenterSpy = spyOn<any>(polygonService, 'getCircleCenter');
        polygonService['initializePolygonVariables']();
        expect(getCircleCenterSpy).toHaveBeenCalled();
    });

    it('Radius value of polygone service should be correctly updated', () => {
        const firstPoint = { x: 25, y: 25 };
        const finalPoint = { x: 10, y: 10 };
        const result = Math.abs(finalPoint.x - firstPoint.y) / DOUBLE_MATH;
        polygonService['firstPoint'] = firstPoint;
        polygonService['finalPoint'] = finalPoint;
        polygonService['initializePolygonVariables']();
        expect(polygonService.radius).toEqual(result);
    });

    it('drawPolygon should call changeSelectedType stroke and fill', () => {
        polygonService['colorManager'].selectedColor[ColorOrder.PrimaryColor].inString = '#FFFFFF';
        polygonService['colorManager'].selectedColor[ColorOrder.SecondaryColor].inString = '#23AABB';
        polygonService.fillValue = true;
        polygonService.strokeValue = true;
        polygonService.drawPolygon(baseCtxStub);
        expect(changeSelectedTypeSpy).toHaveBeenCalled();
        expect(baseCtxStub.strokeStyle).toEqual('#23aabb');
        expect(baseCtxStub.fillStyle).toEqual('#ffffff');
    });

    it('drawPolygon should call changeSelectedType fill', () => {
        polygonService['colorManager'].selectedColor[ColorOrder.PrimaryColor].inString = '#FFFFFF';
        polygonService['colorManager'].selectedColor[ColorOrder.SecondaryColor].inString = '#23AABB';
        polygonService.fillValue = true;
        polygonService.strokeValue = false;
        polygonService.drawPolygon(baseCtxStub);
        expect(baseCtxStub.fillStyle).toEqual('#ffffff');
        expect(baseCtxStub.strokeStyle).toEqual('#23aabb');
    });
    it('drawPolygon should call changeSelectedType stroke', () => {
        polygonService['colorManager'].selectedColor[ColorOrder.PrimaryColor].inString = '#FFFFFF';
        polygonService['colorManager'].selectedColor[ColorOrder.SecondaryColor].inString = '#23AABB';
        polygonService.fillValue = false;
        polygonService.strokeValue = true;
        polygonService.drawPolygon(baseCtxStub);
        expect(baseCtxStub.fillStyle).toEqual('#ffffff');
        expect(baseCtxStub.strokeStyle).toEqual('#23aabb');
    });

    it('drawPolygon should call changeSelectedType stroke', () => {
        polygonService['selectType'] = 'fill';
        polygonService.changeSelectedType();
        expect(polygonService.fillValue).toBeTrue();
        expect(polygonService.strokeValue).toBeFalsy();
    });
});
