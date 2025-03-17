import {SPACING as LAYOUT} from "./States/LayoutConstants.js";

class Tutorial {
    constructor(p) {
        this.p = p;
        
        // Check if tutorial has been completed before
        if (typeof localStorage !== 'undefined' && localStorage.getItem('tutorialCompleted') === 'true') {
            this.active = false; // Keep tutorial inactive if completed before
        } else {
            // Set initial state based on your preference:
            this.active = false; // Start inactive until user clicks help button
            // Or this.active = true; // Start active immediately on first visit
        }
        
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

        if(isXHovered) this.p.cursor(this.p.HAND);

        this.p.strokeWeight(0);
        // Use the same colors as in drawHelpButton
        const buttonColor = isXHovered ? 180 : 210;
        this.p.fill(buttonColor, this.fadeInOpacity);
        this.p.rect(this.helpButtonX, this.helpButtonY, this.helpButtonSize, this.helpButtonSize, 4);

        this.p.fill(255, this.fadeInOpacity); // White text
        this.p.noStroke();
        this.p.textSize(18); // Slightly smaller for the smaller button
        this.p.textAlign(this.p.CENTER, this.p.CENTER);
        this.p.text("×", this.helpButtonX + this.helpButtonSize/2, this.helpButtonY + this.helpButtonSize/2 + 1);


        const nextX = this.p.width/2 + this.buttonMargin;
        const prevX = this.p.width/2 - this.buttonWidth - this.buttonMargin;

        const isNextHovered =
            this.p.mouseX > nextX &&
            this.p.mouseX < nextX + this.buttonWidth &&
            this.p.mouseY > buttonY &&
            this.p.mouseY < buttonY + this.buttonHeight;

        const isPrevHovered =
            this.p.mouseX > prevX &&
            this.p.mouseX < prevX + this.buttonWidth &&
            this.p.mouseY > buttonY &&
            this.p.mouseY < buttonY + this.buttonHeight;

        if(isNextHovered || isPrevHovered) this.p.cursor(this.p.HAND);

        // Rest of navigation buttons code remains the same
        // Previous button (if not on first step)
        if (this.currentStep > 0) {
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

        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('tutorialCompleted', 'true');
        }
        
    }
    
    // Update drawTooltip to position tooltips further from edges
    drawTooltip(step) {
        const tooltipWidth = 300;
        const tooltipHeight = 150;
        let x, y;
        
        // Position tooltip based on target
        switch (step.target) {
            case "deleteButton":
                x = this.p.width - 320; // Move further from right edge
                y = this.p.height - 230; // Move further from bottom edge
                break;
                
            case "fillGridButton":
                x = this.p.width - 350; // Move further from right edge
                y = this.p.height - 230; // Move further from bottom edge
                break;
                
            // Place tooltip at top for point and line related steps and missAre
            case "canvas_click":
            case "point_click":
            case "point_drag":
            case "shift_click":
            case "lines":
            case "missAre": 
            case "anatomyPage":
            case "gridType":
                x = this.p.width/2 - tooltipWidth/2;
                y = 50; // Position at top with small margin
                break;
                
            default:
                x = this.p.width/2 - tooltipWidth/2;
                y = this.p.height/3 - tooltipHeight/2;
        }
        
        // Ensure tooltips don't go off-screen
        x = Math.max(20, Math.min(x, this.p.width - tooltipWidth - 20));
        y = Math.max(20, Math.min(y, this.p.height - tooltipHeight - 20));
        
        // Create a modern, clean tooltip design
        this.p.push();
        
        // Rest of the tooltip drawing code remains the same...
        // Semi-transparent background
        this.p.fill(40, 40, 40, this.fadeInOpacity * 0.9);
        this.p.strokeWeight(0);
        this.p.rect(x, y, tooltipWidth, tooltipHeight, 8); // Rounded corners
        
        // Add a subtle highlight at the top for a glass effect
        this.p.fill(255, 255, 255, this.fadeInOpacity * 0.1);
        this.p.rect(x, y, tooltipWidth, 20, 8, 8, 0, 0);
        
        // Title text
        this.p.fill(255, 255, 255, this.fadeInOpacity);
        this.p.noStroke();
        this.p.textSize(16);
        this.p.textStyle(this.p.BOLD);
        this.p.textAlign(this.p.LEFT);
        this.p.text(step.title, x + 20, y + 30);
        
        // Description text
        this.p.fill(220, 220, 220, this.fadeInOpacity);
        this.p.textSize(14);
        this.p.textStyle(this.p.NORMAL);
        
        // Split text into multiple lines if needed
        const words = step.description.split(' ');
        let line = '';
        let yPos = y + 60;
        const lineHeight = 20;
        
        words.forEach(word => {
            const testLine = line + word + ' ';
            const testWidth = this.p.textWidth(testLine);
            
            if (testWidth > tooltipWidth - 40) {
                this.p.text(line, x + 20, yPos);
                line = word + ' ';
                yPos += lineHeight;
            } else {
                line = testLine;
            }
        });
        
        this.p.text(line, x + 20, yPos);
        
        this.p.pop();
    }
    
    // Update the highlightTarget method to use indicators instead of highlights for buttons
    highlightTarget(step) {
        switch (step.target) {
            case "deleteButton":
                // Use indicator instead of highlight
                this.drawIndicator(
                    this.p.width - 35, 
                    this.p.height - 65, 
                    'down'
                );
                break;
                
            case "fillGridButton":
                // Use indicator instead of highlight
                this.drawIndicator(
                    this.p.width - 75, 
                    this.p.height - 65, 
                    'down'
                );
                break;
                
            case "point_click":
            case "point_drag":
                break;
                
            case "shift_click":
                break;
                
            case "lines":
                break;
                
            case "missAre":
                this.drawIndicator(16, 10, 'left');
                break;

            case "anatomyPage":
                this.drawIndicator(170, 15, 'up');
                break;

            case "gridType":
                this.drawIndicator(this.p.width - 70, 20, "up");
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
    
    // Update the drawIndicator method to use the same blue as the Next button
    drawIndicator(x, y, direction) {
        this.p.push();
        
        // Calculate pulse effect with faster speed
        const pulseRate = 0.005; // Increased speed
        const baseOpacity = 0.5;  // Minimum opacity
        const pulseAmount = 0.5;  // How much the opacity fluctuates
        
        // Use sine wave for smooth pulsing
        const pulse = baseOpacity + pulseAmount * Math.sin(this.p.millis() * pulseRate);
        
        // Use the same blue color as the Next button (60, 120, 255)
        this.p.fill(60, 120, 255, this.fadeInOpacity * pulse);
        this.p.noStroke(); // No stroke
        
        // Draw a triangle pointing in the specified direction
        // direction can be 'up', 'down', 'left', 'right' or a degree angle
        let angle = 0;
        
        if (direction === 'up') angle = -90;
        else if (direction === 'down') angle = 90;
        else if (direction === 'left') angle = 180;
        else if (direction === 'right') angle = 0;
        else angle = direction; // Use the provided angle directly
        
        // Position and draw the triangle
        this.p.translate(x, y);
        this.p.rotate(this.p.radians(angle));
        
        // Draw a more pointy triangle
        const length = 9;  // Total length of triangle
        const width = 6;    // Width of the base
        
        this.p.triangle(
            length, 0,        // Pointy tip
            -length/3, -width/1.1,  // Left corner (pulled back for pointiness)
            -length/3, width/1.1    // Right corner (pulled back for pointiness)
        );
        
        this.p.pop();
    }
}

export default Tutorial;