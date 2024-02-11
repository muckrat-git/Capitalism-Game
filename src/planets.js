import { MathUtil } from './mathutil.js';

const ORBIT_RATE = 1;

function GetTime() {
	return Date.now() / 1000;
}

export class Planet {
    constructor(name, size, sprite, position, orbiters = new Array()) {
        this.name = name;
        this.position = position;
        this.selected = false;

        // Set location to none unless is star
        this.location = "";
        if(name.includes("Star")) {
            this.location = "System " + name.replace("Star ", "");
        }

		// Orbital data
		this.orbiters = orbiters;
		this.orbit = 0
		this.distance = MathUtil.distance(0, 0, this.position.x, this.position.y);

		// Rendering data
		this.size = size;
        this.sprite = new Image();
        this.sprite.src = sprite;
		this.drawPos = {x:0, y:0};
    }

    render(ctx, scale, player, parent) {
        const hsize = this.size * scale / 2;

        this.drawPos = {
            x: (this.position.x - player.x - (this.size/2)) * scale + (window.innerWidth / 2), 
            y: (this.position.y - player.y - (this.size/2)) * scale + (window.innerHeight / 2)
        };

		// Update selected
        this.selected = MathUtil.distance(
			this.drawPos.x + hsize, 
			this.drawPos.y + hsize, 
			player.mouse.x, 
			player.mouse.y) < hsize;

        if(this.selected) {
			// Check if orbiting
			if(parent != null) {
				// Visualize orbit
				ctx.arc(
					parent.drawPos.x + parent.size * scale / 2, 
					parent.drawPos.y + parent.size * scale / 2, 
					this.distance * scale, 0, 2 * Math.PI, false
				);
				ctx.fillStyle = "rgba(0, 0, 0, 0)";
				ctx.fill();
				ctx.lineWidth = 2;
				ctx.strokeStyle = "rgba(200, 230, 255, 0.25)";
				ctx.stroke();
			}
			
			// Render planet
			ctx.filter = "brightness(110%)";
			ctx.drawImage(
				this.sprite, 
				this.drawPos.x, this.drawPos.y, 
				this.size * scale, this.size * scale
			);
			ctx.filter = "brightness(100%)";
			return;
		}

		// Not selected, draw normally
		ctx.drawImage(
			this.sprite, 
			this.drawPos.x, this.drawPos.y, 
			this.size * scale, this.size * scale
		);
    }

	update(ctx, scale, deltaTime) {
		this.orbit = GetTime() * ORBIT_RATE * 100;
		for(let i = 0; i < this.orbiters.length; i++) {
			// Find spot in orbit
			let rotation = this.orbit / (this.orbiters[i].distance * this.orbiters[i].distance);
			rotation += i / this.orbiters.length * Math.PI * 2;

			// Set new position
			this.orbiters[i].position = {
				x: this.position.x + (this.orbiters[i].distance * Math.cos(rotation)),
				y: this.position.y + (this.orbiters[i].distance * Math.sin(rotation))
			};

            // Set location
            if(this.orbiters[i].location == "")
                this.orbiters[i].location = this.location;

			// Update sub system
			this.orbiters[i].update(ctx, scale, deltaTime);
		}
	}

    // Get parameters for ./pages/planet.html
    GetPageParam() {
        const planet = this.name;
        const src = this.sprite.src;
        const owner = "dev";
        const type = "N/A";
        const location = this.location;
        const composition = "<dt>Hydrogen</dt><dd>80%</dd><br><dt>Helium</dt><dd>15%</dd><br><dt>Nickel</dt><dd>5%</dd><br>";

        // Assemble and return
        return(
            "planet=" + planet + 
            "&src=" + src +
            "&owner=" + owner + 
            "&type=" + type + 
            "&location=" + location + 
            "&composition=" + composition
        );
    }
}