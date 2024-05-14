import { ServerClient } from './src/client.js';
import { MathUtil } from './src/mathutil.js';
import { WindowManager, Window } from './src/wm.js';
import { Planet } from './src/planets.js';
import { Player } from './src/player.js';

// Time inbetween server calls
const SERVER_PING_TIME = 0.1;
const SERVER_LOOP_PING = 5000;

const SECTORSIZE = 10000;

// Player and players
let player = new Player(0, 0);
let client = null;
let players = Array();
let serverPlayers = Array();

const solarSystems = new Array(
    /*new Planet("Star 00-AA", 50, "resources/Sun.svg", {x: 0, y: 0}, new Array(
        new Planet("Surpulo", 18, "resources/World3.svg", {x: 0, y: 100}, new Array(
            new Planet("Teralus", 4, "resources/Moon.svg", {x: 0, y: 18}),
            new Planet("Syle", 2, "resources/Moon.svg", {x: 0, y: 26})
        ))
    ))*/
);

// Get canvas and canvas ctx
let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

// Get other relevant document items
let background = document.getElementById("space");
let serverScreen = document.getElementById("connect");

let sector = {x:0,y:0};

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let width = canvas.width;
let height = canvas.height;
let scale = 1;

// Init window manager
const windowManager = new WindowManager();

const address = "wss://57c4516d-5b60-4b78-9fec-70283c0405f0-00-1z1geo8e7bi4n.janeway.replit.dev";

const keyDown = Array();

let ship = GetImage("resources/Ship.svg");

let deltaTime;

function GetImage(src) {
    let img = new Image();
    img.src = src;
    return(img);
}

function drawImageRot(image, x, y, w, h, rotation) {
    ctx.translate(width / 2 + x, height / 2 + y);
    ctx.rotate(rotation);
    ctx.drawImage(image, -w/2, -h/2, w, h);
    ctx.rotate(-rotation);
    ctx.translate(-(width / 2 + x), -(height / 2 + y));
}

function update(deltaTime) {
    // Update world space mouse
    player.mouse = {
        x: (player.absMouse.x - width / 2) / scale + player.x,
        y: (player.absMouse.y - height / 2) / scale + player.y,
    };
    
    // Apply sizing
    const size = 40 + (player.zoom * 10);
    background.style.backgroundSize = String(size) + "vh";
    background.style.backgroundPositionX = String(width / 2 - player.x * size / 1000) + "px";
    background.style.backgroundPositionY = String(height / 2 - player.y * size / 1000) + "px";

    // Update celestial bodies
    for(let i = 0; i < solarSystems.length; i++) {
        solarSystems[i].mouseDown = mouseDownId != -1;
        solarSystems[i].update(ctx, scale, deltaTime);
    }

    // Update windows
    windowManager.windows.forEach((window) => {
        if(window.embed != null && window.embed.contentWindow.update != null) {
            window.embed.contentWindow.update(player, serverPlayers, solarSystems);
        }
    });

    // Update other players
    for(let i = 0; i < players.length; i++) {
        players[i].rotation = MathUtil.rLerp(players[i].rotation, serverPlayers[i].rotation, pingTime * 10);
        players[i].x += players[i].xv * deltaTime;
        players[i].y += players[i].yv * deltaTime;
        players[i].x = MathUtil.lerp(players[i].x, serverPlayers[i].x, 0.1);
        players[i].y = MathUtil.lerp(players[i].y, serverPlayers[i].y, 0.1);
    }

    // Check if a new sector is reached
    if( sector.x != Math.round(player.x / SECTORSIZE) || 
        sector.y != Math.round(player.y / SECTORSIZE)) 
    {
        console.log("REQUEST" + sector);
        sector = {
            x: Math.round(player.x / SECTORSIZE),
            y: Math.round(player.y / SECTORSIZE)
        }

        // Request new solar system
        client.Send(JSON.stringify({"name": "sector", "data": sector}));
    }
}

function renderSystem(orbitalSystem, parent) {
    for(let i = 0; i < orbitalSystem.length; i++) {
        orbitalSystem[i].render(ctx, scale, player, parent);

        // Render sub-system
        renderSystem(orbitalSystem[i].orbiters, orbitalSystem[i]);
    }
}

