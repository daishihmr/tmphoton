/**
Photon
@namespace Photon
*/
var Photon;
(function (Photon) {
    /**
    @summary These are the options that can be used as underlying transport protocol.
    @member Photon.ConnectionProtocol
    @readonly
    @property {number} Ws WebSockets connection.
    @property {number} Wss WebSockets Secure connection.
    **/
    Photon.ConnectionProtocol = {
        Ws: 0,
        Wss: 1
    };

    var PhotonPeer = (function () {
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
        function PhotonPeer(url, subprotocol, debugName) {
            if (typeof subprotocol === "undefined") { subprotocol = ""; }
            if (typeof debugName === "undefined") { debugName = ""; }
            this.url = url;
            this.subprotocol = subprotocol;
            /**
            @summary Peer sends 'keep alive' message to server as this timeout exceeded after last send operation.
            Set it < 1000 to disable 'keep alive' operation
            @member Photon.PhotonPeer#keepAliveTimeoutMs
            @type {number}
            @default 5000
            */
            this.keepAliveTimeoutMs = 5000;
            this._frame = "~m~";
            this._isConnecting = false;
            this._isConnected = false;
            this._isClosing = false;
            this._peerStatusListeners = {};
            this._eventListeners = {};
            this._responseListeners = {};
            this.keepAliveTimer = 0;
            this._logger = new Exitgames.Common.Logger(debugName && debugName != "" ? debugName + ": " : "");
        }
        /**
        @summary Checks if peer is connecting.
        @method Photon.PhotonPeer#isConnecting
        @returns {boolean} True if peer is connecting.
        */
        PhotonPeer.prototype.isConnecting = function () {
            return this._isConnecting;
        };

        /**
        @summary Checks if peer is connected.
        @method Photon.PhotonPeer#isConnected
        @returns {boolean} True if peer is connected.
        */
        PhotonPeer.prototype.isConnected = function () {
            return this._isConnected;
        };

        /**
        @summary Checks if peer is closing.
        @method Photon.PhotonPeer#isClosing
        @returns {boolean} True if peer is closing.
        */
        PhotonPeer.prototype.isClosing = function () {
            return this._isClosing;
        };

        /**
        @summary Starts connection to server.
        @method Photon.PhotonPeer#connect
        */
        PhotonPeer.prototype.connect = function () {
            var _this = this;
            if (this.subprotocol == "") {
                this._socket = new WebSocket(this.url);
            } else {
                this._socket = new WebSocket(this.url, this.subprotocol);
            }
            this._onConnecting();

            // Set event handlers.
            this._socket.onopen = function (ev) {
                //this.logger.debug("onopen");
            };
            this._socket.onmessage = function (ev) {
                var message = _this._decode(ev.data);
                _this._onMessage(message.toString());
            };
            this._socket.onclose = function (ev) {
                _this._logger.debug("onclose: wasClean =", ev.wasClean, ", code=", ev.code, ", reason =", ev.reason);
                if (_this._isConnecting) {
                    _this._onConnectFailed(ev);
                } else {
                    if (1006 == ev.code) {
                        _this._onTimeout();
                    }
                    _this._onDisconnect();
                }
            };
            this._socket.onerror = function (ev) {
                _this._onError(ev);
            };
        };

        /**
        @summary Disconnects from server.
        @method Photon.PhotonPeer#disconnect
        */
        PhotonPeer.prototype.disconnect = function () {
            this._isClosing = true;
            this._socket.close();
        };

        /**
        @summary Sends operation to the Photon Server.
        @method Photon.PhotonPeer#sendOperation
        @param {number} code Code of operation.
        @param {object} [data] Parameters of operation as key-value pairs.
        @param {boolean} [sendReliable=false] Selects if the operation must be acknowledged or not. If false, the operation is not guaranteed to reach the server.
        @param {number} [channelId=0] The channel in which this operation should be sent.
        */
        PhotonPeer.prototype.sendOperation = function (code, data, sendReliable, channelId) {
            if (typeof sendReliable === "undefined") { sendReliable = false; }
            if (typeof channelId === "undefined") { channelId = 0; }
            var sndJSON = { req: code, vals: [] };
            if (Exitgames.Common.Util.isArray(data)) {
                sndJSON.vals = data;
            } else {
                if (data === undefined) {
                    sndJSON.vals = [];
                } else {
                    throw new Error(this._logger.format("PhotonPeer[sendOperation] - Trying to send non array data:", data));
                }
            }
            this._send(sndJSON);
            this._logger.debug("PhotonPeer[sendOperation] - Sending request:", sndJSON);
        };

        /**
        @summary Registers listener for peer status change.
        @method Photon.PhotonPeer#addPeerStatusListener
        @param {PhotonPeer.StatusCodes} statusCode Status change to this value will be listening.
        @param {Function} callback The listener function that processes the status change. This function don't accept any parameters.
        */
        PhotonPeer.prototype.addPeerStatusListener = function (statusCode, callback) {
            this._addListener(this._peerStatusListeners, statusCode, callback);
        };

        /**
        @summary Registers listener for custom event.
        @method Photon.PhotonPeer#addEventListener
        @param {number} eventCode Custom event code.
        @param {Function} callback The listener function that processes the event. This function may accept object with event content.
        */
        PhotonPeer.prototype.addEventListener = function (eventCode, callback) {
            this._addListener(this._eventListeners, eventCode.toString(), callback);
        };

        /**
        @summary Registers listener for operation response.
        @method Photon.PhotonPeer#addResponseListener
        @param {number} operationCode Operation code.
        @param {Function} callback The listener function that processes the event. This function may accept object with operation response content.
        */
        PhotonPeer.prototype.addResponseListener = function (operationCode, callback) {
            this._addListener(this._responseListeners, operationCode.toString(), callback);
        };

        /**
        @summary Removes listener if exists for peer status change.
        @method Photon.PhotonPeer#removePeerStatusListener
        @param {string} statusCode One of PhotonPeer.StatusCodes to remove listener for.
        @param {Function} callback Listener to remove.
        */
        PhotonPeer.prototype.removePeerStatusListener = function (statusCode, callback) {
            this._removeListener(this._peerStatusListeners, statusCode, callback);
        };

        /**
        @summary Removes listener if exists for custom event.
        @method Photon.PhotonPeer#removeEventListener
        @param {number} eventCode Event code to remove to remove listener for.
        @param {Function} callback Listener to remove.
        */
        PhotonPeer.prototype.removeEventListener = function (eventCode, callback) {
            this._removeListener(this._eventListeners, eventCode.toString(), callback);
        };

        /**
        @summary Removes listener if exists for operation response.
        @method Photon.PhotonPeer#removeResponseListener
        @param {number} operationCode Operation code to remove listener for.
        @param {Function} callback Listener to remove.
        */
        PhotonPeer.prototype.removeResponseListener = function (operationCode, callback) {
            this._removeListener(this._responseListeners, operationCode.toString(), callback);
        };

        /**
        @summary Removes all listeners for peer status change specified.
        @method Photon.PhotonPeer#removePeerStatusListenersForCode
        @param {string} statusCode One of PhotonPeer.StatusCodes to remove all listeners for.
        */
        PhotonPeer.prototype.removePeerStatusListenersForCode = function (statusCode) {
            this._removeListenersForCode(this._peerStatusListeners, statusCode);
        };

        /**
        @summary Removes all listeners for custom event specified.
        @method Photon.PhotonPeer#removeEventListenersForCode
        @param {number} eventCode Event code to remove all listeners for.
        */
        PhotonPeer.prototype.removeEventListenersForCode = function (eventCode) {
            this._removeListenersForCode(this._eventListeners, eventCode.toString());
        };

        /**
        @summary Removes all listeners for operation response specified.
        @method Photon.PhotonPeer#removeResponseListenersForCode
        @param {number} operationCode Operation code to remove all listeners for.
        */
        PhotonPeer.prototype.removeResponseListenersForCode = function (operationCode) {
            this._removeListenersForCode(this._responseListeners, operationCode.toString());
        };

        /**
        @summary Sets peer logger level.
        @method Photon.PhotonPeer#setLogLevel
        @param {Exitgames.Common.Logger.Level} level Logging level.
        */
        PhotonPeer.prototype.setLogLevel = function (level) {
            this._logger.setLevel(level);
        };

        /**
        @summary Called if no listener found for received custom event.
        Override to relay unknown event to user's code or handle known events without listener registration.
        @method Photon.PhotonPeer#onUnhandledEvent
        @param {number} eventCode Code of received event.
        @param {object} [args] Content of received event or empty object.
        */
        PhotonPeer.prototype.onUnhandledEvent = function (eventCode, args) {
            this._logger.warn('PhotonPeer: No handler for event', eventCode, 'registered.');
        };

        /**
        @summary Called if no listener found for received operation response event.
        Override to relay unknown response to user's code or handle known responses without listener registration.
        @method Photon.PhotonPeer#onUnhandledEvent
        @param {number} operationCode Code of received response.
        @param {object} [args] Content of received response or empty object.
        */
        PhotonPeer.prototype.onUnhandledResponse = function (operationCode, args) {
            this._logger.warn('PhotonPeer: No handler for response', operationCode, 'registered.');
        };

        // TODO: lite calls this
        // protected
        PhotonPeer.prototype._dispatchEvent = function (code, args) {
            if (!this._dispatch(this._eventListeners, code.toString(), args, "event")) {
                this.onUnhandledEvent(code, args);
            }
        };

        // TODO: lite calls this
        // protected
        PhotonPeer.prototype._dispatchResponse = function (code, args) {
            if (!this._dispatch(this._responseListeners, code.toString(), args, "response")) {
                this.onUnhandledResponse(code, args);
            }
        };

        PhotonPeer.prototype._stringify = function (message) {
            if (Object.prototype.toString.call(message) == "[object Object]") {
                if (!JSON) {
                    throw new Error("PhotonPeer[_stringify] - Trying to encode as JSON, but JSON.stringify is missing.");
                }
                return "~j~" + JSON.stringify(message);
            } else {
                return String(message);
            }
        };

        PhotonPeer.prototype._encode = function (messages) {
            var ret = "", message, messages = Exitgames.Common.Util.isArray(messages) ? messages : [messages];
            for (var i = 0, l = messages.length; i < l; i++) {
                message = messages[i] === null || messages[i] === undefined ? "" : this._stringify(messages[i]);
                ret += this._frame + message.length + this._frame + message;
            }
            return ret;
        };

        PhotonPeer.prototype._decode = function (data) {
            var messages = [], number, n, newdata = data;
            var nulIndex = data.indexOf("\x00");
            if (nulIndex !== -1) {
                newdata = data.replace(/[\0]/g, "");
            }
            data = newdata;
            do {
                if (data.substr(0, 3) !== this._frame) {
                    return messages;
                }
                data = data.substr(3);
                number = "", n = "";
                for (var i = 0, l = data.length; i < l; i++) {
                    n = Number(data.substr(i, 1));
                    if (data.substr(i, 1) == n) {
                        number += n;
                    } else {
                        data = data.substr(number.length + this._frame.length);
                        number = Number(number);
                        break;
                    }
                }
                messages.push(data.substr(0, number));
                data = data.substr(number);
            } while(data !== "");
            return messages;
        };

        PhotonPeer.prototype._onMessage = function (message) {
            if (message.substr(0, 3) == "~j~") {
                this._onMessageReceived(JSON.parse(message.substr(3)));
            } else {
                if (!this._sessionid) {
                    this._sessionid = message;
                    this._onConnect();
                } else {
                    this._onMessageReceived(message);
                }
            }
        };

        PhotonPeer.prototype.resetKeepAlive = function () {
            var _this = this;
            //this._logger.debug("reset kep alive: ", Date.now());
            clearTimeout(this.keepAliveTimer);
            if (this.keepAliveTimeoutMs >= 1000) {
                this.keepAliveTimer = setTimeout(function () {
                    return _this._send({ irq: 1, vals: [1, Date.now()] }, true);
                }, this.keepAliveTimeoutMs);
            }
        };

        PhotonPeer.prototype._send = function (data, checkConnected) {
            if (typeof checkConnected === "undefined") { checkConnected = false; }
            var message = this._encode(data);
            if (this._isConnected && !this._isClosing) {
                this.resetKeepAlive();

                //this._logger.debug("_send:", message);
                this._socket.send(message);
            } else {
                if (!checkConnected) {
                    throw new Error(this._logger.format('PhotonPeer[_send] - Operation', data.req, '- failed, "isConnected" is', this._isConnected, ', "isClosing" is', this._isClosing, "!"));
                }
            }
        };

        PhotonPeer.prototype._onMessageReceived = function (message) {
            if (typeof message === "object") {
                this._logger.debug("PhotonPeer[_onMessageReceived] - Socket received message:", message);
                var msgJSON = message;
                var msgErr = msgJSON.err ? msgJSON.err : 0;
                msgJSON.vals = msgJSON.vals !== undefined ? msgJSON.vals : [];
                if (msgJSON.vals.length > 0) {
                    msgJSON.vals = this._parseMessageValuesArrayToJSON(msgJSON.vals);
                }
                if (msgJSON.res !== undefined) {
                    var code = parseInt(msgJSON.res);
                    this._parseResponse(code, msgJSON);
                } else {
                    if (msgJSON.evt !== undefined) {
                        var code = parseInt(msgJSON.evt);
                        this._parseEvent(code, msgJSON);
                    } else {
                        if (msgJSON.irs !== undefined) {
                            var code = parseInt(msgJSON.irs);
                            this._parseInternalResponse(code, msgJSON);
                        } else {
                            throw new Error(this._logger.format("PhotonPeer[_onMessageReceived] - Received undefined message type:", msgJSON));
                        }
                    }
                }
            }
        };

        PhotonPeer.prototype._parseMessageValuesArrayToJSON = function (vals) {
            var parsedJSON = {};
            if (Exitgames.Common.Util.isArray(vals)) {
                if (vals.length % 2 == 0) {
                    var toParse = vals, key, value;
                    while (toParse.length > 0) {
                        key = toParse.shift() + "";
                        value = toParse.shift();
                        parsedJSON[key] = value;
                    }
                } else {
                    throw new Error(this._logger.format("PhotonPeer[_parseMessageValuesToJSON] - Received invalid values array:", vals));
                }
            }
            return parsedJSON;
        };

        PhotonPeer.prototype._parseEvent = function (code, event) {
            switch (code) {
                default:
                    this._dispatchEvent(code, { vals: event.vals });
                    break;
            }
        };

        PhotonPeer.prototype._parseResponse = function (code, response) {
            switch (code) {
                default:
                    this._dispatchResponse(code, { errCode: response.err, errMsg: response.msg, vals: response.vals });
                    break;
            }
        };

        PhotonPeer.prototype._parseInternalResponse = function (code, response) {
            this._logger.debug("internal response:", response);
        };

        PhotonPeer.prototype._onConnecting = function () {
            this._logger.debug("PhotonPeer[_onConnecting] - Starts connecting", this.url, '..., raising "connecting" event ...');
            this._isConnecting = true;
            this._dispatchPeerStatus(PhotonPeer.StatusCodes.connecting);
        };

        PhotonPeer.prototype._onConnect = function () {
            this._logger.debug('PhotonPeer[_onConnect] - Connected successfully! Raising "connect" event ...');
            this._isConnecting = false;
            this._isConnected = true;
            this._dispatchPeerStatus(PhotonPeer.StatusCodes.connect);
        };

        PhotonPeer.prototype._onConnectFailed = function (evt) {
            this._logger.error('PhotonPeer[_onConnectFailed] - Socket connection could not be created:', this.url, this.subprotocol, 'Wrong host or port?\n Raising "connectFailed event ...');
            this._isConnecting = this._isConnected = false;
            this._dispatchPeerStatus(PhotonPeer.StatusCodes.connectFailed);
        };

        PhotonPeer.prototype._onDisconnect = function () {
            var wasConnected = this._isConnected;
            var wasClosing = this._isClosing;
            this._logger.debug('PhotonPeer[_onDisconnect] - Socket closed, raising "disconnect" event ...');
            this._isClosing = this._isConnected = this._isConnecting = false;
            if (wasConnected) {
                if (wasClosing) {
                    this._dispatchPeerStatus(PhotonPeer.StatusCodes.disconnect);
                } else {
                    this._dispatchPeerStatus(PhotonPeer.StatusCodes.connectClosed);
                }
            }
        };

        PhotonPeer.prototype._onTimeout = function () {
            this._logger.debug('PhotonPeer[_onTimeout] - Client timed out! Raising "timeout" event ...');
            this._dispatchPeerStatus(PhotonPeer.StatusCodes.timeout);
        };

        PhotonPeer.prototype._onError = function (ev) {
            this._logger.error("PhotonPeer[_onError] - Connection error:", arguments[0]);
            this._isConnecting = this._isConnected = this._isClosing = false;
            this._dispatchPeerStatus(PhotonPeer.StatusCodes.error);
        };

        PhotonPeer.prototype._addListener = function (listeners, code, callback) {
            if (!(code in listeners)) {
                listeners[code] = [];
            }
            if (callback && typeof callback === "function") {
                this._logger.debug('PhotonPeer[_addListener] - Adding listener for event', code);
                listeners[code].push(callback);
            } else {
                this._logger.error('PhotonPeer[_addListener] - Listener', code, 'is not a function but of type', typeof callback, '. No listener added!');
            }
            return this;
        };

        PhotonPeer.prototype._dispatch = function (listeners, code, args, debugType) {
            if (code in listeners) {
                var events = listeners[code];
                for (var i = 0, l = events.length; i < l; i++) {
                    if (!Exitgames.Common.Util.isArray(args)) {
                        args = [args];
                    }
                    events[i].apply(this, args === undefined ? [] : args);
                }
                return true;
            } else {
                return false;
            }
        };

        PhotonPeer.prototype._dispatchPeerStatus = function (code) {
            if (!this._dispatch(this._peerStatusListeners, code, undefined, "peerStatus")) {
                this._logger.warn('PhotonPeer[_dispatchPeerStatus] - No handler for ', code, 'registered.');
            }
        };

        PhotonPeer.prototype._removeListener = function (listeners, code, callback) {
            if ((code in listeners)) {
                var prevLenght = listeners[code].length;
                listeners[code] = listeners[code].filter(function (x) {
                    return x != callback;
                });
                this._logger.debug('PhotonPeer[_removeListener] - Removing listener for event', code, "removed:", prevLenght - listeners[code].length);
            }
            return this;
        };

        PhotonPeer.prototype._removeListenersForCode = function (listeners, code) {
            this._logger.debug('PhotonPeer[_removeListenersForCode] - Removing all listeners for event', code);
            if (code in listeners) {
                listeners[code] = [];
            }
            return this;
        };
        PhotonPeer.StatusCodes = {
            connecting: "connecting",
            connect: "connect",
            connectFailed: "connectFailed",
            disconnect: "disconnect",
            connectClosed: "connectClosed",
            error: "error",
            timeout: "timeout"
        };
        return PhotonPeer;
    })();
    Photon.PhotonPeer = PhotonPeer;
})(Photon || (Photon = {}));

