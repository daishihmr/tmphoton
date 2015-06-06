/// <reference path="photon-lite-constants.ts"/>

/** 
    Photon Load Balancing API Constants
    @namespace Photon.LoadBalancing.Constants
*/

module Photon.LoadBalancing.Constants {

    var LiteOpKey = Lite.Constants.LiteOpKey;
    var LiteOpCode = Lite.Constants.LiteOpCode;
    var LiteEventCode = Lite.Constants.LiteEventCode;

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
    export var ErrorCode =
    {
        Ok: 0,

        // server - Photon low(er) level: <: 0

        /// <summary>
        /// (-3) Operation can't be executed yet (e.g. OpJoin can't be called before being authenticated, RaiseEvent cant be used before getting into a room).
        /// </summary>
        /// <remarks>
        /// Before you call any operations on the Cloud servers, the automated client workflow must complete its authorization.
        /// In PUN, wait until State is: JoinedLobby (with AutoJoinLobby : true) or ConnectedToMaster (AutoJoinLobby : false)
        /// </remarks>
        OperationNotAllowedInCurrentState: -3,

        /// <summary>(-2) The operation you called is not implemented on the server (application) you connect to. Make sure you run the fitting applications.</summary>
        InvalidOperationCode: -2,

        /// <summary>(-1) Something went wrong in the server. Try to reproduce and contact Exit Games.</summary>
        InternalServerError: -1,

        // server - PhotonNetwork: 0x7FFF and down
        // logic-level error codes start with short.max

        /// <summary>(32767) Authentication failed. Possible cause: AppId is unknown to Photon (in cloud service).</summary>
        InvalidAuthentication: 0x7FFF,

        /// <summary>(32766) GameId (name) already in use (can't create another). Change name.</summary>
        GameIdAlreadyExists: 0x7FFF - 1,

        /// <summary>(32765) Game is full. This can when players took over while you joined the game.</summary>
        GameFull: 0x7FFF - 2,

        /// <summary>(32764) Game is closed and can't be joined. Join another game.</summary>
        GameClosed: 0x7FFF - 3,

        // AlreadyMatched: 0x7FFF - 4,

        /// <summary>(32762) Not in use currently.</summary>
        // ServerFull: 0x7FFF - 5,

        /// <summary>(32761) Not in use currently.</summary>
        // UserBlocked: 0x7FFF - 6,

        /// <summary>(32760) Random matchmaking only succeeds if a room exists thats neither closed nor full. Repeat in a few seconds or create a new room.</summary>
        NoRandomMatchFound: 0x7FFF - 7,

        /// <summary>(32758) Join can fail if the room (name) is not existing (anymore). This can happen when players leave while you join.</summary>
        GameDoesNotExist: 0x7FFF - 9,

        /// <summary>(32757) Authorization on the Photon Cloud failed becaus the concurrent users (CCU) limit of the app's subscription is reached.</summary>
        /// <remarks>
        /// Unless you have a plan with "CCU Burst", clients might fail the authentication step during connect. 
        /// Affected client are unable to call operations. Please note that players who end a game and return 
        /// to the Master server will disconnect and re-connect, which means that they just played and are rejected 
        /// in the next minute / re-connect.
        /// This is a temporary measure. Once the CCU is below the limit, players will be able to connect an play again.
        /// 
        /// OpAuthorize is part of connection workflow but only on the Photon Cloud, this error can happen. 
        /// Self-hosted Photon servers with a CCU limited license won't let a client connect at all.
        /// </remarks>
        MaxCcuReached: 0x7FFF - 10,

        /// <summary>(32756) Authorization on the Photon Cloud failed because the app's subscription does not allow to use a particular region's server.</summary>
        /// <remarks>
        /// Some subscription plans for the Photon Cloud are region-bound. Servers of other regions can't be used then.
        /// Check your Master server address and compare it with your Photon Cloud Dashboard's info.
        /// https://cloud.exitgames.com/dashboard
        /// 
        /// OpAuthorize is part of connection workflow but only on the Photon Cloud, this error can happen. 
        /// Self-hosted Photon servers with a CCU limited license won't let a client connect at all.
        /// </remarks>
        InvalidRegion: 0x7FFF - 11,
    }


