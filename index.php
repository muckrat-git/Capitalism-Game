<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">
    <title>Capitalism</title>
    <link href="style.css" rel="stylesheet" type="text/css" />
    <script>
        var ipaddr = "<?php echo $_SERVER['REMOTE_ADDR']; ?>";
    </script>
</head>

<body>
    <div id="space"></div>
    <canvas id="canvas"></canvas>
    <script type="module" src="main.js"></script>
    
    <div id="connect">
        <h1>Connecting to server...</h1>
    </div>
</body>

</html>