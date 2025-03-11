class PossibleLinesRenderer {
    constructor(p, lineColor = [250, 140, 0, 196], disabledLineColor = [220, 220, 220, 0], 
                hoveredLineColor = [255, 140, 0, 255]) { // Brighter orange for hover
        this.p = p; 
        this.lineColor = this.p.color(...lineColor);
        // Make deselected lines fully transparent (invisible)
        this.disabledLineColor = this.p.color(...disabledLineColor); 
        this.hoveredLineColor = this.p.color(...hoveredLineColor);
        this.strokeWeight = 1; // Base stroke weight for selected lines
        this.disabledStrokeWeight = 6; // Thick stroke for non-selected lines
        this.hoveredStrokeWeight = 6; // Thick stroke for hovered lines
        this.minStrokeWeight = 0; // Minimum stroke weight (invisible)
        
        // Animation variables
        this.hoverAnimationDuration = 6; // Frames for animation
        this.currentHoveredLine = null;
        this.previousHoveredLine = null;
        this.hoverTransition = 0; // 0 to hoverAnimationDuration
        this.hoverFadeIn = false; // True when fading in, false when fading out
        
        // Hover timeout variables
        this.hoverTimeout = 60; // Frames to wait before auto-fading (60 frames ≈ 1 second at 60fps)
        this.hoverTimer = 0; // Current timer count
        this.autoFadeTriggered = false; // Flag to track if auto-fade has been triggered
    }

    /**
     * Draws lines according to selection rules with hover animation
     * @param {Array} lines - All possible lines between points
     * @param {Object} selectedPoint - Not used anymore (kept for backward compatibility)
     * @param {Object} hoveredLine - Currently hovered line (can be null)
     */
    drawLines(lines, selectedPoint, hoveredLine) {
        // Update hover animation state
        this.updateHoverAnimation(hoveredLine);
        
        // Draw all selected lines (always visible)
        lines.forEach((line) => {
            if (line.selected) {
                // Check if this is the hovered line
                const isHovered = hoveredLine && hoveredLine.start.id === line.start.id && 
                                  hoveredLine.end.id === line.end.id;
                
                // Handle hover animation for selected lines
                if (isHovered) {
                    // Calculate animation progress (0 to 1)
                    const animProgress = this.hoverTransition / this.hoverAnimationDuration;
                    
                    // Interpolate stroke weight from normal to hover weight
                    const currentStrokeWeight = this.strokeWeight + 
                        (this.hoveredStrokeWeight - this.strokeWeight) * animProgress;
                    
                    this.p.strokeWeight(currentStrokeWeight);
                    this.p.stroke(this.hoveredLineColor);
                } else {
                    this.p.strokeWeight(this.strokeWeight);
                    this.p.stroke(this.lineColor);
                }
                
                // Draw the line
                this.p.line(line.start.x, line.start.y, line.end.x, line.end.y);
            }
        });
        
        // Draw any hovered unselected line (only visible when hovered)
        if (hoveredLine && !hoveredLine.selected) {
            // Calculate animation progress (0 to 1)
            const animProgress = this.hoverTransition / this.hoverAnimationDuration;
            
            // Animate stroke weight from 0 to hoveredStrokeWeight
            const currentStrokeWeight = this.minStrokeWeight + 
                (this.disabledStrokeWeight - this.minStrokeWeight) * animProgress;
            
            this.p.strokeWeight(currentStrokeWeight);
            
            // Use full hover color (no alpha animation)
            this.p.stroke(this.hoveredLineColor);
            
            // Draw the line
            this.p.line(hoveredLine.start.x, hoveredLine.start.y, hoveredLine.end.x, hoveredLine.end.y);
        }
    }
    
    /**
     * Updates the hover animation state
     */
    updateHoverAnimation(hoveredLine) {
        // Check if the hovered line has changed
        let hoveredLineId = null;
        if (hoveredLine) {
            hoveredLineId = hoveredLine.start.id + "-" + hoveredLine.end.id;
        }
        
        let currentHoveredId = null;
        if (this.currentHoveredLine) {
            currentHoveredId = this.currentHoveredLine.start.id + "-" + this.currentHoveredLine.end.id;
        }
        
        // Start fade-in if hovering a new line
        if (hoveredLineId !== currentHoveredId) {
            if (hoveredLine) {
                // Start fade-in
                this.previousHoveredLine = this.currentHoveredLine;
                this.currentHoveredLine = hoveredLine;
                this.hoverTransition = 0;
                this.hoverFadeIn = true;
                this.hoverTimer = 0; // Reset timer
                this.autoFadeTriggered = false; // Reset auto-fade flag
            } else {
                // Start fade-out
                this.previousHoveredLine = this.currentHoveredLine;
                this.currentHoveredLine = null;
                this.hoverTransition = this.hoverAnimationDuration;
                this.hoverFadeIn = false;
                this.hoverTimer = 0;
                this.autoFadeTriggered = false;
            }
        }
        
        // If we're currently hovering a line and in the full hover state
        if (hoveredLine && this.hoverFadeIn && this.hoverTransition >= this.hoverAnimationDuration) {
            // Increment the hover timer
            this.hoverTimer++;
            
            // If we've hovered long enough and haven't triggered auto-fade yet
            if (this.hoverTimer >= this.hoverTimeout && !this.autoFadeTriggered) {
                // Trigger fade-out
                this.hoverFadeIn = false;
                this.autoFadeTriggered = true;
            }
        }
        
        // Update animation progress
        if (this.hoverFadeIn && this.hoverTransition < this.hoverAnimationDuration) {
            this.hoverTransition++;
        } else if (!this.hoverFadeIn && this.hoverTransition > 0) {
            this.hoverTransition--;
        }
    }
}

export default PossibleLinesRenderer;