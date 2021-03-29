import { DragDropModule } from '@angular/cdk/drag-drop';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ToolManagerService } from '@app/services/tools/tool-manager.service';
import { DrawingComponent } from './drawing.component';

// tslint:disable
describe('DrawingComponent', () => {
    let component: DrawingComponent;
    let fixture: ComponentFixture<DrawingComponent>;
    let drawingStub: DrawingService;
    let toolManagerSpy: jasmine.SpyObj<ToolManagerService>;

    beforeEach(async(() => {
        drawingStub = new DrawingService();
        toolManagerSpy = jasmine.createSpyObj('ToolManagerService', [
            'onMouseMove',
            'onMouseDown',
            'onMouseUp',
            'onMouseClick',
            'onMouseDoubleClick',
            'handleKeyUp',
            'handleHotKeysShortcut',
        ]);

        TestBed.configureTestingModule({
            declarations: [DrawingComponent],
            imports: [MatDialogModule, DragDropModule, BrowserAnimationsModule],
            providers: [
                { provide: DrawingService, useValue: drawingStub },
                { provide: ToolManagerService, useValue: toolManagerSpy },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DrawingComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(" should call the tool's manager mouse move when receiving a mouse move event if not resizing", () => {
        const event = {
            target: {
                className: 'dummyString',
            },
        };
        const mouseCoord = spyOn(component, 'mouseCoord').and.stub();
        component.onMouseMove(event as any);
        expect(toolManagerSpy.onMouseMove).toHaveBeenCalled();
        expect(toolManagerSpy.onMouseMove).toHaveBeenCalledWith(event as any, mouseCoord(event as any));
    });

    it(" should call the tool's manager mouse down when receiving a mouse down event if not resizing", () => {
        const event = {
            target: {
                className: 'dummyString',
            },
        };
        const mouseCoord = spyOn(component, 'mouseCoord').and.stub();
        component.onMouseDown(event as any);
        expect(toolManagerSpy.onMouseDown).toHaveBeenCalled();
        expect(toolManagerSpy.onMouseDown).toHaveBeenCalledWith(event as any, mouseCoord(event as any));
    });

    it(" should call the tool's manager mouse up when receiving a mouse up event if not resizing", () => {
        const event = {
            target: {
                className: 'dummyString',
            },
        };
        const mouseCoord = spyOn(component, 'mouseCoord').and.stub();
        component.onMouseUp(event as any);
        expect(toolManagerSpy.onMouseUp).toHaveBeenCalled();
        expect(toolManagerSpy.onMouseUp).toHaveBeenCalledWith(event as any, mouseCoord(event as any));
    });

    it(" should not call the tool's manager mouse up when receiving a mouse up event if resizing", () => {
        const event = {
            target: {
                className: 'box',
            },
        };
        const mouseCoord = spyOn(component, 'mouseCoord').and.stub();
        component.onMouseDown(event as any);
        expect(toolManagerSpy.onMouseUp).not.toHaveBeenCalled();
        expect(toolManagerSpy.onMouseUp).not.toHaveBeenCalledWith(event as any, mouseCoord(event as any));
    });

    it(" should call the tool's manager mouse click when receiving a mouse click event if not resizing", () => {
        const event = {
            target: {
                className: 'dummyString',
            },
        };
        component.onMouseClick(event as any);
        expect(toolManagerSpy.onMouseClick).toHaveBeenCalled();
        expect(toolManagerSpy.onMouseClick).toHaveBeenCalledWith(event as any);
    });

    it(" should not call the tool's manager mouse click when receiving a mouse click event if resizing", () => {
        const event = {
            target: {
                className: 'box',
            },
        };
        component.onMouseClick(event as any);
        expect(toolManagerSpy.onMouseClick).not.toHaveBeenCalled();
        expect(toolManagerSpy.onMouseClick).not.toHaveBeenCalledWith(event as any);
    });

    it(" should call the tool's manager mouse double click when receiving a mouse double click event", () => {
        const event = {} as MouseEvent;
        component.onMouseDoubleClick(event);
        expect(toolManagerSpy.onMouseDoubleClick).toHaveBeenCalled();
        expect(toolManagerSpy.onMouseDoubleClick).toHaveBeenCalledWith(event);
    });

    it(" should call the tool's manager mouse handle key up when receiving a key up event", () => {
        const event = {} as KeyboardEvent;
        component.handleKeyUp(event);
        expect(toolManagerSpy.handleKeyUp).toHaveBeenCalled();
        expect(toolManagerSpy.handleKeyUp).toHaveBeenCalledWith(event);
    });

    it('should call the modalHandler when CTRL + <key> is pressed', () => {
        const event = new KeyboardEvent('keydown', { key: 'o', ctrlKey: true });
        let handleModalSpy = spyOn<any>(component, 'modalHandler');
        component.handleKeyDown(event);
        expect(handleModalSpy).toHaveBeenCalledTimes(2);
    });

    it('should return canvas width', () => {
        const CANVAS_WIDTH = 10;
        component['canvasSize'].x = CANVAS_WIDTH;
        const width = component.width;
        expect(width).toEqual(CANVAS_WIDTH);
    });

    it('should return canvas height', () => {
        const CANVAS_HEIGHT = 25;
        component['canvasSize'].y = CANVAS_HEIGHT;
        const height = component.height;
        expect(height).toEqual(CANVAS_HEIGHT);
    });
});
