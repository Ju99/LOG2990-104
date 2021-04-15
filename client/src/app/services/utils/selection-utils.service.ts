import { Injectable } from '@angular/core';
import { SelectionTool } from '@app/classes/selection';
import { Vec2 } from '@app/classes/vec2';
import { CONTROLPOINTSIZE } from '@app/constants';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { EllipseService } from '@app/services/tools/ellipse/ellipse.service';
import { RectangleService } from '@app/services/tools/rectangle/rectangle.service';
import { LassoService } from '@app/services/tools/selection/lasso/lasso.service';
import { ResizeSelectionService } from '../selection/resize-selection.service';

const SELECTION_DEFAULT_LINE_THICKNESS = 3;
const PIXEL_LENGTH = 4;
const MAX_RGB = 255;

@Injectable({
    providedIn: 'root',
})
export class SelectionUtilsService {
    controlPointsCoord: Vec2[];
    cleanedUnderneath: boolean;
    private previousLineWidthRectangle: number;
    private previousLineWidthEllipse: number;

    constructor(
        private drawingService: DrawingService,
        private rectangleService: RectangleService,
        private ellipseService: EllipseService,
        private lassoService: LassoService,
        private resizeSelectionService: ResizeSelectionService,
    ) {
        this.cleanedUnderneath = false;
    }

    initializeToolParameters(): void {
        this.previousLineWidthRectangle = this.rectangleService.lineWidth;
        this.previousLineWidthEllipse = this.ellipseService.lineWidth;
        this.rectangleService.isSelection = true;
        this.ellipseService.isSelection = true;
        this.rectangleService.lineWidth = SELECTION_DEFAULT_LINE_THICKNESS;
        this.ellipseService.lineWidth = SELECTION_DEFAULT_LINE_THICKNESS;

        this.drawingService.previewCtx.setLineDash([2]);
    }

    resetParametersTools(): void {
        this.rectangleService.mouseDown = false;
        this.rectangleService.lineWidth = this.previousLineWidthRectangle;
        this.ellipseService.mouseDown = false;
        this.ellipseService.lineWidth = this.previousLineWidthEllipse;
        this.drawingService.previewCtx.setLineDash([0]);
        this.rectangleService.isSelection = false;
        this.ellipseService.isSelection = false;
    }

    mouseInSelectionArea(origin: Vec2, destination: Vec2, mouseCoord: Vec2): boolean {
        console.log('mouseIn', origin, destination, mouseCoord);

        return mouseCoord.x >= origin.x && mouseCoord.x <= destination.x && mouseCoord.y >= origin.y && mouseCoord.y <= destination.y;
    }

    reajustOriginAndDestination(selection: SelectionTool): SelectionTool {
        if (selection.width <= 0 && selection.height <= 0) {
            const temp = selection.origin;
            selection.origin = selection.destination;
            selection.destination = temp;
        } else if (selection.width <= 0) {
            selection.origin.x += selection.width;
            selection.destination.x += Math.abs(selection.width);
        } else if (selection.height <= 0) {
            selection.origin.y += selection.height;
            selection.destination.y += Math.abs(selection.height);
        }

        selection.width = Math.abs(selection.width);
        selection.height = Math.abs(selection.height);

        return selection;
    }

    createBoundaryBox(selection: SelectionTool): void {
        this.initializeToolParameters();
        if (selection.isEllipse) {
            this.ellipseService.clearPath();
            this.ellipseService.pathData.push(selection.origin);
            this.ellipseService.pathData.push(selection.destination);
            this.ellipseService.drawShape(this.drawingService.previewCtx);
        } else {
            this.rectangleService.clearPath();
            this.rectangleService.pathData.push(selection.origin);
            this.rectangleService.pathData.push(selection.destination);
            this.rectangleService.drawShape(this.drawingService.previewCtx);
        }
        if (selection.isLasso) this.lassoService.drawPolygon(this.drawingService.previewCtx, selection.origin);

        this.createControlPoints(selection);
    }

    createControlPoints(selection: SelectionTool): void {
        const ctx = this.drawingService.previewCtx;
        const alignmentFactor = -CONTROLPOINTSIZE / 2;
        this.controlPointsCoord = [
            { x: selection.origin.x, y: selection.origin.y },
            { x: selection.destination.x, y: selection.origin.y },
            { x: selection.destination.x, y: selection.destination.y },
            { x: selection.origin.x, y: selection.destination.y },
            { x: selection.origin.x + selection.width / 2, y: selection.origin.y },
            { x: selection.destination.x, y: selection.origin.y + selection.height / 2 },
            { x: selection.origin.x + selection.width / 2, y: selection.destination.y },
            { x: selection.origin.x, y: selection.origin.y + selection.height / 2 },
        ];

        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.fillStyle = '#FFFFFF';

        for (const box of this.controlPointsCoord) {
            box.x += alignmentFactor;
            box.y += alignmentFactor;
            ctx.rect(box.x, box.y, CONTROLPOINTSIZE, CONTROLPOINTSIZE);
        }
        ctx.fill();
        ctx.stroke();
        ctx.closePath();
    }

    clearUnderneathShape(selection: SelectionTool): void {
        this.drawingService.baseCtx.fillStyle = '#FFFFFF';
        this.drawingService.baseCtx.beginPath();
        if (selection.isEllipse) {
            this.drawingService.baseCtx.ellipse(
                selection.origin.x + selection.width / 2,
                selection.origin.y + selection.height / 2,
                selection.width / 2,
                selection.height / 2,
                0,
                2 * Math.PI,
                0,
            );
            this.drawingService.baseCtx.fill();
            this.drawingService.baseCtx.closePath();
        } else if (selection.isLasso) {
            const imageData = selection.clearImageDataPolygon.data;
            let pixelCounter = 0;

            for (let i = selection.origin.y; i < selection.origin.y + selection.height; i++) {
                for (let j = selection.origin.x; j < selection.origin.x + selection.width; j++) {
                    if (imageData[pixelCounter + PIXEL_LENGTH - 1] !== 0) {
                        for (let k = 0; k < PIXEL_LENGTH; k++) {
                            imageData[pixelCounter + k] = MAX_RGB;
                        }
                    }
                    pixelCounter += PIXEL_LENGTH;
                }
            }
            this.lassoService.printPolygon(selection.clearImageDataPolygon, selection);
        } else {
            this.drawingService.baseCtx.fillRect(selection.origin.x, selection.origin.y, selection.width, selection.height);
            this.drawingService.baseCtx.closePath();
        }
    }

    resizeSelection(mouseCoord: Vec2, selection: SelectionTool): void {
        this.resizeSelectionService.onMouseMove(mouseCoord, selection);
        this.drawingService.clearCanvas(this.drawingService.previewCtx);

        if (!this.cleanedUnderneath) {
            this.clearUnderneathShape(selection);
            this.cleanedUnderneath = true;
        }

        this.resizeSelectionService.printResize();
        const origin = selection.origin;
        const width = this.resizeSelectionService.setResizedDimensions().x;
        const height = this.resizeSelectionService.setResizedDimensions().y;
        const destination = { x: origin.x + width, y: origin.y + height };
        const resizedSelection = new SelectionTool(origin, destination, width, height);
        this.createBoundaryBox(resizedSelection);
    }
}
