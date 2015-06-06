
/// <reference path="photon-loadbalancing.ts"/>
/// <reference path="photon-chat-constants.ts"/>

/** 
    Photon Chat API
    @namespace Photon.Chat
*/

module Photon.Chat {
    /**
        @class Photon.Chat.Message
        @classdesc Encapsulates chat message data.
    */
    export class Message {
        constructor(private sender: string, private content: any) { }
        /**
            @summary Returns message sender.
            @return {string} Message sender.
            @method Photon.Chat.Message#getSender
        */
        getSender(): string {
            return this.sender;
        }

        /**
            @summary Returns message content.
            @return {any} Message content.
            @method Photon.Chat.Message#getContent
        */
        getContent(): any {
            return this.content;
        }
    }

    /**
        @class Photon.Chat.Channel
        @classdesc Represents chat channel.
    */
    export class Channel {
        private messages: Message[] = [];
        constructor(private name: string, private isPrivat: boolean) {
        }

        /**
            @summary Returns channel name (counterpart user id for private channel).
            @return {string} Channel name.
            @method Photon.Chat.Channel#getName
        */
        getName(): string {
            return this.name;
        }

        /**
            @summary Returns true if channel is private.
            @return {boolean} Channel private status.
            @method Photon.Chat.Channel#isPrivate
        */
        isPrivate(): boolean {
            return this.isPrivat;
        }

        /**
            @summary Returns messages cache.
            @return {{@link Photon.Chat.Message}[]} Array of messages.
            @method Photon.Chat.Channel#getMessages
        */
        getMessages(): Message[] {
            return this.messages;
        }

        /**
            @summary Clears messages cache.
            @method Photon.Chat.Channel#clearMessages
        */
        clearMessages(): void {
            this.messages.splice(0);
        }

        // internal
        addMessage(m: any) {
            this.messages.push(m);
        }

        // internal
        addMessages(senders: string[], messages: any[]): any[] {
            var newMessages: any[] = [];
	        for (var i in senders) {
		        if (i < messages.length) {
			        var m = new Message(senders[i], messages[i]);
			        this.addMessage(m);
			        newMessages.push(m);
		        }
	        }
	        return newMessages
        }

    }
    export class ChatClient extends Photon.LoadBalancing.LoadBalancingClient {

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
        constructor(protocol: number, appId: string, appVersion: string) {
            super(protocol, appId, appVersion);
            this.autoJoinLobby = false;
        }

        /** 
            @summary Called on client state change. Override to handle it.
            @method Photon.Chat.ChatClient#onStateChange
            @param {Photon.Chat.ChatClient.ChatState} state New client state.
        */
        onStateChange(state: number) { }

        /** 
            @summary Called if client error occures. Override to handle it.
            @method Chat.ChatClient#onError
            @param {Chat.ChatClient.ChatPeerErrorCode} errorCode Client error code.
            @param {string} errorMsg Error message.
        */
        onError(errorCode: number, errorMsg: string) { this.logger.error("Load Balancing Client Error", errorCode, errorMsg); }

        /**
            @summary Called when {@link Photon.Chat.ChatClient#subscribe subscribe} request completed.<br/ >
            Override to handle request results.
            @param {object} results Object with channel names as keys and boolean results as values.
            @method Photon.Chat.ChatClient#onSubscribeResult
        */
        onSubscribeResult(results: Object) { }

        /**
            @summary Called when {@link Photon.Chat.ChatClient#unsubscribe unsubscribe} request completed.<br/ >
            Override to handle request results.
            @param {object} results Object with channel names as keys and boolean results as values.
            @method Photon.Chat.ChatClient#onUnsubscribeResult
        */
        onUnsubscribeResult(results: Object) { }

        /**
            @summary Called when new chat messages received.<br/ >
            Override to handle messages receive event.
            @param {string} channelName Chat channel name.
            @param {{@link Photon.Chat.Message}[]} messages Array of received messages.
            @method Photon.Chat.ChatClient#onChatMessages
        */
        onChatMessages(channelName: string, messages: Message[]) { }

        /**
            @summary Called when new private message received.<br/ >
            Override to handle message receive event.
            @param {string} channelName Private channel name(counterpart user id).
            @param {Photon.Chat.Message} message Received message.
            @method Photon.Chat.ChatClient#onPrivateMessage
        */
        onPrivateMessage(channelName: string, message: Message) { }

