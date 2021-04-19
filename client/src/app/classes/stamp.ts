import { ANGLE_HALF_TURN, SIZE_STAMP } from '@app/constants';
import { Drawable } from './drawable';
import { Vec2 } from './vec2';

export class Stamp extends Drawable {
    private angle: number;
    private positionCoord: Vec2;
    private srcImage: string;
    private scale: number;
    private color: string;

    constructor(coord: Vec2, src: string, angle: number, scale: number, color: string) {
        super();
        this.positionCoord = coord;
        this.srcImage = src;
        this.angle = angle;
        this.scale = scale;
        this.color = color;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();

        ctx.translate(this.positionCoord.x + SIZE_STAMP / 2, this.positionCoord.y + SIZE_STAMP / 2);

        ctx.scale(this.scale, this.scale);
        ctx.translate(-SIZE_STAMP / 2, -SIZE_STAMP / 2);

        ctx.rotate(-((this.angle * Math.PI) / ANGLE_HALF_TURN));
        ctx.translate(-SIZE_STAMP / 2, -SIZE_STAMP / 2);

        const path = new Path2D(this.srcImage);

        ctx.strokeStyle = this.color;
        ctx.fillStyle = this.color;

        ctx.stroke(path);
        ctx.fill(path);
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        // ctx.drawImage(image,0,0);

        ctx.restore();
    }
}
