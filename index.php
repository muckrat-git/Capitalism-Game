<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">
    <title>Game</title>
    <link href="style.css" rel="stylesheet" type="text/css" />
    <link rel="icon" type="image/x-icon" href="resources/Ship.svg">
    <script>
        <?php
        function get_client_ip() {
            $ipaddress = '';
            if (isset($_SERVER['HTTP_CLIENT_IP']))
                $ipaddress = $_SERVER['HTTP_CLIENT_IP'];
            else if(isset($_SERVER['HTTP_X_FORWARDED_FOR']))
                $ipaddress = $_SERVER['HTTP_X_FORWARDED_FOR'];
            else if(isset($_SERVER['HTTP_X_FORWARDED']))
                $ipaddress = $_SERVER['HTTP_X_FORWARDED'];
            else if(isset($_SERVER['HTTP_FORWARDED_FOR']))
                $ipaddress = $_SERVER['HTTP_FORWARDED_FOR'];
            else if(isset($_SERVER['HTTP_FORWARDED']))
                $ipaddress = $_SERVER['HTTP_FORWARDED'];
            else if(isset($_SERVER['REMOTE_ADDR']))
                $ipaddress = $_SERVER['REMOTE_ADDR'];
            else
                $ipaddress = 'UNKNOWN';

            return $ipaddress;
        }

        // Combine client ip and agent to form unique id
        function get_client_id() {
            return md5(get_client_ip() . $_SERVER['HTTP_USER_AGENT']);
        }
        ?>
        const CLIENTID = "<?php echo get_client_id(); ?>";
    </script>
</head>

<body>
    <div id="space"></div>
    <canvas id="canvas"></canvas>
    <script type="module" src="main.js"></script>

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