const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width = 1280;
canvas.height = 700;

c.fillRect(0, 0, canvas.width, canvas.height)

//class

class Sprite{
    constructor({position, velocity, color = 'red', offset, surikenOffset}) {
        this.position = position;
        this.velocity = velocity;
        this.height = 150;
        this.width = 50;
        this.lastKey;
        this.jump;
        this.surikenSpeed = 0;
        this.color = color;
        this.attackBox = {
            position: {
                x: this.position.x,
                y: this.position.y,
            },
            height: 50,
            width: 100,
            offset,
        };
        this.suriken = {
            position: {
                x: this.position.x,
                y: this.position.y,
            },
            height: 20,
            width: 20,
            surikenOffset,
        }
        this.isThrowSuriken;
        this.isAttacking;
        this.health = 100;
    }

    draw() {
        c.fillStyle = this.color;
        c.fillRect(this.position.x, this.position.y, this.width, this.height);

        // attackBox
        if (this.isAttacking){
            c.fillStyle = 'green';
            c.fillRect(this.attackBox.position.x, this.attackBox.position.y, this.attackBox.width, this.attackBox.height);
        } 

        // suriken
        if (this.isThrowSuriken) {
            c.fillStyle = 'yellow';
            c.fillRect(this.suriken.position.x, this.suriken.position.y, this.suriken.width, this.suriken.height);
        }
    }

    update() {
        this.draw();
        
        this.attackBox.position.x = this.position.x + this.attackBox.offset.x; 
        this.attackBox.position.y = this.position.y;
        this.suriken.position.x = this.position.x;
        this.suriken.position.y = this.position.y;

        this.suriken.position.x += this.surikenSpeed;

        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        if (this.position.y + this.height + this.velocity.y >= canvas.height) {
            this.velocity.y = 0;
            this.jump = true;
        } else {
            this.velocity.y += gravity;
        };
    };

    attack() {
        this.isAttacking = true;
        setTimeout(() => {
            this.isAttacking = false;
        }, 100);
    }

    throwSuriken() {
        this.isThrowSuriken = true;
        this.surikenSpeed = 60;
    }
}

class Bullet{
    constructor(left){
        this.vx = left ? 1 : -1;

    }


}

const player = new Sprite({
    position: {
        x: 40,
        y: 100,
    },
    velocity: {
        x: 0,
        y: 10,
    },
    offset: {
        x: 0,
        y: 0,
    },
});

const enemy = new Sprite({
    position: {
        x: 110,
        y: 100,
    },
    velocity: {
        x: 0,
        y: 10,
    },
    color: 'blue',
    offset: {
        x: -50,
        y: 0,
    },
});

// consts

const gravity = 0.5;
const keys = {
    a: {
        pressed: false
    },
    d: {
        pressed: false
    },
    w: {
        pressed: false
    },
    ArrowRight: {
        pressed: false
    },
    ArrowLeft: {
        pressed: false
    },
    ArrowUp: {
        pressed: false
    }
};

// lets

let lastKey;
let leftP = false;
let leftE = true;
let timer = 90;
let timerId;
let gameOver = false;

//functions

function determineWinner({player, enemy, timerId}) {
    gameOver = true;
    clearTimeout(timerId);
    let displayText = document.querySelector('#displayText'); 
    displayText.style.display = 'flex';
    if (player.health === enemy.health) {
        displayText.innerHTML = 'Tie!';
    } else if (player.health > enemy.health) {
        displayText.innerHTML = 'Player 1 won!';   
    } else if (player.health < enemy.health) {
        displayText.innerHTML = 'Player 2 won!';        
    }
}

function decreaseTimer() {
    if (timer > 0) {
        timerId = setTimeout(decreaseTimer, 1000);
        timer--;
        document.querySelector('#timer').innerHTML = timer;
    }
    
    if (timer === 0) {
        determineWinner({player, enemy, timerId});
    }
}

decreaseTimer();

