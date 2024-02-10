<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">
    <title>Game</title>
    <link href="style.css" rel="stylesheet" type="text/css" />
    <link rel="icon" type="image/x-icon" href="resources/Ship.svg">
    <script>
        const IPADDR = "<?php echo $_SERVER['REMOTE_ADDR']; ?>";
    </script>
</head>

<body>
    <div id="space"></div>
    <canvas id="canvas"></canvas>
    <script type="module" src="main.js"></script>

    <div class="window">
        <div class="title-bar">
            <h1>Planet</h1>
            <div class="controls">
                <button>🗕</button>
                <button>🗙</button>
            </div>
        </div>
        <iframe class="content" src="pages/planet.html"></iframe>
        <img class="resize" src="resources/resize.png" draggable="false">
    </div>

    <div class="window">
        <div class="title-bar">
            <h1>Test</h1>
            <div class="controls">
                <button>🗕</button>
                <button>🗙</button>
            </div>
        </div>
        <iframe class="content" src="pages/example.html"></iframe>
        <img class="resize" src="resources/resize.png" draggable="false">
    </div>
	
    <div id="connect">
        <h1>Connecting to server...</h1>
    </div>
</body>

</html>