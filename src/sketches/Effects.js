
class Effects {
    constructor(p, smoothAmount = 0) {
        this.p = p;
        this.smoothAmount = smoothAmount;
        this.isAnimating = false; // Flag for blocking setSmoothAmount during animation

    }

    setSmoothAmount(amount) {
        if (this.isAnimating) return; // Block changes during animation
        this.smoothAmount = amount;
    }


    applyEffects(blurScale = 1){
        this.p.filter(this.p.BLUR, this.smoothAmount * blurScale);
        this.p.filter(this.p.THRESHOLD, 0.5);
    }

    animateSmoothAmount(duration = 400) {
        // Reset the animation if it's already running
        if (this.isAnimating) {
            this.isAnimating = false; // Stop the ongoing animation
        }

        this.isAnimating = true;

        const startAmount = this.smoothAmount + 6;  // Start at the current smoothAmount + 5
        const targetAmount = this.smoothAmount;    // Original smoothAmount to return to
        const startTime = this.p.millis();         // Reset start time for the new animation



        // Animation loop
        const animationLoop = () => {
            if (!this.isAnimating) return; // Exit early if animation was stopped or restarted

            const elapsedTime = this.p.millis() - startTime; // Calculate elapsed time
            const t = Math.min(elapsedTime / duration, 1);   // Normalize elapsed time to the range [0, 1]

            // Use an ease-out cubic interpolation to calculate the value
            const easedValue = targetAmount - (targetAmount - startAmount) * Math.pow(1 - t, 3);

            // Update smoothAmount
            this.smoothAmount = Math.max(0, t >= 1 ? targetAmount : easedValue);

            // Stop animation when complete
            if (t >= 1) {
                this.smoothAmount = targetAmount; // Reset to the exact original value
                this.isAnimating = false;        // Reset the flag to allow further updates
            } else {
                window.requestAnimationFrame(animationLoop); // Continue the animation
            }
        };

        // Start the animation
        window.requestAnimationFrame(animationLoop);
    }




} export default Effects;