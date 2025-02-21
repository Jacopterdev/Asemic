class EphemeralLineAnimator {
    constructor(p, lineManager) {
        this.p = p; // Reference to p5 instance
        this.lineManager = lineManager; // Reference to LineManager
        this.animationProgress = 0; // Track animation progress (0 to 1)
        this.fadeProgress = 0; // Track fade-in/out progress (0 to 1)
        this.tailAnimationProgress = 0; // Track the tail-end animation progress (0 to 1)

        this.startPoint = null; // Start point of the line
        this.endPoint = null; // End point of the line
        this.animating = false; // Whether the animation is currently active
        this.secondAnimationTimer = 0; // Timer to handle second animation delay
        this.fadingIn = true; // Whether the fade-in is occurring
        this.fadingOut = false; // Whether the fade-out is occurring
        this.maxStrokeWeight = 16; // Maximum stroke weight

    }

    /**
     * Picks two random points from the selected lines list.
     * Starts the animation.
     */
    start() {
        const selectedLines = this.lineManager.getSelectedLines();
        console.log(selectedLines);

        if (selectedLines.length < 1) return; // Not enough points to pick from

        // Pick a random line from the list
        const randomIndex = Math.floor(Math.random() * selectedLines.length);
        const randomLine = selectedLines[randomIndex];

        this.startPoint = { ...randomLine.start }; // Copy the starting point
        this.endPoint = { ...randomLine.start }; // Temporarily set the start point at the same position

        this.targetEndPoint = randomLine.end; // Set the predefined end point
        this.animating = true;
        this.fadingIn = true; // Start with a fade-in effect
        this.fadingOut = false; // Reset fade-out effect

        this.animationProgress = 0;
        this.tailAnimationProgress = 0;
        this.fadeProgress = 0;

        this.secondAnimationTimer = 0; // Reset second animation timer

    }

    /**
     * Frame-by-frame update for the animation.
     * Should be called inside the draw loop of the p5 sketch.
     */
    updateAndDraw() {
        if (this.lineManager.getSelectedLines().length >= 1 && !this.animating) this.start();
        if (!this.animating) return;

        const speed = 0.01; // Animation speed
        const fadeSpeed = 0.05; // Speed for fade-in/out effect

        // Fade-In Phase
        if (this.fadingIn) {
            this.fadeProgress += fadeSpeed;

            // Ease-in-out stroke weight during fade-in
            const easedFadeProgress = this.easeInOut(this.fadeProgress);
            const strokeWeight = this.maxStrokeWeight * easedFadeProgress;

            // Draw a static line during fade-in
            this.p.stroke(128); // Line color
            this.p.strokeWeight(strokeWeight);
            this.p.line(this.startPoint.x, this.startPoint.y, this.startPoint.x, this.startPoint.y);

            if (this.fadeProgress >= 1) {
                this.fadingIn = false; // Transition to main animation
                this.fadeProgress = 0;
            }
            return;
        }

        // Line "Head Leap" (Animating endPoint)
        if (!this.fadingOut && this.animationProgress < 1) {
            this.animationProgress += speed;
            const easedProgress = this.easeInOut(this.animationProgress);

            // Animate the line's endPoint from start to target
            this.endPoint.x = this.startPoint.x + (this.targetEndPoint.x - this.startPoint.x) * easedProgress;
            this.endPoint.y = this.startPoint.y + (this.targetEndPoint.y - this.startPoint.y) * easedProgress;

            this.p.stroke(128); // Line color
            this.p.strokeWeight(this.maxStrokeWeight);
            this.p.line(this.startPoint.x, this.startPoint.y, this.endPoint.x, this.endPoint.y);

            // Transition to tail animation when head reaches target
            if (this.animationProgress >= 1) {
                this.tailAnimationProgress = 0; // Reset tail animation progress
            }
            return;
        }

        // Line "Tail Leap" (Animating startPoint)
        if (this.animationProgress >= 1 && this.tailAnimationProgress < 1) {
            this.tailAnimationProgress += speed;
            const easedTailProgress = this.easeInOut(this.tailAnimationProgress);

            // Animate the line's startPoint toward the target endPoint
            this.startPoint.x = this.startPoint.x + (this.targetEndPoint.x - this.startPoint.x) * easedTailProgress;
            this.startPoint.y = this.startPoint.y + (this.targetEndPoint.y - this.startPoint.y) * easedTailProgress;

            this.p.stroke(128); // Line color
            this.p.strokeWeight(this.maxStrokeWeight);
            this.p.line(this.startPoint.x, this.startPoint.y, this.endPoint.x, this.endPoint.y);

            // Transition to fade-out when tail animation completes
            if (this.tailAnimationProgress >= 1) {
                this.fadingOut = true; // Start fade-out
                this.fadeProgress = 0; // Reset fade-out progress
            }
            return;
        }

        // Fade-Out Phase
        if (this.fadingOut) {
            this.fadeProgress += fadeSpeed;

            // Ease-in-out stroke weight during fade-out
            const easedFadeProgress = 1 - this.easeInOut(this.fadeProgress); // Reverse fade
            const strokeWeight = this.maxStrokeWeight * easedFadeProgress;

            this.p.stroke(128); // Line color
            this.p.strokeWeight(strokeWeight);
            this.p.line(this.startPoint.x, this.startPoint.y, this.endPoint.x, this.endPoint.y);

            // End animation after fade-out
            if (this.fadeProgress >= 1) {
                this.animating = false;
                this.fadingOut = false;
            }
        }
    }



    /**
     * Ease-in-out interpolation function for smooth animations.
     * @param {number} t - Progress value (0 to 1).
     * @returns {number} - The eased progress value.
     */
    easeInOut(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }
}
export default EphemeralLineAnimator;