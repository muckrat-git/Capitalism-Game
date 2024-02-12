import { MathUtil } from './mathutil.js';

const ORBIT_RATE = 1;

function GetTime() {
	return Date.now() / 1000;
}

export class Planet {
    // Legacy dev constructor
    /*constructor(name, size, sprite, position, orbiters = new Array()) {
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

        this.owner = "";
        this.type = "";
        this.composition = {};
        this.production = {};
    }*/

    constructor(json) {
        this.name = json.name;
        this.position = json.position;
        this.selected = json.selected;

		// Orbital data
        this.location = "Sector " + json.location;
        this.orbit = 0
        this.distance = MathUtil.distance(0, 0, this.position.x, this.position.y);

		// Rendering data
		this.size = json.size;
        this.sprite = new Image();
        this.sprite.src = json.sprite;
		this.drawPos = {x:0, y:0};

        this.owner = json.owner;
        this.type = json.type;
        this.composition = json.composition;
        this.production = json.production;

        // Finally, construct orbiters
        this.orbiters = new Array();
        for(let i = 0; i < json.children.length; i++) {
            this.orbiters.push(new Planet(json.children[i]));
        }
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

        
		// Check if orbiting
		if(parent != null) {
			// Visualize orbit
            ctx.beginPath();
			ctx.arc(
				parent.drawPos.x + parent.size * scale / 2, 
				parent.drawPos.y + parent.size * scale / 2, 
				this.distance * scale, 0, 2 * Math.PI, false
			);
            ctx.lineWidth = 2;
            if(this.selected) {
			    ctx.strokeStyle = "rgba(200, 230, 255, 0.2)";
                ctx.setLineDash([]);
            }
            else {
                ctx.strokeStyle = "rgba(200, 230, 255, 0.1)";
                ctx.setLineDash([scale, scale]);
            }
			ctx.stroke();
		}
        
		if(this.selected) {
            // Apply border circle around planet
            ctx.beginPath();
            let rotation = (GetTime() * 5 / this.size) % (Math.PI * 2);
            ctx.arc(
                this.drawPos.x + hsize, 
                this.drawPos.y + hsize, 
                hsize * 1.1 + scale,
                0 + rotation, 2 * Math.PI + rotation, false
            );
            ctx.lineWidth = 4;
            ctx.strokeStyle = "rgba(160, 230, 255, 0.3)";
            ctx.setLineDash([hsize * 1.1 + scale, hsize * 1.1 + scale])
            ctx.stroke();
            
			// Render planet
			ctx.drawImage(
				this.sprite, 
				this.drawPos.x, this.drawPos.y, 
				this.size * scale, this.size * scale
			);
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
		this.orbit = GetTime() * ORBIT_RATE;
		for(let i = 0; i < this.orbiters.length; i++) {
			// Find spot in orbit
			let rotation = this.orbit / this.orbiters[i].distance + this.orbiters[i].distance;
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
        const owner = this.owner;
        const type = this.type;
        const location = this.location;

        // Convert composition dict into html
        let composition = "";
        for(let i = 0; i < Object.keys(this.composition).length; i++) {
            composition += "<dt>" + Object.keys(this.composition)[i] + "</dt><dd>" +
                Object.values(this.composition)[i] + "%</dd><br>";
        }

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