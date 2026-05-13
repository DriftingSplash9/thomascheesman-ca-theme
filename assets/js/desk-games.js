/*!
 * desk-games.js — the toad's hidden arcade.
 *
 * Four simple canvas games tucked inside the desk menu: Snake, Pong,
 * Pac-Man, and Asteroids. Clicking the toad (#tc-desk-frog) opens the
 * games drawer (wired in desk-menu.js's init); this file owns the
 * picker → play view switching, the actual game loops, and
 * localStorage high scores.
 *
 * Each game module exposes a single `start(ctx, hooks)` function that:
 *   - Configures the canvas size, draws the initial frame
 *   - Hooks document keydown for input
 *   - Runs its own setInterval / requestAnimationFrame loop
 *   - Calls hooks.onScore(n) when the score changes
 *   - Calls hooks.onGameOver(finalScore) when the player dies
 *   - Returns a cleanup function (the drawer-close MutationObserver
 *     calls this so background games don't keep running)
 *
 * Aesthetic: CRT phosphor — bright green on near-black with no
 * anti-aliasing. Matches the desk's monitor vibe.
 *
 * Mobile: the drawer itself is hidden via CSS on coarse-pointer /
 * narrow viewports, so games never start without a keyboard.
 */
( function () {
    'use strict';

    var doc = document;

    // ----------------------------------------------------------------
    // High-score storage
    // ----------------------------------------------------------------
    var HS_KEY = 'tcDeskGamesHigh';
    function readHigh( game ) {
        try {
            var raw = localStorage.getItem( HS_KEY );
            if ( ! raw ) return 0;
            var parsed = JSON.parse( raw );
            return parseInt( parsed[ game ], 10 ) || 0;
        } catch ( e ) { return 0; }
    }
    function writeHigh( game, score ) {
        try {
            var raw = localStorage.getItem( HS_KEY );
            var parsed = raw ? JSON.parse( raw ) : {};
            parsed[ game ] = score;
            localStorage.setItem( HS_KEY, JSON.stringify( parsed ) );
        } catch ( e ) {}
    }

    // ----------------------------------------------------------------
    // Drawer wiring + view switching
    // ----------------------------------------------------------------
    function init() {
        var drawer = doc.getElementById( 'tc-desk-games-drawer' );
        if ( ! drawer ) return;

        var picker     = drawer.querySelector( '[data-games-view="picker"]' );
        var playView   = drawer.querySelector( '[data-games-view="play"]' );
        var cards      = drawer.querySelectorAll( '[data-game]' );
        var backBtn    = drawer.querySelector( '[data-games-back]' );
        var canvas     = drawer.querySelector( '[data-games-canvas]' );
        var titleEl    = drawer.querySelector( '[data-games-title]' );
        var scoreEl    = drawer.querySelector( '[data-games-score]' );
        var highEl     = drawer.querySelector( '[data-games-high-current]' );
        var controlsEl = drawer.querySelector( '[data-games-controls]' );
        var gameoverEl = drawer.querySelector( '[data-games-gameover]' );
        var gameoverMsg = drawer.querySelector( '[data-games-gameover-msg]' );
        var restartBtn = drawer.querySelector( '[data-games-restart]' );

        var GAMES = {
            snake:     { title: 'Snake',     controls: '&larr;&uarr;&darr;&rarr; to slither',         start: startSnake     },
            pong:      { title: 'Pong',      controls: '&uarr;&darr; to move &mdash; first to 5 wins', start: startPong      },
            pacman:    { title: 'Pac-Man',   controls: '&larr;&uarr;&darr;&rarr; &mdash; eat the dots', start: startPacman    },
            asteroids: { title: 'Asteroids', controls: '&larr;&rarr; rotate &middot; &uarr; thrust &middot; space fire', start: startAsteroids },
        };

        var currentKey  = null;
        var currentStop = null;

        function paintHighScores() {
            Object.keys( GAMES ).forEach( function ( k ) {
                var el = drawer.querySelector( '[data-games-high="' + k + '"]' );
                if ( el ) el.textContent = readHigh( k );
            } );
        }

        function showPicker() {
            stopCurrent();
            picker.hidden = false;
            playView.hidden = true;
            paintHighScores();
        }

        function stopCurrent() {
            if ( typeof currentStop === 'function' ) {
                try { currentStop(); } catch ( e ) {}
            }
            currentStop = null;
            currentKey  = null;
        }

        function play( key ) {
            var game = GAMES[ key ];
            if ( ! game ) return;
            stopCurrent();
            currentKey = key;
            picker.hidden = true;
            playView.hidden = false;
            titleEl.textContent = game.title;
            controlsEl.innerHTML = game.controls;
            scoreEl.textContent = '0';
            highEl.textContent  = readHigh( key );
            gameoverEl.hidden = true;
            // Each game writes its own pixel dimensions onto the canvas.
            currentStop = game.start( canvas, {
                onScore: function ( n ) { scoreEl.textContent = n; },
                onGameOver: function ( finalScore, msg ) {
                    var high = readHigh( key );
                    var isNew = finalScore > high;
                    if ( isNew ) {
                        writeHigh( key, finalScore );
                        highEl.textContent = finalScore;
                    }
                    gameoverMsg.textContent = ( msg || 'Game over' )
                        + ( isNew ? ' &mdash; new high!' : '' );
                    gameoverMsg.innerHTML = gameoverMsg.textContent;
                    gameoverEl.hidden = false;
                },
            } );
            // Focus the canvas so keyboard input lands here, not on a
            // background button.
            try { canvas.focus(); } catch ( e ) {}
        }

        cards.forEach( function ( card ) {
            card.addEventListener( 'click', function ( e ) {
                e.preventDefault();
                play( card.getAttribute( 'data-game' ) );
            } );
        } );

        backBtn.addEventListener( 'click', function ( e ) {
            e.preventDefault();
            showPicker();
        } );

        restartBtn.addEventListener( 'click', function () {
            if ( currentKey ) play( currentKey );
        } );

        // When the drawer closes (button, ESC, click-outside — all
        // wired in desk-menu.js), the .is-open class drops. Catch that
        // and tear down the running game so it doesn't burn CPU in the
        // background.
        var observer = new MutationObserver( function () {
            if ( ! drawer.classList.contains( 'is-open' ) ) {
                stopCurrent();
                // Reset the drawer to picker view for next open.
                picker.hidden = false;
                playView.hidden = true;
                gameoverEl.hidden = true;
            } else {
                // On open, refresh the displayed highs.
                paintHighScores();
            }
        } );
        observer.observe( drawer, { attributes: true, attributeFilter: [ 'class' ] } );

        paintHighScores();
    }

    // ================================================================
    // SNAKE
    // ================================================================
    function startSnake( canvas, hooks ) {
        var W = 22, H = 20, CELL = 18;
        canvas.width  = W * CELL;
        canvas.height = H * CELL;
        var ctx = canvas.getContext( '2d' );

        var snake, dir, nextDir, food, score, tickMs, timer, alive;

        function reset() {
            snake = [ { x: 11, y: 10 }, { x: 10, y: 10 }, { x: 9, y: 10 } ];
            dir = { x: 1, y: 0 };
            nextDir = { x: 1, y: 0 };
            score = 0;
            tickMs = 130;
            alive = true;
            placeFood();
        }

        function placeFood() {
            while ( true ) {
                var fx = Math.floor( Math.random() * W );
                var fy = Math.floor( Math.random() * H );
                var clash = false;
                for ( var i = 0; i < snake.length; i++ ) {
                    if ( snake[ i ].x === fx && snake[ i ].y === fy ) { clash = true; break; }
                }
                if ( ! clash ) { food = { x: fx, y: fy }; return; }
            }
        }

        function tick() {
            if ( ! alive ) return;
            dir = nextDir;
            var head = { x: snake[ 0 ].x + dir.x, y: snake[ 0 ].y + dir.y };
            if ( head.x < 0 || head.x >= W || head.y < 0 || head.y >= H ) return die();
            for ( var i = 0; i < snake.length; i++ ) {
                if ( snake[ i ].x === head.x && snake[ i ].y === head.y ) return die();
            }
            snake.unshift( head );
            if ( head.x === food.x && head.y === food.y ) {
                score += 10;
                hooks.onScore( score );
                placeFood();
                if ( tickMs > 60 ) {
                    tickMs -= 3;
                    clearInterval( timer );
                    timer = setInterval( tick, tickMs );
                }
            } else {
                snake.pop();
            }
            draw();
        }

        function die() {
            alive = false;
            clearInterval( timer );
            hooks.onGameOver( score );
        }

        function draw() {
            ctx.fillStyle = '#001508';
            ctx.fillRect( 0, 0, canvas.width, canvas.height );
            // Subtle grid
            ctx.strokeStyle = '#0fff8a11';
            ctx.lineWidth = 1;
            for ( var x = 0; x <= W; x++ ) {
                ctx.beginPath();
                ctx.moveTo( x * CELL, 0 );
                ctx.lineTo( x * CELL, canvas.height );
                ctx.stroke();
            }
            // Snake
            ctx.fillStyle = '#0fff8a';
            snake.forEach( function ( s, i ) {
                ctx.fillRect( s.x * CELL + 1, s.y * CELL + 1, CELL - 2, CELL - 2 );
            } );
            // Food
            ctx.fillStyle = '#ff5588';
            ctx.beginPath();
            ctx.arc( food.x * CELL + CELL / 2, food.y * CELL + CELL / 2, CELL / 2 - 2, 0, Math.PI * 2 );
            ctx.fill();
        }

        function onKey( e ) {
            var k = e.key;
            if ( ( k === 'ArrowUp'    || k === 'w' ) && dir.y === 0 ) { nextDir = { x: 0, y: -1 }; e.preventDefault(); }
            else if ( ( k === 'ArrowDown'  || k === 's' ) && dir.y === 0 ) { nextDir = { x: 0, y:  1 }; e.preventDefault(); }
            else if ( ( k === 'ArrowLeft'  || k === 'a' ) && dir.x === 0 ) { nextDir = { x: -1, y: 0 }; e.preventDefault(); }
            else if ( ( k === 'ArrowRight' || k === 'd' ) && dir.x === 0 ) { nextDir = { x:  1, y: 0 }; e.preventDefault(); }
        }

        reset();
        draw();
        timer = setInterval( tick, tickMs );
        doc.addEventListener( 'keydown', onKey );

        return function stop() {
            alive = false;
            clearInterval( timer );
            doc.removeEventListener( 'keydown', onKey );
        };
    }

    // ================================================================
    // PONG
    // ================================================================
    function startPong( canvas, hooks ) {
        canvas.width = 600;
        canvas.height = 360;
        var ctx = canvas.getContext( '2d' );

        var PAD_W = 10, PAD_H = 70;
        var playerY = canvas.height / 2 - PAD_H / 2;
        var cpuY    = canvas.height / 2 - PAD_H / 2;
        var ballX, ballY, ballVX, ballVY;
        var playerScore = 0, cpuScore = 0;
        var TARGET = 5;
        var keys = { up: false, down: false };
        var raf;
        var over = false;

        function serve( towardPlayer ) {
            ballX = canvas.width / 2;
            ballY = canvas.height / 2;
            var speed = 4.5;
            var angle = ( Math.random() - 0.5 ) * 0.6; // small vertical component
            ballVX = ( towardPlayer ? -1 : 1 ) * speed * Math.cos( angle );
            ballVY = speed * Math.sin( angle );
        }

        function loop() {
            if ( over ) return;
            // Player
            if ( keys.up   ) playerY -= 6;
            if ( keys.down ) playerY += 6;
            playerY = Math.max( 0, Math.min( canvas.height - PAD_H, playerY ) );
            // CPU — track ball with slight delay (capped speed)
            var target = ballY - PAD_H / 2;
            if ( cpuY < target ) cpuY = Math.min( cpuY + 4.2, target );
            else                 cpuY = Math.max( cpuY - 4.2, target );
            cpuY = Math.max( 0, Math.min( canvas.height - PAD_H, cpuY ) );

            // Ball
            ballX += ballVX;
            ballY += ballVY;
            if ( ballY < 0 ) { ballY = 0; ballVY = -ballVY; }
            else if ( ballY > canvas.height ) { ballY = canvas.height; ballVY = -ballVY; }

            // Left paddle collision
            if ( ballVX < 0 && ballX <= 20 + PAD_W && ballY >= playerY && ballY <= playerY + PAD_H ) {
                ballX = 20 + PAD_W;
                ballVX = -ballVX * 1.06;
                ballVY += ( ballY - ( playerY + PAD_H / 2 ) ) * 0.08;
            }
            // Right paddle collision
            if ( ballVX > 0 && ballX >= canvas.width - 20 - PAD_W && ballY >= cpuY && ballY <= cpuY + PAD_H ) {
                ballX = canvas.width - 20 - PAD_W;
                ballVX = -ballVX * 1.06;
                ballVY += ( ballY - ( cpuY + PAD_H / 2 ) ) * 0.08;
            }

            // Score
            if ( ballX < 0 ) {
                cpuScore++;
                if ( cpuScore >= TARGET ) return finish( false );
                serve( true );
            } else if ( ballX > canvas.width ) {
                playerScore++;
                hooks.onScore( playerScore );
                if ( playerScore >= TARGET ) return finish( true );
                serve( false );
            }

            draw();
            raf = requestAnimationFrame( loop );
        }

        function draw() {
            ctx.fillStyle = '#001508';
            ctx.fillRect( 0, 0, canvas.width, canvas.height );
            // Centerline
            ctx.fillStyle = '#0fff8a33';
            for ( var y = 8; y < canvas.height; y += 22 ) {
                ctx.fillRect( canvas.width / 2 - 1, y, 2, 12 );
            }
            // Scores
            ctx.fillStyle = '#0fff8a';
            ctx.font = 'bold 36px ui-monospace, monospace';
            ctx.textAlign = 'center';
            ctx.fillText( playerScore, canvas.width / 2 - 60, 44 );
            ctx.fillText( cpuScore,    canvas.width / 2 + 60, 44 );
            // Paddles
            ctx.fillRect( 20, playerY, PAD_W, PAD_H );
            ctx.fillRect( canvas.width - 20 - PAD_W, cpuY, PAD_W, PAD_H );
            // Ball
            ctx.fillRect( ballX - 5, ballY - 5, 10, 10 );
        }

        function finish( won ) {
            over = true;
            cancelAnimationFrame( raf );
            hooks.onGameOver( playerScore, won ? 'You win!' : 'CPU wins' );
        }

        function onKey( e ) {
            if ( e.key === 'ArrowUp'   || e.key === 'w' ) { keys.up = true;   e.preventDefault(); }
            if ( e.key === 'ArrowDown' || e.key === 's' ) { keys.down = true; e.preventDefault(); }
        }
        function onKeyUp( e ) {
            if ( e.key === 'ArrowUp'   || e.key === 'w' ) keys.up = false;
            if ( e.key === 'ArrowDown' || e.key === 's' ) keys.down = false;
        }

        serve( Math.random() > 0.5 );
        draw();
        raf = requestAnimationFrame( loop );
        doc.addEventListener( 'keydown', onKey );
        doc.addEventListener( 'keyup',   onKeyUp );

        return function stop() {
            over = true;
            cancelAnimationFrame( raf );
            doc.removeEventListener( 'keydown', onKey );
            doc.removeEventListener( 'keyup',   onKeyUp );
        };
    }

    // ================================================================
    // PAC-MAN (simplified: small fixed maze, random-walk ghosts)
    // ================================================================
    function startPacman( canvas, hooks ) {
        // Maze grid: '#' wall, '.' dot, 'o' power pellet, ' ' empty
        var MAZE = [
            '##############',
            '#o..........o#',
            '#.####.####.##',
            '#.#........#.#',
            '#.#.######.#.#',
            '#...#    #...#',
            '###.#    #.###',
            '#...#    #...#',
            '#.#.######.#.#',
            '#.#........#.#',
            '#.####.####.##',
            '#o..........o#',
            '##############',
        ];
        var ROWS = MAZE.length;
        var COLS = MAZE[ 0 ].length;
        var CELL = 26;
        canvas.width  = COLS * CELL;
        canvas.height = ROWS * CELL;
        var ctx = canvas.getContext( '2d' );

        // Mutable grid (so we can erase dots as eaten)
        var grid = MAZE.map( function ( r ) { return r.split( '' ); } );
        var dotsLeft = 0;
        grid.forEach( function ( r ) { r.forEach( function ( c ) { if ( c === '.' || c === 'o' ) dotsLeft++; } ); } );

        var pac    = { col: 6, row: 9, dx: 0, dy: 0, nextDx: 0, nextDy: 0, mouth: 0 };
        var ghosts = [
            { col: 6, row: 5, dx: 0, dy: 1, color: '#ff5588' },
            { col: 7, row: 7, dx: 0, dy: -1, color: '#80f8ff' },
        ];
        var score = 0;
        var powerLeft = 0;
        var alive = true;
        var timer;

        function isWall( c, r ) {
            if ( r < 0 || r >= ROWS || c < 0 || c >= COLS ) return true;
            return grid[ r ][ c ] === '#';
        }

        function tick() {
            if ( ! alive ) return;
            // Pac-Man tries the queued direction first if not blocked
            if ( ( pac.nextDx || pac.nextDy ) && ! isWall( pac.col + pac.nextDx, pac.row + pac.nextDy ) ) {
                pac.dx = pac.nextDx;
                pac.dy = pac.nextDy;
            }
            var nx = pac.col + pac.dx;
            var ny = pac.row + pac.dy;
            if ( ! isWall( nx, ny ) ) { pac.col = nx; pac.row = ny; }

            // Eat
            var here = grid[ pac.row ][ pac.col ];
            if ( here === '.' ) { score += 10; grid[ pac.row ][ pac.col ] = ' '; dotsLeft--; hooks.onScore( score ); }
            else if ( here === 'o' ) { score += 50; grid[ pac.row ][ pac.col ] = ' '; dotsLeft--; powerLeft = 28; hooks.onScore( score ); }

            if ( dotsLeft === 0 ) return win();

            // Ghosts random-walk (with retry if blocked) — keep direction
            // unless blocked or 1-in-5 chance to turn
            ghosts.forEach( function ( g ) {
                var options = [];
                [ [ 1, 0 ], [ -1, 0 ], [ 0, 1 ], [ 0, -1 ] ].forEach( function ( d ) {
                    if ( ! isWall( g.col + d[ 0 ], g.row + d[ 1 ] ) ) options.push( d );
                } );
                // Prefer to continue if possible (and don't reverse unless forced)
                var canContinue = ! isWall( g.col + g.dx, g.row + g.dy );
                var willTurn = ! canContinue || Math.random() < 0.18;
                if ( willTurn && options.length ) {
                    // Filter out reverse if we have other choices
                    var nonReverse = options.filter( function ( d ) {
                        return ! ( d[ 0 ] === -g.dx && d[ 1 ] === -g.dy );
                    } );
                    var pool = nonReverse.length ? nonReverse : options;
                    var pick = pool[ Math.floor( Math.random() * pool.length ) ];
                    g.dx = pick[ 0 ]; g.dy = pick[ 1 ];
                }
                g.col += g.dx;
                g.row += g.dy;
            } );

            // Collision
            ghosts.forEach( function ( g ) {
                if ( g.col === pac.col && g.row === pac.row ) {
                    if ( powerLeft > 0 ) {
                        score += 200;
                        hooks.onScore( score );
                        // Send ghost back to its spawn
                        g.col = 6 + Math.floor( Math.random() * 2 );
                        g.row = 5 + Math.floor( Math.random() * 3 );
                        g.dx = 0; g.dy = 1;
                    } else {
                        return die();
                    }
                }
            } );

            if ( powerLeft > 0 ) powerLeft--;
            pac.mouth = ( pac.mouth + 1 ) % 6;
            draw();
        }

        function die() {
            alive = false;
            clearInterval( timer );
            hooks.onGameOver( score );
        }
        function win() {
            alive = false;
            clearInterval( timer );
            hooks.onGameOver( score, 'Cleared the maze!' );
        }

        function draw() {
            ctx.fillStyle = '#000';
            ctx.fillRect( 0, 0, canvas.width, canvas.height );
            // Maze
            for ( var r = 0; r < ROWS; r++ ) {
                for ( var c = 0; c < COLS; c++ ) {
                    var ch = grid[ r ][ c ];
                    var x = c * CELL, y = r * CELL;
                    if ( ch === '#' ) {
                        ctx.fillStyle = '#1840d8';
                        ctx.fillRect( x + 2, y + 2, CELL - 4, CELL - 4 );
                        ctx.strokeStyle = '#80a8ff';
                        ctx.strokeRect( x + 2.5, y + 2.5, CELL - 5, CELL - 5 );
                    } else if ( ch === '.' ) {
                        ctx.fillStyle = '#f5deb3';
                        ctx.beginPath();
                        ctx.arc( x + CELL / 2, y + CELL / 2, 2.5, 0, Math.PI * 2 );
                        ctx.fill();
                    } else if ( ch === 'o' ) {
                        ctx.fillStyle = '#ffffff';
                        ctx.beginPath();
                        ctx.arc( x + CELL / 2, y + CELL / 2, 6, 0, Math.PI * 2 );
                        ctx.fill();
                    }
                }
            }
            // Pac-Man
            var px = pac.col * CELL + CELL / 2;
            var py = pac.row * CELL + CELL / 2;
            ctx.fillStyle = '#ffe200';
            ctx.beginPath();
            var mouthOpen = ( pac.mouth < 3 ) ? 0.22 + pac.mouth * 0.09 : 0.45 - ( pac.mouth - 3 ) * 0.09;
            var angle = Math.atan2( pac.dy, pac.dx || 1 );
            ctx.moveTo( px, py );
            ctx.arc( px, py, CELL / 2 - 2, angle + mouthOpen * Math.PI, angle + ( 2 - mouthOpen ) * Math.PI );
            ctx.closePath();
            ctx.fill();
            // Ghosts
            ghosts.forEach( function ( g ) {
                var gx = g.col * CELL + CELL / 2;
                var gy = g.row * CELL + CELL / 2;
                ctx.fillStyle = powerLeft > 0 ? '#3a3a8a' : g.color;
                ctx.beginPath();
                ctx.arc( gx, gy, CELL / 2 - 3, Math.PI, 0 );
                ctx.lineTo( gx + CELL / 2 - 3, gy + CELL / 2 - 4 );
                ctx.lineTo( gx + CELL / 4,     gy + CELL / 2 - 8 );
                ctx.lineTo( gx,                gy + CELL / 2 - 4 );
                ctx.lineTo( gx - CELL / 4,     gy + CELL / 2 - 8 );
                ctx.lineTo( gx - CELL / 2 + 3, gy + CELL / 2 - 4 );
                ctx.closePath();
                ctx.fill();
                // Eyes
                ctx.fillStyle = '#fff';
                ctx.beginPath(); ctx.arc( gx - 4, gy - 2, 2.8, 0, Math.PI * 2 ); ctx.fill();
                ctx.beginPath(); ctx.arc( gx + 4, gy - 2, 2.8, 0, Math.PI * 2 ); ctx.fill();
            } );
        }

        function onKey( e ) {
            var k = e.key;
            if      ( k === 'ArrowUp'    || k === 'w' ) { pac.nextDx = 0;  pac.nextDy = -1; e.preventDefault(); }
            else if ( k === 'ArrowDown'  || k === 's' ) { pac.nextDx = 0;  pac.nextDy =  1; e.preventDefault(); }
            else if ( k === 'ArrowLeft'  || k === 'a' ) { pac.nextDx = -1; pac.nextDy =  0; e.preventDefault(); }
            else if ( k === 'ArrowRight' || k === 'd' ) { pac.nextDx =  1; pac.nextDy =  0; e.preventDefault(); }
        }

        draw();
        timer = setInterval( tick, 180 );
        doc.addEventListener( 'keydown', onKey );

        return function stop() {
            alive = false;
            clearInterval( timer );
            doc.removeEventListener( 'keydown', onKey );
        };
    }

    // ================================================================
    // ASTEROIDS
    // ================================================================
    function startAsteroids( canvas, hooks ) {
        canvas.width = 600;
        canvas.height = 420;
        var ctx = canvas.getContext( '2d' );
        var W = canvas.width, H = canvas.height;

        var ship = { x: W / 2, y: H / 2, vx: 0, vy: 0, angle: -Math.PI / 2, radius: 10 };
        var bullets = [];
        var asteroids = [];
        var score = 0;
        var alive = true;
        var raf;
        var keys = { left: false, right: false, up: false };
        var fireCooldown = 0;

        function spawnAsteroid( size, x, y ) {
            asteroids.push( {
                x: x !== undefined ? x : Math.random() * W,
                y: y !== undefined ? y : Math.random() * H,
                vx: ( Math.random() - 0.5 ) * ( 1.6 - size * 0.25 ),
                vy: ( Math.random() - 0.5 ) * ( 1.6 - size * 0.25 ),
                size: size,
                radius: size * 14,
                shape: ( function () {
                    // Pre-generate a jagged polygon for the look
                    var pts = [];
                    var n = 9;
                    for ( var i = 0; i < n; i++ ) {
                        var a = ( i / n ) * Math.PI * 2;
                        var r = 0.7 + Math.random() * 0.5;
                        pts.push( [ a, r ] );
                    }
                    return pts;
                } )(),
                spin: ( Math.random() - 0.5 ) * 0.02,
                rot: Math.random() * Math.PI * 2,
            } );
        }

        function reset() {
            for ( var i = 0; i < 4; i++ ) {
                var x, y, tries = 0;
                do {
                    x = Math.random() * W;
                    y = Math.random() * H;
                    tries++;
                } while ( Math.hypot( x - ship.x, y - ship.y ) < 120 && tries < 20 );
                spawnAsteroid( 3, x, y );
            }
        }

        function wrap( o ) {
            if ( o.x < 0 ) o.x += W;
            else if ( o.x > W ) o.x -= W;
            if ( o.y < 0 ) o.y += H;
            else if ( o.y > H ) o.y -= H;
        }

        function tick() {
            if ( ! alive ) return;

            // Input
            if ( keys.left  ) ship.angle -= 0.08;
            if ( keys.right ) ship.angle += 0.08;
            if ( keys.up ) {
                ship.vx += Math.cos( ship.angle ) * 0.18;
                ship.vy += Math.sin( ship.angle ) * 0.18;
            }
            // Drag
            ship.vx *= 0.992;
            ship.vy *= 0.992;
            ship.x += ship.vx;
            ship.y += ship.vy;
            wrap( ship );

            if ( fireCooldown > 0 ) fireCooldown--;

            // Bullets
            bullets.forEach( function ( b ) {
                b.x += b.vx; b.y += b.vy; b.life--;
                wrap( b );
            } );
            bullets = bullets.filter( function ( b ) { return b.life > 0; } );

            // Asteroids
            asteroids.forEach( function ( a ) {
                a.x += a.vx; a.y += a.vy; a.rot += a.spin;
                wrap( a );
            } );

            // Bullet-asteroid collisions
            for ( var i = asteroids.length - 1; i >= 0; i-- ) {
                var a = asteroids[ i ];
                for ( var j = bullets.length - 1; j >= 0; j-- ) {
                    var b = bullets[ j ];
                    if ( Math.hypot( a.x - b.x, a.y - b.y ) < a.radius ) {
                        bullets.splice( j, 1 );
                        asteroids.splice( i, 1 );
                        score += ( 4 - a.size ) * 30; // 3 → 30, 2 → 60, 1 → 90
                        hooks.onScore( score );
                        if ( a.size > 1 ) {
                            spawnAsteroid( a.size - 1, a.x, a.y );
                            spawnAsteroid( a.size - 1, a.x, a.y );
                        }
                        break;
                    }
                }
            }

            // Ship-asteroid collision
            for ( var k = 0; k < asteroids.length; k++ ) {
                var ax = asteroids[ k ];
                if ( Math.hypot( ax.x - ship.x, ax.y - ship.y ) < ax.radius + ship.radius - 2 ) {
                    return die();
                }
            }

            // Refill if cleared
            if ( asteroids.length === 0 ) {
                for ( var n = 0; n < 5; n++ ) spawnAsteroid( 3 );
            }

            draw();
            raf = requestAnimationFrame( tick );
        }

        function draw() {
            ctx.fillStyle = '#000';
            ctx.fillRect( 0, 0, W, H );
            // Stars
            ctx.fillStyle = '#0fff8a44';
            for ( var s = 0; s < 40; s++ ) {
                var sx = ( s * 137 ) % W;
                var sy = ( s * 89 ) % H;
                ctx.fillRect( sx, sy, 1, 1 );
            }
            // Asteroids
            ctx.strokeStyle = '#0fff8a';
            ctx.lineWidth = 1.5;
            asteroids.forEach( function ( a ) {
                ctx.beginPath();
                a.shape.forEach( function ( p, i ) {
                    var ang = p[ 0 ] + a.rot;
                    var px = a.x + Math.cos( ang ) * a.radius * p[ 1 ];
                    var py = a.y + Math.sin( ang ) * a.radius * p[ 1 ];
                    if ( i === 0 ) ctx.moveTo( px, py );
                    else           ctx.lineTo( px, py );
                } );
                ctx.closePath();
                ctx.stroke();
            } );
            // Bullets
            ctx.fillStyle = '#ffe200';
            bullets.forEach( function ( b ) {
                ctx.fillRect( b.x - 2, b.y - 2, 3, 3 );
            } );
            // Ship
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            var tip   = [ ship.x + Math.cos( ship.angle ) * 14, ship.y + Math.sin( ship.angle ) * 14 ];
            var left  = [ ship.x + Math.cos( ship.angle + 2.5 ) * 10, ship.y + Math.sin( ship.angle + 2.5 ) * 10 ];
            var right = [ ship.x + Math.cos( ship.angle - 2.5 ) * 10, ship.y + Math.sin( ship.angle - 2.5 ) * 10 ];
            ctx.moveTo( tip[ 0 ], tip[ 1 ] );
            ctx.lineTo( left[ 0 ], left[ 1 ] );
            ctx.lineTo( right[ 0 ], right[ 1 ] );
            ctx.closePath();
            ctx.stroke();
            // Thrust flame
            if ( keys.up ) {
                ctx.strokeStyle = '#ff8800';
                ctx.beginPath();
                ctx.moveTo( left[ 0 ] * 0.6 + right[ 0 ] * 0.4, left[ 1 ] * 0.6 + right[ 1 ] * 0.4 );
                ctx.lineTo( ship.x - Math.cos( ship.angle ) * 16, ship.y - Math.sin( ship.angle ) * 16 );
                ctx.lineTo( left[ 0 ] * 0.4 + right[ 0 ] * 0.6, left[ 1 ] * 0.4 + right[ 1 ] * 0.6 );
                ctx.stroke();
            }
        }

        function die() {
            alive = false;
            cancelAnimationFrame( raf );
            hooks.onGameOver( score );
        }

        function fire() {
            if ( fireCooldown > 0 || bullets.length >= 5 ) return;
            bullets.push( {
                x: ship.x + Math.cos( ship.angle ) * 14,
                y: ship.y + Math.sin( ship.angle ) * 14,
                vx: Math.cos( ship.angle ) * 6 + ship.vx,
                vy: Math.sin( ship.angle ) * 6 + ship.vy,
                life: 60,
            } );
            fireCooldown = 8;
        }

        function onKey( e ) {
            if ( e.key === 'ArrowLeft'  || e.key === 'a' ) { keys.left  = true; e.preventDefault(); }
            if ( e.key === 'ArrowRight' || e.key === 'd' ) { keys.right = true; e.preventDefault(); }
            if ( e.key === 'ArrowUp'    || e.key === 'w' ) { keys.up    = true; e.preventDefault(); }
            if ( e.key === ' ' )                            { fire();           e.preventDefault(); }
        }
        function onKeyUp( e ) {
            if ( e.key === 'ArrowLeft'  || e.key === 'a' ) keys.left  = false;
            if ( e.key === 'ArrowRight' || e.key === 'd' ) keys.right = false;
            if ( e.key === 'ArrowUp'    || e.key === 'w' ) keys.up    = false;
        }

        reset();
        draw();
        raf = requestAnimationFrame( tick );
        doc.addEventListener( 'keydown', onKey );
        doc.addEventListener( 'keyup',   onKeyUp );

        return function stop() {
            alive = false;
            cancelAnimationFrame( raf );
            doc.removeEventListener( 'keydown', onKey );
            doc.removeEventListener( 'keyup',   onKeyUp );
        };
    }

    if ( doc.readyState === 'loading' ) {
        doc.addEventListener( 'DOMContentLoaded', init );
    } else {
        init();
    }
} )();
