import { Component, HostListener } from '@angular/core';
import {
    DEFAULT_GRID_OPACITY,
    DEFAULT_GRID_SIZE,
    MAX_GRID_OPACITY,
    MAX_GRID_SQUARE_SIZE,
    MIN_GRID_OPACITY,
    MIN_GRID_SQUARE_SIZE,
    SQUARE_STEP,
    TWO_DECIMAL_MULTIPLIER,
} from '@app/constants';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { MagnetismService } from '@app/services/selection/magnetism.service';
import { TextService } from '@app/services/tools/text/text.service';

@Component({
    selector: 'app-grid',
    templateUrl: './grid.component.html',
    styleUrls: ['./grid.component.scss'],
})
export class GridComponent {
    isEnabled: boolean = false;
    minSquareSize: number = MIN_GRID_SQUARE_SIZE;
    maxSquareSize: number = MAX_GRID_SQUARE_SIZE;
    minOpacity: number = MIN_GRID_OPACITY;
    maxOpacity: number = MAX_GRID_OPACITY;
    squareSize: number = DEFAULT_GRID_SIZE;
    currentOpacity: number = DEFAULT_GRID_OPACITY;

    constructor(public drawingService: DrawingService, public magnetismService: MagnetismService, private textService: TextService) {
        this.drawingService.gridSpaces = this.squareSize;
        this.magnetismService.setGridSpaces(this.squareSize);
        this.drawingService.gridOpacity = this.currentOpacity;
    }

    switchGridView(isEnabled: boolean): void {
        this.isEnabled = isEnabled;
        this.drawingService.isGridEnabled = isEnabled;
        if (isEnabled) this.drawingService.setGrid();
        else this.drawingService.clearCanvas(this.drawingService.gridCtx);
    }

    changeGridSize(newSize: number): void {
        newSize = Number(newSize);
        this.drawingService.gridSpaces = newSize;
        this.squareSize = newSize;
        this.magnetismService.setGridSpaces(this.squareSize);
        if (this.isEnabled) {
            this.drawingService.setGrid();
        }
    }

    changeOpacity(newOpacity: number): void {
        newOpacity = Number(newOpacity);
        newOpacity = Math.round((newOpacity + Number.EPSILON) * TWO_DECIMAL_MULTIPLIER) / TWO_DECIMAL_MULTIPLIER;
        this.drawingService.gridOpacity = newOpacity;
        this.currentOpacity = newOpacity;
        if (this.isEnabled) {
            this.drawingService.setGrid();
        }
    }

    @HostListener('window:keydown.g')
    gIsClicked(): void {
        if (!this.textService.isWriting) {
            this.isEnabled = !this.isEnabled;
            this.drawingService.isGridEnabled = this.isEnabled;
            if (this.isEnabled) this.drawingService.setGrid();
            else this.drawingService.clearCanvas(this.drawingService.gridCtx);
        }
    }

    @HostListener('window:keydown.=')
    @HostListener('window:keydown.shift.+')
    increase(): void {
        if (this.isEnabled && this.squareSize < MAX_GRID_SQUARE_SIZE) {
            this.squareSize += SQUARE_STEP;
            this.drawingService.gridSpaces = this.squareSize;
            this.magnetismService.setGridSpaces(this.squareSize);
            this.drawingService.setGrid();
        }
    }
    @HostListener('window:keydown.-')
    decrease(): void {
        if (this.isEnabled && this.squareSize > MIN_GRID_SQUARE_SIZE) {
            this.squareSize -= SQUARE_STEP;
            this.drawingService.gridSpaces = this.squareSize;
            this.magnetismService.setGridSpaces(this.squareSize);
            this.drawingService.setGrid();
        }
    }
}
