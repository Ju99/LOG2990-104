import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { DEFAULT_LINE_THICKNESS, MouseButton } from '@app/constants';
import { ColorOrder } from '@app/interfaces-enums/color-order';
import { TypeStyle } from '@app/interfaces-enums/type-style';
import { ColorManagerService } from '@app/services/color-manager/color-manager.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
export abstract class ShapeService extends Tool {
    pathData: Vec2[];
    lineWidth: number;
    selectType: TypeStyle;
    isSelection: boolean;
    isShiftShape: boolean;
    protected fillValue: boolean;
    protected strokeValue: boolean;
    protected size: Vec2;
    protected origin: Vec2;
    colorPrime: string;
    colorSecond: string;

    constructor(drawingService: DrawingService, protected colorManager: ColorManagerService) {
        super(drawingService);
        this.lineWidth = DEFAULT_LINE_THICKNESS;
        this.fillValue = false;
        this.strokeValue = false;
        this.isSelection = false;
        this.selectType = TypeStyle.Stroke;
        this.changeType();
        this.clearPath();
        this.isShiftShape = false;
        this.size = { x: 0, y: 0 };
    }

    changeType(): void {
        switch (this.selectType) {
            case TypeStyle.Stroke:
                this.fillValue = false;
                this.strokeValue = true;
                break;
            case TypeStyle.Fill:
                this.fillValue = true;
                this.strokeValue = false;
                break;
            case TypeStyle.StrokeFill:
                this.fillValue = true;
                this.strokeValue = true;
                break;
        }
    }

    clearPath(): void {
        this.pathData = [];
    }

    onMouseDown(event: MouseEvent): void {
        this.mouseDown = event.button === MouseButton.Left;
        if (this.mouseDown) {
            this.clearPath();
            this.mouseDownCoord = this.getPositionFromMouse(event);
            this.pathData.push(this.mouseDownCoord);
        }
        this.colorPrime = this.colorManager.selectedColor[ColorOrder.PrimaryColor].inString;
        this.colorSecond = this.colorManager.selectedColor[ColorOrder.SecondaryColor].inString;
    }

    abstract onMouseUp(event: MouseEvent): void;

    abstract onMouseMove(event: MouseEvent): void;

    handleKeyDown(event: KeyboardEvent): void {
        if (event.key === 'Shift' && this.mouseDown) {
            this.isShiftShape = true;
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.drawShape(this.drawingService.previewCtx);
        }
    }

    handleKeyUp(event: KeyboardEvent): void {
        if (event.key === 'Shift') {
            this.isShiftShape = false;
            if (this.mouseDown) {
                this.drawingService.clearCanvas(this.drawingService.previewCtx);
                this.drawShape(this.drawingService.previewCtx);
            }
        }
    }

    abstract drawShape(ctx: CanvasRenderingContext2D, isAnotherShapeBorder?: boolean): void;

    protected updateBorderType(ctx: CanvasRenderingContext2D): void {
        const filling = this.colorManager.selectedColor[ColorOrder.PrimaryColor].inString;
        const contouring = this.colorManager.selectedColor[ColorOrder.SecondaryColor].inString;

        if (this.isSelection) {
            ctx.strokeStyle = 'rgb(116, 113, 113)';
            ctx.fillStyle = 'rgba(116, 113, 113, 0)';
            ctx.fill();
            ctx.stroke();
            return;
        }
        if (this.strokeValue) {
            ctx.strokeStyle = contouring;
            ctx.fillStyle = 'rgba(255, 0, 0, 0)';
            ctx.fill();
            ctx.stroke();
        }
        if (this.fillValue) {
            ctx.fillStyle = filling;
            ctx.strokeStyle = 'rgba(255, 0, 0, 0)';
            ctx.fill();
            ctx.stroke();
        }
        if (this.fillValue && this.strokeValue) {
            ctx.fillStyle = filling;
            ctx.strokeStyle = contouring;
            ctx.fill();
            ctx.stroke();
        }
    }

    protected findMouseDirection(): void {
        const width = this.pathData[this.pathData.length - 1].x - this.pathData[0].x;
        const height = this.pathData[this.pathData.length - 1].y - this.pathData[0].y;
        if (width <= 0 && height >= 0) {
            this.lowerLeft(this.pathData);
        } else if (height <= 0 && width >= 0) {
            this.upperRight(this.pathData);
        } else if (height <= 0 && width <= 0) {
            this.upperLeft(this.pathData);
        } else {
            this.lowerRight(this.pathData);
        }
    }

    abstract lowerLeft(path: Vec2[]): void;
    abstract upperLeft(path: Vec2[]): void;
    abstract upperRight(path: Vec2[]): void;
    abstract lowerRight(path: Vec2[]): void;

    protected computeSize(): void {
        if (this.pathData.length > 0) {
            this.size.x = this.pathData[this.pathData.length - 1].x - this.pathData[0].x;
            this.size.y = this.pathData[this.pathData.length - 1].y - this.pathData[0].y;
            this.size.x = Math.abs(this.size.x);
            this.size.y = Math.abs(this.size.y);
        } else {
            throw new Error('No data in path');
        }
    }
    protected calculLeftpoint(startPoint: Vec2, endPoint: Vec2): Vec2 {
        let x = startPoint.x;
        let y = startPoint.y;

        if (startPoint.x >= endPoint.x && startPoint.y >= endPoint.y) {
            x = endPoint.x;
            y = endPoint.y;
        } else if (startPoint.x > endPoint.x && startPoint.y < endPoint.y) {
            x = endPoint.x;
            y = startPoint.y;
        } else if (startPoint.x < endPoint.x && startPoint.y > endPoint.y) {
            x = startPoint.x;
            y = endPoint.y;
        }
        return { x, y };
    }
}
