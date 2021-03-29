import { Component, Input } from '@angular/core';
import { Drawing } from '@common/communication/drawing';

@Component({
    selector: 'app-carousel-drawing',
    templateUrl: './carousel-drawing.component.html',
    styleUrls: ['./carousel-drawing.component.scss'],
})
export class CarouselDrawingComponent {
    @Input() drawing: Drawing;
}
