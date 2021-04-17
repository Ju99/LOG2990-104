import { Injectable } from '@angular/core';
import { Utils } from '@app/classes/math-utils';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { CONTROLPOINTSIZE, MouseButton } from '@app/constants';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { RectangleService } from '@app/services/tools//rectangle/rectangle.service';
import { EllipseService } from '@app/services/tools/ellipse/ellipse.service';
import { LassoService } from '@app/services/tools/lasso/lasso.service';

// tslint:disable
const SELECTION_DEFAULT_LINE_THICKNESS = 3;
const PIXEL_LENGTH = 4;
const MAX_RGB = 255;

@Injectable({
    providedIn: 'root',
})
export class SelectionService extends Tool {
    selection: ImageData;
    origin: Vec2;
    destination: Vec2;
    isEllipse: boolean;
    isLasso: boolean;
    activeSelection: boolean;
    newSelection: boolean;
    initialSelection: boolean;
    imageMoved: boolean;
    clearUnderneath: boolean;
    selectionTerminated: boolean;
    selectionDeleted: boolean;
    width: number;
    height: number;
    private controlPointsCoord: Vec2[];
    private previousLineWidthRectangle: number;
    private previousLineWidthEllipse: number;
    private clearSelectionData: ImageData;

    constructor(
        public drawingService: DrawingService,
        private rectangleService: RectangleService,
        private ellipseService: EllipseService,
        public lassoService: LassoService,
    ) {
        super(drawingService);
        this.isEllipse = false;
        this.isLasso = false;
        this.activeSelection = false;
        this.newSelection = true;
        this.initialSelection = true;
        this.imageMoved = false;
        this.clearUnderneath = true;
        this.selectionTerminated = false;
        this.selectionDeleted = false;
    }

    onMouseClick(event: MouseEvent): void {
        if (this.isLasso && !this.lassoService.selectionOver && this.newSelection) {
            this.selectionTerminated = false;
            this.lassoService.onMouseClick(event);
        }
    }

    onMouseDown(event: MouseEvent): void {
        this.mouseDown = event.button === MouseButton.Left;

        if (this.mouseDown && !this.isLasso) {
            this.initialSelection = true;
            this.clearUnderneath = true;
            this.selectionTerminated = false;

            this.initializeToolParameters();
            this.printMovedSelection(this.drawingService.baseCtx);
            this.selectionDeleted = false;

            if (this.isEllipse) this.ellipseService.onMouseDown(event);
            else this.rectangleService.onMouseDown(event);
        }

        if (this.isLasso && this.newSelection && this.activeSelection) {
            this.lassoService.selectionOver = false;
            this.terminateSelection();
        }
    }

    onMouseMove(event: MouseEvent): void {
        if (this.isLasso && !this.lassoService.selectionOver) this.lassoService.onMouseMove(event);

        if (this.mouseDown) {
            if (this.isEllipse) this.ellipseService.onMouseMove(event);
            else this.rectangleService.onMouseMove(event);
        }

        if (this.activeSelection && !this.selectionTerminated) {
            if (this.mouseInSelectionArea(this.origin, this.destination, this.getPositionFromMouse(event))) {
                this.newSelection = false;
            } else {
                this.newSelection = true;
            }
        }
        
    }

    onMouseUp(event: MouseEvent): void {
        if (this.isLasso && !this.lassoService.selectionOver) this.lassoService.onMouseUp(event);

        if (this.lassoService.selectionOver) {
            this.activeSelection = true;
            this.initialSelection = true;
            this.clearUnderneath = true;
            this.getSelectionData(this.drawingService.baseCtx);
            this.createBoundaryBox();
        }

        if (this.mouseDown && !this.isLasso) {
            this.activeSelection = true;
            this.mouseDown = false;
            this.getSelectionData(this.drawingService.baseCtx);
            this.createControlPoints();
            this.resetParametersTools();
        }
    }

    onMouseLeave(event: MouseEvent): void {
        if (this.mouseDown && !this.isLasso) this.onMouseUp(event);
    }

    handleKeyDown(event: KeyboardEvent): void {
        if (event.key === 'Escape') {
            event.preventDefault();
            this.terminateSelection();
            return;
        }

        if (this.isEllipse) this.ellipseService.handleKeyDown(event);
        else if (this.isLasso) this.lassoService.handleKeyDown(event);
        else this.rectangleService.handleKeyDown(event);
    }

    handleKeyUp(event: KeyboardEvent): void {
        if (this.isEllipse) this.ellipseService.handleKeyUp(event);
        else if (this.isLasso) this.lassoService.handleKeyUp(event);
        else this.rectangleService.handleKeyUp(event);
    }

