import * as Constants from "../constants/constants.js";

export class Canvas{

    isMouseDown = false;
    reset = false;
    sandCount = 0;
    // colorHue = 1;
    matrix = createEmptyMatrix();
    speed = 0;
    selectedColor = Constants.CANVAS_COLOR_SELECTED_DEFAULT;

    constructor(width, height, pixelSize, canvasId){
        this.WIDTH = width * pixelSize;
        this.HEIGHT = height * pixelSize;
        this.CANVAS_ID = canvasId;
        this.PIXEL_SIZE = pixelSize;
        this.selfElement = this.initHTMLCanvas(this.WIDTH, this.HEIGHT, canvasId);
        this.ctx = this.selfElement.getContext("2d");
    }

    initHTMLCanvas(width, height, canvasId){
        let canvas = document.querySelector(`#${canvasId}`);
        console.log(canvas);
        canvas.width = width;
        canvas.height = height;
        canvas.id = canvasId;
        
        canvas.addEventListener('mousedown', (e) => {
            this.isMouseDown = true;
        });

        canvas.addEventListener('mouseup', (e) => {
            this.isMouseDown = false;
        });

        canvas.addEventListener('mousemove', (e) => {
            if(this.isMouseDown){
                let x = Math.floor(e.offsetX / Constants.CANVAS_PIXEL_SIZE);
                let y = Math.floor(e.offsetY / Constants.CANVAS_PIXEL_SIZE);

                if(this.matrix[x][y] == 0){ 
                    this.matrix[x][y] = randomColorInSpectrum(this.selectedColor);
                    this.drawPixel(x, y, Constants.CANVAS_COLOR_DEFAULT);
                }
                
            }
        });
        
        // document.querySelector(parentElement).appendChild(canvas);

        return canvas;
    }

    renderCanvas() {
        this.clear();
    
        for (let i = 0; i < this.matrix.length; i++) {
            for (let j = 0; j < this.matrix[0].length; j++) {
                if (this.matrix[i][j] > 0) {
                    this.drawPixel(i, j, Constants.hexColorToString(this.matrix[i][j]));
                    this.sandCount++;
                }
            }
        }

        this.reset = (this.sandCount == 0) ? false : this.reset;
    }

    run(){

        let newMatrix = createEmptyMatrix();
    
        for (let i = this.matrix.length-1; i >= 0; i--) {
            for (let j = this.matrix[0].length-1; j >= 0; j--) {
                let current = this.matrix[i][j];
                let below = newMatrix[i][j+1];
                let dir = (Math.random() < 0.5) ? -1 : 1;
    
                let belowA = (i + dir >= 0 && i + dir <= newMatrix.length-1) ? this.matrix[i+dir][j+1] : undefined;
                let belowB = (i - dir >= 0 && i - dir <= newMatrix.length-1) ? this.matrix[i-dir][j+1] : undefined;
                
                if(current > 0){
                    if (below == 0) { // fall down
                        newMatrix[i][j+1] = current;
                    } else if (belowA == 0){ // fall left
                        newMatrix[i+dir][j+1] = current;
                    } else if (belowB == 0) { // fall right
                        newMatrix[i-dir][j+1] = current;
                    } else if (!this.reset || j != newMatrix[0].length-1){
                        newMatrix[i][j] = current;
                    }
                }
            }
        }
    
        this.matrix = newMatrix;
    
        this.renderCanvas();
    
        setTimeout(requestAnimationFrame, this.speed, () => {
            this.run()
        })
    }

    drawPixel(x, y, color){
        x *= this.PIXEL_SIZE;
        y *= this.PIXEL_SIZE;

        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, this.PIXEL_SIZE, this.PIXEL_SIZE);
    }

    clear(){
        this.sandCount = 0;
        this.ctx.fillStyle = Constants.CANVAS_COLOR_EMPTY;
        this.ctx.fillRect(0, 0, this.WIDTH, this.HEIGHT);
    }

}

function createEmptyMatrix(){
    return new Array(Constants.CANVAS_WIDTH).fill(0)
                .map(() => new Array(Constants.CANVAS_HEIGHT).fill(0));
}

function randomColorInSpectrum(color){
    let colorStr = Constants.hexColorToString(color);
    let rStr = "0x" + colorStr.substring(1, 3);
    let gStr = "0x" + colorStr.substring(3, 5);
    let bStr = "0x" + colorStr.substring(5, 7);

    let range = Math.round(Math.random() * 15);
    let variance = (Math.random() < 0.5) ? -range : range; 

    let r = Math.max(Math.min(parseInt(rStr) + variance, 255), 0);
    let g = Math.max(Math.min(parseInt(gStr) + variance, 255), 0);
    let b = Math.max(Math.min(parseInt(bStr) + variance, 255), 0);

    let hexCode = "0x" + (Constants.hexToString(r).padStart(2, '0') + 
                            Constants.hexToString(g).padStart(2, '0') +
                            Constants.hexToString(b).padStart(2, '0'));

    return parseInt(hexCode);

}