var Exitgames;
(function (Exitgames) {
    /// --------------------------------------------------------------------------------------------------------------------------------------------------------------
    /// ------------------- Exitgames.Common
    /// --------------------------------------------------------------------------------------------------------------------------------------------------------------
    /**
    Exitgames
    @namespace Exitgames
    */
    /**
    Exitgames utilities
    @namespace Exitgames.Common
    */
    (function (Common) {
        var Logger = (function () {
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
            function Logger(prefix, level) {
                if (typeof prefix === "undefined") { prefix = ""; }
                if (typeof level === "undefined") { level = Logger.Level.INFO; }
                this.prefix = prefix;
                this.level = level;
            }
            /**
            @summary Changes current logging level.
            @method Exitgames.Common.Logger#setLevel
            @param {Exitgames.Common.Logger.Level} level New logging level.
            */
            Logger.prototype.setLevel = function (level) {
                level = Math.max(level, Logger.Level.DEBUG);
                level = Math.min(level, Logger.Level.OFF);
                this.level = level;
            };

            /**
            @summary Checks if logging level active.
            @method Exitgames.Common.Logger#isLevelEnabled
            @param {Exitgames.Common.Logger.Level} level Level to check.
            @returns {boolean} True if level active.
            */
            Logger.prototype.isLevelEnabled = function (level) {
                return level >= this.level;
            };

            /**
            @summary Returns current logging level.
            @method Exitgames.Common.Logger#getLevel
            @returns {Exitgames.Common.Logger.Level} Current logging level.
            */
            Logger.prototype.getLevel = function () {
                return this.level;
            };

            /**
            @summary Logs message if logging level = DEBUG, INFO, WARN, ERROR
            @method Exitgames.Common.Logger#debug
            @param {string} mess Message to log.
            @param {...any} optionalParams For every additional parameter toString() applies and result added to the end of log message after space character.
            */
            Logger.prototype.debug = function (mess) {
                var optionalParams = [];
                for (var _i = 0; _i < (arguments.length - 1); _i++) {
                    optionalParams[_i] = arguments[_i + 1];
                }
                this.log(Logger.Level.DEBUG, mess, optionalParams);
            };

            /**
            @summary Logs message if logging level = INFO, WARN, ERROR
            @method Exitgames.Common.Logger#info
            @param {string} mess Message to log.
            @param {...any} optionalParams For every additional parameter toString() applies and result added to the end of log message after space character.
            */
            Logger.prototype.info = function (mess) {
                var optionalParams = [];
                for (var _i = 0; _i < (arguments.length - 1); _i++) {
                    optionalParams[_i] = arguments[_i + 1];
                }
                this.log(Logger.Level.INFO, mess, optionalParams);
            };

            /**
            @summary Logs message if logging level = WARN, ERROR
            @method Exitgames.Common.Logger#warn
            @param {string} mess Message to log.
            @param {...any} optionalParams For every additional parameter toString() applies and result added to the end of log message after space character.
            */
            Logger.prototype.warn = function (mess) {
                var optionalParams = [];
                for (var _i = 0; _i < (arguments.length - 1); _i++) {
                    optionalParams[_i] = arguments[_i + 1];
                }
                this.log(Logger.Level.WARN, mess, optionalParams);
            };

            /**
            @summary Logs message if logging level = ERROR
            @method Exitgames.Common.Logger#error
            @param {string} mess Message to log.
            @param {...any} optionalParams For every additional parameter toString() applies and result added to the end of log message after space character.
            */
            Logger.prototype.error = function (mess) {
                var optionalParams = [];
                for (var _i = 0; _i < (arguments.length - 1); _i++) {
                    optionalParams[_i] = arguments[_i + 1];
                }
                this.log(Logger.Level.ERROR, mess, optionalParams);
            };

            /**
            @summary Applies default logger formatting to arguments
            @method Exitgames.Common.Logger#format
            @param {string} mess String to start formatting with.
            @param {...any} optionalParams For every additional parameter toString() applies and result added to the end of formatted string after space character.
            @returns {string} Formatted string.
            */
            Logger.prototype.format = function (mess) {
                var optionalParams = [];
                for (var _i = 0; _i < (arguments.length - 1); _i++) {
                    optionalParams[_i] = arguments[_i + 1];
                }
                return this.format0(mess, optionalParams);
            };

            /**
            @summary Applies default logger formatting to array of objects.
            @method Exitgames.Common.Logger#format
            @param {string} mess String to start formatting with.
            @param {any[]} optionalParams For every additional parameter toString() applies and result added to the end of formatted string after space character.
            @returns {string} Formatted string.
            */
            Logger.prototype.formatArr = function (mess, optionalParams) {
                return this.format0(mess, optionalParams);
            };

            Logger.prototype.log = function (level, msg, optionalParams) {
                if (level >= this.level) {
                    // for global vars console !== undefined throws an error
                    if (typeof console !== "undefined" && msg !== undefined) {
                        try  {
                            var logMethod = console[Logger.log_types[level]];
                            if (!logMethod) {
                                logMethod = console["log"];
                            }
                            if (logMethod) {
                                if (logMethod.call) {
                                    logMethod.call(console, this.format0(msg, optionalParams));
                                } else {
                                    logMethod(console, this.format0(msg, optionalParams));
                                }
                            }
                        } catch (error) {
                            // silently fail
                        }
                    }
                }
            };
            Logger.prototype.format0 = function (msg, optionalParams) {
                return this.prefix + msg + " " + optionalParams.map(function (x) {
                    if (x !== undefined) {
                        switch (typeof x) {
                            case "object":
                                try  {
                                    return JSON.stringify(x);
                                } catch (error) {
                                    return x.toString() + "(" + error + ")";
                                }
                                break;
                            default:
                                return x.toString();
                                break;
                        }
                    }
                }).join(" ");
            };
            Logger.Level = {
                //TRACE : 0,
                DEBUG: 1,
                INFO: 2,
                WARN: 3,
                ERROR: 4,
                //_FATAL : 5,
                OFF: 6
            };

            Logger.log_types = ["debug", "debug", "info", "warn", "error"];
            return Logger;
        })();
        Common.Logger = Logger;

        var Util = (function () {
            function Util() {
            }
            Util.indexOf = function (arr, item, from) {
                for (var l = arr.length, i = from < 0 ? Math.max(0, l + from) : from || 0; i < l; i++) {
                    if (arr[i] === item) {
                        return i;
                    }
                }
                return -1;
            };

            Util.isArray = function (obj) {
                return Object.prototype.toString.call(obj) === "[object Array]";
            };

            //TODO: naming. could be named mergeHashtable or something more specific
            Util.merge = function (target, additional) {
                for (var i in additional) {
                    if (additional.hasOwnProperty(i)) {
                        target[i] = additional[i];
                    }
                }
            };

            Util.getPropertyOrElse = function (obj, prop, defaultValue) {
                if (obj.hasOwnProperty(prop)) {
                    return obj[prop];
                } else {
                    return defaultValue;
                }
            };

            Util.enumValueToName = function (enumObj, value) {
                for (var i in enumObj) {
                    if (value == enumObj[i]) {
                        return i;
                    }
                }
                return "undefined";
            };

            Util.getEnumKeyByValue = function (enumObj, value) {
                for (var i in enumObj) {
                    if (value == enumObj[i]) {
                        return i;
                    }
                }
                return undefined;
            };
            return Util;
        })();
        Common.Util = Util;
    })(Exitgames.Common || (Exitgames.Common = {}));
    var Common = Exitgames.Common;
})(Exitgames || (Exitgames = {}));
//# sourceMappingURL=photon.js.map
