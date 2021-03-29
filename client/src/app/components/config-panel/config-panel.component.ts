import { Component } from '@angular/core';
import { ToolList } from '@app/constants';
import { ToolManagerService } from '@app/services/tools/tool-manager.service';

@Component({
    selector: 'app-config-panel',
    templateUrl: './config-panel.component.html',
    styleUrls: ['./config-panel.component.scss'],
})
export class ConfigPanelComponent {
    ToolList: typeof ToolList = ToolList;
    isOpened: boolean = true;

    constructor(public toolManagerService: ToolManagerService) {}

    toggleConfigPanel(): void {
        this.isOpened = !this.isOpened;
    }

    includesColorConfiguration(): boolean {
        if (
            this.toolManagerService.currentToolEnum !== ToolList.Eraser &&
            this.toolManagerService.currentToolEnum !== ToolList.SelectionRectangle &&
            this.toolManagerService.currentToolEnum !== ToolList.SelectionEllipse
        )
            return true;
        return false;
    }
}
