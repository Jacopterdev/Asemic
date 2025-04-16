class ShapeDictionary {
    // This static property will hold the singleton instance of ShapeDictionary
    static #instance;

    // Private dictionary to store the mapping
    #dictionary = {};

    // Private constructor to prevent multiple instances
    constructor() {
        if (ShapeDictionary.#instance) {
            return ShapeDictionary.#instance;
        }

        this.#initializeDictionary();
        ShapeDictionary.#instance = this;
    }

    // Method to initialize the dictionary
    #initializeDictionary() {
        let letterCode = 65; // Start with 'A' (ASCII code)
        let suffix = 0; // Start without a suffix

        for (let step = 0; step < 100; step++) { // Example loop to generate a sequence
            let letter;

            // If suffix is 0 (initial state), use only letters A-Z
            if (suffix === 0) {
                letter = String.fromCharCode(letterCode);
            } else {
                // Once we exceed Z, append the number suffix (e.g., A1, B1, etc.)
                letter = String.fromCharCode(letterCode) + suffix;
            }

            this.#dictionary[letter] = { x: step, y: step };
            // Increment letter code
            letterCode++;

            // If we exceed 'Z', wrap around to 'A' and add a suffix
            if (letterCode > 90) {
                letterCode = 65; // Reset to 'A'
                suffix++; // Increment suffix
            }
        }
    }

    // Method to get the dictionary
    getDictionary() {
        return this.#dictionary;
    }

    // Method to get a specific value by letter
    getValue(letter) {
        return this.#dictionary[letter.toUpperCase()];
    }

    // Method to add or update a value in the dictionary
    setValue(letter, x, y) {
        this.#dictionary[letter.toUpperCase()] = { x, y };
    }

    setDictionary(dictionary) {
        this.#dictionary = dictionary;
    }
}

// Exporting the singleton instance
const shapeDictionary = new ShapeDictionary();
export default shapeDictionary;