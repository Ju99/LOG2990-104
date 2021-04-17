import { Injectable, OnDestroy } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { MouseButton } from '@app/constants';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { MagnetismService } from '@app/services/selection/magnetism.service';
import { SelectionService } from '@app/services/tools/selection/selection.service';

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
    private initialMousePosition: Vec2;
    private origin: Vec2;
    private newOrigin: Vec2;
    private destination: Vec2;
    private selectionData: ImageData;
    private keysDown: Map<ArrowKeys, boolean>;
    private intervalId: ReturnType<typeof setTimeout> | undefined = undefined;
    isMagnetism: boolean = false;

    constructor(drawingService: DrawingService, private selectionService: SelectionService, public magnetismService: MagnetismService) {
        super(drawingService);
        this.keysDown = new Map<ArrowKeys, boolean>();

        this.keysDown.set(ArrowKeys.Up, false).set(ArrowKeys.Down, false).set(ArrowKeys.Left, false).set(ArrowKeys.Right, false);
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
        }
    }

    onMouseMove(event: MouseEvent): void {
        if (this.mouseDown && !this.selectionService.selectionTerminated) {
            this.selectionService.imageMoved = true;
            this.mouseDownCoord = this.getPositionFromMouse(event);
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.moveSelectionMouse(this.drawingService.previewCtx);
            this.clearUnderneathShape();
            return;
        }

        this.initialSelection();

        if (!this.selectionService.selectionTerminated) {
            if (this.selectionService.mouseInSelectionArea(this.origin, this.destination, this.getPositionFromMouse(event))) {
                this.selectionService.newSelection = false;
            } else {
                this.selectionService.newSelection = true;
            }
        }
    }

    onMouseUp(event: MouseEvent): void {
        if (this.mouseDown) {
            this.origin = this.newOrigin;
            this.destination = { x: this.origin.x + this.selectionData.width, y: this.origin.y + this.selectionData.height };
            this.selectionService.selection = this.selectionData;
            this.selectionService.origin = this.origin;
            this.selectionService.destination = this.destination;
            this.selectionService.createBoundaryBox();
        }
        this.mouseDown = false;
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
                this.clearUnderneathShape();
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
            this.clearUnderneathShape();
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
            this.selectionService.createBoundaryBox();
        }
    }

    private moveSelectionMouse(ctx: CanvasRenderingContext2D): void {
        this.initialSelection();
        const distanceX: number = this.mouseDownCoord.x - this.initialMousePosition.x;
        const distanceY: number = this.mouseDownCoord.y - this.initialMousePosition.y;
        this.newOrigin = { x: this.origin.x + distanceX, y: this.origin.y + distanceY };

        if (this.isMagnetism) {
            this.newOrigin = this.magnetismService.activateMagnetism(this.newOrigin, this.selectionService.height, this.selectionService.width);
        }
        console.log(this.newOrigin);
        ctx.putImageData(this.selectionData, this.newOrigin.x, this.newOrigin.y);
    }

    private moveSelectionKeyboard(ctx: CanvasRenderingContext2D): void {
        if (this.keysDown.get(ArrowKeys.Right)) {
            this.newOrigin.x += DX;
        }
        if (this.keysDown.get(ArrowKeys.Left)) {
            this.newOrigin.x -= DX;
        }
        if (this.keysDown.get(ArrowKeys.Down)) {
            this.newOrigin.y += DY;
        }
        if (this.keysDown.get(ArrowKeys.Up)) {
            this.newOrigin.y -= DY;
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
        console.log('okokok');
        if (this.selectionService.initialSelection) {
            this.origin = this.selectionService.origin;
            this.destination = this.selectionService.destination;
            this.selectionData = this.selectionService.selection;
            this.selectionService.initialSelection = false;
        }
    }

    private clearUnderneathShape(): void {
        if (this.selectionService.clearUnderneath) {
            this.selectionService.clearUnderneathShape();
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
