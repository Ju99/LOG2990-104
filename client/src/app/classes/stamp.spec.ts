import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from './canvas-test-helper';
import { Stamp } from './stamp';
import { Vec2 } from './vec2';
// tslint:disable: no-any
// tslint:disable: no-magic-numbers
describe('Stamp', () => {
    let canvasTestHelper: CanvasTestHelper;
    let baseCtxStub: CanvasRenderingContext2D;

    beforeEach(() => {
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
    });
    it('should create an instance', () => {
        expect(new Stamp({} as Vec2, '', 1, 0.4, 'red')).toBeTruthy();
    });
    it(' draw should call save, translate, rotate, drawImage and restore', () => {
        const stamp = new Stamp({} as Vec2, '', 1, 0.4, 'red');
        const ctxStub = baseCtxStub.canvas.getContext('2d') as CanvasRenderingContext2D;
        const saveSpy = spyOn<any>(ctxStub, 'save');
        const translateSpy = spyOn<any>(ctxStub, 'translate');
        const rotateSpy = spyOn<any>(ctxStub, 'rotate');
        const restoreSpy = spyOn<any>(ctxStub, 'restore');
        stamp.draw(ctxStub);
        expect(saveSpy).toHaveBeenCalled();
        expect(translateSpy).toHaveBeenCalled();
        expect(rotateSpy).toHaveBeenCalled();
        expect(restoreSpy).toHaveBeenCalled();
    });
});
