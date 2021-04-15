import { Injectable } from '@angular/core';
import { DrawingContextStyle } from '@app/classes/drawing-context-styles';
import { Segment, Utils } from '@app/classes/math-utils';
import { SelectionTool } from '@app/classes/selection';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { MouseButton } from '@app/constants';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { LineService } from '@app/services/tools/line/line.service';

const CLOSURE_AREA_RADIUS = 20;
const NB_MIN_SEGMENTS = 3;
const ERROR = 0.35;
const PIXEL_LENGTH = 4;
const DASH_LINE = 2;
const STYLES: DrawingContextStyle = {
    strokeStyle: 'black',
    fillStyle: 'black',
    lineWidth: 1,
};

@Injectable({
    providedIn: 'root',
})
export class LassoService extends Tool {
    confirmedSelection: boolean;
    selectionOver: boolean;
    polygonCoords: Vec2[];
    selectionData: ImageData;
    private currentSegment: Vec2[];
    private nbSegments: number;
    private areIntesected: boolean;
    private shiftKeyDown: boolean;
    private basePoint: Vec2 | undefined;
    private closestPoint: Vec2 | undefined;
    private isOutside: boolean;

    constructor(drawingService: DrawingService, private lineService: LineService) {
        super(drawingService);
        this.confirmedSelection = true;
        this.selectionOver = false;
        this.polygonCoords = [];
        this.currentSegment = [];
        this.nbSegments = 0;
        this.areIntesected = false;
        this.shiftKeyDown = false;
    }

    onMouseClick(event: MouseEvent): void {
        this.mouseDown = event.button === MouseButton.Left;
        this.mouseDownCoord = this.getPositionFromMouse(event);

        if (this.isOutside) return;
        this.currentSegment.push(this.mouseDownCoord);
    }

    onMouseMove(event: MouseEvent): void {
        this.mouseDownCoord = this.getPositionFromMouse(event);

        if (this.mouseDown) {
            const currentSegment = {
                initial: { x: this.polygonCoords[this.polygonCoords.length - 1].x, y: this.polygonCoords[this.polygonCoords.length - 1].y },
                final: { x: this.mouseDownCoord.x, y: this.mouseDownCoord.y },
            };

            if (this.currentSegmentIntersectsCanvas(currentSegment)) this.areIntesected = true;
            else this.areIntesected = false;

            this.checkIfCurrentSegmentIntersectWithPolygon();

            const color = this.areIntesected ? 'red' : 'black';
            const lineStyle: DrawingContextStyle = {
                strokeStyle: color,
                fillStyle: color,
                lineWidth: 1,
            };

            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.drawingService.previewCtx.setLineDash([DASH_LINE]);

            if (this.shiftKeyDown) {
                this.drawConstrainedLine(this.drawingService.previewCtx, this.polygonCoords, lineStyle, event);
            } else {
                this.currentSegment.push(this.mouseDownCoord);
                this.drawingService.previewCtx.setLineDash([2]);
                this.lineService.drawLine(this.drawingService.previewCtx, this.currentSegment, lineStyle);
            }
        }
    }

    onMouseUp(event: MouseEvent): void {
        this.mouseDownCoord = this.getPositionFromMouse(event);

        if (this.areIntesected) return;

        if (this.mouseClickOutsideCanvas(event)) {
            this.isOutside = true;
            return;
        }

        if (this.mouseDown) {
            this.drawingService.lassoPreviewCtx.setLineDash([DASH_LINE]);
            if (this.shiftKeyDown) {
                this.drawConstrainedLine(this.drawingService.lassoPreviewCtx, this.polygonCoords, STYLES, event);
            } else {
                this.currentSegment.push(this.mouseDownCoord);
                this.drawingService.lassoPreviewCtx.setLineDash([2]);
                this.lineService.drawLine(this.drawingService.lassoPreviewCtx, this.currentSegment, STYLES);
            }
        }

        this.polygonCoords.push(this.mouseDownCoord);
        this.nbSegments = this.polygonCoords.length - 1;
        this.mouseDown = false;
        this.clearCurrentSegment();

        this.mouseIsInClosureArea(this.mouseDownCoord);
    }

