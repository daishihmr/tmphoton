/// <reference path="photon.ts"/>
/// <reference path="photon-loadbalancing-constants.ts"/>

/** 
    Photon Load Balancing API
    @namespace Photon.LoadBalancing 
*/


module Photon.LoadBalancing {
    
    var protocolPrefix = {
        ws: "ws://",
        wss: "wss://"
    }

    function addProtocolPrefix(address: string, protocol: number) {
        for (var k in protocolPrefix) {
            if (address.indexOf(protocolPrefix[k]) == 0) {
                return address;
            }
        }
        switch (protocol) {
            case ConnectionProtocol.Ws:
                return protocolPrefix.ws + address;
            case ConnectionProtocol.Wss:
                return protocolPrefix.wss + address;
            default: // error
                return protocolPrefix.ws + address;
        }
    }

    export interface ConnectOptions {
        keepMasterConnection?: boolean;
        lobbyName?: string;
        lobbyType?: number;
        lobbyStats?: boolean;
        /*internal*/ userAuthSecret?: string;
        /*internal*/region?: string
    }

    export interface CreateRoomOptions {
        isVisible?: boolean;
        isOpen?: boolean;
        maxPlayers?: number;
        customGameProperties?: Object;
        propsListedInLobby?: string[];
        emptyRoomLiveTime?: number;
        suspendedPlayerLiveTime?: number;
        uniqueUserId?: boolean;
        lobbyName?: string;
        lobbyType?: number;
    }

    export interface JoinRoomOptions {
        joinToken?: string;
        createIfNotExists?: boolean
        lobbyName?: string;
        lobbyType?: number;
    }

    export interface JoinRandomRoomOptions {
        expectedCustomRoomProperties?: any;
        expectedMaxPlayers?: number;
        matchingType?: number;
        lobbyName?: string;
        lobbyType?: number;
        sqlLobbyFilter?: string
    }

    export class Actor {

        /**
            @classdesc Summarizes a "player" within a room, identified (in that room) by ID (or "actorNr"). Extend to implement custom logic.
            @constructor Photon.LoadBalancing.Actor
            @param {string} name Actor name.
            @param {number} actorNr Actor ID.
            @param {boolean} isLocal Actor is local.
        */
        constructor(public name: string, public actorNr: number, public isLocal: boolean) { }

        // public getLoadBalancingClient() { return this.loadBalancingClient; }

        /** 
            @summary Actor's room: the room initialized by client for create room operation or room client connected to.
            @method Photon.LoadBalancing.Actor#getRoom
            @returns {Photon.LoadBalancing.Room} Actor's room.
        */
        public getRoom() { return this.loadBalancingClient.myRoom(); }

        /** 
            @summary Raises game custom event.
            @method Photon.LoadBalancing.Actor#raiseEvent
            @param {number} eventCode Identifies this type of event (and the content). Your game's event codes can start with 0.
            @param {object} [data] Custom data you want to send along (use null, if none).
            @param {object} [options] Additional options
            @property {object} options Additional options
            @property {number} [options.interestGroup] The ID of the interest group this event goes to (exclusively).
            @property {Photon.LoadBalancing.Constants.EventCaching} [options.cache=EventCaching.DoNotCache] Events can be cached (merged and removed) for players joining later on.
            @property {Photon.LoadBalancing.Constants.ReceiverGroup} [options.receivers=ReceiverGroup.Others] Defines to which group of players the event is passed on.
            @property {number[]} [options.targetActors] Defines the target players who should receive the event (use only for small target groups).
            @property {boolean} [options.webForward=false] Forward to web hook.
        */
        public raiseEvent(eventCode: number, data?: any, options?: { interestGroup?: number; cache?: number; receivers?: number; targetActors?: number[]; webForward?: boolean; }) {
            if (this.loadBalancingClient) {
                this.loadBalancingClient.raiseEvent(eventCode, data, options);
            }
        }

        /** 
            @summary Sets actor name.
            @method Photon.LoadBalancing.Actor#setName
            @param {string} name Actor name.
        */
        public setName(name: string) { this.name = name; }

        // properties methods

        /** 
            @summary Called on every actor properties update: properties set by client, poperties update from server.
            Override to update custom room state.
            @method Photon.LoadBalancing.Actor#onPropertiesChange
            @param {object} changedCustomProps Key-value map of changed properties.
            @param {boolean} [byClient] true if properties set by client.
        */
        public onPropertiesChange(changedCustomProps: any, byClient?: boolean) { }

        /** 
            @summary Returns custom property by name.
            @method Photon.LoadBalancing.Actor#getCustomProperty
            @param {string} name Name of the property.
            @returns {object} Property or undefined if property not found.
        */
        public getCustomProperty(name: string) { return this.customProperties[name]; }

        /** 
            @summary Returns custom property by name or default value.
            @method Photon.LoadBalancing.Actor#getCustomPropertyOrElse
            @param {string} name Name of the property.
            @param {object} defaultValue Default property value.
            @returns {object} Property or default value if property not found.
        */
        public getCustomPropertyOrElse(name: string, defaultValue: any) { return Exitgames.Common.Util.getPropertyOrElse(this.customProperties, name, defaultValue); }

        /** 
            @summary Sets custom property.
            @method Photon.LoadBalancing.Actor#setCustomProperty
            @param {string} name Name of the property.
            @param {object} value Property value.
        */
        public setCustomProperty(name: string, value: any) {
            this.customProperties[name] = value;
            var props = {};
            props[name] = value;
            if (this.loadBalancingClient && this.loadBalancingClient.isJoinedToRoom()) {
                this.loadBalancingClient._setPropertiesOfActor(this.actorNr, props);
            }
            this.onPropertiesChange(props, true);
        }

        /** 
            @summary Sets custom properties.
            @method Photon.LoadBalancing.Actor#setCustomProperties
            @param {object} properties Table of properties to set.
        */
        public setCustomProperties(properties: {}) {
            var props = {};
            for (var name in properties) {
                this.customProperties[name] = properties[name];
                props[name] = properties[name];
            }
            if (this.loadBalancingClient && this.loadBalancingClient.isJoinedToRoom()) {
                this.loadBalancingClient._setPropertiesOfActor(this.actorNr, props);
            }
            this.onPropertiesChange(props, true);
        }

        /** 
            @summary For local actor, returns join token automatically saved after last room join.
            @method Photon.LoadBalancing.Actor#getJoinToken
            @returns {string} Join token.
        */
        public getJoinToken(): string {
            return this.joinToken;
        }

        /**
            @summary Returns true if actor is in suspended state.
            @returns {boolean} Actor suspend state.
        **/
        public isSuspended(): boolean {
            return this.suspended;
        }

        _getAllProperties() {
            var p = {};
            p[Constants.ActorProperties.PlayerName] = this.name;
            for (var k in this.customProperties) {
                p[k] = this.customProperties[k];
            }
            return p;
        }


        public _setLBC(lbc: LoadBalancingClient) { this.loadBalancingClient = lbc; }

        private customProperties = {};
        private joinToken: string;
        private loadBalancingClient: LoadBalancingClient;
        private suspended: boolean = false;

        _updateFromResponse(vals: {}) {
            this.actorNr = vals[Constants.ParameterCode.ActorNr];
            var props = vals[Constants.ParameterCode.PlayerProperties];
            if (props !== undefined) {
                var name = props[Constants.ActorProperties.PlayerName];
                if (name !== undefined) {
                    this.name = name;
                }
                this._updateCustomProperties(props);
            }
        }

        _updateMyActorFromResponse(vals: {}) {
            this.actorNr = vals[Constants.ParameterCode.ActorNr];
            this.joinToken = this.actorNr ? this.actorNr.toString() : null; //TODO: token is actorId currently
        }

        _updateCustomProperties(vals: {}) {
            for (var p in vals) {
                this.customProperties[p] = vals[p];
            }
            this.onPropertiesChange(vals, false);
        }

        _setSuspended(s: boolean) {
            this.suspended = s;
        }

        static _getActorNrFromResponse(vals: {}) {
            return vals[Constants.ParameterCode.ActorNr];
        }
    }

    // readonly room info from server
    export class RoomInfo {

        // standard room properties
        // TODO: access via getters

        /** 
            @summary Room name.
            @member Photon.LoadBalancing.RoomInfo#name
            @type {string}
            @readonly
        */
        public name = "";

        /** 
            @summary Joined room Game server address.
            @member Photon.LoadBalancing.RoomInfo#address
            @type {string}
            @readonly
        */
        public address = "";

        /** 
            @summary Max players before room is considered full.
            @member Photon.LoadBalancing.RoomInfo#maxPlayers
            @type {number}
            @readonly
        */
        public maxPlayers = 0;

        /** 
            @summary Shows the room in the lobby's room list. Makes sense only for local room.
            @member Photon.LoadBalancing.RoomInfo#isVisible
            @type {boolean}
            @readonly
        */
        public isVisible = true;

        /** 
            @summary Defines if this room can be joined.
            @member Photon.LoadBalancing.RoomInfo#isOpen
            @type {boolean}
            @readonly
        */
        public isOpen = true;

        /** 
            @summary Count of player currently in room.
            @member Photon.LoadBalancing.RoomInfo#playerCount
            @type {number}
            @readonly
        */
        public playerCount = 0;

        /** 
            @summary Time in ms indicating how long the room instance will be keeped alive in the server room cache after all clients have left the room.
            @member Photon.LoadBalancing.RoomInfo#emptyRoomLiveTime
            @type {number}
            @readonly
        */
        public emptyRoomLiveTime = 0;

        /**
            @summary Time in ms indicating how long suspended player will be kept in the room.
            @member Photon.LoadBalancing.RoomInfo#emptyRoomLiveTime
            @type {number}
            @readonly
        **/
        public suspendedPlayerLiveTime = 0;

        public uniqueUserId = false;
        /**
            @summary Room removed (in room list updates).
            @member Photon.LoadBalancing.RoomInfo#removed
            @type {boolean}
            @readonly
        */
        public removed = false;

        // TODO: does end user need this?
        private cleanupCacheOnLeave = false;

        // custom properties
        public _customProperties = {};
        public _propsListedInLobby: string[] = [];

        /** 
            @summary Called on every room properties update: room creation, properties set by client, poperties update from server.
            Override to update custom room state.
            @method Photon.LoadBalancing.RoomInfo#onPropertiesChange
            @param {object} changedCustomProps Key-value map of changed properties.
            @param {boolean} [byClient] true if called on room creation or properties set by client.
        */
        public onPropertiesChange(changedCustomProps: any, byClient?: boolean) { }
        /** 
            @summary Returns custom property by name.
            @method Photon.LoadBalancing.RoomInfo#getCustomProperty
            @param {string} name Name of the property.
            @returns {object} Property or undefined if property not found.
        */
        public getCustomProperty(prop: string) { return this._customProperties[prop]; }
        /** 
            @summary Returns custom property by name or default value.
            @method Photon.LoadBalancing.RoomInfo#getCustomPropertyOrElse
            @param {string} name Name of the property.
            @param {object} defaultValue Default property value.
            @returns {object} Property or default value if property not found.
        */
        public getCustomPropertyOrElse(prop: string, defaultValue: any) { return Exitgames.Common.Util.getPropertyOrElse(this._customProperties, prop, defaultValue) }
        /**
            @classdesc Used for Room listings of the lobby (not yet joining). Offers the basic info about a room: name, player counts, properties, etc.
            @constructor Photon.LoadBalancing.RoomInfo
            @param {string} name Room name.
        */
        constructor(name: string) {
            this.name = name;
        }

        public _updateFromMasterResponse(vals: any) {
            this.address = vals[Constants.ParameterCode.Address];
            var name = vals[Constants.ParameterCode.RoomName];
            if (name) {
                this.name = name;
            }
        }

        public _updateFromProps(props: Object, customProps: Object = null) {
            if (props) {
                this.maxPlayers = this.updateIfExists(this.maxPlayers, Constants.GameProperties.MaxPlayers, props);
                this.isVisible = this.updateIfExists(this.isVisible, Constants.GameProperties.IsVisible, props);
                this.isOpen = this.updateIfExists(this.isOpen, Constants.GameProperties.IsOpen, props);
                this.playerCount = this.updateIfExists(this.playerCount, Constants.GameProperties.PlayerCount, props);
                this.removed = this.updateIfExists(this.removed, Constants.GameProperties.Removed, props);
                this._propsListedInLobby = this.updateIfExists(this._propsListedInLobby, Constants.GameProperties.PropsListedInLobby, props);
                this.cleanupCacheOnLeave = this.updateIfExists(this.cleanupCacheOnLeave, Constants.GameProperties.CleanupCacheOnLeave, props);
                var changedProps = {};
                if (customProps === null) {
                    customProps = props;
                }
                for (var k in customProps) {
                    if (parseInt(k).toString() != k) {// if key is not a number
                        if (this._customProperties[k] !== customProps[k]) {
                            this._customProperties[k] = customProps[k];
                            changedProps[k] = customProps[k];
                        }
                    }
                }
                this.onPropertiesChange(changedProps, false);
            }
        }

