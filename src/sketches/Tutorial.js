import {SPACING as LAYOUT} from "./States/LayoutConstants.js";

class Tutorial {
    constructor(p) {
        this.p = p;
        this.active = false; // Start with tutorial inactive
        this.currentStep = 0;
        this.fadeInOpacity = 0;
        this.lastStepChangeTime = 0;
        this.MARGIN = 20; // Define default margin if you don't want to import
        
        // Button dimensions
        this.buttonWidth = 80;
        this.buttonHeight = 40;
        this.buttonMargin = 10;
        
        // Help button dimensions
        this.helpButtonSize = 30; // Same size as delete button
        this.helpButtonX = p.width - this.helpButtonSize - (LAYOUT ? LAYOUT.MARGIN : this.MARGIN);
        this.helpButtonY = 20;
        
        // Define all tutorial steps
        this.steps = [
            {
                target: "canvas",
                title: "Skeleton Editor",
                description: "Welcome to the Skeleton Editor! The skeleton will act as the structural foundation of your shapes.",
                position: "center"
            },
            {
                target: "canvas_click",
                title: "Creating Points",
                description: "Click anywhere on the canvas to create a point.",
                position: "center"
            },
            {
                target: "point_click",
                title: "Deleting Points",
                description: "Click directly on any point to delete it immediately.",
                position: "bottom"
            },
            {
                target: "point_drag",
                title: "Moving Points",
                description: "Click and drag any point to reposition it.",
                position: "bottom"
            },
            {
                target: "shift_click",
                title: "Shift + Click",
                description: "Hold SHIFT while clicking to create a point with a visible connection only to the previous point.",
                position: "center"
            },
            {
                target: "lines",
                title: "Line Selection",
                description: "Click on any line to toggle it.",
                position: "center"
            },
            {
                target: "gridType",
                title: "Grid Selection",
                description: "Change between circular, rectangular, or no grid using the controls in the top right.",
                position: "right"
            },
            {
                target: "fillGridButton",
                title: "Fill Grid",
                description: "This button fills the current grid with evenly spaced points.",
                position: "left"
            },
            {
                target: "deleteButton",
                title: "Delete All",
                description: "Use this button to clear all points and lines from the canvas.",
                position: "left"
            },
            {
                target: "missAre",
                title: "MissArea Slider",
                description: "Adjust this slider to control how much variation is applied to your shape.",
                position: "right"
            },
            {
                target: "anatomyPage",
                title: "Next Steps",
                description: "When you've finished creating your skeleton, go to the Anatomy page to continue building your shape.",
                position: "right"
            }
        ];
    }
    
    // Add this method to toggle tutorial visibility
    toggleTutorial() {
        this.active = !this.active;
        if (this.active) {
            // Reset to first step when reopening
            this.currentStep = 0;
            this.fadeInOpacity = 0;
            this.lastStepChangeTime = this.p.millis();
        }
    }
    
    // Modify draw method to always render something (help button or tutorial)
    draw() {
        if (!this.active) {
            // Draw the question mark button when tutorial is inactive
            this.drawHelpButton();
            return;
        }
        
        // Existing tutorial drawing code
        const step = this.steps[this.currentStep];
        this.p.push();
        
        // Update fade-in effect
        const elapsed = this.p.millis() - this.lastStepChangeTime;
        this.fadeInOpacity = this.p.min(255, elapsed * 0.5);
        
        // Draw tooltip
        this.drawTooltip(step);
        
        // Draw navigation buttons
        this.drawNavigationButtons();
        
        // Draw highlighted area based on target
        this.highlightTarget(step);
        
        this.p.pop();
    }
    
    
    
