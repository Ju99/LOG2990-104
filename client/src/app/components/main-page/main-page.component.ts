import { Component, HostListener, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CarouselComponent } from '@app/components/carousel/carousel-modal/carousel.component';
import { AutoSaveService } from '@app/services/auto-save/auto-save.service';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent implements OnInit {
    readonly title: string = 'Poly-Dessin';
    readonly EDITOR_ROUTE: string = 'http://localhost:4200/editor';
    isDisabled: boolean;

    constructor(public dialog: MatDialog, private autoSaveService: AutoSaveService) {
        this.isDisabled = true;
    }

    @HostListener('document:keydown', ['$event'])
    handleKeyDown(event: KeyboardEvent): void {
        if (event.ctrlKey && event.key === 'g') {
            event.preventDefault();
            this.openCarousel();
        }
    }

    ngOnInit(): void {
        this.isDisabled = this.autoSaveService.localStorageIsEmpty();
    }

    openCarousel(): void {
        this.dialog.open(CarouselComponent);
    }

    continueDrawing(): void {
        this.autoSaveService.loadImage();
        this.changeLocation();
    }

    private changeLocation(): void {
        window.location.replace(this.EDITOR_ROUTE);
    }
}
