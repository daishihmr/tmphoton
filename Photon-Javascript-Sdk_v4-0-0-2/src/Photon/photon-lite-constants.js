var Photon;
(function (Photon) {
    (function (Lite) {
        (function (Constants) {
            // Summary:
            //     Lite - keys for parameters of operation requests and responses (short: OpKey).
            //
            // Remarks:
            //     These keys match a definition in the Lite application (part of the server
            //     SDK).  If your game is built as extension of Lite, don't re-use these codes
            //     for your custom events.  These keys are defined per application, so Lite
            //     has different keys than MMO or your custom application. This is why these
            //     are not an enumeration.  Lite and Lite Lobby will use the keys 255 and lower,
            //     to give you room for your own codes.  Keys for operation-parameters could
            //     be assigned on a per operation basis, but it makes sense to have fixed keys
            //     for values which are used throughout the whole application.
            Constants.LiteOpKey = {
                // Summary:
                //     (252) Code for list of players in a room. Currently not used.
                ActorList: 252,
                //
                // Summary:
                //     (254) Code of the Actor of an operation. Used for property get and set.
                ActorNr: 254,
                //
                // Summary:
                //     (249) Code for property set (Hashtable).
                ActorProperties: 249,
                //
                // Summary:
                //     (238) The "Add" operation-parameter can be used to add something to some
                //     list or set. E.g. add groups to player's interest groups.
                Add: 238,
                //
                // Summary:
                //     (250) Code for broadcast parameter of OpSetProperties method.
                Broadcast: 250,
                //
                // Summary:
                //     (247) Code for caching events while raising them.
                Cache: 247,
                //
                // Summary:
                //     (244) Code used when sending some code-related parameter, like OpRaiseEvent's
                //     event-code.
                //
                // Remarks:
                //     This is not the same as the Operation's code, which is no longer sent as
                //     part of the parameter Dictionary in Photon 3.
                Code: 244,
                //
                // Summary:
                //     (245) Code of data of an event. Used in OpRaiseEvent.
                Data: 245,
                //
                // Summary:
                //     (255) Code of the game id (a unique room name). Used in OpJoin.
                GameId: 255,
                //
                // Summary:
                //     (248) Code for property set (Hashtable).
                GameProperties: 248,
                //
                // Summary:
                //     (240) Code for "group" operation-parameter (as used in Op RaiseEvent).
                Group: 240,
                //
                // Summary:
                //     (251) Code for property set (Hashtable). This key is used when sending only
                //     one set of properties.  If either ActorProperties or GameProperties are used
                //     (or both), check those keys.
                Properties: 251,
                //
                // Summary:
                //     (246) Code to select the receivers of events (used in Lite, Operation RaiseEvent).
                ReceiverGroup: 246,
                //
                // Summary:
                //     (239) The "Remove" operation-parameter can be used to remove something from
                //     a list. E.g. remove groups from player's interest groups.
                Remove: 239,
                //
                // Summary:
                //     (253) Code of the target Actor of an operation. Used for property set. Is
                //     0 for game.
                TargetActorNr: 253,
                //
                // Summary:
                //     (236) A parameter indicating how long a room instance should be keeped alive in the
                //     room cache after all players left the room.
                /// <summary>
                EmptyRoomLiveTime: 236
            };

            // Summary:
            //     Lite - Event codes.  These codes are defined by the Lite application's logic
            //     on the server side.  Other application's won't necessarily use these.
            //
            // Remarks:
            //     If your game is built as extension of Lite, don't re-use these codes for
            //     your custom events.
            Constants.LiteEventCode = {
                // Summary:
                //     (255) Event Join: someone joined the game
                Join: 255,
                //
                // Summary:
                //     (254) Event Leave: someone left the game
                Leave: 254,
                //
                // Summary:
                //     (253) Event PropertiesChanged
                PropertiesChanged: 253
            };

            // Summary:
            //     Lite - Operation Codes.  This enumeration contains the codes that are given
            //     to the Lite Application's operations. Instead of sending "Join", this enables
            //     us to send the byte 255.
            //
            // Remarks:
            //     Other applications (the MMO demo or your own) could define other operations
            //     and other codes.  If your game is built as extension of Lite, don't re-use
            //     these codes for your custom events.
            Constants.LiteOpCode = {
                // Summary:
                //     (248) Operation code to change interest groups in Rooms (Lite application
                //     and extending ones).
                ChangeGroups: 248,
                //
                // Summary:
                //     (251) Operation code for OpGetProperties.
                GetProperties: 251,
                //
                // Summary:
                //     (255) Code for OpJoin, to get into a room.
                Join: 255,
                //
                // Summary:
                //     (254) Code for OpLeave, to get out of a room.
                Leave: 254,
                //
                // Summary:
                //     (253) Code for OpRaiseEvent (not same as eventCode).
                RaiseEvent: 253,
                //
                // Summary:
                //     (252) Code for OpSetProperties.
                SetProperties: 252
            };
        })(Lite.Constants || (Lite.Constants = {}));
        var Constants = Lite.Constants;
    })(Photon.Lite || (Photon.Lite = {}));
    var Lite = Photon.Lite;
})(Photon || (Photon = {}));
//# sourceMappingURL=photon-lite-constants.js.map
