import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FiltersList } from '@app/constants';
import { ExportService } from '@app/services/export-image/export.service';

const MIN_INPUT_SIZE = 0;
const MAX_INPUT_SIZE = 15;
const ALPHANUMERIC_REGEX = /^[a-z0-9]+$/i;

@Component({
    selector: 'app-export-modal',
    templateUrl: './export-modal.component.html',
    styleUrls: ['./export-modal.component.scss'],
})
export class ExportModalComponent implements AfterViewInit {
    matTooltipForTitle: string;
    FiltersList: typeof FiltersList = FiltersList;
    maxLength: number;
    imgurIsSelected: boolean;
    @ViewChild('baseCanvas', { static: false }) private baseCanvas: ElementRef<HTMLCanvasElement>;
    private baseCtx: CanvasRenderingContext2D;

    constructor(public matDialogRef: MatDialogRef<ExportModalComponent>, public exportService: ExportService, private cdRef: ChangeDetectorRef) {
        this.maxLength = MAX_INPUT_SIZE;
        this.matTooltipForTitle = `Le titre doit contenir seulement des caractères alphanumériques. Sa longueur doit être au plus de ${MAX_INPUT_SIZE} caractères.`;
    }

    ngAfterViewInit(): void {
        this.baseCtx = this.baseCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.exportService.baseCtx = this.baseCtx;
        this.exportService.canvas = this.baseCanvas.nativeElement;
        this.imgurIsSelected = false;
        this.cdRef.detectChanges();
    }

    exportDrawing(): void {
        if (!this.validateString(this.exportService.drawingTitle)) {
            alert('Le format du nom de votre dessin est incorect! Veuillez revérfifier :)');
            return;
        }

        this.exportService.exportDrawing();
    }

    uploadToImgur(): void {
        this.exportService.uploadToImgur();
    }

    validateString(str: string): boolean {
        if (str.length > MIN_INPUT_SIZE) return ALPHANUMERIC_REGEX.test(str);
        return true;
    }

    changeImgurSelection(selection: boolean): void {
        this.imgurIsSelected = selection;
    }

    closeModal(): void {
        this.exportService.imgurURL = '';
    }
}
