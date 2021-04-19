import { Injectable } from '@angular/core';
import { SelectionTool } from '@app/classes/selection';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { EllipseService } from '@app/services/tools/ellipse/ellipse.service';

const PIXEL_LENGTH = 4;

@Injectable({
    providedIn: 'root',
})
export class EllipseSelectionService {
    constructor(private drawingService: DrawingService, private ellipseService: EllipseService) {}

    checkPixelInEllipse(selection: SelectionTool): ImageData {
        const imageData = selection.image.data;
        let pixelCounter = 0;

        for (let i = 0; i < selection.height; i++) {
            for (let j = 0; j < selection.width; j++) {
                const rectangleCenter = { x: selection.width / 2, y: selection.height / 2 };
                const x = j - rectangleCenter.x;
                const y = i - rectangleCenter.y;

                if (this.ellipseService.isShiftShape && Math.pow(x, 2) + Math.pow(y, 2) > Math.pow(selection.width / 2, 2)) {
                    imageData[pixelCounter + PIXEL_LENGTH - 1] = 0;
                } else if (
                    !this.ellipseService.isShiftShape &&
                    Math.pow(x, 2) / Math.pow(rectangleCenter.x, 2) + Math.pow(y, 2) / Math.pow(rectangleCenter.y, 2) > 1
                ) {
                    imageData[pixelCounter + PIXEL_LENGTH - 1] = 0;
                }
                pixelCounter += PIXEL_LENGTH;
            }
        }
        return selection.image;
    }

    printEllipse(selection: SelectionTool): void {
        const canvas = document.createElement('canvas');
        canvas.width = selection.width;
        canvas.height = selection.height;
        const tmp = canvas.getContext('2d') as CanvasRenderingContext2D;
        tmp.putImageData(selection.image, 0, 0);
        this.drawingService.baseCtx.ellipse(
            selection.origin.x + selection.width / 2,
            selection.origin.y + selection.height / 2,
            selection.width / 2,
            selection.height / 2,
            0,
            2 * Math.PI,
            0,
        );
        this.drawingService.baseCtx.save();
        this.drawingService.baseCtx.clip();
        this.drawingService.baseCtx.drawImage(tmp.canvas, selection.origin.x, selection.origin.y);
        this.drawingService.baseCtx.restore();
    }
}
