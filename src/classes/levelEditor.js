import { Block } from "./entities/block.js";
import { Button } from "./components/button.js";

export class LevelEditor {
    constructor(canvas, blockConfig, buttonConfig) {
        this.canvas = canvas;
        this.ctx = this.canvas.getContext("2d");

        const { width, height, color, strokeColor, lineWidth } = blockConfig;

        this.width = width;
        this.height = height;
        this.color  = color;
        this.strokeColor = strokeColor;
        this.lineWidth = lineWidth;

        this.blocks = [];

        const saveButtonPosition = { x: canvas.width / 2 - 100, y: canvas.height / 2 + 200 };
        const loadButtonPosition = { x: canvas.width / 2 - 100, y: canvas.height / 2 + 275 };
        const undoButtonPosition = { x: canvas.width / 2 - 350, y: canvas.height / 2 + 200 };
        const clearButtonPosition = { x: canvas.width / 2 - 350, y: canvas.height / 2 + 275 };

        this.buttons = [
            new Button(buttonConfig, saveButtonPosition, "Save", this.canvas),
            new Button(buttonConfig, loadButtonPosition, "Load", this.canvas),
            new Button(buttonConfig, undoButtonPosition, "Undo", this.canvas),
            new Button(buttonConfig, clearButtonPosition, "Clear", this.canvas)
        ];

        // Reference to the bound listeners
        this.handleButtonHoverBound = this.handleButtonHover.bind(this);
        this.handleButtonClickBound = this.handleButtonClick.bind(this);

        // Button listeners
        this.canvas.addEventListener("mousemove", this.handleButtonHoverBound);
        this.canvas.addEventListener("click", this.handleButtonClickBound);

        // Number of blocks in vertical and horizontal
        this.yBlocks = Math.floor((this.canvas.height / 2) / this.height);
        this.xBlocks = Math.floor((this.canvas.width) / this.width);
    }

    render() {
        this.clear();

        this.renderGrid();

        this.blocks.forEach(block => 
            block.render(this.ctx));

        this.buttons.forEach(button => 
            button.render(this.ctx));
    }

    // Renders grid system
    renderGrid() {
        this.ctx.strokeStyle = "#616060";
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
                color: this.color,
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
            color: block.color
        }));
        
        const levelData = JSON.stringify([{ block: blockData }], null, 2);

        this.dowloadJson(levelData, "levelData.json");
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

    // loadLevel() {
    //     fetch('levels/level1.json')
    //         .then(response => {
    //             if (!response.ok) {
    //                 throw new Error('Network response was not ok');
    //             }
    //             return response.json();
    //         })
    //         .then(data => {
    //             const levelData = data[0].block; // This gets the array of blocks
    //             this.blocks = levelData.map(blockConfig => 
    //                 new Block({ 
    //                     width: this.width,
    //                     height: this.height,
    //                     position: blockConfig.position,
    //                     color: blockConfig.color,
    //                     strokeColor: this.strokeColor,
    //                     lineWidth: this.lineWidth
    //                 })
    //             );
    //         })
    //         .catch(error => {
    //             console.error('Error loading level:', error);
    //         });
    // }

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
                    
                    // case "Load":
                    //     this.loadLevel();
                    //     break;

                    case "Undo":
                        this.blocks.pop();
                        break;

                    case "Clear":
                        this.blocks = [];
                }
            }
        });
    }

    // Changes button color on hover
    handleButtonHover(event) {
        this.buttons.forEach(button => 
            button.handleMouseHover(event));
    } 

    removeEventListeners() {
        this.canvas.removeEventListener("mousemove", this.handleButtonHoverBound);
        this.canvas.removeEventListener("click", this.handleButtonClickBound);
    }
}