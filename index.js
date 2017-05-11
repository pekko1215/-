var shell = require("node-powershell");
var ws = require('websocket.io');
var iconv = require('iconv');

var conv = new iconv.Iconv('SJIS', 'UTF-8//TRANSLIT//IGNORE');

var slicer = 'PachiSlot'

var ps = new shell({
        executionPolicy: 'Bypass',
        noProfile: false
})
var server = ws.listen(5000, function() {
        console.log('Server running');
})
var bufferArray = [];
var pwdFlag = false;
// クライアントからの接続
// イベントを処理
server.on('connection', function(client) {
        console.log('connection start');
        ps.streams.stderr.on('data', function(data) {
                client.send(JSON.stringify({
                        'err': data
                }))
        })
        ps.streams.stdout.on('data', function(data) {
                var arr = data.split("\n");
                arr.splice(arr.length - 1, 1);
                if (pwdFlag) {
                        sendPath(arr[0], client)
                        arr.splice(0, 1);
                        pwdFlag = false;
                } else {
                        for (var i = 0; i < arr.length; i++) {
                                console.log("arr[" + i + "] = " + arr[i])
                                if (arr[i].indexOf(slicer) == 0) {
                                        if (arr.length <= i + 1) {
                                                arr.splice(i, 1);
                                                pwdFlag = true;
                                                break;
                                        } else {
				     arr.splice(i,1);
                                                sendPath(arr[i], client)
                                                arr.splice(i, 1);
                                                break;
                                        }
                                }
                        }
                }
                // console.log(arr)
                client.send(JSON.stringify({
                        'std': arr.join('\n')
                }))
        })
        ps.streams.stdout.on('end', function(data) {
                client.send(JSON.stringify({
                        'std': data
                }))
                console.log('end' + data)
        })

        client.on('message', function(request) {
                // ps.addCommand(request)
                // ps.invoke()
                ps.streams.stdin.write(request + ";echo " + slicer + ";echo $pwd.Path\n");
        });

        // クライアントが切断したときの処理
        client.on('disconnect', function() {
                console.log('connection disconnect');
        });

        // 通信がクローズしたときの処理
        client.on('close', function() {
                console.log('connection close');
        });

        // エラーが発生した場合
        client.on('error', function(err) {
                console.log(err);
                console.log(err.stack);
        });

        ps.streams.stdin.write("echo " + slicer + ";echo $pwd.Path\n")
});

function sendPath(output, client) {
        console.log("output:" + output)
        var obj = JSON.stringify({
                'path': output
        });
        client.send(obj)
}
