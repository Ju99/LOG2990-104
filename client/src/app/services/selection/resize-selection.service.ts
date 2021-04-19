import { Injectable } from '@angular/core';
import { SelectionTool } from '@app/classes/selection';
import { Vec2 } from '@app/classes/vec2';
import { CONTROLPOINTSIZE } from '@app/constants';

const OPPOSITE_SIGN = -1;

enum ControlPoints {
    TopLeft = 0,
    TopRight = 1,
    BottomRigth = 2,
    BottomLeft = 3,
    MiddleTop = 4,
    MiddleRight = 5,
    MiddleBottom = 6,
    MiddleLeft = 7,
}

@Injectable({
    providedIn: 'root',
})
export class ResizeSelectionService {
    controlPointsCoord: Vec2[];
    newOrigin: Vec2;
    resizeWidth: number;
    resizeHeight: number;
    shiftKey: boolean;

    private selectionObject: SelectionTool;
    private mouseCoord: Vec2;
    private currentControlPoint: ControlPoints;
    private controlPointsBinding: Map<ControlPoints, () => void>;

    constructor() {
        this.controlPointsBinding = new Map<ControlPoints, () => void>();
        this.controlPointsBinding
            .set(ControlPoints.TopLeft, () => this.resizeTopLeft())
            .set(ControlPoints.TopRight, () => this.resizeTopRight())
            .set(ControlPoints.BottomRigth, () => this.resizeBottomRight())
            .set(ControlPoints.BottomLeft, () => this.resizeBottomLeft())
            .set(ControlPoints.MiddleTop, () => this.resizeMiddleTop())
            .set(ControlPoints.MiddleRight, () => this.resizeMiddleRight())
            .set(ControlPoints.MiddleBottom, () => this.resizeMiddleBottom())
            .set(ControlPoints.MiddleLeft, () => this.resizeMiddleLeft());
        this.shiftKey = false;
    }

    checkIfMouseIsOnControlPoint(mouseCoord: Vec2): boolean {
        for (let i = 0; i < this.controlPointsCoord.length; i++) {
            const boxOrigin = { x: this.controlPointsCoord[i].x, y: this.controlPointsCoord[i].y };
            const boxDestination = { x: this.controlPointsCoord[i].x + CONTROLPOINTSIZE, y: this.controlPointsCoord[i].y + CONTROLPOINTSIZE };
            if (mouseCoord.x >= boxOrigin.x && mouseCoord.y >= boxOrigin.y && mouseCoord.x <= boxDestination.x && mouseCoord.y <= boxDestination.y) {
                this.currentControlPoint = i;
                return true;
            }
        }
        return false;
    }

    onMouseMove(mouseCoord: Vec2, selection: SelectionTool): void {
        this.selectionObject = selection;
        this.mouseCoord = mouseCoord;
        this.controlPointInResize();
    }

    handleKeyDown(event: KeyboardEvent): void {
        if (event.key === 'Shift') {
            event.preventDefault();
            this.shiftKey = true;
        }
    }

    handleKeyUp(event: KeyboardEvent): void {
        if (event.key === 'Shift') {
            event.preventDefault();
            this.shiftKey = false;
        }
    }

    printResize(ctx: CanvasRenderingContext2D): void {
        this.newOrigin = this.selectionObject.origin;
        const canvas = document.createElement('canvas');
        canvas.width = this.selectionObject.width;
        canvas.height = this.selectionObject.height;
        const tmp = canvas.getContext('2d') as CanvasRenderingContext2D;
        tmp.putImageData(this.selectionObject.image, 0, 0);
        ctx.save();
        this.checkForMirroirEffect(ctx, tmp.canvas);
        ctx.restore();
    }

    private controlPointInResize(): void {
        if (this.controlPointsBinding.has(this.currentControlPoint)) {
            const resizeFunction = this.controlPointsBinding.get(this.currentControlPoint);
            if (resizeFunction) resizeFunction();
        }
    }

    private checkForMirroirEffect(ctx: CanvasRenderingContext2D, selectionImage: HTMLCanvasElement): void {
        if (this.resizeHeight < 0 && this.resizeWidth < 0) {
            ctx.scale(OPPOSITE_SIGN, OPPOSITE_SIGN);
            ctx.drawImage(selectionImage, -this.selectionObject.origin.x, -this.selectionObject.origin.y, -this.resizeWidth, -this.resizeHeight);
        } else if (this.resizeWidth < 0 && this.resizeHeight > 0) {
            ctx.scale(OPPOSITE_SIGN, 1);
            ctx.drawImage(selectionImage, -this.selectionObject.origin.x, this.selectionObject.origin.y, -this.resizeWidth, this.resizeHeight);
        } else if (this.resizeHeight < 0 && this.resizeWidth > 0) {
            ctx.scale(1, OPPOSITE_SIGN);
            ctx.drawImage(selectionImage, this.selectionObject.origin.x, -this.selectionObject.origin.y, this.resizeWidth, -this.resizeHeight);
        } else {
            ctx.drawImage(selectionImage, this.selectionObject.origin.x, this.selectionObject.origin.y, this.resizeWidth, this.resizeHeight);
        }
    }

    private resizeTopLeft(): void {
        if (this.shiftKey) {
            // todo
        } else {
            this.selectionObject.origin = this.mouseCoord;
            this.resizeWidth = this.selectionObject.destination.x - this.selectionObject.origin.x;
            this.resizeHeight = this.selectionObject.destination.y - this.selectionObject.origin.y;
        }
    }

    private resizeTopRight(): void {
        if (this.shiftKey) {
            // todo
        } else {
            this.selectionObject.origin.y = this.mouseCoord.y;
            this.resizeWidth = this.mouseCoord.x - this.selectionObject.origin.x;
            this.resizeHeight = this.selectionObject.destination.y - this.mouseCoord.y;
        }
    }

    private resizeBottomRight(): void {
        if (this.shiftKey) {
            this.resizeWidth = this.mouseCoord.x - this.selectionObject.origin.x;
            this.resizeHeight = this.resizeWidth / this.getSelectionRatio();
        } else {
            this.resizeWidth = this.mouseCoord.x - this.selectionObject.origin.x;
            this.resizeHeight = this.mouseCoord.y - this.selectionObject.origin.y;
        }
    }

    private resizeBottomLeft(): void {
        if (this.shiftKey) {
            // todo
        } else {
            this.selectionObject.origin.x = this.mouseCoord.x;
            this.resizeWidth = this.selectionObject.destination.x - this.mouseCoord.x;
            this.resizeHeight = this.mouseCoord.y - this.selectionObject.origin.y;
        }
    }

    private resizeMiddleTop(): void {
        this.selectionObject.origin.y = this.mouseCoord.y;
        this.resizeWidth = this.selectionObject.width;
        this.resizeHeight = this.selectionObject.destination.y - this.mouseCoord.y;
    }

    private resizeMiddleRight(): void {
        this.resizeWidth = this.mouseCoord.x - this.selectionObject.origin.x;
        this.resizeHeight = this.selectionObject.height;
    }

    private resizeMiddleBottom(): void {
        this.resizeWidth = this.selectionObject.width;
        this.resizeHeight = this.mouseCoord.y - this.selectionObject.origin.y;
    }

    private resizeMiddleLeft(): void {
        this.selectionObject.origin.x = this.mouseCoord.x;
        this.resizeWidth = this.selectionObject.destination.x - this.mouseCoord.x;
        this.resizeHeight = this.selectionObject.height;
    }

    private getSelectionRatio(): number {
        return this.selectionObject.width / this.selectionObject.height;
    }
}