    /// <summary>
    /// These  values define "well known" properties for an Actor / Player.
    /// </summary>
    /// <remarks>
    /// "Custom properties" have to use a string-type as key. They can be assigned at will.
    /// </remarks>
    export var ActorProperties =
    {
        /// <summary>(255) Name of a player/actor.</summary>
        PlayerName: 255, // was: 1
    }

    /** End user doesn't need this */
    /// <summary>
    /// These  values are for "well known" room/game properties used in Photon Loadbalancing.
    /// </summary>
    /// <remarks>
    /// "Custom properties" have to use a string-type as key. They can be assigned at will.
    /// </remarks>
    export var GameProperties =
    {
        /// <summary>(255) Max number of players that "fit" into this room. 0 is for "unlimited".</summary>
        MaxPlayers: 255,

        /// <summary>(254) Makes this room listed or not in the lobby on Master.</summary>
        IsVisible: 254,

        /// <summary>(253) Allows more players to join a room (or not).</summary>
        IsOpen: 253,

        /// <summary>(252) Current count od players in the room. Used only in the lobby on Master.</summary>
        PlayerCount: 252,

        /// <summary>(251) True if the room is to be removed from room listing (used in update to room list in lobby on Master)</summary>
        Removed: 251,

        /// <summary>(250) A list of the room properties to pass to the RoomInfo list in a lobby. This is used in CreateRoom, which defines this list once per room.</summary>
        PropsListedInLobby: 250,

        /// <summary>Equivalent of Operation Join parameter CleanupCacheOnLeave.</summary>
        CleanupCacheOnLeave: 249,
    }

    /** End user doesn't need this */
    /// <summary>
    /// These values are for events defined by Photon Loadbalancing.
    /// </summary>
    /// <remarks>They start at 255 and go DOWN. Your own in-game events can start at 0.</remarks>
    export var EventCode =
    {
        /// <summary>(230) Initial list of RoomInfos (in lobby on Master)</summary>
        GameList: 230,

        /// <summary>(229) Update of RoomInfos to be merged into "initial" list (in lobby on Master)</summary>
        GameListUpdate: 229,

        /// <summary>(228) Currently not used. State of queueing in case of server-full</summary>
        QueueState: 228,

        /// <summary>(227) Currently not used. Event for matchmaking</summary>
        // Match: 227,

        /// <summary>(226) Event with stats about this application (players, rooms, etc)</summary>
        AppStats: 226,

        /// <summary>(210) Internally used in case of hosting by Azure</summary>
        AzureNodeInfo: 210,

        /// <summary>(255) Event Join: someone joined the game. The new actorNumber is provided as well as the properties of that actor (if set in OpJoin).</summary>
        Join: LiteEventCode.Join,

        /// <summary>(254) Event Leave: The player who left the game can be identified by the actorNumber.</summary>
        Leave: LiteEventCode.Leave,

        /// <summary>(253) When you call OpSetProperties with the broadcast option "on", this event is fired. It contains the properties being set.</summary>
        PropertiesChanged: LiteEventCode.PropertiesChanged,

        /// <summary>(252) When player left game unexpecable and playerTtl > 0 this event is fired</summary>
        Disconnect: 252,

        LobbyStats: 224,
    }