    mouseInSelectionArea(origin: Vec2, destination: Vec2, mouseCoord: Vec2): boolean {
        return mouseCoord.x >= origin.x && mouseCoord.x <= destination.x && mouseCoord.y >= origin.y && mouseCoord.y <= destination.y;
    }

    selectAll(): void {
        this.activeSelection = true;
        this.newSelection = true;
        this.initialSelection = true;
        this.clearUnderneath = true;
        this.selectionTerminated = false;
        this.origin = { x: 0, y: 0 };
        this.destination = { x: this.drawingService.canvas.width, y: this.drawingService.canvas.height };
        this.width = this.destination.x;
        this.height = this.destination.y;

        this.printMovedSelection(this.drawingService.baseCtx);
        this.selection = this.drawingService.baseCtx.getImageData(this.origin.x, this.origin.y, this.destination.x, this.destination.y);
        this.createBoundaryBox();
    }

    createBoundaryBox(): void {
        this.initializeToolParameters();
        if (this.isEllipse) {
            this.ellipseService.clearPath();
            this.ellipseService.pathData.push(this.origin);
            this.ellipseService.pathData.push(this.destination);
            this.ellipseService.drawShape(this.drawingService.previewCtx);
        } else {
            this.rectangleService.clearPath();
            this.rectangleService.pathData.push(this.origin);
            this.rectangleService.pathData.push(this.destination);
            this.rectangleService.drawShape(this.drawingService.previewCtx);
        }
        if (this.isLasso) this.lassoService.drawPolygon(this.drawingService.previewCtx, this.origin);

        this.createControlPoints();
    }