        private updateIfExists(prevValue: any, code: number, props: any) {
            if (props.hasOwnProperty(code)) {
                return props[code];
            }
            else {
                return prevValue;
            }
        }
    }

    // joined room with writable properties
    export class Room extends RoomInfo {
        /**
            @classdesc Represents a room client joins or is joined to. Extend to implement custom logic. Custom properties can be set via setCustomProperty() while being in the room.
            @mixes Photon.LoadBalancing.RoomInfo
            @constructor Photon.LoadBalancing.Room
            @param {string} name Room name.
        */
        constructor(name: string) { super(name) }
        // room created from client via factory always has this field set
        //public getLoadBalancingClient() { return this.loadBalancingClient; }
        /** 
            @summary Sets custom property 
            @method Photon.LoadBalancing.Room#setCustomProperty
            @param {string} name Name of the property.
            @param {object} value Property value.
            @param {boolean} [webForward=false] Forward to web hook.
        */
        public setCustomProperty(name: string, value: any, webForward: boolean = false) {
            this._customProperties[name] = value;
            var props = {};
            props[name] = value;
            if (this.loadBalancingClient && this.loadBalancingClient.isJoinedToRoom()) {
                this.loadBalancingClient._setPropertiesOfRoom(props, webForward);
            }
            this.onPropertiesChange(props, true);
        }

        /** 
            @summary Sets custom property 
            @method Photon.LoadBalancing.Room#setCustomProperty
            @param {object} properties Table of properties to set.
            @param {boolean} [webForward=false] Forward to web hook.
        */
        public setCustomProperties(properties: {}, webForward: boolean = false) {
            var props = {};
            for (var name in properties) {
                this._customProperties[name] = properties[name];
                props[name] = properties[name];
            }
            if (this.loadBalancingClient && this.loadBalancingClient.isJoinedToRoom()) {
                this.loadBalancingClient._setPropertiesOfRoom(props, webForward);
            }
            this.onPropertiesChange(props, true);
        }

        private setProp(name: number, value: any) {
            if (this.loadBalancingClient && this.loadBalancingClient.isJoinedToRoom()) {
                var props = {};
                props[name] = value;
                this.loadBalancingClient._setPropertiesOfRoom(props);
            }
        }

        /** 
         * @summary Sets rooms visibility in the lobby's room list.
         * @method Photon.LoadBalancing.Room#setIsOpen
         * @param {boolean} isVisible New visibility value.
        */
        public setIsVisible(isVisible: boolean) {

            if (this.isVisible != isVisible) {
                this.isVisible = isVisible;
                this.setProp(Constants.GameProperties.IsVisible, isVisible);
            }
        }

        /** 
         * @summary Sets if this room can be joined.
         * @method Photon.LoadBalancing.Room#setIsOpen
         * @param {boolean} isOpen New property value.
        */
        public setIsOpen(isOpen: boolean) {
            if (this.isOpen == !isOpen) {
                this.isOpen = isOpen;
                this.setProp(Constants.GameProperties.IsOpen, isOpen);
            }
        }

        /** 
         * @summary Sets max players before room is considered full.
         * @method Photon.LoadBalancing.Room#setMaxPlayers
         * @param {number} maxPlayers New max players value.
        */
        public setMaxPlayers(maxPlayers: number) {
            if (this.maxPlayers != maxPlayers) {
                this.maxPlayers = maxPlayers;
                this.setProp(Constants.GameProperties.MaxPlayers, maxPlayers);
            }
        }

        /** 
         * @summary Sets room live time in the server room cache after all clients have left the room.
         * @method Photon.LoadBalancing.Room#setEmptyRoomLiveTime
         * @param {number} emptyRoomLiveTime New live time value in ms.
        */
        public setEmptyRoomLiveTime(emptyRoomLiveTime: number) {
            this.emptyRoomLiveTime = emptyRoomLiveTime;
        }

        /** 
         * @summary Sets time in ms indicating how long suspended player will be kept in the room.
         * @method Photon.LoadBalancing.Room#setSuspendedPlayerLiveTime
         * @param {number} suspendedPlayerLiveTime New live time value in ms.
        */
        public setSuspendedPlayerLiveTime(suspendedPlayerLiveTime: number) {
            this.suspendedPlayerLiveTime = suspendedPlayerLiveTime;
        }

        /** 
         * @summary  activates user id checks on joining if set to true.
         * @method Photon.LoadBalancing.Room#setUniqueUserId
         * @param {boolean} unique New property value.
        */
        public setUniqueUserId(unique: boolean) {
            this.uniqueUserId = unique;
        }

        /** 
            @summary Sets list of the room properties to pass to the RoomInfo list in a lobby.
            @method Photon.LoadBalancing.Room#setPropsListedInLobby
            @param {string[]} props Array of properties names.
        */
        public setPropsListedInLobby(props: string[]) {
            this._propsListedInLobby = props;
        }

        private loadBalancingClient: LoadBalancingClient;

        public _setLBC(lbc: LoadBalancingClient) { this.loadBalancingClient = lbc; }

    }

    export class LoadBalancingClient {

        static JoinMode = {
            Default: 0,
            CreateIfNotExists: 1,
            Rejoin: 2,
        }

        // override to handle system events:

        /** 
            @summary Called on client state change. Override to handle it.
            @method Photon.LoadBalancing.LoadBalancingClient#onStateChange
            @param {Photon.LoadBalancing.LoadBalancingClient.State} state New client state.
        */
        onStateChange(state: number) { }

        /** 
            @summary Called if client error occures. Override to handle it.
            @method Photon.LoadBalancing.LoadBalancingClient#onError
            @param {Photon.LoadBalancing.LoadBalancingClient.PeerErrorCode} errorCode Client error code.
            @param {string} errorMsg Error message.
        */
        onError(errorCode: number, errorMsg: string) { this.logger.error("Load Balancing Client Error", errorCode, errorMsg); }

        /** 
            @summary Called on operation response. Override if need custom workflow or response error handling.
            @method Photon.LoadBalancing.LoadBalancingClient#onOperationResponse
            @param {number} errorCode Server error code.
            @param {string} errorMsg Error message.
            @param {number} code Operation code.
            @param {object} content Operation response content.
        */
        onOperationResponse(errorCode: number, errorMsg: string, code: number, content: any) { }

        /** 
            @summary Called on custom event. Override to handle it.
            @method Photon.LoadBalancing.LoadBalancingClient#onEvent
            @param {number} code Event code.
            @param {object} content Event content.
            @param {number} actorNr Actor ID event raised by.
        */
        onEvent(code: number, content: any, actorNr: number) { }

        /** 
            @summary Called on room list received from Master server (on connection). Override to handle it.
            @method Photon.LoadBalancing.LoadBalancingClient#onRoomList
            @param {{@link Photon.LoadBalancing.RoomInfo}[]} rooms Room list.
        */
        onRoomList(rooms: RoomInfo[]) { }

        /** 
            @summary Called on room list updates received from Master server. Override to handle it.
            @method Photon.LoadBalancing.LoadBalancingClient#onRoomListUpdate
            @param {{@link Photon.LoadBalancing.RoomInfo}[]} rooms Updated room list.
            @param {{@link Photon.LoadBalancing.RoomInfo}[]} roomsUpdated Rooms whose properties were changed.
            @param {{@link Photon.LoadBalancing.RoomInfo}[]} roomsAdded New rooms in list.
            @param {{@link Photon.LoadBalancing.RoomInfo}[]} roomsRemoved Rooms removed from list.
        */
        onRoomListUpdate(rooms: RoomInfo[], roomsUpdated: RoomInfo[], roomsAdded: RoomInfo[], roomsRemoved: RoomInfo[]) { }

        // TODO: move to Room? Or remove and use Room.onPropertiesChange only?

        /** 
            @summary Called on joined room properties changed event. Override to handle it.
            @method Photon.LoadBalancing.LoadBalancingClient#onMyRoomPropertiesChange
        */
        onMyRoomPropertiesChange() { }

        /** 
            @summary Called on actor properties changed event. Override to handle it.
            @method Photon.LoadBalancing.LoadBalancingClient#onActorPropertiesChange
            @param {Photon.LoadBalancing.Actor} actor Actor whose properties were changed.
        */
        onActorPropertiesChange(actor: Actor) { }

        /** 
            @summary Called when client joins room. Override to handle it.
            @method Photon.LoadBalancing.LoadBalancingClient#onJoinRoom
            @param {boolean} createdByMe True if room is created by client.
        */
        onJoinRoom(createdByMe: boolean) { }

        /** 
            @summary Called when new actor joins the room client joined to. Override to handle it.
            @method Photon.LoadBalancing.LoadBalancingClient#onActorJoin
            @param {Photon.LoadBalancing.Actor} actor New actor.
        */
        onActorJoin(actor: Actor) { }

        /** 
            @summary Called when actor leaves the room client joined to. Also called for every actor during room cleanup. Override to handle it.
            @method Photon.LoadBalancing.LoadBalancingClient#onActorLeave
            @param {Photon.LoadBalancing.Actor} actor Actor left the room.
            @param {boolean} cleanup True if called during room cleanup (e.g. on disconnect).
        */
        onActorLeave(actor: Actor, cleanup: boolean) { }

        /** 
            @summary Called when actor suspended in the room client joined to.Override to handle it.
            @method Photon.LoadBalancing.LoadBalancingClient#onActorSuspend
            @param {Photon.LoadBalancing.Actor} actor Actor suspended in the room.
        */
        onActorSuspend(actor: Actor) { }

        /** 
            @summary Called when {@link Photon.LoadBalancing.LoadBalancingClient#findFriends findFriends} request completed. <br/>
            Override to handle request results.
            @method Photon.LoadBalancing.LoadBalancingClient#onFindFriendsResult
            @param {number} errorCode Result error code. 0 if request is successful.
            @param {string} errorMsg Error message.
            @param {object} friends Table with actors names as keys and friend statuses as values: {name1: friendStatus1, name2: friendStatus2, ... }.
            @property {object} friendStatus Friend status.
            @property {boolean} friendStatus.online Online status.
            @property {string} friendStatus.roomId Joined room.
        */
        onFindFriendsResult(errorCode: number, errorMsg: string, friends: any) { }

        /** 
            @summary Called when lobbies statistics update received. <br/>        
            Update can be automated by set up during {@link Photon.LoadBalancing.LoadBalancingClient#connect connect} or requested explicitly by {@link Photon.LoadBalancing.LoadBalancingClient#requestLobbyStats requestLobbyStats}. <br/>
            Override to handle request results.
            @method Photon.LoadBalancing.LoadBalancingClient#onLobbyStats
            @param {number} errorCode Result error code. 0 if request is successful. For automated updates is always 0.
            @param {string} errorMsg Error message. For automated updates is always empty.
            @param {object[]} lobbies Array of lobbies statistics: [lobbyStats1, lobbyStats1, ... ].
            @property {object} lobbyStats Lobby statistics.
            @property {string} lobbyStats.lobbyName Lobby name.
            @property {number} lobbyStats.lobbyType Lobby type.
            @property {number} lobbyStats.peerCount The number of players in the lobby (on Master, not playing).
            @property {number} lobbyStats.gameCount The number of games in the lobby.
        */
        onLobbyStats(errorCode: number, errorMsg: string, lobbies: any[]) { }

        /** 
            @summary Called when application statistics update received. <br/>
            Override to handle request results.
            @method Photon.LoadBalancing.LoadBalancingClient#onAppStats
            @param {number} errorCode Result error code. Currently is always 0.
            @param {string} errorMsg Error message. Currently is always empty.
            @param {object} stats Application statistics.
            @property {object} stats Application statistics.
            @property {number} stats.peerCount Count of players currently online on Game servers.
            @property {number} stats.masterPeerCount Count of players on Master server (looking for game).
            @property {number} stats.gameCount Count of games currently in use (includes invisible and full rooms, so it doesn't match lobby list).
        */
        onAppStats(errorCode: number, errorMsg: string, stats: any) { }

