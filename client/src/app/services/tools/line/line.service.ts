import { Injectable } from '@angular/core';
import { DrawingContextStyle } from '@app/classes/drawing-context-styles';
import { Line } from '@app/classes/line';
import { Utils } from '@app/classes/math-utils';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { DEFAULT_JUNCTION_RADIUS, DEFAULT_LINE_THICKNESS, MouseButton, TypeOfJunctions } from '@app/constants';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { ColorOrder } from 'src/app/interfaces-enums/color-order';
import { ColorManagerService } from 'src/app/services/color-manager/color-manager.service';

const SECOND_LAST_INDEX = -2;
const LINE_RADIUS = 5;

@Injectable({
    providedIn: 'root',
})
export class LineService extends Tool {
    currentSegment: Vec2[];
    closestPoint: Vec2 | undefined;
    basePoint: Vec2;
    line: Line;
    lineWidth: number;
    junctionType: TypeOfJunctions;
    junctionRadius: number;
    pointJoin: boolean;
    private coordinates: Vec2[];
    private hasPressedShiftKey: boolean;
    private lastCanvasImages: ImageData[];

    constructor(drawingService: DrawingService, private colorManager: ColorManagerService, private undoRedoService: UndoRedoService) {
        super(drawingService);
        this.lineWidth = DEFAULT_LINE_THICKNESS;
        this.junctionRadius = DEFAULT_JUNCTION_RADIUS;
        this.junctionType = TypeOfJunctions.Regular;
        this.coordinates = [];
        this.lastCanvasImages = [];
        this.currentSegment = [];
        this.hasPressedShiftKey = false;
        this.pointJoin = false;
    }

    onMouseClick(event: MouseEvent): void {
        this.mouseDown = event.button === MouseButton.Left;
        this.mouseDownCoord = this.getPositionFromMouse(event);
        this.coordinates.push(this.mouseDownCoord);

        if (this.hasPressedShiftKey) {
            this.closestPoint = this.calculatePosition(this.mouseDownCoord, this.basePoint);
            if (this.closestPoint) {
                this.coordinates.push(this.closestPoint);
                if (this.junctionType === TypeOfJunctions.Circle) this.drawPoint(this.drawingService.baseCtx, this.closestPoint);
            }
        } else {
            this.currentSegment.push(this.mouseDownCoord);
            if (this.junctionType === TypeOfJunctions.Circle) this.drawPoint(this.drawingService.baseCtx, this.mouseDownCoord);
        }
    }

    onMouseDoubleClick(event: MouseEvent): void {
        this.clearPath();
        this.mouseDown = false;

        const color = this.colorManager.selectedColor[ColorOrder.PrimaryColor].inString;
        const line = new Line(this.coordinates, color, 1, LINE_RADIUS, this.mouseDown);
        this.undoRedoService.addToStack(line);
        this.undoRedoService.setToolInUse(false);
        this.coordinates = [];
    }

    onMouseUp(event: MouseEvent): void {
        const mousePosition = this.getPositionFromMouse(event);
        const styles: DrawingContextStyle = {
            strokeStyle: this.colorManager.selectedColor[ColorOrder.PrimaryColor].inString,
            fillStyle: this.colorManager.selectedColor[ColorOrder.PrimaryColor].inString,
            lineWidth: this.lineWidth,
        };

        if (this.mouseDown) {
            if (!this.hasPressedShiftKey) {
                this.currentSegment.push(mousePosition);
                this.drawLine(this.drawingService.baseCtx, this.currentSegment, styles);
            } else {
                this.drawConstrainedLine(this.drawingService.baseCtx, this.coordinates, styles, event);
            }
        }
        this.getCanvasState();
        this.mouseDown = false;
        this.clearPath();
    }

    onMouseMove(event: MouseEvent): void {
        const mousePosition = this.getPositionFromMouse(event);
        const styles: DrawingContextStyle = {
            strokeStyle: this.colorManager.selectedColor[ColorOrder.PrimaryColor].inString,
            fillStyle: this.colorManager.selectedColor[ColorOrder.PrimaryColor].inString,
            lineWidth: this.lineWidth,
        };

        if (this.mouseDown) {
            this.currentSegment.push(mousePosition);
            this.drawingService.clearCanvas(this.drawingService.previewCtx);

            if (this.hasPressedShiftKey) {
                this.drawConstrainedLine(this.drawingService.previewCtx, this.coordinates, styles, event);
            } else {
                this.drawLine(this.drawingService.previewCtx, this.currentSegment, styles);
            }
        }
    }

    handleKeyDown(event: KeyboardEvent): void {
        event.preventDefault();
        switch (event.key) {
            case 'Escape':
                this.drawingService.clearCanvas(this.drawingService.previewCtx);
                this.mouseDown = false;
                break;
            case 'Shift':
                this.hasPressedShiftKey = true;
                break;
            case 'Backspace':
                // We use the second last index to get the canvas state just before last stroked line
                this.drawingService.baseCtx.putImageData(this.lastCanvasImages[this.lastCanvasImages.length + SECOND_LAST_INDEX], 0, 0);
                break;
        }
    }

    handleKeyUp(event: KeyboardEvent): void {
        if (event.key === 'Shift') {
            this.hasPressedShiftKey = false;
        }
    }

    calculatePosition(currentPoint: Vec2, basePoint: Vec2): Vec2 | undefined {
        if (!currentPoint || !basePoint) {
            return undefined;
        }
        return Utils.getNearestPoint(currentPoint, basePoint);
    }

    drawLine(ctx: CanvasRenderingContext2D, path: Vec2[], styles: DrawingContextStyle): void {
        ctx.lineWidth = styles.lineWidth;
        ctx.strokeStyle = styles.strokeStyle;
        ctx.beginPath();
        ctx.moveTo(path[0].x, path[0].y);
        ctx.lineTo(path[path.length - 1].x, path[path.length - 1].y);
        ctx.stroke();
    }

    drawConstrainedLine(ctx: CanvasRenderingContext2D, path: Vec2[], styles: DrawingContextStyle, event: MouseEvent): void {
        const mousePosition = this.getPositionFromMouse(event);
        this.basePoint = path[path.length - 1];
        this.closestPoint = this.calculatePosition(mousePosition, this.basePoint);
        ctx.lineWidth = styles.lineWidth;
        ctx.strokeStyle = styles.strokeStyle;
        ctx.beginPath();
        if (this.closestPoint) {
            ctx.moveTo(this.basePoint.x, this.basePoint.y);
            ctx.lineTo(this.closestPoint.x, this.closestPoint.y);
            ctx.stroke();
        }
    }

    private drawPoint(ctx: CanvasRenderingContext2D, position: Vec2): void {
        const color = this.colorManager.selectedColor[ColorOrder.PrimaryColor].inString;
        ctx.fillStyle = color;
        ctx.lineWidth = this.lineWidth;
        ctx.beginPath();
        ctx.arc(position.x, position.y, this.junctionRadius, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.fill();
    }

    private getCanvasState(): void {
        if (this.currentSegment) {
            this.lastCanvasImages.push(
                this.drawingService.baseCtx.getImageData(0, 0, this.drawingService.canvas.width, this.drawingService.canvas.height),
            );
        }
    }

    private clearPath(): void {
        this.currentSegment = [];
    }
}