    // Modify to show X with the same style as other utility buttons
    drawNavigationButtons() {
        const buttonY = this.p.height - this.buttonHeight - 20;
        
        // X button with consistent styling
        const isXHovered = 
            this.p.mouseX >= this.helpButtonX && 
            this.p.mouseX <= this.helpButtonX + this.helpButtonSize && 
            this.p.mouseY >= this.helpButtonY && 
            this.p.mouseY <= this.helpButtonY + this.helpButtonSize;
        
        this.p.strokeWeight(0);
        // Use the same colors as in drawHelpButton
        const buttonColor = isXHovered ? 180 : 210;
        this.p.fill(buttonColor, this.fadeInOpacity);
        this.p.rect(this.helpButtonX, this.helpButtonY, this.helpButtonSize, this.helpButtonSize, 4);

        this.p.fill(255, this.fadeInOpacity); // White text
        this.p.noStroke();
        this.p.textSize(18); // Slightly smaller for the smaller button
        this.p.textAlign(this.p.CENTER, this.p.CENTER);
        this.p.text("×", this.helpButtonX + this.helpButtonSize/2, this.helpButtonY + this.helpButtonSize/2);
        
        // Rest of navigation buttons code remains the same
        // Previous button (if not on first step)
        if (this.currentStep > 0) {
            const prevX = this.p.width/2 - this.buttonWidth - this.buttonMargin;
            this.p.fill(200, 200, 200, this.fadeInOpacity);
            this.p.stroke(100, 100, 100, this.fadeInOpacity);
            this.p.rect(prevX, buttonY, this.buttonWidth, this.buttonHeight, 5);
            this.p.fill(50, 50, 50, this.fadeInOpacity);
            this.p.noStroke();
            this.p.textSize(14);
            this.p.textAlign(this.p.CENTER, this.p.CENTER);
            this.p.text("Previous", prevX + this.buttonWidth/2, buttonY + this.buttonHeight/2);
        }
        
        // Next button
        const nextX = this.p.width/2 + this.buttonMargin;
        this.p.fill(60, 120, 255, this.fadeInOpacity);
        this.p.stroke(40, 80, 200, this.fadeInOpacity);
        this.p.rect(nextX, buttonY, this.buttonWidth, this.buttonHeight, 5);
        this.p.fill(255, 255, 255, this.fadeInOpacity);
        this.p.noStroke();
        this.p.textSize(14);
        this.p.textAlign(this.p.CENTER, this.p.CENTER);
        const buttonText = this.currentStep === this.steps.length - 1 ? "Finish" : "Next";
        this.p.text(buttonText, nextX + this.buttonWidth/2, buttonY + this.buttonHeight/2);
    }
    
    // Update to handle the help button click
    handleMousePressed(mouseX, mouseY) {
        // Check for help/close button clicks (both in same position)
        if (mouseX >= this.helpButtonX && 
            mouseX <= this.helpButtonX + this.helpButtonSize &&
            mouseY >= this.helpButtonY && 
            mouseY <= this.helpButtonY + this.helpButtonSize) {
            
            this.toggleTutorial();
            return true;
        }
        
        if (!this.active) return false;
        
        // Rest of your existing button handling...
        const buttonY = this.p.height - this.buttonHeight - 20;
        
        // Previous button
        if (this.currentStep > 0) {
            const prevX = this.p.width/2 - this.buttonWidth - this.buttonMargin;
            if (mouseX >= prevX && mouseX <= prevX + this.buttonWidth &&
                mouseY >= buttonY && mouseY <= buttonY + this.buttonHeight) {
                this.previous();
                return true;
            }
        }
        
        // Next/Finish button
        const nextX = this.p.width/2 + this.buttonMargin;
        if (mouseX >= nextX && mouseX <= nextX + this.buttonWidth &&
            mouseY >= buttonY && mouseY <= buttonY + this.buttonHeight) {
            
            // If on last step, complete the tutorial immediately
            if (this.currentStep === this.steps.length - 1) {
                this.active = false; // Force active to false directly
                return true;
            } else {
                this.next();
                return true;
            }
        }
        
        return false;
    }
    
    next() {
        if (this.currentStep < this.steps.length - 1) {
            this.currentStep++;
            this.fadeInOpacity = 0;
            this.lastStepChangeTime = this.p.millis();
        } else {
            // We're on the last step, so complete the tutorial
            this.complete();
        }
    }
    
