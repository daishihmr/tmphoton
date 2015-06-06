/**
Photon
@namespace Photon
*/
declare module Photon {
    /**
    @summary These are the options that can be used as underlying transport protocol.
    @member Photon.ConnectionProtocol
    @readonly
    @property {number} Ws WebSockets connection.
    @property {number} Wss WebSockets Secure connection.
    **/
    var ConnectionProtocol: {
        Ws: number;
        Wss: number;
    };
    class PhotonPeer {
        private url;
        private subprotocol;
        /**
        @classdesc Instances of the PhotonPeer class are used to connect to a Photon server and communicate with it.
        A PhotonPeer instance allows communication with the Photon Server, which in turn distributes messages to other PhotonPeer clients.
        An application can use more than one PhotonPeer instance, which are treated as separate users on the server.
        Each should have its own listener instance, to separate the operations, callbacks and events.
        @constructor Photon.PhotonPeer
        @param {string} url Server address:port.
        @param {string} [subprotocol=""] WebSocket protocol.
        @param {string} [debugName=""] Log messages prefixed with this value.
        */
        constructor(url: string, subprotocol?: string, debugName?: string);
        /**
        @summary Peer sends 'keep alive' message to server as this timeout exceeded after last send operation.
        Set it < 1000 to disable 'keep alive' operation
        @member Photon.PhotonPeer#keepAliveTimeoutMs
        @type {number}
        @default 5000
        */
        public keepAliveTimeoutMs: number;
        /**
        @summary Checks if peer is connecting.
        @method Photon.PhotonPeer#isConnecting
        @returns {boolean} True if peer is connecting.
        */
        public isConnecting(): boolean;
        /**
        @summary Checks if peer is connected.
        @method Photon.PhotonPeer#isConnected
        @returns {boolean} True if peer is connected.
        */
        public isConnected(): boolean;
        /**
        @summary Checks if peer is closing.
        @method Photon.PhotonPeer#isClosing
        @returns {boolean} True if peer is closing.
        */
        public isClosing(): boolean;
        /**
        @summary Starts connection to server.
        @method Photon.PhotonPeer#connect
        */
        public connect(): void;
        /**
        @summary Disconnects from server.
        @method Photon.PhotonPeer#disconnect
        */
        public disconnect(): void;
        /**
        @summary Sends operation to the Photon Server.
        @method Photon.PhotonPeer#sendOperation
        @param {number} code Code of operation.
        @param {object} [data] Parameters of operation as key-value pairs.
        @param {boolean} [sendReliable=false] Selects if the operation must be acknowledged or not. If false, the operation is not guaranteed to reach the server.
        @param {number} [channelId=0] The channel in which this operation should be sent.
        */
        public sendOperation(code: number, data?: any, sendReliable?: boolean, channelId?: number): void;
        /**
        @summary Registers listener for peer status change.
        @method Photon.PhotonPeer#addPeerStatusListener
        @param {PhotonPeer.StatusCodes} statusCode Status change to this value will be listening.
        @param {Function} callback The listener function that processes the status change. This function don't accept any parameters.
        */
        public addPeerStatusListener(statusCode: string, callback: () => void): void;
        /**
        @summary Registers listener for custom event.
        @method Photon.PhotonPeer#addEventListener
        @param {number} eventCode Custom event code.
        @param {Function} callback The listener function that processes the event. This function may accept object with event content.
        */
        public addEventListener(eventCode: number, callback: (any: any) => void): void;
        /**
        @summary Registers listener for operation response.
        @method Photon.PhotonPeer#addResponseListener
        @param {number} operationCode Operation code.
        @param {Function} callback The listener function that processes the event. This function may accept object with operation response content.
        */
        public addResponseListener(operationCode: number, callback: (any: any) => void): void;
        /**
        @summary Removes listener if exists for peer status change.
        @method Photon.PhotonPeer#removePeerStatusListener
        @param {string} statusCode One of PhotonPeer.StatusCodes to remove listener for.
        @param {Function} callback Listener to remove.
        */
        public removePeerStatusListener(statusCode: string, callback: Function): void;
        /**
        @summary Removes listener if exists for custom event.
        @method Photon.PhotonPeer#removeEventListener
        @param {number} eventCode Event code to remove to remove listener for.
        @param {Function} callback Listener to remove.
        */
        public removeEventListener(eventCode: number, callback: Function): void;
        /**
        @summary Removes listener if exists for operation response.
        @method Photon.PhotonPeer#removeResponseListener
        @param {number} operationCode Operation code to remove listener for.
        @param {Function} callback Listener to remove.
        */
        public removeResponseListener(operationCode: number, callback: Function): void;
        /**
        @summary Removes all listeners for peer status change specified.
        @method Photon.PhotonPeer#removePeerStatusListenersForCode
        @param {string} statusCode One of PhotonPeer.StatusCodes to remove all listeners for.
        */
        public removePeerStatusListenersForCode(statusCode: string): void;
        /**
        @summary Removes all listeners for custom event specified.
        @method Photon.PhotonPeer#removeEventListenersForCode
        @param {number} eventCode Event code to remove all listeners for.
        */
        public removeEventListenersForCode(eventCode: number): void;
        /**
        @summary Removes all listeners for operation response specified.
        @method Photon.PhotonPeer#removeResponseListenersForCode
        @param {number} operationCode Operation code to remove all listeners for.
        */
        public removeResponseListenersForCode(operationCode: number): void;
        /**
        @summary Sets peer logger level.
        @method Photon.PhotonPeer#setLogLevel
        @param {Exitgames.Common.Logger.Level} level Logging level.
        */
        public setLogLevel(level: number): void;
        /**
        @summary Called if no listener found for received custom event.
        Override to relay unknown event to user's code or handle known events without listener registration.
        @method Photon.PhotonPeer#onUnhandledEvent
        @param {number} eventCode Code of received event.
        @param {object} [args] Content of received event or empty object.
        */
        public onUnhandledEvent(eventCode: number, args: any): void;
        /**
        @summary Called if no listener found for received operation response event.
        Override to relay unknown response to user's code or handle known responses without listener registration.
        @method Photon.PhotonPeer#onUnhandledEvent
        @param {number} operationCode Code of received response.
        @param {object} [args] Content of received response or empty object.
        */
        public onUnhandledResponse(operationCode: number, args: any): void;
        /**
        @summary Enum for peer status codes.
        Use to subscribe to status changes.
        @member Photon.PhotonPeer.StatusCodes
        @readonly
        @property {string} connecting Is connecting to server.
        @property {string} connect Connected to server.
        @property {string} connectFailed Connection to server failed.
        @property {string} disconnect Disconnected from server.
        @property {string} connectClosed Connection closed by server.
        @property {string} error General connection error.
        @property {string} timeout Disconnected from server for timeout.
        */
        static StatusCodes: {
            connecting: string;
            connect: string;
            connectFailed: string;
            disconnect: string;
            connectClosed: string;
            error: string;
            timeout: string;
        };
        public _dispatchEvent(code: number, args: any): void;
        public _dispatchResponse(code: number, args: any): void;
        public _logger: Exitgames.Common.Logger;
        private _socket;
        private _frame;
        private _sessionid;
        private _isConnecting;
        private _isConnected;
        private _isClosing;
        private _peerStatusListeners;
        private _eventListeners;
        private _responseListeners;
        private _stringify(message);
        private _encode(messages);
        private _decode(data);
        private _onMessage(message);
        private keepAliveTimer;
        private resetKeepAlive();
        private _send(data, checkConnected?);
        private _onMessageReceived(message);
        private _parseMessageValuesArrayToJSON(vals);
        public _parseEvent(code: number, event: any): void;
        public _parseResponse(code: number, response: any): void;
        private _parseInternalResponse(code, response);
        private _onConnecting();
        private _onConnect();
        private _onConnectFailed(evt);
        private _onDisconnect();
        private _onTimeout();
        private _onError(ev);
        private _addListener(listeners, code, callback);
        private _dispatch(listeners, code, args, debugType);
        private _dispatchPeerStatus(code);
        private _removeListener(listeners, code, callback);
        private _removeListenersForCode(listeners, code);
    }
}
/**
Exitgames
@namespace Exitgames
*/
/**
Exitgames utilities
@namespace Exitgames.Common
*/
declare module Exitgames.Common {
    class Logger {
        private prefix;
        private level;
        /**
        @classdesc Logger with ability to control logging level.
        Prints messages to browser console.
        Each logging method perfoms toString() calls and default formatting of arguments only after it checks logging level. Therefore disabled level logging method call with plain arguments doesn't involves much overhead.
        But if one prefer custom formatting or some calculation for logging methods arguments he should check logging level before doing this to avoid unnecessary operations:
        if(logger.isLevelEnabled(Logger.Level.DEBUG)) {
        logger.debug("", someCall(x, y), x + "," + y);
        }
        @constructor Exitgames.Common.Logger
        @param {string} [prefix=""] All log messages will be prefixed with that.
        @param {Exitgames.Common.Logger.Level} [level=Level.INFO] Initial logging level.
        */
        constructor(prefix?: string, level?: number);
        /**
        @summary Changes current logging level.
        @method Exitgames.Common.Logger#setLevel
        @param {Exitgames.Common.Logger.Level} level New logging level.
        */
        public setLevel(level: number): void;
        /**
        @summary Checks if logging level active.
        @method Exitgames.Common.Logger#isLevelEnabled
        @param {Exitgames.Common.Logger.Level} level Level to check.
        @returns {boolean} True if level active.
        */
        public isLevelEnabled(level: number): boolean;
        /**
        @summary Returns current logging level.
        @method Exitgames.Common.Logger#getLevel
        @returns {Exitgames.Common.Logger.Level} Current logging level.
        */
        public getLevel(): number;
        /**
        @summary Logs message if logging level = DEBUG, INFO, WARN, ERROR
        @method Exitgames.Common.Logger#debug
        @param {string} mess Message to log.
        @param {...any} optionalParams For every additional parameter toString() applies and result added to the end of log message after space character.
        */
        public debug(mess: string, ...optionalParams: any[]): void;
        /**
        @summary Logs message if logging level = INFO, WARN, ERROR
        @method Exitgames.Common.Logger#info
        @param {string} mess Message to log.
        @param {...any} optionalParams For every additional parameter toString() applies and result added to the end of log message after space character.
        */
        public info(mess: string, ...optionalParams: any[]): void;
        /**
        @summary Logs message if logging level = WARN, ERROR
        @method Exitgames.Common.Logger#warn
        @param {string} mess Message to log.
        @param {...any} optionalParams For every additional parameter toString() applies and result added to the end of log message after space character.
        */
        public warn(mess: string, ...optionalParams: any[]): void;
        /**
        @summary Logs message if logging level = ERROR
        @method Exitgames.Common.Logger#error
        @param {string} mess Message to log.
        @param {...any} optionalParams For every additional parameter toString() applies and result added to the end of log message after space character.
        */
        public error(mess: string, ...optionalParams: any[]): void;
        /**
        @summary Applies default logger formatting to arguments
        @method Exitgames.Common.Logger#format
        @param {string} mess String to start formatting with.
        @param {...any} optionalParams For every additional parameter toString() applies and result added to the end of formatted string after space character.
        @returns {string} Formatted string.
        */
        public format(mess: string, ...optionalParams: any[]): string;
        /**
        @summary Applies default logger formatting to array of objects.
        @method Exitgames.Common.Logger#format
        @param {string} mess String to start formatting with.
        @param {any[]} optionalParams For every additional parameter toString() applies and result added to the end of formatted string after space character.
        @returns {string} Formatted string.
        */
        public formatArr(mess: string, optionalParams: any[]): string;
        /**
        @summary Logging levels. Set to restrict log output.
        @member Exitgames.Common.Logger.Level
        @readonly
        @property {number} DEBUG All logging methods enabled.
        @property {number} INFO info(...), warn(...), error(...) methods enabled.
        @property {number} WARN warn(...) and error(...) methods enabled.
        @property {number} ERROR Only error(...) method enabled.
        @property {number} OFF Logging off.
        */
        static Level: {
            DEBUG: number;
            INFO: number;
            WARN: number;
            ERROR: number;
            OFF: number;
        };
        private static log_types;
        private log(level, msg, optionalParams);
        private format0(msg, optionalParams);
    }
    class Util {
        static indexOf(arr: any, item: any, from: any): any;
        static isArray(obj: any): boolean;
        static merge(target: any, additional: any): void;
        static getPropertyOrElse(obj: any, prop: string, defaultValue: any): any;
        static enumValueToName(enumObj: any, value: number): string;
        static getEnumKeyByValue(enumObj: any, value: number): string;
    }
}
declare module Photon.Lite.Constants {
    var LiteOpKey: {
        ActorList: number;
        ActorNr: number;
        ActorProperties: number;
        Add: number;
        Broadcast: number;
        Cache: number;
        Code: number;
        Data: number;
        GameId: number;
        GameProperties: number;
        Group: number;
        Properties: number;
        ReceiverGroup: number;
        Remove: number;
        TargetActorNr: number;
        EmptyRoomLiveTime: number;
    };
    var LiteEventCode: {
        Join: number;
        Leave: number;
        PropertiesChanged: number;
    };
    var LiteOpCode: {
        ChangeGroups: number;
        GetProperties: number;
        Join: number;
        Leave: number;
        RaiseEvent: number;
        SetProperties: number;
    };
}
/**
Photon Lite API
@namespace Photon.Lite
*/
declare module Photon.Lite {
    class LitePeer extends PhotonPeer {
        /**
        @classdesc Extends PhotonPeer and implements the operations offered by the "Lite" Application of the Photon Server SDK.
        @constructor Photon.Lite.LitePeer
        @param {string} url Server address:port.
        @param {string} [subprotocol=""] WebSocket protocol.
        */
        constructor(url: string, subprotocol?: string);
        /**
        @summary Returns local actor data.
        @method Photon.Lite.LitePeer#myActor
        @returns {object} Local actor in form { photonId: number, properties: object }
        */
        public myActor(): {
            photonId: number;
            properties: {};
        };
        /**
        @summary Joins an existing room by name or create one if the name is not in use yet.
        @method Photon.Lite.LitePeer#join
        @param {string} roomName Any identifying name for a room
        @param {object} [roomProperties] Set of room properties, by convention: only used if room is new/created.
        @param {object} [actorProperties] Set of actor properties.
        @param {object} [broadcast] Broadcast actor proprties in join-event.
        */
        public join(roomName: string, roomProperties?: any, actorProperties?: any, broadcast?: boolean): void;
        /**
        @summary Leaves a room, but keeps the connection.
        @method Photon.Lite.LitePeer#leave
        */
        public leave(): void;
        /**
        @summary Sends your custom data as event to a actors in the current Room.
        @method Photon.Lite.LitePeer#raiseEvent
        @param {number} eventCode The code of custom event.
        @param {object} data Event content
        */
        public raiseEvent(eventCode: number, data: any): void;
        /**
        @summary Sets or updates properties of specified actor.
        @method Photon.Lite.LitePeer#setActorProperties
        @param {number} actorNr Id of actor.
        @param {object} data Actor properties to set or update.
        @param {boolean} broadcast Triggers an LiteEventCode.PropertiesChanged event if true.
        */
        public setActorProperties(actorNr: number, data: any, broadcast: boolean): void;
        /**
        @summary Requests selected properties of specified actors.
        @method Photon.Lite.LitePeer#getActorProperties
        @param {object} [propertyKeys] Property keys to fetch. All properties will return if not specified.
        @param {number[]} [actorNrs] List of actornumbers to get the properties of. Properties of all actors will return if not specified.
        */
        public getActorProperties(propertyKeys: number[], actorNrs?: number[]): void;
        /**
        @summary Sets or updates properties of joined room.
        @method Photon.Lite.LitePeer#setRoomProperties
        @param {object} data Room properties to set or update.
        @param {boolean} broadcast Triggers an LiteEventCode.PropertiesChanged event if true.
        */
        public setRoomProperties(data: any, broadcast: boolean): void;
        /**
        @summary Requests selected properties of joined room.
        @method Photon.Lite.LitePeer#getRoomProperties
        @param {object} [propertyKeys] Property keys to fetch. All properties will return if not specified.
        */
        public getRoomProperties(propertyKeys: number[]): void;
        private isJoined;
        private roomName;
        private room;
        private actors;
        private _myActor;
        private _addActor(actorNr);
        private _removeActor(actorNr);
        private actorNrFromVals(vals);
        public _parseEvent(code: number, event: any): void;
        private _onEventJoin(event, actorNr);
        private _onEventLeave(actorNr);
        private _onEventSetProperties(event, actorNr);
        public _parseResponse(code: number, response: any): void;
        private _onResponseGetProperties(response);
        private _onResponseJoin(actorNr);
        private _onResponseLeave(actorNr);
        private _onResponseSetProperties(response, actorNr);
    }
}
/**
Photon Load Balancing API Constants
@namespace Photon.LoadBalancing.Constants
*/
declare module Photon.LoadBalancing.Constants {
    /**
    @summary Master and Game servers error codes.
    @member Photon.LoadBalancing.Constants.ErrorCode
    @readonly
    @property {number} Ok No Error.
    @property {number} OperationNotAllowedInCurrentState Operation can't be executed yet.
    @property {number} InvalidOperationCode The operation you called is not implemented on the server (application) you connect to. Make sure you run the fitting applications.
    @property {number} InternalServerError Something went wrong in the server. Try to reproduce and contact Exit Games.
    @property {number} InvalidAuthentication Authentication failed. Possible cause: AppId is unknown to Photon (in cloud service).
    @property {number} GameIdAlreadyExists GameId (name) already in use (can't create another). Change name.
    @property {number} GameFull Game is full. This can when players took over while you joined the game.
    @property {number} GameClosed Game is closed and can't be joined. Join another game.
    @property {number} NoRandomMatchFound Random matchmaking only succeeds if a room exists thats neither closed nor full. Repeat in a few seconds or create a new room.
    @property {number} GameDoesNotExist Join can fail if the room (name) is not existing (anymore). This can happen when players leave while you join.
    @property {number} MaxCcuReached Authorization on the Photon Cloud failed becaus the concurrent users (CCU) limit of the app's subscription is reached.
    @property {number} InvalidRegion Authorization on the Photon Cloud failed because the app's subscription does not allow to use a particular region's server.
    */
    var ErrorCode: {
        Ok: number;
        OperationNotAllowedInCurrentState: number;
        InvalidOperationCode: number;
        InternalServerError: number;
        InvalidAuthentication: number;
        GameIdAlreadyExists: number;
        GameFull: number;
        GameClosed: number;
        NoRandomMatchFound: number;
        GameDoesNotExist: number;
        MaxCcuReached: number;
        InvalidRegion: number;
    };
    var ActorProperties: {
        PlayerName: number;
    };
    var GameProperties: {
        MaxPlayers: number;
        IsVisible: number;
        IsOpen: number;
        PlayerCount: number;
        Removed: number;
        PropsListedInLobby: number;
        CleanupCacheOnLeave: number;
    };
    var EventCode: {
        GameList: number;
        GameListUpdate: number;
        QueueState: number;
        AppStats: number;
        AzureNodeInfo: number;
        Join: number;
        Leave: number;
        PropertiesChanged: number;
        Disconnect: number;
        LobbyStats: number;
    };
    var ParameterCode: {
        Address: number;
        PeerCount: number;
        GameCount: number;
        MasterPeerCount: number;
        UserId: number;
        ApplicationId: number;
        Position: number;
        MatchMakingType: number;
        GameList: number;
        Secret: number;
        AppVersion: number;
        AzureNodeInfo: number;
        AzureLocalNodeId: number;
        AzureMasterNodeId: number;
        RoomName: number;
        Broadcast: number;
        ActorList: number;
        ActorNr: number;
        PlayerProperties: number;
        CustomEventContent: number;
        Data: number;
        Code: number;
        GameProperties: number;
        Properties: number;
        TargetActorNr: number;
        ReceiverGroup: number;
        Cache: number;
        CleanupCacheOnLeave: number;
        Group: number;
        Remove: number;
        Add: number;
        EmptyRoomTTL: number;
        PlayerTTL: number;
        ClientAuthenticationType: number;
        ClientAuthenticationParams: number;
        ClientAuthenticationData: number;
        JoinMode: number;
        FindFriendsRequestList: number;
        FindFriendsResponseOnlineList: number;
        FindFriendsResponseRoomIdList: number;
        LobbyName: number;
        LobbyType: number;
        LobbyStats: number;
        Region: number;
        IsInactive: number;
        CheckUserOnJoin: number;
        UriPath: number;
        RpcCallParams: number;
        RpcCallRetCode: number;
        RpcCallRetMessage: number;
        RpcCallRetData: number;
        Forward: number;
    };
    /**
    @summary Codes for parameters and events used in Photon Load Balancing API.
    @member Photon.LoadBalancing.Constants.OperationCode
    @readonly
    @property {number} Authenticate Authenticates this peer and connects to a virtual application.
    @property {number} JoinLobby Joins lobby (on Master).
    @property {number} LeaveLobby Leaves lobby (on Master).
    @property {number} CreateGame Creates a game (or fails if name exists).
    @property {number} JoinGame Joins room (by name).
    @property {number} JoinRandomGame Joins random room (on Master).
    @property {number} Leave Leaves the room.
    @property {number} RaiseEvent Raises event (in a room, for other actors/players).
    @property {number} SetProperties Sets Properties (of room or actor/player).
    @property {number} GetProperties Gets Properties.
    @property {number} ChangeGroups Changes interest groups in room.
    @property {number} FindFriends Requests Master server for actors online status and joined rooms.
    @property {number} LobbyStats Requests Master server for lobbies statistics.
    */
    var OperationCode: {
        Authenticate: number;
        JoinLobby: number;
        LeaveLobby: number;
        CreateGame: number;
        JoinGame: number;
        JoinRandomGame: number;
        Leave: number;
        RaiseEvent: number;
        SetProperties: number;
        GetProperties: number;
        ChangeGroups: number;
        FindFriends: number;
        LobbyStats: number;
        GetRegions: number;
        Rpc: number;
    };
    /**
    @summary Options for matchmaking rules for joinRandomGame.
    @member Photon.LoadBalancing.Constants.MatchmakingMode
    @readonly
    @property {number} FillRoom Default. FillRoom Fills up rooms (oldest first) to get players together as fast as possible. Makes most sense with MaxPlayers > 0 and games that can only start with more players.
    @property {number} SerialMatching Distributes players across available rooms sequentially but takes filter into account. Without filter, rooms get players evenly distributed.
    @property {number} RandomMatching Joins a (fully) random room. Expected properties must match but aside from this, any available room might be selected.
    */
    var MatchmakingMode: {
        FillRoom: number;
        SerialMatching: number;
        RandomMatching: number;
    };
    /**
    @summary Caching options for events.
    @member Photon.LoadBalancing.Constants.EventCaching
    @readonly
    @property {number} DoNotCache Default. Do not cache.
    @property {number} MergeCache Will merge this event's keys with those already cached.
    @property {number} ReplaceCache Replaces the event cache for this eventCode with this event's content.
    @property {number} RemoveCache Removes this event (by eventCode) from the cache.
    @property {number} AddToRoomCache Adds an event to the room's cache.
    @property {number} AddToRoomCacheGlobal Adds this event to the cache for actor 0 (becoming a "globally owned" event in the cache).
    @property {number} RemoveFromRoomCache Remove fitting event from the room's cache.
    @property {number} RemoveFromRoomCacheForActorsLeft Removes events of players who already left the room (cleaning up).
    */
    var EventCaching: {
        DoNotCache: number;
        MergeCache: number;
        ReplaceCache: number;
        RemoveCache: number;
        AddToRoomCache: number;
        AddToRoomCacheGlobal: number;
        RemoveFromRoomCache: number;
        RemoveFromRoomCacheForActorsLeft: number;
    };
    /**
    @summary Options for choosing room's actors who should receive events.
    @member Photon.LoadBalancing.Constants.ReceiverGroup
    @readonly
    @property {number} Others Default. Anyone else gets my event.
    @property {number} All Everyone in the current room (including this peer) will get this event.
    @property {number} MasterClient The "master client" does not have special rights but is the one who is in this room the longest time.
    */
    var ReceiverGroup: {
        Others: number;
        All: number;
        MasterClient: number;
    };
    /**
    @summary Options for optional "Custom Authentication" services used with Photon.
    @member Photon.LoadBalancing.Constants.CustomAuthenticationType
    @readonly
    @property {number} Custom Default. Use a custom authentification service.
    @property {number} Steam Authenticates users by their Steam Account. Set auth values accordingly.
    @property {number} Facebook Authenticates users by their Facebook Account. Set auth values accordingly.
    @property {number} None Disables custom authentification.
    */
    var CustomAuthenticationType: {
        Custom: number;
        Steam: number;
        Facebook: number;
        None: number;
    };
    /**
    @summary Options of lobby types available. Lobby types might be implemented in certain Photon versions and won't be available on older servers.
    @member Photon.LoadBalancing.Constants.LobbyType
    @readonly
    @property {number} Default This lobby is used unless another is defined by game or JoinRandom. Room-lists will be sent and JoinRandomRoom can filter by matching properties.
    @property {number} SqlLobby This lobby type lists rooms like Default but JoinRandom has a parameter for SQL-like "where" clauses for filtering. This allows bigger, less, or and and combinations.
    **/
    var LobbyType: {
        Default: number;
        SqlLobby: number;
    };
}
/**
Photon Load Balancing API
@namespace Photon.LoadBalancing
*/
declare module Photon.LoadBalancing {
    interface ConnectOptions {
        keepMasterConnection?: boolean;
        lobbyName?: string;
        lobbyType?: number;
        lobbyStats?: boolean;
        userAuthSecret?: string;
        region?: string;
    }
    interface CreateRoomOptions {
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
    interface JoinRoomOptions {
        joinToken?: string;
        createIfNotExists?: boolean;
        lobbyName?: string;
        lobbyType?: number;
    }
    interface JoinRandomRoomOptions {
        expectedCustomRoomProperties?: any;
        expectedMaxPlayers?: number;
        matchingType?: number;
        lobbyName?: string;
        lobbyType?: number;
        sqlLobbyFilter?: string;
    }
    class Actor {
        public name: string;
        public actorNr: number;
        public isLocal: boolean;
        /**
        @classdesc Summarizes a "player" within a room, identified (in that room) by ID (or "actorNr"). Extend to implement custom logic.
        @constructor Photon.LoadBalancing.Actor
        @param {string} name Actor name.
        @param {number} actorNr Actor ID.
        @param {boolean} isLocal Actor is local.
        */
        constructor(name: string, actorNr: number, isLocal: boolean);
        /**
        @summary Actor's room: the room initialized by client for create room operation or room client connected to.
        @method Photon.LoadBalancing.Actor#getRoom
        @returns {Photon.LoadBalancing.Room} Actor's room.
        */
        public getRoom(): Room;
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
        public raiseEvent(eventCode: number, data?: any, options?: {
            interestGroup?: number;
            cache?: number;
            receivers?: number;
            targetActors?: number[];
            webForward?: boolean;
        }): void;
        /**
        @summary Sets actor name.
        @method Photon.LoadBalancing.Actor#setName
        @param {string} name Actor name.
        */
        public setName(name: string): void;
        /**
        @summary Called on every actor properties update: properties set by client, poperties update from server.
        Override to update custom room state.
        @method Photon.LoadBalancing.Actor#onPropertiesChange
        @param {object} changedCustomProps Key-value map of changed properties.
        @param {boolean} [byClient] true if properties set by client.
        */
        public onPropertiesChange(changedCustomProps: any, byClient?: boolean): void;
        /**
        @summary Returns custom property by name.
        @method Photon.LoadBalancing.Actor#getCustomProperty
        @param {string} name Name of the property.
        @returns {object} Property or undefined if property not found.
        */
        public getCustomProperty(name: string): any;
        /**
        @summary Returns custom property by name or default value.
        @method Photon.LoadBalancing.Actor#getCustomPropertyOrElse
        @param {string} name Name of the property.
        @param {object} defaultValue Default property value.
        @returns {object} Property or default value if property not found.
        */
        public getCustomPropertyOrElse(name: string, defaultValue: any): any;
        /**
        @summary Sets custom property.
        @method Photon.LoadBalancing.Actor#setCustomProperty
        @param {string} name Name of the property.
        @param {object} value Property value.
        */
        public setCustomProperty(name: string, value: any): void;
        /**
        @summary Sets custom properties.
        @method Photon.LoadBalancing.Actor#setCustomProperties
        @param {object} properties Table of properties to set.
        */
        public setCustomProperties(properties: {}): void;
        /**
        @summary For local actor, returns join token automatically saved after last room join.
        @method Photon.LoadBalancing.Actor#getJoinToken
        @returns {string} Join token.
        */
        public getJoinToken(): string;
        /**
        @summary Returns true if actor is in suspended state.
        @returns {boolean} Actor suspend state.
        **/
        public isSuspended(): boolean;
        public _getAllProperties(): {};
        public _setLBC(lbc: LoadBalancingClient): void;
        private customProperties;
        private joinToken;
        private loadBalancingClient;
        private suspended;
        public _updateFromResponse(vals: {}): void;
        public _updateMyActorFromResponse(vals: {}): void;
        public _updateCustomProperties(vals: {}): void;
        public _setSuspended(s: boolean): void;
        static _getActorNrFromResponse(vals: {}): any;
    }
    class RoomInfo {
        /**
        @summary Room name.
        @member Photon.LoadBalancing.RoomInfo#name
        @type {string}
        @readonly
        */
        public name: string;
        /**
        @summary Joined room Game server address.
        @member Photon.LoadBalancing.RoomInfo#address
        @type {string}
        @readonly
        */
        public address: string;
        /**
        @summary Max players before room is considered full.
        @member Photon.LoadBalancing.RoomInfo#maxPlayers
        @type {number}
        @readonly
        */
        public maxPlayers: number;
        /**
        @summary Shows the room in the lobby's room list. Makes sense only for local room.
        @member Photon.LoadBalancing.RoomInfo#isVisible
        @type {boolean}
        @readonly
        */
        public isVisible: boolean;
        /**
        @summary Defines if this room can be joined.
        @member Photon.LoadBalancing.RoomInfo#isOpen
        @type {boolean}
        @readonly
        */
        public isOpen: boolean;
        /**
        @summary Count of player currently in room.
        @member Photon.LoadBalancing.RoomInfo#playerCount
        @type {number}
        @readonly
        */
        public playerCount: number;
        /**
        @summary Time in ms indicating how long the room instance will be keeped alive in the server room cache after all clients have left the room.
        @member Photon.LoadBalancing.RoomInfo#emptyRoomLiveTime
        @type {number}
        @readonly
        */
        public emptyRoomLiveTime: number;
        /**
        @summary Time in ms indicating how long suspended player will be kept in the room.
        @member Photon.LoadBalancing.RoomInfo#emptyRoomLiveTime
        @type {number}
        @readonly
        **/
        public suspendedPlayerLiveTime: number;
        public uniqueUserId: boolean;
        /**
        @summary Room removed (in room list updates).
        @member Photon.LoadBalancing.RoomInfo#removed
        @type {boolean}
        @readonly
        */
        public removed: boolean;
        private cleanupCacheOnLeave;
        public _customProperties: {};
        public _propsListedInLobby: string[];
        /**
        @summary Called on every room properties update: room creation, properties set by client, poperties update from server.
        Override to update custom room state.
        @method Photon.LoadBalancing.RoomInfo#onPropertiesChange
        @param {object} changedCustomProps Key-value map of changed properties.
        @param {boolean} [byClient] true if called on room creation or properties set by client.
        */
        public onPropertiesChange(changedCustomProps: any, byClient?: boolean): void;
        /**
        @summary Returns custom property by name.
        @method Photon.LoadBalancing.RoomInfo#getCustomProperty
        @param {string} name Name of the property.
        @returns {object} Property or undefined if property not found.
        */
        public getCustomProperty(prop: string): any;
        /**
        @summary Returns custom property by name or default value.
        @method Photon.LoadBalancing.RoomInfo#getCustomPropertyOrElse
        @param {string} name Name of the property.
        @param {object} defaultValue Default property value.
        @returns {object} Property or default value if property not found.
        */
        public getCustomPropertyOrElse(prop: string, defaultValue: any): any;
        /**
        @classdesc Used for Room listings of the lobby (not yet joining). Offers the basic info about a room: name, player counts, properties, etc.
        @constructor Photon.LoadBalancing.RoomInfo
        @param {string} name Room name.
        */
        constructor(name: string);
        public _updateFromMasterResponse(vals: any): void;
        public _updateFromProps(props: Object, customProps?: Object): void;
        private updateIfExists(prevValue, code, props);
    }
    class Room extends RoomInfo {
        /**
        @classdesc Represents a room client joins or is joined to. Extend to implement custom logic. Custom properties can be set via setCustomProperty() while being in the room.
        @mixes Photon.LoadBalancing.RoomInfo
        @constructor Photon.LoadBalancing.Room
        @param {string} name Room name.
        */
        constructor(name: string);
        /**
        @summary Sets custom property
        @method Photon.LoadBalancing.Room#setCustomProperty
        @param {string} name Name of the property.
        @param {object} value Property value.
        @param {boolean} [webForward=false] Forward to web hook.
        */
        public setCustomProperty(name: string, value: any, webForward?: boolean): void;
        /**
        @summary Sets custom property
        @method Photon.LoadBalancing.Room#setCustomProperty
        @param {object} properties Table of properties to set.
        @param {boolean} [webForward=false] Forward to web hook.
        */
        public setCustomProperties(properties: {}, webForward?: boolean): void;
        private setProp(name, value);
        /**
        * @summary Sets rooms visibility in the lobby's room list.
        * @method Photon.LoadBalancing.Room#setIsOpen
        * @param {boolean} isVisible New visibility value.
        */
        public setIsVisible(isVisible: boolean): void;
        /**
        * @summary Sets if this room can be joined.
        * @method Photon.LoadBalancing.Room#setIsOpen
        * @param {boolean} isOpen New property value.
        */
        public setIsOpen(isOpen: boolean): void;
        /**
        * @summary Sets max players before room is considered full.
        * @method Photon.LoadBalancing.Room#setMaxPlayers
        * @param {number} maxPlayers New max players value.
        */
        public setMaxPlayers(maxPlayers: number): void;
        /**
        * @summary Sets room live time in the server room cache after all clients have left the room.
        * @method Photon.LoadBalancing.Room#setEmptyRoomLiveTime
        * @param {number} emptyRoomLiveTime New live time value in ms.
        */
        public setEmptyRoomLiveTime(emptyRoomLiveTime: number): void;
        /**
        * @summary Sets time in ms indicating how long suspended player will be kept in the room.
        * @method Photon.LoadBalancing.Room#setSuspendedPlayerLiveTime
        * @param {number} suspendedPlayerLiveTime New live time value in ms.
        */
        public setSuspendedPlayerLiveTime(suspendedPlayerLiveTime: number): void;
        /**
        * @summary  activates user id checks on joining if set to true.
        * @method Photon.LoadBalancing.Room#setUniqueUserId
        * @param {boolean} unique New property value.
        */
        public setUniqueUserId(unique: boolean): void;
        /**
        @summary Sets list of the room properties to pass to the RoomInfo list in a lobby.
        @method Photon.LoadBalancing.Room#setPropsListedInLobby
        @param {string[]} props Array of properties names.
        */
        public setPropsListedInLobby(props: string[]): void;
        private loadBalancingClient;
        public _setLBC(lbc: LoadBalancingClient): void;
    }
    class LoadBalancingClient {
        private appId;
        private appVersion;
        static JoinMode: {
            Default: number;
            CreateIfNotExists: number;
            Rejoin: number;
        };
        /**
        @summary Called on client state change. Override to handle it.
        @method Photon.LoadBalancing.LoadBalancingClient#onStateChange
        @param {Photon.LoadBalancing.LoadBalancingClient.State} state New client state.
        */
        public onStateChange(state: number): void;
        /**
        @summary Called if client error occures. Override to handle it.
        @method Photon.LoadBalancing.LoadBalancingClient#onError
        @param {Photon.LoadBalancing.LoadBalancingClient.PeerErrorCode} errorCode Client error code.
        @param {string} errorMsg Error message.
        */
        public onError(errorCode: number, errorMsg: string): void;
        /**
        @summary Called on operation response. Override if need custom workflow or response error handling.
        @method Photon.LoadBalancing.LoadBalancingClient#onOperationResponse
        @param {number} errorCode Server error code.
        @param {string} errorMsg Error message.
        @param {number} code Operation code.
        @param {object} content Operation response content.
        */
        public onOperationResponse(errorCode: number, errorMsg: string, code: number, content: any): void;
        /**
        @summary Called on custom event. Override to handle it.
        @method Photon.LoadBalancing.LoadBalancingClient#onEvent
        @param {number} code Event code.
        @param {object} content Event content.
        @param {number} actorNr Actor ID event raised by.
        */
        public onEvent(code: number, content: any, actorNr: number): void;
        /**
        @summary Called on room list received from Master server (on connection). Override to handle it.
        @method Photon.LoadBalancing.LoadBalancingClient#onRoomList
        @param {{@link Photon.LoadBalancing.RoomInfo}[]} rooms Room list.
        */
        public onRoomList(rooms: RoomInfo[]): void;
        /**
        @summary Called on room list updates received from Master server. Override to handle it.
        @method Photon.LoadBalancing.LoadBalancingClient#onRoomListUpdate
        @param {{@link Photon.LoadBalancing.RoomInfo}[]} rooms Updated room list.
        @param {{@link Photon.LoadBalancing.RoomInfo}[]} roomsUpdated Rooms whose properties were changed.
        @param {{@link Photon.LoadBalancing.RoomInfo}[]} roomsAdded New rooms in list.
        @param {{@link Photon.LoadBalancing.RoomInfo}[]} roomsRemoved Rooms removed from list.
        */
        public onRoomListUpdate(rooms: RoomInfo[], roomsUpdated: RoomInfo[], roomsAdded: RoomInfo[], roomsRemoved: RoomInfo[]): void;
        /**
        @summary Called on joined room properties changed event. Override to handle it.
        @method Photon.LoadBalancing.LoadBalancingClient#onMyRoomPropertiesChange
        */
        public onMyRoomPropertiesChange(): void;
        /**
        @summary Called on actor properties changed event. Override to handle it.
        @method Photon.LoadBalancing.LoadBalancingClient#onActorPropertiesChange
        @param {Photon.LoadBalancing.Actor} actor Actor whose properties were changed.
        */
        public onActorPropertiesChange(actor: Actor): void;
        /**
        @summary Called when client joins room. Override to handle it.
        @method Photon.LoadBalancing.LoadBalancingClient#onJoinRoom
        @param {boolean} createdByMe True if room is created by client.
        */
        public onJoinRoom(createdByMe: boolean): void;
        /**
        @summary Called when new actor joins the room client joined to. Override to handle it.
        @method Photon.LoadBalancing.LoadBalancingClient#onActorJoin
        @param {Photon.LoadBalancing.Actor} actor New actor.
        */
        public onActorJoin(actor: Actor): void;
        /**
        @summary Called when actor leaves the room client joined to. Also called for every actor during room cleanup. Override to handle it.
        @method Photon.LoadBalancing.LoadBalancingClient#onActorLeave
        @param {Photon.LoadBalancing.Actor} actor Actor left the room.
        @param {boolean} cleanup True if called during room cleanup (e.g. on disconnect).
        */
        public onActorLeave(actor: Actor, cleanup: boolean): void;
        /**
        @summary Called when actor suspended in the room client joined to.Override to handle it.
        @method Photon.LoadBalancing.LoadBalancingClient#onActorSuspend
        @param {Photon.LoadBalancing.Actor} actor Actor suspended in the room.
        */
        public onActorSuspend(actor: Actor): void;
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
        public onFindFriendsResult(errorCode: number, errorMsg: string, friends: any): void;
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
        public onLobbyStats(errorCode: number, errorMsg: string, lobbies: any[]): void;
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
        public onAppStats(errorCode: number, errorMsg: string, stats: any): void;
        /**
        @summary Called when {@link Photon.LoadBalancing.LoadBalancingClient#getRegions getRegions} request completed.<br/>
        Override to handle request results.
        @param {number} errorCode Result error code. 0 if request is successful.
        @param {string} errorMsg Error message.
        @param {object} regions Object with region codes as keys and Master servers addresses as values
        */
        public onGetRegionsResult(errorCode: number, errorMsg: string, regions: {}): void;
        /**
        Called when {@link Photon.LoadBalancing.LoadBalancingClient#webRpc webRpc} request completed.<br/>
        Override to handle request results.
        @param {number} errorCode Result error code. 0 if request is successful.
        @param {string} message Error message if errorCode ~ = 0 or optional message returned by remote procedure.
        @param {string} uriPath Request path.
        @param {number} resultCode Result code returned by remote procedure.
        @param {object} data Data returned by remote procedure.
        **/
        public onWebRpcResult(errorCode: number, message: string, uriPath: string, resultCode: number, data: any): void;
        /**
        @summary Override with creation of custom room (extended from Room): { return new CustomRoom(...); }
        @method Photon.LoadBalancing.LoadBalancingClient#roomFactory
        @param {string} name Room name. Pass to super() in custom actor constructor.
        */
        public roomFactory(name: string): Room;
        /**
        @summary Override with creation of custom actor (extended from Actor): { return new CustomActor(...); }
        @method Photon.LoadBalancing.LoadBalancingClient#actorFactory
        @param {string} name Actor name. Pass to super() in custom room constructor.
        @param {number} actorNr Actor ID. Pass to super() in custom room constructor.
        @param {boolean} isLocal Actor is local. Pass to super() in custom room constructor.
        */
        public actorFactory(name: string, actorNr: number, isLocal: boolean): Actor;
        /**
        @summary Returns local actor.
        Client always has local actor even if not joined.
        @method Photon.LoadBalancing.LoadBalancingClient#myActor
        @returns {Photon.LoadBalancing.Actor} Local actor.
        */
        public myActor(): Actor;
        /**
        @summary Returns client's room.
        Client always has it's room even if not joined. It's used for room creation operation.
        @method Photon.LoadBalancing.LoadBalancingClient#myRoom
        @returns {Photon.LoadBalancing.Room} Current room.
        */
        public myRoom(): Room;
        /**
        @summary Returns actors in room client currently joined including local actor.
        @method Photon.LoadBalancing.LoadBalancingClient#myRoomActors
        @returns {object} actorNr -> {@link Photon.LoadBalancing.Actor} map of actors in room.
        */
        public myRoomActors(): {};
        /**
        @summary Returns numer of actors in room client currently joined including local actor.
        @method Photon.LoadBalancing.LoadBalancingClient#myRoomActorCount
        @returns {number} Number of actors.
        */
        public myRoomActorCount(): number;
        public myRoomActorsArray(): any[];
        private roomFactoryInternal(name?);
        private actorFactoryInternal(name?, actorNr?, isLocal?);
        /**
        @classdesc Implements the Photon LoadBalancing workflow. This class should be extended to handle system or custom events and operation responses.
        @constructor Photon.LoadBalancing.LoadBalancingClient
        @param {Photon.ConnectionProtocol} protocol Connecton protocol.
        @param {string} appId Cloud application ID.
        @param {string} appVersion Cloud application version.
        */
        constructor(protocol: number, appId: string, appVersion: string);
        /**
        @summary Changes default NameServer address and port before connecting to NameServer.
        @method Photon.LoadBalancing.LoadBalancingClient#setNameServerAddress
        @param {string} address New address and port.
        */
        public setNameServerAddress(address: string): void;
        /**
        @summary Returns current NameServer address.
        @method Photon.LoadBalancing.LoadBalancingClient#getNameServerAddress
        @returns {string} NameServer address address.
        */
        public getNameServerAddress(): string;
        /**
        @summary Changes default Master server address and port before connecting to Master server.
        @method Photon.LoadBalancing.LoadBalancingClient#setMasterServerAddress
        @param {string} address New address and port.
        */
        public setMasterServerAddress(address: string): void;
        /**
        @summary Returns current Master server address.
        @method Photon.LoadBalancing.LoadBalancingClient#getMasterServerAddress
        @returns {string} Master server address.
        */
        public getMasterServerAddress(): string;
        /**
        @summary Sets optional user id(required by some cloud services)
        @method Photon.LoadBalancing.LoadBalancingClient#setUserId
        @param {string} userId New user id.
        */
        public setUserId(userId: string): void;
        /**
        @summary Returns previously set user id.
        @method Photon.LoadBalancing.LoadBalancingClient#getUserId
        @returns {string} User id.
        */
        public getUserId(): string;
        /**
        @summary Enables custom authentication and sets it's parameters.
        @method Photon.LoadBalancing.LoadBalancingClient#setCustomAuthentication
        @param {string} authParameters This string must contain any (http get) parameters expected by the used authentication service.
        @param {Photon.LoadBalancing.Constants.CustomAuthenticationType} [authType=Photon.LoadBalancing.Constants.CustomAuthenticationType.Custom] The type of custom authentication provider that should be used.
        @param {string} authData The data to be passed-on to the auth service via POST.
        */
        public setCustomAuthentication(authParameters: string, authType?: number, authData?: string): void;
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
        public connect(options?: {
            keepMasterConnection?: boolean;
            lobbyName?: string;
            lobbyType?: number;
            lobbyStats?: boolean;
        }): boolean;
        /**
        @summary Starts connection to NameServer.
        @method Photon.LoadBalancing.LoadBalancingClient#connectToNameServer
        @param {object} [options] Additional options
        */
        public connectToNameServer(options?: {
            region?: string;
        }): boolean;
        private fillCreateRoomOptions(op, options);
        /**
        @summary Creates a new room on the server (or fails when the name is already taken). Takes parameters (except name) for new room from myRoom() object. Set them before call.
        @method Photon.LoadBalancing.LoadBalancingClient#createRoomFromMy
        @param {string} [roomName] New room name. Assigned automatically by server if empty or not specified.
        @param {object} [options] Additional options
        @property {object} options Additional options
        @property {string} [options.lobbyName] Name of the lobby to create room in.
        @property {Photon.LoadBalancing.Constants.LobbyType} [options.lobbyType=LobbyType.Default] Type of the lobby.
        */
        public createRoomFromMy(roomName?: string, options?: CreateRoomOptions): void;
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
        public createRoom(roomName?: string, options?: {
            isVisible?: boolean;
            isOpen?: boolean;
            maxPlayers?: number;
            customGameProperties?: any;
            propsListedInLobby?: string[];
            emptyRoomLiveTime?: number;
            suspendedPlayerLiveTime?: number;
            lobbyName?: string;
            lobbyType?: number;
        }): void;
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
        public joinRoom(roomName: string, options?: JoinRoomOptions, createOptions?: CreateRoomOptions): boolean;
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
        public joinRandomRoom(options?: JoinRandomRoomOptions): boolean;
        public _setPropertiesOfRoom(properties: {}, webForward?: boolean): void;
        public _setPropertiesOfActor(actorNr: number, properties: {}): void;
        /**
        @summary Disconnects from all servers.
        @method Photon.LoadBalancing.LoadBalancingClient#disconnect
        */
        public disconnect(): void;
        /**
        @summary Disconnects client from Game server keeping player in room (to rejoin later) and connects to Master server if not connected.
        @method Photon.LoadBalancing.LoadBalancingClient#suspendRoom
        */
        public suspendRoom(): void;
        /**
        @summary Leaves room and connects to Master server if not connected.
        @method Photon.LoadBalancing.LoadBalancingClient#leaveRoom
        */
        public leaveRoom(): void;
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
        public raiseEvent(eventCode: number, data?: any, options?: {
            interestGroup?: number;
            cache?: number;
            receivers?: number;
            targetActors?: number[];
            webForward?: boolean;
        }): void;
        /**
        @summary Changes client's interest groups (for events in room).<br/>
        Note the difference between passing null and []: null won't add/remove any groups, [] will add/remove all (existing) groups.<br/>
        First, removing groups is executed. This way, you could leave all groups and join only the ones provided.
        @method Photon.LoadBalancing.LoadBalancingClient#changeGroups
        @param {number[]} groupsToRemove Groups to remove from interest. Null will not leave any. A [] will remove all.
        @param {number[]} groupsToAdd Groups to add to interest. Null will not add any. A [] will add all current.
        */
        public changeGroups(groupsToRemove: number[], groupsToAdd: number[]): void;
        /**
        @summary Requests Master server for actors online status and joined rooms.<br/>
        Override {@link Photon.LoadBalancing.LoadBalancingClient#onFindFriendsResult onFindFriendsResult} to handle request results.
        @method Photon.LoadBalancing.LoadBalancingClient#findFriends
        @param {string[]} friendsToFind Actors names.
        **/
        public findFriends(friendsToFind: string[]): void;
        /**
        @summary Requests Master server for lobbies statistics.<br/>
        Override {@link Photon.LoadBalancing.LoadBalancingClient#onLobbyStats onLobbyStats} to handle request results.<br/>
        Alternatively, automated updates can be set up during {@link Photon.LoadBalancing.LoadBalancingClient#connect connect}.
        @method Photon.LoadBalancing.LoadBalancingClient#requestLobbyStats
        @param {any[]} lobbiesToRequest Array of lobbies id pairs [ [lobbyName1, lobbyType1], [lobbyName2, lobbyType2], ... ]. If not specified or null, statistics for all lobbies requested.
        
        **/
        public requestLobbyStats(lobbiesToRequest?: any[][]): void;
        private requestLobbyStatsErr(m, other?);
        /**
        @summary Requests NameServer for regions list.<br/>
        Override {@link Photon.LoadBalancing.LoadBalancingClient#onGetRegionsResult onGetRegionsResult} to handle request results.<br/>
        @method Photon.LoadBalancing.LoadBalancingClient#getRegions
        **/
        public getRegions(): void;
        /**
        @summary Sends web rpc request to Master server.<br/ >
        Override {@link Photon.LoadBalancing.LoadBalancingClient#onWebRpcResult onWebRpcResult} to handle request results.<br/>
        @method Photon.LoadBalancing.LoadBalancingClient#webRpc
        @param {string} uriPath Request path.
        @param {object} parameters Request parameters.
        **/
        public webRpc(uriPath: string, parameters?: {}): void;
        /**
        @summary Connects to a specific region's Master server, using the NameServer to find the IP.
        Override {@link Photon.LoadBalancing.LoadBalancingClient#onWebRpcResult onWebRpcResult} to handle request results.<br/>
        @method Photon.LoadBalancing.LoadBalancingClient#connectToRegionMaster
        @param {string} region Region connect to Master server of.
        @returns {boolean} True if current client state allows connection.
        **/
        public connectToRegionMaster(region: string): boolean;
        /**
        @summary Checks if client is connected to Master server (usually joined to lobby and receives room list updates).
        @method Photon.LoadBalancing.LoadBalancingClient#isConnectedToMaster
        @returns {boolean} True if client is connected to Master server.
        */
        public isConnectedToMaster(): boolean;
        /**
        @summary Checks if client is connected to NameServer server.
        @method Photon.LoadBalancing.LoadBalancingClient#isConnectedToNameServer
        @returns {boolean} True if client is connected to NameServer server.
        */
        public isConnectedToNameServer(): boolean;
        /**
        @summary Checks if client is in lobby and ready to join or create game.
        @method Photon.LoadBalancing.LoadBalancingClient#isInLobby
        @returns {boolean} True if client is in lobby.
        */
        public isInLobby(): boolean;
        /**
        @summary Checks if client is joined to game.
        @method Photon.LoadBalancing.LoadBalancingClient#isJoinedToRoom
        @returns {boolean} True if client is joined to game.
        */
        public isJoinedToRoom(): boolean;
        /**
        @deprecated Use isJoinedToRoom()
        */
        public isConnectedToGame(): any;
        /**
        @summary Current room list from Master server.
        @method Photon.LoadBalancing.LoadBalancingClient#availableRooms
        @returns {{@link Photon.LoadBalancing.RoomInfo}[]} Current room list
        */
        public availableRooms(): RoomInfo[];
        /**
        @summary Sets client logger level
        @method Photon.LoadBalancing.LoadBalancingClient#setLogLevel
        @param {Exitgames.Common.Logger.Level} level Logging level.
        */
        public setLogLevel(level: number): void;
        private connectionProtocol;
        private masterServerAddress;
        private nameServerAddress;
        private nameServerPeer;
        public masterPeer: MasterPeer;
        private gamePeer;
        public autoJoinLobby: boolean;
        private connectOptions;
        private createRoomOptions;
        private joinRoomOptions;
        private currentRoom;
        private roomInfos;
        private roomInfosDict;
        private addRoom(r);
        private clearRooms();
        private purgeRemovedRooms();
        private _myActor;
        private actors;
        private actorsArray;
        private addActor(a);
        private removeActor(actorNr);
        private clearActors();
        private userId;
        private userAuthType;
        private userAuthParameters;
        private userAuthData;
        private findFriendsRequestList;
        private lobbyStatsRequestList;
        public state: number;
        public logger: Exitgames.Common.Logger;
        private changeState(nextState);
        private createRoomInternal(peer, options);
        private initNameServerPeer(np);
        public initMasterPeer(mp: MasterPeer): void;
        private connectToGameServer(masterOpCode);
        private initGamePeer(gp, masterOpCode);
        private _cleanupNameServerPeerData();
        private _cleanupMasterPeerData();
        private _cleanupGamePeerData();
        private _onOperationResponseInternal2(code, data);
        private validNextState;
        private initValidNextState();
        private checkNextState(nextState, dontThrow?);
        static PeerErrorCode: {
            Ok: number;
            MasterError: number;
            MasterConnectFailed: number;
            MasterConnectClosed: number;
            MasterTimeout: number;
            MasterEncryptionEstablishError: number;
            MasterAuthenticationFailed: number;
            GameError: number;
            GameConnectFailed: number;
            GameConnectClosed: number;
            GameTimeout: number;
            GameEncryptionEstablishError: number;
            GameAuthenticationFailed: number;
            NameServerError: number;
            NameServerConnectFailed: number;
            NameServerConnectClosed: number;
            NameServerTimeout: number;
            NameServerEncryptionEstablishError: number;
            NameServerAuthenticationFailed: number;
        };
        static State: {
            Error: number;
            Uninitialized: number;
            ConnectingToNameServer: number;
            ConnectedToNameServer: number;
            ConnectingToMasterserver: number;
            ConnectedToMaster: number;
            JoinedLobby: number;
            ConnectingToGameserver: number;
            ConnectedToGameserver: number;
            Joined: number;
            Disconnected: number;
        };
        /**
        @summary Converts {@link Photon.LoadBalancing.LoadBalancingClient.State State} element to string name.
        @method Photon.LoadBalancing.LoadBalancingClient.StateToName
        @param {Photon.LoadBalancing.LoadBalancingClient.State} state Client state enum element.
        @returns {string} Specified element name or undefined if not found.
        */
        static StateToName(value: number): string;
    }
    class NameServerPeer extends PhotonPeer {
        private client;
        constructor(client: LoadBalancingClient, url: string, subprotocol: string);
        public onUnhandledEvent(code: number, args: any): void;
        public onUnhandledResponse(code: number, args: any): void;
        public getRegions(appId: string): void;
        public opAuth(appId: string, appVersion: string, userAuthType: number, userAuthParameters: string, userAuthData: string, userId: string, region: string): void;
    }
    class MasterPeer extends PhotonPeer {
        private client;
        constructor(client: LoadBalancingClient, url: string, subprotocol: string);
        public onUnhandledEvent(code: number, args: any): void;
        public onUnhandledResponse(code: number, args: any): void;
        public findFriends(friendsToFind: string[]): void;
        public requestLobbyStats(lobbiesToRequest: any[][]): void;
        public webRpc(uriPath: string, parameters: {}): void;
    }
    class GamePeer extends PhotonPeer {
        private client;
        constructor(client: LoadBalancingClient, url: string, subprotocol: string);
        public onUnhandledEvent(code: number, args: any): void;
        public onUnhandledResponse(code: number, args: any): void;
        public raiseEvent(eventCode: number, data?: any, options?: {
            interestGroup?: number;
            cache?: number;
            receivers?: number;
            targetActors?: number[];
            webForward?: boolean;
        }): void;
        public changeGroups(groupsToRemove: number[], groupsToAdd: number[]): void;
        private checkGroupNumber(g);
        private checkGroupArray(groups, groupsName);
    }
}
/**
Photon Chat API Constants
@namespace Photon.Chat.Constants
*/
declare module Photon.Chat.Constants {
    var ParameterCode: {
        Channels: number;
        Channel: number;
        Messages: number;
        Message: number;
        Senders: number;
        Sender: number;
        ChannelUserCount: number;
        UserId: number;
        MsgId: number;
        MsgIds: number;
        SubscribeResults: number;
        Status: number;
        Friends: number;
        SkipMessage: number;
        HistoryLength: number;
    };
    var OperationCode: {
        Subscribe: number;
        Unsubscribe: number;
        Publish: number;
        SendPrivate: number;
        ChannelHistory: number;
        UpdateStatus: number;
        AddFriendds: number;
        RemoveFriends: number;
    };
    var EventCode: {
        ChatMessages: number;
        Users: number;
        PrivateMessage: number;
        FriendsList: number;
        StatusUpdate: number;
        Subscribe: number;
        Unsubscribe: number;
    };
    /**
    @summary Contains commonly used status values for {@link Photon.Chat.ChatClient#setUserStatus}.You can define your own.<br/>
    While "online"(Online and up), the status message will be sent to anyone who has you on his friend list.<br/>
    Define custom online status values as you like with these rules:<br/>
    0: Means "offline".It will be used when you are not connected. In this status, there is no status message.<br/>
    1: Means "invisible" and is sent to friends as "offline". They see status 0, no message but you can chat.<br/>
    2: And any higher value will be treated as "online". Status can be set.<br/>
    @readonly
    @property {number} Offline Offline.
    @property {number} Invisible Offline. Be invisible to everyone. Sends no message.
    @property {number} Online Online and available.
    @property {number} Away Online but not available.
    @property {number} Dnd Do not disturb.
    @property {number} Lfg Looking For Game / Group. Could be used when you want to be invited or do matchmaking.
    @property {number} Playing Could be used when in a room, playing.
    @member Photon.Chat.Constants.UserStatus
    */
    var UserStatus: {
        Offline: number;
        Invisible: number;
        Online: number;
        Away: number;
        Dnd: number;
        Lfg: number;
        Playing: number;
    };
    /**
    @summary Converts {@link Photon.Chat.Constants.UserStatus} element to string name.
    @param {Photon.Chat.Constants.UserStatus} status User status enum element.
    @returns {string} Specified element name or undefined if not found.
    @method Photon.Chat.Constants.UserStatusToName
    */
    function UserStatusToName(status: number): string;
}
/**
Photon Chat API
@namespace Photon.Chat
*/
declare module Photon.Chat {
    /**
    @class Photon.Chat.Message
    @classdesc Encapsulates chat message data.
    */
    class Message {
        private sender;
        private content;
        constructor(sender: string, content: any);
        /**
        @summary Returns message sender.
        @return {string} Message sender.
        @method Photon.Chat.Message#getSender
        */
        public getSender(): string;
        /**
        @summary Returns message content.
        @return {any} Message content.
        @method Photon.Chat.Message#getContent
        */
        public getContent(): any;
    }
    /**
    @class Photon.Chat.Channel
    @classdesc Represents chat channel.
    */
    class Channel {
        private name;
        private isPrivat;
        private messages;
        constructor(name: string, isPrivat: boolean);
        /**
        @summary Returns channel name (counterpart user id for private channel).
        @return {string} Channel name.
        @method Photon.Chat.Channel#getName
        */
        public getName(): string;
        /**
        @summary Returns true if channel is private.
        @return {boolean} Channel private status.
        @method Photon.Chat.Channel#isPrivate
        */
        public isPrivate(): boolean;
        /**
        @summary Returns messages cache.
        @return {{@link Photon.Chat.Message}[]} Array of messages.
        @method Photon.Chat.Channel#getMessages
        */
        public getMessages(): Message[];
        /**
        @summary Clears messages cache.
        @method Photon.Chat.Channel#clearMessages
        */
        public clearMessages(): void;
        public addMessage(m: any): void;
        public addMessages(senders: string[], messages: any[]): any[];
    }
    class ChatClient extends LoadBalancing.LoadBalancingClient {
        /**
        @classdesc Implements the Photon Chat API workflow.<br/>
        This class should be extended to handle system or custom events and operation responses.<br/>
        
        @borrows Photon.LoadBalancing.LoadBalancingClient#service
        @borrows Photon.LoadBalancing.LoadBalancingClient#setCustomAuthentication
        @borrows Photon.LoadBalancing.LoadBalancingClient#connectToNameServer
        @borrows Photon.LoadBalancing.LoadBalancingClient#getRegions
        @borrows Photon.LoadBalancing.LoadBalancingClient#onGetRegionsResult
        @borrows Photon.LoadBalancing.LoadBalancingClient#isConnectedToNameServer
        @borrows Photon.LoadBalancing.LoadBalancingClient#disconnect
        @borrows Photon.LoadBalancing.LoadBalancingClient#setLogLevel
        
        @constructor Photon.Chat.ChatClient
        @param {Photon.ConnectionProtocol} protocol Connecton protocol.
        @param {string} appId Cloud application ID.
        @param {string} appVersion Cloud application version.
        */
        constructor(protocol: number, appId: string, appVersion: string);
        /**
        @summary Called on client state change. Override to handle it.
        @method Photon.Chat.ChatClient#onStateChange
        @param {Photon.Chat.ChatClient.ChatState} state New client state.
        */
        public onStateChange(state: number): void;
        /**
        @summary Called if client error occures. Override to handle it.
        @method Chat.ChatClient#onError
        @param {Chat.ChatClient.ChatPeerErrorCode} errorCode Client error code.
        @param {string} errorMsg Error message.
        */
        public onError(errorCode: number, errorMsg: string): void;
        /**
        @summary Called when {@link Photon.Chat.ChatClient#subscribe subscribe} request completed.<br/ >
        Override to handle request results.
        @param {object} results Object with channel names as keys and boolean results as values.
        @method Photon.Chat.ChatClient#onSubscribeResult
        */
        public onSubscribeResult(results: Object): void;
        /**
        @summary Called when {@link Photon.Chat.ChatClient#unsubscribe unsubscribe} request completed.<br/ >
        Override to handle request results.
        @param {object} results Object with channel names as keys and boolean results as values.
        @method Photon.Chat.ChatClient#onUnsubscribeResult
        */
        public onUnsubscribeResult(results: Object): void;
        /**
        @summary Called when new chat messages received.<br/ >
        Override to handle messages receive event.
        @param {string} channelName Chat channel name.
        @param {{@link Photon.Chat.Message}[]} messages Array of received messages.
        @method Photon.Chat.ChatClient#onChatMessages
        */
        public onChatMessages(channelName: string, messages: Message[]): void;
        /**
        @summary Called when new private message received.<br/ >
        Override to handle message receive event.
        @param {string} channelName Private channel name(counterpart user id).
        @param {Photon.Chat.Message} message Received message.
        @method Photon.Chat.ChatClient#onPrivateMessage
        */
        public onPrivateMessage(channelName: string, message: Message): void;
        /**
        @summary Called when user from friend list changes state.<br/ >
        Override to handle change state event.
        @param {string} userId User id.
        @param {number} status New User status. Predefined {@link Photon.chat.Constants.UserStatus Constants.UserStatus} or custom.
        @param {boolean} gotMessage True if status message updated.
        @param {string} statusMessage Optional status message (may be null even if gotMessage = true).
        @method Photon.Chat.ChatClient#onUserStatusUpdate
        */
        public onUserStatusUpdate(userId: string, status: number, gotMessage: boolean, statusMessage: string): void;
        /**
        @summary Connects to a specific region's Master server, using the NameServer to find the IP.
        Override {@link Photon.Chat.ChatClient#onWebRpcResult onWebRpcResult} to handle request results.<br/>
        @method Photon.Chat.ChatClient#connectToRegionFrontEnd
        @param {string} region Region connect to Master server of.
        @returns {boolean} True if current client state allows connection.
        **/
        public connectToRegionFrontEnd(region: string): boolean;
        /**
        @summary Returns true if client connected to Front End.When connected, client can send messages, subscribe to channels and so on.
        @return {boolean} True if connected.
        @method Photon.Chat.ChatClient#isConnectedToFrontEnd
        */
        public isConnectedToFrontEnd(): boolean;
        /**
        @summary Sends operation to subscribe to a list of channels by name.<br/>
        Override {@link Photon.Chat.ChatClient#onSubscribeResult onSubscribeResult} to handle request results.
        @param {string[]} channelNames Array of channel names to subscribe to.
        @param {number} [messagesFromHistory=0] Controls messages history sent on subscription. Not specified or 0: no history. 1 and higher: number of messages in history. -1: all history.
        @return {boolean} True if operation sent.
        @method Photon.Chat.ChatClient#subscribe
        */
        public subscribe(channelNames: string[], messagesFromHistory?: number): boolean;
        /**
        @summary Sends operation to unsubscribe from a list of channels by name.<br/ >
        Override {@link Photon.Chat.ChatClient#onUnsubscribeResult onUnsubscribeResult} to handle request results.
        @param {string[]} channelNames Array of channel names to unsubscribe from.
        @return {boolean} True if operation sent.
        @method Photon.Chat.ChatClient#unsubscribe
        */
        public unsubscribe(channelNames: string[]): boolean;
        /**
        @summary Sends a message to a public channel.<br/>
        Channel should be subscribed before publishing to it.
        Everyone in that channel will get the message.
        @param {string} channelName Channel name to send message to.
        @param {any} content Text string or arbitrary data to send.
        @return {boolean} True if message sent.
        @method Photon.Chat.ChatClient#publishMessage
        */
        public publishMessage(channelName: string, content: any): boolean;
        /**
        @summary Sends a private message to a single target user.<br/>
        @param {string} userId User id to send this message to.
        @param {any} content Text string or arbitrary data to send.
        @return {boolean} True if message sent.
        @method Photon.Chat.ChatClient#sendPrivateMessage
        */
        public sendPrivateMessage(userId: string, content: any): boolean;
        /**
        @summary Sets the user's status (pre-defined or custom) and an optional message.<br/>
        The predefined status values can be found in {@link Photon.Chat.Constants.UserStatus Constants.UserStatus}.<br/>
        State UserStatus.Invisible will make you offline for everyone and send no message.
        @param {number} status User status to set.
        @param {string} [message=null] State message.
        @param {boolean} [skipMessage=false] If true { client does not send state message.
        @return {boolean} True if command sent.
        @method Photon.Chat.ChatClient#setUserStatus
        */
        public setUserStatus(status: number, statusMessage?: string, skipMessage?: boolean): boolean;
        /**
        @summary Adds users to the list on the Chat Server which will send you status updates for those.
        @tparam string[] userIds Array of user ids.
        @return {boolean} True if command sent.
        */
        public addFriends(userIds: string[]): boolean;
        /**
        @summary Removes users from the list on the Chat Server which will send you status updates for those.
        @tparam string[] friends Array of user ids.
        @return {boolean} True if command sent.
        */
        public removeFriends(userIds: string[]): boolean;
        /**
        @summary Returns list of public channels client subscribed to.
        @return Channel[] Array of public channels.
        */
        public getPublicChannels(): {};
        /**
        @summary Returns list of channels representing current private conversation.
        @return Channel[] Array of private channels.
        */
        public getPrivateChannels(): {};
        private getOrAddChannel(channels, name, isPrivate);
        public initMasterPeer(mp: LoadBalancing.MasterPeer): void;
        private publicChannels;
        private privateChannels;
        private subscribeRequests;
        private unsubscribeRequests;
        static ChatPeerErrorCode: {
            Ok: number;
            FrontEndError: number;
            FrontEndConnectFailed: number;
            FrontEndConnectClosed: number;
            FrontEndTimeout: number;
            FrontEndEncryptionEstablishError: number;
            FrontEndAuthenticationFailed: number;
            NameServerError: number;
            NameServerConnectFailed: number;
            NameServerConnectClosed: number;
            NameServerTimeout: number;
            NameServerEncryptionEstablishError: number;
            NameServerAuthenticationFailed: number;
        };
        static ChatState: {
            Error: number;
            Uninitialized: number;
            ConnectingToNameServer: number;
            ConnectedToNameServer: number;
            ConnectingToFrontEnd: number;
            ConnectedToFrontEnd: number;
            Disconnected: number;
        };
        /**
        @summary Converts {@link Photon.Chat.ChatClient.ChatState ChatState} element to string name.
        @method Photon.Chat.ChatClient.StateToName
        @param {Photon.Chat.ChatClient.ChatState} state Client state.
        @returns {string} Specified element name or undefined if not found.
        */
        static StateToName(value: number): string;
    }
}
