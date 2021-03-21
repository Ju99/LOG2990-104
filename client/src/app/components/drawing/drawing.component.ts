import { CdkDragEnd, CdkDragMove } from '@angular/cdk/drag-drop';
import { ComponentType } from '@angular/cdk/portal';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { Vec2 } from '@app/classes/vec2';
import { CarouselComponent } from '@app/components/carousel/carousel-modal/carousel.component';
import { NewDrawModalComponent } from '@app/components/new-draw-modal/new-draw-modal.component';
import { SaveDrawingModalComponent } from '@app/components/save-drawing-modal/save-drawing-modal.component';
import { MIN_SIZE, ToolList, WORKING_AREA_LENGHT, WORKING_AREA_WIDTH } from '@app/constants';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { NewDrawingService } from '@app/services/new-drawing/new-drawing.service';
import { ToolManagerService } from '@app/services/tools/tool-manager.service';
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

    private baseCtx: CanvasRenderingContext2D;
    private previewCtx: CanvasRenderingContext2D;
    private cursorCtx: CanvasRenderingContext2D;
    private canvasSize: Vec2;
    private currentDrawing: ImageData;
    private subscription: Subscription;
    private positionX: number;
    private positionY: number;
    dragPosition: Vec2 = { x: 0, y: 0 };

    constructor(
        private route: ActivatedRoute,
        private drawingService: DrawingService,
        private toolManagerService: ToolManagerService,
        private cdr: ChangeDetectorRef,
        private newDrawingService: NewDrawingService,
        public dialog: MatDialog,
    ) {
        this.canvasSize = { x: MIN_SIZE, y: MIN_SIZE };

        this.subscription = this.newDrawingService.getCleanStatus().subscribe((isCleanRequest) => {
            if (isCleanRequest) {
                this.drawingService.baseCtx.beginPath();
                this.drawingService.baseCtx.clearRect(0, 0, this.canvasSize.x, this.canvasSize.y);
                this.drawingService.previewCtx.clearRect(0, 0, this.canvasSize.x, this.canvasSize.y);
            }
        });
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    ngOnInit(): void {
        this.route.params.subscribe((params) => {
            let path = params.url;
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

    @HostListener('document:keyup', ['$event'])
    handleKeyUp(event: KeyboardEvent): void {
        this.toolManagerService.handleKeyUp(event);
    }

    @HostListener('document:keydown', ['$event'])
    handleKeyDown(event: KeyboardEvent): void {
        this.modalHandler(event, NewDrawModalComponent, 'o');
        this.modalHandler(event, SaveDrawingModalComponent, 's');
        // this.modalHandler(event, ExportModalComponent, 'e');
        if (this.dialog.openDialogs.length < 1) {
            this.toolManagerService.handleHotKeysShortcut(event);
        }
        if (event.ctrlKey && event.key === 'g') {
            event.preventDefault();
            this.dialog.open(CarouselComponent, {});
        }
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

    private modalHandler(event: KeyboardEvent, component: ComponentType<NewDrawModalComponent | SaveDrawingModalComponent>, key: string): void {
        if (event.ctrlKey && event.key === key) {
            event.preventDefault();
            if (this.dialog.openDialogs.length === 0) {
                this.dialog.open(component, {});
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
}