        /**
            @summary Called when {@link Photon.LoadBalancing.LoadBalancingClient#getRegions getRegions} request completed.<br/>
            Override to handle request results.
            @param {number} errorCode Result error code. 0 if request is successful.
            @param {string} errorMsg Error message.
            @param {object} regions Object with region codes as keys and Master servers addresses as values
        */

        onGetRegionsResult(errorCode: number, errorMsg: string, regions: {}) { }
        /**
            Called when {@link Photon.LoadBalancing.LoadBalancingClient#webRpc webRpc} request completed.<br/>
            Override to handle request results.
            @param {number} errorCode Result error code. 0 if request is successful.
            @param {string} message Error message if errorCode ~ = 0 or optional message returned by remote procedure.
            @param {string} uriPath Request path.
            @param {number} resultCode Result code returned by remote procedure.
            @param {object} data Data returned by remote procedure.
        **/
        onWebRpcResult(errorCode: number, message: string, uriPath: string, resultCode: number, data: any) { }

        /** 
            @summary Override with creation of custom room (extended from Room): { return new CustomRoom(...); }
            @method Photon.LoadBalancing.LoadBalancingClient#roomFactory
            @param {string} name Room name. Pass to super() in custom actor constructor.
        */
        public roomFactory(name: string) { return new Room(name); }
        /** 
            @summary Override with creation of custom actor (extended from Actor): { return new CustomActor(...); }
            @method Photon.LoadBalancing.LoadBalancingClient#actorFactory
            @param {string} name Actor name. Pass to super() in custom room constructor.
            @param {number} actorNr Actor ID. Pass to super() in custom room constructor.
            @param {boolean} isLocal Actor is local. Pass to super() in custom room constructor.
        */
        public actorFactory(name: string, actorNr: number, isLocal: boolean) { return new Actor(name, actorNr, isLocal); }

        //------------------------

        /** 
            @summary Returns local actor.
            Client always has local actor even if not joined.
            @method Photon.LoadBalancing.LoadBalancingClient#myActor
            @returns {Photon.LoadBalancing.Actor} Local actor.
        */
        public myActor(): Actor { return this._myActor; }

        /** 
            @summary Returns client's room.
            Client always has it's room even if not joined. It's used for room creation operation.
            @method Photon.LoadBalancing.LoadBalancingClient#myRoom
            @returns {Photon.LoadBalancing.Room} Current room.
        */
        public myRoom(): Room { return this.currentRoom; }

        /** 
            @summary Returns actors in room client currently joined including local actor.
            @method Photon.LoadBalancing.LoadBalancingClient#myRoomActors
            @returns {object} actorNr -> {@link Photon.LoadBalancing.Actor} map of actors in room.
        */
        public myRoomActors() { return this.actors; }

        /** 
            @summary Returns numer of actors in room client currently joined including local actor.
            @method Photon.LoadBalancing.LoadBalancingClient#myRoomActorCount
            @returns {number} Number of actors.
        */
        public myRoomActorCount() { return this.actorsArray.length; }
        public myRoomActorsArray() { return this.actorsArray; } // actors 'at index' access support (Scirra/Costruct 2)        

        private roomFactoryInternal(name: string = "") {
            var r = this.roomFactory(name);
            r._setLBC(this);
            return r;
        }
        private actorFactoryInternal(name: string = "", actorNr = -1, isLocal = false) {
            var a = this.actorFactory(name, actorNr, isLocal);
            a._setLBC(this);
            return a;
        }

        /**
            @classdesc Implements the Photon LoadBalancing workflow. This class should be extended to handle system or custom events and operation responses.
            @constructor Photon.LoadBalancing.LoadBalancingClient
            @param {Photon.ConnectionProtocol} protocol Connecton protocol.
            @param {string} appId Cloud application ID.
            @param {string} appVersion Cloud application version.
        */
        constructor(protocol: number, private appId: string, private appVersion: string) {
            var serverAddress = "";
            if (typeof (protocol) == "number") {
                this.connectionProtocol = protocol;
                switch (protocol) {
                    case ConnectionProtocol.Ws:
                        this.masterServerAddress = "ws://app-eu.exitgamescloud.com:9090";
                        this.nameServerAddress = "ws://ns.exitgames.com:9093";
                        break;
                    case ConnectionProtocol.Wss:
                        this.masterServerAddress = "wss://app-eu.exitgamescloud.com:19090";
                        this.nameServerAddress = "wss://ns.exitgames.com:19093";
                        break;
                    default:
                        var s0 = "wrong_protocol_error";
                        this.masterServerAddress = s0;
                        this.nameServerAddress = s0;
                        this.logger.error("Wrong protocol: ", protocol);
                        break;
                }
            }
            else if (typeof (protocol) == "string") { // compatibility with previous constructor version
                this.connectionProtocol = ConnectionProtocol.Ws;
                var s : any = protocol;
                this.masterServerAddress = s;
                this.nameServerAddress = s;
            }
            else {
                this.connectionProtocol = ConnectionProtocol.Ws;
                var s1 = "wrong_protocol_type_error";
                this.masterServerAddress = s1;
                this.nameServerAddress = s1;
                this.logger.error("Wrong protocol type: ", typeof (protocol));
            }

            this.initValidNextState();
            this.currentRoom = this.roomFactoryInternal("");
            this._myActor = this.actorFactoryInternal("", -1, true);
            this.addActor(this._myActor)
        }

        /**
            @summary Changes default NameServer address and port before connecting to NameServer.
            @method Photon.LoadBalancing.LoadBalancingClient#setNameServerAddress
            @param {string} address New address and port.
        */
        public setNameServerAddress(address: string): void {
            this.nameServerAddress = address;
        }
        /**
            @summary Returns current NameServer address.
            @method Photon.LoadBalancing.LoadBalancingClient#getNameServerAddress
            @returns {string} NameServer address address.
        */
        public getNameServerAddress(): string {
            return this.nameServerAddress;
        }


        /**
            @summary Changes default Master server address and port before connecting to Master server.
            @method Photon.LoadBalancing.LoadBalancingClient#setMasterServerAddress
            @param {string} address New address and port.
        */
        public setMasterServerAddress(address: string): void {
            this.masterServerAddress = address;
        }
        /**
            @summary Returns current Master server address.
            @method Photon.LoadBalancing.LoadBalancingClient#getMasterServerAddress
            @returns {string} Master server address.
        */
        public getMasterServerAddress(): string {
            return this.nameServerAddress;
        }

        /**
            @summary Sets optional user id(required by some cloud services)
            @method Photon.LoadBalancing.LoadBalancingClient#setUserId
            @param {string} userId New user id.
        */
        public setUserId(userId: string): void {
            this.userId = userId;
        }

        /**
            @summary Returns previously set user id.
            @method Photon.LoadBalancing.LoadBalancingClient#getUserId
            @returns {string} User id.
        */
        public getUserId(): string {
	        return this.userId
        }
        /**
            @summary Enables custom authentication and sets it's parameters.
            @method Photon.LoadBalancing.LoadBalancingClient#setCustomAuthentication
            @param {string} authParameters This string must contain any (http get) parameters expected by the used authentication service.
            @param {Photon.LoadBalancing.Constants.CustomAuthenticationType} [authType=Photon.LoadBalancing.Constants.CustomAuthenticationType.Custom] The type of custom authentication provider that should be used.
            @param {string} authData The data to be passed-on to the auth service via POST.
        */
        public setCustomAuthentication(authParameters: string, authType: number = Photon.LoadBalancing.Constants.CustomAuthenticationType.Custom, authData?: string) {
            this.userAuthType = authType;
            this.userAuthParameters = authParameters;
            this.userAuthData = authData;
        }

        // TODO: remove backward compatibility (deprecated)
        /** 
            @summary Starts connection to Master server.
            @method Photon.LoadBalancing.LoadBalancingClient#connect
            @param {object} [options] Additional options
            @property {object} options Additional options
            @property {boolean} [options.keepMasterConnection=false] Don't disconnect from Master server after joining room.
            @property {string} [options.lobbyName] Name of the lobby connect to.
            @property {Photon.LoadBalancing.Constants.LobbyType} [options.lobbyType=LobbyType.Default] Type of the lobby.
            @property {boolean} [options.lobbyStats=false] If true, Master server will be sending lobbies statistics periodically.<br/> Override {@link Photon.LoadBalancing.LoadBalancingClient#onLobbyStats onLobbyStats} to handle request results.<br/>Alternatively, {@link Photon.LoadBalancing.LoadBalancingClient#requestLobbyStats requestLobbyStats} can be used.
            @returns {boolean} True if current client state allows connection.
        */
        public connect(options?: { keepMasterConnection?: boolean; lobbyName?: string; lobbyType?: number; lobbyStats?: boolean }): boolean {

            // backward compatibility
            if (typeof (options) === "boolean") {
                if (options) {
                    options = { keepMasterConnection: true };
                }
                else {
                    options = { keepMasterConnection: false };
                }
            }
            //

            if (!options) {
                options = {};
            }

            if (this.checkNextState(LoadBalancingClient.State.ConnectingToMasterserver, true)) {
                this.changeState(LoadBalancingClient.State.ConnectingToMasterserver);
                this.logger.info("Connecting to Master", this.masterServerAddress);
                // make options copy to protect
                this.connectOptions = {};
                for (var k in options) this.connectOptions[k] = options[k];

                this.masterPeer = new MasterPeer(this, addProtocolPrefix(this.masterServerAddress, this.connectionProtocol), "");
                this.initMasterPeer(this.masterPeer);
                this.masterPeer.connect();
                return true;
            }
            else {
                return false;
            }
        }
        /**
            @summary Starts connection to NameServer.
            @method Photon.LoadBalancing.LoadBalancingClient#connectToNameServer
            @param {object} [options] Additional options
        */
        public connectToNameServer(options?: {/*internal*/region?: string }): boolean {
            if (!options) {
                options = {};
            }

            if (this.checkNextState(LoadBalancingClient.State.ConnectingToNameServer, true)) {
                this.changeState(LoadBalancingClient.State.ConnectingToNameServer);
                this.logger.info("Connecting to NameServer", this.nameServerAddress);
                // make options copy to protect
                this.connectOptions = {};
                for (var k in options) this.connectOptions[k] = options[k];

                this.nameServerPeer = new NameServerPeer(this, addProtocolPrefix(this.nameServerAddress, this.connectionProtocol), "");
                this.initNameServerPeer(this.nameServerPeer);
                this.nameServerPeer.connect();
                return true;
            }
            else {
                return false;
            }
        }

        private fillCreateRoomOptions(op: {}[], options: CreateRoomOptions) {
            options = options || {};
            var gp = {};
            if (options.isVisible !== undefined) gp[Constants.GameProperties.IsVisible] = options.isVisible;
            if (options.isOpen !== undefined) gp[Constants.GameProperties.IsOpen] = options.isOpen;
            if (options.maxPlayers !== undefined) gp[Constants.GameProperties.MaxPlayers] = options.maxPlayers;

            if (options.propsListedInLobby !== undefined) gp[Constants.GameProperties.PropsListedInLobby] = options.propsListedInLobby;

            if (options.customGameProperties !== undefined) {
                for (var p in options.customGameProperties) {
                    gp[p] = options.customGameProperties[p];
                }
            }
            op.push(Constants.ParameterCode.GameProperties, gp);
            op.push(Constants.ParameterCode.CleanupCacheOnLeave, true); //TODO: make this optional?
            op.push(Constants.ParameterCode.Broadcast, true); //TODO: make this optional?
            if (options.emptyRoomLiveTime !== undefined) op.push(Constants.ParameterCode.EmptyRoomTTL, options.emptyRoomLiveTime);
            if (options.suspendedPlayerLiveTime !== undefined) op.push(Constants.ParameterCode.PlayerTTL, options.suspendedPlayerLiveTime);
            if (options.uniqueUserId !== undefined) op.push(Constants.ParameterCode.CheckUserOnJoin, options.uniqueUserId);
            if (options.lobbyName) {
                op.push(Constants.ParameterCode.LobbyName);
                op.push(options.lobbyName);
                if (options.lobbyType != undefined) {
                    op.push(Constants.ParameterCode.LobbyType);
                    op.push(options.lobbyType);
                }
            }

        }
        /** 
            @summary Creates a new room on the server (or fails when the name is already taken). Takes parameters (except name) for new room from myRoom() object. Set them before call.
            @method Photon.LoadBalancing.LoadBalancingClient#createRoomFromMy
            @param {string} [roomName] New room name. Assigned automatically by server if empty or not specified.
            @param {object} [options] Additional options
            @property {object} options Additional options
            @property {string} [options.lobbyName] Name of the lobby to create room in.
            @property {Photon.LoadBalancing.Constants.LobbyType} [options.lobbyType=LobbyType.Default] Type of the lobby.
        */
        public createRoomFromMy(roomName?: string, options?: CreateRoomOptions) {
            options = options || {};
            this.currentRoom.name = roomName ? roomName : "";
            //retrieve options from my room
            options.isVisible = this.currentRoom.isVisible;
            options.isOpen = this.currentRoom.isOpen;
            options.maxPlayers = this.currentRoom.maxPlayers;
            options.customGameProperties = this.currentRoom._customProperties;
	        options.propsListedInLobby = this.currentRoom._propsListedInLobby;
	        options.emptyRoomLiveTime = this.currentRoom.emptyRoomLiveTime;
	        options.suspendedPlayerLiveTime = this.currentRoom.suspendedPlayerLiveTime;
	        options.uniqueUserId = this.currentRoom.uniqueUserId;

            return this.createRoomInternal(this.masterPeer, options);
        }

