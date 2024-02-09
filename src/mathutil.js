export class MathUtil {
	static rLerp (a, b, w){
		let CS = (1-w)*Math.cos(a) + w*Math.cos(b);
		let SN = (1-w)*Math.sin(a) + w*Math.sin(b);
		return Math.atan2(SN,CS);
	}

	static lerp(a, b, alpha) {
		return a + alpha * (b - a);
	}

	static distance(x1, y1, x2, y2) {
		return Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2));
	}
}