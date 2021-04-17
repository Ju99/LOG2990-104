import { CdkDragEnd, CdkDragMove } from '@angular/cdk/drag-drop';
import { ComponentType } from '@angular/cdk/portal';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, OnChanges, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { Vec2 } from '@app/classes/vec2';
import { CarouselComponent } from '@app/components/carousel/carousel-modal/carousel.component';
import { ExportModalComponent } from '@app/components/export-modal/export-modal.component';
import { NewDrawModalComponent } from '@app/components/new-draw-modal/new-draw-modal.component';
import { SaveDrawingModalComponent } from '@app/components/save-drawing-modal/save-drawing-modal.component';
import { MIN_SIZE, ToolList, WORKING_AREA_LENGHT, WORKING_AREA_WIDTH } from '@app/constants';
import { AutoSaveService } from '@app/services/auto-save/auto-save.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ExportService } from '@app/services/export-image/export.service';
import { NewDrawingService } from '@app/services/new-drawing/new-drawing.service';
import { ClipboardService } from '@app/services/selection/clipboard.service';
import { MoveSelectionService } from '@app/services/selection/move-selection.service';
import { SelectionService } from '@app/services/tools/selection/selection.service';
import { ToolManagerService } from '@app/services/tools/tool-manager.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { DrawingData } from '@common/communication/drawing-data';
import { Subscription, throwError } from 'rxjs';

@Component({
    selector: 'app-drawing',
    templateUrl: './drawing.component.html',
    styleUrls: ['./drawing.component.scss'],
})
export class DrawingComponent implements AfterViewInit, OnDestroy, OnInit, OnChanges {
    @ViewChild('baseCanvas', { static: false }) baseCanvas: ElementRef<HTMLCanvasElement>;
    @ViewChild('previewCanvas', { static: false }) previewCanvas: ElementRef<HTMLCanvasElement>;
    @ViewChild('gridCanvas', { static: false }) gridCanvas: ElementRef<HTMLCanvasElement>;
    @ViewChild('cursorCanvas', { static: false }) cursorCanvas: ElementRef<HTMLCanvasElement>;
    @ViewChild('workingArea', { static: false }) workingArea: ElementRef<HTMLDivElement>;
    @ViewChild('lassoPreviewCanvas', { static: false }) lassoPreviewCanvas: ElementRef<HTMLCanvasElement>;

    dragPosition: Vec2 = { x: 0, y: 0 };
    private baseCtx: CanvasRenderingContext2D;
    private previewCtx: CanvasRenderingContext2D;
    private gridCtx: CanvasRenderingContext2D;
    private cursorCtx: CanvasRenderingContext2D;
    private lassoPreviewCtx: CanvasRenderingContext2D;
    private canvasSize: Vec2;
    private currentDrawing: ImageData;
    private subscription: Subscription;
    private positionX: number;
    private positionY: number;
    private drawing: DrawingData;