    createControlPoints(): void {
        const ctx = this.drawingService.previewCtx;
        const alignmentFactor = -CONTROLPOINTSIZE / 2;
        this.controlPointsCoord = [
            { x: this.origin.x, y: this.origin.y },
            { x: this.destination.x, y: this.origin.y },
            { x: this.destination.x, y: this.destination.y },
            { x: this.origin.x, y: this.destination.y },
            { x: this.origin.x + this.width / 2, y: this.origin.y },
            { x: this.destination.x, y: this.origin.y + this.height / 2 },
            { x: this.origin.x + this.width / 2, y: this.destination.y },
            { x: this.origin.x, y: this.origin.y + this.height / 2 },
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

    clearUnderneathShape(): void {
        this.drawingService.baseCtx.fillStyle = '#FFFFFF';
        if (this.isEllipse) {
            this.drawingService.baseCtx.beginPath();
            this.drawingService.baseCtx.ellipse(
                this.origin.x + this.width / 2,
                this.origin.y + this.height / 2,
                this.width / 2,
                this.height / 2,
                0,
                2 * Math.PI,
                0,
            );
            this.drawingService.baseCtx.fill();
            this.drawingService.baseCtx.closePath();
        } else if (this.isLasso) {
            const imageData = this.clearSelectionData.data;
            let pixelCounter = 0;

            for (let i = this.origin.y; i < this.origin.y + this.height; i++) {
                for (let j = this.origin.x; j < this.origin.x + this.width; j++) {
                    if (imageData[pixelCounter + PIXEL_LENGTH - 1] !== 0) {
                        for (let k = 0; k < PIXEL_LENGTH; k++) {
                            imageData[pixelCounter + k] = MAX_RGB;
                        }
                    }
                    pixelCounter += PIXEL_LENGTH;
                }
            }
            this.printPolygon(this.clearSelectionData);
        } else {
            this.drawingService.baseCtx.fillRect(this.origin.x, this.origin.y, this.width, this.height);
            this.drawingService.baseCtx.closePath();
        }
    }

    terminateSelection(): void {
        if (this.activeSelection) {
            if (!this.selectionDeleted) {
                this.imageMoved = true;

                this.printMovedSelection(this.drawingService.baseCtx);
            }
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.resetParametersTools();
            this.lassoService.selectionOver = false;
            this.lassoService.resetAttributes();

            this.activeSelection = false;
            this.newSelection = true;
            this.imageMoved = false;
            this.selectionTerminated = true;
            this.mouseDown = false;
        }
    }

    printMovedSelection(ctx: CanvasRenderingContext2D): void {
        if (this.imageMoved) {
            this.imageMoved = false;
            if (this.isEllipse) this.printEllipse(this.drawingService.baseCtx);
            else if (this.isLasso) {
                this.printPolygon(this.selection);
            } else this.drawingService.baseCtx.putImageData(this.selection, this.origin.x, this.origin.y);
        }
    }

    private calculateDimension(): void {
        if (this.isEllipse) {
            this.origin = this.ellipseService.pathData[0];
            this.destination = this.ellipseService.pathData[this.ellipseService.pathData.length - 1];
        } else if (this.isLasso) {
            this.origin = Utils.findMinCoord(this.lassoService.polygonCoords);
            this.destination = Utils.findMaxCoord(this.lassoService.polygonCoords);
        } else {
            this.origin = this.rectangleService.pathData[0];
            this.destination = this.rectangleService.pathData[this.rectangleService.pathData.length - 1];
        }
        this.width = this.destination.x - this.origin.x;
        this.height = this.destination.y - this.origin.y;
        this.reajustOriginAndDestination();
    }

    private getSelectionData(ctx: CanvasRenderingContext2D): void {
        this.calculateDimension();
        this.selection = ctx.getImageData(this.origin.x, this.origin.y, this.width, this.height);
        this.clearSelectionData = ctx.getImageData(this.origin.x, this.origin.y, this.width, this.height);
        if (this.isEllipse) {
            this.checkPixelInEllipse();
        } else if (this.isLasso) {
            this.checkPixelInPolygon();
        }
    }

    private checkPixelInEllipse(): void {
        const imageData = this.selection.data;
        let pixelCounter = 0;

        for (let i = 0; i < this.height; i++) {
            for (let j = 0; j < this.width; j++) {
                const rectangleCenter = { x: this.width / 2, y: this.height / 2 };
                const x = j - rectangleCenter.x;
                const y = i - rectangleCenter.y;

                if (this.ellipseService.isShiftShape && Math.pow(x, 2) + Math.pow(y, 2) > Math.pow(this.width / 2, 2)) {
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
    }

    private checkPixelInPolygon(): void {
        const imageData = this.selection.data;
        let pixelCounter = 0;

        for (let i = this.origin.y; i < this.origin.y + this.height; i++) {
            for (let j = this.origin.x; j < this.origin.x + this.width; j++) {
                if (!Utils.pointInPolygon({ x: j, y: i }, this.lassoService.polygonCoords)) {
                    imageData[pixelCounter + PIXEL_LENGTH - 1] = 0;
                }
                pixelCounter += PIXEL_LENGTH;
            }
        }
    }

    private printEllipse(ctx: CanvasRenderingContext2D): void {
        const canvas = document.createElement('canvas');
        canvas.width = this.width;
        canvas.height = this.height;
        const tmp = canvas.getContext('2d') as CanvasRenderingContext2D;
        tmp.putImageData(this.selection, 0, 0);
        this.drawingService.baseCtx.ellipse(
            this.origin.x + this.width / 2,
            this.origin.y + this.height / 2,
            this.width / 2,
            this.height / 2,
            0,
            2 * Math.PI,
            0,
        );
        this.drawingService.baseCtx.save();
        this.drawingService.baseCtx.clip();
        ctx.drawImage(tmp.canvas, this.origin.x, this.origin.y);
        this.drawingService.baseCtx.restore();
    }

    private printPolygon(imageData: ImageData): void {
        const canvas = document.createElement('canvas');
        canvas.width = this.width;
        canvas.height = this.height;
        const tmp = canvas.getContext('2d') as CanvasRenderingContext2D;
        tmp.putImageData(imageData, 0, 0);
        this.drawingService.baseCtx.save();
        this.drawingService.baseCtx.clip(this.lassoService.calculatePath2d());

        this.drawingService.baseCtx.drawImage(tmp.canvas, this.origin.x, this.origin.y);
        this.drawingService.baseCtx.restore();
    }

    private reajustOriginAndDestination(): void {
        let temp: Vec2;
        if (this.width <= 0 && this.height <= 0) {
            temp = this.origin;
            this.origin = this.destination;
            this.destination = temp;
        } else if (this.width <= 0) {
            this.origin.x += this.width;
            this.destination.x += Math.abs(this.width);
        } else if (this.height <= 0) {
            this.origin.y += this.height;
            this.destination.y += Math.abs(this.height);
        }

        this.width = Math.abs(this.width);
        this.height = Math.abs(this.height);
    }

    private initializeToolParameters(): void {
        this.previousLineWidthRectangle = this.rectangleService.lineWidth;
        this.previousLineWidthEllipse = this.ellipseService.lineWidth;
        this.rectangleService.isSelection = true;
        this.ellipseService.isSelection = true;
        this.rectangleService.lineWidth = SELECTION_DEFAULT_LINE_THICKNESS;
        this.ellipseService.lineWidth = SELECTION_DEFAULT_LINE_THICKNESS;

        this.drawingService.previewCtx.setLineDash([2]);
    }

    private resetParametersTools(): void {
        this.rectangleService.mouseDown = false;
        this.rectangleService.lineWidth = this.previousLineWidthRectangle;
        this.ellipseService.mouseDown = false;
        this.ellipseService.lineWidth = this.previousLineWidthEllipse;
        this.drawingService.previewCtx.setLineDash([0]);
        this.rectangleService.isSelection = false;
        this.ellipseService.isSelection = false;
    }

    
}
