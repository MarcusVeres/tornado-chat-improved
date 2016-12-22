// Copyright 2009 FriendFeed
//
// Licensed under the Apache License, Version 2.0 (the "License"); you may
// not use this file except in compliance with the License. You may obtain
// a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations
// under the License.

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

	return;

        var existing = $("#m" + message.id);
        if (existing.length > 0) return;

	var val = parseInt( message.body );
	var change = null;

	// store the old value
	oldTilt = newTilt;

	// update the tilt
	newTilt = val;

	console.log( newTilt );

	return;
		
	// get current top
	var currentOffset = cursor.style.top.replace( "px" , "" );
	currentOffset = parseInt( currentOffset );
	currentOffset += change;

        // console.log( message.body );
        cursor.style.top = currentOffset + "px";

        return;

        var node = $(message.html);
        node.hide();
        $("#inbox").append(node);
        node.slideDown();

        // mouse settings
        cursor.style.left = message.html + "px";
    }
};
