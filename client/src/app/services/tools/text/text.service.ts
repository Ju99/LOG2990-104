// tslint:disable:max-line-length
import { Injectable } from '@angular/core';
import { TextInput } from '@app/classes/text';
import { CanvasType, Emphasis, Font, TextAlign } from '@app/constants';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { ColorOrder } from 'src/app/interfaces-enums/color-order';
import { ColorManagerService } from 'src/app/services/color-manager/color-manager.service';
import { TextUtilsService } from 'src/app/services/tools/text/text-utils.service';
@Injectable({
    providedIn: 'root',
})
export class TextService extends TextUtilsService {
    private fontBinding: Map<Font, string>;
    private emphasisBinding: Map<Emphasis, string>;
    private alignBinding: Map<TextAlign, string>;
    private keyBinding: Map<string, () => void>;

    constructor(protected drawingService: DrawingService, private colorManager: ColorManagerService, private undoRedoService: UndoRedoService) {
        super(drawingService);
        this.fontBinding = new Map<Font, string>();
        this.fontBinding
            .set(Font.Arial, 'Arial')
            .set(Font.TimesNewRoman, 'Times New Roman')
            .set(Font.ComicSansMs, 'Comic Sans Ms')
            .set(Font.CourierNew, 'Courier New')
            .set(Font.Impact, 'Impact');

        this.emphasisBinding = new Map<Emphasis, string>();
        this.emphasisBinding
            .set(Emphasis.Bold, 'bold')
            .set(Emphasis.Italic, 'italic')
            .set(Emphasis.ItalicBold, 'bold italic')
            .set(Emphasis.Normal, 'normal');

        this.alignBinding = new Map<TextAlign, string>();
        this.alignBinding.set(TextAlign.Left, 'left').set(TextAlign.Center, 'center').set(TextAlign.Right, 'right');
        this.keyBinding = new Map<string, () => void>();
        this.keyBinding
            .set('Backspace', () => this.handleBackspace())
            .set('Delete', () => this.handleDelete())
            .set('ArrowLeft', () => this.handleArrowLeft())
            .set('ArrowRight', () => this.handleArrowRight())
            .set('ArrowUp', () => this.handleArrowUp())
            .set('ArrowDown', () => this.handleArrowDown())
            .set('Enter', () => this.handleEnter())
            .set('Escape', () => this.handleEscape());

        colorManager.changeColorObserver().subscribe(() => {
            this.color = this.colorManager.selectedColor[ColorOrder.PrimaryColor].inString;
            this.writeOnCanvas(CanvasType.previewCtx);
        });
    }

    changeFont(): void {
        if (this.fontBinding.has(this.selectFont)) {
            this.font = this.fontBinding.get(this.selectFont);
        }
        if (this.isWriting === true) {
            this.writeOnCanvas(CanvasType.previewCtx);
        }
    }

    changeEmphasis(): void {
        if (this.emphasisBinding.has(this.selectEmphasis)) {
            this.emphasis = this.emphasisBinding.get(this.selectEmphasis);
        }
        if (this.isWriting === true) {
            this.writeOnCanvas(CanvasType.previewCtx);
        }
    }

    changeAlign(): void {
        if (this.alignBinding.has(this.selectAlign)) {
            this.align = this.alignBinding.get(this.selectAlign);
        }
        if (this.isWriting === true) {
            if (this.selectAlign === TextAlign.Right) {
                this.alignToRight();
            }

            if (this.selectAlign === TextAlign.Center) {
                this.alignToCenter();
            }
            if (this.selectAlign === TextAlign.Left && this.wasAlignChanged) {
                this.positionText.x = this.initialMousePosition.x;
                this.wasAlignChanged = false;
            }
            this.writeOnCanvas(CanvasType.previewCtx);
        }
    }

    changeSize(): void {
        if (this.isWriting === true) {
            this.writeOnCanvas(CanvasType.previewCtx);
        }
    }

    onMouseDown(event: MouseEvent): void {
        if (this.isWriting === false) {
            this.textInput[this.currentLine] = '|';

            this.mouseDownCoord = this.getPositionFromMouse(event);
            this.initialMousePosition = this.mouseDownCoord;
            this.positionText.x = this.initialMousePosition.x;
            this.positionText.y = this.initialMousePosition.y;

            this.isWriting = true;

            this.writeOnCanvas(CanvasType.previewCtx);
        } else {
            this.write();
            this.cursorPosition = 0;
            this.textInput = [''];
            this.currentLine = 0;
            this.totalLine = 1;
            this.isWriting = false;
        }
    }

    handleKeyUp(event: KeyboardEvent): void {
        if (this.isWriting && event.key) {
            if (this.keyBinding.has(event.key)) {
                const keyFunction = this.keyBinding.get(event.key);
                if (keyFunction) keyFunction();
            } else {
                this.addCharacter(event);
                if (this.selectAlign === TextAlign.Right) {
                    this.alignToRight();
                }
                if (this.selectAlign === TextAlign.Center) {
                    this.alignToCenter();
                }
            }
            this.writeOnCanvas(CanvasType.previewCtx);
        }
    }

    write(): void {
        let isEmpty = true;
        for (const line of this.textInput) {
            if (line !== '') {
                isEmpty = false;
            }
        }
        if (!isEmpty) {
            this.textInput[this.currentLine] =
                this.textInput[this.currentLine].substring(0, this.cursorPosition) +
                this.textInput[this.currentLine].substring(this.cursorPosition + 1, this.textInput[this.currentLine].length);
            this.writeOnCanvas(CanvasType.baseCtx);
            const canvasData = this.drawingService.getCanvasData();
            const text = new TextInput(canvasData);
            this.undoRedoService.addToStack(text);
        }
    }

    private writeOnCanvas(ctx: CanvasType): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);

        if (ctx === CanvasType.baseCtx) {
            this.color = this.colorManager.selectedColor[ColorOrder.PrimaryColor].inString;

            this.drawingService.baseCtx.fillStyle = this.color;
            this.drawingService.baseCtx.font = this.emphasis + ' ' + this.size + 'px ' + this.font;
            if (this.totalLine === 1) {
                this.drawingService.baseCtx.textAlign = 'left';
            } else {
                this.drawingService.baseCtx.textAlign = this.align as CanvasTextAlign;
            }
            let y = this.positionText.y;

            for (let i = 0; i < this.totalLine; i++) {
                this.drawingService.baseCtx.fillText(this.textInput[i], this.positionText.x, y);
                y += Number(this.size);
            }
        } else {
            this.color = this.colorManager.selectedColor[ColorOrder.PrimaryColor].inString;

            this.drawingService.previewCtx.fillStyle = this.color;
            this.drawingService.previewCtx.font = this.emphasis + ' ' + this.size + 'px ' + this.font;

            if (this.totalLine === 1) {
                this.drawingService.previewCtx.textAlign = 'left';
            } else {
                this.drawingService.previewCtx.textAlign = this.align as CanvasTextAlign;
            }
            let y = this.positionText.y;

            for (let i = 0; i < this.totalLine; i++) {
                this.drawingService.previewCtx.fillText(this.textInput[i], this.positionText.x, y);
                y += Number(this.size);
            }
        }
    }
}
