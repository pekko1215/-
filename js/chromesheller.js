// WebSocket接続
var ws = new WebSocket("ws://localhost:5000");
var path = "";
var oldinput = [];
// WebSocket open時のイベントハンドラ登録
ws.onopen = function() {
        console.log('Initialize Success');
        ws.send('pwd')
}

// WebSocket message受信時のイベントハンドラ登録
ws.onmessage = function(message) {
        var mes = JSON.parse(message.data);
        console.log(mes)
        for (var key in mes) {
                var ele = $('<div></div>')
                var resp = mes[key].replace(/\r?\n/g, "<br>")
                switch (key) {
                        case 'path':
                                path = resp;
                                setPath()
                            break;
                        case 'std':
                                ele.attr('class', "std");
                                ele.html(resp)
                                $('#console').append(ele)
                                break;
                        case 'err':
                                ele.attr('class', "error");
                                ele.html(resp)
                                $('#console').append(ele)
                                break;
                }
                window.scroll(0,$(document).height());
        }
}

// WebSocket error時のイベントハンドラ登録
ws.onerror = function() {
        console.log('Error!');
}

// WebSocket close時のイベントハンドラ登録
ws.onclose = function() {
        console.log('Connection Close!');
}

// Windowが閉じられた(例：ブラウザを閉じた)時のイベントを設定
window.onbeforeunload = function() {
        ws.onclose(); // WebSocket close
}

$(function() {
        $('#com').keydown(function(e) {
            window.scroll(0,$(document).height());
                if (e.key == "Enter") {
                        send();
                        $(this).val("")
                        $(this).autocomplete({
                            source:oldinput,
                            autoFocus:true
                        })
                }
        })
})

function send() {
        var elm = document.getElementById('com');

        var ele = $('<div></div>')
        ele.attr('class', "command");
        ele.html(elm.value);
        $('#console').append(ele)
        ws.send(elm.value);
        oldinput.push(elm.value);
}

function setPath(){
    $('#path').text(path+">")
}