    /** End user doesn't need this */
    /// <summary>Codes for parameters of Operations and Events.</summary>
    export var ParameterCode =
    {
        /// <summary>(230) Address of a (Game) server to use.</summary>
        Address: 230,

        /// <summary>(229) Count of players in this application in a rooms (used in stats event)</summary>
        PeerCount: 229,

        /// <summary>(228) Count of games in this application (used in stats event)</summary>
        GameCount: 228,

        /// <summary>(227) Count of players on the Master server (in this app, looking for rooms)</summary>
        MasterPeerCount: 227,

        /// <summary>(225) User's ID</summary>
        UserId: 225,

        /// <summary>(224) Your application's ID: a name on your own Photon or a GUID on the Photon Cloud</summary>
        ApplicationId: 224,

        /// <summary>(223) Not used currently (as "Position"). If you get queued before connect, this is your position</summary>
        Position: 223,

        /// <summary>(223) Modifies the matchmaking algorithm used for OpJoinRandom. Allowed parameter values are defined in enum MatchmakingMode.</summary>
        MatchMakingType: 223,

        /// <summary>(222) List of RoomInfos about open / listed rooms</summary>
        GameList: 222,

        /// <summary>(221) Internally used to establish encryption</summary>
        Secret: 221,

        /// <summary>(220) Version of your application</summary>
        AppVersion: 220,

        /// <summary>(210) Internally used in case of hosting by Azure</summary>
        AzureNodeInfo: 210,	// only used within events, so use: EventCode.AzureNodeInfo

        /// <summary>(209) Internally used in case of hosting by Azure</summary>
        AzureLocalNodeId: 209,

        /// <summary>(208) Internally used in case of hosting by Azure</summary>
        AzureMasterNodeId: 208,

        /// <summary>(255) Code for the gameId/roomName (a unique name per room). Used in OpJoin and similar.</summary>
        RoomName: LiteOpKey.GameId,

        /// <summary>(250) Code for broadcast parameter of OpSetProperties method.</summary>
        Broadcast: LiteOpKey.Broadcast,

        /// <summary>(252) Code for list of players in a room. Currently not used.</summary>
        ActorList: LiteOpKey.ActorList,

        /// <summary>(254) Code of the Actor of an operation. Used for property get and set.</summary>
        ActorNr: LiteOpKey.ActorNr,

        /// <summary>(249) Code for property set (Hashtable).</summary>
        PlayerProperties: LiteOpKey.ActorProperties,

        /// <summary>(245) Code of data/custom content of an event. Used in OpRaiseEvent.</summary>
        CustomEventContent: LiteOpKey.Data,

        /// <summary>(245) Code of data of an event. Used in OpRaiseEvent.</summary>
        Data: LiteOpKey.Data,

        /// <summary>(244) Code used when sending some code-related parameter, like OpRaiseEvent's event-code.</summary>
        /// <remarks>This is not the same as the Operation's code, which is no longer sent as part of the parameter Dictionary in Photon 3.</remarks>
        Code: LiteOpKey.Code,

        /// <summary>(248) Code for property set (Hashtable).</summary>
        GameProperties: LiteOpKey.GameProperties,

        /// <summary>
        /// (251) Code for property-set (Hashtable). This key is used when sending only one set of properties.
        /// If either ActorProperties or GameProperties are used (or both), check those keys.
        /// </summary>
        Properties: LiteOpKey.Properties,

        /// <summary>(253) Code of the target Actor of an operation. Used for property set. Is 0 for game</summary>
        TargetActorNr: LiteOpKey.TargetActorNr,

        /// <summary>(246) Code to select the receivers of events (used in Lite, Operation RaiseEvent).</summary>
        ReceiverGroup: LiteOpKey.ReceiverGroup,

        /// <summary>(247) Code for caching events while raising them.</summary>
        Cache: LiteOpKey.Cache,

        /// <summary>(241) Boolean parameter of CreateGame Operation. If true, server cleans up roomcache of leaving players (their cached events get removed).</summary>
        CleanupCacheOnLeave: 241,

        /// <summary>(240) Code for "group" operation-parameter (as used in Op RaiseEvent).</summary>
        Group: LiteOpKey.Group,

        /// <summary>(239) The "Remove" operation-parameter can be used to remove something from a list. E.g. remove groups from player's interest groups.</summary>
        Remove: LiteOpKey.Remove,

        /// <summary>(238) The "Add" operation-parameter can be used to add something to some list or set. E.g. add groups to player's interest groups.</summary>
        Add: LiteOpKey.Add,

        /// <summary>(236) A parameter indicating how long a room instance should be keeped alive in the room cache after all players left the room.</summary>
        EmptyRoomTTL: LiteOpKey.EmptyRoomLiveTime,

        PlayerTTL: 235,

        /// <summary>(217) This key's (byte) value defines the target custom authentication type/service the client connects with. Used in OpAuthenticate.</summary>
        ClientAuthenticationType: 217,

        /// <summary>(216) This key's (string) value provides parameters sent to the custom authentication type/service the client connects with. Used in OpAuthenticate.</summary>
        ClientAuthenticationParams: 216,

        ClientAuthenticationData: 214,

        /// <summary>(215) The JoinMode enum defines which variant of joining a room will be executed: Join only if available, create if not exists or re -join.</summary >
        /// <remarks>Replaces CreateIfNotExists which was only a bool -value.</remarks >
        JoinMode: 215,

        /// <summary>(1) Used in Op FindFriends request. Value must be string[] of friends to look up.</summary>
        FindFriendsRequestList: 1,

        /// <summary>(1) Used in Op FindFriends response. Contains boolean[] list of online states (false if not online).</summary>
        FindFriendsResponseOnlineList: 1,

        /// <summary>(2) Used in Op FindFriends response. Contains string[] of room names ("" where not known or no room joined).</summary>
        FindFriendsResponseRoomIdList: 2,

        /// <summary>(213) Used in matchmaking-related methods and when creating a room to name a lobby (to join or to attach a room to).</summary>
        LobbyName: 213,

        /// <summary>(213) Used in matchmaking-related methods and when creating a room to define the type of a lobby. Combined with the lobby name this identifies the lobby.</summary>
        LobbyType: 212,

        LobbyStats: 211,

        /// <summary>(210) Used for region values in OpAuth and OpGetRegions.</summary >
        Region: 210,

        IsInactive: 233,
        CheckUserOnJoin: 232,

        UriPath: 209,
        RpcCallParams: 208,

        RpcCallRetCode: 207,
        RpcCallRetMessage: 206,
        RpcCallRetData: 208,

        Forward: 234,
    }

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
    export var OperationCode =
    {
        /// <summary>(230) Authenticates this peer and connects to a virtual application</summary>
        Authenticate: 230,

        /// <summary>(229) Joins lobby (on Master)</summary>
        JoinLobby: 229,

        /// <summary>(228) Leaves lobby (on Master)</summary>
        LeaveLobby: 228,

        /// <summary>(227) Creates a game (or fails if name exists)</summary>
        CreateGame: 227,

        /// <summary>(226) Join game (by name)</summary>
        JoinGame: 226,

        /// <summary>(225) Joins random game (on Master)</summary>
        JoinRandomGame: 225,

        // CancelJoinRandom : 224, // obsolete, cause JoinRandom no longer is a "process". now provides result immediately

        /// <summary>(254) Code for OpLeave, to get out of a room.</summary>
        Leave: LiteOpCode.Leave,

        /// <summary>(253) Raise event (in a room, for other actors/players)</summary>
        RaiseEvent: LiteOpCode.RaiseEvent,

        /// <summary>(252) Set Properties (of room or actor/player)</summary>
        SetProperties: LiteOpCode.SetProperties,

        /// <summary>(251) Get Properties</summary>
        GetProperties: LiteOpCode.GetProperties,

        /// <summary>(248) Operation code to change interest groups in Rooms (Lite application and extending ones).</summary>
        ChangeGroups: LiteOpCode.ChangeGroups,

        /// <summary>(222) Request the rooms and online status for a list of friends (by name, which should be unique).</summary>
        FindFriends: 222,

        LobbyStats: 221,

        /// <summary>(220) Gets list of regional servers from a NameServer.</summary>
        GetRegions: 220,

        /// <summary>(219) Rpc Operation.</summary>
        Rpc: 219,

    }