    handleKeyDown(event: KeyboardEvent): void {
        switch (event.key) {
            case 'Escape':
                this.resetAttributes();
                break;
            case 'Backspace':
                this.redrawPreviousState();
                break;
            case 'Shift':
                this.shiftKeyDown = true;
                break;
        }
    }

    handleKeyUp(event: KeyboardEvent): void {
        if (event.key === 'Shift') {
            this.shiftKeyDown = false;
        }
    }

    drawPolygon(ctx: CanvasRenderingContext2D, origin: Vec2): void {
        const polygonOrigin = Utils.findMinCoord(this.polygonCoords);
        Utils.translatePolygon(this.polygonCoords, polygonOrigin, origin);

        ctx.setLineDash([DASH_LINE]);
        for (let i = 1; i < this.polygonCoords.length; i++) {
            const segment: Vec2[] = [
                { x: this.polygonCoords[i - 1].x, y: this.polygonCoords[i - 1].y },
                { x: this.polygonCoords[i].x, y: this.polygonCoords[i].y },
            ];
            this.lineService.drawLine(this.drawingService.previewCtx, segment, STYLES);
        }

        const lastSegment = [
            { x: this.polygonCoords[this.polygonCoords.length - 1].x, y: this.polygonCoords[this.polygonCoords.length - 1].y },
            { x: this.polygonCoords[0].x, y: this.polygonCoords[0].y },
        ];
        this.lineService.drawLine(this.drawingService.previewCtx, lastSegment, STYLES);
    }

    drawConstrainedLine(ctx: CanvasRenderingContext2D, path: Vec2[], styles: DrawingContextStyle, event: MouseEvent): void {
        const mousePosition = this.getPositionFromMouse(event);
        this.basePoint = path[path.length - 1];
        this.closestPoint = this.lineService.calculatePosition(mousePosition, this.basePoint);
        ctx.lineWidth = styles.lineWidth;
        ctx.strokeStyle = styles.strokeStyle;
        ctx.beginPath();
        if (this.closestPoint) {
            ctx.moveTo(this.basePoint.x, this.basePoint.y);
            ctx.lineTo(this.closestPoint.x, this.closestPoint.y);
            ctx.stroke();
        }
    }

    checkPixelInPolygon(selection: SelectionTool): ImageData {
        const imageData = selection.image.data;
        let pixelCounter = 0;

        for (let i = selection.origin.y; i < selection.origin.y + selection.height; i++) {
            for (let j = selection.origin.x; j < selection.origin.x + selection.width; j++) {
                if (!Utils.pointInPolygon({ x: j, y: i }, this.polygonCoords)) {
                    imageData[pixelCounter + PIXEL_LENGTH - 1] = 0;
                }
                pixelCounter += PIXEL_LENGTH;
            }
        }
        return selection.image;
    }

    calculatePath2d(): Path2D {
        const polygon = new Path2D();
        polygon.moveTo(this.polygonCoords[0].x, this.polygonCoords[0].y);
        for (let i = 1; i < this.polygonCoords.length; i++) {
            polygon.lineTo(this.polygonCoords[i].x, this.polygonCoords[i].y);
        }
        polygon.lineTo(this.polygonCoords[0].x, this.polygonCoords[0].y);
        return polygon;
    }

    printPolygon(imageData: ImageData, selection: SelectionTool): void {
        const canvas = document.createElement('canvas');
        canvas.width = selection.width;
        canvas.height = selection.height;
        const tmp = canvas.getContext('2d') as CanvasRenderingContext2D;
        tmp.putImageData(imageData, 0, 0);
        this.drawingService.baseCtx.save();
        this.drawingService.baseCtx.clip(this.calculatePath2d());

        this.drawingService.baseCtx.drawImage(tmp.canvas, selection.origin.x, selection.origin.y);
        this.drawingService.baseCtx.restore();
    }

    resetAttributes(): void {
        this.mouseDown = false;
        this.nbSegments = 0;
        this.areIntesected = false;
        this.shiftKeyDown = false;
        this.clearCurrentSegment();
        this.clearPolygonCoords();
        this.drawingService.clearCanvas(this.drawingService.lassoPreviewCtx);
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
    }

    private segmentsAreConfused(segment1: Segment, segment2: Segment): boolean {
        const areConfused = Utils.findAngleBetweenTwoSegments(segment1, segment2) <= ERROR;
        if (areConfused) {
            this.areIntesected = true;
            return areConfused;
        }
        return false;
    }

