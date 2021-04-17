import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { AutoSaveService } from '@app/services/auto-save/auto-save.service';
import { NewDrawingService } from '@app/services/new-drawing/new-drawing.service';
@Component({
    selector: 'app-new-draw-modal',
    templateUrl: './new-draw-modal.component.html',
    styleUrls: ['./new-draw-modal.component.scss'],
})
export class NewDrawModalComponent {
    constructor(
        public dialogRef: MatDialogRef<NewDrawModalComponent>,
        private newDrawService: NewDrawingService,
        private autoSaveService: AutoSaveService,
    ) {}

    handleConfirm(): void {
        this.newDrawService.requestCleaning();
        this.dialogRef.close();
        this.autoSaveService.clearLocalStorage();
    }
}
