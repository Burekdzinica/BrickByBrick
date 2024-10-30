import { StaticBody } from "../bodies/staticBody.js";

export class Block extends StaticBody {
    constructor(config) {
        // Block config from level data
        const { width, height, position, hp, strokeColor, lineWidth, powerUp } = config;
        
        super(width, height, position);

        this.hp = hp;
        this.strokeColor = strokeColor;
        this.lineWidth = lineWidth;
        this.powerUp = powerUp;
    }

    render(ctx) {
        if (this.hp > 0 || this.hp === "Unbreakable") {
            ctx.strokeStyle = this.strokeColor;
            ctx.lineWidth = this.lineWidth;

            // Different color depending on hp
            switch (this.hp) {
                case 1:
                    ctx.fillStyle = "#ecf39e";
                    break;
                    
                case 2:
                    ctx.fillStyle = "#90a955";
                    break;

                case 3:
                    ctx.fillStyle = "#4f772d";
                    break;

                case 4:
                    ctx.fillStyle = "#31572c";
                    break;

                case 5:
                    ctx.fillStyle = "#132a13";
                    break;

                case "Unbreakable":
                    ctx.fillStyle = "#333333";
                    break;
            }
            
    
            // Draws rect with outline
            ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
            ctx.strokeRect(this.position.x, this.position.y, this.width, this.height);
        }
    }
}