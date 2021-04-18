import { AfterViewInit, Component, ElementRef, HostListener, Inject, ViewChild } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { DrawingParams } from '@app/components/drawing/drawing-params';
import { AutoSaveService } from '@app/services/auto-save/auto-save.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { IndexService } from '@app/services/index/index.service';
import { Drawing } from '@common/communication/drawing';
import { DrawingData } from '@common/communication/drawing-data';

@Component({
    selector: 'app-carousel',
    templateUrl: './carousel.component.html',
    styleUrls: ['./carousel.component.scss'],
})
export class CarouselComponent implements AfterViewInit {
    private index: number;
    private mainDrawingURL: string;
    readonly URL_POSITION: number = 4;
    private decision: boolean;
    isLoading: boolean;
    imageCards: Drawing[];
    placement: Drawing[];
    isDisabled: boolean;
    tags: string[];
    tagInput: string;

    @ViewChild('loadImageButton', { static: false }) loadImageButton: ElementRef<MatButton>;
    @ViewChild('recycleBin', { static: false }) recycleButton: ElementRef<MatButton>;

    constructor(
        public indexService: IndexService,
        private router: Router,
        private dialogRef: MatDialogRef<CarouselComponent>,
        private drawingService: DrawingService,
        private autoSaveService: AutoSaveService,
        @Inject(MAT_DIALOG_DATA) public isCanvaEmpty: boolean,
    ) {
        this.index = 0;
        this.imageCards = [];
        this.placement = [];
        this.tags = [];
        this.isLoading = true;
        this.mainDrawingURL = '';
        this.isDisabled = true;
        this.tagInput = '';
        this.decision = false;
        console.log('jdhk');
    }

    async ngAfterViewInit(): Promise<void> {
        this.getDrawings();
    }

    getDrawings(): void {
        this.isLoading = true;
        this.indexService.getAllDrawings().then((drawings: Drawing[]) => {
            this.imageCards = drawings;
            this.isLoading = false;
            this.updateImagePlacement();
            this.updateMainImageURL();
        });
    }

    async searchbyTags(): Promise<void> {
        await this.indexService
            .searchByTags(this.tags)
            .then((result) => {
                this.imageCards = result;
                this.updateImagePlacement();
            })
            .catch((error) => {
                alert(`Un problème de connexion au serveur est survenu. Veuillez réessayer.\n ${error}`);
            });
    }

    mod(n: number, m: number): number {
        return ((n % m) + m) % m;
    }

    updateImagePlacement(): void {
        this.placement[0] = this.imageCards[this.mod(this.index - 1, this.imageCards.length)];
        this.placement[1] = this.imageCards[this.mod(this.index, this.imageCards.length)];
        this.placement[2] = this.imageCards[this.mod(this.index + 1, this.imageCards.length)];
    }

    updateMainImageURL(): void {
        if (this.placement[1].imageURL !== undefined) {
            this.mainDrawingURL = this.placement[1].imageURL;
        }
    }
    nextImages(): void {
        this.index++;
        this.updateImagePlacement();
        this.updateMainImageURL();
    }
    previousImages(): void {
        this.index--;
        this.updateImagePlacement();
        this.updateMainImageURL();
    }

    @HostListener('document:keydown', ['$event'])
    handleKeyDown(event: KeyboardEvent): void {
        if (event.code === 'ArrowLeft') {
            this.previousImages();
        }
        if (event.code === 'ArrowRight') {
            this.nextImages();
        }
    }

    async deleteDrawing(): Promise<void> {
        const path = (url: string): string => {
            let parseUrl = new URL(url).pathname;
            parseUrl = parseUrl.split('/')[this.URL_POSITION].split('.')[0];
            return parseUrl;
        };
        this.indexService
            .deleteDrawingById(path(this.mainDrawingURL))
            .then(() => {
                this.getDrawings();
            })
            .catch((error) => {
                alert(`Un problème avec le serveur est survenu. Le dessin n'a pas pu être supprimé. Veuillez réessayer.\nError ${error}`);
            });
    }

    loadImage(): void {
        if (this.isCanvaEmpty === null) {
            this.isCanvaEmpty = true;
        }
        if (!this.isCanvaEmpty) {
            this.decision = confirm('Voulez-vous abandonner votre dessin ?');
            if (this.decision) {
                this.openDrawing();
            }
        } else {
            this.openDrawing();
        }
    }

    openDrawing(): void {
        const params: DrawingParams = {
            url: this.mainDrawingURL,
        };
        this.router.navigate(['/'], { skipLocationChange: true }).then(() => this.router.navigate(['editor', params]));
        this.dialogRef.close();

        const drawing: DrawingData = {
            title: '',
            width: this.drawingService.canvas.width,
            height: this.drawingService.canvas.height,
            body: this.drawingService.canvas.toDataURL(),
        };
        this.autoSaveService.saveCanvasState(drawing);
    }

    addTag(): void {
        const trimmedTag: string = this.tagInput.trim();
        this.tags.push(trimmedTag);
        this.tagInput = '';
        this.searchbyTags();
    }

    removeTag(tag: string): void {
        this.tags = this.tags.filter((current) => current !== tag);
        this.searchbyTags();
    }
}