    previous() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.fadeInOpacity = 0;
            this.lastStepChangeTime = this.p.millis();
        }
    }
    
    skip() {
        this.complete();
    }
    
    complete() {
        this.active = false;
        // Comment out the localStorage code so tutorial shows every time
        // Store in localStorage that the tutorial has been completed
        /*
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('tutorialCompleted', 'true');
        }
        */
    }
    
    drawTooltip(step) {
        const tooltipWidth = 300;
        const tooltipHeight = 150;
        let x, y;
        
        // Position tooltip based on target
        switch (step.target) {
            case "deleteButton":
                x = this.p.width - 200;
                y = this.p.height - 200;
                break;
            case "fillGridButton":
                x = this.p.width - 280;
                y = this.p.height - 200;
                break;
            // Place tooltip at top for point and line related steps and missAre
            case "canvas_click":
            case "point_click":
            case "point_drag":
            case "shift_click":
            case "lines":
            case "missAre": 
            case "anatomyPage":
            case "gridType": // Added gridType to the top group
                x = this.p.width/2 - tooltipWidth/2;
                y = 50; // Position at top with small margin
                break;
            default:
                x = this.p.width/2 - tooltipWidth/2;
                y = this.p.height/3 - tooltipHeight/2;
        }
        
        // Draw tooltip background
        this.p.fill(255, 255, 255, this.fadeInOpacity);
        this.p.stroke(100, 100, 100, this.fadeInOpacity);
        this.p.strokeWeight(1);
        this.p.rect(x, y, tooltipWidth, tooltipHeight, 10);
        
        // Draw title
        this.p.fill(50, 50, 50, this.fadeInOpacity);
        this.p.noStroke();
        this.p.textSize(18);
        this.p.textAlign(this.p.LEFT, this.p.TOP);
        this.p.text(step.title, x + 20, y + 20);
        
        // Draw description
        this.p.textSize(14);
        this.p.text(step.description, x + 20, y + 50, tooltipWidth - 40, tooltipHeight - 70);
        
        // Draw step indicator
        this.p.textAlign(this.p.RIGHT);
        this.p.textSize(12);
        this.p.fill(120, 120, 120, this.fadeInOpacity);
        this.p.text(`${this.currentStep + 1}/${this.steps.length}`, x + tooltipWidth - 20, y + tooltipHeight - 20);
    }
    
    highlightTarget(step) {
        switch (step.target) {
            case "deleteButton":
                // Use either this.MARGIN or LAYOUT.MARGIN depending on which approach you took
                this.highlightButton(this.p.width - 30 - (LAYOUT ? LAYOUT.MARGIN : this.MARGIN), 
                                   this.p.height - 30 - (LAYOUT ? LAYOUT.MARGIN : this.MARGIN), 30);
                break;
                
            case "fillGridButton":
                this.highlightButton(this.p.width - 30*2 - (LAYOUT ? LAYOUT.MARGIN*1.5 : this.MARGIN*1.5), 
                                   this.p.height - 30 - (LAYOUT ? LAYOUT.MARGIN : this.MARGIN), 30);
                break;
                
            case "point_click":
            case "point_drag":
   
                break;
                
            case "shift_click":
    
                break;
                
            case "lines":
             
                break;
                
            case "missAre":
                // No highlighting box needed, just the arrow pointing left
                
                // Position the arrow in the top-left area
                const arrowX = 60; // Position a bit further from the edge
                const arrowY = 10; // Position in top-left
                const arrowPulse = 1 + Math.sin(this.p.millis() / 200) * 0.2;
                this.p.push();
                this.p.translate(arrowX, arrowY);
                this.p.scale(arrowPulse);
                this.drawArrow(0, 0, -40, 0); // Point horizontally left
                this.p.pop();
                break;

                
            case "anatomyPage":
                // Highlight the navigation to Anatomy page
                // Assuming navigation tabs are at the top
                const navX = 200; // Approximate X position of the Anatomy tab
                const navY = 30;  // Approximate Y position of the navigation bar
                
                
                // Draw an animated arrow pointing to it
                const navArrowX = 180;
                const navArrowY = 50;
                const navArrowPulse = 1 + Math.sin(this.p.millis() / 200) * 0.2; // Renamed from navPulse
                this.p.push();
                this.p.translate(navArrowX, navArrowY);
                this.p.scale(navArrowPulse); 
                this.drawArrow(0, 0, 0, -30);
                this.p.pop();
                
                break;

            case "gridType":
                // Arrow pointing to the top right corner where grid controls are
                const gridX = this.p.width - 132; // Position near the right edge
                const gridY = 50;               // Position near the top
                const gridPulse = 1 + Math.sin(this.p.millis() / 200) * 0.2;
                this.p.push();
                this.p.translate(gridX, gridY);
                this.p.scale(gridPulse);
                this.drawArrow(0, 0, 30, -30); // Point diagonally up and right
                this.p.pop();
                break;
        }
    }
    
    highlightButton(x, y, size) {
        // Draw glowing outline around the button
        const glowSize = 8;
        for (let i = glowSize; i > 0; i--) {
            this.p.noFill();
            // Change from yellow to orange
            this.p.stroke(255, 165, 0, this.fadeInOpacity * (1 - i/glowSize));
            this.p.strokeWeight(i);
            this.p.rect(x - glowSize/2, y - glowSize/2, size + glowSize, size + glowSize, 5);
        }
    }
    
    drawArrow(x1, y1, x2, y2) {
        this.p.push();
        // Change from yellow (255, 255, 0) to orange (255, 165, 0)
        this.p.stroke(255, 165, 0, this.fadeInOpacity);
        this.p.strokeWeight(3);
        this.p.fill(255, 165, 0, this.fadeInOpacity);
        
        // Draw line
        this.p.line(x1, y1, x2, y2);
        
        // Calculate arrow angle
        const angle = Math.atan2(y2 - y1, x2 - x1);
        
        // Draw arrow head
        const arrowSize = 10;
        this.p.translate(x2, y2);
        this.p.rotate(angle);
        this.p.triangle(0, 0, -arrowSize, -arrowSize/2, -arrowSize, arrowSize/2);
        this.p.pop();
    }
}

export default Tutorial;