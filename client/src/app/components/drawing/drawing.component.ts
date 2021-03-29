import { CdkDragEnd, CdkDragMove } from '@angular/cdk/drag-drop';
import { ComponentType } from '@angular/cdk/portal';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { Vec2 } from '@app/classes/vec2';
import { CarouselComponent } from '@app/components/carousel/carousel-modal/carousel.component';
import { ExportModalComponent } from '@app/components/export-modal/export-modal.component';
import { NewDrawModalComponent } from '@app/components/new-draw-modal/new-draw-modal.component';
import { SaveDrawingModalComponent } from '@app/components/save-drawing-modal/save-drawing-modal.component';
import { MIN_SIZE, ToolList, WORKING_AREA_LENGHT, WORKING_AREA_WIDTH } from '@app/constants';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { NewDrawingService } from '@app/services/new-drawing/new-drawing.service';
import { MoveSelectionService } from '@app/services/tools/selection/move-selection.service';
import { SelectionService } from '@app/services/tools/selection/selection.service';
import { ToolManagerService } from '@app/services/tools/tool-manager.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-drawing',
    templateUrl: './drawing.component.html',
    styleUrls: ['./drawing.component.scss'],
})
export class DrawingComponent implements AfterViewInit, OnDestroy, OnInit {
    @ViewChild('baseCanvas', { static: false }) baseCanvas: ElementRef<HTMLCanvasElement>;
    @ViewChild('previewCanvas', { static: false }) previewCanvas: ElementRef<HTMLCanvasElement>;
    @ViewChild('cursorCanvas', { static: false }) cursorCanvas: ElementRef<HTMLCanvasElement>;
    @ViewChild('workingArea', { static: false }) workingArea: ElementRef<HTMLDivElement>;

    dragPosition: Vec2 = { x: 0, y: 0 };
    private baseCtx: CanvasRenderingContext2D;
    private previewCtx: CanvasRenderingContext2D;
    private cursorCtx: CanvasRenderingContext2D;
    private canvasSize: Vec2;
    private currentDrawing: ImageData;
    private subscription: Subscription;
    private positionX: number;
    private positionY: number;

    constructor(
        public toolManagerService: ToolManagerService,
        public moveSelectionService: MoveSelectionService,
        private route: ActivatedRoute,
        private drawingService: DrawingService,
        private cdr: ChangeDetectorRef,
        private newDrawingService: NewDrawingService,
        public dialog: MatDialog,
        private undoRedoService: UndoRedoService,
        private selectionService: SelectionService,
    ) {
        this.canvasSize = { x: MIN_SIZE, y: MIN_SIZE };
        this.subscription = this.newDrawingService.getCleanStatus().subscribe((isCleanRequest) => {
            if (isCleanRequest) {
                this.drawingService.baseCtx.beginPath();
                this.drawingService.baseCtx.clearRect(0, 0, this.canvasSize.x, this.canvasSize.y);
                this.drawingService.previewCtx.clearRect(0, 0, this.canvasSize.x, this.canvasSize.y);
                this.whiteBackgroundCanvas();
            }
        });
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    ngOnInit(): void {
        this.route.params.subscribe((params) => {
            const path = params.url;
            this.getNewImage(path).then((img) => {
                this.baseCtx.drawImage(img, 0, 0);
            });
        });
    }

    ngAfterViewInit(): void {
        this.workingArea.nativeElement.style.width = WORKING_AREA_WIDTH;
        this.workingArea.nativeElement.style.height = WORKING_AREA_LENGHT;

        this.baseCtx = this.baseCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.previewCtx = this.previewCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.cursorCtx = this.cursorCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.drawingService.baseCtx = this.baseCtx;
        this.drawingService.previewCtx = this.previewCtx;
        this.drawingService.cursorCtx = this.cursorCtx;
        this.drawingService.canvas = this.baseCanvas.nativeElement;

        this.canvasSize = { x: this.workingArea.nativeElement.offsetWidth / 2, y: this.workingArea.nativeElement.offsetHeight / 2 };
        if (this.canvasSize.x < MIN_SIZE || this.canvasSize.y < MIN_SIZE) {
            this.canvasSize = { x: MIN_SIZE, y: MIN_SIZE };
        }
        this.cdr.detectChanges();

        this.whiteBackgroundCanvas();
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
                this.toolManagerService.currentToolEnum === ToolList.SelectionEllipse
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

    onMouseLeave(event: MouseEvent): void {
        this.toolManagerService.onMouseLeave(event);
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

        if (event.ctrlKey && event.key === 'a') {
            event.preventDefault();
            this.toolManagerService.currentToolEnum = ToolList.SelectionRectangle;
            this.selectionService.selectAll();
            return;
        }

        if (this.toolManagerService.currentTool === this.selectionService || this.toolManagerService.currentTool === this.moveSelectionService) {
            if (event.key === 'ArrowLeft' || event.key === 'ArrowRight' || event.key === 'ArrowUp' || event.key === 'ArrowDown') {
                this.moveSelectionService.handleKeyDown(event);
            }
        }
        this.modalHandler(event, NewDrawModalComponent, 'o');
        this.modalHandler(event, SaveDrawingModalComponent, 's');
        this.modalHandler(event, CarouselComponent, 'g');
        this.modalHandler(event, ExportModalComponent, 'e');
        if (this.dialog.openDialogs.length < 1) {
            this.toolManagerService.handleHotKeysShortcut(event);
        }

        this.toolManagerService.handleHotKeysShortcut(event);
    }

    dragMoved(event: CdkDragMove, resizeX: boolean, resizeY: boolean): void {
        this.previewCanvas.nativeElement.style.borderStyle = 'dotted';
        this.positionX = event.pointerPosition.x - this.baseCanvas.nativeElement.getBoundingClientRect().left;
        this.positionY = event.pointerPosition.y;

        this.currentDrawing = this.baseCtx.getImageData(0, 0, this.canvasSize.x, this.canvasSize.y);

        if (resizeX && this.positionX > MIN_SIZE) {
            this.previewCanvas.nativeElement.width = this.positionX;
        }

        if (resizeY && this.positionY > MIN_SIZE) {
            this.previewCanvas.nativeElement.height = this.positionY;
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
                } else {
                    this.dialog.open(component, {});
                }
            }
            return;
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

    isCanvasBlank(): boolean {
        return !this.baseCtx.getImageData(0, 0, this.width, this.height).data.some((channel) => channel !== 0);
    }
    private whiteBackgroundCanvas(): void {
        this.baseCtx.beginPath();
        this.baseCtx.fillStyle = '#FFFFFF';
        this.baseCtx.fillRect(0, 0, this.canvasSize.x, this.canvasSize.y);
        this.baseCtx.closePath();
    }
}
