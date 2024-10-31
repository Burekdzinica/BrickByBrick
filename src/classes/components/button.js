export class Button {
    // Without canvas it doesnt work , why idk?? fFIX
    constructor(config, position, text, canvas) {
        this.position = position;
        this.canvas = canvas;
        this.text = text;
        this.isHovered = false;

        const { width, height, defaultColor, hoverColor, strokeColor, lineWidth, textColor, font, textAlign, textBaseline } = config;
        
        this.width = width;
        this.height = height;
        this.color = defaultColor;
        this.defaultColor = defaultColor;
        this.hoverColor = hoverColor;
        this.strokeColor = strokeColor;
        this.lineWidth = lineWidth;

        this.textColor = textColor;
        this.font = font;
        this.textAlign = textAlign;
        this.textBaseline = textBaseline;
    }

    render(ctx) {
        
        ctx.fillStyle = this.color;
        ctx.strokeStyle = this.strokeColor;
        ctx.lineWidth = this.lineWidth;
        
        // Draw the button rectangle with outline
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
        ctx.strokeRect(this.position.x, this.position.y, this.width, this.height);
        
        // Draw text
        ctx.fillStyle = this.textColor; 
        ctx.font = this.font;
        ctx.textAlign = this.textAlign;
        ctx.textBaseline = this.textBaseline; 
        ctx.fillText(this.text, this.position.x + this.width / 2, this.position.y + this.height / 2);   
    }

    checkPosition(mouseX, mouseY) {
        return (
            mouseX >= this.position.x &&
            mouseX <= this.position.x + this.width &&
            mouseY >= this.position.y &&
            mouseY <= this.position.y + this.height
        );
    }

    handleMouseHover(event) {
        const rect = this.canvas.getBoundingClientRect();
        
        let mouseX = event.clientX - rect.left;
        let mouseY = event.clientY - rect.top;
        
        this.isHovered = this.checkPosition(mouseX, mouseY);
        
        if (this.isHovered)
            this.color = this.hoverColor;
        else 
            this.color = this.defaultColor;
    }       
}