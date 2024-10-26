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
        const clearButtonPosition = { x: canvas.width / 2 - 350, y: canvas.height / 2 + 275 };

        this.buttons = [
            new Button(buttonConfig, saveButtonPosition, "Save", this.canvas),
            new Button(buttonConfig, loadButtonPosition, "Load", this.canvas),
            new Button(buttonConfig, clearButtonPosition, "Clear", this.canvas)
        ];

        // Reference to the bound listeners
        this.handleButtonHoverBound = this.handleButtonHover.bind(this);
        this.handleButtonClickBound = this.handleButtonClick.bind(this);

        // Button listeners
        this.canvas.addEventListener("mousemove", this.handleButtonHoverBound);
        this.canvas.addEventListener("click", this.handleButtonClickBound);
    }

    // TODO: fix this render mess cringe
    render() {
        this.clear();

        this.blocks.forEach(block => 
            block.render(this.ctx));

        this.buttons.forEach(button => 
            button.render(this.ctx));

        if (this.previewBlock)
            this.renderPreviewBlock();
    }

    renderPreviewBlock() {
        this.ctx.strokeStyle = this.previewBlock.strokeColor;
        this.ctx.lineWidth = this.lineWidth;

        this.ctx.setLineDash([5, 10]);
        this.ctx.strokeRect(this.previewBlock.position.x, this.previewBlock.position.y, this.previewBlock.width, this.previewBlock.height);
        this.ctx.setLineDash([]); 
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // Create a new block at the clicked position
    addBlock(event) {
        const rect = this.canvas.getBoundingClientRect();

        // Centers on click
        const x = event.clientX - rect.left - this.width / 2; 
        const y = event.clientY - rect.top - this.height / 2; 

        // Only add above half width
        if (y < this.canvas.height / 2) {
            const newBlock = new Block({
                width: this.width,
                height: this.height,
                position: { x, y },
                color: this.color,
                strokeColor: this.strokeColor,
                lineWidth: this.lineWidth
            });

            this.snapToEdge(newBlock);

            // if (this.isOverlapping(newBlock)) {
            //     this.snapToBlock(newBlock);
            // }
            
            this.blocks.push(newBlock);

            this.render();
        }
    }

    // Renders preview block on mouse move
    previewBlock(event) {
        const rect = this.canvas.getBoundingClientRect();

        // Centers on click
        const x = event.clientX - rect.left - this.width / 2;
        const y = event.clientY - rect.top - this.height / 2;

        const previewBlock = {
            width: this.width,
            height: this.height,
            position: { x, y },
            strokeColor: (y > this.canvas.height / 2 || this.isOverlapping(this.previewBlock)) ? 'red' : 'gray', // Is below half or overlaps
        };

        this.snapToEdge(previewBlock);
        // if (this.isOverlapping(previewBlock)) {
        //     this.snapToBlock(previewBlock);
        // }

        
        this.previewBlock = previewBlock;

        this.render();
    }

    // snapToBlock(newBlock) {
    //     this.blocks.forEach(block => {
    //         // Finds block that is overlapping
    //         if (this.isOverlapping(newBlock)) {
    //             if 

    //         }
    //     })
    // }


    // Snaps block from edge
    snapToEdge(block) {
        const canvasWidth = this.canvas.width;
        const canvasHeight = this.canvas.height;
        const lineWidth = this.lineWidth;

        // Snaps to left edge
        if (block.position.x < lineWidth)
            block.position.x = lineWidth;

        // Snaps to right edge
        if (block.position.x + block.width > canvasWidth - lineWidth) 
            block.position.x = canvasWidth - block.width - lineWidth;

        // Snaps to top edge
        if (block.position.y < lineWidth)
            block.position.y = lineWidth;

        // Snaps to bottom edge
        if (block.position.y + block.height > canvasHeight - lineWidth)
            block.position.y = canvasHeight - block.height - lineWidth;
    }

    // Overlaps any block
    isOverlapping(newBlock) {
        const lineWidth = this.lineWidth;

        return this.blocks.some(block => {
            return (
                newBlock.position.x < block.position.x + block.width + lineWidth &&
                newBlock.position.x + newBlock.width + lineWidth > block.position.x &&
                newBlock.position.y < block.position.y + block.height + lineWidth &&
                newBlock.position.y + newBlock.height + lineWidth > block.position.y
            );
        });
    }

    // Save level to file
    saveFile() {
        const blockData = this.blocks.map(block => ({
            width: block.width,
            height: block.height,
            position: block.position,
            color: block.color,
            strokeColor: block.strokeColor,
            lineWidth: block.lineWidth
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

    loadLevel() {
        fetch('./classes/levelData(16).json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                const levelData = data[0].block; // This gets the array of blocks
                this.blocks = levelData.map(blockConfig => 
                    new Block(blockConfig)
                );

                this.render();
            })
            .catch(error => {
                console.error('Error loading level:', error);
            });
    }

    // Handles button clicks
    handleButtonClick(event) {
        const rect = this.canvas.getBoundingClientRect();
        
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        this.buttons.forEach(button => {
            if (button.checkPosition(mouseX, mouseY)) {
                if (button.text === "Save") {
                    this.saveFile();
                } 
                else if (button.text === "Load") {
                    this.loadLevel();
                }
                else if (button.text === "Clear") {
                    this.blocks = [];
                    this.render();
                }
            }
        });
    }

    // Changes button color on hover
    handleButtonHover(event) {
        this.buttons.forEach(button => 
            button.handleMouseHover(event));
    }
}