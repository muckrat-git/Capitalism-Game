export class Window {
    Resize(width, height, transition = "none") {
        // Apply window rolling
        if(height < this.titlebar.offsetHeight * 2) {
            height = this.titlebar.offsetHeight;
            if(!this.rolled) {
                this.resize.style.width = "5px";
                this.resize.style.height = this.titlebar.offsetHeight + "px";
                this.resize.src = "resources/resize-vert.png";
                this.rolled = true;
            }
        }
        else if(this.rolled) {
            this.rolled = false;
            this.resize.style.width = "15px";
            this.resize.style.height = "15px";
            this.resize.src = "resources/resize.png";
        }

        // Clamp width and height
        this.width = Math.max(width, this.minWidth);
        this.height = Math.max(height, this.titlebar.offsetHeight);
        if(this.width + this.x > window.innerWidth) this.width = window.innerWidth - this.x;
        if(this.height + this.y > window.innerHeight) this.height = window.innerHeight - this.y;

        // Resize element
        this.element.style.width = this.width + "px";
        this.titlebar.style.width = this.width + "px";
        this.element.style.height = this.height + "px";

        // Remove transition
        this.element.style.transition = transition;
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
            this.resize.src = "resources/resize.png";
            this.height = this.lastHeight;
            this.element.style.height = this.height + "px";

            // Apply transition
            this.element.style.transition = "height 0.2s";
        }
        else {
            this.lastHeight = this.height;
            this.resize.style.width = "5px";
            this.resize.style.height = this.titlebar.offsetHeight + "px";
            this.resize.src = "resources/resize-vert.png";
            this.rolled = true;
            this.height = this.titlebar.offsetHeight;
            this.element.style.height = this.height + "px";

            // Apply transition
            this.element.style.transition = "height 0.2s";
        }
    }

    // Constructs a window from a page url
    static FromPage(url, postLoad) {
        // Create elem and set class
        const elem = document.createElement("div");
        elem.className = "window";

        // Add title bar
        elem.innerHTML = (`
            <div class="title-bar">
                <h1>Loading</h1>
                <div class="controls">
                    <button>🗕</button>
                    <button>🗙</button>
                </div>
            </div>
        `);

        // Create iframe
        const iframe = document.createElement("iframe");
        iframe.src = url;
        iframe.className = "content";

        // Create resize element
        const resize = document.createElement("img");
        resize.className = "resize";
        resize.src = "resources/resize.png";
        resize.draggable = false;

        // Add elements to window
        elem.appendChild(iframe);
        elem.appendChild(resize);

        // Return window
        return new Window(elem, postLoad);
    }

    // Default window constructor
    constructor(element, postLoad) {
        this.onclose = null;
        this.postLoad = postLoad;
        
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
        
        // Initial sizing
        let initialSize = {x:0, y:0};
        this.minWidth = 200;
        this.minHeight = this.titlebar.offsetHeight * 2;
        this.lastHeight = initialSize.y;
        
        // Check if content is an embed
        if(this.content.tagName == "IFRAME") {
            this.embed = this.content;

            // Ensure embed not draggable
            this.embed.draggable = false;

            // Hide element until embed load
            this.element.style.display = "none";
        }
        else {
            initialSize.x = this.minWidth;
            initialSize.y = 300;
        }

        // Initial sizing
        this.Resize(initialSize.x, initialSize.y, "height 0.2s, width 0.2s");
        this.Move(30, 30);

        // Add control logic
        this.controls.children[0].addEventListener("click", () => {
            this.ToggleRolled();
        });
        this.controls.children[1].addEventListener("click", () => {
            if(this.onclose != null) this.onclose();
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

        // Element mousedown event for window ordering
        this.element.addEventListener("mousedown", (event) => {
            // Move to front
            this.element.style.zIndex = "1";
        });

        // Document mousedown event for window ordering
        document.addEventListener("mousedown", (event) => {
            if(this.dragging) return;
            // Send to back
            this.element.style.zIndex = "0";
        });

        // Mouse up logic
        let mouseup = (event) => {
            document.documentElement.style.cursor = "default";
            document.documentElement.style.userSelect = "auto";
            this.dragging = false;
            this.resizing = false;
        };
        document.addEventListener("mouseup", (event) => {
            mouseup(event);
        });

        // Resizing logic
        this.resize.addEventListener("mousedown", (event) => {
            // Do resizing
            this.resizing = true;
            document.documentElement.style.userSelect = "none";
            this.dragX = event.clientX - this.width;
            this.dragY = event.clientY - this.height;
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
                // Run post load if exists
                if(this.postLoad != null) this.postLoad(this.embed.contentWindow);

                // Make element visible
                this.element.style.display = "block";
                
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
                this.embed.contentWindow.addEventListener("mouseup", (event) => {
                    mouseup(event);
                });

                // Get default window size in case meta is not available
                let initialSize = {x:this.width, y:this.height};

                // Get embed meta data
                let metaTags = this.embed.contentWindow.document.querySelectorAll("meta");

                // Set default initial sizing
                initialSize.x = this.minWidth;
                initialSize.y = 300;
                
                // Find custom meta data
                for(let i = 0; i < metaTags.length; i++) {
                    if(metaTags[i].getAttribute("name") == "window") {
                        // Get min bounds data
                        this.minWidth = parseInt(metaTags[i].getAttribute("minw"));
                        this.minHeight = parseInt(metaTags[i].getAttribute("minh"))
                            + this.titlebar.offsetHeight;

                        // Get initial bounds data
                        initialSize.x = parseInt(metaTags[i].getAttribute("width"));
                        initialSize.y = parseInt(metaTags[i].getAttribute("height")) 
                            + this.titlebar.offsetHeight;
                    }
                }

                // Apply sizing
                this.Resize(initialSize.x, initialSize.y, "height 0.2s, width 0.2s");

                // Get page title
                let title = this.embed.contentWindow.document.querySelector("title");
                if(title == null) return;

                // Apply title
                this.titlebar.querySelector("h1").innerText = title.innerText;
            });
        }
    }
}

export class WindowManager {
    // Add windows constructed in javascript
    AddWindow(window) {
        document.body.appendChild(window.element);
        window.onclose = () => {
            this.windows.splice(this.windows.indexOf(window), 1);
        };
        this.windows.push(window);
    }
    
    // Basic window manager constructor
    constructor() {
        this.windows = new Array();
        
        // Get window elements
        document.querySelectorAll(".window").forEach((element) => {
            this.windows.push(new Window(element));
        });
    }
};