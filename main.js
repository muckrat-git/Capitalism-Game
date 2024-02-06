import { Planet } from './src/planets.js';
import { Player } from './src/player.js';
import { ServerClient } from './src/client.js';

// Player and players
let player = new Player(0, 0);
let client = null;
let players = Array();
let serverPlayers = Array();

const solarSystems = new Array(
    new Planet(50, "resources/Sun.svg", {x: 0, y: 0})
);

// Get canvas and canvas ctx
let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

// Get other relevant document items
let background = document.getElementById("space");
let serverScreen = document.getElementById("connect");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let width = canvas.width;
let height = canvas.height;

const keyDown = Array();

let ship = GetImage("resources/Ship.svg");

let deltaTime;

function GetImage(src) {
    let img = new Image();
    img.src = src;
    return(img);
}

function rLerp (a, b, w){
    let CS = (1-w)*Math.cos(a) + w*Math.cos(b);
    let SN = (1-w)*Math.sin(a) + w*Math.sin(b);
    return Math.atan2(SN,CS);
}

function lerp(a, b, alpha) {
    return a + alpha * (b - a);
}

function drawImageRot(image, x, y, w, h, rotation) {
    ctx.translate(width / 2 + x, height / 2 + y);
    ctx.rotate(rotation);
    ctx.drawImage(image, -w/2, -h/2, w, h);
    ctx.rotate(-rotation);
    ctx.translate(-width / 2 + x, -height / 2 + y);
}

function update(deltaTime) {
    const size = 40 + (player.zoom * 10);
    background.style.backgroundSize = String(size) + "vh";
    background.style.backgroundPositionX = String(width / 2 - player.x * player.zoom / 3) + "px";
    background.style.backgroundPositionY = String(height / 2 - player.y * player.zoom / 3) + "px";
    
    // Update other players
    for(let i = 0; i < players.length; i++) {
        players[i].rotation = rLerp(players[i].rotation, serverPlayers[i].rotation, pingTime * 10);
        players[i].x += players[i].xv * deltaTime;
        players[i].y += players[i].yv * deltaTime;
    }
}

function render() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    width = canvas.width;
    height = canvas.height;

    const scale = player.zoom * height / 100;

    for(let i = 0; i < solarSystems.length; i++) {
        solarSystems[i].render(ctx, scale, player);
    }

   // drawImageRot(ship, 0, 0, scale, scale, player.rotation);

    // Render other players
    for(let i = 0; i < players.length; i++) {
        const p = players[i];
        drawImageRot(ship, player.x - p.x, player.y - p.y, scale, scale, p.rotation);
    }
}

let lastRender = 0;
let pingTime = 0;   // Time since last server exchange

function loop(timestamp) {
    deltaTime = (timestamp - lastRender) / 1000;

    // Don't run updates if still connecting
    if(client.socket.readyState !== WebSocket.OPEN) return;

    update(deltaTime);
    render();

    // Check if movement
    if(keyDown['w'] || keyDown['a'] || keyDown['s'] || keyDown['d']) {
        player.destination.set = false;

        if(keyDown['w']) player.velocity.y -= 300 * deltaTime / player.zoom;
        if(keyDown['s']) player.velocity.y += 300 * deltaTime / player.zoom;
        if(keyDown['a']) player.velocity.x -= 300 * deltaTime / player.zoom;
        if(keyDown['d']) player.velocity.x += 300 * deltaTime / player.zoom;
    }

    player.update(deltaTime);
    
    pingTime += deltaTime;
    if(pingTime > 0.1) {
        // Send over own player data
        client.Send(JSON.stringify({"name": "player", "data": player}));

        pingTime = 0;
    }
  
    lastRender = timestamp;
    window.requestAnimationFrame(loop);
}

function OnServerRecieve(event) {
    if(event.data[0] !== '{') {
        console.log("[Server]->(" + typeof(event.data) + ") : " + event.data);
        return;
    }

    let packet = JSON.parse(event.data);
    if(!packet.hasOwnProperty("name")) return;
    if(!packet.hasOwnProperty("data")) return;

    serverPlayers = packet.data;
    if(players.length !== serverPlayers.length) players = serverPlayers; 
    
    // Copy initial velocity and nudge toward real xy
    for(let i = 0; i < serverPlayers.length; ++i) {
        players[i].xv = serverPlayers[i].xv;
        players[i].yv = serverPlayers[i].yv;
        players[i].x = lerp(players[i].x, serverPlayers[i].x, 0.1);
        players[i].y = lerp(players[i].y, serverPlayers[i].y, 0.1);
    }
}

function OnServerConnect(event) {
    // Send inital player data
    client.Send(JSON.stringify({"name": "player", "data": player}));

    // Remove connecting screen
    serverScreen.style.display = "none";
}
  
function OnServerError(event) {
    serverScreen.innerHTML = "<h1>Retrying connection...</h1><h2>attempt " + String(client.attempts) + "</h2>";
} 

function OnServerFail() {
    console.log("Connection failed.");
    serverScreen.innerHTML = "<h1>Connection failed</h1><h2>try again later ig</h2>";
}

window.onload = function() {
    // Connect to server
    client = new ServerClient("ws://0.0.0.0:8888", OnServerConnect, OnServerRecieve, OnServerError, OnServerFail);

    // Inital render for connection screen
    render();

    window.requestAnimationFrame(loop);
}

// Add event listeners
document.addEventListener('keydown', (event) => {keyDown[event.key] = true;}, false);
document.addEventListener('keyup', (event) => {keyDown[event.key] = false;}, false);
addEventListener("wheel", (event) => {
    player.zoomVelocity -= event.deltaY * deltaTime / 500;
    player.destination.set = false;
});

function MouseMoveEvent(event) {
    player.mouse = {
        x: event.clientX,
        y: event.clientY
    };
}

document.onmousemove = MouseMoveEvent;
document.addEventListener("click", (event) => {
    // Find selected body
    for(let i = 0; i < solarSystems.length; i++) {
        if(solarSystems[i].selected) {
            player.destination.x = solarSystems[i].position.x;
            player.destination.y = solarSystems[i].position.y;
            player.destination.zoom = solarSystems[i].size / 100;
            player.destination.set = true;
        }
    }
});