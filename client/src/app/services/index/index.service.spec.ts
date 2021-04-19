import { HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Drawing } from '@common/communication/drawing';
import { DrawingData } from '@common/communication/drawing-data';
import { of } from 'rxjs';
import { IndexService } from './index.service';

//tslint:disable
describe('IndexService', () => {
    let httpMock: HttpTestingController;
    let indexService: IndexService;
    let mockDrawing: DrawingData;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
        });
        indexService = TestBed.inject(IndexService);
        httpMock = TestBed.inject(HttpTestingController);
        mockDrawing = {
            title: 'title',
            labels: ['tag'],
            width: 100,
            height: 100,
            body: 'data',
        };
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(indexService).toBeTruthy();
    });

    it('should call http request POST on postDrawing', async () => {
        const spy = spyOn(indexService['http'], 'post').and.returnValue(of(DrawingData));
        indexService.postDrawing(mockDrawing).then(() => {
            expect(spy).toHaveBeenCalled();
        });
    });

    it('should call http request DELETE on deleteDrawingById', async () => {
        const httpDeleteSpy = spyOn(indexService['http'], 'delete').and.returnValue(of(DrawingData));
        indexService.deleteDrawingById('12345').then(() => {
            expect(httpDeleteSpy).toHaveBeenCalled();
        });
    });
    it('should call http request GET on getAllDrawing', async () => {
        const httpGetSpy = spyOn(indexService['http'], 'get').and.returnValue(of(Drawing));
        const expectedUrl = 'http://localhost:3000/api/database';
        const toDataSpy = spyOn<any>(indexService, 'drawingDataToDrawing').and.stub();
        indexService.getAllDrawingsFromDB().then(() => {
            expect(httpGetSpy).toHaveBeenCalledWith(expectedUrl);
            expect(toDataSpy).toHaveBeenCalled();
        });
    });

    it('should parse DrawingData to Drawing', async () => {
        let drawingDatas: DrawingData[] = [mockDrawing];
        let expectedDrawing = new Drawing('title', ['tag'], 'http://localhost:3000/api/database/drawings/undefined.png');
        let drawings: Drawing[] = [];
        drawings.push(expectedDrawing);
        let parse = indexService.drawingDataToDrawing(drawingDatas);
        expect(parse).toEqual(drawings);
    });

    it('should research by tags on array with more than a tag', async () => {
        let tags = ['a', 'b'];
        const tagSpy = spyOn(indexService['http'], 'get').and.returnValue(of(Drawing));
        indexService.searchByTags(tags).then(() => {
            expect(tagSpy).toHaveBeenCalled();
        });
    });

    xit('should research by tags on array with no tag', async () => {
        let tags: string[] = [];
        const tagSpy = spyOn(indexService['http'], 'get').and.returnValue(of(Drawing));
        const getAllDrawingSpy = spyOn(indexService, 'getAllDrawingsFromDB');
        indexService.searchByTags(tags).then(() => {
            expect(tagSpy).toHaveBeenCalled();
            expect(getAllDrawingSpy).toHaveBeenCalled();
        });
    });

    it('should handle error correctly (client side)', () => {
        const error = new HttpErrorResponse({ error: new ErrorEvent('test'), status: 404, statusText: 'Not Found' });
        const alertSpy = spyOn<any>(window, 'alert').and.stub();
        indexService['handleError'](error);
        expect(alertSpy).toHaveBeenCalled();
    });

    it('should handle error correctly (server side)', () => {
        const error = new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
        const alertSpy = spyOn<any>(window, 'alert').and.stub();
        indexService['handleError'](error);
        expect(alertSpy).toHaveBeenCalled();
    });
});
