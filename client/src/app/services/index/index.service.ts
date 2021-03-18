import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DrawingData } from '@common/communication/drawing-data';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class IndexService {
    private readonly BASE_URL: string = 'http://localhost:3000';
    // private readonly INDEX_URL: string = '/api/index';
    private readonly DATABASE_URL: string = '/api/database';
    private readonly DRAWINGS_URL: string = '/drawings';
    private readonly SEND_URL: string = '/send';
    private readonly DELETE_URL: string = '/delete';
    private readonly GET_URL: string = '/get';
    private readonly TAGS_URL: string = '/tags';

    constructor(private http: HttpClient) {
        this.BASE_URL = this.BASE_URL;
    }

    async getAllDrawingUrls(): Promise<string[] | number> {
        return new Promise<string[] | number>((resolve) => {
            const url = this.BASE_URL + this.DATABASE_URL + this.DRAWINGS_URL;
            this.http.get<string[]>(url).subscribe((drawings: string[]) => {
                resolve(drawings);
            });
        });
    }

    postDrawing(message: DrawingData): Observable<DrawingData> {
        const url: string = this.BASE_URL + this.DATABASE_URL + this.SEND_URL;
        const httpOptions = {
            headers: new HttpHeaders({
                Accept: 'text/plain, */*',
                'Content-Type': 'application/json',
            }),
            responseType: 'text' as 'json',
        };

        return this.http.post<DrawingData>(url, message, httpOptions).pipe(catchError(this.handleError));
    }

    async deleteDrawingById(id: string): Promise<void> {
        return new Promise<void>((resolve) => {
            const url = this.BASE_URL + this.DATABASE_URL + this.DRAWINGS_URL + `/${id}.png`;
            console.log('dans index client ' + id);
            console.log('dans index client ' + url);
            this.http.delete(url, { responseType: 'text' }).subscribe(() => {
                resolve();
            });
        });
    }

    findDrawingById(id: string): Observable<DrawingData | number> {
        const url: string = this.BASE_URL + this.DATABASE_URL + this.DRAWINGS_URL + `/${id}`;
        return this.http.delete<DrawingData>(url).pipe(
            catchError((error: HttpErrorResponse) => {
                return of(error.status);
            }),
        );
    }

    findDrawingsByTags(tags: string[]): Observable<string[] | number> {
        const queryTags: string = tags.join('-');
        const url = this.BASE_URL + this.DATABASE_URL + this.GET_URL + this.TAGS_URL + `/${queryTags}`;
        return this.http.get<string[]>(url).pipe(
            catchError((error: HttpErrorResponse) => {
                return of(error.status);
            }),
        );
    }

    private handleError(error: HttpErrorResponse): Observable<DrawingData> {
        let errorMessage = 'Erreur inconnue';
        if (error.error instanceof ErrorEvent) {
            // Client-side
            errorMessage = `Erreur: ${error.error.message}`;
        } else {
            // Server-side
            errorMessage = `Erreur ${error.status}\n${error.message}`;
        }
        return throwError(errorMessage); // throw back to client
    }
}