    constructor(
        public toolManagerService: ToolManagerService,
        public moveSelectionService: MoveSelectionService,
        public exportService: ExportService,
        public dialog: MatDialog,
        private route: ActivatedRoute,
        private drawingService: DrawingService,
        private cdr: ChangeDetectorRef,
        private newDrawingService: NewDrawingService,
        private undoRedoService: UndoRedoService,
        private selectionService: SelectionService,
        private autoSaveService: AutoSaveService,
        private clipboardService: ClipboardService,
    ) {
        this.canvasSize = { x: MIN_SIZE, y: MIN_SIZE };
        this.subscription = this.newDrawingService.getCleanStatus().subscribe((isCleanRequest) => {
            if (isCleanRequest) {
                this.drawingService.baseCtx.beginPath();
                this.drawingService.baseCtx.clearRect(0, 0, this.canvasSize.x, this.canvasSize.y);
                this.drawingService.previewCtx.clearRect(0, 0, this.canvasSize.x, this.canvasSize.y);
                this.drawingService.lassoPreviewCtx.clearRect(0, 0, this.canvasSize.x, this.canvasSize.y);
                this.drawingService.gridCtx.clearRect(0, 0, this.canvasSize.x, this.canvasSize.y);
                this.whiteBackgroundCanvas();
            }
        });
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    ngOnInit(): void {
        this.route.params.subscribe((params) => {
            if (params.url) {
                const path = params.url;
                this.getNewImage(path)
                    .then((img) => {
                        this.baseCtx.drawImage(img, 0, 0);
                    })
                    .catch((error) => {
                        return throwError(error);
                    });
            }
        });
    }

    ngAfterViewInit(): void {
        this.workingArea.nativeElement.style.width = WORKING_AREA_WIDTH;
        this.workingArea.nativeElement.style.height = WORKING_AREA_LENGHT;

        this.baseCtx = this.baseCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.previewCtx = this.previewCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.cursorCtx = this.cursorCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.lassoPreviewCtx = this.lassoPreviewCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.gridCtx = this.gridCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.drawingService.baseCtx = this.baseCtx;
        this.drawingService.previewCtx = this.previewCtx;
        this.drawingService.cursorCtx = this.cursorCtx;
        this.drawingService.lassoPreviewCtx = this.lassoPreviewCtx;
        this.drawingService.gridCtx = this.gridCtx;
        this.drawingService.canvas = this.baseCanvas.nativeElement;
        this.drawingService.gridCanvas = this.gridCanvas.nativeElement;

        this.canvasSize = { x: this.workingArea.nativeElement.offsetWidth / 2, y: this.workingArea.nativeElement.offsetHeight / 2 };
        if (this.canvasSize.x < MIN_SIZE || this.canvasSize.y < MIN_SIZE) {
            this.canvasSize = { x: MIN_SIZE, y: MIN_SIZE };
        }

        window.onload = () => {
            this.autoSaveService.loadImage();
            this.canvasSize.x = this.autoSaveService.localDrawing.width;
            this.canvasSize.y = this.autoSaveService.localDrawing.height;
        };

        this.cdr.detectChanges();

        this.whiteBackgroundCanvas();
    }

    ngOnChanges(): void {
        this.route.params.subscribe((params) => {
            console.log(params.height, params.width);

            if (params.height && params.width) {
                this.canvasSize.x = params.width;
                this.canvasSize.y = params.height;
            }
        });
    }

    mouseCoord(event: MouseEvent): Vec2 {
        return { x: event.offsetX, y: event.offsetY };
    }

    onMouseMove(event: MouseEvent): void {
        const ELEMENT = event.target as HTMLElement;

        if (this.toolManagerService.currentToolEnum === ToolList.Eraser) {
            this.drawingService.cursorCtx = this.cursorCtx;
        } else {
            this.cursorCtx.clearRect(0, 0, this.cursorCanvas.nativeElement.width, this.cursorCanvas.nativeElement.height);
        }

        if (!ELEMENT.className.includes('box')) {
            this.toolManagerService.onMouseMove(event, this.mouseCoord(event));

            if (
                this.toolManagerService.currentToolEnum === ToolList.SelectionRectangle ||
                this.toolManagerService.currentToolEnum === ToolList.SelectionEllipse ||
                this.toolManagerService.currentToolEnum === ToolList.Lasso
            ) {
                if (!this.selectionService.newSelection) {
                    this.toolManagerService.currentTool = this.moveSelectionService;
                } else {
                    this.toolManagerService.currentTool = this.selectionService;
                }
            }
        }
    }

    onMouseDown(event: MouseEvent): void {
        const ELEMENT = event.target as HTMLElement;

        if (!ELEMENT.className.includes('box')) {
            this.toolManagerService.onMouseDown(event, this.mouseCoord(event));
        }
    }

    onMouseUp(event: MouseEvent): void {
        const ELEMENT = event.target as HTMLElement;
        if (!ELEMENT.className.includes('box')) {
            this.toolManagerService.onMouseUp(event, this.mouseCoord(event));
        }
        this.drawing = {
            title: '',
            width: this.drawingService.canvas.width,
            height: this.drawingService.canvas.height,
            body: this.drawingService.canvas.toDataURL(),
        };
        this.autoSaveService.saveCanvasState(this.drawing);
    }

    onMouseLeave(event: MouseEvent): void {
        this.toolManagerService.onMouseLeave(event);
    }

    @HostListener('click', ['$event'])
    onMouseClick(event: MouseEvent): void {
        const ELEMENT = event.target as HTMLElement;
        if (!ELEMENT.className.includes('box')) {
            this.toolManagerService.onMouseClick(event);
        }
    }

    @HostListener('dblclick', ['$event'])
    onMouseDoubleClick(event: MouseEvent): void {
        this.toolManagerService.onMouseDoubleClick(event);
    }

    @HostListener('document:keyup', ['$event'])
    handleKeyUp(event: KeyboardEvent): void {
        if (this.toolManagerService.currentTool === this.selectionService || this.toolManagerService.currentTool === this.moveSelectionService) {
            if (event.key === 'ArrowLeft' || event.key === 'ArrowRight' || event.key === 'ArrowUp' || event.key === 'ArrowDown') {
                this.moveSelectionService.handleKeyUp(event);
            }
        }

        this.toolManagerService.handleKeyUp(event);
    }

    // tslint:disable
    @HostListener('document:keydown', ['$event'])
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

    dragMoved(event: CdkDragMove, resizeX: boolean, resizeY: boolean): void {
        this.previewCanvas.nativeElement.style.borderStyle = 'dotted';
        this.positionX = event.pointerPosition.x - this.baseCanvas.nativeElement.getBoundingClientRect().left;
        this.positionY = event.pointerPosition.y;

        this.currentDrawing = this.baseCtx.getImageData(0, 0, this.canvasSize.x, this.canvasSize.y);

        if (resizeX && this.positionX > MIN_SIZE) {
            this.previewCanvas.nativeElement.width = this.positionX;
            this.gridCanvas.nativeElement.width = this.positionX;
        }

        if (resizeY && this.positionY > MIN_SIZE) {
            this.previewCanvas.nativeElement.height = this.positionY;
            this.gridCanvas.nativeElement.height = this.positionY;
        }
    }

    dragEnded(event: CdkDragEnd): void {
        const NEW_WIDTH: number = this.canvasSize.x + event.distance.x;
        const NEW_HEIGHT: number = this.canvasSize.y + event.distance.y;

        this.previewCanvas.nativeElement.style.borderStyle = 'solid';

        if (NEW_WIDTH >= MIN_SIZE) {
            this.canvasSize.x = NEW_WIDTH;
        } else {
            this.canvasSize.x = MIN_SIZE;
        }

        if (NEW_HEIGHT >= MIN_SIZE) {
            this.canvasSize.y = NEW_HEIGHT;
        } else {
            this.canvasSize.y = MIN_SIZE;
        }

        setTimeout(() => {
            this.whiteBackgroundCanvas();
            this.baseCtx.putImageData(this.currentDrawing, 0, 0);
            this.drawing = {
                title: '',
                width: this.drawingService.canvas.width,
                height: this.drawingService.canvas.height,
                body: this.drawingService.canvas.toDataURL(),
            };
            this.autoSaveService.saveCanvasState(this.drawing);
        }, 0);
    }

    changePosition(): void {
        this.dragPosition = { x: this.dragPosition.x, y: this.dragPosition.y };
    }

    get width(): number {
        return this.canvasSize.x;
    }

    get height(): number {
        return this.canvasSize.y;
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

    async getNewImage(src: string): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            img.onload = () => {
                resolve(img);
            };
            img.onerror = (err: string | Event) => {
                reject(err);
            };
            img.src = src;
        });
    }

    private isCanvasBlank(): boolean {
        return !this.baseCtx.getImageData(0, 0, this.width, this.height).data.some((channel) => channel !== 0);
    }

    private whiteBackgroundCanvas(): void {
        if (this.drawingService.isGridEnabled) {
            this.drawingService.setGrid();
        }
        this.baseCtx.beginPath();
        this.baseCtx.fillStyle = '#FFFFFF';
        this.baseCtx.fillRect(0, 0, this.canvasSize.x, this.canvasSize.y);
        this.baseCtx.closePath();
    }
}