        /** 
            @summary Creates a new room on the server (or fails when the name is already taken).
            @method Photon.LoadBalancing.LoadBalancingClient#createRoom
            @param {string} [roomName] The name to create a room with. Must be unique and not in use or can't be created. If not specified or null, the server will assign a GUID as name.
            @param {object} [options] Additional options
            @property {object} options Additional options
            @property {boolean} [options.isVisible=true] Shows the room in the lobby's room list.
            @property {boolean} [options.isOpen=true] Keeps players from joining the room (or opens it to everyone).
            @property {number} [options.maxPlayers=0] Max players before room is considered full (but still listed).
            @property {object} [options.customGameProperties] Custom properties to apply to the room on creation (use string-typed keys but short ones).
            @property {string[]} [options.propsListedInLobby] Defines the custom room properties that get listed in the lobby.
            @property {number} [options.emptyRoomLiveTime=0] Room live time (ms) in the server room cache after all clients have left the room.
            @property {number} [options.suspendedPlayerLiveTime=0] Player live time (ms) in the room after player suspended.
            @property {number} [options.uniqueUserId=false] Allowing a users to be only once in the room.
            @property {string} [options.lobbyName] Name of the lobby to create room in.
            @property {Photon.LoadBalancing.Constants.LobbyType} [options.lobbyType=LobbyType.Default] Type of the lobby.

        */
        public createRoom(roomName?: string, options?: { isVisible?: boolean; isOpen?: boolean; maxPlayers?: number; customGameProperties?: any; propsListedInLobby?: string[]; emptyRoomLiveTime?: number; suspendedPlayerLiveTime?: number; lobbyName?: string; lobbyType?: number; }) {

            this.currentRoom = this.roomFactoryInternal(roomName ? roomName : "");
            return this.createRoomInternal(this.masterPeer, options);
        }

        /** 
            @summary Joins a room by name and sets this player's properties.
            @method Photon.LoadBalancing.LoadBalancingClient#joinRoom
            @param {string} roomName The name of the room to join. Must be existing already, open and non-full or can't be joined.
            @param {object} [options] Additional options
            @property {object} options Additional options
            @property {string} [options.joinToken=null] Try to rejoin with given token. Set to {@link Photon.LoadBalancing.Actor#getJoinToken myActor().getJoinToken()} to use last automatically saved token.
            @property {boolean} [options.createIfNotExists=false] Create room if not exists.
            @param {object} [createOptions] Room options for creation
            @property {object} createOptions Room options for creation
            @property {boolean} [createOptions.isVisible=true] Shows the room in the lobby's room list.
            @property {boolean} [createOptions.isOpen=true] Keeps players from joining the room (or opens it to everyone).
            @property {number} [createOptions.maxPlayers=0] Max players before room is considered full (but still listed).
            @property {object} [createOptions.customGameProperties] Custom properties to apply to the room on creation (use string-typed keys but short ones).
            @property {string[]} [createOptions.propsListedInLobby] Defines the custom room properties that get listed in the lobby.
            @property {number} [createOptions.emptyRoomLiveTime=0] Room live time (ms) in the server room cache after all clients have left the room.
            @property {number} [createOptions.suspendedPlayerLiveTime=0] Player live time (ms) in the room after player suspended.
            @property {number} [createOptions.uniqueUserId=false] Allowing a users to be only once in the room.
            @property {string} [createOptions.lobbyName=""] Name of the lobby to create room in.
            @property {Photon.LoadBalancing.Constants.LobbyType} [createOptions.lobbyType=LobbyType.Default] Type of the lobby.

        */
        public joinRoom(roomName: string, options?: JoinRoomOptions, createOptions?: CreateRoomOptions): boolean {
            var op = [];
            if (options) {
                if (options.createIfNotExists) {
                    op.push(Constants.ParameterCode.JoinMode, LoadBalancingClient.JoinMode.CreateIfNotExists);
                    this.fillCreateRoomOptions(op, createOptions);
                }
                if (options.joinToken) {
                    // token is int (actorNr) currently
                    op.push(Constants.ParameterCode.ActorNr, parseInt(options.joinToken));
                    op.push(Constants.ParameterCode.JoinMode, LoadBalancingClient.JoinMode.Rejoin);
                }
            }

            this.currentRoom = this.roomFactoryInternal(roomName);
            op.push(Constants.ParameterCode.RoomName, roomName);

            this.joinRoomOptions = options || {};
            this.createRoomOptions = createOptions || {};

            this.logger.info("Join Room", roomName, options, createOptions, "...");

            this.masterPeer.sendOperation(Constants.OperationCode.JoinGame, op);
            return true;
        }

        /** 
            @summary Joins a random, available room. 
            This operation fails if all rooms are closed or full.
            @method Photon.LoadBalancing.LoadBalancingClient#joinRandomRoom
            @param {object} [options] Additional options
            @property {object} options Additional options
            @property {object} [options.expectedCustomRoomProperties] If specified, a room will only be joined, if it matches these custom properties. Use null to accept rooms with any properties.
            @property {number} [options.expectedMaxPlayers] If specified, filters for a particular maxPlayer setting. Use 0 to accept any maxPlayer value.
            @property {Photon.LoadBalancing.Constants.MatchmakingMode} [options.matchmakingMode=MatchmakingMode.FillRoom] Selects one of the available matchmaking algorithms.
            @property {string} [options.lobbyName] Name of the lobby to search rooms in.
            @property {Photon.LoadBalancing.Constants.LobbyType} [options.lobbyType=LobbyType.Default] Type of the lobby.
            @property {string} [options.sqlLobbyFilter] Basically the "where" clause of a sql statement. Examples: 'C0 = 1 AND C2 > 50'. 'C5 = "Map2" AND C2 > 10 AND C2 < 20'
        */
        public joinRandomRoom(options?: JoinRandomRoomOptions): boolean {
            var op = [];
            if (options) {
                if (options.matchingType != undefined && options.matchingType != Constants.MatchmakingMode.FillRoom) {
                    op.push(Constants.ParameterCode.MatchMakingType);
                    op.push(options.matchingType);
                }

                var expectedRoomProperties = {};
                var propNonEmpty = false;
                if (options.expectedCustomRoomProperties != undefined) {
                    for (var k in options.expectedCustomRoomProperties) {
                        expectedRoomProperties[k] = options.expectedCustomRoomProperties[k];
                        propNonEmpty = true;
                    }
                }
                if (options.expectedMaxPlayers != undefined && options.expectedMaxPlayers > 0) {
                    expectedRoomProperties[Constants.GameProperties.MaxPlayers] = options.expectedMaxPlayers;
                    propNonEmpty = true;
                }
                if (propNonEmpty) {
                    op.push(Constants.ParameterCode.GameProperties);
                    op.push(expectedRoomProperties);
                }
                if (options.lobbyName) {
                    op.push(Constants.ParameterCode.LobbyName);
                    op.push(options.lobbyName);
                    if (options.lobbyType != undefined) {
                        op.push(Constants.ParameterCode.LobbyType);
                        op.push(options.lobbyType);
                    }
                }

                if (options.sqlLobbyFilter) {
                    op.push(Constants.ParameterCode.Data);
                    op.push(options.sqlLobbyFilter);
                }

            }

            this.logger.info("Join Random Room", options && options.lobbyName, options && options.lobbyType, "...");
            this.masterPeer.sendOperation(Constants.OperationCode.JoinRandomGame, op);
            return true;
        }

        _setPropertiesOfRoom(properties: {}, webForward?: boolean) {
            var op = [];
            op.push(Constants.ParameterCode.Properties);
            op.push(properties);
            op.push(Constants.ParameterCode.Broadcast);
            op.push(true);
            if (webForward) {
                op.push(Constants.ParameterCode.Forward);
                op.push(true);
            }
            this.gamePeer.sendOperation(Constants.OperationCode.SetProperties, op);
        }

        _setPropertiesOfActor(actorNr: number, properties: {}) {
            var op = [];
            op.push(Constants.ParameterCode.ActorNr);
            op.push(actorNr);
            op.push(Constants.ParameterCode.Properties);
            op.push(properties);
            op.push(Constants.ParameterCode.Broadcast);
            op.push(true);

            this.gamePeer.sendOperation(Constants.OperationCode.SetProperties, op);
        }

        /** 
            @summary Disconnects from all servers.
            @method Photon.LoadBalancing.LoadBalancingClient#disconnect
        */
        public disconnect() {
            if (this.nameServerPeer) {
                this.nameServerPeer.disconnect();
            }
	        this._cleanupNameServerPeerData();
            if (this.masterPeer) {
                this.masterPeer.disconnect();
            }
            this._cleanupMasterPeerData();
            if (this.gamePeer) {
                this.gamePeer.disconnect();
            }
            this._cleanupGamePeerData();
            this.changeState(LoadBalancingClient.State.Disconnected);
        }

        /** 
            @summary Disconnects client from Game server keeping player in room (to rejoin later) and connects to Master server if not connected.
            @method Photon.LoadBalancing.LoadBalancingClient#suspendRoom
        */
        public suspendRoom() {
            if (this.isJoinedToRoom()) {
                if (this.gamePeer) {
                    this.gamePeer.disconnect();
                }
                this._cleanupGamePeerData();
                if (this.isConnectedToMaster()) {
                    this.changeState(LoadBalancingClient.State.JoinedLobby);
                }
                else {
                    this.changeState(LoadBalancingClient.State.Disconnected);
                    this.connect(this.connectOptions);
                }
            }
        }

        /** 
            @summary Leaves room and connects to Master server if not connected.
            @method Photon.LoadBalancing.LoadBalancingClient#leaveRoom
        */
        public leaveRoom() {
            if (this.isJoinedToRoom()) {
                if (this.gamePeer) {
                    this.gamePeer.sendOperation(Constants.OperationCode.Leave);
                }
                this._cleanupGamePeerData();
                if (this.isConnectedToMaster()) {
                    this.changeState(LoadBalancingClient.State.JoinedLobby);
                }
                else {
                    this.changeState(LoadBalancingClient.State.Disconnected);
                    this.connect(this.connectOptions);
                }
            }
        }

        /** 
            @summary Raises game custom event
            @method Photon.LoadBalancing.LoadBalancingClient#raiseEvent
            @param {number} eventCode Identifies this type of event (and the content). Your game's event codes can start with 0.
            @param {object} [data] Custom data you want to send along (use null, if none).
            @param {object} [options] Additional options
            @property {object} options Additional options
            @property {number} [options.interestGroup] The ID of the interest group this event goes to (exclusively).
            @property {Photon.LoadBalancing.Constants.EventCaching} [options.cache=EventCaching.DoNotCache] Events can be cached (merged and removed) for players joining later on.
            @property {Photon.LoadBalancing.Constants.ReceiverGroup} [options.receivers=ReceiverGroup.Others] Defines to which group of players the event is passed on.
            @property {number[]} [options.targetActors] Defines the target players who should receive the event (use only for small target groups).
            @property {boolean} [options.webForward=false] Forward to web hook.
        */
        public raiseEvent(eventCode: number, data?: any, options?: { interestGroup?: number; cache?: number; receivers?: number; targetActors?: number[]; webForward?: boolean; }) {
            if (this.isJoinedToRoom()) {
                this.gamePeer.raiseEvent(eventCode, data, options);
            }
        }

