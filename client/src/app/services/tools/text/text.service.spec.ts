import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Vec2 } from '@app/classes/vec2';
import { CanvasType, Emphasis, Font, TextAlign } from '@app/constants';
import { ColorManagerService } from '@app/services/color-manager/color-manager.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { of } from 'rxjs';
import { TextService } from './text.service';

//tslint:disable
describe('TextService', () => {
    let service: TextService;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let colorServiceSpy: ColorManagerService;
    let undoRedoServiceSpy: UndoRedoService;
    const mouseEventClick = {
        x: 25,
        y: 25,
        button: 0,
    } as MouseEvent;
    let canvasTestHelper: CanvasTestHelper;
    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;

    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);
        colorServiceSpy = new ColorManagerService();
        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawServiceSpy },
                { provide: ColorManagerService, useValue: colorServiceSpy },
                { provide: UndoRedoService, useValue: undoRedoServiceSpy },
            ],
        });
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        service = TestBed.inject(TextService);

        service['drawingService'].baseCtx = baseCtxStub;
        service['drawingService'].previewCtx = previewCtxStub;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should subscribe to colorManager color change', () => {
        spyOn(colorServiceSpy, 'changeColorObserver').and.returnValue(of({} as any));
        const spyWriteCanvas = spyOn<any>(TextService.prototype, 'writeOnCanvas').and.stub();
        service = new TextService(drawServiceSpy, colorServiceSpy, undoRedoServiceSpy);
        expect(spyWriteCanvas).toHaveBeenCalled();
    });

    it('should write the first letter', () => {
        service.isWriting = true;
        service['cursorPosition'] = 0;
        const keyEvent = new KeyboardEvent('keyup', { key: 'a' });
        const spyAddCharacter = spyOn<any>(service, 'addCharacter').and.callThrough();
        const spyWriteCanvas = spyOn<any>(service, 'writeOnCanvas').and.stub();

        service.handleKeyUp(keyEvent);

        expect(spyAddCharacter).toHaveBeenCalled();
        expect(service['cursorPosition']).toBe(1);
        expect(spyWriteCanvas).toHaveBeenCalled();
    });

    it('should not write a non-accepted key as first letter', () => {
        service.isWriting = true;
        service['cursorPosition'] = 0;
        service['textInput'][0] = '';
        const keyEvent = new KeyboardEvent('keyup', { key: 'Shift' });
        const spyAddCharacter = spyOn<any>(service, 'addCharacter').and.callThrough();
        const spyWriteCanvas = spyOn<any>(service, 'writeOnCanvas').and.stub();

        service.handleKeyUp(keyEvent);

        expect(service['textInput']).toEqual(['']);
        expect(spyAddCharacter).toHaveBeenCalled();
        expect(service['cursorPosition']).toBe(0);
        expect(spyWriteCanvas).toHaveBeenCalled();
    });

    it('should use backspace when keyup', () => {
        service.isWriting = true;
        service['textInput'][0] = 'abc';
        service['cursorPosition'] = 3;
        const keyEvent = new KeyboardEvent('keyup', { key: 'Backspace' });
        const spyWriteCanvas = spyOn<any>(service, 'writeOnCanvas').and.stub();

        service.handleKeyUp(keyEvent);

        expect(service['textInput']).toEqual(['ab']);
        expect(spyWriteCanvas).toHaveBeenCalled();
    });

    it('should not backspace when cursor position at zero', () => {
        service.isWriting = true;
        service['textInput'][0] = 'abc';
        service['cursorPosition'] = 0;
        const keyEvent = new KeyboardEvent('keyup', { key: 'Backspace' });
        const spyWriteCanvas = spyOn<any>(service, 'writeOnCanvas').and.stub();

        service.handleKeyUp(keyEvent);

        expect(service['textInput']).toEqual(['abc']);
        expect(spyWriteCanvas).toHaveBeenCalled();
    });

    it('should use delete when keyup', () => {
        service.isWriting = true;
        service['textInput'][0] = 'abc';
        service['cursorPosition'] = 1;
        const keyEvent = new KeyboardEvent('keyup', { key: 'Delete' });
        const spyWriteCanvas = spyOn<any>(service, 'writeOnCanvas').and.stub();

        service.handleKeyUp(keyEvent);

        expect(service['textInput']).toEqual(['ab']);
        expect(spyWriteCanvas).toHaveBeenCalled();
    });

    it('should put cursor on left of letter using arrow left', () => {
        service.isWriting = true;
        service['textInput'][0] = 'abc';
        service['cursorPosition'] = 1;
        const keyEvent = new KeyboardEvent('keyup', { key: 'ArrowLeft' });
        const spyWriteCanvas = spyOn<any>(service, 'writeOnCanvas').and.stub();

        service.handleKeyUp(keyEvent);

        expect(service['cursorPosition']).toBe(0);
        expect(spyWriteCanvas).toHaveBeenCalled();
    });

    it('should not do anything when arrow left pressed when beginning of textInput', () => {
        service.isWriting = true;
        service['textInput'][0] = 'abc';
        service['cursorPosition'] = 0;
        const keyEvent = new KeyboardEvent('keyup', { key: 'ArrowLeft' });
        const spyWriteCanvas = spyOn<any>(service, 'writeOnCanvas').and.stub();

        service.handleKeyUp(keyEvent);

        expect(service['cursorPosition']).toBe(0);
        expect(spyWriteCanvas).toHaveBeenCalled();
    });

    it('should put cursor on end of upper line when arrow left is pressed at beginning of line', () => {
        service.isWriting = true;
        service['currentLine'] = 1;
        service['textInput'][0] = 'abc';
        service['textInput'][1] = 'def';
        service['cursorPosition'] = 0;
        service['totalLine'] = 2;
        const keyEvent = new KeyboardEvent('keyup', { key: 'ArrowLeft' });
        const spyWriteCanvas = spyOn<any>(service, 'writeOnCanvas').and.stub();

        service.handleKeyUp(keyEvent);

        expect(service['cursorPosition']).toBe(3);
        expect(service['currentLine']).toBe(0);
        expect(service['textInput'][service['currentLine']]).toEqual('abc|');
        expect(spyWriteCanvas).toHaveBeenCalled();
    });

    it('should put cursor on right of letter using arrow right', () => {
        service.isWriting = true;
        service['textInput'][0] = 'abc';
        service['cursorPosition'] = 1;
        const keyEvent = new KeyboardEvent('keyup', { key: 'ArrowRight' });
        const spyWriteCanvas = spyOn<any>(service, 'writeOnCanvas').and.stub();

        service.handleKeyUp(keyEvent);

        expect(service['cursorPosition']).toBe(2);
        expect(spyWriteCanvas).toHaveBeenCalled();
    });

    it('should not put cursor on right of letter using arrow right at end of the line of text', () => {
        service.isWriting = true;
        service['totalLine'] = 1;
        service['textInput'][0] = 'abc';
        service['cursorPosition'] = 2;
        service['currentLine'] = 0;
        const keyEvent = new KeyboardEvent('keyup', { key: 'ArrowRight' });
        const spyWriteCanvas = spyOn<any>(service, 'writeOnCanvas').and.stub();

        service.handleKeyUp(keyEvent);

        expect(service['cursorPosition']).toBe(2);
        expect(spyWriteCanvas).toHaveBeenCalled();
    });

    it('should put cursor on lower position and first letter when using arrow right end of line', () => {
        service.isWriting = true;
        service['currentLine'] = 0;
        service['textInput'][0] = 'abc';
        service['textInput'][1] = 'def';
        service['cursorPosition'] = 3;
        service['totalLine'] = 2;
        const keyEvent = new KeyboardEvent('keyup', { key: 'ArrowRight' });
        const spyWriteCanvas = spyOn<any>(service, 'writeOnCanvas').and.stub();

        service.handleKeyUp(keyEvent);

        expect(service['cursorPosition']).toBe(0);
        expect(service['currentLine']).toBe(1);
        expect(service['textInput'][service['currentLine']]).toEqual('|def');
        expect(spyWriteCanvas).toHaveBeenCalled();
    });

    it('should put cursor on upper position when using arrow up', () => {
        service.isWriting = true;
        service['currentLine'] = 1;
        service['textInput'][0] = 'abc';
        service['textInput'][1] = 'def';
        service['currentLine'] = 1;
        service['cursorPosition'] = 0;
        const keyEvent = new KeyboardEvent('keyup', { key: 'ArrowUp' });
        const spyWriteCanvas = spyOn<any>(service, 'writeOnCanvas').and.stub();

        service.handleKeyUp(keyEvent);

        expect(service['currentLine']).toBe(0);
        expect(spyWriteCanvas).toHaveBeenCalled();
    });

    it('should not put cursor on upper position when using arrow up at top of text', () => {
        service.isWriting = true;
        service['currentLine'] = 0;
        service['textInput'][0] = 'abc';
        service['textInput'][1] = 'def';
        service['cursorPosition'] = 0;
        const keyEvent = new KeyboardEvent('keyup', { key: 'ArrowUp' });
        const spyWriteCanvas = spyOn<any>(service, 'writeOnCanvas').and.stub();

        service.handleKeyUp(keyEvent);

        expect(service['currentLine']).toBe(0);
        expect(spyWriteCanvas).toHaveBeenCalled();
    });

    it('should put cursor on lower position when using arrow down', () => {
        service.isWriting = true;
        service['textInput'][0] = 'abc';
        service['textInput'][1] = 'def';
        service['currentLine'] = 0;
        service['cursorPosition'] = 0;
        service['totalLine'] = 2;
        const keyEvent = new KeyboardEvent('keyup', { key: 'ArrowDown' });
        const spyWriteCanvas = spyOn<any>(service, 'writeOnCanvas').and.stub();

        service.handleKeyUp(keyEvent);

        expect(service['currentLine']).toBe(1);
        expect(spyWriteCanvas).toHaveBeenCalled();
    });

    it('should not put cursor on lower position when using arrow down when at last line', () => {
        service.isWriting = true;
        service['textInput'][0] = 'abc';
        service['textInput'][1] = 'def';
        service['currentLine'] = 1;
        service['cursorPosition'] = 0;
        service['totalLine'] = 2;
        const keyEvent = new KeyboardEvent('keyup', { key: 'ArrowDown' });
        const spyWriteCanvas = spyOn<any>(service, 'writeOnCanvas').and.stub();

        service.handleKeyUp(keyEvent);

        expect(service['currentLine']).toBe(1);
        expect(spyWriteCanvas).toHaveBeenCalled();
    });

    it('should line break when enter', () => {
        service.isWriting = true;
        service['currentLine'] = 0;
        service['textInput'][0] = 'abc';
        service['cursorPosition'] = 0;
        service['totalLine'] = 1;
        const keyEvent = new KeyboardEvent('keyup', { key: 'Enter' });
        const spyWriteCanvas = spyOn<any>(service, 'writeOnCanvas').and.stub();

        service.handleKeyUp(keyEvent);

        expect(service['currentLine']).toBe(1);
        expect(service['totalLine']).toBe(2);
        expect(spyWriteCanvas).toHaveBeenCalled();
    });

    it('should cancel line edition when escape pressed', () => {
        service.isWriting = true;
        service['currentLine'] = 0;
        service['textInput'][0] = 'abc';
        service['cursorPosition'] = 0;
        service['totalLine'] = 1;
        const keyEvent = new KeyboardEvent('keyup', { key: 'Escape' });
        const spyWriteCanvas = spyOn<any>(service, 'writeOnCanvas').and.stub();

        service.handleKeyUp(keyEvent);

        expect(service['textInput'][0]).toEqual('');
        expect(service['cursorPosition']).toBe(0);
        expect(service.isWriting).toBeFalsy;
        expect(spyWriteCanvas).toHaveBeenCalled();
    });

    it('should add character on middle of current input', () => {
        service.isWriting = true;
        service['currentLine'] = 0;
        service['textInput'][0] = 'ac';
        service['cursorPosition'] = 1;
        const keyEvent = new KeyboardEvent('keyup', { key: 'b' });
        const spyWriteCanvas = spyOn<any>(service, 'writeOnCanvas').and.stub();

        service.handleKeyUp(keyEvent);

        expect(service['textInput']).toEqual(['abc']);
        expect(service['cursorPosition']).toBe(2);
        expect(spyWriteCanvas).toHaveBeenCalled();
    });

    it('should add character on middle of current input', () => {
        service.isWriting = true;
        service['currentLine'] = 0;
        service['textInput'][0] = 'ac';
        service['cursorPosition'] = 1;
        const keyEvent = new KeyboardEvent('keyup', { key: 'b' });
        const spyWriteCanvas = spyOn<any>(service, 'writeOnCanvas').and.stub();

        service.handleKeyUp(keyEvent);

        expect(service['textInput']).toEqual(['abc']);
        expect(service['cursorPosition']).toBe(2);
        expect(spyWriteCanvas).toHaveBeenCalled();
    });

    it('should not write a non-accepted key as at a position different of zero', () => {
        service.isWriting = true;
        service['currentLine'] = 0;
        service['textInput'][0] = 'ac';
        service['cursorPosition'] = 1;
        const keyEvent = new KeyboardEvent('keyup', { key: 'Shift' });
        const spyWriteCanvas = spyOn<any>(service, 'writeOnCanvas').and.stub();

        service.handleKeyUp(keyEvent);

        expect(service['textInput'][0]).toEqual('ac');
        expect(service['cursorPosition']).toBe(1);
        expect(spyWriteCanvas).toHaveBeenCalled();
    });

    it('should write text on mouseDown position', () => {
        const expectedResult: Vec2 = { x: 25, y: 25 };
        service.isWriting = false;
        service['currentLine'] = 0;
        service['textInput'][0] = 'ac';
        service['cursorPosition'] = 1;
        service.mouseDownCoord = expectedResult;
        const spyWriteCanvas = spyOn<any>(service, 'writeOnCanvas').and.stub();
        spyOn<any>(service, 'getPositionFromMouse').and.returnValue({ x: 25, y: 25 });

        service.onMouseDown(mouseEventClick);

        expect(service['textInput'][0]).toEqual('|');
        expect(service.mouseDownCoord).toEqual(expectedResult);
        expect(spyWriteCanvas).toHaveBeenCalledWith(CanvasType.previewCtx);
    });

    it('should clear value when second clicked', () => {
        const expectedResult: Vec2 = { x: 25, y: 25 };
        service.isWriting = true;
        service['currentLine'] = 0;
        service['textInput'][0] = 'ac';
        service['cursorPosition'] = 1;
        service.mouseDownCoord = expectedResult;
        const spyWrite = spyOn<any>(service, 'write').and.stub();

        service.onMouseDown(mouseEventClick);

        expect(spyWrite).toHaveBeenCalled();
        expect(service['textInput'][0]).toEqual('');
        expect(service['currentLine']).toBe(0);
        expect(service['totalLine']).toBe(1);
        expect(service.isWriting).toBeFalsy;
    });

    it('should call write on canvas', () => {
        service['textInput'][0] = 'ac';
        const spyWrite = spyOn<any>(service, 'writeOnCanvas').and.stub();

        service.write();

        expect(spyWrite).toHaveBeenCalledWith(CanvasType.baseCtx);
    });

    it('should tell that all line are empty', () => {
        service['textInput'][0] = '';
        service['textInput'][1] = '';
        const spyWrite = spyOn<any>(service, 'writeOnCanvas').and.stub();

        service.write();

        expect(spyWrite).not.toHaveBeenCalled();
    });

    it('applyAlign should get the selected align and assign to current align', () => {
        service.isWriting = true;
        service.selectAlign = TextAlign.Center;
        const alignSpy = spyOn(service['alignBinding'], 'get').and.callThrough();
        const spyWriteCanvas = spyOn<any>(service, 'writeOnCanvas').and.stub();

        service.changeAlign();

        expect(alignSpy).toHaveBeenCalled();
        expect(service.align).toEqual('center');
        expect(spyWriteCanvas).toHaveBeenCalledWith(CanvasType.previewCtx);
    });

    it('should not apply align when not a defined align', () => {
        service.align = 'undefined';
        service.isWriting = false;
        service.isWriting = false;
        spyOn(service['alignBinding'], 'has').and.returnValue(false);
        const spyWriteCanvas = spyOn<any>(service, 'writeOnCanvas').and.stub();

        service.changeAlign();

        expect(spyWriteCanvas).not.toHaveBeenCalledWith(CanvasType.previewCtx);
        expect(service.align).toEqual('undefined');
    });

    it('applyEmphasis should get the selected emphasis and assign to current emphasis', () => {
        service.isWriting = true;
        service.selectEmphasis = Emphasis.Bold;
        const emphasisSpy = spyOn(service['emphasisBinding'], 'get').and.callThrough();
        const spyWriteCanvas = spyOn<any>(service, 'writeOnCanvas').and.stub();

        service.changeEmphasis();

        expect(emphasisSpy).toHaveBeenCalled();
        expect(service.emphasis).toEqual('bold');
        expect(spyWriteCanvas).toHaveBeenCalledWith(CanvasType.previewCtx);
    });

    it('should not apply emphasis when not a defined emphasis', () => {
        service.isWriting = false;
        spyOn(service['emphasisBinding'], 'has').and.returnValue(false);
        const spyWriteCanvas = spyOn<any>(service, 'writeOnCanvas').and.stub();

        service.changeEmphasis();

        expect(service.emphasis).toEqual('normal');
        expect(spyWriteCanvas).not.toHaveBeenCalled();
    });

    it('should change and apply to right align', () => {
        service.selectAlign = 2;
        service.isWriting = true;
        service['totalLine'] = 2;
        service['positionText'].x = 50;
        spyOn<any>(service, 'longestLineSize').and.returnValue(50);
        spyOn<any>(service, 'alignToRight').and.callThrough();

        service.changeAlign();
        expect(service['positionText'].x).toBe(50);
        expect(service['wasAlignChanged']).toBeTruthy;
    });

    it('should not right align if at first line', () => {
        service.selectAlign = 2;
        service['wasAlignChanged'] = false;
        service['totalLine'] = 1;
        service['positionText'].x = 50;

        service['alignToRight']();
        expect(service['positionText'].x).toEqual(50);
        expect(service['wasAlignChanged']).toBeFalsy;
    });

    it('should align to center', () => {
        service.selectAlign = 2;
        service['initialMousePosition'].x = 50;
        service['wasAlignChanged'] = false;
        service['totalLine'] = 2;
        spyOn<any>(service, 'longestLineSize').and.returnValue(10);

        service['alignToCenter']();
        expect(service['positionText'].x).toBe(55);
        expect(service['wasAlignChanged']).toBeTruthy;
    });

    it('applyFont should get the selected font and assign to current font', () => {
        service.isWriting = true;
        service.selectFont = Font.Impact;
        const fontSpy = spyOn(service['fontBinding'], 'get').and.callThrough();
        const spyWriteCanvas = spyOn<any>(service, 'writeOnCanvas').and.stub();

        service.changeFont();

        expect(fontSpy).toHaveBeenCalled();
        expect(service.font).toEqual('Impact');
        expect(spyWriteCanvas).toHaveBeenCalledWith(CanvasType.previewCtx);
    });

    it('should not apply font when not a defined font', () => {
        service.isWriting = false;
        spyOn(service['fontBinding'], 'has').and.returnValue(false);
        const spyWriteCanvas = spyOn<any>(service, 'writeOnCanvas').and.stub();

        service.changeFont();

        expect(service.font).toEqual('Arial');
        expect(spyWriteCanvas).not.toHaveBeenCalled();
    });

    it('shoud write on baseCtx', () => {
        const ctx = CanvasType.baseCtx;
        service['drawingService'].baseCtx.fillText = jasmine.createSpy('', service['drawingService'].baseCtx.fillText);
        service['drawingService'].baseCtx.fillStyle = 'red';
        service['drawingService'].baseCtx.font = 'Bold 10px Arial';
        service['drawingService'].baseCtx.textAlign = 'center' as CanvasTextAlign;
        service['positionText'] = { x: 0, y: 0 } as Vec2;
        service.mouseDownCoord = { x: 0, y: 0 } as Vec2;

        service['writeOnCanvas'](ctx);

        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
        expect(service['drawingService'].baseCtx.fillText).toHaveBeenCalled();
    });

    it('shoud write on previewCtx', () => {
        const ctx = CanvasType.previewCtx;
        service['drawingService'].previewCtx.fillText = jasmine.createSpy('', service['drawingService'].previewCtx.fillText);
        service['drawingService'].previewCtx.fillStyle = 'red';
        service['drawingService'].previewCtx.font = 'Bold 10px Arial';
        service['drawingService'].previewCtx.textAlign = 'center' as CanvasTextAlign;
        service['positionText'] = { x: 0, y: 0 } as Vec2;
        service.mouseDownCoord = { x: 0, y: 0 } as Vec2;

        service['writeOnCanvas'](ctx);

        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
        expect(service['drawingService'].previewCtx.fillText).toHaveBeenCalled();
    });

    it('should not call handleKeyUp when not writting', () => {
        service.isWriting = false;
        const keyEvent = new KeyboardEvent('keyup', { key: 'a' });
        const spyAddCharacter = spyOn<any>(service, 'addCharacter').and.callThrough();
        const spyWriteCanvas = spyOn<any>(service, 'writeOnCanvas').and.stub();

        service.handleKeyUp(keyEvent);

        expect(spyAddCharacter).not.toHaveBeenCalled();
        expect(spyWriteCanvas).not.toHaveBeenCalled();
    });

    it('should not do anything if not hotkey of the tool', () => {
        service.isWriting = true;
        const keyEvent = new KeyboardEvent('keyup', { key: 'Escape' });
        spyOn(service['keyBinding'], 'get').and.returnValue(undefined);
        const spyAddCharacter = spyOn<any>(service, 'addCharacter').and.callThrough();
        const spyWriteCanvas = spyOn<any>(service, 'writeOnCanvas').and.stub();

        service.handleKeyUp(keyEvent);

        expect(spyAddCharacter).not.toHaveBeenCalled();
        expect(spyWriteCanvas).toHaveBeenCalled();
    });

    it('should update preview canvas when change size', () => {
        service.isWriting = true;
        const spyWriteCanvas = spyOn<any>(service, 'writeOnCanvas').and.stub();

        service.changeSize();

        expect(spyWriteCanvas).toHaveBeenCalledWith(CanvasType.previewCtx);
    });

    it('should place cursor at position zero when current line is empty when after using arrow up', () => {
        service.isWriting = true;
        service['currentLine'] = 1;
        service['textInput'][0] = '';
        service['textInput'][1] = 'def';
        service['cursorPosition'] = 0;
        const keyEvent = new KeyboardEvent('keyup', { key: 'ArrowUp' });
        const spyWriteCanvas = spyOn<any>(service, 'writeOnCanvas').and.stub();

        service.handleKeyUp(keyEvent);

        expect(service['currentLine']).toBe(0);
        expect(service['cursorPosition']).toBe(0);
        expect(spyWriteCanvas).toHaveBeenCalled();
    });

    it('should place cursor at position zero when current line is empty after when using arrow down', () => {
        service.isWriting = true;
        service['textInput'][0] = 'abc';
        service['textInput'][1] = '';
        service['currentLine'] = 0;
        service['cursorPosition'] = 0;
        service['totalLine'] = 2;
        const keyEvent = new KeyboardEvent('keyup', { key: 'ArrowDown' });
        const spyWriteCanvas = spyOn<any>(service, 'writeOnCanvas').and.stub();

        service.handleKeyUp(keyEvent);

        expect(service['currentLine']).toBe(1);
        expect(spyWriteCanvas).toHaveBeenCalled();
    });

    it('should get the size of longest line ', () => {
        service.isWriting = true;
        service['textInput'][0] = 'abc';
        service['textInput'][1] = 'a';
        service['totalLine'] = 2;
        service['initialMousePosition'].x = 50;
        spyOn<any>(service, 'sizeOfLine').and.callThrough();
        spyOn<any>(service, 'longestLineSize').and.callThrough();
        const result = service['sizeOfLine']('abc');

        service['alignToRight']();

        expect(service['positionText'].x).toEqual(50 + result);
    });

    it('should return to initial mousePosition when align left and was changed ', () => {
        service.isWriting = true;
        service.selectAlign = 0;
        service['wasAlignChanged'] = true;
        service['positionText'].x = 20;
        service['initialMousePosition'].x = 50;

        service.changeAlign();

        expect(service['positionText'].x).toBe(50);
        expect(service['wasAlignChanged']).toBeFalsy;
    });

    it('should not apply change size if not writing', () => {
        service.isWriting = false;
        const writeSpy = spyOn<any>(service, 'writeOnCanvas').and.stub();

        service.changeSize();

        expect(writeSpy).not.toHaveBeenCalledWith();
    });

    it('should apply align on baseCtx', () => {
        service['totalLine'] = 2;
        service.align = 'center';

        service['writeOnCanvas'](CanvasType.baseCtx);

        expect(service['drawingService'].baseCtx.textAlign).toEqual('center');
    });

    it('should adjust cursor position when arrow up', () => {
        service['cursorPosition'] = 5;
        service['currentLine'] = 2;
        service['textInput'][2] = 'abc';
        service['textInput'][1] = 'abc';

        service['handleArrowUp']();

        expect(service['cursorPosition']).toBe(3);
    });

    it('should adjust cursor position when arrow down', () => {
        service['cursorPosition'] = 5;
        service['currentLine'] = 2;
        service['totalLine'] = 5;
        service['textInput'][2] = 'abcde';
        service['textInput'][3] = 'ab';

        service['handleArrowDown']();

        expect(service['cursorPosition']).toBe(2);
    });

    it('should align to right when enter is pressed  ', () => {
        service['cursorPosition'] = 2;
        service['currentLine'] = 0;
        service['totalLine'] = 2;
        service['textInput'][0] = 'abcde';
        service['textInput'][1] = 'ab';
        service.selectAlign = 2;

        service['handleEnter']();

        expect(service['textInput'][1]).toEqual('|de');
    });

    it('should align to center when enter is pressed ', () => {
        service['cursorPosition'] = 2;
        service['currentLine'] = 0;
        service['totalLine'] = 2;
        service['textInput'][0] = 'abcde';
        service['textInput'][1] = 'ab';
        service.selectAlign = 1;

        service['handleEnter']();

        expect(service['textInput'][1]).toEqual('|de');
    });

    it('should align to right when adding an alphanumeric character ', () => {
        service.isWriting = true;
        const keyEvent = new KeyboardEvent('keyup', { key: 'a' });
        service.selectAlign = 2;
        const alignRightSpy = spyOn<any>(service, 'alignToRight').and.stub();
        service.handleKeyUp(keyEvent);

        expect(alignRightSpy).toHaveBeenCalled();
    });

    it('should align to center when adding an alphanumeric character ', () => {
        service.isWriting = true;
        const keyEvent = new KeyboardEvent('keyup', { key: 'a' });
        service.selectAlign = 1;
        const alignCenterSpy = spyOn<any>(service, 'alignToCenter').and.stub();
        service.handleKeyUp(keyEvent);

        expect(alignCenterSpy).toHaveBeenCalled();
    });
});