    private mouseIsInClosureArea(mouseCoord: Vec2): void {
        if (
            Utils.pointInCircle(mouseCoord, this.polygonCoords[0], CLOSURE_AREA_RADIUS) &&
            this.nbSegments >= NB_MIN_SEGMENTS &&
            !this.areIntesected
        ) {
            this.polygonCoords.pop();
            const finalSegment: Vec2[] = [
                { x: this.polygonCoords[this.polygonCoords.length - 1].x, y: this.polygonCoords[this.polygonCoords.length - 1].y },
                { x: this.polygonCoords[0].x, y: this.polygonCoords[0].y },
            ];
            this.clearCurrentSegment();
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.lineService.drawLine(this.drawingService.lassoPreviewCtx, finalSegment, STYLES);
            this.mouseDown = false;
            this.confirmedSelection = false;
            this.selectionOver = true;
            this.drawingService.clearCanvas(this.drawingService.lassoPreviewCtx);
        }
    }

    private redrawPreviousState(): void {
        this.clearCurrentSegment();
        this.drawingService.clearCanvas(this.drawingService.lassoPreviewCtx);
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.polygonCoords.pop();
        for (let i = 1; i < this.polygonCoords.length; i++) {
            const segment: Vec2[] = [
                { x: this.polygonCoords[i - 1].x, y: this.polygonCoords[i - 1].y },
                { x: this.polygonCoords[i].x, y: this.polygonCoords[i].y },
            ];
            this.lineService.drawLine(this.drawingService.lassoPreviewCtx, segment, STYLES);
        }
    }

    private checkIfCurrentSegmentIntersectWithPolygon(): void {
        let segment1: Segment;
        let segment2: Segment;

        for (let i = 1; i < this.polygonCoords.length - 1; i++) {
            segment1 = {
                initial: { x: this.polygonCoords[i - 1].x, y: this.polygonCoords[i - 1].y },
                final: { x: this.polygonCoords[i].x, y: this.polygonCoords[i].y },
            };
            segment2 = {
                initial: { x: this.polygonCoords[this.polygonCoords.length - 1].x, y: this.polygonCoords[this.polygonCoords.length - 1].y },
                final: { x: this.mouseDownCoord.x, y: this.mouseDownCoord.y },
            };

            const adjacentSegment: Segment = {
                initial: { x: this.polygonCoords[this.polygonCoords.length - 1].x, y: this.polygonCoords[this.polygonCoords.length - 1].y },
                final: { x: this.polygonCoords[this.polygonCoords.length - 2].x, y: this.polygonCoords[this.polygonCoords.length - 2].y },
            };

            if (
                Utils.segmentsDoIntersect(segment1, segment2) ||
                this.segmentsAreConfused(adjacentSegment, segment2) ||
                this.currentSegmentIntersectsCanvas(segment2)
            ) {
                this.areIntesected = true;
                break;
            } else {
                this.areIntesected = false;
            }
        }
    }

    private currentSegmentIntersectsCanvas(currentSegment: Segment): boolean {
        const canvasSegments: Segment[] = [
            {
                initial: { x: 0, y: 0 },
                final: { x: this.drawingService.canvas.width, y: 0 },
            },
            {
                initial: { x: this.drawingService.canvas.width, y: 0 },
                final: { x: this.drawingService.canvas.width, y: this.drawingService.canvas.height },
            },
            {
                initial: { x: this.drawingService.canvas.width, y: this.drawingService.canvas.height },
                final: { x: 0, y: this.drawingService.canvas.height },
            },
            {
                initial: { x: 0, y: this.drawingService.canvas.height },
                final: { x: 0, y: 0 },
            },
        ];

        for (const segment of canvasSegments) {
            if (Utils.segmentsDoIntersect(currentSegment, segment)) {
                this.areIntesected = true;
                return true;
            }
        }
        return false;
    }

    private mouseClickOutsideCanvas(event: MouseEvent): boolean {
        const position = this.getPositionFromMouse(event);
        return position.x > this.drawingService.canvas.width || position.y > this.drawingService.canvas.height;
    }

    private clearCurrentSegment(): void {
        this.currentSegment = [];
    }

    private clearPolygonCoords(): void {
        this.polygonCoords = [];
    }
}