        /** 
            @summary Changes client's interest groups (for events in room).<br/>
			Note the difference between passing null and []: null won't add/remove any groups, [] will add/remove all (existing) groups.<br/>
            First, removing groups is executed. This way, you could leave all groups and join only the ones provided.
            @method Photon.LoadBalancing.LoadBalancingClient#changeGroups
            @param {number[]} groupsToRemove Groups to remove from interest. Null will not leave any. A [] will remove all.
            @param {number[]} groupsToAdd Groups to add to interest. Null will not add any. A [] will add all current.
        */
        public changeGroups(groupsToRemove: number[], groupsToAdd: number[]) {
            if (this.isJoinedToRoom()) {
                this.logger.debug("Group change:", groupsToRemove, groupsToAdd);
                this.gamePeer.changeGroups(groupsToRemove, groupsToAdd);
            }
        }

        /** 
            @summary Requests Master server for actors online status and joined rooms.<br/>
            Override {@link Photon.LoadBalancing.LoadBalancingClient#onFindFriendsResult onFindFriendsResult} to handle request results.
            @method Photon.LoadBalancing.LoadBalancingClient#findFriends
            @param {string[]} friendsToFind Actors names.
        **/
        public findFriends(friendsToFind: string[]) {
            if (this.isConnectedToMaster()) {
                if (friendsToFind && typeof (friendsToFind) == "object") {
                    this.findFriendsRequestList = new Array<string>();
                    for (var i = 0; i < friendsToFind.length; ++i) {
                        if (typeof (friendsToFind[i]) == "string") {
                            this.findFriendsRequestList[i] = friendsToFind[i];
                        }
                        else {
                            this.logger.error("FindFriends request error:", "Friend name is not a string", i);
                            this.onFindFriendsResult(1101, "Friend name is not a string" + " " + i, {});
                            return;
                        }
                    }
                    this.logger.debug("Find friends:", friendsToFind);
                    this.masterPeer.findFriends(this.findFriendsRequestList);
                }
                else {
                    this.logger.error("FindFriends request error:", "Parameter is not an array");
                    this.onFindFriendsResult(1101, "Parameter is not an array", {});
                }
            }
            else {
                this.logger.error("FindFriends request error:", "Not connected to Master");
                this.onFindFriendsResult(1001, "Not connected to Master", {});
            }
        }

        /** 
            @summary Requests Master server for lobbies statistics.<br/>
            Override {@link Photon.LoadBalancing.LoadBalancingClient#onLobbyStats onLobbyStats} to handle request results.<br/>
            Alternatively, automated updates can be set up during {@link Photon.LoadBalancing.LoadBalancingClient#connect connect}.
            @method Photon.LoadBalancing.LoadBalancingClient#requestLobbyStats
            @param {any[]} lobbiesToRequest Array of lobbies id pairs [ [lobbyName1, lobbyType1], [lobbyName2, lobbyType2], ... ]. If not specified or null, statistics for all lobbies requested.

        **/
        public requestLobbyStats(lobbiesToRequest?: any[][]) {
            if (this.isConnectedToMaster()) {
                this.lobbyStatsRequestList = new Array<any[]>();
                if (lobbiesToRequest) {
                    if (typeof (lobbiesToRequest) == "object") {
                        for (var i = 0; i < lobbiesToRequest.length; ++i) {
                            var l = lobbiesToRequest[i];
                            if (typeof (l) == "object") {
                                var n = l[0];
                                if (n) {
                                    var t: number;
                                    if (l[1] === undefined) {
                                        t = Constants.LobbyType.Default;
                                    }
                                    else {
                                        if (typeof (l[1]) == "number") {
                                            t = l[1];
                                        }
                                        else {
                                            this.requestLobbyStatsErr("Lobby type is invalid", i);
                                            return;
                                        }
                                    }
                                    this.lobbyStatsRequestList[i] = [n.toString(), t];
                                }
                                else {
                                    this.requestLobbyStatsErr("Lobby name is empty", i);
                                    return;
                                }
                            }
                            else {
                                this.requestLobbyStatsErr("Lobby id is not an array", i);
                                return;
                            }
                        }
                    }
                    else {
                        this.requestLobbyStatsErr("Parameter is not an array");
                        return;
                    }
                }
                this.masterPeer.requestLobbyStats(this.lobbyStatsRequestList);
            }
            else {
                this.logger.error("LobbyState request error:", "Not connected to Master");
                this.onLobbyStats(1001, "Not connected to Master", []);
            }
        }
        private requestLobbyStatsErr(m: string, other: any = "") {
            this.logger.error("LobbyState request error:", m, other);
            this.onLobbyStats(1101, m + " " + other, []);
        }

        /** 
            @summary Requests NameServer for regions list.<br/>
            Override {@link Photon.LoadBalancing.LoadBalancingClient#onGetRegionsResult onGetRegionsResult} to handle request results.<br/>
            @method Photon.LoadBalancing.LoadBalancingClient#getRegions
        **/
        public getRegions() {
            if (this.isConnectedToNameServer()) {
                this.logger.debug("GetRegions...");
		        this.nameServerPeer.getRegions(this.appId);
            }
	        else  {
                this.logger.error("GetRegions request error:", "Not connected to NameServer");
		        this.onGetRegionsResult(3001, "Not connected to NameServer", {});
	        }
        }

        /** 
            @summary Sends web rpc request to Master server.<br/ >
            Override {@link Photon.LoadBalancing.LoadBalancingClient#onWebRpcResult onWebRpcResult} to handle request results.<br/>
            @method Photon.LoadBalancing.LoadBalancingClient#webRpc
            @param {string} uriPath Request path.
            @param {object} parameters Request parameters.
        **/
        public webRpc(uriPath: string, parameters?: {}) {
            if (this.isConnectedToMaster()) {
		        this.logger.debug("WebRpc...");
		        this.masterPeer.webRpc(uriPath, parameters);
            }
	        else  {
                this.logger.error("WebRpc request error:", "Not connected to Master server");
                this.onWebRpcResult(1001, "Not connected to Master server", uriPath, 0, {});
	        }
        }

        /** 
            @summary Connects to a specific region's Master server, using the NameServer to find the IP.
            Override {@link Photon.LoadBalancing.LoadBalancingClient#onWebRpcResult onWebRpcResult} to handle request results.<br/>
            @method Photon.LoadBalancing.LoadBalancingClient#connectToRegionMaster
            @param {string} region Region connect to Master server of.
            @returns {boolean} True if current client state allows connection.
        **/
        public connectToRegionMaster(region: string) {
            if (this.isConnectedToNameServer()) {
                this.logger.debug("Connecting to Region Master", region, "...");
                this.nameServerPeer.opAuth(this.appId, this.appVersion, this.userAuthType, this.userAuthParameters, this.userAuthData, this.userId, region);
		        return true
            }
            else if (this.connectToNameServer({region: region })) {
                return true;
            }
	        else {
		        this.logger.error("Connecting to Region Master error:", "Not connected to NameServer")
		        return false
	        }
        }	

        /** 
            @summary Checks if client is connected to Master server (usually joined to lobby and receives room list updates).
            @method Photon.LoadBalancing.LoadBalancingClient#isConnectedToMaster
            @returns {boolean} True if client is connected to Master server.
        */
        public isConnectedToMaster() {
            return this.masterPeer && this.masterPeer.isConnected();
        }

        /** 
            @summary Checks if client is connected to NameServer server.
            @method Photon.LoadBalancing.LoadBalancingClient#isConnectedToNameServer
            @returns {boolean} True if client is connected to NameServer server.
        */
        public isConnectedToNameServer() {
            return this.nameServerPeer && this.nameServerPeer.isConnected();
        }

        /** 
            @summary Checks if client is in lobby and ready to join or create game.
            @method Photon.LoadBalancing.LoadBalancingClient#isInLobby
            @returns {boolean} True if client is in lobby.
        */
        public isInLobby() {
            return this.state == LoadBalancingClient.State.JoinedLobby;
        }

        /** 
            @summary Checks if client is joined to game.
            @method Photon.LoadBalancing.LoadBalancingClient#isJoinedToRoom
            @returns {boolean} True if client is joined to game.
        */
        public isJoinedToRoom() {
            return this.state == LoadBalancingClient.State.Joined;
        }

        /**
            @deprecated Use isJoinedToRoom()
        */
        public isConnectedToGame() {
            return this.isJoinedToRoom();
        }

        /** 
            @summary Current room list from Master server.
            @method Photon.LoadBalancing.LoadBalancingClient#availableRooms
            @returns {{@link Photon.LoadBalancing.RoomInfo}[]} Current room list
        */
        public availableRooms() { return this.roomInfos; }

        /** 
            @summary Sets client logger level
            @method Photon.LoadBalancing.LoadBalancingClient#setLogLevel
            @param {Exitgames.Common.Logger.Level} level Logging level.
        */
        public setLogLevel(level: number) {
            this.logger.setLevel(level);
            if (this.nameServerPeer) {
                this.nameServerPeer.setLogLevel(level);
            }
            if (this.masterPeer) {
                this.masterPeer.setLogLevel(level);
            }
            if (this.gamePeer) {
                this.gamePeer.setLogLevel(level);
            }
        }

        //------------------------

        private connectionProtocol: number; // protocol set in constructor, can be overriden by prefix in server address string
        private masterServerAddress: string;
        private nameServerAddress: string;

        private nameServerPeer: NameServerPeer;
        // protected
        public masterPeer: MasterPeer;
        private gamePeer: GamePeer;

        // protected
        public autoJoinLobby = true; // hardcoded behaviour; inheritor class can override this

        // options mainly keep state between servers
	    // set / cleared in connectToNameServer()(connectToRegionMaster()), connect()
        // lobbyName and lobbyType passed to JoinLobby operation (we don't have separate JoinLobby operation and set them in connect())
        private connectOptions: ConnectOptions = {};
        // shares lobby info between Master and Game CreateGame calls (createRoomInternal)
        private createRoomOptions: CreateRoomOptions = {};
        // shares options between Master and Game JoinGame operations
        private joinRoomOptions: JoinRoomOptions = {};

        private currentRoom: Room;
        private roomInfos = new Array<RoomInfo>();
        private roomInfosDict = {}; // 'by name' access support
        private addRoom(r: RoomInfo) { this.roomInfos.push(r); this.roomInfosDict[r.name] = r; }
        private clearRooms() { this.roomInfos = new Array<RoomInfo>(); this.roomInfosDict = {}; }
        private purgeRemovedRooms() {
            this.roomInfos = this.roomInfos.filter((x) => !x.removed);
            for (var n in this.roomInfosDict) {
                if (this.roomInfosDict[n].removed) {
                    delete this.roomInfosDict[n];
                }
            }
        }
        private _myActor: Actor;
        private actors = {};
        private actorsArray = []; // actors 'at index' access support (Scirra/Costruct 2)
        private addActor(a: Actor) { this.actors[a.actorNr] = a; this.actorsArray.push(a); this.currentRoom.playerCount = this.actorsArray.length;}
        private removeActor(actorNr: number) {
            delete this.actors[actorNr];
            this.actorsArray = this.actorsArray.filter((x) => x.actorNr != actorNr);
            this.currentRoom.playerCount = this.actorsArray.length
        }
        private clearActors() { this.actors = {}; this.actorsArray = []; this.currentRoom.playerCount = 0}

        private userId: string;
        private userAuthType = Constants.CustomAuthenticationType.None;
        private userAuthParameters = "";
        private userAuthData = "";

        private findFriendsRequestList: string[];
        private lobbyStatsRequestList: any[][] = new Array<any[]>();

        // protected
        public state = LoadBalancingClient.State.Uninitialized;
        logger = new Exitgames.Common.Logger("LoadBalancingClient");

        private changeState(nextState: number) {
            this.logger.info("State:", LoadBalancingClient.StateToName(this.state), "->", LoadBalancingClient.StateToName(nextState));
            this.state = nextState;
            this.onStateChange(nextState);
        }

        private createRoomInternal(peer: PhotonPeer, options: CreateRoomOptions) {
            var op = [];
            if (this.currentRoom.name) op.push(Constants.ParameterCode.RoomName, this.currentRoom.name);
            this.fillCreateRoomOptions(op, options);

            if (peer === this.masterPeer) {
                this.createRoomOptions = options;
            }

            if (peer === this.gamePeer) {
                op.push(Constants.ParameterCode.PlayerProperties);
                op.push(this._myActor._getAllProperties());
            }

            var log: Exitgames.Common.Logger = peer == this.gamePeer ? this.gamePeer._logger : this.masterPeer._logger;
            log.info("Create Room", options && options.lobbyName, options && options.lobbyType, "...");

            peer.sendOperation(Constants.OperationCode.CreateGame, op);
        }

