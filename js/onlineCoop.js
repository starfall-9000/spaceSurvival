var onlineCoop = {
	eurecaServer: null,
	eurecaClient: null,
	ready: null,
	players: [],
	id: null,
	score: null,
	timer: null,
	gameOver: null,
	enemies: null,
	texts:{
		back: null,
		help: null
	},
	preload: function(){
		singlePlayer.preload();

	    game.load.image('ship2', 'sprites/thrust_ship.png');
	},
	create: function(){

		this.ready = false;

		this.eurecaClient = new Eureca.Client();
		
		this.eurecaClient.ready(function (proxy) {		
			onlineCoop.eurecaServer = proxy;
		});

		this.eurecaClient.exports.setId = function(id) 
		{
			onlineCoop.id = id;
			onlineCoop.onClientReady();
			onlineCoop.eurecaServer.handshake();
			onlineCoop.ready = true;
		}	
		
		this.eurecaClient.exports.killPlayer = function(id)
		{	
			if (onlineCoop.players[id]) {
				onlineCoop.players[id].ship.kill();
			}
		}	
		
		this.eurecaClient.exports.spawnPlayer = function(id)
		{
			
			if (id == onlineCoop.id)
				return;

		    onlineCoop.players[id] = new player ({
		    	image: 'ship2',
		    	bulletImage: 'bullet',
		    	fireSound: 'blaster',
		    	cursors: {
		    		left: { isDown: false},
					right: { isDown: false}
		    	},
		    	fireButton: { isDown: false},
		    	id: id
		    });

		    onlineCoop.players[id].ship.angle = 270;
		}
		
		this.eurecaClient.exports.updateState = function(id, state)
		{
			if (onlineCoop.players[id])  {
				onlineCoop.players[id].cursorState = state;
				onlineCoop.players[id].ship.body.velocity.x = state.x;
				onlineCoop.players[id].ship.body.velocity.y = state.y;
				onlineCoop.players[id].update(onlineCoop.eurecaServer);
			}
		}

	},
	render: function(){
		
	},
	update: function(){
		
		if (!this.ready)
			return;

		this.players[this.id].updateInput();

		for (var i in this.players){

			if (!this.players[i])
				continue;

			var curBullets = this.players[i].bullets;
			var curShip = this.players[i].ship;

			for (var j in this.players){

				if (!this.players[j])
					continue;

				if (j!=i){
					var targetShip = this.players[j].ship;
					//game.physics.arcade.overlap(curBullets, targetShip, bulletHitPlayer, null, this);
				}

				if (this.players[j].alive)
					this.players[j].update(onlineCoop.eurecaServer);

			}

	    }

		this.players[this.id].update(this.eurecaServer, this.id);

		/*for (var i in this.players){
		    game.physics.arcade.collide(this.players[i].bullets, this.enemies.group, this.killEnemy, null, this);
		    game.physics.arcade.collide(this.enemies.bullets, this.players[i].ship, this.onGameOver, null, this);
		}

	    this.enemies.update();*/

	},
	onClientReady: function(){

		this.score = 0;
		this.gameOver = false;
		
		game.physics.startSystem(Phaser.Physics.ARCADE);
	    game.add.tileSprite(0, 0, game.world.width, game.world.height, 'starfield');

	    /*this.enemies = new enemiesGroup(
	    	['ufo', 'wabbit' , 'yellow_ball', 'tomato', 'phaser-ship', 'phaser-dude'],
	    	'particle_small',
	    	'alien_death1',
	    	game.input.keyboard.addKey(Phaser.Keyboard.F1),
	    	200,
	    	0,
	    	700
	    );*/

	    this.players[this.id] = new player ({
	    	image: 'ship',
	    	bulletImage: 'bullet',
	    	fireSound: 'blaster',
		   	cursors: game.input.keyboard.createCursorKeys(),
		    fireButton: game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR),
	    	id: this.id
	    });

	    this.texts.score = game.add.bitmapText(10, 10, 'carrier_command','Score: ' + this.score, 10);
	    this.texts.timer = game.add.bitmapText(game.world.centerX, 10, 'carrier_command', '00:00', 10);
	    this.texts.timer.anchor.set(0.5);

	    this.timer = new timer();
	    game.time.events.loop(Phaser.Timer.SECOND, this.timer.updateTime, this);
		
	},
	killEnemy: function(bullet, enemy) {
	    bullet.kill();
	    this.enemies.kill(enemy);

	    this.score += 55;
	    this.texts.score.setText("Score: " + this.score);
	},
	onGameOver: function(bullet, player) {

        if(!centerText){
            centerText = game.add.bitmapText(game.world.centerX, game.world.centerY, 'carrier_command','----- Game Over -----\n\nScore: ' + this.score + '\n\n' + 'Time: ' + this.timer.getFormattedTime() + '\n\n\nClick to restart', 15);
            centerText.anchor.set(0.5);
        }

        game.paused = true;
        this.gameOver = true;

	}
};