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
        this.client.on("actorjoin", function(e) {
            var actor = e.actor;
            this.circles.push(Circle(actor).addChildTo(this));
        }.bind(this));
        
        this.button = FlatButton({
            text: "connect"
        })
            .on("push", function(){
                this.button.remove();
                this.connect();
            }.bind(this))
            .setPosition(SCREEN_WIDTH * 0.5, SCREEN_HEIGHT * 0.5)
            .addChildTo(this);
    },
    
    update: function(app) {
        if (this.client.isJoinedToRoom()) {
            var myCircle = this.myCircle;
            var myActor = this.client.myActor();
            if (myCircle && myActor) {
                myActor.setCustomProperties({
                    x: myCircle.x,
                    y: myCircle.y,
                });
            }
        }
    },
    
    connect: function() {
        this.client.connect();
        
        this.client.on("connected", function() {
            var myActor = this.client.myActor();
            console.log(myActor);
            this.myCircle = MyCircle(myActor.actorNr).addChildTo(this);
        }.bind(this));
        
        this.client.one("roomlistupdate", function() {
            if (this.client.rooms && this.client.rooms.length) {
                var room = this.client.rooms[0];
                console.log("joinRoom", room);
                this.client.joinRoom(room.name);
            } else {
                console.log("createRoom");
                this.client.createRoom();
            }
        }.bind(this));
        
        this.client.one("joined", function() {
            console.log("joined");
            var room = this.client.myRoom();
            console.log(room);
            
            var actors = this.client.myRoomActors();
            console.log(actors);
            for (var nr in actors) {
                var actor = actors[nr];
                if (!actor.isLocal) {
                    this.circles.push(Circle(actor).addChildTo(this));
                }
            }
        }.bind(this));
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