        private initNameServerPeer(np: NameServerPeer) {
            np.setLogLevel(this.logger.getLevel());

            // errors
            np.addPeerStatusListener(PhotonPeer.StatusCodes.error, () => {
                this.changeState(LoadBalancingClient.State.Error);
                this.onError(LoadBalancingClient.PeerErrorCode.NameServerError, "NameServer peer error");
            });
            np.addPeerStatusListener(PhotonPeer.StatusCodes.connectFailed, () => {
                this.changeState(LoadBalancingClient.State.Error);
                this.onError(LoadBalancingClient.PeerErrorCode.NameServerConnectFailed, "NameServer peer connect failed. " + this.nameServerAddress);
            });
            np.addPeerStatusListener(PhotonPeer.StatusCodes.timeout, () => {
                this.changeState(LoadBalancingClient.State.Error);
                this.onError(LoadBalancingClient.PeerErrorCode.NameServerTimeout, "NameServer peer timeout");
            });
            np.addPeerStatusListener(PhotonPeer.StatusCodes.connecting, () => {
            });
            np.addPeerStatusListener(PhotonPeer.StatusCodes.connect, () => {
                np._logger.info("Connected");
                this.changeState(LoadBalancingClient.State.ConnectedToNameServer);
                // connectToRegionMaster inited connection
                if (this.connectOptions.region != undefined) {
                    np.opAuth(this.appId, this.appVersion, this.userAuthType, this.userAuthParameters, this.userAuthData, this.userId, this.connectOptions.region);
		        }
            });

            np.addPeerStatusListener(PhotonPeer.StatusCodes.disconnect, () => {
                if (np == this.nameServerPeer) { // skip delayed disconnect response
                    this._cleanupNameServerPeerData();
                    np._logger.info("Disconnected");
		        }
            });

            np.addPeerStatusListener(PhotonPeer.StatusCodes.connectClosed, () => {
                np._logger.info("Server closed connection");
                this.changeState(LoadBalancingClient.State.Error);
                this.onError(LoadBalancingClient.PeerErrorCode.NameServerConnectClosed, "NameServer server closed connection");
            })

            // events
            // responses - check operation result. data.errCode
            np.addResponseListener(Constants.OperationCode.GetRegions, (data) => {
                np._logger.debug("resp GetRegions", data);
		        var regions = {};
                if (data.errCode == 0) {
                    var r = data.vals[Constants.ParameterCode.Region];
                    var a = data.vals[Constants.ParameterCode.Address];
                    for (var i in r) {
                        regions[r[i]] = a[i];
                    }
                }
                else {
                    np._logger.error("GetRegions request error.", data.errCode);
		        }
                this.onGetRegionsResult(data.errCode, data.errMsg, regions);
	        })

            np.addResponseListener(Constants.OperationCode.Authenticate, (data) => {
                np._logger.debug("resp Authenticate", data);
                if (data.errCode == 0) {
                    np._logger.info("Authenticated");
                    np.disconnect();
                    this.masterServerAddress = data.vals[Constants.ParameterCode.Address];
                    np._logger.info("Connecting to Master server", this.masterServerAddress, "...");
                    this.connect({userAuthSecret: data.vals[Constants.ParameterCode.Secret] });
                }
                else {
                    this.changeState(LoadBalancingClient.State.Error);
                    this.onError(LoadBalancingClient.PeerErrorCode.NameServerAuthenticationFailed, "NameServer authentication failed");
                }
            })

        }

        // protected
        public initMasterPeer(mp: Photon.LoadBalancing.MasterPeer) {
            mp.setLogLevel(this.logger.getLevel());

            // errors
            mp.addPeerStatusListener(PhotonPeer.StatusCodes.error, () => {
                this.changeState(LoadBalancingClient.State.Error);
                this.onError(LoadBalancingClient.PeerErrorCode.MasterError, "Master peer error");
            });
            mp.addPeerStatusListener(PhotonPeer.StatusCodes.connectFailed, () => {
                this.changeState(LoadBalancingClient.State.Error);
                this.onError(LoadBalancingClient.PeerErrorCode.MasterConnectFailed, "Master peer connect failed: " + this.masterServerAddress);
            });
            mp.addPeerStatusListener(PhotonPeer.StatusCodes.timeout, () => {
                this.changeState(LoadBalancingClient.State.Error);
                this.onError(LoadBalancingClient.PeerErrorCode.MasterTimeout, "Master peer error timeout");
            });
            mp.addPeerStatusListener(PhotonPeer.StatusCodes.connecting, () => {
            });

            // status
            mp.addPeerStatusListener(PhotonPeer.StatusCodes.connect, () => {
                //TODO: encryption phase
                mp._logger.info("Connected");
                var op = [];
                // if NameSever gave us secret
                if (this.connectOptions.userAuthSecret) {
                    op.push(Constants.ParameterCode.Secret, this.connectOptions.userAuthSecret);
                    mp.sendOperation(Constants.OperationCode.Authenticate, op);
                    mp._logger.info("Authenticate with secret...");
                }
                else {
                    op.push(Constants.ParameterCode.ApplicationId);
                    op.push(this.appId);
                    op.push(Constants.ParameterCode.AppVersion);
                    op.push(this.appVersion);
                    if (this.userAuthType != Constants.CustomAuthenticationType.None) {
                        op.push(Constants.ParameterCode.ClientAuthenticationType, this.userAuthType);
                        op.push(Constants.ParameterCode.ClientAuthenticationParams, this.userAuthParameters);
                        if (this.userAuthData) {
                            op.push(Constants.ParameterCode.ClientAuthenticationData, this.userAuthData);
                        }
                    }
                    if (this.userId) {
                        op.push(Constants.ParameterCode.UserId, this.userId);
                    }
                    if (this.connectOptions.lobbyStats) {
                        op.push(Constants.ParameterCode.LobbyStats, true);
                    }
                    mp.sendOperation(Constants.OperationCode.Authenticate, op);
                    mp._logger.info("Authenticate...");
                }
            });
            mp.addPeerStatusListener(PhotonPeer.StatusCodes.disconnect, () => {
                if (mp == this.masterPeer) { // skip delayed disconnect response
                    this._cleanupMasterPeerData();
                    mp._logger.info("Disconnected");
                }
            });
            mp.addPeerStatusListener(PhotonPeer.StatusCodes.connectClosed, () => {
                mp._logger.info("Server closed connection");
                this.changeState(LoadBalancingClient.State.Error);
                this.onError(LoadBalancingClient.PeerErrorCode.MasterConnectClosed, "Master server closed connection");
            });
            //events
            mp.addEventListener(Constants.EventCode.GameList, (data) => {
                var gameList: Object = data.vals[Constants.ParameterCode.GameList];
                this.clearRooms();
                for (var g in gameList) {
                    var r = new RoomInfo(g);
                    r._updateFromProps(gameList[g]);
                    this.addRoom(r);

                }
                this.onRoomList(this.roomInfos);
                mp._logger.debug("ev GameList", this.roomInfos, gameList);

            });
            mp.addEventListener(Constants.EventCode.GameListUpdate, (data) => {
                var gameList: Object = data.vals[Constants.ParameterCode.GameList];
                var roomsUpdated = new Array<RoomInfo>();
                var roomsAdded = new Array<RoomInfo>();
                var roomsRemoved = new Array<RoomInfo>();
                for (var g in gameList) {
                    var exist = this.roomInfos.filter((x) => x.name == g);
                    if (exist.length > 0) {
                        var r = exist[0];
                        r._updateFromProps(gameList[g]);
                        if (r.removed) {
                            roomsRemoved.push(r);
                        }
                        else {
                            roomsUpdated.push(r);
                        }
                    }
                    else {
                        var ri = new RoomInfo(g);
                        ri._updateFromProps(gameList[g]);
                        this.addRoom(ri);
                        roomsAdded.push(r);
                    }
                }
                this.purgeRemovedRooms();               
                this.onRoomListUpdate(this.roomInfos, roomsUpdated, roomsAdded, roomsRemoved);
                mp._logger.debug("ev GameListUpdate:", this.roomInfos, "u:", roomsUpdated, "a:", roomsAdded, "r:", roomsRemoved, gameList);

            });

            // responses - check operation result: data.errCode
            mp.addResponseListener(Constants.OperationCode.Authenticate, (data) => {
                mp._logger.debug("resp Authenticate", data);
                if (!data.errCode) {
                    mp._logger.info("Authenticated");
                    if (data.vals[Constants.ParameterCode.Secret] != undefined) {
                        this.connectOptions.userAuthSecret = data.vals[Constants.ParameterCode.Secret];
                    }
                    this.changeState(LoadBalancingClient.State.ConnectedToMaster);
                    var op = [];
                    if (this.connectOptions.lobbyName) {
                        op.push(Constants.ParameterCode.LobbyName);
                        op.push(this.connectOptions.lobbyName);
                        if (this.connectOptions.lobbyType != undefined) {
                            op.push(Constants.ParameterCode.LobbyType);
                            op.push(this.connectOptions.lobbyType);
                        }
                    }
                    if (this.autoJoinLobby) {
                        mp.sendOperation(Constants.OperationCode.JoinLobby, op);
                        mp._logger.info("Join Lobby", this.connectOptions.lobbyName, this.connectOptions.lobbyType, "...");
                    }
                }
                else {
                    this.changeState(LoadBalancingClient.State.Error);
                    this.onError(LoadBalancingClient.PeerErrorCode.MasterAuthenticationFailed, "Master authentication failed");
                }
            });
            mp.addResponseListener(Constants.OperationCode.JoinLobby, (data) => {
                mp._logger.debug("resp JoinLobby", data);
                if (!data.errCode) {
                    mp._logger.info("Joined to Lobby");
                    this.changeState(LoadBalancingClient.State.JoinedLobby);
                }
                this._onOperationResponseInternal2(Constants.OperationCode.JoinLobby, data);
            });
            mp.addResponseListener(Constants.OperationCode.CreateGame, (data) => {
                mp._logger.debug("resp CreateGame", data);
                if (!data.errCode) {
                    this.currentRoom._updateFromMasterResponse(data.vals);
                    mp._logger.debug("Created/Joined " + this.currentRoom.name);
                    this.connectToGameServer(Constants.OperationCode.CreateGame);
                }

                this._onOperationResponseInternal2(Constants.OperationCode.CreateGame, data);
            });
            mp.addResponseListener(Constants.OperationCode.JoinGame, (data) => {
                mp._logger.debug("resp JoinGame", data);
                if (!data.errCode) {
                    this.currentRoom._updateFromMasterResponse(data.vals);
                    mp._logger.debug("Joined " + this.currentRoom.name);
                    this.connectToGameServer(Constants.OperationCode.JoinGame);
                }

                this._onOperationResponseInternal2(Constants.OperationCode.JoinGame, data);
            });
            mp.addResponseListener(Constants.OperationCode.JoinRandomGame, (data) => {
                mp._logger.debug("resp JoinRandomGame", data);
                if (!data.errCode) {
                    this.currentRoom._updateFromMasterResponse(data.vals);
                    mp._logger.debug("Joined " + this.currentRoom.name);
                    this.connectToGameServer(Constants.OperationCode.JoinRandomGame);
                }

                this._onOperationResponseInternal2(Constants.OperationCode.JoinRandomGame, data);
            });

            mp.addResponseListener(Constants.OperationCode.FindFriends, (data) => {
                mp._logger.debug("resp FindFriends", data);
                var res = {};
                if (!data.errCode) {
                    var onlines = data.vals[Constants.ParameterCode.FindFriendsResponseOnlineList] || {};
                    var roomIds = data.vals[Constants.ParameterCode.FindFriendsResponseRoomIdList] || {};
                    for (var i = 0; i < this.findFriendsRequestList.length; ++i) {
                        var name = this.findFriendsRequestList[i];
                        if (name) {
                            res[name] = { online: onlines[i], roomId: roomIds[i] };
                        }
                    }
                }
                else {
                    mp._logger.error("FindFriends request error:", data.errCode);
                }
                this.onFindFriendsResult(data.errCode, data.errMsg, res);
            });

            mp.addResponseListener(Constants.OperationCode.LobbyStats, (data) => {
                mp._logger.debug("resp LobbyStats", data);
                var res = new Array<any>();
                if (!data.errCode) {
                    var names = data.vals[Constants.ParameterCode.LobbyName]; // not inited intentionally
                    var types = data.vals[Constants.ParameterCode.LobbyType] || {};
                    var peers = data.vals[Constants.ParameterCode.PeerCount] || {};
                    var games = data.vals[Constants.ParameterCode.GameCount] || {};

                    if (names) {
                        for (var i = 0; i < names.length; ++i) {
                            res[i] = { lobbyName: names[i], lobbyType: types[i], peerCount: peers[i], gameCount: games[i] };
                        }
                    }
                    else {
                        for (var i = 0; i < this.lobbyStatsRequestList.length; ++i) {
                            var l = this.lobbyStatsRequestList[i];
                            res[i] = { lobbyName: l[0], lobbyType: l[1], peerCount: peers[i], gameCount: games[i] };
                        }
                    }
                }
                else {
                    mp._logger.error("LobbyStats request error:", data.errCode);
                }
                this.onLobbyStats(data.errCode, data.errMsg, res);
            });
            mp.addEventListener(Constants.EventCode.LobbyStats, (data) => {
                mp._logger.debug("ev LobbyStats", data);
                var res = new Array<any>();
                var names = data.vals[Constants.ParameterCode.LobbyName]; // not inited intentionally
                var types = data.vals[Constants.ParameterCode.LobbyType] || {};
                var peers = data.vals[Constants.ParameterCode.PeerCount] || {};
                var games = data.vals[Constants.ParameterCode.GameCount] || {};

                if (names) {
                    for (var i = 0; i < names.length; ++i) {
                        res[i] = { lobbyName: names[i], lobbyType: types[i], peerCount: peers[i], gameCount: games[i] };
                    }
                }

                this.onLobbyStats(0, "", res);
            });
            mp.addEventListener(Constants.EventCode.AppStats, (data) => {
                mp._logger.debug("ev AppStats", data);
                var res = {
                    peerCount: data.vals[Constants.ParameterCode.PeerCount],
                    masterPeerCount: data.vals[Constants.ParameterCode.MasterPeerCount],
                    gameCount: data.vals[Constants.ParameterCode.GameCount]
                }
                this.onAppStats(0, "", res);
            });
            mp.addResponseListener(Constants.OperationCode.Rpc, (d) => {
                mp._logger.debug("resp Rpc", d);
                var uriPath, message, data, resultCode;
                if (d.errCode == 0) {
                    uriPath = d.vals[Constants.ParameterCode.UriPath];
                    data = d.vals[Constants.ParameterCode.RpcCallRetData];
                    resultCode = d.vals[Constants.ParameterCode.RpcCallRetCode];
                }
                else {
                    mp._logger.error("WebRpc request error:", d.errCode);
                }
                this.onWebRpcResult(d.errCode, d.errMsg, uriPath, resultCode, data);
            });
        }

