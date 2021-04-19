import { TestBed } from '@angular/core/testing';
import { Tool } from '@app/classes/tool';
import { ToolList } from '@app/constants';
import { PencilService } from './pencil/pencil-service';
import { RectangleService } from './rectangle/rectangle.service';
import { SelectionService } from './selection/selection.service';
import { TextService } from './text/text.service';
import { ToolManagerService } from './tool-manager.service';
import SpyObj = jasmine.SpyObj;

//tslint:disable
describe('ToolManagerService', () => {
    let service: ToolManagerService;
    let rectangleServiceSpy: SpyObj<RectangleService>;
    let textServiceSpy: SpyObj<TextService>;
    let selectionServiceSpy: SpyObj<SelectionService>;

    beforeEach(() => {
        textServiceSpy = jasmine.createSpyObj('TextService', ['write']);
        selectionServiceSpy = jasmine.createSpyObj('SelectionService', ['terminateSelection']);

        TestBed.configureTestingModule({
            providers: [
                { provide: TextService, useValue: textServiceSpy },
                { provide: SelectionService, useValue: selectionServiceSpy },
            ],
        });

        service = TestBed.inject(ToolManagerService);
        rectangleServiceSpy = jasmine.createSpyObj('RectangleService', [
            'handleKeyDown',
            'onMouseMove',
            'onMouseDown',
            'onMouseUp',
            'onMouseClick',
            'onMouseDoubleClick',
            'handleKeyUp',
            'onMouseLeave',
        ]);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should be pencilService by default', () => {
        expect(service.currentTool).toBeInstanceOf(PencilService);
    });

    it('should call mouse move of current tool if tool is defined', () => {
        service.currentTool = rectangleServiceSpy;
        const event = {} as MouseEvent;
        const mouseCoord = { x: 25, y: 25 };
        service.onMouseMove(event, mouseCoord);
        expect(rectangleServiceSpy.onMouseMove).toHaveBeenCalled();
        expect(rectangleServiceSpy.onMouseMove).toHaveBeenCalledWith(event);
        expect(rectangleServiceSpy.mouseCoord).toEqual(mouseCoord);
    });

    it('should not call mouse move of current tool if tool is undefine', () => {
        service.currentTool = undefined;
        const event = {} as MouseEvent;
        const mouseCoord = { x: 25, y: 25 };
        service.onMouseMove(event, mouseCoord);
        expect(rectangleServiceSpy.onMouseMove).not.toHaveBeenCalled();
        expect(rectangleServiceSpy.onMouseMove).not.toHaveBeenCalledWith(event);
        expect(rectangleServiceSpy.mouseCoord).not.toEqual(mouseCoord);
    });

    it('should call mouse down of current tool if tool is undefined', () => {
        service.currentTool = rectangleServiceSpy;
        const event = {} as MouseEvent;
        const mouseCoord = { x: 25, y: 25 };
        service.onMouseDown(event, mouseCoord);
        expect(rectangleServiceSpy.onMouseDown).toHaveBeenCalled();
        expect(rectangleServiceSpy.onMouseDown).toHaveBeenCalledWith(event);
        expect(rectangleServiceSpy.mouseCoord).toEqual(mouseCoord);
    });

    it('should not call mouse down of current tool if tool is undefined', () => {
        service.currentTool = undefined;
        const event = {} as MouseEvent;
        const mouseCoord = { x: 25, y: 25 };
        service.onMouseDown(event, mouseCoord);
        expect(rectangleServiceSpy.onMouseDown).not.toHaveBeenCalled();
        expect(rectangleServiceSpy.onMouseDown).not.toHaveBeenCalledWith(event);
        expect(rectangleServiceSpy.mouseCoord).not.toEqual(mouseCoord);
    });

    it('should call mouse up of current tool if tool is defined', () => {
        service.currentTool = rectangleServiceSpy;
        const event = {} as MouseEvent;
        const mouseCoord = { x: 25, y: 25 };
        service.onMouseUp(event, mouseCoord);
        expect(rectangleServiceSpy.onMouseUp).toHaveBeenCalled();
        expect(rectangleServiceSpy.onMouseUp).toHaveBeenCalled();
        expect(rectangleServiceSpy.mouseCoord).toEqual(mouseCoord);
    });

    it('should not call mouse up of current tool if tool is undefined', () => {
        service.currentTool = undefined;
        const event = {} as MouseEvent;
        const mouseCoord = { x: 25, y: 25 };
        service.onMouseUp(event, mouseCoord);
        expect(rectangleServiceSpy.onMouseUp).not.toHaveBeenCalled();
        expect(rectangleServiceSpy.onMouseUp).not.toHaveBeenCalled();
        expect(rectangleServiceSpy.mouseCoord).not.toEqual(mouseCoord);
    });

    it('should call mouse click of current tool if tool is defined', () => {
        service.currentTool = rectangleServiceSpy;
        const event = {} as MouseEvent;
        service.onMouseClick(event);
        expect(rectangleServiceSpy.onMouseClick).toHaveBeenCalled();
        expect(rectangleServiceSpy.onMouseClick).toHaveBeenCalledWith(event);
    });

    it('should not call mouse click of current tool if tool is undefined', () => {
        service.currentTool = undefined;
        const event = {} as MouseEvent;
        service.onMouseClick(event);
        expect(rectangleServiceSpy.onMouseClick).not.toHaveBeenCalled();
        expect(rectangleServiceSpy.onMouseClick).not.toHaveBeenCalledWith(event);
    });

    it('should call mouse double click of current tool if tool is defined', () => {
        service.currentTool = rectangleServiceSpy;
        const event = {} as MouseEvent;
        service.onMouseDoubleClick(event);
        expect(rectangleServiceSpy.onMouseDoubleClick).toHaveBeenCalled();
        expect(rectangleServiceSpy.onMouseDoubleClick).toHaveBeenCalledWith(event);
    });

    it('should not call mouse double click of current tool if tool is undefined', () => {
        service.currentTool = undefined;
        const event = {} as MouseEvent;
        service.onMouseDoubleClick(event);
        expect(rectangleServiceSpy.onMouseDoubleClick).not.toHaveBeenCalled();
        expect(rectangleServiceSpy.onMouseDoubleClick).not.toHaveBeenCalledWith(event);
    });

    it('should not call mouse double click of current tool if tool is undefined', () => {
        service.currentTool = undefined;
        const event = {} as KeyboardEvent;
        service.handleKeyUp(event);
        expect(rectangleServiceSpy.handleKeyUp).not.toHaveBeenCalled();
        expect(rectangleServiceSpy.handleKeyUp).not.toHaveBeenCalledWith(event);
    });

    it('should call handle key up of current tool if tool is defined', () => {
        service.currentTool = rectangleServiceSpy;
        const event = {} as KeyboardEvent;
        service.handleKeyUp(event);
        expect(rectangleServiceSpy.handleKeyUp).toHaveBeenCalled();
        expect(rectangleServiceSpy.handleKeyUp).toHaveBeenCalledWith(event);
    });

    it('should handle hot keys shortcut if tool is defined', () => {
        service.currentTool = rectangleServiceSpy;
        const keyMock = { key: 'Shift' } as KeyboardEvent;
        const switchToolWithKeysSpy = spyOn(service, 'switchToolWithKeys');

        service.handleHotKeysShortcut(keyMock);

        expect(service.currentTool).toBeDefined();
        expect(rectangleServiceSpy.handleKeyDown).toHaveBeenCalled();
        expect(rectangleServiceSpy.handleKeyDown).toHaveBeenCalledWith(keyMock);
        expect(switchToolWithKeysSpy).not.toHaveBeenCalled();
    });

    it('should switch tool if isWriting attribute of TextService is false', () => {
        const keyboardEvent = {} as KeyboardEvent;
        textServiceSpy['isWriting'] = false;
        const switchToolWithKeysSpy = spyOn<any>(service, 'switchToolWithKeys').and.stub();
        service.handleHotKeysShortcut(keyboardEvent);
        expect(switchToolWithKeysSpy).toHaveBeenCalled();
    });

    it('should not switch tool if isWriting attribute of TextService is true', () => {
        const keyboardEvent = {} as KeyboardEvent;
        textServiceSpy['isWriting'] = true;
        const switchToolWithKeysSpy = spyOn<any>(service, 'switchToolWithKeys').and.stub();
        service.handleHotKeysShortcut(keyboardEvent);
        expect(switchToolWithKeysSpy).not.toHaveBeenCalled();
    });

    it('should switch tool if valid key is pressed', () => {
        let shortcut = 'c';
        service.switchToolWithKeys(shortcut);
        expect(service.currentToolEnum).toEqual(ToolList.Pencil);
        expect(service.currentTool).toBeInstanceOf(PencilService);
    });

    it('should not switch tool if invalid key is pressed', () => {
        let shortcut = 'p';
        const getSpy = spyOn<any>(service['keyBindings'], 'get').and.stub();
        service.switchToolWithKeys(shortcut);
        expect(getSpy).not.toHaveBeenCalled();
    });

    it('should set currentToolEnum to SelectionEllipse if S key is pressed', () => {
        service.switchToolWithKeys('s');
        expect(service.currentToolEnum).toEqual(ToolList.SelectionEllipse);
    });

    it('should set currentToolEnum to Lasso if V key is pressed', () => {
        service.switchToolWithKeys('v');
        expect(service.currentToolEnum).toEqual(ToolList.Lasso);
    });

    it('should return undefined if enum is not in map', () => {
        const tool: Tool | undefined = undefined;
        const result = service['getEnumFromMap'](service['serviceBindings'], tool);
        expect(result).toBeUndefined();
    });

    it('switchTool should switch tool if valid tool', () => {
        let newTool = ToolList.Rectangle;
        service.currentTool = undefined;

        service.switchTool(newTool);

        expect(service.currentToolEnum).toEqual(ToolList.Rectangle);
        expect(service.currentTool).toBeInstanceOf(RectangleService);
    });

    xit('should terminate selection if current tool is SelectionService', () => {
        service.currentTool = selectionServiceSpy;
        service.switchTool(ToolList.SelectionRectangle);
        expect(selectionServiceSpy.terminateSelection).toHaveBeenCalled();
    });

    xit('should write text if current tool is TextService', () => {
        service.currentTool = selectionServiceSpy;
        service.switchTool(ToolList.Text);
        expect(textServiceSpy.write).toHaveBeenCalled();
    });

    it('should trigger onMouseLeave event of current tool', () => {
        const mouseEvent = {} as MouseEvent;
        service.currentTool = rectangleServiceSpy;
        service.onMouseLeave(mouseEvent);
        expect(rectangleServiceSpy.onMouseLeave).toHaveBeenCalled();
    });

    it('should NOT trigger onMouseLeave event of current tool if its undefined', () => {
        const mouseEvent = {} as MouseEvent;
        service.currentTool = undefined;
        service.onMouseLeave(mouseEvent);
        expect(rectangleServiceSpy.onMouseLeave).not.toHaveBeenCalled();
    });
});
