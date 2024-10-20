export class StaticBody {
    constructor(width, height, position = { x: 0, y: 0}) {
        this.width = width;
        this.height = height;
        this.position = position;
    }

    // Method to check if a point is inside the static body
    contains(pointX, pointY) {
        return (
            pointX >= this.position.x &&
            pointX <= this.position.x + this.width &&
            pointY >= this.position.y &&
            pointY <= this.position.y + this.height
        );
    }
}