        /**
            @summary Called when user from friend list changes state.<br/ >
            Override to handle change state event.
            @param {string} userId User id.
            @param {number} status New User status. Predefined {@link Photon.chat.Constants.UserStatus Constants.UserStatus} or custom.
            @param {boolean} gotMessage True if status message updated.
            @param {string} statusMessage Optional status message (may be null even if gotMessage = true).
            @method Photon.Chat.ChatClient#onUserStatusUpdate
        */
        onUserStatusUpdate(userId: string, status: number, gotMessage: boolean, statusMessage: string) { }

        /** 
            @summary Connects to a specific region's Master server, using the NameServer to find the IP.
            Override {@link Photon.Chat.ChatClient#onWebRpcResult onWebRpcResult} to handle request results.<br/>
            @method Photon.Chat.ChatClient#connectToRegionFrontEnd
            @param {string} region Region connect to Master server of.
            @returns {boolean} True if current client state allows connection.
        **/
        public connectToRegionFrontEnd(region: string) {
            return this.connectToRegionMaster(region);
        }

        /**
            @summary Returns true if client connected to Front End.When connected, client can send messages, subscribe to channels and so on.
            @return {boolean} True if connected.
            @method Photon.Chat.ChatClient#isConnectedToFrontEnd
        */
        isConnectedToFrontEnd(): boolean {
            return this.state == ChatClient.ChatState.ConnectedToFrontEnd;
        }

        /**
            @summary Sends operation to subscribe to a list of channels by name.<br/>
            Override {@link Photon.Chat.ChatClient#onSubscribeResult onSubscribeResult} to handle request results.
            @param {string[]} channelNames Array of channel names to subscribe to.
            @param {number} [messagesFromHistory=0] Controls messages history sent on subscription. Not specified or 0: no history. 1 and higher: number of messages in history. -1: all history.
            @return {boolean} True if operation sent.
            @method Photon.Chat.ChatClient#subscribe
        */
        subscribe(channelNames: string[], messagesFromHistory: number = 0): boolean {
            if (this.isConnectedToFrontEnd()) {
                this.logger.debug("Subscribe channels:", channelNames);
                var params = [];
                params.push(Constants.ParameterCode.Channels, channelNames);
                if (messagesFromHistory != undefined && messagesFromHistory != 0) {
                    params.push(Constants.ParameterCode.HistoryLength, messagesFromHistory);
                }
                this.masterPeer.sendOperation(Constants.OperationCode.Subscribe, params);
                return true;
            }
            else {
                this.logger.error("subscribe request error:", "Not connected to Front End");
                return false;
            }
        }

        /** 
            @summary Sends operation to unsubscribe from a list of channels by name.<br/ >
            Override {@link Photon.Chat.ChatClient#onUnsubscribeResult onUnsubscribeResult} to handle request results.
            @param {string[]} channelNames Array of channel names to unsubscribe from.
            @return {boolean} True if operation sent.
            @method Photon.Chat.ChatClient#unsubscribe
        */
        unsubscribe(channelNames: string[]): boolean {
            if (this.isConnectedToFrontEnd()) {
                this.logger.debug("Unsubscribe channels:", channelNames);
                var params = [];
                params.push(Constants.ParameterCode.Channels, channelNames);
                this.masterPeer.sendOperation(Constants.OperationCode.Unsubscribe, params);
                return true;
            }
            else {
                this.logger.error("unsubscribe request error:", "Not connected to Front End");
		        return false
	        }
        }

        /** 
            @summary Sends a message to a public channel.<br/>
            Channel should be subscribed before publishing to it.
            Everyone in that channel will get the message.
            @param {string} channelName Channel name to send message to.
            @param {any} content Text string or arbitrary data to send.
            @return {boolean} True if message sent.
            @method Photon.Chat.ChatClient#publishMessage
        */
        publishMessage(channelName: string, content: any): boolean {
            if (this.isConnectedToFrontEnd()) {
                var params = [];
                params.push(Constants.ParameterCode.Channel, channelName);
                params.push(Constants.ParameterCode.Message, content);
                this.masterPeer.sendOperation(Constants.OperationCode.Publish, params);
                return true;
            }
            else {
                this.logger.error("publishMessage request error:", "Not connected to Front End");
                return false;
            }
        }

