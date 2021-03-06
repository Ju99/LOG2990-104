import { Component } from '@angular/core';
import { SprayService} from '@app/services/tools/spray/spray.service';

@Component({
    selector: 'app-spray-config',
    templateUrl: './spray-config.component.html',
    styleUrls: ['./spray-config.component.scss'],
})
export class SprayConfigComponent {
    toolWidth: number;
    dotWidth: number;
    sprayFrequency: number;

    constructor(public sprayService: SprayService) {
        this.toolWidth = sprayService.width;
        this.dotWidth = sprayService.dotWidth;
        this.sprayFrequency = sprayService.sprayFrequency;
    }

    changeWidth(newWidth: number): void {
        this.toolWidth = newWidth;
        this.sprayService.changeWidth(this.toolWidth);
    }

    changeDotWidth(newWidth: number): void {
        this.dotWidth = newWidth;
        this.sprayService.changeDotWidth(this.dotWidth);
    }

    changeSprayFrequency(newSprayFrequency: number): void {
        this.sprayFrequency = newSprayFrequency;
        this.sprayService.changeSprayFrequency(newSprayFrequency);
    }
}
