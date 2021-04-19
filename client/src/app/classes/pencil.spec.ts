import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from './canvas-test-helper';
import { Pencil } from './pencil';
import { Vec2 } from './vec2';
// tslint:disable: no-any
// tslint:disable: no-magic-numbers
describe('PaintBucket', () => {
    let canvasTestHelper: CanvasTestHelper;
    let baseCtxStub: CanvasRenderingContext2D;

    beforeEach(() => {
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
    });
    it('should create an instance', () => {
        expect(new Pencil([] as Vec2[], 'rgba(255, 0, 0, 1)', 1)).toBeTruthy();
    });
    it(' draw should call putImageData', () => {
        const pencilTest = new Pencil(
            [
                { x: 0, y: 0 },
                { x: 1, y: 1 },
                { x: 2, y: 2 },
                { x: 3, y: 3 },
            ] as Vec2[],
            'rgba(255, 0, 0, 1)',
            1,
        );
        const startSpy = spyOn<any>(baseCtxStub, 'beginPath');
        const spy = spyOn<any>(baseCtxStub, 'stroke');
        const lineSpy = spyOn<any>(baseCtxStub, 'lineTo');
        pencilTest.draw(baseCtxStub);
        expect(spy).toHaveBeenCalled();
        expect(lineSpy).toHaveBeenCalled();
        expect(startSpy).toHaveBeenCalled();
    });
});
