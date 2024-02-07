function distance(x1, y1, x2, y2) {
    return Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2));
}

export class Planet {
    constructor(size, sprite, position) {
        this.orbiters = new Array();
        this.size = size;
        this.sprite = new Image();
        this.sprite.src = sprite;
        this.position = position;
        this.selected = false;
    }

    render(ctx, scale, player) {
        const hsize = this.size * scale / 2;

        const drawPos = {
            x: (this.position.x - player.x - (this.size/2)) * scale + (window.innerWidth / 2), 
            y: (this.position.y - player.y - (this.size/2)) * scale + (window.innerHeight / 2)
        };

        this.selected = distance(drawPos.x + hsize, drawPos.y + hsize, player.mouse.x, player.mouse.y) < hsize;

        if(this.selected) ctx.filter = "brightness(110%)";
        ctx.drawImage(this.sprite, drawPos.x, drawPos.y, this.size * scale, this.size * scale)
        if(this.selected) ctx.filter = "brightness(100%)";
    }
}