    /** 
        @summary Options for matchmaking rules for joinRandomGame.
        @member Photon.LoadBalancing.Constants.MatchmakingMode
        @readonly
        @property {number} FillRoom Default. FillRoom Fills up rooms (oldest first) to get players together as fast as possible. Makes most sense with MaxPlayers > 0 and games that can only start with more players.
        @property {number} SerialMatching Distributes players across available rooms sequentially but takes filter into account. Without filter, rooms get players evenly distributed.
        @property {number} RandomMatching Joins a (fully) random room. Expected properties must match but aside from this, any available room might be selected.
    */
    export var MatchmakingMode =
    {
        /// <summary>Fills up rooms (oldest first) to get players together as fast as possible. Default.</summary>
        /// <remarks>Makes most sense with MaxPlayers > 0 and games that can only start with more players.</remarks>
        FillRoom: 0,
        /// <summary>Distributes players across available rooms sequentially but takes filter into account. Without filter, rooms get players evenly distributed.</summary>
        SerialMatching: 1,
        /// <summary>Joins a (fully) random room. Expected properties must match but aside from this, any available room might be selected.</summary>
        RandomMatching: 2
    }

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
    export var EventCaching =
    {
        // Summary:
        //     Default value (not sent).
        DoNotCache: 0,
        //
        // Summary:
        //     Will merge this event's keys with those already cached.
        MergeCache: 1,
        //
        // Summary:
        //     Replaces the event cache for this eventCode with this event's content.
        ReplaceCache: 2,
        //
        // Summary:
        //     Removes this event (by eventCode) from the cache.
        RemoveCache: 3,
        //
        // Summary:
        //     Adds an event to the room's cache.
        AddToRoomCache: 4,
        //
        // Summary:
        //     Adds this event to the cache for actor 0 (becoming a "globally owned" event
        //     in the cache).
        AddToRoomCacheGlobal: 5,
        //
        // Summary:
        //     Remove fitting event from the room's cache.
        RemoveFromRoomCache: 6,
        //
        // Summary:
        //     Removes events of players who already left the room (cleaning up).
        RemoveFromRoomCacheForActorsLeft: 7,
    }

