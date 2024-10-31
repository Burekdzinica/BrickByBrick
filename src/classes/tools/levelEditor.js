import { Block } from "../entities/block.js";
import { Button } from "../components/button.js";

export class LevelEditor {
    constructor(canvas, blockConfig, buttonConfig) {
        this.canvas = canvas;
        this.ctx = this.canvas.getContext("2d");

        const { width, height, strokeColor, lineWidth } = blockConfig;

        // Default hp
        this.hp = 1;

        this.width = width;
        this.height = height;
        this.strokeColor = strokeColor;
        this.lineWidth = lineWidth;

        this.blocks = [];

        // Buttons
        const saveButtonPosition = { x: canvas.width / 2 - 100, y: canvas.height / 2 + 200 };
        const undoButtonPosition = { x: canvas.width / 2 - 350, y: canvas.height / 2 + 200 };
        const clearButtonPosition = { x: canvas.width / 2 - 350, y: canvas.height / 2 + 275 };
        const blocksButtonPosition = { x: canvas.width / 2 + 150, y: canvas.height / 2 + 275 };

        this.buttons = [
            new Button(buttonConfig, saveButtonPosition, "Save", this.canvas),
            new Button(buttonConfig, undoButtonPosition, "Undo", this.canvas),
            new Button(buttonConfig, clearButtonPosition, "Clear", this.canvas),
            new Button(buttonConfig, blocksButtonPosition, "Blocks", this.canvas)
        ];

        // Reference to the bound listeners
        this.handleButtonHoverBound = this.handleButtonHover.bind(this);
        this.handleButtonClickBound = this.handleButtonClick.bind(this);
        this.handleKeyPressBound = this.handleKeyPress.bind(this);

        document.addEventListener("keydown", this.handleKeyPressBound);

        // Number of blocks in vertical and horizontal
        this.yBlocks = Math.floor((this.canvas.height / 2) / this.height);
        this.xBlocks = Math.floor((this.canvas.width) / this.width);
    }

    render() {
        this.clear();

        this.renderGrid();

        this.blocks.forEach(block => 
            block.render(this.ctx));

        // Change button text depending on current block
        this.buttons.forEach(button => {
            if (button.text.startsWith("Block"))
                button.text = "Block: " + this.hp;

            button.render(this.ctx);
        })
    }

    // Renders grid system
    renderGrid() {
        this.ctx.strokeStyle = "#616060"; // gray
        this.ctx.lineWidth = this.lineWidth;

        this.ctx.setLineDash([5, 10]);

        // Draw vertical grid lines
        for (let i = 0; i <= this.xBlocks; i++) {
            const x = i * this.width;

            this.ctx.beginPath();

            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height / 2);

            this.ctx.stroke();
        }
    
        // Draws horizontal grid lines
        for (let j = 0; j <= this.yBlocks; j++) {
            const y = j * this.height;

            this.ctx.beginPath();
            
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);

            this.ctx.stroke();
        }
    
        this.ctx.setLineDash([]);
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // Create a new block at the clicked position
    addBlock(event) {
        const rect = this.canvas.getBoundingClientRect();

        // Centers on click
        const mouseX = event.clientX - rect.left - this.width  / 2; 
        const mouseY = event.clientY - rect.top - this.height / 2; 

        // Only add above half width
        if (mouseY < this.canvas.height / 2) {
            const x = Math.floor(mouseX / this.width) * this.width;
            const y = Math.floor(mouseY / this.height) * this.height;

            const newBlock = new Block({
                width: this.width,
                height: this.height,
                position: { x, y },
                hp: this.hp,
                strokeColor: this.strokeColor,
                lineWidth: this.lineWidth
            });

            this.blocks.push(newBlock);
        }
    }

    // Save level to file
    saveFile() {
        const blockData = this.blocks.map(block => ({
            position: block.position,
            hp: block.hp
        }));
        
        const levelData = JSON.stringify([{ block: blockData }], null, 2);

        this.dowloadJson(levelData, "level.json");
    }
    
    dowloadJson(data, filename) {
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');

        a.href = url;
        a.download = filename;
        a.click();

        URL.revokeObjectURL(url);
    }

    // Cycle through blocks on click
    changeBlock() {
        switch (this.hp) {
            case 1:
                this.hp = 2;
                break;
            
            case 2:
                this.hp = 3;
                break;

            case 3:
                this.hp = 4;
                break;

            case 4:
                this.hp = 5;
                break;

            case 5:
                this.hp = "Unbreakable";
                break;

            case "Unbreakable":
                this.hp = 1;
                break;
        }
    }
    
    // Handles button clicks
    handleButtonClick(event) {
        const rect = this.canvas.getBoundingClientRect();
        
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        this.buttons.forEach(button => {
            if (button.checkPosition(mouseX, mouseY)) {
                switch (button.text) {
                    case "Save":
                        this.saveFile();
                        break;
                    
                    case "Undo":
                        this.blocks.pop();
                        break;

                    case "Clear":
                        this.blocks = [];
                        break;

                }

                if (button.text.startsWith("Block")) 
                    this.changeBlock();
            }
        });
    }

    // Change block hp
    handleKeyPress(event) {
        if (event.key == '6')
            this.hp = "Unbreakable";

        if (event.key >= '1' && event.key <= '5') {
            this.hp = parseInt(event.key);
        }
    }

    // Changes button color on hover
    handleButtonHover(event) {
        this.buttons.forEach(button => 
            button.handleMouseHover(event));
    } 

    addButtonListeners() {
        this.canvas.addEventListener("mousemove", this.handleButtonHoverBound);
        this.canvas.addEventListener("click", this.handleButtonClickBound);
    }

    removeButtonListeners() {
        this.canvas.removeEventListener("mousemove", this.handleButtonHoverBound);
        this.canvas.removeEventListener("click", this.handleButtonClickBound);
    }
}