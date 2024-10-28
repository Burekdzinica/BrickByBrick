export class Text {
    constructor(config, color, font, text, posX, posY) {
        const { textAlign, textBaseline } = config;

        this.textAlign = textAlign;
        this.textBaseline = textBaseline;
        this.color = color;
        this.font = font;
        this.text = text;
        this.posX = posX;
        this.posY = posY;

    }

    update() {

    }

    render(ctx) {
        ctx.fillStyle = this.color;
        ctx.font = this.font;
        
        ctx.fillText(this.text, this.posX, this.posY);
    }
}