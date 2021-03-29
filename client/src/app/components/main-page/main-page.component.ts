import { Component, HostListener } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CarouselComponent } from '@app/components/carousel/carousel-modal/carousel.component';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent {
    readonly title: string = 'Poly-Dessin';

    constructor(public dialog: MatDialog) {}
    openCarousel(): void {
        this.dialog.open(CarouselComponent);
    }

    @HostListener('document:keydown', ['$event'])
    handleKeyDown(event: KeyboardEvent): void {
        if (event.ctrlKey && event.key === 'g') {
            event.preventDefault();
            this.dialog.open(CarouselComponent, {});
        }
    }
}
