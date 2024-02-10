export class Window {
    Resize(width, height) {
        if(height < this.titlebar.offsetHeight * 2) {
            height = this.titlebar.offsetHeight;
            if(!this.rolled) {
                this.resize.style.width = "5px";
                this.resize.style.height = this.titlebar.offsetHeight + "px";
                this.resize.src = "resources/resize-vert.png";
                this.controls.style.padding = "0 10px";
                this.rolled = true;
            }
        }
        else if(this.rolled) {
            this.rolled = false;
            this.resize.style.width = "15px";
            this.resize.style.height = "15px";
            this.controls.style.padding = "0 5px";
            this.resize.src = "resources/resize.png";
        }
        
        this.width = Math.max(width, this.minWidth);
        this.height = Math.max(height, this.titlebar.offsetHeight);
        if(this.width + this.x > window.innerWidth) this.width = window.innerWidth - this.x;
        if(this.height + this.y > window.innerHeight) this.height = window.innerHeight - this.y;

        // Resize element
        this.element.style.width = this.width + "px";
        this.titlebar.style.width = this.width + "px";
        this.element.style.height = this.height + "px";
    }

    Move(x, y) {
        // Set and clamp x,y
        this.x = Math.max(0, Math.min(x, window.innerWidth - this.width));
        this.y = Math.max(0, Math.min(y, window.innerHeight - this.height));

        // Move element
        this.element.style.left = this.x + "px";
        this.element.style.top = this.y + "px";
    }

    ToggleRolled() {
        // Toggle rolled
        if(this.rolled) {
            this.rolled = false;
            this.resize.style.width = "15px";
            this.resize.style.height = "15px";
            this.controls.style.padding = "0 5px";
            this.resize.src = "resources/resize.png";
            this.height = this.minHeight;
            this.element.style.height = this.height + "px";
        }
        else {
            this.resize.style.width = "5px";
            this.resize.style.height = this.titlebar.offsetHeight + "px";
            this.resize.src = "resources/resize-vert.png";
            this.controls.style.padding = "0 10px";
            this.rolled = true;
            this.height = this.titlebar.offsetHeight;
            this.element.style.height = this.height + "px";
        }
    }
    
    constructor(element) {
        this.dragging = false;
        this.resizing = false;
        this.element = element;

        // If the window is rolled
        this.rolled = false;

        // Get sub elements
        this.titlebar = this.element.querySelector(".title-bar");
        this.resize = this.element.querySelector(".resize");
        this.controls = this.element.querySelector(".controls");

        // Get inner content
        this.content = this.element.querySelector(".content");
        
        // Check if content is an embed
        if(this.content.tagName == "IFRAME") {
            this.embed = this.content;
        }

        // Initial sizing
        let initialSize = {x:0, y:0};
        this.minWidth = 200;
        this.minHeight = this.titlebar.offsetHeight;
        initialSize.x = this.minWidth;
        initialSize.y = 300;

        // Initial sizing
        this.Resize(initialSize.x, initialSize.y);
        this.Move(30, 30);

        // Add control logic
        this.controls.children[0].addEventListener("click", () => {
            this.ToggleRolled();
        });
        this.controls.children[1].addEventListener("click", () => {
            this.element.remove();
        });

        // Do title bar grab logic
        this.titlebar.addEventListener("mousedown", (event) => {
            if(this.controls.matches(':hover')) return;
            
            // Set cursor to grab
            document.documentElement.style.cursor = "grabbing";
            document.documentElement.style.userSelect = "none";

            // Set dragging information
            this.dragging = true;
            this.dragX = event.clientX - this.x;
            this.dragY = event.clientY - this.y;
        });
        document.addEventListener("mouseup", (event) => {
            document.documentElement.style.cursor = "default";
            document.documentElement.style.userSelect = "auto";
            this.dragging = false;
        });

        // Resizing logic
        this.resize.addEventListener("mousedown", (event) => {
            this.resizing = true;
            document.documentElement.style.userSelect = "none";
            this.dragX = event.clientX - this.width;
            this.dragY = event.clientY - this.height;
        });
        document.addEventListener("mouseup", (event) => {
            this.resizing = false;
            document.documentElement.style.userSelect = "auto";
        });

        // Mouse movement logic
        let mousemove = (event, offset) => {
            if(offset == null) offset = {x:0, y:0};
            if(this.dragging) {
                this.Move(event.x - this.dragX + offset.x, event.y - this.dragY + offset.y);
            }
            if(this.resizing) {
                this.Resize(event.x - this.dragX + offset.x, event.y - this.dragY + offset.y);
            }
        };
        document.addEventListener("mousemove", mousemove);

        // Set min bounds
        if(this.embed != null) {
            this.embed.addEventListener("load", (event) => {
                // Add mouse move event listener
                this.embed.contentWindow.onmousemove = (event) => {
                    mousemove(
                        event, 
                        {
                            x:this.embed.getBoundingClientRect().left, 
                            y:this.embed.getBoundingClientRect().top
                        }
                    );
                }
                
                let initialSize = {x:this.width, y:this.height};

                // Get embed meta data
                let metaTags = this.embed.contentWindow.document.querySelectorAll("meta");

                // Find viewport
                for(let i = 0; i < metaTags.length; i++) {
                    if(metaTags[i].getAttribute("name") == "window") {
                        this.minWidth = parseInt(metaTags[i].getAttribute("minw"));
                        this.minHeight = parseInt(metaTags[i].getAttribute("minh"));
                        initialSize.x = parseInt(metaTags[i].getAttribute("width"));
                        initialSize.y = parseInt(metaTags[i].getAttribute("height"));
                    }
                }

                this.Resize(initialSize.x, initialSize.y);
            });
        }
    }
}

export class WindowManager {
    constructor() {
        this.windows = new Array();
        
        // Get window elements
        document.querySelectorAll(".window").forEach((element) => {
            this.windows.push(new Window(element));
        });
    }
};