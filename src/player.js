function lerp(a, b, alpha) {
    return a + alpha * (b - a);
}

function distance(x1, y1, x2, y2) {
    return Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2));
}

export class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.velocity = {x: 0, y: 0};
        this.mouse = {x:0, y:0};
        this.destination = {x:0, y:0, set:false};
        this.zoom = 0.5;
        this.zoomVelocity = 1;
        this.rotation = 0;
    }

    update(deltaTime) {
        this.x += this.velocity.x * deltaTime;
        this.y += this.velocity.y * deltaTime;

        this.velocity.x = lerp(this.velocity.x, 0, deltaTime * 5);
        this.velocity.y = lerp(this.velocity.y, 0, deltaTime * 5);

        this.zoom *= this.zoomVelocity;
        this.zoomVelocity = lerp(this.zoomVelocity, 1, deltaTime * 3);

        if(this.zoom < 0.01) this.zoom = 0.01;

        if(this.destination.set) {
            this.velocity = {x: 0, y: 0};
            this.x = lerp(this.x, this.destination.x, deltaTime * 3);
            this.y = lerp(this.y, this.destination.y, deltaTime * 3);

            this.rotation = Math.atan2(this.destination.y - this.y, this.destination.x - this.x);

            this.zoom = lerp(this.zoom, this.destination.zoom, deltaTime * 2);
        }
        else this.rotation = Math.atan2(this.velocity.y, this.velocity.x);
    }
};