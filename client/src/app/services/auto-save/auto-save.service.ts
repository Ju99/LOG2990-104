import { Injectable } from '@angular/core';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { DrawingData } from '@common/communication/drawing-data';

@Injectable({
    providedIn: 'root',
})
export class AutoSaveService {
    readonly localName: string = 'local';
    readonly isEmpty: boolean;

    localDrawing: DrawingData;
    private canvasImage: HTMLImageElement;

    constructor(private drawingService: DrawingService) {
        this.localDrawing = new DrawingData();
        this.canvasImage = new Image();
    }

    saveCanvasState(drawing: DrawingData): void {
        window.localStorage.setItem(this.localName, JSON.stringify(drawing));
    }

    loadImage(): void {
        const lastAutoSavedDrawing = window.localStorage.getItem(this.localName);

        if (lastAutoSavedDrawing) {
            this.localDrawing = JSON.parse(lastAutoSavedDrawing) as DrawingData;
            this.canvasImage.src = this.localDrawing.body;
            this.canvasImage.onload = () => {
                this.drawingService.baseCtx.drawImage(this.canvasImage, 0, 0, this.localDrawing.width, this.localDrawing.height);
            };
        }
    }

    clearLocalStorage(): void {
        window.localStorage.clear();
    }

    localStorageIsEmpty(): boolean {
        return window.localStorage.length === 0;
    }
}
