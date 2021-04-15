import { ComponentType } from '@angular/cdk/portal';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Vec2 } from '@app/classes/vec2';
import { CarouselComponent } from '@app/components/carousel/carousel-modal/carousel.component';
import { ExportModalComponent } from '@app/components/export-modal/export-modal.component';
import { NewDrawModalComponent } from '@app/components/new-draw-modal/new-draw-modal.component';
import { SaveDrawingModalComponent } from '@app/components/save-drawing-modal/save-drawing-modal.component';
import { ToolList } from '@app/constants';
import { ExportService } from '../export-image/export.service';
import { ClipboardService } from '../selection/clipboard.service';
import { MoveSelectionService } from '../selection/move-selection.service';
import { SelectionService } from '../tools/selection/selection.service';
import { ToolManagerService } from '../tools/tool-manager.service';
import { UndoRedoService } from '../undo-redo/undo-redo.service';

@Injectable({
    providedIn: 'root',
})
export class KeysHandlerService {
    canvasSize: Vec2;
    baseCtx: CanvasRenderingContext2D;

    constructor(
        public toolManagerService: ToolManagerService,
        public moveSelectionService: MoveSelectionService,
        public exportService: ExportService,
        public dialog: MatDialog,
        private undoRedoService: UndoRedoService,
        private selectionService: SelectionService,
        private clipboardService: ClipboardService,
    ) {}

    handleKeyDown(event: KeyboardEvent): void {
        this.modalHandler(event, NewDrawModalComponent, 'o');
        this.modalHandler(event, SaveDrawingModalComponent, 's');
        this.modalHandler(event, CarouselComponent, 'g');
        this.modalHandler(event, ExportModalComponent, 'e');

        if (this.selectionToolKeyHandler(event)) return;

        if (this.dialog.openDialogs.length < 1) {
            this.toolManagerService.handleHotKeysShortcut(event);
        }

        this.undoRedoToolKeyHandler(event);
    }

    handleKeyUp(event: KeyboardEvent): void {
        if (this.toolManagerService.currentTool === this.selectionService || this.toolManagerService.currentTool === this.moveSelectionService) {
            if (event.key === 'ArrowLeft' || event.key === 'ArrowRight' || event.key === 'ArrowUp' || event.key === 'ArrowDown') {
                this.moveSelectionService.handleKeyUp(event);
            }
        }

        this.toolManagerService.handleKeyUp(event);
    }

    private modalHandler(
        event: KeyboardEvent,
        component: ComponentType<NewDrawModalComponent | SaveDrawingModalComponent | CarouselComponent | ExportModalComponent>,
        key: string,
    ): void {
        if (event.ctrlKey && event.key === key) {
            event.preventDefault();
            if (this.dialog.openDialogs.length === 0) {
                if (key === 'g') {
                    console.log('carousel ouvert');
                    this.dialog.open(component, { data: this.isCanvasBlank() });
                }
                if (key === 'e') {
                    this.dialog.open(component, {});
                    this.exportService.imagePrevisualization();
                    this.exportService.initializeExportParams();
                } else {
                    this.dialog.open(component, {});
                }
            }
            return;
        }
    }

    private selectionToolKeyHandler(event: KeyboardEvent): boolean {
        if (event.ctrlKey && event.key === 'a') {
            event.preventDefault();
            this.toolManagerService.currentToolEnum = ToolList.SelectionRectangle;
            this.selectionService.selectAll();
        }

        if (this.toolManagerService.currentTool === this.selectionService || this.toolManagerService.currentTool === this.moveSelectionService) {
            if (event.ctrlKey) {
                switch (event.key) {
                    case 'c':
                        if (this.clipboardService.actionsAreAvailable()) this.clipboardService.copy();
                        break;
                    case 'x':
                        if (this.clipboardService.actionsAreAvailable()) this.clipboardService.cut();
                        break;
                    case 'v':
                        if (this.clipboardService.pasteAvailable) this.clipboardService.paste();
                        break;
                }
                return true;
            }

            if (event.key === 'Delete' && this.clipboardService.actionsAreAvailable()) this.clipboardService.delete();

            if (event.key === 'ArrowLeft' || event.key === 'ArrowRight' || event.key === 'ArrowUp' || event.key === 'ArrowDown') {
                this.moveSelectionService.handleKeyDown(event);
            }
        }
        return false;
    }

    private undoRedoToolKeyHandler(event: KeyboardEvent): void {
        if (event.ctrlKey && event.key === 'z' && this.undoRedoService.canUndo() && !this.toolManagerService.currentTool?.mouseDown) {
            event.preventDefault();
            this.undoRedoService.undo();
        }

        if (
            event.ctrlKey &&
            event.shiftKey &&
            event.code === 'KeyZ' &&
            this.undoRedoService.canRedo() &&
            !this.toolManagerService.currentTool?.mouseDown
        ) {
            event.preventDefault();
            this.undoRedoService.redo();
        }
    }

    private isCanvasBlank(): boolean {
        return !this.baseCtx.getImageData(0, 0, this.canvasSize.x, this.canvasSize.y).data.some((channel) => channel !== 0);
    }
}