        /** 
            @summary Sends a private message to a single target user.<br/>
            @param {string} userId User id to send this message to.
            @param {any} content Text string or arbitrary data to send.
            @return {boolean} True if message sent.
            @method Photon.Chat.ChatClient#sendPrivateMessage
        */
        sendPrivateMessage(userId: string, content: any): boolean {
            if (this.isConnectedToFrontEnd()) {
                var params = [];
                params.push(Constants.ParameterCode.UserId, userId);
                params.push(Constants.ParameterCode.Message, content);
                this.masterPeer.sendOperation(Constants.OperationCode.SendPrivate, params);
                return true;
            }
            else {
                this.logger.error("sendPrivateMessage request error:", "Not connected to Front End");
                return false;
            }
        }

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
        setUserStatus(status: number, statusMessage: string = null, skipMessage: boolean = false): boolean {
            if (this.isConnectedToFrontEnd()) {
                var params = [];
                params.push(Constants.ParameterCode.Status, status);
                if (skipMessage)
                    params.push(Constants.ParameterCode.SkipMessage, true);
                else
                    params.push(Constants.ParameterCode.Message, statusMessage)
			    this.masterPeer.sendOperation(Constants.OperationCode.UpdateStatus, params)
			    return true
		    }
            else {
                this.logger.error("setUserStatus request error:", "Not connected to Front End");
		        return false
            }
        }

        /** 
            @summary Adds users to the list on the Chat Server which will send you status updates for those.
            @tparam string[] userIds Array of user ids.
            @return {boolean} True if command sent.
        */
        addFriends(userIds: string[]): boolean {
            if (this.isConnectedToFrontEnd()) {
                var params = [];
                params.push(Constants.ParameterCode.Friends, userIds);
                this.masterPeer.sendOperation(Constants.OperationCode.AddFriendds, params);
                return true;
            }
            else {
                this.logger.error("addFriends request error:", "Not connected to Front End");
                return false;
            }
        }

        /** 
            @summary Removes users from the list on the Chat Server which will send you status updates for those.
            @tparam string[] friends Array of user ids.
            @return {boolean} True if command sent.
        */
        removeFriends(userIds: string[]): boolean {
            if (this.isConnectedToFrontEnd()) {
                var params = [];
                params.push(Constants.ParameterCode.Friends, userIds);
                this.masterPeer.sendOperation(Constants.OperationCode.RemoveFriends, params);
                return true;
            }
            else {
                this.logger.error("removeFriends request error:", "Not connected to Front End");
                return false;
            }
        }

        /** 
            @summary Returns list of public channels client subscribed to.
            @return Channel[] Array of public channels.
        */
        getPublicChannels() {
            return this.publicChannels;
        }

        /** 
            @summary Returns list of channels representing current private conversation.
            @return Channel[] Array of private channels.
        */
        getPrivateChannels() {
            return this.privateChannels;
        }

        // private
        private getOrAddChannel(channels: Object, name: string, isPrivate: boolean) {
            if (channels[name] == undefined) {
                channels[name] = new Channel(name, isPrivate);
            }
            return channels[name];
        }

        // internal
        initMasterPeer(mp: Photon.LoadBalancing.MasterPeer) {
            super.initMasterPeer(mp);

            // onOperationResponse called if no listener exists
            //mp.addResponseListener(Constants.OperationCode.Publish, (data: any) => {
            //    mp._logger.debug("resp Publish", data.errCode, data.errMsg);
            //});
            //mp.addResponseListener(Constants.OperationCode.SendPrivate, (data: any) => {
            //    mp._logger.debug("resp SendPrivate", data.errCode, data.errMsg);
            //});
            //mp.addResponseListener(Constants.OperationCode.UpdateStatus, (data: any) => {
            //    mp._logger.debug("resp UpdateStatus", data.errCode, data.errMsg);
            //});
            //mp.addResponseListener(Constants.OperationCode.FriendList, (data: any) => {
            //    mp._logger.debug("resp FriendList", data.errCode, data.errMsg);
            //});

            mp.addEventListener(Constants.EventCode.ChatMessages, (data: any) => {
                var senders = data.vals[Constants.ParameterCode.Senders];
                var messages = data.vals[Constants.ParameterCode.Messages];
                var channelName = data.vals[Constants.ParameterCode.Channel];
                var ch = this.publicChannels[channelName];
                if (ch) {
                    var newMessages = ch.addMessages(senders, messages);
                    this.onChatMessages(channelName, newMessages);
                }
                else {
                    mp._logger.warn("ev ChatMessages: Got message from unsubscribed channel ", channelName);
                }
            })

            mp.addEventListener(Constants.EventCode.PrivateMessage, (data: any) => {
                var sender = data.vals[Constants.ParameterCode.Sender];
                var message = data.vals[Constants.ParameterCode.Message];
                var userId = data.vals[Constants.ParameterCode.UserId];
                var channelName = "";
                if (this.getUserId() == sender)
                    channelName = userId;
                else
                    channelName = sender;
                var ch = this.getOrAddChannel(this.privateChannels, channelName, true);
                this.onPrivateMessage(channelName, new Message(sender, message));
            })

            mp.addEventListener(Constants.EventCode.StatusUpdate, (data: any) => {
                var sender = data.vals[Constants.ParameterCode.Sender];
                var status = data.vals[Constants.ParameterCode.Status];
                var message = data.vals[Constants.ParameterCode.Message];
                var gotMessage = message !== undefined;
                this.onUserStatusUpdate(sender, status, gotMessage, message)
            })

            mp.addEventListener(Constants.EventCode.Subscribe, (data: any) => {
                mp._logger.debug("ev Subscribe", data);
                var res = {};
                var channels = data.vals[Constants.ParameterCode.Channels] || [];
                var results = data.vals[Constants.ParameterCode.SubscribeResults] || [];
                for (var i in channels) {
                    var ch = channels[i];
                    res[ch] = false;
                    if (i < results.length && results[i]) {
                        this.getOrAddChannel(this.publicChannels, ch, false);
                        res[ch] = true;
                    }
                }
                this.onSubscribeResult(res)
	        });

            mp.addEventListener(Constants.EventCode.Unsubscribe, (data: any) => {
                mp._logger.debug("ev Unsubscribe", data);
                var res = {};
                var channels = data.vals[Constants.ParameterCode.Channels] || [];
                for (var i in channels) {
                    var ch = channels[i];
                    delete (this.publicChannels[ch]);
                    res[ch] = true;
                }
                this.onUnsubscribeResult(res);
            });

        }


