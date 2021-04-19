import { TestBed } from '@angular/core/testing';
import { SelectionTool } from '@app/classes/selection';
import { CanvasTestHelper } from './canvas-test-helper';
import { Vec2 } from './vec2';

// const PIXEL_LENGTH = 4;
// const MAX_RGB = 255;
//tslint:disable
describe('Selection', () => {
    let canvasTestHelper: CanvasTestHelper;
    beforeEach(() => {
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
    });
    it('should create', () => {
        expect(new SelectionTool({ x: 1, y: 1 } as Vec2, { x: 4, y: 4 } as Vec2, 2, 2)).toBeTruthy();
    });

    it('draw should call clearUnderneathShape', () => {
        const ctx = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        const selection = new SelectionTool({ x: 1, y: 1 } as Vec2, { x: 4, y: 4 } as Vec2, 3, 3);
        selection.isEllipse = false;
        selection.isLasso = false;
        selection.image = new ImageData(100, 100);
        selection.clearImageDataPolygon = new ImageData(100, 100);
        selection.initialOrigin = { x: 1, y: 1 };
        selection.polygonCoords = [
            { x: 1, y: 1 },
            { x: 2, y: 2 },
        ];
        selection.initialWidth = 1;
        selection.initialHeight = 1;

        const spy = spyOn<any>(selection, 'clearUnderneathShape');
        spyOn<any>(ctx, 'putImageData').and.stub();
        selection.draw(ctx);
        expect(spy).toHaveBeenCalled();
    });

    it('draw should call printEllipse if isEllipse is true', () => {
        const ctx = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        const selection = new SelectionTool({ x: 1, y: 1 } as Vec2, { x: 4, y: 4 } as Vec2, 3, 3);
        selection.isEllipse = true;
        selection.isLasso = false;
        selection.image = new ImageData(100, 100);
        selection.clearImageDataPolygon = new ImageData(100, 100);
        selection.initialOrigin = { x: 1, y: 1 };
        selection.polygonCoords = [
            { x: 0, y: 0 },
            { x: 1, y: 1 },
        ];

        selection.initialWidth = 1;
        selection.initialHeight = 1;

        const spy = spyOn<any>(selection, 'printEllipse');
        selection.draw(ctx);
        expect(spy).toHaveBeenCalled();
    });

    it('draw should call printPolygon if isLasso is true', () => {
        const ctx = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        const selection = new SelectionTool({ x: 1, y: 1 } as Vec2, { x: 4, y: 4 } as Vec2, 3, 3);
        selection.isLasso = true;
        selection.isEllipse = false;
        selection.image = new ImageData(100, 100);
        selection.clearImageDataPolygon = new ImageData(100, 100);
        selection.initialOrigin = { x: 1, y: 1 };
        selection.polygonCoords = [
            { x: 1, y: 1 },
            { x: 2, y: 2 },
        ];
        selection.initialWidth = 1;
        selection.initialHeight = 1;
        const spy = spyOn<any>(selection, 'printPolygon').and.stub();
        selection.draw(ctx);
        expect(spy).toHaveBeenCalled();
    });

    it('draw should call putImagedata if isLasso and isEllipse are false', () => {
        const ctx = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;

        const selection = new SelectionTool({ x: 1, y: 1 } as Vec2, { x: 4, y: 4 } as Vec2, 3, 3);
        selection.isLasso = false;
        selection.isEllipse = false;
        selection.image = new ImageData(100, 100);
        selection.clearImageDataPolygon = new ImageData(100, 100);
        selection.initialOrigin = { x: 1, y: 1 };
        selection.polygonCoords = [
            { x: 1, y: 1 },
            { x: 2, y: 2 },
        ];
        selection.initialWidth = 1;
        selection.initialHeight = 1;

        const putImageDataSpy = spyOn<any>(ctx, 'putImageData').and.stub();
        spyOn<any>(selection, 'clearUnderneathShape').and.stub();
        selection.draw(ctx);
        expect(putImageDataSpy).toHaveBeenCalled();
    });

    it('ClearUnderneathShape should call fillRect if isLasso and isEllipse are false', () => {
        const ctx = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        const selection = new SelectionTool({ x: 1, y: 1 } as Vec2, { x: 4, y: 4 } as Vec2, 3, 3);
        selection.isLasso = false;
        selection.isEllipse = false;
        selection.image = new ImageData(100, 100);
        selection.clearImageDataPolygon = new ImageData(100, 100);
        selection.initialOrigin = { x: 1, y: 1 };
        selection.polygonCoords = [
            { x: 1, y: 1 },
            { x: 2, y: 2 },
        ];
        selection.initialWidth = 1;
        selection.initialHeight = 1;

        const fillRectSpy = spyOn<any>(ctx, 'fillRect').and.stub();
        selection.draw(ctx);
        expect(fillRectSpy).toHaveBeenCalled();
    });

    it('print ellipse should draw an ellipse on canvas', () => {
        const ctx = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        const ctxTemp = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;

        const selection = new SelectionTool({ x: 1, y: 1 } as Vec2, { x: 4, y: 4 } as Vec2, 3, 3);
        selection.isLasso = false;
        selection.isEllipse = true;
        selection.image = new ImageData(100, 100);
        selection.clearImageDataPolygon = new ImageData(100, 100);
        selection.initialOrigin = { x: 1, y: 1 };
        selection.polygonCoords = [
            { x: 1, y: 1 },
            { x: 2, y: 2 },
        ];
        selection.initialWidth = 1;
        selection.initialHeight = 1;

        spyOn<any>(ctxTemp, 'putImageData');
        const ellipseCtxSpy = spyOn<any>(ctx, 'ellipse').and.stub();
        selection.draw(ctx);
        expect(ellipseCtxSpy).toHaveBeenCalled();
    });

    it('printPolygon should draw a polygon shape on canvas', () => {
        const ctx = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        const ctxTemp = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;

        const selection = new SelectionTool({ x: 1, y: 1 } as Vec2, { x: 4, y: 4 } as Vec2, 3, 3);
        selection.isLasso = true;
        selection.isEllipse = false;
        selection.image = new ImageData(100, 100);
        selection.clearImageDataPolygon = new ImageData(100, 100);
        selection.initialOrigin = { x: 1, y: 1 };
        selection.polygonCoords = [
            { x: 1, y: 1 },
            { x: 2, y: 2 },
        ];
        selection.initialWidth = 1;
        selection.initialHeight = 1;

        spyOn<any>(ctxTemp, 'putImageData');
        const drawImageSpy = spyOn<any>(ctx, 'drawImage').and.stub();
        selection.draw(ctx);
        expect(drawImageSpy).toHaveBeenCalled();
    });

    // it('clearUnderneathShape should update clearPolygon if isLasso true',()=>{
    //     const ctx = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;

    //     const selection= new SelectionTool({x:1,y:1} as Vec2,{x:4, y:4} as Vec2, 3, 3);
    //     selection.isEllipse = false;
    //     selection.isLasso = true;
    //     selection.clearImageDataPolygon=new ImageData(10,10);
    //     selection.image=new ImageData(100,100);
    //     selection.initialOrigin={x:1,y:1};
    //     selection.polygonCoords=[{x:1,y:1},{x:2,y:2}];
    //     selection.initialWidth=1;
    //     selection.initialHeight=1;

    //    const clearPolygonSpy=spyOn<any>(selection,'clearPolygon').and.stub();
    //    selection.draw(ctx);
    //    expect(clearPolygonSpy).toHaveBeenCalled();

    // });

    // it('should clear underneath if lasso', () => {
    //     const ctx = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
    //     const selection = new SelectionTool({ x: 50, y: 50 } as Vec2, { x: 100, y: 100 } as Vec2, 50, 50);
    //     selection.isEllipse = false;
    //     selection.isLasso = true;
    //     selection.clearImageDataPolygon = new ImageData(10, 10);
    //     selection.image=new ImageData(10,10);
    //     selection.initialOrigin={x:1,y:1};
    //     selection.polygonCoords=[{x:1,y:1},{x:2,y:2}];
    //     selection.initialWidth=1;
    //     selection.initialHeight=1;

    //     const clearPolygonSpy = spyOn<any>(selection,'clearPolygon').and.stub();
    //     const beginPathSpy=spyOn<any>(ctx,'beginPath').and.stub();
    //     selection.clearUnderneathShape(ctx);
    //     expect(ctx.fillStyle).toEqual('#ffffff');
    //     expect(beginPathSpy).toHaveBeenCalled();
    //     expect(clearPolygonSpy).toHaveBeenCalled();
    // });
});
