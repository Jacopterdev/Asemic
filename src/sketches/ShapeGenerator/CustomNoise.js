class CustomNoise {
    constructor(p) {
        this.p = p;
        this.noisePadding = 0;
    }

    //Private function, use noiseMap()
    #adjustedPerlin(x,y) {
        let n = this.p.noise(x + this.noisePadding,y + this.noisePadding);
        let m = (n + 0.033) * 100;
        let spread = this.p.map(m, 30, 70, 0, 100);

        if (spread > 100) spread -= 100;
        if (spread < 0) spread += 100;

        const finalNoise = spread / 100;

        //console.log("Noise generated with offset: ", this.noisePadding, "Final noise: ", finalNoise);
        this.noisePadding++;

        return finalNoise;
    }

    noiseMap(noisePos, min, max) {
        const x = noisePos.x; const y = noisePos.y;
        const normalizedNoise = this.#adjustedPerlin(x, y);

        // Map noise value from [0, 1] to [min, max]
        const mappedNoise = this.p.map(normalizedNoise, 0, 1, min, max);

        return mappedNoise;
    }


    resetNoise() {
        this.noisePadding = 0;
    }
}
export default CustomNoise;