        private publicChannels = {};
        private privateChannels = {};
        private subscribeRequests: string[][] = []
        private unsubscribeRequests: string[][] = []

        public static ChatPeerErrorCode = {
            /**
                @summary Enum for client peers error codes.
                @member Photon.Chat.ChatClient.ChatPeerErrorCode
                @readonly
                @property {number} Ok No Error.
                @property {number} FrontEndError General FrontEnd server peer error.
                @property {number} FrontEndConnectFailed FrontEnd server connection error.
                @property {number} FrontEndConnectClosed Disconnected from FrontEnd server.
                @property {number} FrontEndTimeout Disconnected from FrontEnd server for timeout.
                @property {number} FrontEndEncryptionEstablishError FrontEnd server encryption establishing failed.
                @property {number} FrontEndAuthenticationFailed FrontEnd server authentication failed.
                @property {number} NameServerError General NameServer peer error.
                @property {number} NameServerConnectFailed NameServer connection error.
                @property {number} NameServerConnectClosed Disconnected from NameServer.
                @property {number} NameServerTimeout Disconnected from NameServer for timeout.
                @property {number} NameServerEncryptionEstablishError NameServer encryption establishing failed.
                @property {number} NameServerAuthenticationFailed NameServer authentication failed.
             */

            Ok: 0,
            FrontEndError: 1001,
            FrontEndConnectFailed: 1002,
            FrontEndConnectClosed: 1003,
            FrontEndTimeout: 1004,
            FrontEndEncryptionEstablishError: 1005,
            FrontEndAuthenticationFailed: 1101,
            NameServerError: 3001,
            NameServerConnectFailed: 3002,
            NameServerConnectClosed: 3003,
            NameServerTimeout: 3004,
            NameServerEncryptionEstablishError: 300,
            NameServerAuthenticationFailed: 3101,
        };
        public static ChatState = {
            /**
                @summary Enum for client states.
                @member Photon.Chat.ChatClient.ChatState
                @readonly
                @property {number} Error Critical error occurred.
                @property {number} Uninitialized Client is created but not used yet.
                @property {number} ConnectingToNameServer Connecting to NameServer.
                @property {number} ConnectedToNameServer Connected to NameServer.
                @property {number} ConnectingToFrontEnd Connecting to FrontEnd server.
                @property {number} ConnectedToFrontEnd Connected to FrontEnd server.
                @property {number} Disconnected The client is no longer connected (to any server).
            */
            Error: -1,
            Uninitialized: 0,
            ConnectingToNameServer: 1,
            ConnectedToNameServer: 2,
            ConnectingToFrontEnd: 3,
            ConnectedToFrontEnd: 4,
            Disconnected: 10,
        };

        /** 
            @summary Converts {@link Photon.Chat.ChatClient.ChatState ChatState} element to string name.
            @method Photon.Chat.ChatClient.StateToName
            @param {Photon.Chat.ChatClient.ChatState} state Client state.
            @returns {string} Specified element name or undefined if not found.
        */
        public static StateToName(value: number) {
            var x = Exitgames.Common.Util.getEnumKeyByValue(ChatClient.ChatState, value);
            if (x === undefined) { 
                // Super class states support - useless since all states overridden but may help somehow when debugging
                return Exitgames.Common.Util.getEnumKeyByValue(ChatClient.State, value);
            }
            else {
                return x;
            }
        }
    }
}