    /** 
        @summary Options for choosing room's actors who should receive events.
        @member Photon.LoadBalancing.Constants.ReceiverGroup
        @readonly
        @property {number} Others Default. Anyone else gets my event.
        @property {number} All Everyone in the current room (including this peer) will get this event.
        @property {number} MasterClient The "master client" does not have special rights but is the one who is in this room the longest time.
    */
    export var ReceiverGroup =
    {
        // Summary:
        //     Default value (not sent). Anyone else gets my event.
        Others: 0,
        //
        // Summary:
        //     Everyone in the current room (including this peer) will get this event.
        All: 1,
        //
        // Summary:
        //     The server sends this event only to the actor with the lowest actorNumber.
        //
        // Remarks:
        //     The "master client" does not have special rights but is the one who is in
        //     this room the longest time.
        MasterClient: 2,
    }

    /** 
        @summary Options for optional "Custom Authentication" services used with Photon.
        @member Photon.LoadBalancing.Constants.CustomAuthenticationType
        @readonly
        @property {number} Custom Default. Use a custom authentification service. 
        @property {number} Steam Authenticates users by their Steam Account. Set auth values accordingly.
        @property {number} Facebook Authenticates users by their Facebook Account. Set auth values accordingly.
        @property {number} None Disables custom authentification.
    */
    export var CustomAuthenticationType =
    {
        Custom: 0,
        Steam: 1,
        Facebook: 2,
        None: 255
        }

    /**
        @summary Options of lobby types available. Lobby types might be implemented in certain Photon versions and won't be available on older servers.
        @member Photon.LoadBalancing.Constants.LobbyType
        @readonly
        @property {number} Default This lobby is used unless another is defined by game or JoinRandom. Room-lists will be sent and JoinRandomRoom can filter by matching properties.
        @property {number} SqlLobby This lobby type lists rooms like Default but JoinRandom has a parameter for SQL-like "where" clauses for filtering. This allows bigger, less, or and and combinations.
    **/
    export var LobbyType =
    {
        Default: 1,
        SqlLobby: 2
    }

}

