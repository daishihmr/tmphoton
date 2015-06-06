/// <reference path="photon.ts"/>

/** 
    Photon Chat API Constants
    @namespace Photon.Chat.Constants
*/

module Photon.Chat.Constants {
    export var ParameterCode =
    {
        Channels: 0,           // Array of chat channels.
        Channel: 1,            // Name of a single chat channel.
        Messages: 2,           // Array of chat messages.
        Message: 3,            // A single chat message.
        Senders: 4,            // Array of names of the users who sent the array of chat mesages.
        Sender: 5,             // Name of a the user who sent a chat message.
        ChannelUserCount: 6,   // Not used.
        UserId: 225,             // Name of user to send a(private) message to.
        MsgId: 8,              // Id of a message.
        MsgIds: 9,             // Not used.
        SubscribeResults: 15,  // Subscribe operation result parameter.A boolean[] with result per channel.
        Status: 10,            // Status 
        Friends: 11,           // Friends 
        SkipMessage: 12,       // SkipMessage is used in SetUserStatus and if true, the message is not being broadcast.
        HistoryLength: 14      // Number of message to fetch from history. 0: no history. 1 and higher: number of messages in history. -1: all history.</summary>
    }

    //- Codes for parameters and events used in Photon Chat API.
    export var OperationCode =
    {
        Subscribe: 0,          // Operation to subscribe to chat channels.
        Unsubscribe: 1,        // Operation to unsubscribe from chat channels.
        Publish: 2,            // Operation to publish a message in a chat channel.
        SendPrivate: 3,        // Operation to send a private message to some other user.
        ChannelHistory: 4,     // Not used yet.
        UpdateStatus: 5,       // Set your (client's) status.
        AddFriendds: 6,        // Adds users to the list that should update you of their status.
        RemoveFriends: 7       // Removes users from the list that should update you of their status.
    }

    export var EventCode =
    {
        ChatMessages: 0,
        Users: 1,             // List of users or List of changes for List of users
        PrivateMessage: 2,
        FriendsList: 3,
        StatusUpdate: 4,
        Subscribe: 5,
        Unsubscribe: 6
    }

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
    export var UserStatus =
    {
        Offline: 0,
        Invisible: 1,
        Online: 2,
        Away: 3,
        Dnd: 4,
        Lfg: 5,
        Playing: 6,
    }

    /**
        @summary Converts {@link Photon.Chat.Constants.UserStatus} element to string name.
        @param {Photon.Chat.Constants.UserStatus} status User status enum element.
        @returns {string} Specified element name or undefined if not found.
        @method Photon.Chat.Constants.UserStatusToName
    */
    export function UserStatusToName(status: number): string { return Exitgames.Common.Util.getEnumKeyByValue(UserStatus, status); }
}