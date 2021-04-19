// tslint:disable:no-non-null-assertion
import { Injectable } from '@angular/core';
import { Stamp } from '@app/classes/stamp';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { ANGLE_HALF_TURN, MAX_ANGLE, MouseButton, ROTATION_STEP_STAMP, SCALE_FACTOR_STAMP, SIZE_STAMP, StampList } from '@app/constants';
import { ColorOrder } from '@app/interfaces-enums/color-order';
import { ColorManagerService } from '@app/services/color-manager/color-manager.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class StampService extends Tool {
    imageCoords: Vec2;
    currentStamp: string;
    selectStamp: StampList;
    imageSrc: string;
    size: number;
    resizeFactor: number;
    color: string;
    angle: number;
    isKeyAltDown: boolean;
    mouseEvent: MouseEvent;

    private angleObservable: Subject<number> = new Subject<number>();

    stampBindings: Map<StampList, string>;
    srcBinding: Map<string, string>;

    constructor(drawingService: DrawingService, private colorManager: ColorManagerService, private undoRedoService: UndoRedoService) {
        super(drawingService);

        this.stampBindings = new Map<StampList, string>();
        this.stampBindings
            .set(StampList.Surprised, 'surprised')
            .set(StampList.Happy, 'happy')
            .set(StampList.Sad, 'sad')
            .set(StampList.Glasses, 'glasses')
            .set(StampList.Dead, 'dead');

        this.srcBinding = new Map<string, string>();
        this.srcBinding
            .set(
                'surprised',
                'M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-3.5 8c-.828 0-1.5.671-1.5 1.5s.672 1.5 1.5 1.5 1.5-.671 1.5-1.5-.672-1.5-1.5-1.5zm7 0c-.828 0-1.5.671-1.5 1.5s.672 1.5 1.5 1.5 1.5-.671 1.5-1.5-.672-1.5-1.5-1.5zm-3.499 4c-1.658 0-3.001 1.567-3.001 3.501 0 1.932 1.343 3.499 3.001 3.499 1.656 0 2.999-1.567 2.999-3.499 0-1.934-1.343-3.501-2.999-3.501z',
            )
            .set(
                'happy',
                'M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm5.507 13.941c-1.512 1.195-3.174 1.931-5.506 1.931-2.334 0-3.996-.736-5.508-1.931l-.493.493c1.127 1.72 3.2 3.566 6.001 3.566 2.8 0 4.872-1.846 5.999-3.566l-.493-.493zm-9.007-5.941c-.828 0-1.5.671-1.5 1.5s.672 1.5 1.5 1.5 1.5-.671 1.5-1.5-.672-1.5-1.5-1.5zm7 0c-.828 0-1.5.671-1.5 1.5s.672 1.5 1.5 1.5 1.5-.671 1.5-1.5-.672-1.5-1.5-1.5z',
            )
            .set(
                'sad',
                'M18.414 10.727c.17 1.304-1.623 2.46-2.236 3.932-.986 2.479 2.405 3.747 3.512 1.4.931-1.974-.454-4.225-1.276-5.332zm.108 3.412c-.407.428-.954.063-.571-.408.227-.28.472-.646.667-1.037.128.338.236 1.097-.096 1.445zm-.522-4.137l-.755.506s-.503-.948-1.746-.948c-1.207 0-1.745.948-1.745.948l-.754-.506c.281-.748 1.205-2.002 2.499-2.002 1.295 0 2.218 1.254 2.501 2.002zm-7 0l-.755.506s-.503-.948-1.746-.948c-1.207 0-1.745.948-1.745.948l-.754-.506c.281-.748 1.205-2.002 2.499-2.002 1.295 0 2.218 1.254 2.501 2.002zm1-10.002c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm0 22c-5.514 0-10-4.486-10-10s4.486-10 10-10 10 4.486 10 10-4.486 10-10 10zm3.582-4.057c-.303.068-.645.076-1.023-.003-.903-.19-1.741-.282-2.562-.282-.819 0-1.658.092-2.562.282-1.11.233-1.944-.24-2.255-1.015-.854-2.131 1.426-3.967 4.816-3.967 1.207 0 2.245.22 3.062.588-.291.522-.44.912-.515 1.588-1.797-.874-6.359-.542-5.752 1.118.138.377 1.614-.279 3.205-.279 1.061 0 2.039.285 2.633.373.162.634.415 1.116.953 1.597z',
            )
            .set(
                'glasses',
                'M17.508 13.941l.492.493c-1.127 1.72-3.199 3.566-5.999 3.566-2.801 0-4.874-1.846-6.001-3.566l.492-.493c1.513 1.195 3.174 1.931 5.509 1.931 2.333 0 3.994-.736 5.507-1.931zm6.492-1.941c0 6.627-5.373 12-12 12s-12-5.373-12-12 5.373-12 12-12 12 5.373 12 12zm-21.159-4h2.51c.564-1.178 1.758-2 3.149-2 1.281 0 2.396.698 3.004 1.729.1.168.28.271.475.271.219 0 .423-.115.536-.302.611-1.014 1.716-1.698 2.985-1.698 1.391 0 2.585.822 3.149 2h2.51c-1.547-3.527-5.068-6-9.159-6s-7.612 2.473-9.159 6zm12.659 0c-.828 0-1.5.671-1.5 1.5s.672 1.5 1.5 1.5 1.5-.671 1.5-1.5-.672-1.5-1.5-1.5zm-7 0c-.828 0-1.5.671-1.5 1.5s.672 1.5 1.5 1.5 1.5-.671 1.5-1.5-.672-1.5-1.5-1.5zm13.5 4c0-.685-.07-1.354-.202-2h-2.849c-.245 1.691-1.691 3-3.449 3-1.552 0-2.454-.878-2.955-1.677-.11-.176-.304-.283-.512-.283-.208.001-.4.109-.51.287-.619 1.008-1.75 1.673-3.023 1.673-1.758 0-3.204-1.309-3.449-3h-2.849c-.132.646-.202 1.315-.202 2 0 5.514 4.486 10 10 10s10-4.486 10-10z',
            )
            .set(
                'dead',
                'M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm4 17h-8v-2h8v2zm-.499-6.296l-1.298 1.296-1.203-1.204 1.298-1.296-1.298-1.296 1.203-1.204 1.298 1.296 1.296-1.296 1.203 1.204-1.297 1.296 1.297 1.296-1.202 1.204-1.297-1.296zm-7 0l-1.298 1.296-1.203-1.204 1.298-1.296-1.298-1.296 1.203-1.204 1.298 1.296 1.296-1.296 1.203 1.204-1.297 1.296 1.297 1.296-1.202 1.204-1.297-1.296z',
            );

        this.currentStamp = 'happy';
        this.selectStamp = StampList.Happy;
        this.size = SIZE_STAMP;
        this.color = this.colorManager.selectedColor[ColorOrder.PrimaryColor].inString;
        this.angle = 0;
        this.isKeyAltDown = false;
        this.resizeFactor = SCALE_FACTOR_STAMP;
    }

    onMouseDown(event: MouseEvent): void {
        this.mouseDown = event.button === MouseButton.Left;
        if (this.mouseDown) {
            this.imageCoords = this.getPositionFromMouse(event);
            const stamp = new Stamp(this.imageCoords, this.imageSrc, this.angle, this.resizeFactor, this.color);
            this.undoRedoService.addToStack(stamp);
            this.drawStamp(this.getPositionFromMouse(event));
        }
    }

    handleKeyDown(event: KeyboardEvent): void {
        if (event.key === 'Alt') {
            event.preventDefault();
            this.isKeyAltDown = true;
        }
    }

    handleKeyUp(event: KeyboardEvent): void {
        if (event.key === 'Alt') {
            this.isKeyAltDown = false;
        }
    }

    onMouseMove(event: MouseEvent): void {
        this.mouseEvent = event;
        this.previewCursor(this.getPositionFromMouse(event));
    }

    onWheelEvent(event: WheelEvent): void {
        let rotationStep = ROTATION_STEP_STAMP;
        if (this.isKeyAltDown) {
            rotationStep = 1;
        }
        this.changeAngle(this.angle - (event.deltaY / Math.abs(event.deltaY)) * rotationStep);
        this.onMouseMove(this.mouseEvent);
    }

    changeAngle(newAngle: number): void {
        newAngle %= MAX_ANGLE;

        if (newAngle < 0) {
            newAngle += MAX_ANGLE;
        }

        this.angle = newAngle;
        this.angleObservable.next(this.angle);
    }

    drawStamp(event: Vec2): void {
        if (this.srcBinding.has(this.currentStamp)) {
            this.imageSrc = this.srcBinding.get(this.currentStamp)!;
        }

        const path = new Path2D(this.imageSrc);
        const center: Vec2 = { x: event.x + this.size / 2, y: event.y + this.size / 2 };

        this.drawingService.baseCtx.translate(center.x, center.y);

        this.drawingService.baseCtx.scale(this.resizeFactor, this.resizeFactor);
        this.drawingService.baseCtx.translate(-this.size / 2, -this.size / 2);

        this.drawingService.baseCtx.rotate(-((this.angle * Math.PI) / ANGLE_HALF_TURN));
        this.drawingService.baseCtx.translate(-this.size / 2, -this.size / 2);

        this.color = this.colorManager.selectedColor[ColorOrder.PrimaryColor].inString;
        this.drawingService.baseCtx.strokeStyle = this.color;
        this.drawingService.baseCtx.fillStyle = this.color;

        this.drawingService.baseCtx.stroke(path);
        this.drawingService.baseCtx.fill(path);
        this.drawingService.baseCtx.setTransform(1, 0, 0, 1, 0, 0);
    }

    previewCursor(event: Vec2): void {
        this.drawingService.clearCanvas(this.drawingService.cursorCtx);

        if (this.srcBinding.has(this.currentStamp)) {
            this.imageSrc = this.srcBinding.get(this.currentStamp)!;
        }

        const path = new Path2D(this.imageSrc);
        const center: Vec2 = { x: event.x + this.size / 2, y: event.y + this.size / 2 };

        this.drawingService.cursorCtx.translate(center.x, center.y);

        this.drawingService.cursorCtx.scale(this.resizeFactor, this.resizeFactor);
        this.drawingService.cursorCtx.translate(-this.size / 2, -this.size / 2);

        this.drawingService.cursorCtx.rotate(-((this.angle * Math.PI) / ANGLE_HALF_TURN));
        this.drawingService.cursorCtx.translate(-this.size / 2, -this.size / 2);

        this.color = this.colorManager.selectedColor[ColorOrder.PrimaryColor].inString;
        this.drawingService.cursorCtx.strokeStyle = this.color;
        this.drawingService.cursorCtx.fillStyle = this.color;

        this.drawingService.cursorCtx.stroke(path);
        this.drawingService.cursorCtx.fill(path);
        this.drawingService.cursorCtx.setTransform(1, 0, 0, 1, 0, 0);
    }

    changeStamp(): void {
        if (this.stampBindings.has(this.selectStamp)) {
            this.currentStamp = this.stampBindings.get(this.selectStamp)!;
        }
    }
}
