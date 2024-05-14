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

            // Remove text after ',' char
            $ipaddress = explode(',', $ipaddress);
            $ipaddress = $ipaddress[0];

            return $ipaddress;
        }

        // Combine client ip and agent to form unique id
        function get_client_id() {
            return md5(get_client_ip() . uniqid());
        }
        ?>
        let CLIENTID = localStorage.getItem("USERID");
        if(CLIENTID == null) {
            CLIENTID = "<?php echo get_client_id(); ?>";
            localStorage.setItem("USERID", CLIENTID);
        }
    </script>
</head>

<body>
    <div id="space"></div>
    <canvas id="canvas"></canvas>
    <script type="module" src="main.js?random=<?php echo filemtime('main.js');?>"></script>

    <!--<div class="window">
        <div class="title-bar">
            <h1>Test</h1>
            <div class="controls">
                <button>🗕</button>
                <button>🗙</button>
            </div>
        </div>
        <iframe class="content" src="pages/example.html"></iframe>
        <img class="resize" src="resources/resize.png" draggable="false">
    </div>-->

    <div id="money">$0</div>

    <div id="connect" style="z-index: 100">
        <h1>Connecting to server...</h1>
    </div>
</body>

</html>