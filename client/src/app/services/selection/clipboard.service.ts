import { Injectable } from '@angular/core';
import { SelectionTool } from '@app/classes/selection';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { LassoService } from '@app/services/tools/selection/lasso/lasso.service';
import { SelectionService } from '@app/services/tools/selection/selection.service';
import { ToolManagerService } from '@app/services/tools/tool-manager.service';
import { SelectionUtilsService } from '@app/services/utils/selection-utils.service';

@Injectable({
    providedIn: 'root',
})
export class ClipboardService {
    selectionData: ImageData;
    width: number;
    height: number;
    isEllipse: boolean;
    isLasso: boolean;
    polygonCoords: Vec2[];

    pasteAvailable: boolean;

    constructor(
        private drawingService: DrawingService,
        private selectionService: SelectionService,
        private lassoService: LassoService,
        private toolManagerService: ToolManagerService,
        private selectionUtilsService: SelectionUtilsService,
    ) {
        this.pasteAvailable = false;
    }

    copy(): void {
        this.selectionData = this.selectionService.selection;
        this.width = this.selectionService.width;
        this.height = this.selectionService.height;
        this.isEllipse = this.selectionService.isEllipse;
        this.isLasso = this.selectionService.isLasso;
        if (this.isLasso) {
            this.polygonCoords = this.lassoService.polygonCoords;
        }
        this.pasteAvailable = true;
        this.toolManagerService.currentTool = this.selectionService;
    }

    paste(): void {
        this.selectionService.printMovedSelection();
        this.initializeSelectionParameters();
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.drawingService.previewCtx.putImageData(this.selectionData, 0, 0);
        this.selectionService.clearUnderneath = false;
        const selection = new SelectionTool({ x: 0, y: 0 }, { x: this.width, y: this.height }, this.width, this.height);
        selection.isEllipse = this.isEllipse;
        selection.isLasso = this.isLasso;
        this.selectionUtilsService.createBoundaryBox(selection);
        this.toolManagerService.currentTool = this.selectionService;
    }

    cut(): void {
        this.copy();
        this.delete();
        this.toolManagerService.currentTool = this.selectionService;
    }

    delete(): void {
        if (!this.selectionService.imageMoved) this.selectionUtilsService.clearUnderneathShape(this.selectionService.selectionObject);
        else this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.selectionService.selectionDeleted = true;
        this.selectionService.terminateSelection();
        this.selectionService.selectionDeleted = false;
        this.toolManagerService.currentTool = this.selectionService;
    }

    actionsAreAvailable(): boolean {
        if (this.selectionService.activeSelection) return true;
        return false;
    }

    initializeSelectionParameters(): void {
        this.selectionService.selection = this.selectionData;
        this.selectionService.origin = { x: 0, y: 0 };
        this.selectionService.destination = { x: this.width, y: this.height };
        this.selectionService.width = this.width;
        this.selectionService.height = this.height;
        this.selectionService.isEllipse = this.isEllipse;
        this.selectionService.isLasso = this.isLasso;
        if (this.isLasso) this.lassoService.polygonCoords = this.polygonCoords;
        this.selectionService.activeSelection = true;
        this.selectionService.initialSelection = true;
        this.selectionService.imageMoved = true;
        this.selectionService.clearUnderneath = true;
        this.selectionService.selectionTerminated = false;
    }
}
