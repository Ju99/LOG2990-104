import { Injectable } from '@angular/core';
import { Utils } from '@app/classes/math-utils';
import { SelectionTool } from '@app/classes/selection';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { MouseButton } from '@app/constants';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ResizeSelectionService } from '@app/services/selection/resize-selection.service';
import { RectangleService } from '@app/services/tools//rectangle/rectangle.service';
import { EllipseService } from '@app/services/tools/ellipse/ellipse.service';
import { EllipseSelectionService } from '@app/services/tools/selection/ellipse-selection/ellipse-selection.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { SelectionUtilsService } from '@app/services/utils/selection-utils.service';
import { LassoService } from './lasso/lasso.service';

@Injectable({
    providedIn: 'root',
})
export class SelectionService extends Tool {
    selection: ImageData;
    origin: Vec2;
    firstOrigin: Vec2;
    destination: Vec2;
    isEllipse: boolean;
    isLasso: boolean;
    activeSelection: boolean;
    newSelection: boolean;
    initialSelection: boolean;
    imageMoved: boolean;
    clearUnderneath: boolean;
    selectionTerminated: boolean;
    selectionDeleted: boolean;
    width: number;
    initialWidth: number;
    height: number;
    initialHeight: number;
    selectionObject: SelectionTool;

    constructor(
        public drawingService: DrawingService,
        private rectangleService: RectangleService,
        private ellipseService: EllipseService,
        private lassoService: LassoService,
        private ellipseSelectionService: EllipseSelectionService,
        private undoRedoService: UndoRedoService,
        private resizeSelectionService: ResizeSelectionService,
        private selectionUtilsService: SelectionUtilsService,
    ) {
        super(drawingService);
        this.isEllipse = false;
        this.isLasso = false;
        this.activeSelection = false;
        this.newSelection = true;
        this.initialSelection = true;
        this.imageMoved = false;
        this.clearUnderneath = true;
        this.selectionTerminated = false;
        this.selectionDeleted = false;
        this.firstOrigin = { x: 0, y: 0 };
    }

    onMouseClick(event: MouseEvent): void {
        if (this.isLasso && !this.lassoService.selectionOver && this.newSelection && !this.selectionUtilsService.isResizing) {
            this.selectionTerminated = false;
            this.lassoService.onMouseClick(event);
            return;
        }
    }

    onMouseDown(event: MouseEvent): void {
        this.mouseDown = event.button === MouseButton.Left;
        this.handleResizedSelectionOnMouseDown(event);
        this.handleActiveSelectionOnMouseDown(event);
        this.handleActiveLassoSelectionOnMouseDown(event);
    }

    onMouseMove(event: MouseEvent): void {
        if (this.isLasso && !this.lassoService.selectionOver) this.lassoService.onMouseMove(event);

        if (this.mouseDown) {
            if (this.selectionUtilsService.isResizing) {
                this.selectionUtilsService.resizeSelection(this.drawingService.previewCtx, this.getPositionFromMouse(event), this.selectionObject);
                return;
            }

            if (this.isEllipse) this.ellipseService.onMouseMove(event);
            else this.rectangleService.onMouseMove(event);
        }

        this.handleActiveSelectionOnMouseMove(event);
    }

    onMouseUp(event: MouseEvent): void {
        if (this.isLasso && !this.lassoService.selectionOver) this.lassoService.onMouseUp(event);

        this.handleLassoSelectionWhenOverOnMouseUp(event);
        this.handleActiveSelectionOnMouseUp();
        this.handleResizedSelectionOnMouseUp();
    }

    onMouseLeave(event: MouseEvent): void {
        if (this.mouseDown && !this.isLasso) this.onMouseUp(event);
    }

    handleKeyDown(event: KeyboardEvent): void {
        if (this.isEllipse) this.ellipseService.handleKeyDown(event);
        else if (this.isLasso && !this.lassoService.selectionOver) this.lassoService.handleKeyDown(event);
        else this.rectangleService.handleKeyDown(event);

        if (event.key === 'Escape') {
            event.preventDefault();
            this.terminateSelection();
        }

        if (event.key === 'Shift') {
            this.resizeSelectionService.handleKeyDown(event);
        }
    }

