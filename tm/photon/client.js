(function() {

if (!tm.global.Photon) return;
if (!tm.global.Exitgames) return;

var _super = Photon.LoadBalancing.LoadBalancingClient;

tm.define("tm.photon.Client", {
    superClass: _super,
    
    init: function(serverAddress, appId, appVersion) {
        _super.call(this, serverAddress, appId, appVersion);
        this.setLogLevel(Exitgames.Common.Logger.Level.ERROR);
        
        this._eventQueue = [];
        this.roomList = [];
    },
    
    update: function(app) {
        if (this._eventQueue.length) {
            var e = null;
            while (e = this._eventQueue.shift()) {
                e.app = app;
                this.fire(e);
            }
        }
    },
    
    connect: function(options) {
        _super.prototype.connect.apply(this, arguments);
        return Promise.all([
            new Promise(function(resolve, reject) {
                var onsuccess = function() {
                    this.off("error", onerror);
                    resolve();
                };
                var onerror = function() {
                    this.off("joinedlobby", onsuccess);
                    reject();
                };
                
                this.one("joinedlobby", onsuccess);
                this.one("error", onerror);
            }.bind(this)),
            new Promise(function(resolve, reject) {
                var onsuccess = function() {
                    this.off("error", onerror);
                    resolve();
                };
                var onerror = function() {
                    this.off("roomlistupdated", onsuccess);
                    reject();
                };

                this.one("roomlistupdated", onsuccess);
                this.one("error", onerror);
            }.bind(this)), 
        ]);
    },
    
    createRoom: function(roomName, options) {
        _super.prototype.createRoom.apply(this, arguments);
        return new Promise(function(resolve) {
            this.one("joined", resolve);
        }.bind(this));
    },
    
    joinRoom: function(roomName, options, createOptions) {
        _super.prototype.joinRoom.apply(this, arguments);
        return new Promise(function(resolve) {
            this.one("joined", resolve);
        }.bind(this));
    },
    
    leaveRoom: function() {
        _super.prototype.leaveRoom.apply(this, arguments);
        return new Promise(function(resolve, reject) {
            var onsuccess = function() {
                this.off("error", onerror);
                resolve();
            };
            var onerror = function() {
                this.off("joinedlobby", onsuccess);
                reject();
            };

            this.one("joinedlobby", onsuccess);
            this.one("error", onerror);
        }.bind(this))
    },
    
    _enqueueEvent: function(eventType, data) {
        var event = tm.event.Event(eventType);
        if (data) event.$extend(data);
        this._eventQueue.push(event);
    },

    /** @override */
    onStateChange: function(state) {
        var State = Photon.LoadBalancing.LoadBalancingClient.State;
        switch (state) {
        case State.Error:
            console.log("--- Error");
            this._enqueueEvent("error");
            break;
        case State.Uninitialized:
            console.log("--- Uninitialized");
            break;
        case State.ConnectingToNameServer:
            console.log("--- ConnectingToNameServer");
            break;
        case State.ConnectedToNameServer:
            console.log("--- ConnectedToNameServer");
            break;
        case State.ConnectingToMasterserver:
            console.log("--- ConnectingToMasterserver");
            break;
        case State.ConnectedToMaster:
            console.log("--- ConnectedToMaster");
            break;
        case State.JoinedLobby:
            console.log("--- JoinedLobby");
            this._enqueueEvent("joinedlobby");
            break;
        case State.ConnectingToGameserver:
            console.log("--- ConnectingToGameserver");
            break;
        case State.ConnectedToGameserver:
            console.log("--- ConnectedToGameserver");
            break;
        case State.Joined:
            console.log("--- Joined");
            break;
        case State.Disconnected:
            console.log("--- Disconnected");
            this._enqueueEvent("disconnected");
            break;
        }
    },
    /** @override */
    onRoomListUpdate: function(rooms, roomsUpdated, roomsAdded, roomsRemoved) {
        // console.log("--- onRoomListUpdate: ");
        this.roomList = rooms;
        this._enqueueEvent("roomlistupdated", {
            rooms: rooms,
            roomsUpdated: roomsUpdated,
            roomsAdded: roomsAdded,
            roomsRemoved: roomsRemoved,
        });
    },
    /** @override */
    onRoomList: function(rooms) {
        // console.log("--- onRoomList: " + rooms.length, rooms);
        this.roomList = rooms;
        this._enqueueEvent("roomlistupdated", {
            rooms: rooms
        });
    },
    /** @override */
    onOperationResponse: function(errorCode, errorMsg, code, content) {
        // console.log("--- onOperationResponse: ", errorCode, errorMsg, code, content);
    },
    /** @override */
    onMyRoomPropertiesChange: function() {
        // console.log("--- onMyRoomPropertiesChange");
    },
    /** @override */
    onLobbyStats: function(errorCode, errorMsg, lobbies) {
        // console.log("onLobbyStats: ");
    },
    /** @override */
    onJoinRoom: function(createdByMe) {
        // console.log("--- onJoinRoom");
        this._enqueueEvent("joined", {
            createdByMe: createdByMe
        });
    },
    /** @override */
    onFindFriendsResult: function(errorCode, errorMsg, friends) {
        // console.log("onFindFriendsResult: ");
    },
    /** @override */
    onEvent: function(code, content, actorNr) {
        // console.log("onEvent", code, content, actorNr);
        this._enqueueEvent("customevent", {
            data: content,
            from: actorNr,
        });
    },
    /** @override */
    onError: function(errorCode, errorMsg) {
        // console.log("--- onError");
    },
    /** @override */
    onAppStats: function(errorCode, errorMsg, stats) {
        // console.log("--- onAppStats");
    },
    /** @override */
    onActorSuspend: function(actor) {
        // console.log("--- onActorSuspend");
    },
    /** @override */
    onActorLeave: function(actor, cleanup) {
        // console.log("--- onActorLeave", actor, cleanup);
        this._enqueueEvent("actorleaved", {
            actor: actor,
            cleanup: cleanup,
        });
    },
    /** @override */
    onActorJoin: function(actor) {
        // console.log("--- onActorJoin: ", actor);
        this._enqueueEvent("actorjoined", {
            actor: actor
        });
    },
});

tm.photon.Client.OpCode.UPDATE_ELEMENT = 1;

// tm.photon.Client extends tm.event.EventDispatcher
[
    "on",
    "off",
    "fire",
    "flare",
    "one",
    "hasEventListener",
    "clearEventListener",
    "addEventListener",
    "removeEventListener",
    "dispatchEvent",
    "trigger",
].forEach(function(name) {
    tm.photon.Client.prototype[name] = tm.event.EventDispatcher.prototype[name];
});
tm.photon.Client.prototype._listeners = {};

tm.app.BaseApp.prototype.getter("photonClient", function() {
    if (!this._photonClient) {
        this._photonClient = tm.photon.Client();
    }
    
    return this._photonClient;
});

        
})();
