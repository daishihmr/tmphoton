tm.define("tm.photon.Client", {
    superClass: Photon.LoadBalancing.LoadBalancingClient,
    
    init: function(serverAddress, appId, appVersion) {
        Photon.LoadBalancing.LoadBalancingClient.call(this, serverAddress, appId, appVersion);
        
        this._listeners = {};
        
        this.rooms = null;
    },
    onStateChange: function(state) {
        console.log("onStateChange");
        switch (state) {
        case Photon.LoadBalancing.LoadBalancingClient.State.Error:
            console.log("    :Error");
            break;
        case Photon.LoadBalancing.LoadBalancingClient.State.Uninitialized:
            console.log("    :Uninitialized");
            break;
        case Photon.LoadBalancing.LoadBalancingClient.State.ConnectingToNameServer:
            console.log("    :ConnectingToNameServer");
            break;
        case Photon.LoadBalancing.LoadBalancingClient.State.ConnectedToNameServer:
            console.log("    :ConnectedToNameServer");
            break;
        case Photon.LoadBalancing.LoadBalancingClient.State.ConnectingToMasterserver:
            console.log("    :ConnectingToMasterserver");
            break;
        case Photon.LoadBalancing.LoadBalancingClient.State.ConnectedToMaster:
            console.log("    :ConnectedToMaster");
            break;
        case Photon.LoadBalancing.LoadBalancingClient.State.JoinedLobby:
            console.log("    :JoinedLobby");
            this.flare("connected");
            break;
        case Photon.LoadBalancing.LoadBalancingClient.State.ConnectingToGameserver:
            console.log("    :ConnectingToGameserver");
            break;
        case Photon.LoadBalancing.LoadBalancingClient.State.ConnectedToGameserver:
            console.log("    :ConnectedToGameserver");
            break;
        case Photon.LoadBalancing.LoadBalancingClient.State.Joined:
            console.log("    :Joined");
            break;
        case Photon.LoadBalancing.LoadBalancingClient.State.Disconnected:
            console.log("    :Disconnected");
            break;
        }
    },
    onRoomListUpdate: function(rooms, roomsUpdated, roomsAdded, roomsRemoved) {
        console.log("onRoomListUpdate: ");
        if (rooms) {
            this.rooms = rooms;
        }
        this.flare("roomlistupdate", {
            rooms: rooms,
            roomsUpdated: roomsUpdated,
            roomsAdded: roomsAdded,
            roomsRemoved: roomsRemoved,
        });
    },
    onRoomList: function(rooms) {
        console.log("onRoomList: " + rooms);
        if (rooms) {
            this.rooms = rooms;
        }
        this.flare("roomlistupdate", {
            rooms: rooms
        });
    },
    onOperationResponse: function(errorCode, errorMsg, code, content) {
        // console.log("onOperationResponse: ");
    },
    onMyRoomPropertiesChange: function() {
        console.log("onMyRoomPropertiesChange");
    },
    onLobbyStats: function(errorCode, errorMsg, lobbies) {
        console.log("onLobbyStats: ");
    },
    onJoinRoom: function(createdByMe) {
        console.log("onJoinRoom");
        this.flare("joined", {
            createdByMe: createdByMe
        });
    },
    onFindFriendsResult: function(errorCode, errorMsg, friends) {
        console.log("onFindFriendsResult: ");
    },
    onEvent: function(code, content, actorNr) {
        console.log("onEvent");
    },
    onError: function(errorCode, errorMsg) {
        console.log("onError");
    },
    onAppStats: function(errorCode, errorMsg, stats) {
        console.log("onAppStats");
    },
    onActorSuspend: function(actor) {
        console.log("onActorSuspend");
    },
    onActorLeave: function(actor, cleanup) {
        console.log("onActorLeave");
    },
    onActorJoin: function(actor) {
        console.log("onActorJoin: ", actor);
        this.flare("actorjoin", {
            actor: actor
        });
    },
});

tm.photon.Client.prototype.on = tm.event.EventDispatcher.prototype.on;
tm.photon.Client.prototype.off = tm.event.EventDispatcher.prototype.off;
tm.photon.Client.prototype.fire = tm.event.EventDispatcher.prototype.fire;
tm.photon.Client.prototype.flare = tm.event.EventDispatcher.prototype.flare;
tm.photon.Client.prototype.one = tm.event.EventDispatcher.prototype.one;
tm.photon.Client.prototype.hasEventListener = tm.event.EventDispatcher.prototype.hasEventListener;
tm.photon.Client.prototype.clearEventListener = tm.event.EventDispatcher.prototype.clearEventListener;
tm.photon.Client.prototype.addEventListener = tm.event.EventDispatcher.prototype.addEventListener;
tm.photon.Client.prototype.removeEventListener = tm.event.EventDispatcher.prototype.removeEventListener;
tm.photon.Client.prototype.dispatchEvent = tm.event.EventDispatcher.prototype.dispatchEvent;
tm.photon.Client.prototype.trigger = tm.event.EventDispatcher.prototype.trigger;
