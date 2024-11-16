import { Button } from "../components/button.js";

const difficulties = {
    EASY: "EASY",
    NORMAL: "NORMAL",
    HARD: "HARD",
    NIGHTMARE: "NIGHTMARE"
};

export class Options {
    constructor(canvas, config) {
        this.canvas = canvas;
        this.ctx = this.canvas.getContext("2d");

        const difficultyButtonPosition = { x: this.canvas.width / 2 - 100, y: this.canvas.height / 2 - 60 };
        const musicButtonPosition = { x: this.canvas.width / 2 - 100, y: this.canvas.height / 2 + 20 };
        const soundButtonPosition = { x: this.canvas.width / 2 - 100, y: this.canvas.height / 2 + 100 };
        const controlsButtonPosition = { x: this.canvas.width / 2 - 100, y: this.canvas.height / 2 + 180 };

        this.buttons = [
            new Button(config.button, difficultyButtonPosition, "Difficulty", this.canvas),
            new Button(config.button, musicButtonPosition, "Music", this.canvas),
            new Button(config.button, soundButtonPosition, "Sound", this.canvas),
            new Button(config.button, controlsButtonPosition, "Controls", this.canvas)
        ];

        this.handleButtonHoverBound = this.handleButtonHover.bind(this);
        this.handleButtonClickBound = this.handleButtonClick.bind(this);

        this.difficulties = difficulties;

        let storedMusicVolume = parseInt(localStorage.getItem("musicVolume"), 10);
        if (storedMusicVolume === null || isNaN(storedMusicVolume))
            storedMusicVolume = 1;

        let storedSoundVolume = parseInt(localStorage.getItem("soundVolume"), 10);
        if (storedSoundVolume === null || isNaN(storedSoundVolume))
            storedSoundVolume = 1;

        let storedDifficulty = localStorage.getItem("difficulty");
        if (storedDifficulty === null)
            storedDifficulty = difficulties.NORMAL;

        let storedControls= localStorage.getItem("controls");
        if (storedControls === null) {
            storedControls = "mouse";
        }

        this.musicVolume = storedMusicVolume;
        this.soundVolume = storedSoundVolume;
        this.difficulty = storedDifficulty;
        this.controls = storedControls;
    }

    render() {
        this.clear();

        this.buttons.forEach(button => {
            if (button.text.startsWith("Difficulty"))
                button.text = "Difficulty: " + this.difficulty;
            
            else if (button.text.startsWith("Music")) {
                if (this.musicVolume === 1)
                    button.text = "Music: 100%";
                else
                    button.text = "Music: Mute";
            }

            else if (button.text.startsWith("Sound")) {
                if (this.soundVolume === 1)
                    button.text = "Sound: 100%";
                else
                    button.text = "Sound: Mute";
            }

            if (this.difficulty === difficulties.NIGHTMARE && button.text.startsWith("Difficulty")) {
                button.defaultColor = "red";
                button.hoverColor = "#a32218";
            }
            else {
                button.defaultColor = "#f8d928";
                button.hoverColor = "#998303";
            }

            if (button.text.startsWith("Controls")) {
                if (this.controls === "mouse")
                    button.text = "Controls: mouse";
                else
                    button.text = "Controls: keyboard";
            }

            button.render(this.ctx);
        })
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    changeDifficulty() {
        switch (this.difficulty) {
            case difficulties.EASY:
                this.difficulty = difficulties.NORMAL;
                break;

            case difficulties.NORMAL:
                this.difficulty = difficulties.HARD;
                break;
            
            case difficulties.HARD:
                this.difficulty = difficulties.NIGHTMARE;
                break;

            case difficulties.NIGHTMARE:
                this.difficulty = difficulties.EASY;
                break;
        }
        this.saveDifficulty();
    }

    changeControls() {
        switch (this.controls) {
            case "mouse":
                this.controls = "keyboard";
                break;
            case "keyboard":
                this.controls = "mouse";
                break;
        }
        this.saveControls();
    }

    muteMusic() {
        if (this.musicVolume === 1)
            this.musicVolume = 0;
        else
            this.musicVolume = 1;

        this.saveMusicVolume();
    }

    muteSound() {
        if (this.soundVolume === 1)
            this.soundVolume = 0;
        else
            this.soundVolume = 1;

        this.saveSoundVolume();
    }

    // Handles button clicks
    handleButtonClick(event) {
        const rect = this.canvas.getBoundingClientRect();
        
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        this.buttons.forEach(button => {
            if (button.checkPosition(mouseX, mouseY)) {
                if (button.text.startsWith("Difficulty"))
                    this.changeDifficulty();

                else if (button.text.startsWith("Music")) 
                    this.muteMusic();
            
                else if (button.text.startsWith("Sound")) 
                    this.muteSound();

                else if (button.text.startsWith("Controls"))
                    this.changeControls();
            }
        });
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

    saveMusicVolume() {
        localStorage.setItem("musicVolume", this.musicVolume.toString());
    }

    saveSoundVolume() {
        localStorage.setItem("soundVolume", this.soundVolume.toString());
    }

    saveDifficulty() {
        localStorage.setItem("difficulty", this.difficulty);
    }

    saveControls() {
        localStorage.setItem("controls", this.controls);
    }
}