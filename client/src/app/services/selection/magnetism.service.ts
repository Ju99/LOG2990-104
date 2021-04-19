import { Injectable } from '@angular/core';
import { Vec2 } from '@app/classes/vec2';
import { SelectionBox } from '@app/constants';

@Injectable({
    providedIn: 'root',
})
export class MagnetismService {
    squareSize: number = 50;
    anchorPoint: SelectionBox;

    constructor() {
        this.anchorPoint = SelectionBox.TopLeft;
    }

    activateMagnetism(topLeftPoint: Vec2, height: number, width: number): Vec2 {
        const intersectionCoord = this.calculateClosestIntersection(topLeftPoint, height, width);

        switch (this.anchorPoint) {
            case SelectionBox.TopMiddle: {
                intersectionCoord.x = intersectionCoord.x - width / 2;
                intersectionCoord.y = intersectionCoord.y;
                break;
            }
            case SelectionBox.RightMiddle: {
                intersectionCoord.x = intersectionCoord.x - width;
                intersectionCoord.y = intersectionCoord.y - height / 2;
                break;
            }
            case SelectionBox.LeftMiddle: {
                intersectionCoord.x = intersectionCoord.x;
                intersectionCoord.y = intersectionCoord.y - height / 2;
                break;
            }
            case SelectionBox.BottomMiddle: {
                intersectionCoord.x = intersectionCoord.x - width / 2;
                intersectionCoord.y = intersectionCoord.y - height;
                break;
            }
            case SelectionBox.Center: {
                intersectionCoord.x = intersectionCoord.x - width / 2;
                intersectionCoord.y = intersectionCoord.y - height / 2;
                break;
            }
            case SelectionBox.TopRight: {
                intersectionCoord.x = intersectionCoord.x - width;
                intersectionCoord.y = intersectionCoord.y;
                break;
            }
            case SelectionBox.TopLeft: {
                intersectionCoord.x = intersectionCoord.x;
                intersectionCoord.y = intersectionCoord.y;
                break;
            }
            case SelectionBox.BottomRight: {
                intersectionCoord.x = intersectionCoord.x - width;
                intersectionCoord.y = intersectionCoord.y - height;
                break;
            }
            case SelectionBox.BottomLeft: {
                intersectionCoord.x = intersectionCoord.x;
                intersectionCoord.y = intersectionCoord.y - height;
                break;
            }
        }

        return intersectionCoord;
    }

    setGridSpaces(size: number): void {
        this.squareSize = size;
    }

    private calculateClosestIntersection(topLeftPoint: Vec2, height: number, width: number): Vec2 {
        const intersectionCoord = this.locateAnchorPoint(topLeftPoint, height, width);
        if (intersectionCoord.x % this.squareSize > this.squareSize / 2) {
            intersectionCoord.x = Math.floor(intersectionCoord.x / this.squareSize) * this.squareSize + this.squareSize;
        } else {
            intersectionCoord.x = Math.floor(intersectionCoord.x / this.squareSize) * this.squareSize;
        }

        if (intersectionCoord.y % this.squareSize > this.squareSize / 2) {
            intersectionCoord.y = Math.floor(intersectionCoord.y / this.squareSize) * this.squareSize + this.squareSize;
        } else {
            intersectionCoord.y = Math.floor(intersectionCoord.y / this.squareSize) * this.squareSize;
        }
        return intersectionCoord;
    }

    private locateAnchorPoint(topLeftPoint: Vec2, height: number, width: number): Vec2 {
        const intersectionCoord: Vec2 = { x: 0, y: 0 };
        switch (this.anchorPoint) {
            case SelectionBox.TopMiddle: {
                intersectionCoord.x = topLeftPoint.x + width / 2;
                intersectionCoord.y = topLeftPoint.y;
                break;
            }
            case SelectionBox.RightMiddle: {
                intersectionCoord.x = topLeftPoint.x + width;
                intersectionCoord.y = topLeftPoint.y + height / 2;
                break;
            }
            case SelectionBox.LeftMiddle: {
                intersectionCoord.x = topLeftPoint.x;
                intersectionCoord.y = topLeftPoint.y + height / 2;
                break;
            }
            case SelectionBox.BottomMiddle: {
                intersectionCoord.x = topLeftPoint.x + width / 2;
                intersectionCoord.y = topLeftPoint.y + height;
                break;
            }
            case SelectionBox.Center: {
                intersectionCoord.x = topLeftPoint.x + width / 2;
                intersectionCoord.y = topLeftPoint.y + height / 2;
                break;
            }
            case SelectionBox.TopRight: {
                intersectionCoord.x = topLeftPoint.x + width;
                intersectionCoord.y = topLeftPoint.y;
                break;
            }
            case SelectionBox.TopLeft: {
                intersectionCoord.x = topLeftPoint.x;
                intersectionCoord.y = topLeftPoint.y;
                break;
            }
            case SelectionBox.BottomRight: {
                intersectionCoord.x = topLeftPoint.x + width;
                intersectionCoord.y = topLeftPoint.y + height;
                break;
            }
            case SelectionBox.BottomLeft: {
                intersectionCoord.x = topLeftPoint.x;
                intersectionCoord.y = topLeftPoint.y + height;
                break;
            }
        }
        return intersectionCoord;
    }
}
