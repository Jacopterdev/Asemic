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
        const startCharCode = 65; // ASCII code for 'A'

        // Populate dictionary with letters A-Z mapped to {x, y}
        for (let i = 0; i < 26; i++) {
            const letter = String.fromCharCode(startCharCode + i);
            this.#dictionary[letter] = { x: i, y: i };
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
}

// Exporting the singleton instance
const shapeDictionary = new ShapeDictionary();
export default shapeDictionary;