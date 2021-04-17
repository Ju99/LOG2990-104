import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { ToolList } from '@app/constants';
import { ToolManagerService } from '@app/services/tools/tool-manager.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { ToolsListComponent } from './tools-list.component';

// tslint:disable
describe('ToolsListComponent', () => {
    let component: ToolsListComponent;
    let fixture: ComponentFixture<ToolsListComponent>;
    let toolManagerSpy: jasmine.SpyObj<ToolManagerService>;
    let undoRedoServiceSpy: jasmine.SpyObj<UndoRedoService>;

    beforeEach(async(() => {
        toolManagerSpy = jasmine.createSpyObj('ToolManagerService', ['switchTool']);
        undoRedoServiceSpy = jasmine.createSpyObj('UndoRedoService', ['undo', 'redo', 'canUndo', 'canRedo']);
        TestBed.configureTestingModule({
            declarations: [ToolsListComponent],
            imports: [MatIconModule, MatGridListModule],
            providers: [
                {
                    provide: ToolManagerService,
                    useValue: toolManagerSpy,
                },
                {
                    provide: UndoRedoService,
                    useValue: undoRedoServiceSpy,
                },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ToolsListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should switch tool to specified tool in parameter', () => {
        let pencil = ToolList.Pencil;
        component.onTool(pencil);
        expect(toolManagerSpy.switchTool).toHaveBeenCalled();
    });

    it('should undo', () => {
        component.undo();
        expect(undoRedoServiceSpy.undo).toHaveBeenCalled();
    });

    it('should redo', () => {
        component.redo();
        expect(undoRedoServiceSpy.redo).toHaveBeenCalled();
    });

    it('should return true if it can undo', () => {
        component.canUndo();
        expect(undoRedoServiceSpy.canUndo).toHaveBeenCalled();
    });

    it('should return true if it can redo', () => {
        component.canRedo();
        expect(undoRedoServiceSpy.canRedo).toHaveBeenCalled();
    });
});
