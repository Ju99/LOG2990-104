import { Injectable, OnDestroy } from '@angular/core';
import { Spray } from '@app/classes/spray';
import { Tool } from '@app/classes/tool';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { Vec2 } from 'src/app/classes/vec2';
import {
    MAX_SPRAY_DOT_WIDTH,
    MAX_SPRAY_FREQUENCY,
    MIN_SPRAY_DOT_WIDTH,
    MIN_SPRAY_FREQUENCY,
    MIN_SPRAY_WIDTH,
    MouseButton,
    ONE_SECOND,
    SPRAY_DENSITY,
} from 'src/app/constants';
import { ColorOrder } from 'src/app/interfaces-enums/color-order';
import { SprayProperties } from 'src/app/interfaces-enums/spray-properties';
import { ColorManagerService } from 'src/app/services/color-manager/color-manager.service';
import { DrawingService } from 'src/app/services/drawing/drawing.service';

// code inspired by spray methods in http://perfectionkills.com/exploring-canvas-drawing-techniques/

@Injectable({
    providedIn: 'root',
})
export class SprayService extends Tool implements OnDestroy {
    density: number = SPRAY_DENSITY;
    minDotWidth: number = MIN_SPRAY_DOT_WIDTH;
    maxDotWidth: number = MAX_SPRAY_DOT_WIDTH;
    minFrequency: number = MIN_SPRAY_FREQUENCY;
    maxFrequency: number = MAX_SPRAY_FREQUENCY;
    minToolWidth: number = MIN_SPRAY_WIDTH;
    maxToolWidth: number = 50;
    sprayData: SprayProperties;
    spray: Spray;
    timeoutId: ReturnType<typeof setTimeout>;
    mouseCoord: Vec2;
    width: number = this.minToolWidth;
    dotWidth: number = this.minDotWidth;
    sprayFrequency: number = this.minFrequency;
    canvasData: ImageData;

    constructor(drawingService: DrawingService, private colorManager: ColorManagerService, private undoRedoService: UndoRedoService) {
        super(drawingService);
    }

    ngOnDestroy(): void {
        clearTimeout(this.timeoutId);
    }

    onMouseDown(event: MouseEvent): void {
        this.drawingService.baseCtx.filter = 'none';
        this.drawingService.previewCtx.filter = 'none';
        if (event.button !== MouseButton.Left) {
            return;
        } else {
            this.mouseDown = true;
            this.mouseCoord = this.getPositionFromMouse(event);
            clearTimeout(this.timeoutId);
            this.timeoutId = setTimeout(this.drawSpray, ONE_SECOND / this.sprayFrequency, this, this.drawingService.baseCtx);
            this.undoRedoService.setToolInUse(true);
        }
    }

    onMouseUp(): void {
        if (this.mouseDown) {
            clearTimeout(this.timeoutId);
            this.undoRedoService.setToolInUse(false);
            this.canvasData = this.drawingService.getCanvasData();

            this.updateSprayData();
            this.undoRedoService.addToStack(this.spray);
        }
        this.mouseDown = false;
    }

    onMouseMove(event: MouseEvent): void {
        if (this.mouseDown) {
            this.mouseCoord = this.getPositionFromMouse(event);
        }
    }

    onMouseLeave(): void {
        if (this.mouseDown) {
            clearTimeout(this.timeoutId);
            // this.drawingService.applyPreview();
            //this.undoRedoService.setToolInUse(false);
        }
    }

    onMouseEnter(event: MouseEvent): void {
        if (this.mouseDown) {
            this.mouseCoord = this.getPositionFromMouse(event);
            this.timeoutId = setTimeout(this.drawSpray, ONE_SECOND / this.sprayFrequency, this, this.drawingService.previewCtx);
            this.undoRedoService.setToolInUse(true);
        }
    }

    drawSpray(sameSpray: SprayService, ctx: CanvasRenderingContext2D): void {
        for (let i = sameSpray.density; i--; ) {
            const angle = sameSpray.getRandomNumber(0, Math.PI * 2);
            const radius = sameSpray.getRandomNumber(0, sameSpray.width);
            ctx.strokeStyle = sameSpray.colorManager.selectedColor[ColorOrder.PrimaryColor].inString;
            ctx.fillStyle = sameSpray.colorManager.selectedColor[ColorOrder.PrimaryColor].inString;
            ctx.beginPath();
            ctx.arc(
                sameSpray.mouseCoord.x + radius * Math.cos(angle),
                sameSpray.mouseCoord.y + radius * Math.sin(angle),
                sameSpray.getRandomNumber(1, sameSpray.dotWidth / 2),
                0,
                2 * Math.PI,
            );
            ctx.fill();
        }
        if (!sameSpray.timeoutId) return;
        sameSpray.timeoutId = setTimeout(sameSpray.drawSpray, ONE_SECOND / sameSpray.sprayFrequency, sameSpray, ctx);
    }

    getRandomNumber(min: number, max: number): number {
        return Math.random() * (max - min) + min;
    }

    changeWidth(newWidth: number): void {
        this.width = newWidth;
    }

    changeDotWidth(newDotWidth: number): void {
        this.dotWidth = newDotWidth;
    }

    changeSprayFrequency(newSprayFrequency: number): void {
        this.sprayFrequency = newSprayFrequency;
    }

    reset(): void {
        clearTimeout(this.timeoutId);
        this.drawingService.previewCtx.globalAlpha = 1;
    }

    updateSprayData(): void {
        this.spray = new Spray(this.canvasData);
    }
}
