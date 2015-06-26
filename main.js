tm.game.setup({
    title: "photon sample",
    width: 1024,
    height: 1024,
    startLabel: "game",
});

tm.define("GameScene", {
    superClass: "Scene",
    init: function() {
        this.superInit();
        
        this.actors = [];
        this.circles = [];
        
        var self = this;
        
        this.client = Client(Photon.ConnectionProtocol.Ws, "ad293f27-6b33-448a-9cbd-be26130f0555", "1.0");
        this.client.on("actorjoined", function(e) {
            var actor = e.actor;
            this.circles.push(Circle(actor).addChildTo(this));
        }.bind(this));
        
        var button = FlatButton({ text: "connect" })
            .on("push", function(){
                button.remove();
                this.connect();
            }.bind(this))
            .setPosition(SCREEN_WIDTH * 0.5, SCREEN_HEIGHT * 0.5)
            .addChildTo(this);
    },
    
    update: function(app) {
        this.client.update(app);
    },
    
    connect: function() {
        var self = this;
        var client = this.client;
        
        client.connect()
            .then(function() {
                var firstRoom = client.roomList.first;
                if (firstRoom) {
                    console.log("部屋があるから入るよ");
                } else {
                    console.log("部屋がないから作るよ");
                }
                return firstRoom ? client.joinRoom(firstRoom.name) : client.createRoom("俺の部屋");
            })
            .then(function() {
                console.log("GAME START", client.myRoom().name);

                var button = FlatButton({ text: "leave" })
                    .on("push", function(){
                        button.remove();
                        client.leaveRoom().then(function() {
                            console.log("部屋から出たよ");
                        });
                    })
                    .setPosition(SCREEN_WIDTH * 0.5, SCREEN_HEIGHT * 0.5)
                    .addChildTo(self);

            })
            .catch(function(e) {
                console.log("ERROR");
            });
    },
    
    disconnect: function() {
        this.client.disconnect();
    },
});

tm.define("Circle", {
    superClass: "CircleShape",
    init: function(actor) {
        this.superInit({
            width: 100,
            height: 100,
            fillStyle: "hsl({0}, 80%, 80%)".format(Math.rand(0, 360)),
        });
        if (actor) {
            actor.onPropertiesChange = function(changedCustomProps, byClient) {
                this.x = changedCustomProps.x;
                this.y = changedCustomProps.y;
            }.bind(this);
        }
    }
});

tm.define("MyCircle", {
    superClass: "Circle",
    init: function() {
        this.superInit(null);
    },
    update: function(app) {
        var p = app.pointing;
        if (p.getPointing()) {
            this.position.add(p.deltaPosition.mul(2));
        }
    }
});
