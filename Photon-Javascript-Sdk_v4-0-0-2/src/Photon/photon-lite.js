/// <reference path="photon.ts"/>
/// <reference path="photon-lite-constants.ts"/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Photon;
(function (Photon) {
    /**
    Photon Lite API
    @namespace Photon.Lite
    */
    (function (Lite) {
        var LitePeer = (function (_super) {
            __extends(LitePeer, _super);
            /**
            @classdesc Extends PhotonPeer and implements the operations offered by the "Lite" Application of the Photon Server SDK.
            @constructor Photon.Lite.LitePeer
            @param {string} url Server address:port.
            @param {string} [subprotocol=""] WebSocket protocol.
            */
            function LitePeer(url, subprotocol) {
                if (typeof subprotocol === "undefined") { subprotocol = ""; }
                _super.call(this, url, subprotocol);
                this.isJoined = false;
                this.roomName = "";
                this.room = { properties: {} };
                this.actors = {};
                this._myActor = { photonId: 0, properties: {} };
            }
            /**
            @summary Returns local actor data.
            @method Photon.Lite.LitePeer#myActor
            @returns {object} Local actor in form { photonId: number, properties: object }
            */
            LitePeer.prototype.myActor = function () {
                return this._myActor;
            };

            /**
            @summary Joins an existing room by name or create one if the name is not in use yet.
            @method Photon.Lite.LitePeer#join
            @param {string} roomName Any identifying name for a room
            @param {object} [roomProperties] Set of room properties, by convention: only used if room is new/created.
            @param {object} [actorProperties] Set of actor properties.
            @param {object} [broadcast] Broadcast actor proprties in join-event.
            */
            LitePeer.prototype.join = function (roomName, roomProperties, actorProperties, broadcast) {
                if (roomName !== undefined && this.isConnected() && !this.isJoined) {
                    this._logger.info("PhotonPeer.Lite[join] - Joining roomName:", roomName);
                    this._logger.debug("PhotonPeer.Lite[join] - actorProperties:", actorProperties, ", roomProperties:", roomProperties, ", broadcast:", broadcast);
                    var sndArr = [];
                    sndArr.push(Lite.Constants.LiteOpKey.GameId);
                    sndArr.push(roomName + "");
                    if (typeof roomProperties === "object") {
                        sndArr.push(Lite.Constants.LiteOpKey.GameProperties);
                        sndArr.push(roomProperties);
                    }
                    if (typeof actorProperties === "object") {
                        sndArr.push(Lite.Constants.LiteOpKey.ActorProperties);
                        sndArr.push(actorProperties);
                    }
                    sndArr.push(Lite.Constants.LiteOpKey.Broadcast); //TODO: broadcast defaults to false. could be skipped in that case (similar to actorProperties)
                    sndArr.push(broadcast || false);
                    this.sendOperation(Lite.Constants.LiteOpCode.Join, sndArr);
                } else {
                    if (roomName === undefined) {
                        throw new Error("PhotonPeer.Lite[join] - Trying to join with undefined roomName!");
                    } else {
                        if (this.isJoined) {
                            throw new Error("PhotonPeer.Lite[join] - you have already joined!");
                        } else {
                            throw new Error("PhotonPeer.Lite[join] - Not connected!");
                        }
                    }
                }
            };

            /**
            @summary Leaves a room, but keeps the connection.
            @method Photon.Lite.LitePeer#leave
            */
            LitePeer.prototype.leave = function () {
                if (this.isJoined) {
                    this._logger.debug("PhotonPeer.Lite[leave] - Leaving ...");
                    this.sendOperation(Lite.Constants.LiteOpCode.Leave);
                } else {
                    throw new Error("PhotonPeer.Lite[leave] - Not joined!");
                }
            };

            /**
            @summary Sends your custom data as event to a actors in the current Room.
            @method Photon.Lite.LitePeer#raiseEvent
            @param {number} eventCode The code of custom event.
            @param {object} data Event content
            */
            LitePeer.prototype.raiseEvent = function (eventCode, data) {
                if (this.isJoined) {
                    if (data !== undefined) {
                        this._logger.debug('PhotonPeer.Lite[raiseEvent] - Event', eventCode, ":", data);
                        this.sendOperation(Lite.Constants.LiteOpCode.RaiseEvent, [Lite.Constants.LiteOpKey.Code, eventCode, Lite.Constants.LiteOpKey.Data, data]);
                    } else {
                        throw new Error(this._logger.format('PhotonPeer.Lite[raiseEvent] - Event', eventCode, '- data not passed in as object!'));
                    }
                } else {
                    throw new Error("PhotonPeer.Lite[raiseEvent] - Not joined!");
                }
            };

            /**
            @summary Sets or updates properties of specified actor.
            @method Photon.Lite.LitePeer#setActorProperties
            @param {number} actorNr Id of actor.
            @param {object} data Actor properties to set or update.
            @param {boolean} broadcast Triggers an LiteEventCode.PropertiesChanged event if true.
            */
            LitePeer.prototype.setActorProperties = function (actorNr, data, broadcast) {
                if (this.isJoined) {
                    this._logger.debug("PhotonPeer.Lite[setActorProperties] - actorNumber:" + actorNr + ", broadcast:" + broadcast + ", data:", data);
                    this.sendOperation(Lite.Constants.LiteOpCode.SetProperties, [Lite.Constants.LiteOpKey.Broadcast, broadcast, Lite.Constants.LiteOpKey.Properties, data, Lite.Constants.LiteOpKey.ActorNr, actorNr]);
                } else {
                    throw new Error("PhotonPeer.Lite[setActorProperties] - Not joined!");
                }
            };

            /**
            @summary Requests selected properties of specified actors.
            @method Photon.Lite.LitePeer#getActorProperties
            @param {object} [propertyKeys] Property keys to fetch. All properties will return if not specified.
            @param {number[]} [actorNrs] List of actornumbers to get the properties of. Properties of all actors will return if not specified.
            */
            LitePeer.prototype.getActorProperties = function (propertyKeys, actorNrs) {
                if (this.isJoined) {
                    var sndArr = [];
                    sndArr.push(Lite.Constants.LiteOpKey.ActorProperties);
                    if (propertyKeys !== undefined) {
                        if (Exitgames.Common.Util.isArray(propertyKeys)) {
                            if (propertyKeys.length > 0) {
                                sndArr.push(propertyKeys);
                            }
                        }
                    }
                    if (sndArr.length !== 2) {
                        sndArr.push(null);
                    }
                    sndArr.push(Lite.Constants.LiteOpKey.ActorList);
                    if (actorNrs !== undefined) {
                        if (Exitgames.Common.Util.isArray(actorNrs)) {
                            if (actorNrs.length > 0) {
                                sndArr.push(actorNrs);
                            }
                        }
                    }
                    if (sndArr.length !== 4) {
                        sndArr.push(null);
                    }
                    sndArr.push(Lite.Constants.LiteOpKey.Properties);
                    sndArr.push(2); //TODO: what is this 2? should not be hard coded
                    this._logger.debug("PhotonPeer.Lite[getActorProperties] -", sndArr);
                    this.sendOperation(Lite.Constants.LiteOpCode.GetProperties, sndArr);
                } else {
                    throw new Error("PhotonPeer.Lite[getProperties] - Not joined!");
                }
            };

            /**
            @summary Sets or updates properties of joined room.
            @method Photon.Lite.LitePeer#setRoomProperties
            @param {object} data Room properties to set or update.
            @param {boolean} broadcast Triggers an LiteEventCode.PropertiesChanged event if true.
            */
            LitePeer.prototype.setRoomProperties = function (data, broadcast) {
                if (this.isJoined) {
                    this._logger.debug("PhotonPeer.Lite[setRoomProperties] - broadcast:" + broadcast + ", data:", data); //bug? actorNumber: " + actorNumber + ",
                    this.sendOperation(Lite.Constants.LiteOpCode.SetProperties, [Lite.Constants.LiteOpKey.Broadcast, broadcast, Lite.Constants.LiteOpKey.Properties, data]);
                } else {
                    throw new Error("PhotonPeer.Lite[setRoomProperties] - Not joined!");
                }
            };

            /**
            @summary Requests selected properties of joined room.
            @method Photon.Lite.LitePeer#getRoomProperties
            @param {object} [propertyKeys] Property keys to fetch. All properties will return if not specified.
            */
            LitePeer.prototype.getRoomProperties = function (propertyKeys) {
                if (this.isJoined) {
                    var sndArr = [];
                    sndArr.push(Lite.Constants.LiteOpKey.GameProperties);
                    if (propertyKeys !== undefined) {
                        if (Exitgames.Common.Util.isArray(propertyKeys)) {
                            if (propertyKeys.length > 0) {
                                sndArr.push(propertyKeys);
                            }
                        }
                    } else {
                        sndArr.push(null);
                    }
                    this._logger.debug("PhotonPeer.Lite[getRoomProperties] -", sndArr);
                    this.sendOperation(Lite.Constants.LiteOpCode.GetProperties, sndArr);
                } else {
                    throw new Error("PhotonPeer.Lite[getRoomProperties] - Not joined!");
                }
            };

            LitePeer.prototype._addActor = function (actorNr) {
                this.actors[actorNr] = { photonId: actorNr };
                this._logger.debug("PhotonPeer.Lite[_addActor] - Added actorNr", actorNr, "actors known are now ", this.actors);
                return this.actors[actorNr];
            };
            LitePeer.prototype._removeActor = function (actorNr) {
                delete this.actors[actorNr];
                this._logger.debug("PhotonPeer.Lite[_removeActor] - Removed actorNr", actorNr, ", actors known are now", this.actors);
                return this;
            };

            //addEventListener("disconnect", function() {
            //    this.isJoined = false;
            //});
            LitePeer.prototype.actorNrFromVals = function (vals) {
                var actorNrVal = vals[Photon.Lite.Constants.LiteOpKey.ActorNr];
                return actorNrVal !== undefined ? parseInt(actorNrVal) : -1;
            };
            LitePeer.prototype._parseEvent = function (code, event) {
                var actorNr = this.actorNrFromVals(event.vals);
                switch (code) {
                    case Lite.Constants.LiteEventCode.Join:
                        this._onEventJoin(event, actorNr);
                        break;
                    case Lite.Constants.LiteEventCode.Leave:
                        this._onEventLeave(actorNr);
                        break;
                    case Lite.Constants.LiteEventCode.PropertiesChanged:
                        this._onEventSetProperties(event, actorNr);
                        break;
                    default:
                        this._logger.info('PhotonPeer.Lite[_parseEvent] - Unknown event code', code, 'with JSON:', event);
                        this._dispatchEvent(code, { vals: event.vals, actorNr: actorNr });
                        break;
                }
            };
            LitePeer.prototype._onEventJoin = function (event, actorNr) {
                if (actorNr !== this._myActor.photonId) {
                    this._logger.debug("PhotonPeer.Lite[_onEventJoin] - ActorNr", actorNr, "joined.");
                    this._addActor(actorNr);
                    this._dispatchEvent(Lite.Constants.LiteEventCode.Join, { newActors: [actorNr] });
                } else {
                    var eventActors = event.vals[Lite.Constants.LiteOpKey.ActorList], joinedActors = [];
                    for (var i in eventActors) {
                        var actorNr = parseInt(eventActors[i]);
                        if (actorNr !== this._myActor.photonId && this.actors[actorNr] === undefined) {
                            this._logger.debug("PhotonPeer.Lite[_onEventJoin] - ActorNr", actorNr, "registered as already joined");
                            this._addActor(actorNr);
                            joinedActors.push(actorNr);
                        }
                    }
                    this._dispatchEvent(Lite.Constants.LiteEventCode.Join, { newActors: joinedActors });
                }
            };
            LitePeer.prototype._onEventLeave = function (actorNr) {
                this._logger.debug("PhotonPeer.Lite[_onEventLeave] - ActorNr", actorNr, "left");
                this._removeActor(actorNr);
                this._dispatchEvent(Lite.Constants.LiteEventCode.Leave, { actorNr: actorNr });
            };
            LitePeer.prototype._onEventSetProperties = function (event, actorNr) {
                // TODO: who can listen this?
                //this._dispatchEvent("setProperties", { vals: event.vals, actorNr: actorNr })
            };
            LitePeer.prototype._parseResponse = function (code, response) {
                var actorNr = this.actorNrFromVals(response.vals);

                switch (code) {
                    case Lite.Constants.LiteOpCode.Join:
                        this._onResponseJoin(actorNr);
                        break;
                    case Lite.Constants.LiteOpCode.Leave:
                        this._onResponseLeave(actorNr);
                        break;
                    case Lite.Constants.LiteOpCode.RaiseEvent:
                        break;
                    case Lite.Constants.LiteOpCode.GetProperties:
                        this._onResponseGetProperties(response);
                        break;
                    case Lite.Constants.LiteOpCode.SetProperties:
                        this._onResponseSetProperties(response, actorNr);
                        break;
                    default:
                        this._logger.debug('PhotonPeer.Lite[_parseResponse] - Unknown response code', code, response, "actorNr", actorNr);
                        this._dispatchResponse(code, { errCode: response.err, errMsg: response.msg, vals: response.vals, actorNr: actorNr });
                        break;
                }
            };
            LitePeer.prototype._onResponseGetProperties = function (response) {
                this._logger.debug("PhotonPeer.Lite[_onResponseGetProperties] - getProperties response:", response);
                if (response.vals[Lite.Constants.LiteOpKey.ActorProperties] !== undefined) {
                    var actorProperties = response.vals[Lite.Constants.LiteOpKey.ActorProperties];
                    for (var actorNr in actorProperties) {
                        this.actors[actorNr].properties = actorProperties[actorNr];
                    }
                }
                if (response.vals[Lite.Constants.LiteOpKey.GameProperties] !== undefined) {
                    var roomProperties = response.vals[Lite.Constants.LiteOpKey.GameProperties];
                    this.room.properties = roomProperties;
                }
                this._dispatchResponse(Lite.Constants.LiteOpCode.GetProperties, { vals: response.vals });
            };
            LitePeer.prototype._onResponseJoin = function (actorNr) {
                this.isJoined = true;
                if (typeof this._myActor === "object") {
                    this._myActor = this._addActor(actorNr);
                    this._logger.debug("PhotonPeer.Lite[_onResponseJoin] - You joined as actor number / myActor.photonId has been set to:", this._myActor.photonId);
                }
                this._dispatchResponse(Lite.Constants.LiteOpCode.Join, { actorNr: actorNr });
            };
            LitePeer.prototype._onResponseLeave = function (actorNr) {
                this.isJoined = false;
                this._removeActor(this._myActor.photonId);
                this._logger.debug('PhotonPeer.Lite[_onResponseLeave] - You left the room', this.roomName);
                this.roomName = "";
                this.room = { properties: {} };
                this._dispatchResponse(Lite.Constants.LiteOpCode.Leave, { actorNr: actorNr });
            };
            LitePeer.prototype._onResponseSetProperties = function (response, actorNr) {
                this._logger.debug("PhotonPeer.Lite[_onResponseSetProperties] - setProperties response:", response, "actorNr", actorNr);
                this._dispatchResponse(Lite.Constants.LiteOpCode.SetProperties, { vals: response.vals, actorNr: actorNr });
            };
            return LitePeer;
        })(Photon.PhotonPeer);
        Lite.LitePeer = LitePeer;
    })(Photon.Lite || (Photon.Lite = {}));
    var Lite = Photon.Lite;
})(Photon || (Photon = {}));
//# sourceMappingURL=photon-lite.js.map
