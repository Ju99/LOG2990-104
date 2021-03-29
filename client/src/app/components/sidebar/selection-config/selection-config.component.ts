import { Component } from '@angular/core';
import { SelectionService } from '@app/services/tools/selection/selection.service';

@Component({
    selector: 'app-selection-config',
    templateUrl: './selection-config.component.html',
    styleUrls: ['./selection-config.component.scss'],
})
export class SelectionConfigComponent {
    constructor(public selectionService: SelectionService) {}
}
