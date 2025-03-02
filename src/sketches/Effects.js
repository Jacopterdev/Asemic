
class Effects {
    constructor(p) {
        this.p = p;
    }

    applyEffects(smoothAmount){
        this.p.filter(this.p.BLUR, smoothAmount);
        this.p.filter(this.p.THRESHOLD, 0.5);
    }
} export default Effects;