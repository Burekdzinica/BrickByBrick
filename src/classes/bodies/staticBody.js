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

    containsBall(ball) {
        const ballLeft = ball.position.x - ball.radius - (ball.lineWidth / 2);
        const ballRight = ball.position.x + ball.radius + (ball.lineWidth / 2);
        const ballTop = ball.position.y - ball.radius - (ball.lineWidth / 2);
        const ballBottom = ball.position.y + ball.radius + (ball.lineWidth / 2);

        const blockLeft = this.position.x - (this.lineWidth / 2);
        const blockRight = this.position.x + this.width + (this.lineWidth / 2);
        const blockTop = this.position.y - (this.lineWidth / 2);
        const blockBottom = this.position.y + this.height + (this.lineWidth / 2);
    

        return (
            ballRight > blockLeft &&
            ballLeft < blockRight &&
            ballBottom > blockTop &&
            ballTop < blockBottom
        );
    } 
}