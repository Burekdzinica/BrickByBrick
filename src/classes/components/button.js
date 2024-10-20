export class Button {
    constructor(width, height, position = { x: 0, y: 0 }) {
        this.width = width;
        this.height = height;
        this.position = position;

        this.color = "yellow";
        this.hoverColor = "orange";
        this.strokeColor = "black";
        this.lineWidth = 2;

        this.isHovered = false;
    }

    update() {
        // this.isHovered = this.checkHover(mouseX, mouseY);

    }

    checkHover(mouseX, mouseY) {
        return (
            mouseX >= this.position.x &&
            mouseX <= this.position.x + this.width &&
            mouseY >= this.position.y &&
            mouseY <= this.position.y + this.height
        );
    }

    handleMouseHover(event) {
        const rect = this.canvas.getBoundingClientRect();
        
        let mouseX = event.clientX - rect.left; // Calculate mouseX
        let mouseY = event.clientY - rect.top;  // Calculate mouseY
        
        this.isHovered = this.checkHover(mouseX, mouseY);
        
        if (this.isHovered)
            this.color = this.hoverColor;
        else 
        this.color = this.color;
    }   

    render(ctx) {
        // Change button color based on hover state
        ctx.fillStyle = this.color;
        ctx.strokeStyle = this.strokeColor;
        ctx.lineWidth = this.lineWidth;

        // Draw the button rectangle with outline
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
        ctx.strokeRect(this.position.x, this.position.y, this.width, this.height);

        // Optionally draw text or label on the button
        ctx.fillStyle = "black"; // Color for the text
        ctx.font = "16px Arial"; // Set font size and type
        ctx.textAlign = "center"; // Center the text
        ctx.textBaseline = "middle"; // Vertically center the text
        ctx.fillText("Click Me", this.position.x + this.width / 2, this.position.y + this.height / 2);
    }
}