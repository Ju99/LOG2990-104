import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { FiltersList } from '@app/constants';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ExportService } from '@app/services/export-image/export.service';

// tslint:disable
describe('ExportService', () => {
    let service: ExportService;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let canvasTestHelper: CanvasTestHelper;

    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);
        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawServiceSpy }],
        });
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        service = TestBed.inject(ExportService);
        service.baseCtx = baseCtxStub;
        drawServiceSpy.canvas = canvasTestHelper.canvas;
        service['drawingService'].baseCtx = baseCtxStub;
        service['drawingService'].previewCtx = previewCtxStub;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should apply blur filter image', () => {
        service.selectedFilter = FiltersList.Blur;
        spyOn<any>(service, 'getResizedCanvas').and.stub();
        const filterGetSpy = spyOn(service.filtersBindings, 'get').and.callThrough();
        service.applyFilter();
        if (service['image'].onload) {
            service['image'].onload({} as any);
        }
        expect(filterGetSpy).toHaveBeenCalled();
        expect(service.currentFilter).toEqual('blur(50px)');
    });

    it('should not apply filter', () => {
        service.selectedFilter = FiltersList.None;
        spyOn<any>(service, 'getResizedCanvas').and.stub();
        const filterGetSpy = spyOn(service.filtersBindings, 'get').and.callThrough();
        service.applyFilter();
        if (service['image'].onload) {
            service['image'].onload({} as any);
        }
        expect(filterGetSpy).toHaveBeenCalled();
        expect(service.currentFilter).toEqual('none');
    });

    it('should apply inverse filter ', () => {
        service.selectedFilter = FiltersList.Invert;
        spyOn<any>(service, 'getResizedCanvas').and.stub();
        const filterGetSpy = spyOn(service.filtersBindings, 'get').and.callThrough();
        service.applyFilter();
        if (service['image'].onload) {
            service['image'].onload({} as any);
        }
        expect(filterGetSpy).toHaveBeenCalled();
        expect(service.currentFilter).toEqual('invert(50%)');
    });

    it('should not apply filter if doesnt exist in list', () => {
        spyOn(service['filtersBindings'], 'has').and.returnValue(false);
        const filterGetSpy = spyOn<any>(service['filtersBindings'], 'get').and.stub();

        service.applyFilter();

        expect(filterGetSpy).not.toHaveBeenCalled();
    });

    it('should not apply filter if doesnt exist in list', () => {
        spyOn(service['filtersBindings'], 'has').and.returnValue(false);
        const filterGetSpy = spyOn<any>(service['filtersBindings'], 'get').and.stub();

        service.applyFilter();

        expect(filterGetSpy).not.toHaveBeenCalled();
    });

    it('getResizedCanvas should resize if the ratio is too big', () => {
        service.selectedFilter = FiltersList.Blur;
        spyOn<any>(service, 'getCanvasRatio').and.returnValue(1);
        service['getResizedCanvas']();
        expect(service.resizeHeight).toEqual(250);
        expect(service.resizeWidth).toEqual(250);
    });

    it('should show the image on canvas on a smaller one', () => {
        spyOn(drawServiceSpy.canvas, 'toDataURL').and.returnValue(
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAADElEQVQImWNgoBMAAABpAAFEI8ARAAAAAElFTkSuQmCC',
        );

        let drawImageSpy = spyOn(service.baseCtx, 'drawImage').and.stub();
        service.imagePrevisualization();
        if (service['image'].onload) {
            service['image'].onload({} as any);
        }
        expect(drawImageSpy).toHaveBeenCalled();
    });

    it('should save the canva image locally', () => {
        const exportSpy = spyOn(service, 'previsualizationToBiggerCanvas').and.callThrough();
        service['drawingService'].canvas.width = 250;
        service['drawingService'].canvas.height = 250;
        service.currentFilter = 'blur';

        service.exportDrawing();

        expect(exportSpy).toHaveBeenCalled();
    });

    it('should save the canva image locally', () => {
        const exportSpy = spyOn(service, 'previsualizationToBiggerCanvas').and.callThrough();
        service['drawingService'].canvas.width = 250;
        service['drawingService'].canvas.height = 250;
        service.currentFilter = 'blur';

        service.exportDrawing();

        expect(exportSpy).toHaveBeenCalled();
    });

    it('should initilize export params ', () => {
        service.drawingTitle = 'pizza';
        service.currentFilter = 'invert(50%)';
        service.currentImageFormat = 'jpeg';

        service.initializeExportParams();

        expect(service.drawingTitle).toEqual('dessin');
        expect(service.currentFilter).toEqual('none');
        expect(service.currentImageFormat).toEqual('png');
    });

    it('should upload image of drawingBaseCtx to imgur', async () => {
        service.uploadToImgur().then(() => {
            expect(service.imgurURL).not.toEqual('');
        });
    });

    it('should resize canvas case height is bigger ', () => {
        service['drawingService'].baseCtx.canvas.width = 500;
        service['drawingService'].baseCtx.canvas.height = 250;

        service['getResizedCanvas']();

        expect(service.resizeHeight).toBe(200);
        expect(service.resizeWidth).toBe(400);
    });

    it('should not apply filter if this one is undefined ', () => {
        const prevSpy = spyOn(service, 'previsualizationToBiggerCanvas').and.callThrough();
        service['drawingService'].canvas.width = 250;
        service['drawingService'].canvas.height = 250;
        service.currentFilter = undefined;

        service.exportDrawing();

        expect(prevSpy).toHaveBeenCalled();
    });
});
