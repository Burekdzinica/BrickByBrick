export class Text {
    constructor(config,) {
        const { textAlign, textBaseline } = config;

        this.textAlign = textAlign;
        this.textBaseline = textBaseline;
    }
    
    render(ctx, color, font, posX, posY, text) {
        ctx.fillStyle = color;
        ctx.font = font;
        
        ctx.fillText(text, posX, posY);
    }
}