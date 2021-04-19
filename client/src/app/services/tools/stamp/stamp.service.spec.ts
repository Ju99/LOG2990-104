import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { mouseEventLClick, mouseEventRClick, StampList } from '@app/constants';
import { ColorManagerService } from '@app/services/color-manager/color-manager.service';
import { StampService } from './stamp.service';

// tslint:disable
describe('StampService', () => {
    let service: StampService;
    let canvasTestHelper: CanvasTestHelper;
    let baseCtxStub: CanvasRenderingContext2D;
    let cursorCtxStub: CanvasRenderingContext2D;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(StampService);

        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        cursorCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;

        service['drawingService'].baseCtx = baseCtxStub;
        service['drawingService'].cursorCtx = cursorCtxStub;

        spyOn(service['drawingService'], 'clearCanvas').and.stub();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('src binding should change to the good src', () => {
        const src = service.srcBinding.get('surprised');
        expect(src).toEqual(
            'M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-3.5 8c-.828 0-1.5.671-1.5 1.5s.672 1.5 1.5 1.5 1.5-.671 1.5-1.5-.672-1.5-1.5-1.5zm7 0c-.828 0-1.5.671-1.5 1.5s.672 1.5 1.5 1.5 1.5-.671 1.5-1.5-.672-1.5-1.5-1.5zm-3.499 4c-1.658 0-3.001 1.567-3.001 3.501 0 1.932 1.343 3.499 3.001 3.499 1.656 0 2.999-1.567 2.999-3.499 0-1.934-1.343-3.501-2.999-3.501z',
        );
    });

    it('stamp Binding should change to good string of stamp', () => {
        const stamp = service.stampBindings.get(StampList.Happy);
        expect(stamp).toEqual('happy');
    });

    it('currentStamp and selectStamp should not be undefined', () => {
        expect(service.currentStamp).toEqual('happy');
        expect(service.selectStamp).toEqual(StampList.Happy);
    });

    it('stamp color should be initalized with the principal color', () => {
        const colorManagerService = new ColorManagerService();
        expect(service.color).toEqual(colorManagerService.selectedColor[0].inString);
    });

    it('Initial angle should be 0', () => {
        const expectedAngle = 0;
        expect(service.angle).toEqual(expectedAngle);
    });

    it('Initial resize factor should be 1', () => {
        const expectedresize = 1;
        expect(service.resizeFactor).toEqual(expectedresize);
    });

    it('onMouseDown should draw the stamp if left click', () => {
        spyOn(service, 'getPositionFromMouse').and.returnValue({ x: 25, y: 25 });
        const drawStampSpy = spyOn(service, 'drawStamp').and.stub();
        service.onMouseDown(mouseEventLClick);

        expect(drawStampSpy).toHaveBeenCalled();
    });

    it('onMouseDown should draw the stamp if right click', () => {
        spyOn(service, 'getPositionFromMouse').and.returnValue({ x: 25, y: 25 });
        const drawStampSpy = spyOn(service, 'drawStamp').and.stub();
        service.onMouseDown(mouseEventRClick);

        expect(drawStampSpy).not.toHaveBeenCalled();
    });

    it('Alt keyDown event should prevent default', () => {
        const keyEvent = new KeyboardEvent('keyDown', { key: 'Alt' });
        const preventDefaultSpy = spyOn(keyEvent, 'preventDefault');
        service.handleKeyDown(keyEvent);
        expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('handleKeyDown with Alt event should put isKeyAltDown to true', () => {
        const keyEvent = new KeyboardEvent('keyDown', { key: 'Alt' });
        service.handleKeyDown(keyEvent);
        expect(service.isKeyAltDown).toEqual(true);
    });

    it('handleKeyDown with no Alt event should put isKeyAltDown to false', () => {
        const keyEvent = new KeyboardEvent('keyDown', { key: 'Shift' });
        service.handleKeyDown(keyEvent);
        expect(service.isKeyAltDown).toEqual(false);
    });

    it('handleUp with Alt event should put isKeyAltDown to false', () => {
        const keyEvent = new KeyboardEvent('keyUp', { key: 'Alt' });
        service.handleKeyUp(keyEvent);
        expect(service.isKeyAltDown).toEqual(false);
    });

    it('handleUp with no Alt event should put isKeyAltDown to false', () => {
        const keyEvent = new KeyboardEvent('keyUp', { key: 'Shift' });
        service.handleKeyUp(keyEvent);
        expect(service.isKeyAltDown).toEqual(false);
    });

    it('onMouseMove should update the preview cursor', () => {
        spyOn(service, 'getPositionFromMouse').and.returnValue({ x: 25, y: 25 });
        const cursorSpy = spyOn(service, 'previewCursor').and.stub();
        service.onMouseMove(mouseEventRClick);

        expect(cursorSpy).toHaveBeenCalled();
    });

    it('onWheelEvent should update the rotationStep by 15 if no alt key', () => {
        const event = new WheelEvent('wheel', { deltaY: 10 });
        const angle = 0;
        const rotationStep = 15;
        service.isKeyAltDown = false;
        const changeAngleSpy = spyOn(service, 'changeAngle').and.stub();
        const expectedArg = angle - (event.deltaY / Math.abs(event.deltaY)) * rotationStep;
        spyOn(service, 'onMouseMove').and.stub();

        service.onWheelEvent(event);
        expect(changeAngleSpy).toHaveBeenCalledWith(expectedArg);
    });

    it('onWheelEvent should update the rotationStep by 1 if alt key is down', () => {
        const event = new WheelEvent('wheel', { deltaY: 10 });
        const angle = 0;
        const rotationStep = 1;
        service.isKeyAltDown = true;
        const changeAngleSpy = spyOn(service, 'changeAngle').and.stub();
        const expectedArg = angle - (event.deltaY / Math.abs(event.deltaY)) * rotationStep;
        spyOn(service, 'onMouseMove').and.stub();

        service.onWheelEvent(event);
        expect(changeAngleSpy).toHaveBeenCalledWith(expectedArg);
    });

    it('changeAngle should change the angle if not under 0', () => {
        const newAngle = 90;
        const observableSpy = spyOn(service['angleObservable'], 'next').and.stub();

        service.changeAngle(newAngle);

        expect(service.angle).toEqual(newAngle);
        expect(observableSpy).toHaveBeenCalled();
    });

    it('changeAngle should change the angle if under 0', () => {
        const newAngle = -30;
        const expectedAngle = 330;
        const observableSpy = spyOn(service['angleObservable'], 'next').and.stub();

        service.changeAngle(newAngle);

        expect(service.angle).toEqual(expectedAngle);
        expect(observableSpy).toHaveBeenCalled();
    });

    it('drawStamp should not change the stamp if undefined', () => {
        const test = 'test';
        service.currentStamp = test;
        service.imageSrc = test;
        spyOn(service.srcBinding, 'has').and.returnValue(false);
        service.drawStamp({ x: 0, y: 0 });
        expect(service.imageSrc).toEqual(test);
    });

    it('drawStamp should rotate the stamp', () => {
        const rotateSpy = spyOn(baseCtxStub, 'rotate').and.stub();
        service.drawStamp({ x: 0, y: 0 });
        expect(rotateSpy).toHaveBeenCalledTimes(1);
    });

    it('drawStamp should translate the stamp', () => {
        const translateSpy = spyOn(baseCtxStub, 'translate').and.stub();
        const expectedCalled = 3;
        service.drawStamp({ x: 0, y: 0 });
        expect(translateSpy).toHaveBeenCalledTimes(expectedCalled);
    });

    it('drawStamp should scale the stamp', () => {
        const scaleSpy = spyOn(baseCtxStub, 'scale').and.stub();
        service.drawStamp({ x: 0, y: 0 });
        expect(scaleSpy).toHaveBeenCalledTimes(1);
    });

    it('drawStamp should set transform on the stamp only horizontaly and verticaly', () => {
        const setTransformSpy = spyOn(baseCtxStub, 'setTransform').and.stub();
        service.drawStamp({ x: 0, y: 0 });
        expect(setTransformSpy).toHaveBeenCalledTimes(1);
        expect(setTransformSpy).toHaveBeenCalledWith(1, 0, 0, 1, 0, 0);
    });

    it('drawStamp should match the principal color', () => {
        const color = '#ff0000';
        service.drawStamp({ x: 0, y: 0 });
        expect(baseCtxStub.strokeStyle).toEqual(color);
        expect(baseCtxStub.fillStyle).toEqual(color);
    });

    it('previewCursor should not change the stamp if undefined', () => {
        const test = 'test';
        service.currentStamp = test;
        service.imageSrc = test;
        spyOn(service.srcBinding, 'has').and.returnValue(false);
        service.previewCursor({ x: 0, y: 0 });
        expect(service.imageSrc).toEqual(test);
    });

    it('previewCursor should rotate the stamp', () => {
        const rotateSpy = spyOn(cursorCtxStub, 'rotate').and.stub();
        service.previewCursor({ x: 0, y: 0 });
        expect(rotateSpy).toHaveBeenCalledTimes(1);
    });

    it('previewCursor should translate the stamp', () => {
        const translateSpy = spyOn(cursorCtxStub, 'translate').and.stub();
        const expectedCalled = 3;
        service.previewCursor({ x: 0, y: 0 });
        expect(translateSpy).toHaveBeenCalledTimes(expectedCalled);
    });

    it('previewCursor should scale the stamp', () => {
        const scaleSpy = spyOn(cursorCtxStub, 'scale').and.stub();
        service.previewCursor({ x: 0, y: 0 });
        expect(scaleSpy).toHaveBeenCalledTimes(1);
    });

    it('previewCursor should set transform on the stamp only horizontaly and verticaly', () => {
        const setTransformSpy = spyOn(cursorCtxStub, 'setTransform').and.stub();
        service.previewCursor({ x: 0, y: 0 });
        expect(setTransformSpy).toHaveBeenCalledTimes(1);
        expect(setTransformSpy).toHaveBeenCalledWith(1, 0, 0, 1, 0, 0);
    });

    it('changeStamp should not change the stamp if not undefined', () => {
        service.currentStamp = 'happy';
        service.selectStamp = StampList.Sad;

        spyOn(service.stampBindings, 'has').and.returnValue(false);
        service.changeStamp();
        expect(service.currentStamp).toEqual('happy');
    });

    it('changeStamp should change the stamp if valid', () => {
        service.currentStamp = 'happy';
        service.selectStamp = StampList.Sad;
        service.changeStamp();
        expect(service.currentStamp).toEqual('sad');
    });
});
