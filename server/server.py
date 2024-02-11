#!/usr/bin/env python

import asyncio
import json
from types import SimpleNamespace
from websockets.server import serve
from typing import List
import os

from player import Player

playerAddress = list()
playerIp = list()
players: List[Player] = list()

# request functions :
class requestFunc:
    async def player(data, id, websocket):
        # Set player data
        players[id].rotation = data.rotation
        players[id].x = data.x
        players[id].y = data.y
        players[id].xv = data.velocity.x
        players[id].yv = data.velocity.y
        playerIp[id] = data.ip

        # Send other players
        playerDict = {"name": "players", "data": list()}
        i = 0
        for item in players:
            item.you = i == id
            playerDict['data'].append(item.__dict__)
            i += 1

        await websocket.send(json.dumps(playerDict))


async def handleMessage(message, websocket):
    id = playerAddress.index(websocket.remote_address)

    if (type(message) != str):
        return

    # Get message object
    obj = json.loads(message, object_hook=lambda d: SimpleNamespace(**d))
    if not (hasattr(obj, "name") or hasattr(obj, "data")):
        return

    # Process obj
    if not hasattr(requestFunc, obj.name):
        print("Warning: Invalid request '" + obj.name + "', object dump:\n" +
              message)
        return

    await getattr(requestFunc, obj.name)(obj.data, id, websocket)


async def onConnect(websocket):
    await websocket.send("Connection established!")

    recv = await websocket.recv()

    # Check if message is admin command
    if(recv.startswith("% ")):
        # Get command and auth
        auth = recv.split(" ")[1]
        command = recv.split(" ")[2]

        # Ensure auth is correct (from env)
        if(auth != os.environ['ADMIN_AUTH']):
            await websocket.send("Invalid auth")
            await websocket.close()
            return

        # Process stop and reboot first
        if(command == "stop"):
            exit()
        if(command == "reboot"):
            os.system("bash update.sh && python3 main.py")
            exit()
    else:
        ip = recv    
    print("Connecting to socket: " + str(websocket.remote_address) + " -> " + ip)

    # Ensure no same ip
    if ip in playerIp:
        print("    Failed, duplicaite ip")
        await websocket.send(json.dumps(
            {"name": "error", "data": "Ip already connected"}
        ))

        # Close websocket
        await websocket.close()
        return
    else:
        print("    Success!")

    # Add player
    id = 0
    if (not websocket.remote_address in playerAddress):
        # Create new
        id = len(playerAddress)
        playerAddress.append(websocket.remote_address)
        playerIp.append("0")
        players.append(Player())
    else:
        id = playerAddress.index(websocket.remote_address)

    async for message in websocket:
        if (not websocket.remote_address in playerAddress):
            print("Warning: Invalid player connected")
            break
        try:
            await handleMessage(message, websocket)
        except Exception as e:
            print("Error on request '" + message + "': " + str(e))

    if (not websocket.remote_address in playerAddress):
        print("Warning: Player double disconnect [" +
              str(websocket.remote_address) + " id=" + str(id) + "]")
        return

    playerAddress.pop(id)
    playerIp.pop(id)
    players.pop(id)
    print("Disconnected " + str(websocket.remote_address) + " [playerId=" +
          str(id) + "]")


async def main():
    async with serve(onConnect, "0.0.0.0", 8888):
        await asyncio.Future()  # run forever

asyncio.run(main())