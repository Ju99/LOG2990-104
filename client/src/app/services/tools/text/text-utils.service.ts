import { Injectable } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { ACCEPTED_CHAR, DEFAULT_EMPHASIS, DEFAULT_FONT, DEFAULT_TEXT_ALIGN, DEFAULT_TEXT_SIZE, Emphasis, Font, TextAlign } from '@app/constants';
import { DrawingService } from '@app/services/drawing/drawing.service';
@Injectable({
    providedIn: 'root',
})
export class TextUtilsService extends Tool {
    align: undefined | string = DEFAULT_TEXT_ALIGN;
    isWriting: boolean;
    selectFont: Font;
    selectEmphasis: Emphasis;
    selectAlign: TextAlign;
    color: string;
    font: undefined | string = DEFAULT_FONT;
    size: string = DEFAULT_TEXT_SIZE;
    emphasis: undefined | string = DEFAULT_EMPHASIS;

    protected textInput: string[];
    protected currentLine: number;
    protected totalLine: number;
    protected positionText: Vec2;
    protected cursorPosition: number;
    protected initialMousePosition: Vec2;
    protected wasAlignChanged: boolean;

    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;

    constructor(protected drawingService: DrawingService) {
        super(drawingService);
        this.currentLine = 0;
        this.textInput = [];
        this.totalLine = 1;
        this.wasAlignChanged = false;
        this.initialMousePosition = { x: 0, y: 0 };
        this.positionText = { x: 0, y: 0 };
        this.cursorPosition = 0;
        this.isWriting = false;
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
        this.selectFont = Font.Arial;
        this.selectEmphasis = Emphasis.Normal;
        this.selectAlign = TextAlign.Left;
    }

    private sizeOfLine(line: string): number {
        this.ctx.font = this.emphasis + ' ' + this.size + 'px ' + this.font;
        return this.ctx.measureText(line).width;
    }

    protected longestLineSize(): number {
        let longestLine = this.sizeOfLine(this.textInput[0]) as number;

        for (let i = 0; i < this.textInput.length; i++) {
            const realSize = this.sizeOfLine(this.textInput[i]);
            if (i === this.currentLine) {
                this.sizeOfLine(this.textInput[i].substr(0, this.textInput[i].length - 1));
            }
            if (realSize > longestLine) {
                longestLine = realSize;
            }
        }
        return longestLine;
    }

    protected alignToCenter(): void {
        if (this.totalLine > 1) {
            this.positionText.x = this.initialMousePosition.x + this.longestLineSize() / 2;
            this.wasAlignChanged = true;
        }
    }
    protected alignToRight(): void {
        if (this.totalLine > 1) {
            const longestLine = this.longestLineSize();
            this.positionText.x = this.initialMousePosition.x + longestLine;
            this.wasAlignChanged = true;
        }
    }

    protected addCharacter(event: KeyboardEvent): void {
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

    protected handleBackspace(): void {
        if (this.cursorPosition !== 0) {
            this.textInput[this.currentLine] =
                this.textInput[this.currentLine].substring(0, this.cursorPosition - 1) +
                this.textInput[this.currentLine].substring(this.cursorPosition, this.textInput[this.currentLine].length);
            this.cursorPosition--;
        }
    }

    protected handleDelete(): void {
        this.textInput[this.currentLine] =
            this.textInput[this.currentLine].substring(0, this.cursorPosition + 1) +
            this.textInput[this.currentLine].substring(this.cursorPosition + 2, this.textInput[this.currentLine].length);
    }

    protected handleArrowLeft(): void {
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

    protected handleEscape(): void {
        for (let i = 0; i < this.totalLine; i++) {
            this.textInput[i] = '';
        }
        this.cursorPosition = 0;
        this.currentLine = 0;
        this.totalLine = 1;
        this.isWriting = false;
    }

    protected handleEnter(): void {
        let cuttedLine = '';
        if (this.textInput[this.currentLine + 1]) {
            cuttedLine = this.textInput[this.currentLine + 1];
        }
        const nextLine = this.textInput[this.currentLine].substring(this.cursorPosition + 1, this.textInput[this.currentLine].length);
        this.textInput[this.currentLine] = this.textInput[this.currentLine].substring(0, this.cursorPosition);
        this.currentLine++;
        this.totalLine++;
        this.textInput[this.currentLine] = '|' + nextLine;
        this.cursorPosition = 0;
        if (cuttedLine !== '') {
            this.textInput.splice(this.currentLine + 1, 0, cuttedLine);
        }
        if (this.selectAlign === TextAlign.Right) {
            this.alignToRight();
        }
        if (this.selectAlign === TextAlign.Center) {
            this.alignToCenter();
        }
    }

    protected handleArrowDown(): void {
        if (this.currentLine !== this.totalLine - 1) {
            this.textInput[this.currentLine] =
                this.textInput[this.currentLine].substring(0, this.cursorPosition) +
                this.textInput[this.currentLine].substring(this.cursorPosition + 1, this.textInput[this.currentLine].length);
            this.currentLine++;
            if (this.textInput[this.currentLine] === '') {
                this.textInput[this.currentLine] = '|';
                this.cursorPosition = 0;
            } else {
                this.textInput[this.currentLine] =
                    this.textInput[this.currentLine].substring(0, this.cursorPosition) +
                    '|' +
                    this.textInput[this.currentLine].substring(this.cursorPosition, this.textInput[this.currentLine].length);
                if (this.cursorPosition > this.textInput[this.currentLine].length) {
                    this.cursorPosition = this.textInput[this.currentLine].length - 1;
                }
            }
        }
    }

    protected handleArrowUp(): void {
        if (this.currentLine !== 0) {
            this.textInput[this.currentLine] =
                this.textInput[this.currentLine].substring(0, this.cursorPosition) +
                this.textInput[this.currentLine].substring(this.cursorPosition + 1, this.textInput[this.currentLine].length);
            this.currentLine--;
            if (this.textInput[this.currentLine] === '') {
                this.textInput[this.currentLine] = '|';
                this.cursorPosition = 0;
            } else {
                if (this.cursorPosition > this.textInput[this.currentLine].length) {
                    this.cursorPosition = this.textInput[this.currentLine].length;
                }
                this.textInput[this.currentLine] =
                    this.textInput[this.currentLine].substring(0, this.cursorPosition) +
                    '|' +
                    this.textInput[this.currentLine].substring(this.cursorPosition, this.textInput[this.currentLine].length);
            }
        }
    }

    protected handleArrowRight(): void {
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
}
