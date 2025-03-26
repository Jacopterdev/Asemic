// Singleton implementation of History
let instance = null;

class History {
    constructor(maxHistorySize = 50) {
        // If an instance already exists, return it
        if (instance) {
            return instance;
        }
        
        // Otherwise, create the singleton instance
        this.stack = [];
        this.currentIndex = -1;
        this.maxHistorySize = maxHistorySize;
        this.lastParamChange = null;
        
        // Store the instance
        instance = this;
        
        console.log("History singleton initialized");
    }
    
    // Reset the singleton (useful for testing or when you want a fresh history)
    static resetInstance() {
        instance = null;
    }
    
    /**
     * Add a new state to the history stack
     * @param {Object} state - The state to add to the history
     * @param {String} changedParam - The name of the parameter that was changed (optional)
     */
    pushState(state, changedParam = null) {
        try {
            // Record what parameter changed in this state
            this.lastParamChange = changedParam;
            
            // If we're not at the end of the stack, remove future states
            if (this.currentIndex < this.stack.length - 1) {
                this.stack = this.stack.slice(0, this.currentIndex + 1);
            }
            
            // Add a deep copy of the state with metadata about what changed
            const stateCopy = JSON.parse(JSON.stringify(state));
            
            // Add metadata about what changed in this state
            stateCopy.metadata = {
                timestamp: Date.now(),
                changedParam: changedParam,
                changeType: changedParam ? 'parameter' : 'structure' // Either a parameter change or a structure change
            };
            
            this.stack.push(stateCopy);
            this.currentIndex++;
            
            // Limit history stack size
            if (this.stack.length > this.maxHistorySize) {
                this.stack.shift();
                this.currentIndex--;
            }
            
            console.log(`History: Added state ${this.currentIndex}/${this.stack.length - 1}${changedParam ? ` (parameter: ${changedParam})` : ' (structure)'}`);
        } catch (error) {
            console.error("Error adding state to history:", error);
        }

        console.log(this.currentIndex, "index");
    }

    // Helper method to check if a state is significantly different from the last recorded state
    isDifferentFromLastState(newState) {
        if (this.stack.length === 0) return true;
        
        const lastState = this.stack[this.currentIndex];
        
        // Compare number of points
        if (lastState.points.length !== newState.points.length) return true;
        
        // Compare number of lines
        if (lastState.lines.length !== newState.lines.length) return true;
        
        // If point or line counts are the same, do a deeper comparison
        // For simplicity, we only check if any point coordinates changed
        for (let i = 0; i < newState.points.length; i++) {
            const newPoint = newState.points[i];
            const lastPoint = lastState.points[i];
            
            if (newPoint.x !== lastPoint.x || newPoint.y !== lastPoint.y) {
                return true;
            }
        }
        
        // Check if any line connections changed
        for (let i = 0; i < newState.lines.length; i++) {
            const newLine = newState.lines[i];
            const lastLine = lastState.lines[i];
            
            if (newLine.startId !== lastLine.startId || 
                newLine.endId !== lastLine.endId ||
                newLine.selected !== lastLine.selected) {
                return true;
            }
        }
        
        // Check if any parameters changed
        const newParamKeys = Object.keys(newState.params);
        const lastParamKeys = Object.keys(lastState.params);

        // Check for added or removed numeric keys (subshapes)
        const newNumericKeys = newParamKeys.filter(key => !isNaN(parseInt(key)));
        const lastNumericKeys = lastParamKeys.filter(key => !isNaN(parseInt(key)));

        // Log for debugging
        console.log("Numeric keys (subshapes) in new state:", newNumericKeys);
        console.log("Numeric keys (subshapes) in last state:", lastNumericKeys);

        // If the number of numeric keys changed, a subshape was added or removed
        if (newNumericKeys.length !== lastNumericKeys.length) {
            console.log("Subshape count changed, detecting difference in history");
            return true;
        }

        // Check numeric keys first (subshapes)
        for (const key of newNumericKeys) {
            if (!lastState.params[key] || 
                JSON.stringify(newState.params[key]) !== JSON.stringify(lastState.params[key])) {
                console.log(`Subshape ${key} changed or is new`);
                return true;
            }
        }

        // Check regular parameters
        for (const key of newParamKeys) {
            // Skip numeric keys as we already checked them
            if (!isNaN(parseInt(key))) continue;
            
            if (JSON.stringify(newState.params[key]) !== JSON.stringify(lastState.params[key])) {
                console.log(`Parameter ${key} changed`);
                return true;
            }
        }
        
        // If we got here, the states are essentially the same
        return false;
    }
    
    /**
     * Undo the last change
     * @returns {Object|null} The previous state, or null if no previous state
     */
    undo() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            const prevState = this.stack[this.currentIndex];
            console.log(`History: Undoing to state ${this.currentIndex}/${this.stack.length - 1}`);
            
            // Log what kind of change is being undone
            if (prevState.metadata?.changedParam) {
                console.log(`Undoing parameter change: ${prevState.metadata.changedParam}`);
            } else {
                console.log(`Undoing structure change (points/lines)`);
            }
            
            return JSON.parse(JSON.stringify(prevState));
        }
        console.log("History: Cannot undo, at earliest state");
        return null;
    }
    
    redo() {
        if (this.currentIndex < this.stack.length - 1) {
            this.currentIndex++;
            return JSON.parse(JSON.stringify(this.stack[this.currentIndex]));
        }
        return null;
    }
    
    canUndo() {
        console.log(this.currentIndex, "index af undo");
        return this.currentIndex > 0;
    }
    
    canRedo() {
        return this.currentIndex < this.stack.length - 1;
    }
    
    clear() {
        this.stack = [];
        this.currentIndex = -1;
    }
}

export default History;