function render() {
    // Get screen width and height
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    width = canvas.width;
    height = canvas.height;

    // Calculate rendering scale
    scale = player.zoom * height / 100;

    // Clear screen for rendering
    ctx.clearRect(0, 0, width, height);

    // Render celestial bodies
    renderSystem(solarSystems);

    // Draw player
    drawImageRot(ship, 0, 0, scale, scale, player.rotation);

    // Render other players
    for(let i = 0; i < players.length; i++) {
        let p = players[i];
        if(p.you) continue;
        drawImageRot(ship, (p.x - player.x) * scale, (p.y - player.y) * scale, scale, scale, p.rotation);
    }
}

let lastRender = 0;	// Time of last render
let pingTime = 0;   // Time since last server exchange

// If server failure has occured
let failed = false;

function loop(timestamp) {
    deltaTime = (timestamp - lastRender) / 1000;

    // Stop looping if failed
    if(failed) return;

    // Don't run updates if still connecting
    if(client.socket.readyState !== WebSocket.OPEN) {
        // Just wait if busy connecting
        if(client.socket.readyState === WebSocket.CONNECTING || client.active) {
            window.requestAnimationFrame(loop);
            return;
        }

        serverScreen.style.display = "block";
        serverScreen.innerHTML = 
            "<h1>Connection failed</h1><h2>Reconnecting...</h2>";
        client = new ServerClient(address, OnServerConnect, OnServerRecieve, OnServerError, OnServerFail);
        window.requestAnimationFrame(loop);
        return;
    }

    // Queue update and render
    update(deltaTime);
    render();

    // Change player speed if ctrl down
    if(keyDown['Control']) {
        player.speed = 3000;
    }
    else player.speed = 300;

    // Check if movement
    if(keyDown['w']) player.velocity.y -= player.speed * deltaTime;
    if(keyDown['s']) player.velocity.y += player.speed * deltaTime;
    if(keyDown['a']) player.velocity.x -= player.speed * deltaTime;
    if(keyDown['d']) player.velocity.x += player.speed * deltaTime;

    // Update player
    player.update(deltaTime, mouseDownId != -1);

    // Run server exchange every .1 seconds
    pingTime += deltaTime;
    if(pingTime > SERVER_PING_TIME) {
        // Send over own player data
        client.Send(JSON.stringify({"name": "player", "data": player}));
        pingTime = 0;
    }

    // Update last render
    lastRender = timestamp;

    // Queue next frame
    window.requestAnimationFrame(loop);
}

// Server recieve callback
function OnServerRecieve(event) {
    // Log non-json logic
    if(event.data[0] !== '{') {
        console.log("[Server]->(" + typeof(event.data) + ") : " + event.data);
        return;
    }

    // Convert json to object
    let packet = JSON.parse(event.data);
    if(!packet.hasOwnProperty("name")) return;
    if(!packet.hasOwnProperty("data")) return;

    // Handle errors
    if(packet.name == "error") {
        serverScreen.style.display = "block";
        serverScreen.innerHTML = "<h1>Server error</h1><h2>" + packet.data + "</h2>";
        failed = true;
        return;
    }

    // Handle purchase packet
    if(packet.name == "purchase") {
        console.log(packet.data);

        // Update solar systems
        ServerLoop();
        return;
    }
    // Handle playerdata packet
    if(packet.name == "players") {
        serverPlayers = packet.data;
        if(players.length != serverPlayers.length) players = serverPlayers; 

        // Copy initial velocity and nudge toward real xy
        for(let i = 0; i < serverPlayers.length; ++i) {
            if(serverPlayers[i].you) {
                player.money = serverPlayers[i].money;
                player.resources = serverPlayers[i].resources;
                document.getElementById("money").innerHTML = "$" + player.money;
            }
            players[i].xv = serverPlayers[i].xv;
            players[i].yv = serverPlayers[i].yv;
        }
    }
    // Handle solar system packet
    if(packet.name == "solar") {
        if(solarSystems.length > 1) solarSystems.splice(0, 1);

        // Construct star
        const star = new Planet(packet.data);
        
        // If system already exists, overwrite it
        for(let i = 0; i < solarSystems.length; i++) {
            if(solarSystems[i].name == packet.data.name) {
                // Apply only changeable data
                function apply(planetA, planetB) {
                    planetA.owner = planetB.owner;
                    planetA.cost = planetB.cost;
                    planetA.production = planetB.production;

                    // Do for children
                    for(let i = 0; i < planetA.orbiters.length; i++) {
                        apply(planetA.orbiters[i], planetB.orbiters[i]);
                    }
                }
                apply(solarSystems[i], star);
                return;
            }
        }

        // Add star
        solarSystems.push(star);
    }
}

