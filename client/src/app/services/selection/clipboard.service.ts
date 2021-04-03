import { Injectable } from '@angular/core';
import { DrawingService } from '../drawing/drawing.service';
import { MoveSelectionService } from '../tools/selection/move-selection.service';
import { SelectionService } from '../tools/selection/selection.service';
import { ToolManagerService } from '../tools/tool-manager.service';

@Injectable({
    providedIn: 'root',
})
export class ClipboardService {
    selectionData: ImageData;
    width: number;
    height: number;
    isEllipse: boolean;
    isLasso: boolean;

    pasteAvailable: boolean;

    constructor(
        private drawingService: DrawingService,
        private selectionService: SelectionService,
        private moveSelectionService: MoveSelectionService,
        private toolManagerService: ToolManagerService,
    ) {
        this.pasteAvailable = false;
    }

    copy(): void {
        this.selectionData = this.selectionService.selection;
        this.width = this.selectionService.width;
        this.height = this.selectionService.height;
        this.isEllipse = this.selectionService.isEllipse;
        this.isLasso = this.selectionService.isLasso;
        this.pasteAvailable = true;
        this.toolManagerService.currentTool = this.selectionService;
    }

    paste(): void {
        this.selectionService.printMovedSelection(this.drawingService.baseCtx);
        this.selectionService.selection = this.selectionData;
        this.selectionService.origin = { x: 0, y: 0 };
        this.selectionService.destination = { x: this.width, y: this.height };
        this.selectionService.width = this.width;
        this.selectionService.height = this.height;
        this.selectionService.isEllipse = this.isEllipse;
        this.selectionService.isLasso = this.isLasso;

        this.selectionService.activeSelection = true;
        this.selectionService.initialSelection = true;
        this.selectionService.imageMoved = true;
        this.selectionService.clearUnderneath = true;
        this.selectionService.selectionTerminated = false;
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.selectionService.printMovedSelection(this.drawingService.previewCtx);
        this.selectionService.createBoundaryBox();
        this.toolManagerService.currentTool = this.moveSelectionService;
    }

    cut(): void {
        this.copy();
        this.delete();
        this.toolManagerService.currentTool = this.selectionService;
    }

    delete(): void {
        this.selectionService.clearUnderneathShape();
        this.selectionService.selectionDeleted = true;
        this.selectionService.terminateSelection();
        this.toolManagerService.currentTool = this.selectionService;
    }

    actionsAreAvailable(): boolean {
        if (this.selectionService.activeSelection) return true;
        return false;
    }
}
