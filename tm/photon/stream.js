(function() {
    
tm.define("tm.photon.Stream", {
    init: function(element) {
        this.element = element;
        this.networkId = uuid();
        this._sendQueue = [];
        this._receiveQueue = [];
    },
    
    sendNext: function(obj) {
    },
    
    receiveNext: function() {
        return null;
    },
    
    _update: function(photonClient) {
        if (this._sendQueue.length) {
            var data = this._sendQueue.clone();
            photonClient.raiseEvent(tm.photon.Client.OpCode.UPDATE_ELEMENT, {
                data: data
            });
            this._sendQueue.clear();
        }
    },
});

tm.app.Element.prototype.getter("photonStream", function() {
    if (!this._photonStream) {
        this._photonStream = tm.photon.Stream(this);
        this.on("enterframe", function(e) {
            var photonClient = e.app.photonClient;
            this._photonStream._update(photonClient);
        });
    }
    
    return this._photonStream;
});

function uuid() {
  var uuid = "", i, random;
  for (i = 0; i < 32; i++) {
    random = Math.random() * 16 | 0;

    if (i == 8 || i == 12 || i == 16 || i == 20) {
      uuid += "-"
    }
    uuid += (i == 12 ? 4 : (i == 16 ? (random & 3 | 8) : random)).toString(16);
  }
  return uuid;
}

})();
