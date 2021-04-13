import { Injectable } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import {
    ACCEPTED_CHAR,
    CanvasType,
    DEFAULT_EMPHASIS,
    DEFAULT_FONT,
    DEFAULT_TEXT_ALIGN,
    DEFAULT_TEXT_SIZE,
    Emphasis,
    Font,
    TextAlign,
} from '@app/constants';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ColorOrder } from 'src/app/interfaces-enums/color-order';
import { ColorManagerService } from 'src/app/services/color-manager/color-manager.service';

@Injectable({
    providedIn: 'root',
})
export class TextService extends Tool {
    selectFont: Font;
    selectEmphasis: Emphasis;
    selectAlign: TextAlign;

    isWriting: boolean;

    color: string;
    font: undefined | string = DEFAULT_FONT;
    size: string = DEFAULT_TEXT_SIZE;
    emphasis: undefined | string = DEFAULT_EMPHASIS;
    align: undefined | string = DEFAULT_TEXT_ALIGN;

    private textInput: string[];
    private currentLine: number;
    private totalLine: number;
    private cursorPosition: number;
    private positionText: Vec2;

    private fontBinding: Map<Font, string>;
    private emphasisBinding: Map<Emphasis, string>;
    private alignBinding: Map<TextAlign, string>;

    private keyBinding: Map<string, () => void>;

