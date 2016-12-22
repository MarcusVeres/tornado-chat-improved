// ------------------------------------------------------\
// Paddle Ball Script

'use strict'; 

(function()
{
    // how often should we animate?
    var frameRate = 60;
    var framesInterval = 1000 / frameRate;
    var animate = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function (callback) {
        window.setTimeout( callback, frameInterval );
    };

    // settings
    var canvasWidth = 400;
    var canvasHeight = 600;
    var backgroundColor = '#1e75bb';
    var paddleColor = '#ffffff';
    var paddleHeight = 16;
    var paddleWidth = 110;
    var ballColor = '#ffd700';
    var ballRadius = 10;

    var canvas = document.createElement("canvas");
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    var context = canvas.getContext( '2d' );

    // initialize objects
    var player = new Player();
    var computer = new Computer();
    var ball = new Ball( 200 , 300 );

    // data storage
    var keysDown = {};


    // draw functions

    var render = function () {
        context.fillStyle = backgroundColor;
        context.fillRect( 0 , 0 , canvasWidth , canvasHeight );
        player.render();
        computer.render();
        ball.render();
    };

    var update = function () {
        player.update();
        computer.update( ball );
        ball.update( player.paddle , computer.paddle );
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
        } else if (this.x + this.width > 400) {
            this.x = 400 - this.width;
            this.x_speed = 0;
        }
    };


    function Computer() {
        // TODO - x and y should be relative to canvas dimensions
        this.paddle = new Paddle( 
            (canvasWidth - paddleWidth) / 2 , 
            paddleHeight , 
            paddleWidth , 
            paddleHeight 
        );
    }

    Computer.prototype.render = function () {
        this.paddle.render();
    };

    Computer.prototype.update = function (ball) {
        var x_pos = ball.x;
        var diff = -((this.paddle.x + (this.paddle.width / 2)) - x_pos);
        if (diff < 0 && diff < -4) {
            diff = -5;
        } else if (diff > 0 && diff > 4) {
            diff = 5;
        }
        this.paddle.move(diff, 0);
        if (this.paddle.x < 0) {
            this.paddle.x = 0;
        } else if (this.paddle.x + this.paddle.width > 400) {
            this.paddle.x = 400 - this.paddle.width;
        }
    };


    function Player() {
        this.paddle = new Paddle( 
            (canvasWidth - paddleWidth) / 2 , 
            canvasHeight - paddleHeight * 2 , 
            paddleWidth , 
            paddleHeight 
        );
    }

    Player.prototype.render = function () {
        this.paddle.render();
    };

    Player.prototype.update = function () {
        for (var key in keysDown) {
            var value = Number(key);
            if (value == 37) {
                this.paddle.move(-4, 0);
            } else if (value == 39) {
                this.paddle.move(4, 0);
            } else {
                this.paddle.move(0, 0);
            }
        }
    };


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
        var top_x = this.x - 5;
        var top_y = this.y - 5;
        var bottom_x = this.x + 5;
        var bottom_y = this.y + 5;

        if (this.x - 5 < 0) {
            this.x = 5;
            this.x_speed = -this.x_speed;
        } else if (this.x + 5 > 400) {
            this.x = 395;
            this.x_speed = -this.x_speed;
        }

        if (this.y < 0 || this.y > 600) {
            this.x_speed = 0;
            this.y_speed = 3;
            this.x = 200;
            this.y = 300;
        }

        if (top_y > 300) {
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


    document.body.appendChild(canvas);
    animate(step);

    window.addEventListener("keydown", function (event) {
        keysDown[event.keyCode] = true;
    });

    window.addEventListener("keyup", function (event) {
        delete keysDown[event.keyCode];
    });

})();


// -----------------------------------------------------

/*

var currentTilt = null;
var cursor = null;
var cursorOffset = 200;

var oldTilt = null;
var newTilt = null;


$(document).ready(function()
{
    cursor = document.getElementById( 'cursor' );
	cursor.style.top = "400px";

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


    // -----------------------------------------------
    // phone orientation stuff

    // console.log( window.ondevicemotion );

    window.ondevicemotion = function( event )
    {
        var x = event.accelerationIncludingGravity.x;
        var y = event.accelerationIncludingGravity.y;
        // currentTilt = x;
        currentTilt = y;
    }

	// veres 
    // update the input field every few milliseconds
    window.setInterval( function() {

        updateInputField();

        if( currentTilt !== null ) {
            newMessage( $('#messageform') );
        }

    } , 50 );

});


function valBetween( v , min , max ) {
    return ( Math.min( max , Math.max( min , v )));
}

function updateInputField()
{
    $('#message').val( currentTilt );
}

function newMessage(form) {
    var message = form.formToDict();
    var disabled = form.find("input[type=submit]");
    disabled.disable();
    $.postJSON("/a/message/new", message, function(response) {
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
        $.ajax({url: "/a/message/updates", type: "POST", dataType: "text",
                data: $.param(args), success: updater.onSuccess,
                error: updater.onError});
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

        // veres
    showMessage: function(message) {

	var val = parseInt( message.body );
	// console.log( val );
        // cursor.style.top = (val * -8) + 200 + "px";	
        cursor.style.left = (val * -8) + 400 + "px";	
    }
};

*/

