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
        service['drawingService'].baseCtx = baseCtxStub;
        service['drawingService'].previewCtx = previewCtxStub;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('applyFilter should get the selected filter and assign to current filter', () => {
        service.selectedFilter = FiltersList.Blur;
        spyOn<any>(service, 'getResizedCanvas').and.stub();
        const filterGetSpy = spyOn(service.filtersBindings, 'get').and.callThrough();
        service.applyFilter();
        expect(filterGetSpy).toHaveBeenCalled();
        expect(service.currentFilter).toEqual('blur');
    });

    it('getResizedCanvas should resize if the ratio is too big', () => {
        service.selectedFilter = FiltersList.Blur;
        spyOn<any>(service, 'getCanvasRatio').and.returnValue(1);
        service['getResizedCanvas']();
        expect(service.resizeHeight).toEqual(250);
        expect(service.resizeWidth).toEqual(250);
    });
});
