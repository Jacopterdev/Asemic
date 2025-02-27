class CustomNoise {
    constructor(p) {
        this.p = p;
        this.noisePadding = 0;
    }

    adjustedPerlin(x,y) {
        let n = this.p.noise(x,y);
        let m = (n + 0.033) * 100;
        let spread = this.p.map(m, 30, 70, 0, 100);

        if (spread > 100) spread -= 100;
        if (spread < 0) spread += 100;

        const finalNoise = spread / 100;

        console.log("Noise generated with offset: ", this.noisePadding, "Final noise: ", finalNoise);
        this.noisePadding++;

        return finalNoise;
    }

    resetNoise() {
        this.noisePadding = 0;
    }
}
export default CustomNoise;