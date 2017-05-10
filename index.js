var shell = require("node-powershell");
var ws = require('websocket.io');
var iconv = require('iconv');

var conv = new iconv.Iconv('SJIS', 'UTF-8//TRANSLIT//IGNORE');

var ps = new shell({
        executionPolicy: 'Bypass',
        noProfile: false
})
var server = ws.listen(5000, function() {
        console.log('Server running');
})

// クライアントからの接続
// イベントを処理
server.on('connection', function(client) {
        console.log('connection start');
        sendPath(client);
        ps.streams.stderr.on('data', function(data) {
                client.send(JSON.stringify({
                        'err': data
                }))
        })
        ps.streams.stdout.on('data', function(data) {
                if (data.indexOf('EOI') !== -1) {
                        client.send(JSON.stringify({
                                'std': data
                        }))
                } else {
                        sendPath(client)
                        console.log("しゅうりょうかくにん")
                }
        })
        ps.streams.stdout.on('end', function(data) {
                client.send(JSON.stringify({
                        'std': data
                }))
                sendPath(client)
        })
        client.on('message', function(request) {
                // ps.addCommand(request)
                // ps.invoke()
                ps.streams.stdin.write(request + ";echo EOI\n");
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
});

function sendPath(client) {
        ps.addCommand('pwd');
        ps.invoke()
                .then(function(output) {
                        var obj = JSON.stringify({
                                'path': ((function(arr) {
                                        return arr.shift().match(/----/) ? arr.shift() : arguments.callee(arr)
                                })(output.split("\n")))
                        })
                        console.log(obj)
                        client.send(obj)
                })
}
