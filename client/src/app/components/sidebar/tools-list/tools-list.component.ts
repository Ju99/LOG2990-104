import { Component } from '@angular/core';
import { ToolList } from '@app/constants';
import { ToolManagerService } from '@app/services/tools/tool-manager.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
@Component({
    selector: 'app-tools-list',
    templateUrl: './tools-list.component.html',
    styleUrls: ['./tools-list.component.scss'],
})
export class ToolsListComponent {
    ToolList: typeof ToolList = ToolList;
    constructor(public toolManagerService: ToolManagerService, private undoRedoService: UndoRedoService) {}

    onTool(selectedTool: ToolList): void {
        this.toolManagerService.switchTool(selectedTool);
    }
    undo(): void {
        this.undoRedoService.undo();
    }
    redo(): void {
        this.undoRedoService.redo();
    }
    canUndo(): boolean {
        return this.undoRedoService.canUndo();
    }
    canRedo(): boolean {
        return this.undoRedoService.canRedo();
    }
}