function animate(){
    window.requestAnimationFrame(animate);
    c.fillStyle = 'black';
    c.fillRect(0, 0, canvas.width, canvas.height);
    player.update();
    enemy.update();

    player.velocity.x = 0;
    enemy.velocity.x = 0;

    // player`s moves
    
    if (keys.a.pressed && player.lastKey === 'a' && player.position.x > 0) {
        player.velocity.x = -10;
    } else if (keys.d.pressed && player.lastKey === 'd' && player.position.x + player.width < canvas.width) {
        player.velocity.x = 10;
    } else if (keys.w.pressed && player.jump) {
        player.velocity.y = -18;
        player.jump = false;
    }
    //enemy`s moves
    
    if (keys.ArrowLeft.pressed && enemy.lastKey === 'ArrowLeft' && enemy.position.x > 0) {
        enemy.velocity.x = -10;
    } else if (keys.ArrowRight.pressed && enemy.lastKey === 'ArrowRight' && enemy.position.x + enemy.width < canvas.width) {
        enemy.velocity.x = 10;
    } else if (keys.ArrowUp.pressed && enemy.jump) {
        enemy.velocity.y = -18;
        enemy.jump = false;
    }

    //attackBox

    if (player.attackBox.position.x + player.attackBox.width >= enemy.position.x &&
        player.position.x + player.attackBox.width <= enemy.position.x + enemy.width &&
        player.position.y + player.attackBox.height >= enemy.position.y &&
        player.attackBox.position.y <= enemy.position.y + enemy.height  &&
        player.isAttacking){
            player.isAttacking = false;
            enemy.health -= 20;
            document.querySelector('#enemyHealth').style.width = enemy.health + '%';
    }

    if (
        enemy.attackBox.position.x - (enemy.attackBox.width)/2 <= player.position.x &&
        enemy.position.x + enemy.width >= player.position.x + player.width && 
        enemy.position.y + enemy.attackBox.height >= player.position.y && 
        enemy.attackBox.position.y <= player.position.y + player.height &&  
        enemy.isAttacking) {
            enemy.isAttacking = false;
            player.health -= 20;
            document.querySelector('#playerHealth').style.width = player.health + '%';
    }

    // determine the winner 

    if (enemy.health === 0 || player.health === 0) {
        determineWinner({player, enemy, timerId});
    }

    // left or right

    if ( player.position.x > enemy.position.x ) {
        leftP = true;
        leftE = false;
    } else {
        leftP = false;
        leftE = true;
    }
}

animate();

//window

window.addEventListener('keydown', (ev) => {
    if (!gameOver) {
        console.log(ev.key)
        switch(ev.key) {
            // player
            case 'd':
                keys.d.pressed = true;
                player.lastKey = 'd';
                break;
            case 'a':
                keys.a.pressed = true;
                player.lastKey = 'a';
                break;
            case 'w':
                keys.w.pressed = true;
                player.lastKey = 'w';
                break;
            case ' ':
                player.attack();
                break
            case 'q':
                player.throwSuriken();
                break;
            
            //enemy
            case 'ArrowRight':
                keys.ArrowRight.pressed = true;
                enemy.lastKey = 'ArrowRight';
                break;
            case 'ArrowLeft':
                keys.ArrowLeft.pressed = true;
                enemy.lastKey = 'ArrowLeft';
                break;
            case 'ArrowUp':
                keys.ArrowUp.pressed = true;
                enemy.lastKey = 'ArrowUp';
                break;
            case '0':
                enemy.attack();
                break;
            case '1':
                enemy.throwSuriken();
                break;
            }   
        }
});

window.addEventListener('keyup', (ev) => {
    switch(ev.key) {
        // player`s movement
        case 'd':
            keys.d.pressed = false;
            break;
        case 'a':
            keys.a.pressed = false;
            break;
        case 'w':
            keys.w.pressed = false;
            break;
            
    
        case 'ArrowRight':
            keys.ArrowRight.pressed = false;
            break;
        case 'ArrowLeft':
            keys.ArrowLeft.pressed = false;
            break;
        case 'ArrowUp':
            keys.ArrowUp.pressed = false;
            break;
    }   
});