import { RigidBody } from "../bodies/rigidBody.js";

export class PowerUp extends RigidBody {
    constructor(config, startPosition, blockWidth, power) {
        const { radius, velocity, mass, color, strokeColor, lineWidth, startAngle, endAngle } = config;

        super(mass, velocity);

        this.radius = radius;
        this.velocity = velocity;
        this.mass = mass;
        this.color = color;
        this.strokeColor = strokeColor;
        this.lineWidth = lineWidth;
        this.startAngle = startAngle;
        this.endAngle = endAngle;

        // Position it to middle of block
        startPosition.x += blockWidth / 2;
        this.position = startPosition;

        this.power = power;

        this.image = new Image;
 
        // Change img depending on power
        switch (this.power) {
            case "Ball":
                this.image.src = "../../res/assets/powerUp_ball.png";
                break;            

            case "Size":
                this.image.src = "../../res/assets/powerUp_size.png";
                break;
        }

        this.glowOpacity = 1;
        this.glowDirection = -1; // -1 fading out, 1 fading in
    }

    update(deltaTime) {
        this.updatePhysics(deltaTime);
        this.move();

        // Pulse effect 
        this.glowOpacity += 0.025 * this.glowDirection;
        if (this.glowOpacity >= 1 || this.glowOpacity <= 0.5)
            this.glowDirection *= -1;
    }

    render(ctx) {
        if (!this.image) 
            return;
    
        ctx.save();

        ctx.globalAlpha = this.glowOpacity;
    
        // Draw a circular clipping path
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip(); // Set the clipping area to the circle
    
        // Draw the image centered within the circle
        const x = this.position.x - this.radius;
        const y = this.position.y - this.radius;
        ctx.drawImage(this.image, x, y, this.radius * 2, this.radius * 2);

        ctx.restore();
    }

    checkPaddleBox(paddle) {
        let ballSize = this.radius + this.lineWidth / 2;

        // Is on paddle
        if (this.position.y + ballSize >= paddle.position.y) {
            // Checks horizontal paddle bounds
            if (this.position.x >= paddle.position.x && this.position.x <= (paddle.position.x + paddle.width)) {
                let edgeOffset = paddle.height; // Allows hitting with the edge of the paddle

                // Is going down and isn't bellow paddle 
                if (this.velocity.y > 0 && this.position.y + ballSize <= paddle.position.y + paddle.height + edgeOffset) {
                    return true;
                }
            }
        }
    }

    move() {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
}