        private connectToGameServer(masterOpCode: number): boolean {
            if (!this.connectOptions.keepMasterConnection) {
                this.masterPeer.disconnect();
            }
            if (this.checkNextState(LoadBalancingClient.State.ConnectingToGameserver, true)) {
                this.logger.info("Connecting to Game", this.currentRoom.address);
                this.gamePeer = new GamePeer(this, addProtocolPrefix(this.currentRoom.address, this.connectionProtocol), "");
                this.initGamePeer(this.gamePeer, masterOpCode);
                this.gamePeer.connect();
                this.changeState(LoadBalancingClient.State.ConnectingToGameserver);
                return true;
            }
            else {
                return false;
            }
        }
        private initGamePeer(gp: GamePeer, masterOpCode: number) {
            gp.setLogLevel(this.logger.getLevel());

            // errors
            gp.addPeerStatusListener(PhotonPeer.StatusCodes.error, () => {
                this.changeState(LoadBalancingClient.State.Error);
                this.onError(LoadBalancingClient.PeerErrorCode.GameError, "Game peer error");
            });
            gp.addPeerStatusListener(PhotonPeer.StatusCodes.connectFailed, () => {
                this.changeState(LoadBalancingClient.State.Error);
                this.onError(LoadBalancingClient.PeerErrorCode.GameConnectFailed, "Game peer connect failed: " + this.currentRoom.address);
            });
            gp.addPeerStatusListener(PhotonPeer.StatusCodes.timeout, () => {
                this.changeState(LoadBalancingClient.State.Error);
                this.onError(LoadBalancingClient.PeerErrorCode.GameTimeout, "Game peer timeout");
            });

            // status
            gp.addPeerStatusListener(PhotonPeer.StatusCodes.connect, () => {
                gp._logger.info("Connected");
                //TODO: encryption phase
                var op = [];
                op.push(Constants.ParameterCode.ApplicationId);
                op.push(this.appId);
                op.push(Constants.ParameterCode.AppVersion);
                op.push(this.appVersion);
                if (this.connectOptions.userAuthSecret != undefined) { // may be w / o userAuthType
                    op.push(Constants.ParameterCode.Secret);
                    op.push(this.connectOptions.userAuthSecret);
                }
                if (this.userAuthType != Constants.CustomAuthenticationType.None) {
                    op.push(Constants.ParameterCode.ClientAuthenticationType);
                    op.push(this.userAuthType);                    
                }
                if (this.userId) {
                    op.push(Constants.ParameterCode.UserId, this.userId);
                }
                gp.sendOperation(Constants.OperationCode.Authenticate, op);
                gp._logger.info("Authenticate...");
            });
            gp.addPeerStatusListener(PhotonPeer.StatusCodes.disconnect, () => {
                if (gp == this.gamePeer) { // skip delayed disconnect response
                    this._cleanupGamePeerData();
                    gp._logger.info("Disconnected");
		        }                
            });
            gp.addPeerStatusListener(PhotonPeer.StatusCodes.connectClosed, () => {
                gp._logger.info("Server closed connection");
                this.changeState(LoadBalancingClient.State.Error);
                this.onError(LoadBalancingClient.PeerErrorCode.MasterConnectClosed, "Game server closed connection");
            });

            // responses
            gp.addResponseListener(Constants.OperationCode.Authenticate, (data) => {
                gp._logger.debug("resp Authenticate", data);
                if (!data.errCode) {
                    gp._logger.info("Authenticated");
                    gp._logger.info("Connected");
                    if (masterOpCode == Constants.OperationCode.CreateGame) {
                        this.createRoomInternal(gp, this.createRoomOptions);
                    }
                    else {
                        var op = [];
                        op.push(Constants.ParameterCode.RoomName);
                        op.push(this.currentRoom.name);

                        op.push(Constants.ParameterCode.Broadcast);
                        op.push(true);

                        op.push(Constants.ParameterCode.PlayerProperties);
                        op.push(this._myActor._getAllProperties());
                        if (masterOpCode == Constants.OperationCode.JoinGame) {
                            if (this.joinRoomOptions.createIfNotExists) {
                                op.push(Constants.ParameterCode.JoinMode, LoadBalancingClient.JoinMode.CreateIfNotExists);
                                this.fillCreateRoomOptions(op, this.createRoomOptions)
                            }
                            if (this.joinRoomOptions.joinToken) {
                                op.push(Constants.ParameterCode.ActorNr, parseInt(this.joinRoomOptions.joinToken));                               
                                op.push(Constants.ParameterCode.JoinMode, LoadBalancingClient.JoinMode.Rejoin);
                            }
                        }
                        gp.sendOperation(Constants.OperationCode.JoinGame, op);
                    }
                    this.changeState(LoadBalancingClient.State.ConnectedToGameserver);
                }
                else {
                    this.changeState(LoadBalancingClient.State.Error);
                    this.onError(LoadBalancingClient.PeerErrorCode.GameAuthenticationFailed, "Game authentication failed");
                }
            });
            gp.addResponseListener(Constants.OperationCode.CreateGame, (data) => {
                gp._logger.debug("resp CreateGame", data);
                if (!data.errCode) {
                    this._myActor._updateMyActorFromResponse(data.vals);
                    gp._logger.info("myActor: ", this._myActor);
                    this.currentRoom._updateFromProps(data.vals[Constants.ParameterCode.GameProperties]);

                    this.clearActors();
                    this.addActor(this._myActor);

                    this.changeState(LoadBalancingClient.State.Joined);
                    this.onJoinRoom(true);
                }

                this._onOperationResponseInternal2(Constants.OperationCode.CreateGame, data);
            });
            gp.addResponseListener(Constants.OperationCode.JoinGame, (data) => {
                gp._logger.debug("resp JoinGame", data);
                if (!data.errCode) {
                    this._myActor._updateMyActorFromResponse(data.vals);
                    gp._logger.info("myActor: ", this._myActor);

                    this.clearActors();
                    this.addActor(this._myActor);
                    
                    var actorList = data.vals[Constants.ParameterCode.ActorList]
                    var actorProps = data.vals[Constants.ParameterCode.PlayerProperties]
        			if (actorList !== undefined) {
                        for (var i in actorList) {
                            var actorNr = actorList[i];
                            var props: {};
                            if (actorProps !== undefined)
                                props = actorProps[actorNr];
                            var name: string;
                            if (props !== undefined) {
                                name = props[Constants.ActorProperties.PlayerName];
					        }
                            var a: Actor;
                            if (actorNr == this._myActor.actorNr)
                                a = this._myActor;
                            else {
                                a = this.actorFactoryInternal(name, actorNr);
                                this.addActor(a);
                            }
                            if (props !== undefined) {
                                a._updateCustomProperties(props)
					        }					        
				        }
                    }

                    this.currentRoom._updateFromProps(data.vals[Constants.ParameterCode.GameProperties]);
                    this.changeState(LoadBalancingClient.State.Joined);
                    this.onJoinRoom(false);
                }

                this._onOperationResponseInternal2(Constants.OperationCode.JoinGame, data);
            });
            gp.addResponseListener(Constants.OperationCode.SetProperties, (data) => {
                gp._logger.debug("resp SetProperties", data);
                //                if (!data.errCode) { }

                this._onOperationResponseInternal2(Constants.OperationCode.SetProperties, data);
            });

            // events
            gp.addEventListener(Constants.EventCode.Join, (data) => {
                gp._logger.debug("ev Join", data);
                if (Actor._getActorNrFromResponse(data.vals) === this._myActor.actorNr) {
                    //this._myActor._updateMyActorFromResponse(data.vals);
                    this._myActor._updateFromResponse(data.vals);
//                    this.addActor(this._myActor);
                }
                else {
                    var actor = this.actorFactoryInternal();
                    actor._updateFromResponse(data.vals);
                    this.addActor(actor);
                    this.onActorJoin(actor);
                }
            });
            gp.addEventListener(Constants.EventCode.Leave, (data) => {
                gp._logger.debug("ev Leave", data);
                var actorNr = Actor._getActorNrFromResponse(data.vals);
                if (actorNr && this.actors[actorNr]) {
                    var a = this.actors[actorNr];
                    if (data.vals[Constants.ParameterCode.IsInactive]) {
                        a._setSuspended(true);
                        this.onActorSuspend(a);
                    }
                    else {
                        this.removeActor(actorNr);
                        this.onActorLeave(a, false);
                    }
                }
            });
            gp.addEventListener(Constants.EventCode.Disconnect, (data) => {
                gp._logger.debug("ev Disconnect", data);
                var actorNr = Actor._getActorNrFromResponse(data.vals);
                if (actorNr && this.actors[actorNr]) {
                    var a = this.actors[actorNr];
                    a._setSuspended(true);
                    this.onActorSuspend(a);
                }
            });
            gp.addEventListener(Constants.EventCode.PropertiesChanged, (data) => {
                gp._logger.debug("ev PropertiesChanged", data);
                var targetActorNr = data.vals[Constants.ParameterCode.TargetActorNr];
                if (targetActorNr !== undefined && targetActorNr > 0) {
                    if (this.actors[targetActorNr] !== undefined) {
                        var actor = this.actors[targetActorNr];
                        actor._updateCustomProperties(data.vals[Constants.ParameterCode.Properties]);
                        this.onActorPropertiesChange(actor);
                    }
                }
                else {
                    this.currentRoom._updateFromProps(data.vals, data.vals[Constants.ParameterCode.Properties]);
                    this.onMyRoomPropertiesChange();
                }
            });
        }

        private _cleanupNameServerPeerData() {
        }

        private _cleanupMasterPeerData() {
        }

        private _cleanupGamePeerData() {
            for (var i in this.actors) {
				this.onActorLeave(this.actors[i], true);
			}
            this.clearActors();
			this.addActor(this._myActor);
        }

        private _onOperationResponseInternal2(code: number, data: any) {
            this.onOperationResponse(data.errCode, data.errMsg, code, data.vals);
        }

