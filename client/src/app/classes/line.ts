import { Drawable } from './drawable';
import { Vec2 } from './vec2';

export class Line extends Drawable {
    private pathData: Vec2[];
    private color: string;
    private width: number;

    private radius: number;
    private pointJoin: boolean;

    constructor(pathData: Vec2[], color: string, width: number, radius: number, pointJoin: boolean) {
        super();
        this.pathData = pathData;
        this.color = color;
        this.width = width;
        this.radius = radius;
        this.pointJoin = pointJoin;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        if (this.pathData.length > 1) {
            ctx.beginPath();
            ctx.strokeStyle = this.color;
            ctx.lineWidth = this.width;
            for (const point of this.pathData) {
                if (this.pointJoin) {
                    ctx.lineTo(point.x, point.y);
                    ctx.fillStyle = this.color;
                    ctx.moveTo(point.x + this.radius, point.y);
                    ctx.arc(point.x, point.y, this.radius, 0, Math.PI * 2, true);
                    ctx.moveTo(point.x, point.y);
                } else {
                    ctx.lineJoin = 'miter';
                    ctx.lineTo(point.x, point.y);
                }
            }
            ctx.stroke();
            if (this.pointJoin) {
                ctx.fill();
            }
        }
    }
}
