function player(image, bulletImage, fireSound, direction, cursors, fireButton, id, x, y) {

    var self = this;

    if(!x){
        switch(direction){
            case 'down':
            case 'up':
                x = game.world.centerX;
                break;
            case 'left':
                x = game.width - 50;
                break;
            case 'right':
                x = 50;
                break;
        }
    }

    if(!y){
        switch(direction){
            case 'down':
                y = 50;
                break;
            case 'up':
                y = game.height - 50;
                break;
            case 'left':
            case 'right':
                y = game.world.centerY;
                break;
        }
    }

    this.fireSound = game.add.audio(fireSound);

    this.fireButton = fireButton;
    this.cursors = cursors;
    this.input = this.cursors;

    this.id = id;

    this.bulletConfig = {
        time: null,
        startX: null,
        startY: null,
        velocity: null,
        angle: null
    };

    this.direction = direction;
    this.velocity = 600;

    this.ship = game.add.sprite(x, y, image);
    game.physics.arcade.enable(this.ship);
    this.ship.body.collideWorldBounds = true;

    switch(direction){
        case 'down':
            this.ship.angle = 180;
            this.bulletConfig.startX = -this.ship.width / 4;
            this.bulletConfig.startY = -this.ship.height / 2;
            this.bulletConfig.velocityY = 600;
            this.bulletConfig.angle = 0;
            this.ship.body.checkCollision.down = true;
            break;
        case 'up':
            this.ship.angle = 0;
            this.bulletConfig.startX = this.ship.width / 4;
            this.bulletConfig.startY = -this.ship.height / 2;
            this.bulletConfig.velocityY = -600;
            this.bulletConfig.angle = 0;
            this.ship.body.checkCollision.up = true;
            break;
        case 'left':
            this.ship.angle = 270;
            this.bulletConfig.startX = -this.ship.width / 2;
            this.bulletConfig.startY = -this.ship.height / 4;
            this.bulletConfig.velocityX = -600;
            this.bulletConfig.angle = 270;
            this.ship.body.checkCollision.left = true;
            break;
        case 'right':
            this.ship.angle = 90;
            this.bulletConfig.startX = this.ship.width / 2;
            this.bulletConfig.startY = this.ship.height / 4;
            this.bulletConfig.velocityX = 600;
            this.bulletConfig.angle = 90;
            this.ship.body.checkCollision.right = true;
            break;
    }

    this.bullets = null;
    this.bullets = game.add.physicsGroup();
    this.bullets.createMultiple(32, bulletImage, false);
    this.bullets.setAll('checkWorldBounds', true);
    this.bullets.setAll('outOfBoundsKill', true);
    this.bullets.setAll('angle', this.bulletConfig.angle);

    this.fire = function() {

        if (game.time.time > self.bulletConfig.time)
        {
            var bullet = self.bullets.getFirstExists(false);

            if (bullet)
            {
                bullet.reset(self.ship.x + self.bulletConfig.startX, self.ship.y + self.bulletConfig.startY);
                
                if(self.bulletConfig.velocityY)
                    bullet.body.velocity.y = self.bulletConfig.velocityY;
                else
                    bullet.body.velocity.x = self.bulletConfig.velocityX;

                self.bulletConfig.time = game.time.time + 100;
                self.fireSound.play();
            }
        }

    }

    this.update = function(eurecaServer, id) {

        if(eurecaServer){

            var inputChanged = (
                this.cursor.left != this.input.left ||
                this.cursor.right != this.input.right ||
                this.cursor.up != this.input.up ||
                this.cursor.fire != this.input.fire
            );
            
            
            if (inputChanged)
            {

                if (this.id == id)
                {
                    this.input.x = this.tank.x;
                    this.input.y = this.tank.y;
                    
                    eurecaServer.handleKeys(this.input);
                }
            }

        }

        self.ship.body.velocity.x = 0;
        self.ship.body.velocity.y = 0;

        if (self.cursors.left.isDown && (self.direction == "up" || self.direction == "down"))
            self.ship.body.velocity.x = -self.velocity;
        else if (self.cursors.left.isDown && self.direction == "left")
            self.ship.body.velocity.y = self.velocity;
        else if (self.cursors.left.isDown && self.direction == "right")
            self.ship.body.velocity.y = -self.velocity;
        else if (self.cursors.right.isDown && (self.direction == "up" || self.direction == "down"))
            self.ship.body.velocity.x = self.velocity;
        else if (self.cursors.right.isDown && self.direction == "left")
            self.ship.body.velocity.y = -self.velocity;
        else if (self.cursors.right.isDown && self.direction == "right")
            self.ship.body.velocity.y = self.velocity;

        if (self.fireButton.isDown)
            self.fire();

    }

}