    handleKeyUp(event: KeyboardEvent): void {
        if (event.key === 'Shift') {
            this.resizeSelectionService.handleKeyUp(event);
        }

        if (this.isEllipse) this.ellipseService.handleKeyUp(event);
        else if (this.isLasso) this.lassoService.handleKeyUp(event);
        else this.rectangleService.handleKeyUp(event);
    }

    selectAll(): void {
        this.activeSelection = true;
        this.newSelection = true;
        this.initialSelection = true;
        this.clearUnderneath = true;
        this.selectionTerminated = false;
        this.origin = { x: 0, y: 0 };
        this.destination = { x: this.drawingService.canvas.width, y: this.drawingService.canvas.height };
        this.width = this.destination.x;
        this.height = this.destination.y;

        this.printMovedSelection();
        this.selection = this.drawingService.baseCtx.getImageData(this.origin.x, this.origin.y, this.destination.x, this.destination.y);
        this.selectionUtilsService.createBoundaryBox(this.selectionObject);
    }

    terminateSelection(): void {
        if (this.activeSelection) {
            if (!this.selectionDeleted) {
                this.imageMoved = true;
                this.printMovedSelection();
            }
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.selectionUtilsService.resetParametersTools();
            this.lassoService.selectionOver = false;
            this.lassoService.resetAttributes();

            this.activeSelection = false;
            this.newSelection = true;
            this.imageMoved = false;
            this.selectionTerminated = true;
            this.mouseDown = false;
        }
    }

    printMovedSelection(): void {
        if (this.imageMoved) {
            this.imageMoved = false;
            this.selectionObject.origin = this.origin;
            if (this.isEllipse) this.ellipseSelectionService.printEllipse(this.selectionObject);
            else if (this.isLasso) this.lassoService.printPolygon(this.selection, this.selectionObject);
            else this.drawingService.baseCtx.putImageData(this.selection, this.origin.x, this.origin.y);
            this.addToUndoStack();
        }
    }

    getSelectionData(ctx: CanvasRenderingContext2D): void {
        this.selection = ctx.getImageData(this.origin.x, this.origin.y, this.width, this.height);
        this.initialseSelectionObject();
        if (this.isEllipse) {
            this.selection = this.ellipseSelectionService.checkPixelInEllipse(this.selectionObject);
        } else if (this.isLasso) {
            this.selection = this.lassoService.checkPixelInPolygon(this.selectionObject);
        }
        this.selectionObject.image = this.selection;
    }

    initialiseServiceDimensions(): void {
        this.origin = this.selectionObject.origin;
        this.destination = this.selectionObject.destination;
        this.width = this.selectionObject.width;
        this.height = this.selectionObject.height;
    }

    private handleResizedSelectionOnMouseDown(event: MouseEvent): void {
        if (this.mouseDown) {
            if (this.activeSelection) {
                this.resizeSelectionService.controlPointsCoord = this.selectionUtilsService.controlPointsCoord;
                this.selectionUtilsService.isResizing = this.resizeSelectionService.checkIfMouseIsOnControlPoint(this.getPositionFromMouse(event));
                this.clearUnderneath = true;
            }
        }
    }

    private handleActiveSelectionOnMouseDown(event: MouseEvent): void {
        if (this.mouseDown && !this.isLasso && !this.selectionUtilsService.isResizing) {
            this.clearUnderneath = true;
            this.initialSelection = true;
            this.selectionTerminated = false;
            this.selectionUtilsService.initializeToolParameters();
            this.printMovedSelection();
            this.selectionObject = new SelectionTool({ x: 0, y: 0 }, { x: 0, y: 0 }, 0, 0);
            this.selectionDeleted = false;

            if (this.isEllipse) this.ellipseService.onMouseDown(event);
            else this.rectangleService.onMouseDown(event);
        }
    }

