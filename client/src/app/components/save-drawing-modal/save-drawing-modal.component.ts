import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { IndexService } from '@app/services/index/index.service';
import { DrawingData } from '@common/communication/drawing-data';

const MIN_INPUT_SIZE = 1;
const MAX_INPUT_SIZE = 15;
const NB_TAGS_ALLOWED = 5;
const ALPHANUMERIC_REGEX = /^[a-z0-9]+$/i;

@Component({
    selector: 'app-save-drawing-modal',
    templateUrl: './save-drawing-modal.component.html',
    styleUrls: ['./save-drawing-modal.component.scss'],
})
export class SaveDrawingModalComponent {
    readonly matTooltipForTitle: string = `Le titre doit contenir seulement des caractères alphanumériques. Sa longueur doit être au plus de ${MAX_INPUT_SIZE} caractères.`;
    readonly matTooltipForTags: string = `Le nom d'une étiquette doit contenir seulement des caractères alphanumériques. Sa longueur doit être au plus de ${MAX_INPUT_SIZE} caractères.`;
    minLength: number;
    maxLength: number;
    drawingTitle: string;
    titleIsValid: boolean;
    tagInput: string;
    tags: string[];
    message: DrawingData;

    constructor(
        public matDialogRef: MatDialogRef<SaveDrawingModalComponent>,
        private indexService: IndexService,
        private drawingService: DrawingService,
    ) {
        this.minLength = MIN_INPUT_SIZE;
        this.maxLength = MAX_INPUT_SIZE;
        this.drawingTitle = '';
        this.titleIsValid = false;
        this.tagInput = '';
        this.tags = [];
    }

    sendToServer(): void {
        if (!this.validateString(this.drawingTitle)) {
            alert('Il y a une erreur avec les entrées. Veuillez revérifier le format du titre et/ou des étiquettes.'); // temporaire
            return;
        }

        const drawingData = this.getDrawingData();

        this.indexService
            .postDrawing(drawingData)
            .then(() => {
                this.matDialogRef.close();
                alert('Le dessin "' + this.drawingTitle + '" a bien été sauvegardé sur le serveur de PolyDessin !'); // temporaire
            })
            .catch((error) => {
                alert('Problème de connexion avec le serveur de PolyDessin. Veuillez réessayer. Erreur 503');
            });
    }

    addTag(): void {
        if (this.tagInput && this.validateNumberOfTags() && this.validateString(this.tagInput) && !this.validateTagDuplicate()) {
            const trimmedTag: string = this.tagInput.trim();
            this.tags.push(trimmedTag);
            this.tagInput = '';
        }
    }

    removeTag(tag: string): void {
        this.tags = this.tags.filter((current) => current !== tag);
    }

    validateString(str: string): boolean {
        const isAlphanumeric = ALPHANUMERIC_REGEX.test(str);
        const isValidSize = str.length >= MIN_INPUT_SIZE && str.length <= MAX_INPUT_SIZE;
        return isValidSize && isAlphanumeric;
    }

    isStringEmpty(str: string): boolean {
        return str === '';
    }

    validateTagDuplicate(): boolean {
        for (const t in this.tags) {
            if (this.tags[t] === this.tagInput) return true;
        }
        return false;
    }

    private getDrawingData(): DrawingData {
        const message = {
            title: this.drawingTitle,
            labels: this.tags,
            height: this.drawingService.baseCtx.canvas.height,
            width: this.drawingService.baseCtx.canvas.width,
            body: this.drawingService.canvas.toDataURL(),
        };
        return message;
    }

    private validateNumberOfTags(): boolean {
        const size = this.tags.length;
        return size >= 0 && size < NB_TAGS_ALLOWED;
    }
}
