import { Injectable, OnDestroy } from '@angular/core';
import { SelectionTool } from '@app/classes/selection';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { MouseButton } from '@app/constants';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { MagnetismService } from '@app/services/selection/magnetism.service';
import { SelectionService } from '@app/services/tools/selection/selection.service';
import { SelectionUtilsService } from '@app/services/utils/selection-utils.service';
import { ResizeSelectionService } from './resize-selection.service';

const DX = 3;
const DY = 3;
const LONG_DELAY = 500;
const SHORT_DELAY = 100;

enum ArrowKeys {
    Up = 1,
    Down = 2,
    Left = 3,
    Right = 4,
}

@Injectable({
    providedIn: 'root',
})
export class MoveSelectionService extends Tool implements OnDestroy {
    isMagnetism: boolean;
    private selectionObject: SelectionTool;
    private initialMousePosition: Vec2;
    private origin: Vec2;
    private newOrigin: Vec2;
    private destination: Vec2;
    private selectionData: ImageData;
    private keysDown: Map<ArrowKeys, boolean>;
    private intervalId: ReturnType<typeof setTimeout> | undefined;

    constructor(
        drawingService: DrawingService,
        private selectionService: SelectionService,
        private magnetismService: MagnetismService,
        private resizeSelectionService: ResizeSelectionService,
        private selectionUtilsService: SelectionUtilsService,
    ) {
        super(drawingService);
        this.isMagnetism = false;
        this.keysDown = new Map<ArrowKeys, boolean>();
        this.keysDown.set(ArrowKeys.Up, false).set(ArrowKeys.Down, false).set(ArrowKeys.Left, false).set(ArrowKeys.Right, false);
        this.intervalId = undefined;
    }

    ngOnDestroy(): void {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
    }

    enableMagnetism(isChecked: boolean): void {
        this.isMagnetism = isChecked;
    }

    onMouseDown(event: MouseEvent): void {
        this.mouseDown = event.button === MouseButton.Left;

        if (this.mouseDown && !this.selectionService.selectionTerminated) {
            this.initialMousePosition = this.getPositionFromMouse(event);
            this.resizeSelectionService.controlPointsCoord = this.selectionUtilsService.controlPointsCoord;
            this.selectionUtilsService.isResizing = this.resizeSelectionService.checkIfMouseIsOnControlPoint(this.getPositionFromMouse(event));
        }
    }

    onMouseMove(event: MouseEvent): void {
        if (this.mouseDown && !this.selectionService.selectionTerminated) {
            if (this.selectionUtilsService.isResizing) {
                this.selectionUtilsService.resizeSelection(this.drawingService.previewCtx, this.getPositionFromMouse(event), this.selectionObject);
                return;
            }
            this.selectionService.imageMoved = true;
            this.mouseDownCoord = this.getPositionFromMouse(event);
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.moveSelectionMouse(this.drawingService.previewCtx);
            this.clearUnderneathShape();
            return;
        }

        this.handleSelectionWhenNotTerminatedOnMouseMove(event);
    }

    onMouseUp(event: MouseEvent): void {
        if (this.mouseDown) {
            this.mouseDown = false;
            if (this.selectionUtilsService.isResizing) {
                this.handleResizedSelectionOnMouseUp();
                return;
            }
            this.origin = this.newOrigin;
            this.destination = { x: this.origin.x + this.selectionData.width, y: this.origin.y + this.selectionData.height };
            this.selectionService.selection = this.selectionData;
            this.selectionService.origin = this.origin;
            this.selectionService.destination = this.destination;

            this.selectionObject.origin = this.origin;
            this.selectionObject.destination = this.destination;
            this.selectionUtilsService.createBoundaryBox(this.selectionObject);
        }
    }

    handleKeyDown(event: KeyboardEvent): void {
        if (event.key === 'Escape') {
            event.preventDefault();
            this.selectionService.terminateSelection();
            this.mouseDown = false;
        }

        if (this.selectionService.activeSelection) {
            if (event.key === 'ArrowLeft' || event.key === 'ArrowRight' || event.key === 'ArrowUp' || event.key === 'ArrowDown') {
                event.preventDefault();
                if (this.isArrowPressed()) {
                    this.handleKeyDownArrow(event);
                    return;
                }

                this.handleKeyDownArrow(event);
                this.initialSelection();
                this.moveSelectionKeyboard(this.drawingService.previewCtx);

                setTimeout(() => {
                    if (this.isArrowPressed()) {
                        this.intervalId = setInterval(() => {
                            this.moveSelectionKeyboard(this.drawingService.previewCtx);
                        }, SHORT_DELAY);
                    }
                }, LONG_DELAY);
            }
        }
    }

