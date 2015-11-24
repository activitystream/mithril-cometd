var m = require('mithril');
var org_cometd = require('../org/cometd');

org_cometd.JSON.toJSON = JSON.stringify;
org_cometd.JSON.fromJSON = JSON.parse;

function _setHeaders(xhr, headers) {
    if (headers) {
        Object.keys(headers).forEach(function(name){
            if (name.toLowerCase() === 'content-type') {
                return;
            }
            xhr.setRequestHeader(name, headers[name]);
        });
    }
}

function LongPollingTransport() {
    var _super = new org_cometd.LongPollingTransport();
    var that = org_cometd.Transport.derive(_super);

    that.xhrSend = function (packet) {
        return m.request({
            url: packet.url,
            method: 'POST',
            data: packet.body,
            config: function (xhr) {
                xhr.withCredentials = true;
                xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
                _setHeaders(xhr, packet.headers);
            }
        }).then(packet.onSuccess, packet.onError);
    };

    return that;
}

function CallbackPollingTransport() {
    var _super = new org_cometd.CallbackPollingTransport();
    var that = org_cometd.Transport.derive(_super);

    that.jsonpSend = function (packet) {
        m.request({
            url: packet.url,
            method: 'GET',
            dataType: 'jsonp',
            callbackKey: 'jsonp',
            data: {
                message: packet.body
            },
            config: function (xhr) {
                _setHeaders(xhr, packet.headers);
            }
        }).then(packet.onSuccess, packet.onError);
    };

    return that;
}

Cometd = function(name) {
    var cometd = new org_cometd.CometD(name);

    if (org_cometd.WebSocket) {
        cometd.registerTransport('websocket', new org_cometd.WebSocketTransport());
    }

    cometd.registerTransport('long-polling', new LongPollingTransport());
    cometd.registerTransport('callback-polling', new CallbackPollingTransport());

    return cometd;
}

module.exports = Cometd;
