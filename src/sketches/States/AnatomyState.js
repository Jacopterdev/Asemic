import DisplayGrid from "../DisplayGrid.js";
import {SPACING as LAYOUT} from "./LayoutConstants.js";
import shapeSaver from "../ShapeSaver.js";
import GoToNextStateButton from "../SkeletonButtons/GoToNextStateButton.js";
import MutantShopping from "../MutantShopping.js";

class AnatomyState {
    constructor(p, points, mergedParams) {
        this.p = p;
        this.name = "Anatomy";
        this.points = points;
        this.mergedParams = mergedParams;
        this.displayGrid = new DisplayGrid(p, 4,3, LAYOUT.MARGIN, LAYOUT.MARGIN, LAYOUT.GRID_SIZE*1.5 - LAYOUT.MARGIN * 2, this.mergedParams);
        this.blurScale = 1;
        this.xray = false;
        this.resetXrayTimer = null; // To track the timeout for resetting xray
        this.viewMode = 'grid';

        this.previousStateButton = new GoToNextStateButton(this.p,
            LAYOUT.PREVIOUS_STATE_BUTTON_X,
            LAYOUT.PREVIOUS_STATE_BUTTON_Y,
            () => {
                this.p.changeState("Edit Skeleton");
            },
            true);
        this.nextStateButton = new GoToNextStateButton(this.p,
            LAYOUT.NEXT_STATE_BUTTON_X,
            LAYOUT.NEXT_STATE_BUTTON_Y,
            () => {
                this.p.changeState("Composition");
            })

    }

    draw() {
        this.p.cursor(this.p.ARROW);

        // Draw based on current view mode
        if (this.viewMode === 'grid') {
            this.displayGrid.drawShapes();
            this.p.applyEffects(this.blurScale);
            this.displayGrid.drawGrid();
            if (this.xray) this.displayGrid.drawShapes(true);

        } else if (this.viewMode === 'shopping') {
            this.p.clear();  // Clear the main canvas
            this.p.background(255);  // Set the background to white

            this.mutantShopping.drawShapes();
            this.p.applyEffects(this.mutantShopping.scale);
            this.mutantShopping.drawGrid();
            //this.mutantShopping.draw();
        }
        this.previousStateButton.draw();
        this.nextStateButton.draw();

    }
    updateMergedParams(newMergedParams) {
        this.mergedParams = newMergedParams;
        this.blurScale = this.displayGrid.scale * this.p.getShapeScale() * LAYOUT.SHAPE_SCALE;

        this.displayGrid.updateMergedParams(this.mergedParams);
        if(this.mutantShopping){
            this.mutantShopping.updateMergedParams(this.mergedParams);
        }

        // Clear any existing timer
        if (this.resetXrayTimer) {
            clearTimeout(this.resetXrayTimer);
        }

        // Set a timer to disable xray mode after 1 second
        this.resetXrayTimer = setTimeout(() => {
            this.xray = false;
        }, 1000);
    }

    // Add a method to start mutant shopping
    startMutantShopping(letter) {
        const shoppingWidth = LAYOUT.GRID_SIZE-(2*LAYOUT.MARGIN);
        const shoppingHeight = LAYOUT.GRID_SIZE-(2*LAYOUT.MARGIN);
        const shoppingX = LAYOUT.MARGIN; // Center horizontally
        const shoppingY = LAYOUT.MARGIN; // Center vertically

        this.mutantShopping = new MutantShopping(
            this.p,
            shoppingX,
            shoppingY,
            shoppingWidth,
            shoppingHeight,
            this.mergedParams, // Assuming you have merged parameters
            (event) => this.handleEvent(event),
            letter
        );

        // Change view mode to shopping
        this.viewMode = 'shopping';
    }

    handleEvent(event) {
        if (!event) return;

        switch (event.type) {
            case 'startMutantShopping':
                this.startMutantShopping(event.letter);
                break;
            case 'exitMutantShopping':
                // Handle back button click from MutantShopping
                this.displayGrid.updateMergedParams(this.mergedParams);
                this.viewMode = 'grid';
                this.mutantShopping = null;
                break;

            // ... handle other events ...
        }
    }



    // Update the mousePressed method to handle button clicks
    /**
    mousePressed() {
        if (this.viewMode === 'grid') {
            // Delegate button handling to DisplayGrid
            this.displayGrid.handleMousePressed();

            this.xray = true;

            if(this.previousStateButton.checkHover(this.p.mouseX, this.p.mouseY)){
                this.previousStateButton.click();
            }

            if(this.nextStateButton.checkHover(this.p.mouseX, this.p.mouseY)){
                this.nextStateButton.click();
            }
        } else {
            this.mutantShopping.mousePressed(this.p.mouseX, this.p.mouseY);
        }
    }*/
    mousePressed() {
        if (this.viewMode === 'grid') {
            // Delegate button handling to DisplayGrid
            const event = this.displayGrid.handleMousePressed();
            if(event){
                this.handleEvent(event);
                return;
            }

            this.xray = true;


        } else if (this.viewMode === 'shopping' && this.mutantShopping) {
            const event = this.mutantShopping.mousePressed(this.p.mouseX, this.p.mouseY);
            if (event) {
                this.handleEvent(event);
            }
        }
        if(this.previousStateButton.checkHover(this.p.mouseX, this.p.mouseY)){
            this.previousStateButton.click();
        }

        if(this.nextStateButton.checkHover(this.p.mouseX, this.p.mouseY)){
            this.nextStateButton.click();
        }
    }

    mouseDragged() {
        this.displayGrid.handleMouseDragged();
        this.xray = true;
        // No mouse drag interaction in this state
    }

    mouseReleased() {
        this.displayGrid.handleMouseReleased();
        this.xray = false;
        //this.p.animateSmoothAmount();
    }

    mouseWheel(event) {
        this.displayGrid.handleScroll(event.delta);
    }
}
export default AnatomyState;