        private validNextState = {};
        //TODO: ugly way to init const table
        private initValidNextState() {
            this.validNextState[LoadBalancingClient.State.Error] = [LoadBalancingClient.State.ConnectingToMasterserver, LoadBalancingClient.State.ConnectingToNameServer];
            this.validNextState[LoadBalancingClient.State.Uninitialized] = [LoadBalancingClient.State.ConnectingToMasterserver, LoadBalancingClient.State.ConnectingToNameServer];
            this.validNextState[LoadBalancingClient.State.ConnectedToNameServer] = [LoadBalancingClient.State.ConnectingToMasterserver];
            this.validNextState[LoadBalancingClient.State.Disconnected] = [LoadBalancingClient.State.ConnectingToMasterserver, LoadBalancingClient.State.ConnectingToNameServer];
            this.validNextState[LoadBalancingClient.State.ConnectedToMaster] = [LoadBalancingClient.State.JoinedLobby];
            this.validNextState[LoadBalancingClient.State.JoinedLobby] = [LoadBalancingClient.State.ConnectingToGameserver];
            this.validNextState[LoadBalancingClient.State.ConnectingToGameserver] = [LoadBalancingClient.State.ConnectedToGameserver];
            this.validNextState[LoadBalancingClient.State.ConnectedToGameserver] = [LoadBalancingClient.State.Joined];
        }
        private checkNextState(nextState: number, dontThrow: boolean = false) {
            var valid: number[] = this.validNextState[this.state];
            var res = valid && valid.indexOf(nextState) >= 0;
            if (!res) {
                if (dontThrow) {
                    this.logger.error("LoadBalancingPeer checkNextState fail: " + LoadBalancingClient.StateToName(this.state) + " -> " + LoadBalancingClient.StateToName(nextState));

                }
                else {
                    throw new Error("LoadBalancingPeer checkNextState fail: " + LoadBalancingClient.StateToName(this.state) + " -> " + LoadBalancingClient.StateToName(nextState));
                }
            }
            return res;
        }

        // tsc looses all comments after first static member 
        // jsdoc reads comments from any place within class (and may be from any place in file)
        public static PeerErrorCode = {
        /**
            @summary Enum for client peers error codes.
            @member Photon.LoadBalancing.LoadBalancingClient.PeerErrorCode
            @readonly
            @property {number} Ok No Error.
            @property {number} MasterError General Master server peer error.
            @property {number} MasterConnectFailed Master server connection error.
            @property {number} MasterConnectClosed Disconnected from Master server.
            @property {number} MasterTimeout Disconnected from Master server for timeout.
            @property {number} MasterEncryptionEstablishError Master server encryption establishing failed.
            @property {number} MasterAuthenticationFailed Master server authentication failed.
            @property {number} GameError General Game server peer error.
            @property {number} GameConnectFailed Game server connection error.
            @property {number} GameConnectClosed Disconnected from Game server.
            @property {number} GameTimeout Disconnected from Game server for timeout.
            @property {number} GameEncryptionEstablishError Game server encryption establishing failed.
            @property {number} GameAuthenticationFailed Game server authentication failed.
            @property {number} NameServerError General NameServer peer error.
            @property {number} NameServerConnectFailed NameServer connection error.
            @property {number} NameServerConnectClosed Disconnected from NameServer.
            @property {number} NameServerTimeout Disconnected from NameServer for timeout.
            @property {number} NameServerEncryptionEstablishError NameServer encryption establishing failed.
            @property {number} NameServerAuthenticationFailed NameServer authentication failed.
         */
            
            Ok: 0,                     
            MasterError: 1001,                     
            MasterConnectFailed: 1002,             
            MasterConnectClosed: 1003,             
            MasterTimeout: 1004,                   
            MasterEncryptionEstablishError: 1005,  
            MasterAuthenticationFailed: 1101,      
            GameError: 2001,                       
            GameConnectFailed: 2002,               
            GameConnectClosed: 2003,               
            GameTimeout: 2004,                     
            GameEncryptionEstablishError: 2005,  	
            GameAuthenticationFailed: 2101,        
            NameServerError: 3001,                 
            NameServerConnectFailed: 3002,         
            NameServerConnectClosed: 3003,         
            NameServerTimeout: 3004,               
            NameServerEncryptionEstablishError: 300,
            NameServerAuthenticationFailed: 3101,  
        };
        public static State = {
        /**
            @summary Enum for client states.
            @member Photon.LoadBalancing.LoadBalancingClient.State
            @readonly
            @property {number} Error Critical error occurred.
            @property {number} Uninitialized Client is created but not used yet.
            @property {number} ConnectingToNameServer Connecting to NameServer.
            @property {number} ConnectedToNameServer Connected to NameServer.
            @property {number} ConnectingToMasterserver Connecting to Master (includes connect, authenticate and joining the lobby).
            @property {number} ConnectedToMaster Connected to Master server.
            @property {number} JoinedLobby Connected to Master and joined lobby. Display room list and join/create rooms at will.
            @property {number} ConnectingToGameserver Connecting to Game server(client will authenticate and join/create game).
            @property {number} ConnectedToGameserver Connected to Game server (going to auth and join game).
            @property {number} Joined The client joined room.
            @property {number} Disconnected The client is no longer connected (to any server). Connect to Master to go on.
        */
            Error: -1,
            Uninitialized: 0,
            ConnectingToNameServer: 1,
            ConnectedToNameServer: 2,
            ConnectingToMasterserver: 3,
            ConnectedToMaster: 4,
            JoinedLobby: 5,
            ConnectingToGameserver: 6,
            ConnectedToGameserver: 7,
            Joined: 8,
            Disconnected: 10,
        };

        /** 
            @summary Converts {@link Photon.LoadBalancing.LoadBalancingClient.State State} element to string name.
            @method Photon.LoadBalancing.LoadBalancingClient.StateToName
            @param {Photon.LoadBalancing.LoadBalancingClient.State} state Client state enum element.
            @returns {string} Specified element name or undefined if not found.
        */
        public static StateToName(value: number) { return Exitgames.Common.Util.getEnumKeyByValue(LoadBalancingClient.State, value); }

    }

    //TODO: internal
    export class NameServerPeer extends PhotonPeer {
        constructor(private client: LoadBalancingClient, url: string, subprotocol: string) { super(url, subprotocol, "NameServer") }

        // overrides
        onUnhandledEvent(code: number, args: any) {
            this.client.onEvent(code, args.vals[Constants.ParameterCode.CustomEventContent], args.vals[Constants.ParameterCode.ActorNr]);
        }
        onUnhandledResponse(code: number, args: any) {
            this.client.onOperationResponse(args.errCode, args.errMsg, code, args.vals);
        }

        getRegions(appId: string) {
            var params = [];
            params.push(Constants.ParameterCode.ApplicationId, appId);
            this.sendOperation(Constants.OperationCode.GetRegions, params, true, 0);
        }

                    // this = LBC
        opAuth(appId: string, appVersion: string, userAuthType: number, userAuthParameters: string, userAuthData: string, userId: string, region: string) {
            var op = [];
            op.push(Constants.ParameterCode.ApplicationId, appId);
            op.push(Constants.ParameterCode.AppVersion, appVersion);
            if (userAuthType != Constants.CustomAuthenticationType.None) {
                op.push(Constants.ParameterCode.ClientAuthenticationType, userAuthType);
                op.push(Constants.ParameterCode.ClientAuthenticationParams, userAuthParameters);
                if (userAuthData) {
                    op.push(Constants.ParameterCode.ClientAuthenticationData, userAuthData);
                }
            }
            if (userId) {
                op.push(Constants.ParameterCode.UserId, userId)
		        }
            //    		if (this.connectOptions.lobbyStats) {
            //    			op.push(Constants.ParameterCode.LobbyStats, true);
            //    		}
            op.push(Constants.ParameterCode.Region, region);
            this.sendOperation(Constants.OperationCode.Authenticate, op, true, 0);
            this._logger.info("Authenticate...");
        }
    }
    //TODO: internal
    export class MasterPeer extends PhotonPeer {
        constructor(private client: LoadBalancingClient, url: string, subprotocol: string) { super(url, subprotocol, "Master") }

        // overrides
        onUnhandledEvent(code: number, args: any) {
            this.client.onEvent(code, args.vals[Constants.ParameterCode.CustomEventContent], args.vals[Constants.ParameterCode.ActorNr]);
        }
        onUnhandledResponse(code: number, args: any) {
            this.client.onOperationResponse(args.errCode, args.errMsg, code, args.vals);
        }
        
        findFriends(friendsToFind: string[]) {
            var params = [];
            params.push(Constants.ParameterCode.FindFriendsRequestList);
            params.push(friendsToFind);
            this.sendOperation(Constants.OperationCode.FindFriends, params);
        }
        requestLobbyStats(lobbiesToRequest: any[][]) {
            var params = [];
            if (lobbiesToRequest && lobbiesToRequest.length > 0) {
                var n = new Array<string>();
                var t = new Array<number>();
                for (var i = 0; i < lobbiesToRequest.length; ++i) {
                    n[i] = lobbiesToRequest[i][0];
                    t[i] = lobbiesToRequest[i][1];
                }
                params.push(Constants.ParameterCode.LobbyName);
                params.push(n);
                params.push(Constants.ParameterCode.LobbyType);
                params.push(t);                
            }
            this.sendOperation(Constants.OperationCode.LobbyStats, params);
        }

        webRpc(uriPath: string, parameters: {}) {
            var params = [];
            params.push(Constants.ParameterCode.UriPath, uriPath);
            params.push(Constants.ParameterCode.RpcCallParams, parameters);
            this.sendOperation(Constants.OperationCode.Rpc, params);
        }

    }

    //TODO: internal
    export class GamePeer extends PhotonPeer {
        constructor(private client: LoadBalancingClient, url: string, subprotocol: string) {
            super(url, subprotocol, "Game");
        }

        // overrides
        onUnhandledEvent(code: number, args: any) {
            this.client.onEvent(code, args.vals[Constants.ParameterCode.CustomEventContent], args.vals[Constants.ParameterCode.ActorNr]);
        }
        // overrides
        onUnhandledResponse(code: number, args: any) {
            this.client.onOperationResponse(args.errCode, args.errMsg, code, args.vals);
        }

        raiseEvent(eventCode: number, data?: any, options?: { interestGroup?: number; cache?: number; receivers?: number; targetActors?: number[]; webForward?: boolean; }) {
            if (this.client.isJoinedToRoom()) {
                this._logger.debug("raiseEvent", eventCode, data, options);
                var params = [Constants.ParameterCode.Code, eventCode, Constants.ParameterCode.Data, data];
                if (options) {
                    if (options.receivers != undefined && options.receivers !== Constants.ReceiverGroup.Others) {
                        params.push(Constants.ParameterCode.ReceiverGroup);
                        params.push(options.receivers);
                    }
                    if (options.cache != undefined && options.cache !== Constants.EventCaching.DoNotCache) {
                        params.push(Constants.ParameterCode.Cache);
                        params.push(options.cache);
                    }
                    if (options.interestGroup != undefined) {
                        if (this.checkGroupNumber(options.interestGroup)) {
                            params.push(Constants.ParameterCode.Group);
                            params.push(options.interestGroup);
                        }
                        else {
                            throw new Error("raiseEvent - Group not a number: " + options.interestGroup);
                        }
                    }
                    if (options.targetActors != undefined) {
                        params.push(Constants.ParameterCode.ActorList);
                        params.push(options.targetActors);
                    }
                    if (options.webForward) {
                        params.push(Constants.ParameterCode.Forward);
                        params.push(true);                         
                    }
                }
                this.sendOperation(Constants.OperationCode.RaiseEvent, params);
            } else {
                throw new Error("raiseEvent - Not joined!");
            }
        }

        changeGroups(groupsToRemove: number[], groupsToAdd: number[]) {
            var params = [];
            if (groupsToRemove != null && groupsToRemove != undefined) {
                this.checkGroupArray(groupsToRemove, "groupsToRemove");
                params.push(Constants.ParameterCode.Remove);
                params.push(groupsToRemove);
            }
            if (groupsToAdd != null && groupsToAdd != undefined) {
                this.checkGroupArray(groupsToAdd, "groupsToAdd");
                params.push(Constants.ParameterCode.Add);
                params.push(groupsToAdd);
            }
            this.sendOperation(Constants.OperationCode.ChangeGroups, params);
        }
        private checkGroupNumber(g: number) {
            return !(typeof (g) != "number" || isNaN(g) || g === Infinity || g === -Infinity);
        }
        private checkGroupArray(groups: number[], groupsName) {
            if (Exitgames.Common.Util.isArray(groups)) {
                for (var i = 0; i < groups.length; ++i) {
                    var g = groups[i];
                    if (this.checkGroupNumber(g)) {
                    }
                    else {
                        throw new Error("changeGroups - " + groupsName + " (" + groups + ") not an array of numbers: element " + i + " = " + g);
                    }
                }
            }
            else {
                throw new Error("changeGroups - groupsToRemove not an array: " + groups);
            }
        }
    }


}