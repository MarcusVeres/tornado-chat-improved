// ------------------------------------------------------\
// Paddle Ball Script

'use strict'; 

(function()
{
    // fingerprint code :: 
    // first-loaded will be this machine
    // var fingerprint = new Fingerprint().get();

    console.log( "This is Player 1" );

    // how often should we animate?
    var frameRate = 60;
    var framesInterval = 1000 / frameRate;
    var animate = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function (callback) {
        window.setTimeout( callback, frameInterval );
    };

    // settings
    var canvasWidth = 300;
    var canvasHeight = 450;
    var backgroundColor = '#1e75bb';

    var paddleColor = '#ffffff';
    var paddleHeight = 10;
    var paddleWidth = 72;
    var paddleMoveSpeed = 4;

    var ballColor = '#ffd700';
    var ballRadius = 10;


    var canvas = document.createElement("canvas");
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    var context = canvas.getContext( '2d' );
    var hud = document.getElementById( 'hud' );

    // initialize objects
    var player_1 = new Player_1();
    var player_2 = new Player_2();
    var ball = new Ball( canvasWidth/2 , canvasHeight/2 );
    var motion = new MotionController();

    // data storage
    var keysDown = {};
    var currentTilt = {};
    var socketTiltData = 0;


    // draw functions

    var render = function () {
        context.fillStyle = backgroundColor;
        context.fillRect( 0 , 0 , canvasWidth , canvasHeight );
        player_1.render();
        player_2.render();
        ball.render();
    };

    var update = function () {
        motion.update();
        player_1.update();
        player_2.update();
        ball.update( player_1.paddle , player_2.paddle );
    };

    var step = function () {
        update();
        render();
        animate( step );
    };


    function Paddle( x , y , width , height ) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.x_speed = 0;
        this.y_speed = 0;
    }

    Paddle.prototype.render = function () {
        context.fillStyle = paddleColor;
        context.fillRect( this.x , this.y , this.width , this.height );
    };

    Paddle.prototype.move = function ( x , y ) {
        this.x += x;
        this.y += y;
        this.x_speed = x;
        this.y_speed = y;
        if (this.x < 0) {
            this.x = 0;
            this.x_speed = 0;
        } else if (this.x + this.width > canvasWidth) {
            this.x = canvasWidth - this.width;
            this.x_speed = 0;
        }
    };


    // Player 1 - ghetto implementation

    function Player_1() {
        this.paddle = new Paddle( 
            (canvasWidth - paddleWidth) / 2 , 
            paddleHeight , 
            paddleWidth , 
            paddleHeight 
        );
    }

    Player_1.prototype.render = function () {
        this.paddle.render();
    };

    Player_1.prototype.update = function ()
    {
        this.paddle.move( socketTiltData , 0 );
    };


    // Player 2 - ghetto implementation

    function Player_2() {
        this.paddle = new Paddle( 
            (canvasWidth - paddleWidth) / 2 , 
            canvasHeight - paddleHeight * 2 , 
            paddleWidth , 
            paddleHeight 
        );
    }

    Player_2.prototype.render = function () {
        this.paddle.render();
    };

    Player_2.prototype.update = function ()
    {
        this.paddle.move( socketTiltData , 0 );
    };


    // 

    function Ball( x , y ) {
        this.x = x;
        this.y = y;
        this.x_speed = 0;
        this.y_speed = 3;
    }

    Ball.prototype.render = function () {
        context.beginPath();
        context.arc( this.x , this.y , ballRadius , 2 * Math.PI , false );
        context.fillStyle = ballColor;
        context.fill();
    };

    Ball.prototype.update = function ( paddle1 , paddle2 ) {
        this.x += this.x_speed;
        this.y += this.y_speed;
        var top_x = this.x - ballRadius;
        var top_y = this.y - ballRadius;
        var bottom_x = this.x + ballRadius;
        var bottom_y = this.y + ballRadius;

        if (this.x - ballRadius < 0) {
            this.x = ballRadius;
            this.x_speed = -this.x_speed;
        } else if (this.x + ballRadius > canvasWidth) {
            this.x = canvasWidth - ballRadius;
            this.x_speed = -this.x_speed;
        }

        if (this.y < 0 || this.y > canvasHeight) {
            this.x_speed = 0;
            this.y_speed = 3;
            this.x = canvasWidth/2;
            this.y = canvasHeight/2;
        }

        if (top_y > canvasHeight/2) {
            if (top_y < (paddle1.y + paddle1.height) && bottom_y > paddle1.y && top_x < (paddle1.x + paddle1.width) && bottom_x > paddle1.x) {
                this.y_speed = -3;
                this.x_speed += (paddle1.x_speed / 2);
                this.y += this.y_speed;
            }
        } else {
            if (top_y < (paddle2.y + paddle2.height) && bottom_y > paddle2.y && top_x < (paddle2.x + paddle2.width) && bottom_x > paddle2.x) {
                this.y_speed = 3;
                this.x_speed += (paddle2.x_speed / 2);
                this.y += this.y_speed;
            }
        }
    };

    
    function MotionController()
    {
        this.x;
        this.y;
    }

    MotionController.prototype.update = function()
    {
        // console.log( "updating the motion controller" );
        if( currentTilt.x )
        {
            // veres
            // hud.innerHTML = currentTilt.x;

            // assign the x value to the message input 
            $('#message').val( currentTilt.x );

            // send the message to the server 
            newMessage( $('#messageform') );
        } 
        else {
            hud.innerHTML = "no tilt available";
        }
    }


    // 

    // Returns a function, that, as long as it continues to be invoked, will not
    // be triggered. The function will be called after it stops being called for
    // N milliseconds. If `immediate` is passed, trigger the function on the
    // leading edge, instead of the trailing.
    function debounce(func, wait, immediate) {
        var timeout;
        return function() {
            var context = this, args = arguments;
            var later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    };


    // 

    document.body.appendChild(canvas);
    animate(step);

    window.addEventListener("keydown", function (event) {
        keysDown[event.keyCode] = true;
    });

    window.addEventListener("keyup", function (event) {
        delete keysDown[event.keyCode];
    });

    window.ondevicemotion = function( event )
    {
        var x = event.accelerationIncludingGravity.x;
        var y = event.accelerationIncludingGravity.y;
        currentTilt = { 'x' : x , 'y' : y };
    };

    // sockets functions 
    // everything below this line is not as clean as the stuff above it
    // -----------------------------------------------------

    var cursor = null;

    $(document).ready(function()
    {
        // cursor = document.getElementById( 'cursor' );
        // cursor.style.top = "400px";

        if (!window.console) window.console = {};
        if (!window.console.log) window.console.log = function() {};

        $("#messageform").on("submit", function() {
            newMessage($(this));
            return false;
        });

        $("#messageform").on("keypress", function(e) {
            if (e.keyCode == 13) {
                newMessage($(this));
                return false;
            }
            return true;
        });

        $("#message").select();
        updater.poll();

    });

    function newMessage(form) {
        var message = form.formToDict();
        var disabled = form.find("input[type=submit]");
        disabled.disable();
        $.postJSON("/a/message/new-p1", message, function(response) {
            updater.showMessage(response);
            if (message.id) {
                form.parent().remove();
            } else {
                form.find("input[type=text]").val("").select();
                disabled.enable();
            }
        });
    }

    function getCookie(name) {
        var r = document.cookie.match("\\b" + name + "=([^;]*)\\b");
        return r ? r[1] : undefined;
    }

    jQuery.postJSON = function(url, args, callback) {
        args._xsrf = getCookie("_xsrf");
        $.ajax({url: url, data: $.param(args), dataType: "text", type: "POST",
                success: function(response) {
            if (callback) callback(eval("(" + response + ")"));
        }, error: function(response) {
            console.log("ERROR:", response);
        }});
    };

    jQuery.fn.formToDict = function() {
        var fields = this.serializeArray();
        var json = {};
        for (var i = 0; i < fields.length; i++) {
            json[fields[i].name] = fields[i].value;
        }
        if (json.next) delete json.next;
        return json;
    };

    jQuery.fn.disable = function() {
        this.enable(false);
        return this;
    };

    jQuery.fn.enable = function(opt_enable) {
        if (arguments.length && !opt_enable) {
            this.attr("disabled", "disabled");
        } else {
            this.removeAttr("disabled");
        }
        return this;
    };

    var updater = {
        errorSleepTime: 500,
        cursor: null,

        poll: function() {
            var args = {"_xsrf": getCookie("_xsrf")};
            if (updater.cursor) args.cursor = updater.cursor;
            $.ajax({
                url: "/a/message/updates", 
                type: "POST", 
                dataType: "text",
                data: $.param(args), 
                success: updater.onSuccess,
                error: updater.onError
            });
        },

        onSuccess: function(response) {
            try {
                updater.newMessages(eval("(" + response + ")"));
            } catch (e) {
                updater.onError();
                return;
            }
            updater.errorSleepTime = 500;
            window.setTimeout(updater.poll, 0);
        },

        onError: function(response) {
            updater.errorSleepTime *= 2;
            console.log("Poll error; sleeping for", updater.errorSleepTime, "ms");
            window.setTimeout(updater.poll, updater.errorSleepTime);
        },

        newMessages: function(response) {
            if (!response.messages) return;
            updater.cursor = response.cursor;
            var messages = response.messages;
            updater.cursor = messages[messages.length - 1].id;

            // console.log(messages.length, "new messages, cursor:", updater.cursor);

            for (var i = 0; i < messages.length; i++) {
                updater.showMessage(messages[i]);
            }
        },

        showMessage: function(message) {

            var val = parseInt( message.body );
            socketTiltData = val;
            hud.innerHTML = socketTiltData;

            // veres

            // console.log( val );
            // var val = parseInt( message.body );
            // cursor.style.top = (val * -8) + 200 + "px";	
            // cursor.style.left = (val * -8) + 400 + "px";	
        }
    };


    // -----------------------------------------------------
    // The player screens won't have QR codes

})();

