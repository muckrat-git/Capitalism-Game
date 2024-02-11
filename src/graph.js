// Super simple pure javascript graph generator
export class Graph {
    // Generate a graph from a json string
    constructor(json) {
        // Get object from json
        let data = JSON.parse(json);

        // Ensure data is valid
        if(data.x == null || data.y == null) {
            console.error("Invalid json for graph, json must have x and y keys.");
            return;
        }

        // Store data
        this.x = data.x;
        this.y = data.y;

        // Calculate ranges
        this.xMin = Math.min(...this.x);
        this.xMax = Math.max(...this.x);
        this.yMin = Math.min(...this.y);
        this.yMax = Math.max(...this.y);
    }

    // Draw graph to canvas
    Draw(canvas) {
        // Get canvas context
        let ctx = canvas.getContext("2d");

        // Clear canvas with white
        ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Set line width
        ctx.lineWidth = 1;

        // Get margin
        const margin = canvas.width / 30;

        // Calculate width and height
        const width = canvas.width - margin * 2;
        const height = canvas.height - margin * 2;

        // Calculate scale per x and y
        const xScale = (width / (this.xMax - this.xMin));
        const yScale = (height / (this.yMax - this.yMin));

        // Draw graph
        for(let i = 0; i < this.x.length; i++) {
            // Draw vertical marker line
            ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
            ctx.beginPath();
            ctx.moveTo(Math.round(i*xScale + margin), margin);
            ctx.lineTo(Math.round(i*xScale + margin), height + margin);
            ctx.stroke();

            // Skip if on last index
            if(i == this.x.length - 1) break;

            // The original position of the point
            const a = {x:this.x[i], y:this.y[i]};
            // The original position of the next point
            const b = {x:this.x[i+1], y:this.y[i+1]};

            // Calculate real positions
            const realA = {
                x: a.x * xScale + margin,
                y: height - (a.y * yScale) + margin
            };
            const realB = {
                x: b.x * xScale + margin,
                y: height - (b.y * yScale) + margin
            };

            // Detirmine line color (green for up red for down)
            if(a.y > b.y)
                ctx.strokeStyle = "rgba(255, 0, 0, 1)";
            else
                ctx.strokeStyle = "rgba(0, 255, 0, 1)";

            // Draw line
            ctx.beginPath();
            ctx.moveTo(realA.x, realA.y);
            ctx.lineTo(realB.x, realB.y);
            ctx.stroke();
        }
    }
}