import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Drawing } from '@common/communication/drawing';
import { DrawingData } from '@common/communication/drawing-data';

@Injectable({
    providedIn: 'root',
})
export class IndexService {
    private readonly BASE_URL: string = 'http://localhost:3000';
    private readonly DATABASE_URL: string = '/api/database';
    private readonly DRAWINGS_URL: string = '/drawings';
    private readonly SEND_URL: string = '/send';
    private readonly FILTER_URL: string = '/filters/';
    private readonly FILE_FORMAT: string = '.png';

    constructor(private http: HttpClient) {}

    async getNewImage(src: string): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            img.onload = () => {
                resolve(img);
            };
            img.onerror = (err: string | Event) => {
                reject(err);
            };
            img.src = src;
        });
    }

    async postDrawing(message: DrawingData): Promise<void> {
        const url: string = this.BASE_URL + this.DATABASE_URL + this.SEND_URL;
        return new Promise<void>((resolve, reject) => {
            const httpOptions = new HttpHeaders().set('Content-Type', 'application/json; charset=utf-8');
            return this.http.post(url, message, { responseType: 'text' as 'json', headers: httpOptions }).subscribe(
                (data) => resolve(),
                (error) => reject(),
            );
        });
    }

    async deleteDrawingById(id: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const url = this.BASE_URL + this.DATABASE_URL + this.DRAWINGS_URL + `/${id}.${this.FILE_FORMAT}`;
            this.http.delete(url, { responseType: 'text' }).subscribe(
                () => {
                    resolve();
                },
                (error) => {
                    return this.handleError(error);
                },
            );
        });
    }

    async getAllDrawings(): Promise<Drawing[]> {
        return new Promise<Drawing[]>((resolve, reject) => {
            const url = this.BASE_URL + this.DATABASE_URL;
            return this.http.get<DrawingData[]>(url).subscribe(
                (drawing: DrawingData[]) => {
                    resolve(this.drawingDataToDrawing(drawing));
                },
                (error) => {
                    return this.handleError(error);
                },
            );
        });
    }

    drawingDataToDrawing(drawings: DrawingData[]): Drawing[] {
        const parseDrawing = [];
        for (let i = 0; i < drawings.length; i++) {
            const imgURL = this.BASE_URL + this.DATABASE_URL + this.DRAWINGS_URL + '/' + drawings[i]._id + this.FILE_FORMAT;
            const labels = drawings[i].labels;
            if (labels !== undefined) {
                parseDrawing[i] = new Drawing(drawings[i].title, labels, imgURL);
            }
        }
        return parseDrawing;
    }

    async searchByTags(tags: string[]): Promise<Drawing[]> {
        if (tags.length > 0) {
            return new Promise<Drawing[]>((resolve) => {
                let url = this.BASE_URL + this.DATABASE_URL + this.DRAWINGS_URL + this.FILTER_URL;
                for (const tag of tags) {
                    url += tag + '-';
                }
                this.http.get<Drawing[]>(url).subscribe((drawings: Drawing[]) => {
                    resolve(drawings);
                });
            });
        } else {
            return new Promise<Drawing[]>((resolve) => {
                this.getAllDrawings().then((result) => {
                    resolve(result);
                });
            });
        }
    }

    private handleError(error: HttpErrorResponse): void {
        let errorMessage = 'Erreur inconnue';
        if (error.error instanceof ErrorEvent) {
            errorMessage = `Erreur: ${error.error.message}`;
        } else {
            errorMessage = `Erreur: ${error.status}\n${error.message}`;
        }
        alert(errorMessage);
    }
}