// Server succesfully connected
function OnServerConnect(event) {
    // Send inital solar request
    client.Send(JSON.stringify({"name": "sector", "data": {x:0, y:0}}));

    // Remove connecting screen
    serverScreen.style.display = "none";
}

// Server error callback
function OnServerError(event) {
    // Display retry screen
    serverScreen.innerHTML = 
        "<h1>Retrying connection...</h1><h2>attempt " + 
        String(client.attempts) + "</h2>";
} 

// Server failure callback
function OnServerFail() {
    console.log("Connection failed.");
    serverScreen.innerHTML = "<h1>Connection failed</h1><h2>try again later</h2>";
    failed = true;
}

// Add event listeners
document.addEventListener('keydown', (event) => {keyDown[event.key] = true;}, false);
document.addEventListener('keyup', (event) => {keyDown[event.key] = false;}, false);
addEventListener("wheel", (event) => {
    player.zoomVelocity -= event.deltaY * deltaTime / 500;
});

function MouseMoveEvent(event) {
    player.absMouse.x = event.clientX;
    player.absMouse.y = event.clientY;
}

// ID used for while mouse down
let mouseDownId = -1;

// Event runs every .1 second while mouse is down
function WhileMouseDown() {}

function OnMouseUp(event) {
    // Remove while mouse down event
    if(mouseDownId != -1) {
        clearInterval(mouseDownId);
        mouseDownId=-1;
    }
}

// Process click event for a planetery system
function ClickEventSystem(event, system) {
    // Find selected body
    for(let i = 0; i < system.length; i++) {
        if(system[i].selected) {
            windowManager.AddWindow(Window.FromPage(
                "./pages/planet.html?" + system[i].GetPageParam(),
                (content) => {
                    // Add update loop
                    content.setInterval(() => {
                        // Update ownership and production
                        content.document.getElementById("planet-owner")
                            .innerHTML = system[i].owner;
                    }, 500);
                    
                    // Bind purchase button
                    let button = content.document.getElementById("planet-buy");
                    button.addEventListener("click", () => {
                        client.Send(
                            JSON.stringify(
                                {"name": "buyPlanet", "data": system[i].id}
                            )
                        );
                    });
                }              
            ));
            return true;
        }

        // Process sub system
        if(ClickEventSystem(event, system[i].orbiters)) return true;
    }
    return false;
}

function OnMouseDown(event) {
    // Handle while mouse down logic
    if(mouseDownId == -1)
        mouseDownId = setInterval(WhileMouseDown, 100);

    // Do solar system click event
    if(ClickEventSystem(event, solarSystems)) return;
}

// Mouse event listeners
canvas.onmousemove = MouseMoveEvent;
canvas.addEventListener("mousedown", OnMouseDown);
canvas.addEventListener("mouseup", OnMouseUp);
canvas.addEventListener("mouseout", OnMouseUp);

// Mobile device event listeners
canvas.addEventListener("touchstart", (event) => {
    event.preventDefault();
    if(event.touches.length > 1) return;
    MouseMoveEvent({clientX: event.touches[0].pageX, clientY: event.touches[0].pageY});
    OnMouseDown(event);
});
canvas.addEventListener("touchend", OnMouseUp);
canvas.addEventListener("touchcancel", OnMouseUp);
canvas.addEventListener("touchmove", (event) => {
    if(event.touches.length > 1) return;
    MouseMoveEvent({clientX: event.touches[0].pageX, clientY: event.touches[0].pageY});
});

function ServerLoop() {
    // Reload all solar systems
    const coords = new Array();
    for(let i = 0; i < solarSystems.length; i++) {
        coords.push({
            x: Math.round(solarSystems[i].position.x / SECTORSIZE),
            y: Math.round(solarSystems[i].position.y / SECTORSIZE)
        });
    }

    // Request sectors
    for(let i = 0; i < coords.length; i++) {
        client.Send(JSON.stringify({"name": "sector", "data": coords[i]}));
    }
}

// Main entrypoint
window.onload = function() {
    // Connect to server
    console.log("Connecting to server " + address);
    client = new ServerClient(
        address, 
        OnServerConnect, 
        OnServerRecieve, 
        OnServerError, 
        OnServerFail
    );

    // Start ping loop
    window.setInterval(ServerLoop, SERVER_LOOP_PING);

    windowManager.AddWindow(Window.FromPage("./pages/manage.html?planet=AA00-Tepelucus"));
    
    // Start loop
    window.requestAnimationFrame(loop);
}