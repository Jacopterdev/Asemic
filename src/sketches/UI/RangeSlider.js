class RangeSlider {
    constructor(p, x, y, width, height, minValue, maxValue, initialValue, onChange) {
        this.p = p;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.minValue = minValue;
        this.maxValue = maxValue;
        this.value = initialValue || minValue;
        this.onChange = onChange;
        
        this.visible = false;
        this.isDragging = false;
        
        // Make the track even thinner
        this.trackWidth = 2; // Reduced from 4px to 2px
        
        // Fatter rectangular knob dimensions
        this.knobWidth = 16; // Increased from 12px to 16px 
        this.knobHeight = 10; // Increased from 6px to 8px
        
        // Colors - updated to dark track and light knob
        this.trackColor = this.p.color(75, 85, 99); // Dark grey track
        this.activeTrackColor = this.p.color(100, 110, 125); // Slightly lighter for the active part
        this.knobColor = this.p.color(180, 180, 180); // Slightly lighter grey knob
        this.knobHoverColor = this.p.color(180, 180, 180); // Slightly lighter grey knob
        this.textColor = this.p.color(75, 85, 99); // text-gray-600
        this.trackColor = this.p.color(200, 200, 200); // Light grey for the part above the knob
        
        // Handle hover state
        this.isKnobHovered = false;
    }
    
    draw() {
        if (!this.visible) return;
        
        const p = this.p;
        p.push();
        
        // Calculate knob position based on value
        const valueRange = this.maxValue - this.minValue;
        const knobY = this.y + (this.height - this.knobHeight) * (1 - (this.value - this.minValue) / valueRange);
        
        // Check if mouse is hovering over the knob
        this.isKnobHovered = (
            p.mouseX >= this.x - this.knobWidth/2 && 
            p.mouseX <= this.x + this.knobWidth/2 &&
            p.mouseY >= knobY - this.knobHeight/2 && 
            p.mouseY <= knobY + this.knobHeight/2
        );
        
        // Update cursor style if hovering
        if (this.isKnobHovered || this.isDragging) {
            p.cursor(p.HAND);
        }
        
        // Draw track background (thin line)
        p.noStroke();
        p.fill(this.trackColor);
        p.rect(this.x - this.trackWidth/2, this.y, this.trackWidth, this.height, this.trackWidth/2);
        
        // Draw active part of track
        p.fill(this.activeTrackColor);
        p.rect(
            this.x - this.trackWidth/2, 
            knobY, 
            this.trackWidth, 
            this.height - (knobY - this.y), 
            this.trackWidth/2
        );
        
        // Draw rectangular knob
        p.fill(this.isKnobHovered || this.isDragging ? this.knobHoverColor : this.knobColor);
        // Add a subtle border to the knob
        p.noStroke();
        p.rectMode(p.CENTER);
        p.rect(this.x, knobY, this.knobWidth, this.knobHeight, 2); // Slightly rounded corners
        p.rectMode(p.CORNER);
        
        // Display current value below slider
        p.fill(this.textColor);
        p.noStroke();
        p.textAlign(p.CENTER, p.TOP);
        p.textSize(12);
        p.text(
            Math.round(this.value), 
            this.x, 
            this.y + this.height + 5
        );
        
        p.pop();
    }
    
    mousePressed() {
        if (!this.visible) return false;
        
        // Calculate knob position based on value
        const valueRange = this.maxValue - this.minValue;
        const knobY = this.y + (this.height - this.knobHeight) * (1 - (this.value - this.minValue) / valueRange);
        
        // Check if clicked on knob (with slightly larger hit area)
        if (this.p.mouseX >= this.x - this.knobWidth*1.2 && 
            this.p.mouseX <= this.x + this.knobWidth*1.2 && 
            this.p.mouseY >= knobY - this.knobHeight*1.5 && 
            this.p.mouseY <= knobY + this.knobHeight*1.5) {
            this.isDragging = true;
            return true;
        }
        
        // Check if clicked on track
        if (this.p.mouseX >= this.x - this.trackWidth*2.5 && // Increased hit area for thin track
            this.p.mouseX <= this.x + this.trackWidth*2.5 && 
            this.p.mouseY >= this.y && 
            this.p.mouseY <= this.y + this.height) {
            
            // Jump knob to click position
            const clickY = this.p.mouseY;
            const proportion = 1 - (clickY - this.y) / this.height;
            this.value = this.minValue + proportion * valueRange;
            
            // Clamp value to valid range
            this.value = this.p.constrain(this.value, this.minValue, this.maxValue);
            
            // Notify of change
            if (typeof this.onChange === 'function') {
                this.onChange(this.value);
            }
            
            this.isDragging = true;
            return true;
        }
        
        return false;
    }
    
    mouseDragged() {
        if (!this.visible || !this.isDragging) return false;
        
        // Update value based on mouse position
        const valueRange = this.maxValue - this.minValue;
        const proportion = 1 - (this.p.mouseY - this.y) / this.height;
        this.value = this.minValue + proportion * valueRange;
        
        // Clamp value to valid range
        this.value = this.p.constrain(this.value, this.minValue, this.maxValue);
        
        // Notify of change
        if (typeof this.onChange === 'function') {
            this.onChange(this.value);
        }
        
        return true;
    }
    
    mouseReleased() {
        if (this.isDragging) {
            this.isDragging = false;
            return true;
        }
        return false;
    }
    
    show() {
        this.visible = true;
    }
    
    hide() {
        this.visible = false;
        this.isDragging = false;
    }
    
    toggle() {
        this.visible = !this.visible;
        if (!this.visible) {
            this.isDragging = false;
        }
    }
    
    setValue(newValue) {
        this.value = this.p.constrain(newValue, this.minValue, this.maxValue);
    }
    
    getValue() {
        return this.value;
    }
    
    updatePosition(x, y) {
        this.x = x;
        this.y = y;
    }
}

export default RangeSlider;