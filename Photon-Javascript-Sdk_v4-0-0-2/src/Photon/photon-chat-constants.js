/// <reference path="photon.ts"/>
var Photon;
(function (Photon) {
    (function (Chat) {
        /**
        Photon Chat API Constants
        @namespace Photon.Chat.Constants
        */
        (function (Constants) {
            Constants.ParameterCode = {
                Channels: 0,
                Channel: 1,
                Messages: 2,
                Message: 3,
                Senders: 4,
                Sender: 5,
                ChannelUserCount: 6,
                UserId: 225,
                MsgId: 8,
                MsgIds: 9,
                SubscribeResults: 15,
                Status: 10,
                Friends: 11,
                SkipMessage: 12,
                HistoryLength: 14
            };

            //- Codes for parameters and events used in Photon Chat API.
            Constants.OperationCode = {
                Subscribe: 0,
                Unsubscribe: 1,
                Publish: 2,
                SendPrivate: 3,
                ChannelHistory: 4,
                UpdateStatus: 5,
                AddFriendds: 6,
                RemoveFriends: 7
            };

            Constants.EventCode = {
                ChatMessages: 0,
                Users: 1,
                PrivateMessage: 2,
                FriendsList: 3,
                StatusUpdate: 4,
                Subscribe: 5,
                Unsubscribe: 6
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
            Constants.UserStatus = {
                Offline: 0,
                Invisible: 1,
                Online: 2,
                Away: 3,
                Dnd: 4,
                Lfg: 5,
                Playing: 6
            };

            /**
            @summary Converts {@link Photon.Chat.Constants.UserStatus} element to string name.
            @param {Photon.Chat.Constants.UserStatus} status User status enum element.
            @returns {string} Specified element name or undefined if not found.
            @method Photon.Chat.Constants.UserStatusToName
            */
            function UserStatusToName(status) {
                return Exitgames.Common.Util.getEnumKeyByValue(Constants.UserStatus, status);
            }
            Constants.UserStatusToName = UserStatusToName;
        })(Chat.Constants || (Chat.Constants = {}));
        var Constants = Chat.Constants;
    })(Photon.Chat || (Photon.Chat = {}));
    var Chat = Photon.Chat;
})(Photon || (Photon = {}));
//# sourceMappingURL=photon-chat-constants.js.map
