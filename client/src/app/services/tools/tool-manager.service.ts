import { Injectable } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { ToolList } from '@app/constants';
import { MoveSelectionService } from '@app/services/selection/move-selection.service';
import { SprayService } from '@app/services/tools/spray/spray.service';
import { EllipseService } from './ellipse/ellipse.service';
import { EraserService } from './eraser/eraser.service';
import { LineService } from './line/line.service';
import { PaintBucketService } from './paint-bucket/paint-bucket.service';
import { PencilService } from './pencil/pencil-service';
import { PipetteService } from './pipette/pipette.service';
import { PolygonService } from './polygon/polygon.service';
import { RectangleService } from './rectangle/rectangle.service';
import { SelectionService } from './selection/selection.service';
import { StampService } from './stamp/stamp.service';
import { TextService } from './text/text.service';

@Injectable({
    providedIn: 'root',
})
export class ToolManagerService {
    toolList: ToolList;
    currentTool: Tool | undefined;
    currentToolEnum: ToolList | undefined;

    serviceBindings: Map<ToolList, Tool>;
    keyBindings: Map<string, Tool>;

    constructor(
        private pencilService: PencilService,
        private lineService: LineService,
        private eraserService: EraserService,
        private ellipseService: EllipseService,
        private rectangleService: RectangleService,
        private paintBucketService: PaintBucketService,
        private pipetteService: PipetteService,
        private polygonService: PolygonService,
        private sprayService: SprayService,
        private selectionService: SelectionService,
        private moveSelectionService: MoveSelectionService,
        private stampService: StampService,
        private textService: TextService,
    ) {
        this.currentTool = this.pencilService;
        this.currentToolEnum = ToolList.Pencil;

        this.serviceBindings = new Map<ToolList, Tool>();
        this.serviceBindings
            .set(ToolList.Pencil, this.pencilService)
            .set(ToolList.Ellipse, this.ellipseService)
            .set(ToolList.Rectangle, this.rectangleService)
            .set(ToolList.Polygon, this.polygonService)
            .set(ToolList.Eraser, this.eraserService)
            .set(ToolList.Line, this.lineService)
            .set(ToolList.Pipette, this.pipetteService)
            .set(ToolList.Spray, this.sprayService)
            .set(ToolList.SelectionRectangle, this.selectionService)
            .set(ToolList.SelectionEllipse, this.selectionService)
            .set(ToolList.MoveSelection, this.moveSelectionService)
            .set(ToolList.Stamp, this.stampService)
            .set(ToolList.Lasso, this.selectionService)
            .set(ToolList.PaintBucket, this.paintBucketService)
            .set(ToolList.MoveSelection, this.moveSelectionService)
            .set(ToolList.Text, this.textService);

        this.keyBindings = new Map<string, Tool>();
        this.keyBindings
            .set('c', this.pencilService)
            .set('1', this.rectangleService)
            .set('2', this.ellipseService)
            .set('l', this.lineService)
            .set('e', this.eraserService)
            .set('i', this.pipetteService)
            .set('3', this.polygonService)
            .set('a', this.sprayService)
            .set('r', this.selectionService)
            .set('s', this.selectionService)
            .set('d', this.stampService)
            .set('v', this.selectionService)
            .set('b', this.paintBucketService)
            .set('t', this.textService);
    }

    private getEnumFromMap(map: Map<ToolList, Tool>, searchValue: Tool | undefined): ToolList | undefined {
        for (const [key, value] of map.entries()) {
            if (value === searchValue) return key;
        }
        return undefined;
    }

    handleHotKeysShortcut(event: KeyboardEvent): void {
        if (this.currentTool && (event.key === 'Shift' || event.key === 'Backspace' || event.key === 'Escape' || event.key === 'Alt')) {
            this.currentTool.handleKeyDown(event);
        } else if (this.textService.isWriting === false) {
            this.switchToolWithKeys(event.key);
        }
    }

    switchToolWithKeys(keyShortcut: string): void {
        if (this.keyBindings.has(keyShortcut)) {
            this.currentTool = this.keyBindings.get(keyShortcut);
            if (keyShortcut === 's') {
                this.currentToolEnum = ToolList.SelectionEllipse;
            } else if (keyShortcut === 'v') {
                this.currentToolEnum = ToolList.Lasso;
            } else {
                this.currentToolEnum = this.getEnumFromMap(this.serviceBindings, this.currentTool);
            }
            this.isSelectionEllipse();
            this.isLasso();
        }
    }

    switchTool(tool: ToolList): void {
        if (this.currentTool instanceof SelectionService) this.selectionService.terminateSelection();

        if (this.currentTool instanceof TextService) this.textService.write();

        if (this.serviceBindings.has(tool)) {
            this.currentTool = this.serviceBindings.get(tool);
            this.currentToolEnum = tool;
            this.isSelectionEllipse();
            this.isLasso();
        }
    }

    onMouseMove(event: MouseEvent, mouseCoord: Vec2): void {
        if (this.currentTool) {
            this.currentTool.mouseCoord = mouseCoord;
            this.currentTool.onMouseMove(event);
        }
    }

    onMouseDown(event: MouseEvent, mouseCoord: Vec2): void {
        if (this.currentTool) {
            this.currentTool.mouseCoord = mouseCoord;
            this.currentTool.onMouseDown(event);
        }
    }

    onMouseUp(event: MouseEvent, mouseCoord: Vec2): void {
        if (this.currentTool) {
            this.currentTool.mouseCoord = mouseCoord;
            this.currentTool.onMouseUp(event);
        }
    }

    onMouseClick(event: MouseEvent): void {
        if (this.currentTool) this.currentTool.onMouseClick(event);
    }

    onMouseDoubleClick(event: MouseEvent): void {
        if (this.currentTool) this.currentTool.onMouseDoubleClick(event);
    }

    onMouseLeave(event: MouseEvent): void {
        if (this.currentTool) this.currentTool.onMouseLeave(event);
    }

    onWheel(event: WheelEvent): void {
        if (this.currentTool) this.currentTool.onWheelEvent(event);
    }

    handleKeyUp(event: KeyboardEvent): void {
        if (this.currentTool) this.currentTool.handleKeyUp(event);
    }

    isSelectionEllipse(): void {
        if (this.currentToolEnum === ToolList.SelectionEllipse) {
            this.selectionService.isEllipse = true;
            return;
        }
        this.selectionService.isEllipse = false;
    }

    isLasso(): void {
        if (this.currentToolEnum === ToolList.Lasso) {
            this.selectionService.isLasso = true;
            return;
        }
        this.selectionService.isLasso = false;
    }
}