    constructor(drawingService: DrawingService, private colorManager: ColorManagerService) {
        super(drawingService);
        this.currentLine = 0;
        this.textInput = [];
        this.totalLine = 1;

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

        this.cursorPosition = 0;
        this.isWriting = false;

        this.selectFont = Font.Arial;
        this.selectEmphasis = Emphasis.Normal;
        this.selectAlign = TextAlign.Left;

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
        }
    }

    changeFont(): void {
        if (this.fontBinding.has(this.selectFont)) {
            this.font = this.fontBinding.get(this.selectFont);
            this.writeOnCanvas(CanvasType.previewCtx);
        }
    }

    changeEmphasis(): void {
        if (this.emphasisBinding.has(this.selectEmphasis)) {
            this.emphasis = this.emphasisBinding.get(this.selectEmphasis);
            this.writeOnCanvas(CanvasType.previewCtx);
        }
    }

    changeAlign(): void {
        if (this.alignBinding.has(this.selectAlign)) {
            this.align = this.alignBinding.get(this.selectAlign);
            this.writeOnCanvas(CanvasType.previewCtx);
        }
    }

    changeSize(): void {
        this.writeOnCanvas(CanvasType.previewCtx);
    }

    onMouseDown(event: MouseEvent): void {
        if (this.isWriting === false) {
            this.textInput[this.currentLine] = '|';

            this.mouseDownCoord = this.getPositionFromMouse(event);
            this.positionText = this.mouseDownCoord;

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
            }
            this.writeOnCanvas(CanvasType.previewCtx);
        }
    }

    private addCharacter(event: KeyboardEvent): void {
        if (this.cursorPosition !== 0) {
            if (ACCEPTED_CHAR.test(event.key)) {
                this.textInput[this.currentLine] =
                    this.textInput[this.currentLine].substring(0, this.cursorPosition) +
                    event.key +
                    this.textInput[this.currentLine].substring(this.cursorPosition, this.textInput[this.currentLine].length);
                this.cursorPosition++;
            }
        } else {
            if (ACCEPTED_CHAR.test(event.key)) {
                this.textInput[this.currentLine] = event.key + this.textInput[this.currentLine];
                this.cursorPosition++;
            }
        }
    }

    private handleBackspace(): void {
        if (this.cursorPosition !== 0) {
            this.textInput[this.currentLine] =
                this.textInput[this.currentLine].substring(0, this.cursorPosition - 1) +
                this.textInput[this.currentLine].substring(this.cursorPosition, this.textInput[this.currentLine].length);
            this.cursorPosition--;
        }
    }

    private handleDelete(): void {
        this.textInput[this.currentLine] =
            this.textInput[this.currentLine].substring(0, this.cursorPosition + 1) +
            this.textInput[this.currentLine].substring(this.cursorPosition + 2, this.textInput[this.currentLine].length);
    }

    private handleArrowLeft(): void {
        if (this.currentLine !== 0 || this.cursorPosition !== 0) {
            this.textInput[this.currentLine] =
                this.textInput[this.currentLine].substring(0, this.cursorPosition) +
                this.textInput[this.currentLine].substring(this.cursorPosition + 1, this.textInput[this.currentLine].length);
            if (this.cursorPosition === 0) {
                this.currentLine--;
                this.cursorPosition = this.textInput[this.currentLine].length;
                this.textInput[this.currentLine] = this.textInput[this.currentLine] + '|';
            } else {
                this.cursorPosition--;
                this.textInput[this.currentLine] =
                    this.textInput[this.currentLine].substring(0, this.cursorPosition) +
                    '|' +
                    this.textInput[this.currentLine].substring(this.cursorPosition, this.textInput[this.currentLine].length);
            }
        }
    }

    private handleEscape(): void {
        for (let i = 0; i < this.totalLine; i++) {
            this.textInput[i] = '';
        }
        this.cursorPosition = 0;
        this.currentLine = 0;
        this.totalLine = 1;
        this.isWriting = false;
    }

    private handleEnter(): void {
        const nextLine = this.textInput[this.currentLine].substring(this.cursorPosition + 1, this.textInput[this.currentLine].length);
        this.textInput[this.currentLine] = this.textInput[this.currentLine].substring(0, this.cursorPosition);
        this.currentLine++;
        this.totalLine++;
        this.textInput[this.currentLine] = nextLine + '|';
        this.cursorPosition = this.textInput[this.currentLine].length - 1;
    }

    private handleArrowDown(): void {
        if (this.currentLine !== this.totalLine - 1) {
            this.textInput[this.currentLine] =
                this.textInput[this.currentLine].substring(0, this.cursorPosition) +
                this.textInput[this.currentLine].substring(this.cursorPosition + 1, this.textInput[this.currentLine].length);
            this.currentLine++;
            this.textInput[this.currentLine] =
                this.textInput[this.currentLine].substring(0, this.cursorPosition) +
                '|' +
                this.textInput[this.currentLine].substring(this.cursorPosition, this.textInput[this.currentLine].length);
        }
    }

    private handleArrowUp(): void {
        if (this.currentLine !== 0) {
            this.textInput[this.currentLine] =
                this.textInput[this.currentLine].substring(0, this.cursorPosition) +
                this.textInput[this.currentLine].substring(this.cursorPosition + 1, this.textInput[this.currentLine].length);
            this.currentLine--;
            this.textInput[this.currentLine] =
                this.textInput[this.currentLine].substring(0, this.cursorPosition) +
                '|' +
                this.textInput[this.currentLine].substring(this.cursorPosition, this.textInput[this.currentLine].length);
        }
    }

    private handleArrowRight(): void {
        if (this.currentLine !== this.totalLine - 1 || this.cursorPosition !== this.textInput[this.currentLine].length - 1) {
            this.textInput[this.currentLine] =
                this.textInput[this.currentLine].substring(0, this.cursorPosition) +
                this.textInput[this.currentLine].substring(this.cursorPosition + 1, this.textInput[this.currentLine].length);
            if (this.cursorPosition === this.textInput[this.currentLine].length) {
                this.currentLine++;
                this.cursorPosition = 0;
                this.textInput[this.currentLine] = '|' + this.textInput[this.currentLine];
            } else {
                this.cursorPosition++;
                this.textInput[this.currentLine] =
                    this.textInput[this.currentLine].substring(0, this.cursorPosition) +
                    '|' +
                    this.textInput[this.currentLine].substring(this.cursorPosition, this.textInput[this.currentLine].length);
            }
        }
    }

    private writeOnCanvas(ctx: CanvasType): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);

        if (ctx === CanvasType.baseCtx) {
            this.color = this.colorManager.selectedColor[ColorOrder.PrimaryColor].inString;

            this.drawingService.baseCtx.fillStyle = this.color;
            this.drawingService.baseCtx.font = this.emphasis + ' ' + this.size + 'px ' + this.font;
            this.drawingService.baseCtx.textAlign = this.align as CanvasTextAlign;
            let y = this.positionText.y;

            for (let i = 0; i < this.totalLine; i++) {
                this.drawingService.baseCtx.fillText(this.textInput[i], this.mouseDownCoord.x, y);
                y += Number(this.size);
            }
        } else {
            this.color = this.colorManager.selectedColor[ColorOrder.PrimaryColor].inString;

            this.drawingService.previewCtx.fillStyle = this.color;
            this.drawingService.previewCtx.font = this.emphasis + ' ' + this.size + 'px ' + this.font;
            this.drawingService.previewCtx.textAlign = this.align as CanvasTextAlign;

            let y = this.positionText.y;

            for (let i = 0; i < this.totalLine; i++) {
                this.drawingService.previewCtx.fillText(this.textInput[i], this.mouseDownCoord.x, y);
                y += Number(this.size);
            }
        }
    }
}