import { Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild } from '@angular/core';
import { Drawing } from '@common/communication/drawing';

@Component({
    selector: 'app-carousel-drawing',
    templateUrl: './carousel-drawing.component.html',
    styleUrls: ['./carousel-drawing.component.scss'],
})
export class CarouselDrawingComponent {
    @Input() drawing: Drawing;
    @ViewChild('mainContainer', { static: false }) mainContainer: ElementRef<HTMLDivElement>;
    @Output() componentClicked = new EventEmitter<string>();

    @HostListener('click', ['$event'])
    handleKeyDown(event: KeyboardEvent) {
        this.mainContainer.nativeElement.style.border = '2px solid red';
        this.componentClickedEvent();
    }

    componentClickedEvent(): void {
        this.componentClicked.emit(this.drawing.imageURL);
    }

    defaultColor(): void {
        this.mainContainer.nativeElement.style.border = '2px solid black';
    }
}