    handleKeyUp(event: KeyboardEvent): void {
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight' || event.key === 'ArrowUp' || event.key === 'ArrowDown') {
            event.preventDefault();
            this.handleKeyUpArrow(event);

            if (this.intervalId) {
                if (!this.isArrowPressed()) {
                    clearInterval(this.intervalId);
                    this.intervalId = undefined;
                }
            }

            this.selectionService.selection = this.selectionData;
            this.selectionService.origin = this.origin;
            this.selectionService.destination = { x: this.origin.x + this.selectionData.width, y: this.origin.y + this.selectionData.height };

            this.selectionObject.origin = this.origin;
            this.selectionObject.destination = { x: this.origin.x + this.selectionData.width, y: this.origin.y + this.selectionData.height };
            this.selectionUtilsService.createBoundaryBox(this.selectionObject);
        }
    }

    private handleSelectionWhenNotTerminatedOnMouseMove(event: MouseEvent): void {
        this.initialSelection();
        if (!this.selectionService.selectionTerminated) {
            if (this.selectionUtilsService.mouseInSelectionArea(this.origin, this.destination, this.getPositionFromMouse(event))) {
                this.selectionService.newSelection = false;
            } else {
                this.selectionService.newSelection = true;
            }
        }
    }

    private handleResizedSelectionOnMouseUp(): void {
        this.selectionService.imageMoved = true;
        this.selectionObject = this.selectionUtilsService.endResizeSelection();
        this.selectionService.selectionObject = this.selectionObject;
        this.selectionService.initialiseServiceDimensions();
        this.selectionService.getSelectionData(this.drawingService.previewCtx);
        this.selectionUtilsService.createBoundaryBox(this.selectionObject);
        this.origin = this.selectionObject.origin;
        this.destination = this.selectionObject.destination;
        this.selectionData = this.selectionService.selection;
    }

    private moveSelectionMouse(ctx: CanvasRenderingContext2D): void {
        this.initialSelection();
        const distanceX: number = this.mouseDownCoord.x - this.initialMousePosition.x;
        const distanceY: number = this.mouseDownCoord.y - this.initialMousePosition.y;
        this.newOrigin = { x: this.origin.x + distanceX, y: this.origin.y + distanceY };

        if (this.isMagnetism) {
            this.newOrigin = this.magnetismService.activateMagnetism(this.newOrigin, this.selectionService.height, this.selectionService.width);
        }
        ctx.putImageData(this.selectionData, this.newOrigin.x, this.newOrigin.y);
    }

    private moveSelectionKeyboard(ctx: CanvasRenderingContext2D): void {
        let pixelShiftX = DX;
        let pixelShiftY = DY;

        this.newOrigin = this.selectionService.origin;

        if (this.isMagnetism) {
            pixelShiftX = this.magnetismService.squareSize;
            pixelShiftY = this.magnetismService.squareSize;
        }

        if (this.keysDown.get(ArrowKeys.Right)) {
            this.newOrigin.x += pixelShiftX;
        }
        if (this.keysDown.get(ArrowKeys.Left)) {
            this.newOrigin.x -= pixelShiftX;
        }
        if (this.keysDown.get(ArrowKeys.Down)) {
            this.newOrigin.y += pixelShiftY;
        }
        if (this.keysDown.get(ArrowKeys.Up)) {
            this.newOrigin.y -= pixelShiftY;
        }

        this.clearUnderneathShape();
        this.drawingService.clearCanvas(ctx);
        if (this.isMagnetism) {
            this.newOrigin = this.magnetismService.activateMagnetism(this.newOrigin, this.selectionService.height, this.selectionService.width);
        }
        ctx.putImageData(this.selectionData, this.newOrigin.x, this.newOrigin.y);
        this.selectionData = ctx.getImageData(this.newOrigin.x, this.newOrigin.y, this.selectionData.width, this.selectionData.height);
        this.origin = this.newOrigin;
    }

    private initialSelection(): void {
        if (this.selectionService.initialSelection) {
            this.selectionObject = this.selectionService.selectionObject;
            this.origin = this.selectionService.origin;
            this.destination = this.selectionService.destination;
            this.selectionData = this.selectionService.selection;
            this.selectionService.initialSelection = false;
        }
    }

    private clearUnderneathShape(): void {
        if (this.selectionService.clearUnderneath) {
            this.selectionObject.origin = this.origin;
            this.selectionUtilsService.clearUnderneathShape(this.selectionObject);
            this.selectionService.clearUnderneath = false;
        }
    }

    private handleKeyUpArrow(event: KeyboardEvent): void {
        switch (event.key) {
            case 'ArrowUp':
                this.keysDown.set(ArrowKeys.Up, false);
                break;
            case 'ArrowDown':
                this.keysDown.set(ArrowKeys.Down, false);
                break;
            case 'ArrowLeft':
                this.keysDown.set(ArrowKeys.Left, false);
                break;
            case 'ArrowRight':
                this.keysDown.set(ArrowKeys.Right, false);
                break;
        }
    }

    private handleKeyDownArrow(event: KeyboardEvent): void {
        switch (event.key) {
            case 'ArrowUp':
                this.keysDown.set(ArrowKeys.Up, true);
                break;
            case 'ArrowDown':
                this.keysDown.set(ArrowKeys.Down, true);
                break;
            case 'ArrowLeft':
                this.keysDown.set(ArrowKeys.Left, true);
                break;
            case 'ArrowRight':
                this.keysDown.set(ArrowKeys.Right, true);
                break;
        }
    }

    private isArrowPressed(): boolean {
        for (const [key] of this.keysDown) {
            if (this.keysDown.get(key)) {
                return true;
            }
        }
        return false;
    }
}
