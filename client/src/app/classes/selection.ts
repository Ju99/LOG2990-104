import { Drawable } from './drawable';
import { Vec2 } from './vec2';

const PIXEL_LENGTH = 4;
const MAX_RGB = 255;

export class SelectionTool extends Drawable {
    image: ImageData;
    clearImageDataPolygon: ImageData;
    initialOrigin: Vec2;
    origin: Vec2;
    destination: Vec2;
    polygonCoords: Vec2[];
    initialWidth: number;
    initialHeight: number;
    width: number;
    height: number;
    isEllipse: boolean;
    isLasso: boolean;

    constructor(origin: Vec2, destination: Vec2, width: number, height: number) {
        super();
        this.origin = origin;
        this.destination = destination;
        this.width = width;
        this.height = height;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        this.clearUnderneathShape(ctx);
        if (this.isEllipse) this.printEllipse(ctx);
        else if (this.isLasso) this.printPolygon(ctx);
        else {
            ctx.putImageData(this.image, this.origin.x, this.origin.y);
        }
    }

    private clearUnderneathShape(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        if (this.isEllipse) {
            ctx.ellipse(
                this.initialOrigin.x + this.initialWidth / 2,
                this.initialOrigin.y + this.initialHeight / 2,
                this.initialWidth / 2,
                this.initialHeight / 2,
                0,
                2 * Math.PI,
                0,
            );
            ctx.fill();
            ctx.closePath();
        } else if (this.isLasso) {
            const imageData = this.clearImageDataPolygon.data;
            let pixelCounter = 0;
            for (let i = this.initialOrigin.y; i < this.initialOrigin.y + this.initialHeight; i++) {
                for (let j = this.initialOrigin.x; j < this.initialOrigin.x + this.initialWidth; j++) {
                    if (imageData[pixelCounter + PIXEL_LENGTH - 1] !== 0) {
                        for (let k = 0; k < PIXEL_LENGTH; k++) {
                            imageData[pixelCounter + k] = MAX_RGB;
                        }
                    }
                    pixelCounter += PIXEL_LENGTH;
                }
            }
            this.clearPolygon(ctx);
        } else {
            ctx.fillRect(this.initialOrigin.x, this.initialOrigin.y, this.initialWidth, this.initialHeight);
            ctx.closePath();
        }
    }

    private printEllipse(ctx: CanvasRenderingContext2D): void {
        const canvas = document.createElement('canvas');
        canvas.width = this.width;
        canvas.height = this.height;
        const tmp = canvas.getContext('2d') as CanvasRenderingContext2D;
        tmp.putImageData(this.image, 0, 0);
        ctx.ellipse(this.origin.x + this.width / 2, this.origin.y + this.height / 2, this.width / 2, this.height / 2, 0, 2 * Math.PI, 0);
        ctx.save();
        ctx.clip();
        ctx.drawImage(tmp.canvas, this.origin.x, this.origin.y);
        ctx.restore();
    }

    private printPolygon(ctx: CanvasRenderingContext2D): void {
        const canvas = document.createElement('canvas');
        canvas.width = this.width;
        canvas.height = this.height;
        const tmp = canvas.getContext('2d') as CanvasRenderingContext2D;
        tmp.putImageData(this.image, 0, 0);
        ctx.save();
        ctx.clip(this.calculatePath2d());
        ctx.drawImage(tmp.canvas, this.origin.x, this.origin.y);
        ctx.restore();
    }

    private clearPolygon(ctx: CanvasRenderingContext2D): void {
        const canvas = document.createElement('canvas');
        canvas.width = this.initialWidth;
        canvas.height = this.initialHeight;
        const tmp = canvas.getContext('2d') as CanvasRenderingContext2D;
        tmp.putImageData(this.clearImageDataPolygon, 0, 0);
        ctx.save();
        ctx.clip(this.calculatePath2d());
        ctx.drawImage(tmp.canvas, this.initialOrigin.x, this.initialOrigin.y);
        ctx.restore();
    }

    private calculatePath2d(): Path2D {
        const polygon = new Path2D();
        polygon.moveTo(this.polygonCoords[0].x, this.polygonCoords[0].y);
        for (let i = 1; i < this.polygonCoords.length; i++) {
            polygon.lineTo(this.polygonCoords[i].x, this.polygonCoords[i].y);
        }
        polygon.lineTo(this.polygonCoords[0].x, this.polygonCoords[0].y);
        return polygon;
    }
}
