import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Vec2 } from '@app/classes/vec2';
import { CanvasType, Emphasis, Font, TextAlign } from '@app/constants';
import { ColorManagerService } from '@app/services/color-manager/color-manager.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { TextService } from './text.service';

//tslint:disable
fdescribe('TextService', () => {
    let service: TextService;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let colorManagerSpy: jasmine.SpyObj<DrawingService>;
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
        colorManagerSpy = jasmine.createSpyObj('ColorManager', ['changeColorObserver']);
        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawServiceSpy },
                { provide: ColorManagerService, useValue: colorManagerSpy },
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
        service.isWriting = true;
        spyOn(service['alignBinding'], 'has').and.returnValue(false);
        const spyWriteCanvas = spyOn<any>(service, 'writeOnCanvas').and.stub();

        service.changeAlign();

        expect(spyWriteCanvas).not.toHaveBeenCalled();
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

    it('should not apply emphasis when not a defined empphasis', () => {
        service.isWriting = true;
        spyOn(service['emphasisBinding'], 'has').and.returnValue(false);
        const spyWriteCanvas = spyOn<any>(service, 'writeOnCanvas').and.stub();

        service.changeEmphasis();

        expect(spyWriteCanvas).not.toHaveBeenCalled();
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
        service.isWriting = true;
        spyOn(service['fontBinding'], 'has').and.returnValue(false);
        const spyWriteCanvas = spyOn<any>(service, 'writeOnCanvas').and.stub();

        service.changeFont();

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

    it('should change color when color change using color manager', () => {
        service.isWriting = true;
        const spyWriteCanvas = spyOn<any>(service, 'writeOnCanvas').and.stub();
        const actionFuncReturn = () => {
            return {
                subscribe: (f: () => void) => {
                    f();
                },
            };
        };
        spyOn(service['colorManager'], 'changeColorObserver').and.returnValue({
            onAction: actionFuncReturn,
        } as any);
        expect(spyWriteCanvas).toHaveBeenCalled();
    });
});
