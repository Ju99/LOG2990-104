import { TestBed } from '@angular/core/testing';
import { MouseButton, ONE_SECOND } from '@app/constants';
import { ColorManagerService } from '@app/services/color-manager/color-manager.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { SprayService } from './spray.service';

// tslint:disable
describe('SprayHandlerService', () => {
    let service: SprayService;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let colorManagerServiceSpy: jasmine.SpyObj<ColorManagerService>;
    let baseCtxSpy: jasmine.SpyObj<CanvasRenderingContext2D>;
    let previewCtxSpy: jasmine.SpyObj<CanvasRenderingContext2D>;
    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', [ 'clearCanvas', 'autoSave', 'getCanvasData']);
        colorManagerServiceSpy = jasmine.createSpyObj('ColorSelectionService', ['getRgbaPrimaryColor']);
        baseCtxSpy = jasmine.createSpyObj('CanvasRenderingContext2D', ['beginPath', 'moveTo', 'lineTo', 'stroke']);
        previewCtxSpy = jasmine.createSpyObj('CanvasRenderingContext2D', ['beginPath', 'moveTo', 'lineTo', 'stroke', 'arc', 'fill']);

        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawServiceSpy },
                { provide: ColorManagerService, useValue: colorManagerServiceSpy },
            ],
        });
        service = TestBed.inject(SprayService);

        service['drawingService'].baseCtx = baseCtxSpy;
        service['drawingService'].previewCtx = previewCtxSpy;
    });

    afterEach(() => {
        if (service.timeoutId) {
            clearTimeout(service.timeoutId);
        }
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('ngOnDestroy should clearTimeout', () => {
        const clearTimeoutSpy = spyOn(global, 'clearTimeout');

        service.ngOnDestroy();

        expect(clearTimeoutSpy).toHaveBeenCalled();
    });


    it(' mouseDown should set mouseDown to true on left click', () => {
        const setTimeoutSpy = spyOn(global, 'setTimeout');
        service.mouseDown = false;
        const mouseEvent = {
            button: MouseButton.Left,
        } as MouseEvent;

        service.onMouseDown(mouseEvent);

        expect(setTimeoutSpy).toHaveBeenCalled();
        expect(service.mouseDown).toEqual(true);
    });

   

    it(' mouseUp should call clearTimeout if mousDown is true', () => {
        const clearTimeoutSpy = spyOn(global, 'clearTimeout');
        service.mouseDown = true;

        service.onMouseUp();
        expect(clearTimeoutSpy).toHaveBeenCalled();
    });

    it(' mouseUp should set mouseDown to false', () => {
        service.mouseDown = true;

        service.onMouseUp();
        expect(service.mouseDown).toEqual(false);
    });

    it(' onMouseMove should not set mouseCoord if mousDown is false', () => {
        service.mouseCoord = { x: 0, y: 0 };
        service.mouseDown = false;
        const mouseEvent = {
            offsetX: 25,
            offsetY: 25,
            button: MouseButton.Left,
        } as MouseEvent;

        service.onMouseMove(mouseEvent);
        expect(service.mouseCoord).toEqual({ x: 0, y: 0 });
    });

    it(' mouseLeave should not call clearTimeout if mousDown is false', () => {
        const clearTimeoutSpy = spyOn(global, 'clearTimeout');
        service.mouseDown = false;

        service.onMouseLeave();
        expect(clearTimeoutSpy).not.toHaveBeenCalled();
    });

    it(' mouseLeave should call clearTimeout if mousDown is true', () => {
        const clearTimeoutSpy = spyOn(global, 'clearTimeout');
        service.mouseDown = true;

        service.onMouseLeave();
        expect(clearTimeoutSpy).toHaveBeenCalled();
    });

    it(' mouseEnter should not call setTimeout if mousDown is false', () => {
        const setTimeoutSpy = spyOn(global, 'setTimeout');
        service.mouseDown = false;
        const mouseEvent = {
            offsetX: 25,
            offsetY: 25,
            button: MouseButton.Left,
        } as MouseEvent;

        service.onMouseEnter(mouseEvent);
        expect(setTimeoutSpy).not.toHaveBeenCalled();
    });

    it(' mouseEnter should call setTimeout if mousDown is true', () => {
        const setTimeoutSpy = spyOn(global, 'setTimeout');
        service.mouseDown = true;
        const mouseEvent = {
            offsetX: 25,
            offsetY: 25,
            button: MouseButton.Left,
        } as MouseEvent;

        service.onMouseEnter(mouseEvent);
        expect(setTimeoutSpy).toHaveBeenCalled();
    });

    it('drawSpray should not call setTimeout if timeoutId is undefined', () => {
        const setTimeoutSpy = spyOn(global, 'setTimeout');
        service.density = 0;

        service.drawSpray(service, service['drawingService'].previewCtx);

        expect(setTimeoutSpy).not.toHaveBeenCalled();
    });

    it('drawSpray should call setTimeout if timeoutId is not undefined', () => {
        service.density = 0;
        service.timeoutId = setTimeout(() => {}, 100);
        const setTimeoutSpy = spyOn(global, 'setTimeout');

        service.drawSpray(service, service['drawingService'].previewCtx);

        expect(setTimeoutSpy).toHaveBeenCalledWith(
            service.drawSpray,
            ONE_SECOND / service.sprayFrequency,
            service,
            service['drawingService'].previewCtx,
        );
    });



    it('getRandomNumber should return random float within min and max range', () => {
        const minimum = 5;
        const maximum = 10;

        expect(service.getRandomNumber(minimum, maximum)).toBeGreaterThan(minimum);
        expect(service.getRandomNumber(minimum, maximum)).toBeGreaterThan(minimum);

        expect(service.getRandomNumber(minimum, maximum)).toBeLessThan(maximum);
        expect(service.getRandomNumber(minimum, maximum)).toBeLessThan(maximum);
    });
    it('should change width', () => {
        service.width = 0;
        service.changeWidth(1);
        expect(service.width).toBe(1);
    });

    it('should change dotWidth', () => {
        service.dotWidth = 0;
        service.changeDotWidth(1);
        expect(service.dotWidth).toBe(1);
    });

    it('should change sprayFrequency', () => {
        service.sprayFrequency = 0;
        service.changeSprayFrequency(1);
        expect(service.sprayFrequency).toBe(1);
    });

    it('reset should set drawingService.previewCtx.globalAlpha to 1', () => {
        service['drawingService'].previewCtx.globalAlpha = 0;
        service.reset();
        expect(service['drawingService'].previewCtx.globalAlpha).toBe(1);
    });
});
