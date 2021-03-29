import { Injectable } from '@angular/core';
import { FiltersList } from '@app/constants';
import { DrawingService } from '@app/services/drawing/drawing.service';

const PREVIEW_ORIGIN_X = 0;
const PREVIEW_ORIGIN_Y = 0;
const PREVIEW_WIDTH = 400;
const PREVIEW_HEIGHT = 250;
const DEFAULT_INTENSITY = 50;
@Injectable({
    providedIn: 'root',
})
export class ExportService {
    baseCtx: CanvasRenderingContext2D;
    canvas: HTMLCanvasElement;
    resizeWidth: number;
    resizeHeight: number;

    drawingTitle: string;
    currentDrawing: string;
    currentImageFormat: string;
    selectedFilter: FiltersList;
    currentFilter: string | undefined;
    filterIntensity: number;

    filtersBindings: Map<FiltersList, string>;

    private image: HTMLImageElement;

    constructor(private drawingService: DrawingService) {
        this.filtersBindings = new Map<FiltersList, string>();
        this.filtersBindings
            .set(FiltersList.None, 'none')
            .set(FiltersList.Blur, 'blur')
            .set(FiltersList.Brightness, 'brightness')
            .set(FiltersList.Contrast, 'contrast')
            .set(FiltersList.Invert, 'invert')
            .set(FiltersList.Grayscale, 'grayscale');

        this.drawingTitle = 'dessin';
        this.currentDrawing = '';
        this.currentImageFormat = 'png';
        this.selectedFilter = FiltersList.None;
        this.currentFilter = this.filtersBindings.get(this.selectedFilter);
        this.filterIntensity = DEFAULT_INTENSITY;

        this.image = new Image();
    }

    imagePrevisualization(): void {
        this.currentDrawing = this.drawingService.canvas.toDataURL();
        this.image.src = this.currentDrawing;
        this.getResizedCanvas();

        this.image.onload = () => {
            this.baseCtx.drawImage(this.image, PREVIEW_ORIGIN_X, PREVIEW_ORIGIN_Y, this.resizeWidth, this.resizeHeight);
        };
    }

    applyFilter(): void {
        this.getResizedCanvas();

        if (this.filtersBindings.has(this.selectedFilter)) {
            this.currentFilter = this.filtersBindings.get(this.selectedFilter);
        }

        if (this.currentFilter != undefined) {
            this.image.src = this.currentDrawing;

            this.image.onload = () => {
                this.baseCtx.clearRect(PREVIEW_ORIGIN_X, PREVIEW_ORIGIN_Y, PREVIEW_WIDTH, PREVIEW_HEIGHT);

                if (this.currentFilter === 'none') {
                    this.baseCtx.filter = 'none';
                } else if (this.currentFilter === 'blur') {
                    this.baseCtx.filter = this.currentFilter + '(' + this.filterIntensity + 'px)';
                } else {
                    this.baseCtx.filter = this.currentFilter + '(' + this.filterIntensity + '%)';
                }

                this.baseCtx.drawImage(this.image, PREVIEW_ORIGIN_X, PREVIEW_ORIGIN_Y, this.resizeWidth, this.resizeHeight);
            };
        }
    }

    exportDrawing(): void {
        const link = document.createElement('a');
        this.image.src = this.canvas.toDataURL('image/' + this.currentImageFormat);
        link.download = this.drawingTitle + '.' + this.currentImageFormat;
        link.href = this.image.src;
        link.click();
    }

    private getResizedCanvas(): void {
        const ratio: number = this.getCanvasRatio();
        this.resizeWidth = PREVIEW_WIDTH;
        this.resizeHeight = this.resizeWidth / ratio;

        if (this.resizeHeight > PREVIEW_HEIGHT) {
            this.resizeHeight = PREVIEW_HEIGHT;
            this.resizeWidth = this.resizeHeight * ratio;
        }
    }

    private getCanvasRatio(): number {
        const width = this.drawingService.baseCtx.canvas.width;
        const height = this.drawingService.baseCtx.canvas.height;
        return width / height;
    }
}