    private handleActiveLassoSelectionOnMouseDown(event: MouseEvent): void {
        if (this.isLasso && this.newSelection && this.activeSelection) {
            this.lassoService.selectionOver = false;
            this.terminateSelection();
        }
    }

    private handleActiveSelectionOnMouseMove(event: MouseEvent): void {
        if (this.activeSelection && !this.selectionTerminated) {
            if (this.selectionUtilsService.mouseInSelectionArea(this.origin, this.destination, this.getPositionFromMouse(event))) {
                this.newSelection = false;
            } else {
                this.newSelection = true;
            }
        }
    }

    private handleLassoSelectionWhenOverOnMouseUp(event: MouseEvent): void {
        if (this.isLasso && this.lassoService.selectionOver) {
            this.activeSelection = true;
            this.initialSelection = true;
            this.clearUnderneath = true;
            this.selectionObject = new SelectionTool({ x: 0, y: 0 }, { x: 0, y: 0 }, 0, 0);
            this.calculateDimension();
            this.getSelectionData(this.drawingService.baseCtx);
            this.selectionUtilsService.createBoundaryBox(this.selectionObject);
        }
    }

    private handleResizedSelectionOnMouseUp(): void {
        if (this.selectionUtilsService.isResizing) {
            this.initialSelection = true;
            this.imageMoved = true;
            this.mouseDown = false;
            this.selectionObject = this.selectionUtilsService.endResizeSelection();
            this.initialiseServiceDimensions();
            this.getSelectionData(this.drawingService.previewCtx);
            this.selectionUtilsService.createBoundaryBox(this.selectionObject);
        }
    }

    private handleActiveSelectionOnMouseUp(): void {
        if (this.mouseDown && !this.isLasso && !this.selectionUtilsService.isResizing) {
            this.activeSelection = true;
            this.mouseDown = false;
            this.calculateDimension();
            this.getSelectionData(this.drawingService.baseCtx);
            this.selectionUtilsService.createControlPoints(this.selectionObject);
            this.selectionUtilsService.resetParametersTools();
        }
    }

    private calculateDimension(): void {
        if (this.isEllipse) {
            this.origin = this.ellipseService.pathData[0];
            this.destination = this.ellipseService.pathData[this.ellipseService.pathData.length - 1];
        } else if (this.isLasso) {
            this.origin = Utils.findMinCoord(this.lassoService.polygonCoords);
            this.destination = Utils.findMaxCoord(this.lassoService.polygonCoords);
        } else {
            this.origin = this.rectangleService.pathData[0];
            this.destination = this.rectangleService.pathData[this.rectangleService.pathData.length - 1];
        }
        this.width = this.destination.x - this.origin.x;
        this.height = this.destination.y - this.origin.y;
        this.firstOrigin.x = this.origin.x;
        this.firstOrigin.y = this.origin.y;
        this.initialseSelectionObject();

        this.selectionObject = this.selectionUtilsService.reajustOriginAndDestination(this.selectionObject);
        this.initialWidth = this.width;
        this.initialHeight = this.height;

        this.initialiseServiceDimensions();
    }

    private initialseSelectionObject(): void {
        this.selectionObject.origin = this.origin;
        this.selectionObject.initialOrigin = this.firstOrigin;
        this.selectionObject.initialWidth = this.initialWidth;
        this.selectionObject.initialHeight = this.initialHeight;
        this.selectionObject.destination = this.destination;
        this.selectionObject.width = this.width;
        this.selectionObject.height = this.height;
        this.selectionObject.image = this.selection;
        this.selectionObject.isEllipse = this.isEllipse;
        this.selectionObject.isLasso = this.isLasso;
        if (this.isLasso) {
            this.selectionObject.polygonCoords = this.lassoService.polygonCoords;
            this.selectionObject.clearImageDataPolygon = this.drawingService.baseCtx.getImageData(
                this.origin.x,
                this.origin.y,
                this.width,
                this.height,
            );
        }
    }

    private addToUndoStack(): void {
        this.initialseSelectionObject();
        this.undoRedoService.addToStack(this.selectionObject);
        this.undoRedoService.setToolInUse(false);
    }
}
