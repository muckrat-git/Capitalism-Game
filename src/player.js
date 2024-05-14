import { MathUtil } from './mathutil.js';

export class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.velocity = {x: 0, y: 0};
        this.mouse = {x:0, y:0};
        this.absMouse = {x:0, y:0};
        this.zoom = 0.5;
        this.zoomVelocity = 1;
        this.rotation = 0;
        this.ip = CLIENTID;
        this.speed = 300;
        this.money = 0;
        this.resources = Array();
    }

    update(deltaTime, mouseDown) {
        this.x += this.velocity.x * deltaTime;
        this.y += this.velocity.y * deltaTime;

        this.velocity.x = MathUtil.lerp(this.velocity.x, 0, deltaTime * 5);
        this.velocity.y = MathUtil.lerp(this.velocity.y, 0, deltaTime * 5);

        this.zoom *= this.zoomVelocity;
        this.zoomVelocity = MathUtil.lerp(this.zoomVelocity, 1, deltaTime * 3);

        if(this.zoom < 0.01) this.zoom = 0.01;

        if(mouseDown) {
            this.velocity.x += Math.cos(this.rotation) * this.speed * deltaTime;
            this.velocity.y += Math.sin(this.rotation) * this.speed * deltaTime;

            this.rotation = MathUtil.rLerp(
                this.rotation, 
                Math.atan2(this.mouse.y - this.y, this.mouse.x - this.x), 
                deltaTime * 10
            );
        }
        else {
            this.rotation = MathUtil.rLerp(
                this.rotation, 
                Math.atan2(this.velocity.y, this.velocity.x), 
                deltaTime * 10
            );
        }
    }
};