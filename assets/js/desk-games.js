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
    // Leaderboard — REST-backed persistent top-10 per game.
    //
    // The endpoint URL is injected by wp_localize_script into a global
    // `tcDeskGames` object (functions.php). All requests are public —
    // see inc/games-leaderboard.php for the trust model.
    //
    // `boards` is a session cache: shaped as { [gameKey]: row[] } where
    // row = { name, score, ts }. Refreshed on drawer open and after a
    // successful POST. If the network call fails the cache stays empty
    // and the UI shows "—" everywhere, which is intentional — better
    // than misleading 0s that look like real high scores.
    // ----------------------------------------------------------------
    var SCORES_URL = ( window.tcDeskGames && window.tcDeskGames.scoresUrl ) || '/wp-json/tc-games/v1/scores';
    var AUDIO_URLS = ( window.tcDeskGames && window.tcDeskGames.audio ) || {};
    var boards = {};

    // One-shot SFX helper. Each call spawns a fresh Audio() so rapid
    // events (Asteroids' five-bullet salvo, Pong rallies on the wall +
    // paddles) overlap cleanly instead of cutting each other off.
    // play() returns a Promise that rejects under autoplay-policy;
    // failures are silently swallowed so a muted browser doesn't
    // make the games error out.
    function playSfx( url, volume ) {
        if ( ! url ) return;
        try {
            var a = new Audio( url );
            if ( typeof volume === 'number' ) a.volume = volume;
            var p = a.play();
            if ( p && p.catch ) p.catch( function () {} );
        } catch ( e ) {}
    }

    // Shared background loop — one element reused across game starts
    // so we don't stack tracks if the player jumps between games.
    // Lifecycle: started in play(), stopped in stopCurrent().
    var bgLoop = null;
    function startBgLoop() {
        if ( ! AUDIO_URLS.arcadeBg ) return;
        if ( bgLoop ) { try { bgLoop.pause(); bgLoop.src = ''; } catch ( e ) {} }
        try {
            bgLoop = new Audio( AUDIO_URLS.arcadeBg );
            bgLoop.loop   = true;
            bgLoop.volume = 0.18; // low; SFX should sit on top of it
            var p = bgLoop.play();
            if ( p && p.catch ) p.catch( function () {} );
        } catch ( e ) { bgLoop = null; }
    }
    function stopBgLoop() {
        if ( ! bgLoop ) return;
        try { bgLoop.pause(); bgLoop.src = ''; } catch ( e ) {}
        bgLoop = null;
    }

    function fetchBoards() {
        return fetch( SCORES_URL, { credentials: 'same-origin' } )
            .then( function ( r ) { return r.ok ? r.json() : {}; } )
            .then( function ( data ) { boards = data || {}; return boards; } )
            .catch( function () { return {}; } );
    }

    function postScore( game, name, score ) {
        return fetch( SCORES_URL, {
            method: 'POST',
            credentials: 'same-origin',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify( { game: game, name: name, score: score } ),
        } )
            .then( function ( r ) { return r.ok ? r.json() : null; } )
            .catch( function () { return null; } );
    }

    function topRow( game ) {
        var b = boards[ game ];
        return ( b && b.length ) ? b[ 0 ] : null;
    }

    function qualifiesForTop10( game, score ) {
        var b = boards[ game ] || [];
        if ( b.length < 10 ) return score > 0;
        return score > b[ b.length - 1 ].score;
    }

    // Game keydown handlers run on `document` and call preventDefault()
    // on a / w / s / d / arrows so the page doesn't scroll. That's fine
    // during play, but after game-over the player has a text input
    // focused (the leaderboard name entry) and those preventDefault()s
    // were swallowing characters like 'a'. Every game's onKey calls
    // this first and bails out if the player is typing into a form.
    function isTyping( e ) {
        var t = e.target;
        if ( ! t ) return false;
        var tag = t.tagName;
        return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || t.isContentEditable;
    }

    // ----------------------------------------------------------------
    // Pinball launcher — the OG Canvas2D pinball lives in desk-pinball.js
    // and depends on global Matter. Both are lazy-loaded the first time the
    // arcade's Pinball card is clicked (mirrors desk-drawer.js's marble
    // wiring), then booted standalone in Canvas2D mode. Subsequent clicks
    // are instant. If desk-drawer's marble already loaded them, TCPinball is
    // present and we boot immediately.
    // ----------------------------------------------------------------
    var pinballLoading = false;
    function launchPinball() {
        if ( window.TCPinball && window.TCPinball.boot ) {
            window.TCPinball.boot( null, { renderer: 'canvas' } );
            return;
        }
        if ( pinballLoading ) return;
        pinballLoading = true;
        var themeBase = ( window.tcVentures && window.tcVentures.themeUrl ) || '';
        var v = ( window.tcDeskGames && window.tcDeskGames.version ) || Date.now();
        loadScript( themeBase + '/assets/js/vendor/matter-0.20.0.min.js' ).then( function () {
            return loadScript( themeBase + '/assets/js/desk-pinball.js?ver=' + encodeURIComponent( v ) );
        } ).then( function () {
            pinballLoading = false;
            if ( window.TCPinball && window.TCPinball.boot ) {
                window.TCPinball.boot( null, { renderer: 'canvas' } );
            }
        } ).catch( function ( err ) {
            console.warn( 'Pinball failed to load — sorry.', err );
            pinballLoading = false;
        } );
    }

    function loadScript( src ) {
        return new Promise( function ( resolve, reject ) {
            var s = document.createElement( 'script' );
            s.src = src;
            s.async = true;
            s.onload = function () { resolve(); };
            s.onerror = function () { reject( new Error( 'Script failed: ' + src ) ); };
            document.head.appendChild( s );
        } );
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
        var fsBtn      = drawer.querySelector( '[data-games-fs]' );
        var quitBtn    = drawer.querySelector( '[data-games-quit]' );
        var tvEl       = drawer.querySelector( '[data-games-tv]' );

        var GAMES = {
            snake:     { title: 'Snake',     controls: '&larr;&uarr;&darr;&rarr; to slither',         start: startSnake     },
            pong:      { title: 'Pong',      controls: '&uarr;&darr; to move &mdash; first to 5 wins', start: startPong      },
            pacman:    { title: 'Pac-Man',   controls: '&larr;&uarr;&darr;&rarr; &mdash; eat the dots', start: startPacman    },
            asteroids: { title: 'Asteroids', controls: '&larr;&rarr; rotate &middot; &uarr; thrust &middot; space fire', start: startAsteroids },
            brickles:  { title: 'Brickles',  controls: '&larr;&rarr; paddle &mdash; clear the wall',   start: startBrickles  },
            solitaire: { title: 'Solitaire', controls: 'click to select &middot; click again to place', start: startSolitaire },
            // Pinball is the OG Canvas2D footer game, re-homed here. It's a
            // self-contained overlay with its own HUD + leaderboard, so it
            // doesn't use the start(canvas, hooks) contract — `external`
            // flags play() to launch it standalone. Listed here only so its
            // high-score chip paints alongside the others.
            pinball:   { title: 'Pinball',   external: true },
        };

        var currentKey  = null;
        var currentStop = null;

        // Name-entry elements live inside the gameover overlay
        var entryForm    = drawer.querySelector( '[data-games-entry]' );
        var entryInput   = drawer.querySelector( '[data-games-entry-input]' );
        var miniBoard    = drawer.querySelector( '[data-games-mini-board]' );

        function paintHighScores() {
            Object.keys( GAMES ).forEach( function ( k ) {
                var el = drawer.querySelector( '[data-games-high="' + k + '"]' );
                if ( ! el ) return;
                var row = topRow( k );
                el.textContent = row
                    ? ( 'high: ' + row.score + ' · ' + row.name )
                    : 'high: —';
            } );
        }

        // Friendly relative time — e.g. "5m ago", "3d ago", "2w ago".
        // Helps readers gauge whether a top score is fresh or stale.
        function timeAgo( ts ) {
            if ( ! ts ) return '';
            var seconds = Math.floor( Date.now() / 1000 - ts );
            if ( seconds < 60 )    return 'just now';
            if ( seconds < 3600 )  return Math.floor( seconds / 60 ) + 'm ago';
            if ( seconds < 86400 ) return Math.floor( seconds / 3600 ) + 'h ago';
            var days = Math.floor( seconds / 86400 );
            if ( days < 7 )  return days + 'd ago';
            if ( days < 30 ) return Math.floor( days / 7 ) + 'w ago';
            return Math.floor( days / 30 ) + 'mo ago';
        }

        function renderMiniBoard( game ) {
            var b = boards[ game ] || [];
            miniBoard.innerHTML = '';
            if ( ! b.length ) { miniBoard.hidden = true; return; }
            b.slice( 0, 5 ).forEach( function ( row, i ) {
                var li = doc.createElement( 'li' );
                var rank = doc.createElement( 'span' );
                rank.className = 'tc-desk__games-mini-rank';
                rank.textContent = ( i + 1 ) + '.';
                var name = doc.createElement( 'span' );
                name.className = 'tc-desk__games-mini-name';
                name.textContent = row.name;
                var when = doc.createElement( 'span' );
                when.className = 'tc-desk__games-mini-when';
                when.textContent = timeAgo( row.ts );
                var score = doc.createElement( 'span' );
                score.className = 'tc-desk__games-mini-score';
                score.textContent = row.score;
                li.appendChild( rank );
                li.appendChild( name );
                li.appendChild( when );
                li.appendChild( score );
                miniBoard.appendChild( li );
            } );
            miniBoard.hidden = false;
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
            stopBgLoop();
        }

        function play( key ) {
            var game = GAMES[ key ];
            if ( ! game ) return;
            // Pinball is a self-contained overlay game — it doesn't use the
            // shared-canvas contract. Launch it standalone (lazy-loading
            // Matter + desk-pinball.js) and leave the picker visible behind
            // it; exiting the overlay returns the player right here.
            if ( game.external ) { launchPinball(); return; }
            stopCurrent();
            currentKey = key;
            picker.hidden = true;
            playView.hidden = false;
            startBgLoop();
            titleEl.textContent = game.title;
            controlsEl.innerHTML = game.controls;
            scoreEl.textContent = '0';
            var top = topRow( key );
            highEl.textContent = top ? ( top.score + ' · ' + top.name ) : '—';
            gameoverEl.hidden = true;
            entryForm.hidden  = true;
            miniBoard.hidden  = true;
            // Each game writes its own pixel dimensions onto the canvas.
            currentStop = game.start( canvas, {
                onScore: function ( n ) { scoreEl.textContent = n; },
                onGameOver: function ( finalScore, msg ) {
                    handleGameOver( key, finalScore, msg );
                },
            } );
            // Focus the canvas so keyboard input lands here, not on a
            // background button.
            try { canvas.focus(); } catch ( e ) {}
        }

        function handleGameOver( key, finalScore, msg ) {
            gameoverMsg.innerHTML = ( msg || 'Game over' )
                + ' &mdash; ' + finalScore;
            // Re-check the live boards before deciding if the score
            // qualifies; another visitor might have just submitted a
            // higher one, but we can also offer entry on the cached
            // boards immediately while the refresh is in flight.
            var qualifies = finalScore > 0 && qualifiesForTop10( key, finalScore );
            if ( qualifies ) {
                entryForm.hidden = false;
                entryInput.value = '';
                miniBoard.hidden = true;
                // Auto-focus the name input so a keyboard player can
                // type immediately.
                setTimeout( function () { try { entryInput.focus(); } catch ( e ) {} }, 50 );
            } else {
                entryForm.hidden = true;
                renderMiniBoard( key );
            }
            gameoverEl.hidden = false;
        }

        // Submit the name + score; on success refresh the cache and
        // show the mini-board so the player sees where they landed.
        entryForm.addEventListener( 'submit', function ( e ) {
            e.preventDefault();
            if ( ! currentKey ) return;
            var name = ( entryInput.value || '' ).trim().slice( 0, 16 );
            var score = parseInt( scoreEl.textContent, 10 ) || 0;
            entryForm.hidden = true;
            postScore( currentKey, name, score ).then( function ( res ) {
                if ( res && res.success && res.scores ) {
                    boards[ currentKey ] = res.scores;
                    var t = topRow( currentKey );
                    highEl.textContent = t ? ( t.score + ' · ' + t.name ) : '—';
                }
                renderMiniBoard( currentKey );
            } );
        } );

        // Fullscreen toggle on the TV wrap. Browsers vary on prefix, so
        // feature-detect both directions.
        function isFullscreen() {
            return !! ( doc.fullscreenElement || doc.webkitFullscreenElement );
        }
        function enterFullscreen() {
            if ( tvEl.requestFullscreen ) tvEl.requestFullscreen();
            else if ( tvEl.webkitRequestFullscreen ) tvEl.webkitRequestFullscreen();
        }
        function exitFullscreen() {
            if ( doc.exitFullscreen ) doc.exitFullscreen();
            else if ( doc.webkitExitFullscreen ) doc.webkitExitFullscreen();
        }
        function syncFsLabel() {
            fsBtn.textContent = isFullscreen() ? 'Exit fullscreen' : 'Fullscreen';
        }
        if ( fsBtn ) {
            fsBtn.addEventListener( 'click', function () {
                if ( isFullscreen() ) exitFullscreen(); else enterFullscreen();
            } );
            doc.addEventListener( 'fullscreenchange',       syncFsLabel );
            doc.addEventListener( 'webkitfullscreenchange', syncFsLabel );
        }
        // "Close arcade" — exits fullscreen first (if needed) then
        // closes the whole drawer. One click out of an immersive game.
        if ( quitBtn ) {
            quitBtn.addEventListener( 'click', function () {
                if ( isFullscreen() ) exitFullscreen();
                if ( typeof drawer.__tcDeskClose === 'function' ) {
                    drawer.__tcDeskClose();
                }
            } );
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
                entryForm.hidden  = true;
                miniBoard.hidden  = true;
            } else {
                // On open, refresh from the server (cache miss = "—").
                fetchBoards().then( paintHighScores );
            }
        } );
        observer.observe( drawer, { attributes: true, attributeFilter: [ 'class' ] } );

        // Boards are fetched on drawer open (the MutationObserver above)
        // — the old eager fetch here hit the REST endpoint on every page
        // load sitewide for a drawer most visitors never open (review-2).
        // Cost: a "—" placeholder for the instant between a fast toad
        // click and the response.
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
            ctx.fillStyle = '#000';
            ctx.fillRect( 0, 0, canvas.width, canvas.height );
            // Subtle grid
            ctx.strokeStyle = 'rgba(43, 255, 136, 0.07)';
            ctx.lineWidth = 1;
            for ( var x = 0; x <= W; x++ ) {
                ctx.beginPath();
                ctx.moveTo( x * CELL, 0 );
                ctx.lineTo( x * CELL, canvas.height );
                ctx.stroke();
            }
            // Snake — head is brightest, body shifts hue across cyan
            // so the trail visibly grows. The newest segments glow more
            // than older ones (tail fades to deep teal).
            snake.forEach( function ( s, i ) {
                if ( i === 0 ) {
                    ctx.fillStyle = '#eaffec';
                } else {
                    // Interpolate from bright neon green (i=1) to teal (i=last)
                    var t = Math.min( 1, ( i - 1 ) / Math.max( 1, snake.length - 2 ) );
                    var r = Math.round( 43  + ( 18  - 43  ) * t );
                    var g = Math.round( 255 + ( 180 - 255 ) * t );
                    var b = Math.round( 136 + ( 160 - 136 ) * t );
                    ctx.fillStyle = 'rgb(' + r + ',' + g + ',' + b + ')';
                }
                ctx.fillRect( s.x * CELL + 1, s.y * CELL + 1, CELL - 2, CELL - 2 );
            } );
            // Food — bright red dot
            ctx.fillStyle = '#ff3a55';
            ctx.beginPath();
            ctx.arc( food.x * CELL + CELL / 2, food.y * CELL + CELL / 2, CELL / 2 - 2, 0, Math.PI * 2 );
            ctx.fill();
        }

        function onKey( e ) {
            if ( isTyping( e ) ) return;
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
        var ballTrail = [];
        var playerScore = 0, cpuScore = 0;
        var TARGET = 5;
        var keys = { up: false, down: false };
        var raf;
        var over = false;
        // CPU handicap — random tracking offset that re-rolls every
        // ~1s, plus only reacting when ball moves toward CPU. Without
        // this the CPU is unbeatable.
        var cpuOffset = 0;
        var cpuOffsetUntil = 0;

        function serve( towardPlayer ) {
            ballX = canvas.width / 2;
            ballY = canvas.height / 2;
            // Roughly 30% slower than before — was 4.5, now 3.2.
            var speed = 3.2;
            var angle = ( Math.random() - 0.5 ) * 0.6;
            ballVX = ( towardPlayer ? -1 : 1 ) * speed * Math.cos( angle );
            ballVY = speed * Math.sin( angle );
        }

        function loop() {
            if ( over ) return;
            // Player
            if ( keys.up   ) playerY -= 5;
            if ( keys.down ) playerY += 5;
            playerY = Math.max( 0, Math.min( canvas.height - PAD_H, playerY ) );

            // CPU — only reacts when ball is heading toward it, with a
            // random aiming offset that re-rolls periodically so the
            // CPU sometimes overshoots / undershoots. Result: beatable.
            var now = performance.now();
            if ( now > cpuOffsetUntil ) {
                cpuOffset      = ( Math.random() - 0.5 ) * 40;
                cpuOffsetUntil = now + 500 + Math.random() * 700;
            }
            if ( ballVX > 0 ) {
                var target = ballY + cpuOffset - PAD_H / 2;
                if ( cpuY < target ) cpuY = Math.min( cpuY + 2.6, target );
                else                 cpuY = Math.max( cpuY - 2.6, target );
            }
            cpuY = Math.max( 0, Math.min( canvas.height - PAD_H, cpuY ) );

            // Ball + trail
            ballTrail.push( { x: ballX, y: ballY } );
            if ( ballTrail.length > 6 ) ballTrail.shift();
            ballX += ballVX;
            ballY += ballVY;
            if ( ballY < 0 ) { ballY = 0; ballVY = -ballVY; }
            else if ( ballY > canvas.height ) { ballY = canvas.height; ballVY = -ballVY; }

            // Left paddle collision — gentle speed-up (1.03) so rallies
            // don't escalate to unhittable in a few volleys.
            if ( ballVX < 0 && ballX <= 20 + PAD_W && ballY >= playerY && ballY <= playerY + PAD_H ) {
                ballX = 20 + PAD_W;
                ballVX = -ballVX * 1.03;
                ballVY += ( ballY - ( playerY + PAD_H / 2 ) ) * 0.06;
                playSfx( AUDIO_URLS.pongHit, 0.35 );
            }
            // Right paddle collision
            if ( ballVX > 0 && ballX >= canvas.width - 20 - PAD_W && ballY >= cpuY && ballY <= cpuY + PAD_H ) {
                ballX = canvas.width - 20 - PAD_W;
                ballVX = -ballVX * 1.03;
                ballVY += ( ballY - ( cpuY + PAD_H / 2 ) ) * 0.06;
                playSfx( AUDIO_URLS.pongHit, 0.35 );
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
            ctx.fillStyle = '#000';
            ctx.fillRect( 0, 0, canvas.width, canvas.height );
            // Centerline — brighter so it reads against the CRT scanlines
            ctx.fillStyle = 'rgba(43, 255, 136, 0.45)';
            for ( var y = 8; y < canvas.height; y += 22 ) {
                ctx.fillRect( canvas.width / 2 - 1, y, 2, 12 );
            }
            // Scores
            ctx.fillStyle = '#b6ffd6';
            ctx.font = 'bold 40px ui-monospace, monospace';
            ctx.textAlign = 'center';
            ctx.fillText( playerScore, canvas.width / 2 - 60, 50 );
            ctx.fillText( cpuScore,    canvas.width / 2 + 60, 50 );
            // Paddles — bright neon
            ctx.fillStyle = '#2bff88';
            ctx.fillRect( 20, playerY, PAD_W, PAD_H );
            ctx.fillStyle = '#80f8ff';
            ctx.fillRect( canvas.width - 20 - PAD_W, cpuY, PAD_W, PAD_H );
            // Ball trail — older positions render dimmer
            for ( var ti = 0; ti < ballTrail.length; ti++ ) {
                var t = ballTrail[ ti ];
                var a = ( ti + 1 ) / ballTrail.length * 0.45;
                ctx.fillStyle = 'rgba(255, 255, 255, ' + a + ')';
                ctx.fillRect( t.x - 4, t.y - 4, 8, 8 );
            }
            // Ball — bright white
            ctx.fillStyle = '#ffffff';
            ctx.fillRect( ballX - 5, ballY - 5, 10, 10 );
        }

        function finish( won ) {
            over = true;
            cancelAnimationFrame( raf );
            hooks.onGameOver( playerScore, won ? 'You win!' : 'CPU wins' );
        }

        function onKey( e ) {
            if ( isTyping( e ) ) return;
            if ( e.key === 'ArrowUp'   || e.key === 'w' ) { keys.up = true;   e.preventDefault(); }
            if ( e.key === 'ArrowDown' || e.key === 's' ) { keys.down = true; e.preventDefault(); }
        }
        function onKeyUp( e ) {
            if ( isTyping( e ) ) return;
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
        // Maze grid: '#' wall, '.' dot, 'o' power pellet, ' ' empty.
        // The "ghost box" has openings top + bottom so ghosts actually
        // wander out — original sealed-box version trapped them.
        var MAZE = [
            '##############',
            '#o..........o#',
            '#.####.####.##',
            '#.#........#.#',
            '#.#.##..##.#.#',
            '#...#....#...#',
            '###.#....#.###',
            '#...#....#...#',
            '#.#.##..##.#.#',
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
        var grid;
        var dotsLeft;
        var pac;
        var ghosts;
        var score = 0;
        var powerLeft = 0;
        var alive = true;
        var level = 1;
        var tickMs = 180;
        var timer;

        function resetBoard() {
            grid = MAZE.map( function ( r ) { return r.split( '' ); } );
            dotsLeft = 0;
            grid.forEach( function ( r ) {
                r.forEach( function ( c ) { if ( c === '.' || c === 'o' ) dotsLeft++; } );
            } );
            pac = { col: 6, row: 9, dx: 0, dy: 0, nextDx: 0, nextDy: 0, mouth: 0 };
            // Ghosts start INSIDE the box but the openings let them out.
            // Adding one extra ghost per level (capped at 4) for difficulty.
            var ghostColors = [ '#ff5588', '#80f8ff', '#ffb04f', '#ff70ff' ];
            var ghostCount = Math.min( 4, 2 + Math.floor( ( level - 1 ) / 1 ) );
            ghosts = [];
            for ( var gi = 0; gi < ghostCount; gi++ ) {
                ghosts.push( {
                    col: 6 + ( gi % 2 ),
                    row: 5 + Math.floor( gi / 2 ) * 2,
                    dx: ( gi % 2 === 0 ) ? 0 : 0,
                    dy: ( gi % 2 === 0 ) ? -1 : 1,
                    color: ghostColors[ gi ],
                } );
            }
            powerLeft = 0;
        }
        resetBoard();

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

            if ( dotsLeft === 0 ) { nextLevel(); return; }

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
            hooks.onGameOver( score, 'Level ' + level + ' — caught!' );
        }
        // On maze clear, advance to next level: faster ghosts, refilled
        // board, +1 ghost. Player keeps their score across levels.
        function nextLevel() {
            level++;
            tickMs = Math.max( 100, 180 - ( level - 1 ) * 14 );
            clearInterval( timer );
            resetBoard();
            timer = setInterval( tick, tickMs );
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
                        ctx.fillStyle = '#2050ff';
                        ctx.fillRect( x + 2, y + 2, CELL - 4, CELL - 4 );
                        ctx.strokeStyle = '#a0c0ff';
                        ctx.lineWidth = 1.5;
                        ctx.strokeRect( x + 2.5, y + 2.5, CELL - 5, CELL - 5 );
                    } else if ( ch === '.' ) {
                        ctx.fillStyle = '#fff5d0';
                        ctx.beginPath();
                        ctx.arc( x + CELL / 2, y + CELL / 2, 3, 0, Math.PI * 2 );
                        ctx.fill();
                    } else if ( ch === 'o' ) {
                        ctx.fillStyle = '#ffffff';
                        ctx.beginPath();
                        ctx.arc( x + CELL / 2, y + CELL / 2, 7, 0, Math.PI * 2 );
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
            // Level indicator — top-left corner of the maze
            ctx.fillStyle = '#ffe200';
            ctx.font = 'bold 11px ui-monospace, monospace';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            ctx.fillText( 'LV ' + level, 6, 4 );
        }

        function onKey( e ) {
            if ( isTyping( e ) ) return;
            var k = e.key;
            if      ( k === 'ArrowUp'    || k === 'w' ) { pac.nextDx = 0;  pac.nextDy = -1; e.preventDefault(); }
            else if ( k === 'ArrowDown'  || k === 's' ) { pac.nextDx = 0;  pac.nextDy =  1; e.preventDefault(); }
            else if ( k === 'ArrowLeft'  || k === 'a' ) { pac.nextDx = -1; pac.nextDy =  0; e.preventDefault(); }
            else if ( k === 'ArrowRight' || k === 'd' ) { pac.nextDx =  1; pac.nextDy =  0; e.preventDefault(); }
        }

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
        var particles = [];
        var score = 0;
        var level = 1;
        var alive = true;
        var raf;
        var keys = { left: false, right: false, up: false };
        var fireCooldown = 0;

        function explode( x, y, size ) {
            var n = size * 6 + 4;
            for ( var i = 0; i < n; i++ ) {
                var a = Math.random() * Math.PI * 2;
                var s = 0.5 + Math.random() * 3;
                particles.push( {
                    x: x, y: y,
                    vx: Math.cos( a ) * s,
                    vy: Math.sin( a ) * s,
                    life: 25 + Math.random() * 20,
                    maxLife: 40,
                    color: Math.random() > 0.4 ? '#ffd970' : '#ff8830',
                } );
            }
        }

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
                        explode( a.x, a.y, a.size );
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

            // Particles
            particles.forEach( function ( p ) {
                p.x += p.vx; p.y += p.vy;
                p.vx *= 0.96; p.vy *= 0.96;
                p.life--;
                wrap( p );
            } );
            particles = particles.filter( function ( p ) { return p.life > 0; } );

            // Ship-asteroid collision
            for ( var k = 0; k < asteroids.length; k++ ) {
                var ax = asteroids[ k ];
                if ( Math.hypot( ax.x - ship.x, ax.y - ship.y ) < ax.radius + ship.radius - 2 ) {
                    return die();
                }
            }

            // Refill on clear — each wave bumps the level, spawns one
            // extra asteroid, and a small score bonus rewards survival.
            if ( asteroids.length === 0 ) {
                level++;
                score += 200;
                hooks.onScore( score );
                var newCount = Math.min( 9, 4 + level );
                for ( var n = 0; n < newCount; n++ ) {
                    var rx, ry, tries = 0;
                    do {
                        rx = Math.random() * W;
                        ry = Math.random() * H;
                        tries++;
                    } while ( Math.hypot( rx - ship.x, ry - ship.y ) < 120 && tries < 20 );
                    spawnAsteroid( 3, rx, ry );
                }
            }

            draw();
            raf = requestAnimationFrame( tick );
        }

        function draw() {
            ctx.fillStyle = '#000';
            ctx.fillRect( 0, 0, W, H );
            // Stars
            ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
            for ( var s = 0; s < 40; s++ ) {
                var sx = ( s * 137 ) % W;
                var sy = ( s * 89 ) % H;
                ctx.fillRect( sx, sy, 1, 1 );
            }
            // Asteroids — bright neon outline
            ctx.strokeStyle = '#80f8ff';
            ctx.lineWidth = 2;
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
            // Explosion particles — fade out as life drops
            particles.forEach( function ( p ) {
                var alpha = Math.max( 0, p.life / p.maxLife );
                ctx.globalAlpha = alpha;
                ctx.fillStyle = p.color;
                ctx.fillRect( p.x - 1.5, p.y - 1.5, 3, 3 );
            } );
            ctx.globalAlpha = 1;
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
            // Level indicator — top-left
            ctx.fillStyle = '#80f8ff';
            ctx.font = 'bold 12px ui-monospace, monospace';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            ctx.fillText( 'WAVE ' + level, 8, 8 );
        }

        function die() {
            alive = false;
            cancelAnimationFrame( raf );
            // Big death explosion at the ship's position
            explode( ship.x, ship.y, 4 );
            draw();
            hooks.onGameOver( score, 'Wave ' + level + ' — destroyed' );
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
            playSfx( AUDIO_URLS.asteroidsShoot, 0.4 );
        }

        function onKey( e ) {
            if ( isTyping( e ) ) return;
            if ( e.key === 'ArrowLeft'  || e.key === 'a' ) { keys.left  = true; e.preventDefault(); }
            if ( e.key === 'ArrowRight' || e.key === 'd' ) { keys.right = true; e.preventDefault(); }
            if ( e.key === 'ArrowUp'    || e.key === 'w' ) { keys.up    = true; e.preventDefault(); }
            if ( e.key === ' ' )                            { fire();           e.preventDefault(); }
        }
        function onKeyUp( e ) {
            if ( isTyping( e ) ) return;
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

    // ================================================================
    // BRICKLES (Breakout-style brick breaker)
    // ================================================================
    function startBrickles( canvas, hooks ) {
        canvas.width = 600;
        canvas.height = 420;
        var ctx = canvas.getContext( '2d' );
        var W = canvas.width, H = canvas.height;

        var paddle = { x: W / 2 - 55, y: H - 28, w: 110, h: 12 };
        var ball   = { x: W / 2, y: H - 70, vx: 3, vy: -3, r: 6 };
        var score  = 0;
        var lives  = 3;
        var level  = 1;
        var alive  = true;
        var raf;
        var keys   = { left: false, right: false };
        var particles = [];

        var COLS = 12, ROWS = 5;
        var BW = ( W - 40 ) / COLS;
        var BH = 22;
        var ROW_COLORS = [ '#ff3a55', '#ff8830', '#ffe200', '#2bff88', '#80f8ff' ];
        var bricks;

        function brickBoom( b ) {
            for ( var i = 0; i < 10; i++ ) {
                particles.push( {
                    x: b.x + b.w / 2,
                    y: b.y + b.h / 2,
                    vx: ( Math.random() - 0.5 ) * 6,
                    vy: ( Math.random() - 0.5 ) * 6 - 1,
                    color: b.color,
                    life: 22,
                    maxLife: 22,
                } );
            }
        }

        function reset() {
            bricks = [];
            for ( var r = 0; r < ROWS; r++ ) {
                for ( var c = 0; c < COLS; c++ ) {
                    bricks.push( {
                        x: 20 + c * BW,
                        y: 60 + r * ( BH + 6 ),
                        w: BW - 4,
                        h: BH,
                        color: ROW_COLORS[ r ],
                        points: ( ROWS - r ) * 10,
                    } );
                }
            }
            paddle.x = W / 2 - paddle.w / 2;
            ball.x = W / 2;
            ball.y = H - 70;
            ball.vx = 3.2 * ( Math.random() > 0.5 ? 1 : -1 );
            ball.vy = -3.2;
        }

        function loop() {
            if ( ! alive ) return;
            // Paddle input
            if ( keys.left  ) paddle.x -= 6.5;
            if ( keys.right ) paddle.x += 6.5;
            paddle.x = Math.max( 0, Math.min( W - paddle.w, paddle.x ) );

            // Ball
            ball.x += ball.vx;
            ball.y += ball.vy;
            if ( ball.x < ball.r )       { ball.x = ball.r;       ball.vx = -ball.vx; }
            if ( ball.x > W - ball.r )   { ball.x = W - ball.r;   ball.vx = -ball.vx; }
            if ( ball.y < ball.r )       { ball.y = ball.r;       ball.vy = -ball.vy; }

            // Paddle collision — bounce angle depends on hit position
            if ( ball.vy > 0
                 && ball.y + ball.r >= paddle.y
                 && ball.y - ball.r <= paddle.y + paddle.h
                 && ball.x >= paddle.x
                 && ball.x <= paddle.x + paddle.w ) {
                ball.y = paddle.y - ball.r;
                ball.vy = -Math.abs( ball.vy );
                var offset = ( ball.x - ( paddle.x + paddle.w / 2 ) ) / ( paddle.w / 2 );
                ball.vx = offset * 4.2;
                // Gentle speed-up to keep games moving
                var speed = Math.hypot( ball.vx, ball.vy );
                if ( speed < 6 ) { ball.vx *= 1.02; ball.vy *= 1.02; }
            }

            // Brick collisions
            for ( var i = bricks.length - 1; i >= 0; i-- ) {
                var b = bricks[ i ];
                if ( ball.x + ball.r > b.x
                     && ball.x - ball.r < b.x + b.w
                     && ball.y + ball.r > b.y
                     && ball.y - ball.r < b.y + b.h ) {
                    // Decide which side was hit
                    var dx = ball.x - ( b.x + b.w / 2 );
                    var dy = ball.y - ( b.y + b.h / 2 );
                    if ( Math.abs( dx ) * b.h > Math.abs( dy ) * b.w ) ball.vx = -ball.vx;
                    else                                              ball.vy = -ball.vy;
                    score += b.points;
                    hooks.onScore( score );
                    brickBoom( b );
                    bricks.splice( i, 1 );
                    break;
                }
            }

            // Cleared the wall — advance level instead of ending. Each
            // level bumps ball speed by 15% and refills the wall.
            if ( bricks.length === 0 ) {
                level++;
                score += 100;
                hooks.onScore( score );
                reset();
                ball.vx *= 1 + level * 0.12;
                ball.vy *= 1 + level * 0.12;
                return;
            }

            // Particles
            particles.forEach( function ( p ) {
                p.x += p.vx; p.y += p.vy;
                p.vy += 0.2; // gravity
                p.life--;
            } );
            particles = particles.filter( function ( p ) { return p.life > 0; } );

            // Lost ball
            if ( ball.y > H + 30 ) {
                lives--;
                if ( lives <= 0 ) return finish( false );
                ball.x = W / 2; ball.y = H - 70;
                ball.vx = 3.2 * ( Math.random() > 0.5 ? 1 : -1 );
                ball.vy = -3.2;
            }

            draw();
            raf = requestAnimationFrame( loop );
        }

        function draw() {
            ctx.fillStyle = '#000';
            ctx.fillRect( 0, 0, W, H );
            // Bricks
            bricks.forEach( function ( b ) {
                ctx.fillStyle = b.color;
                ctx.fillRect( b.x, b.y, b.w, b.h );
                // 1px highlight along the top edge — adds dimension
                ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
                ctx.fillRect( b.x, b.y, b.w, 2 );
            } );
            // Particles — fade with life
            particles.forEach( function ( p ) {
                ctx.globalAlpha = Math.max( 0, p.life / p.maxLife );
                ctx.fillStyle = p.color;
                ctx.fillRect( p.x - 2, p.y - 2, 4, 4 );
            } );
            ctx.globalAlpha = 1;
            // Paddle
            ctx.fillStyle = '#b6ffd6';
            ctx.fillRect( paddle.x, paddle.y, paddle.w, paddle.h );
            // Ball
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc( ball.x, ball.y, ball.r, 0, Math.PI * 2 );
            ctx.fill();
            // Lives + level
            ctx.fillStyle = '#2bff88';
            ctx.font = '14px ui-monospace, monospace';
            ctx.textAlign = 'right';
            ctx.fillText( 'lives: ' + lives, W - 14, 22 );
            ctx.fillStyle = '#80f8ff';
            ctx.textAlign = 'left';
            ctx.fillText( 'LV ' + level, 14, 22 );
        }

        function finish( won ) {
            alive = false;
            cancelAnimationFrame( raf );
            hooks.onGameOver( score, won ? 'Wall cleared!' : 'Out of lives' );
        }

        function onKey( e ) {
            if ( isTyping( e ) ) return;
            if ( e.key === 'ArrowLeft'  || e.key === 'a' ) { keys.left  = true; e.preventDefault(); }
            if ( e.key === 'ArrowRight' || e.key === 'd' ) { keys.right = true; e.preventDefault(); }
        }
        function onKeyUp( e ) {
            if ( isTyping( e ) ) return;
            if ( e.key === 'ArrowLeft'  || e.key === 'a' ) keys.left  = false;
            if ( e.key === 'ArrowRight' || e.key === 'd' ) keys.right = false;
        }

        reset();
        draw();
        raf = requestAnimationFrame( loop );
        doc.addEventListener( 'keydown', onKey );
        doc.addEventListener( 'keyup',   onKeyUp );

        return function stop() {
            alive = false;
            cancelAnimationFrame( raf );
            doc.removeEventListener( 'keydown', onKey );
            doc.removeEventListener( 'keyup',   onKeyUp );
        };
    }

    // ================================================================
    // SOLITAIRE (Klondike, draw-one)
    //
    // Click-to-select / click-to-place interaction (no drag-drop — much
    // simpler hit testing and avoids touch ambiguity if someone tries
    // it on a tablet despite the desktop-only sign).
    //
    // Layout: top row = stock, waste, 4 foundations (left → right).
    // Bottom = 7 tableau columns.
    //
    // Score: classic Klondike point values
    //   - Waste → tableau:    +5
    //   - Waste → foundation: +10
    //   - Tableau → foundation: +10
    //   - Foundation → tableau: -15
    //   - Flipping a face-down tableau card: +5
    // (Capped at 0 minimum.)
    // ================================================================
    function startSolitaire( canvas, hooks ) {
        var CARD_W = 64, CARD_H = 90;
        var COL_GAP = 12, ROW_GAP = 14, STAGGER = 24;
        var PAD_X = 14, PAD_Y = 14;
        var TOP_Y = PAD_Y;
        var TABLEAU_Y = TOP_Y + CARD_H + ROW_GAP * 2;
        var W = PAD_X * 2 + CARD_W * 7 + COL_GAP * 6;
        canvas.width  = W;
        canvas.height = TABLEAU_Y + STAGGER * 18 + CARD_H + PAD_Y;
        var ctx = canvas.getContext( '2d' );

        var SUITS = [ 'S', 'H', 'D', 'C' ];
        var SUIT_GLYPH = { S: '♠', H: '♥', D: '♦', C: '♣' };
        var RED = { H: true, D: true, S: false, C: false };
        var RANK_LABEL = [ '', 'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K' ];

        var stock, waste, foundations, tableau, selected, score, alive;

        function shuffle( arr ) {
            for ( var i = arr.length - 1; i > 0; i-- ) {
                var j = Math.floor( Math.random() * ( i + 1 ) );
                var t = arr[ i ]; arr[ i ] = arr[ j ]; arr[ j ] = t;
            }
        }

        function deal() {
            var deck = [];
            SUITS.forEach( function ( s ) {
                for ( var r = 1; r <= 13; r++ ) deck.push( { suit: s, rank: r, faceUp: false } );
            } );
            shuffle( deck );
            tableau = [ [], [], [], [], [], [], [] ];
            for ( var col = 0; col < 7; col++ ) {
                for ( var row = 0; row <= col; row++ ) {
                    var card = deck.pop();
                    card.faceUp = ( row === col );
                    tableau[ col ].push( card );
                }
            }
            stock = deck; // remaining
            waste = [];
            foundations = [ [], [], [], [] ];
            selected = null;
            score = 0;
            alive = true;
            hooks.onScore( 0 );
        }

        function bumpScore( delta ) {
            score = Math.max( 0, score + delta );
            hooks.onScore( score );
        }

        // ---- Positions ----
        function stockPos()      { return { x: PAD_X,                                            y: TOP_Y }; }
        function wastePos()      { return { x: PAD_X + CARD_W + COL_GAP,                         y: TOP_Y }; }
        function foundationPos( i ) {
            return { x: PAD_X + ( 3 + i ) * ( CARD_W + COL_GAP ), y: TOP_Y };
        }
        function tableauPos( col, row ) {
            return { x: PAD_X + col * ( CARD_W + COL_GAP ), y: TABLEAU_Y + row * STAGGER };
        }

        // ---- Drawing ----
        function drawCardBack( x, y ) {
            ctx.fillStyle = '#1a3060';
            roundRect( x, y, CARD_W, CARD_H, 6, true, false );
            ctx.fillStyle = '#4a78c8';
            for ( var dy = 6; dy < CARD_H - 6; dy += 8 ) {
                for ( var dx = 6; dx < CARD_W - 6; dx += 8 ) {
                    ctx.fillRect( x + dx, y + dy, 4, 4 );
                }
            }
            ctx.strokeStyle = '#0a1830';
            ctx.lineWidth = 1.5;
            roundRect( x + 0.5, y + 0.5, CARD_W - 1, CARD_H - 1, 6, false, true );
        }

        function drawCardFace( x, y, card, highlight ) {
            ctx.fillStyle = highlight ? '#fff5d0' : '#fafafa';
            roundRect( x, y, CARD_W, CARD_H, 6, true, false );
            ctx.strokeStyle = highlight ? '#ffaa00' : '#888';
            ctx.lineWidth = highlight ? 2.5 : 1;
            roundRect( x + 0.5, y + 0.5, CARD_W - 1, CARD_H - 1, 6, false, true );
            ctx.fillStyle = RED[ card.suit ] ? '#d83040' : '#101010';
            ctx.font = 'bold 14px ui-monospace, monospace';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            ctx.fillText( RANK_LABEL[ card.rank ], x + 5, y + 4 );
            ctx.font = '14px ui-monospace, monospace';
            ctx.fillText( SUIT_GLYPH[ card.suit ], x + 5, y + 20 );
            // Center glyph
            ctx.font = '28px ui-monospace, monospace';
            ctx.textAlign = 'center';
            ctx.fillText( SUIT_GLYPH[ card.suit ], x + CARD_W / 2, y + CARD_H / 2 - 14 );
            // Mirrored corner
            ctx.font = 'bold 14px ui-monospace, monospace';
            ctx.textAlign = 'right';
            ctx.textBaseline = 'bottom';
            ctx.fillText( RANK_LABEL[ card.rank ], x + CARD_W - 5, y + CARD_H - 20 );
            ctx.font = '14px ui-monospace, monospace';
            ctx.fillText( SUIT_GLYPH[ card.suit ], x + CARD_W - 5, y + CARD_H - 4 );
        }

        function drawEmptySlot( x, y, label ) {
            ctx.strokeStyle = '#0fff8a55';
            ctx.lineWidth = 1.5;
            ctx.setLineDash( [ 4, 4 ] );
            roundRect( x + 0.5, y + 0.5, CARD_W - 1, CARD_H - 1, 6, false, true );
            ctx.setLineDash( [] );
            if ( label ) {
                ctx.fillStyle = '#0fff8a55';
                ctx.font = '32px ui-monospace, monospace';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText( label, x + CARD_W / 2, y + CARD_H / 2 );
            }
        }

        function roundRect( x, y, w, h, r, fill, stroke ) {
            ctx.beginPath();
            ctx.moveTo( x + r, y );
            ctx.lineTo( x + w - r, y );
            ctx.quadraticCurveTo( x + w, y, x + w, y + r );
            ctx.lineTo( x + w, y + h - r );
            ctx.quadraticCurveTo( x + w, y + h, x + w - r, y + h );
            ctx.lineTo( x + r, y + h );
            ctx.quadraticCurveTo( x, y + h, x, y + h - r );
            ctx.lineTo( x, y + r );
            ctx.quadraticCurveTo( x, y, x + r, y );
            ctx.closePath();
            if ( fill )   ctx.fill();
            if ( stroke ) ctx.stroke();
        }

        function draw() {
            ctx.fillStyle = '#054428';
            ctx.fillRect( 0, 0, canvas.width, canvas.height );
            // Felt texture — faint diagonal lines
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
            ctx.lineWidth = 1;
            for ( var i = -canvas.height; i < canvas.width; i += 8 ) {
                ctx.beginPath();
                ctx.moveTo( i, 0 );
                ctx.lineTo( i + canvas.height, canvas.height );
                ctx.stroke();
            }
            // Stock
            var sp = stockPos();
            if ( stock.length ) drawCardBack( sp.x, sp.y );
            else                drawEmptySlot( sp.x, sp.y, '↻' );
            // Waste
            var wp = wastePos();
            if ( waste.length ) {
                var w = waste[ waste.length - 1 ];
                drawCardFace( wp.x, wp.y, w, isSelected( { source: 'waste', idx: waste.length - 1 } ) );
            } else {
                drawEmptySlot( wp.x, wp.y );
            }
            // Foundations
            for ( var f = 0; f < 4; f++ ) {
                var fp = foundationPos( f );
                if ( foundations[ f ].length ) {
                    drawCardFace( fp.x, fp.y, foundations[ f ][ foundations[ f ].length - 1 ], false );
                } else {
                    drawEmptySlot( fp.x, fp.y, SUIT_GLYPH[ SUITS[ f ] ] );
                }
            }
            // Tableau
            for ( var col = 0; col < 7; col++ ) {
                var column = tableau[ col ];
                if ( ! column.length ) {
                    var ep = tableauPos( col, 0 );
                    drawEmptySlot( ep.x, ep.y );
                    continue;
                }
                for ( var row = 0; row < column.length; row++ ) {
                    var card = column[ row ];
                    var pos = tableauPos( col, row );
                    if ( ! card.faceUp ) {
                        drawCardBack( pos.x, pos.y );
                    } else {
                        drawCardFace( pos.x, pos.y, card, isSelected( { source: 'tableau', col: col, idx: row } ) );
                    }
                }
            }
        }

        function isSelected( s ) {
            if ( ! selected ) return false;
            if ( selected.source !== s.source ) return false;
            if ( selected.source === 'tableau' )
                return selected.col === s.col && s.idx >= selected.idx;
            return true;
        }

        // ---- Hit testing ----
        function hitTest( x, y ) {
            // Stock
            var sp = stockPos();
            if ( inBox( x, y, sp.x, sp.y, CARD_W, CARD_H ) ) return { source: 'stock' };
            // Waste
            var wp = wastePos();
            if ( inBox( x, y, wp.x, wp.y, CARD_W, CARD_H ) ) {
                if ( waste.length ) return { source: 'waste', idx: waste.length - 1 };
                return null;
            }
            // Foundations
            for ( var f = 0; f < 4; f++ ) {
                var fp = foundationPos( f );
                if ( inBox( x, y, fp.x, fp.y, CARD_W, CARD_H ) ) return { source: 'foundation', idx: f };
            }
            // Tableau — check each column from bottom card up (last drawn = topmost)
            for ( var col = 0; col < 7; col++ ) {
                var column = tableau[ col ];
                if ( ! column.length ) {
                    var ep = tableauPos( col, 0 );
                    if ( inBox( x, y, ep.x, ep.y, CARD_W, CARD_H ) ) return { source: 'tableau', col: col, idx: 0, empty: true };
                    continue;
                }
                for ( var row = column.length - 1; row >= 0; row-- ) {
                    var pos = tableauPos( col, row );
                    var hitH = ( row === column.length - 1 ) ? CARD_H : STAGGER;
                    if ( inBox( x, y, pos.x, pos.y, CARD_W, hitH ) ) {
                        return { source: 'tableau', col: col, idx: row };
                    }
                }
            }
            return null;
        }

        function inBox( px, py, x, y, w, h ) {
            return px >= x && px < x + w && py >= y && py < y + h;
        }

        // ---- Move rules ----
        function canStackOnTableau( movingTopCard, targetCol ) {
            var col = tableau[ targetCol ];
            if ( ! col.length ) return movingTopCard.rank === 13;
            var t = col[ col.length - 1 ];
            if ( ! t.faceUp ) return false;
            return RED[ movingTopCard.suit ] !== RED[ t.suit ]
                && movingTopCard.rank === t.rank - 1;
        }
        function canStackOnFoundation( card, idx ) {
            // foundation index → suit
            var f = foundations[ idx ];
            if ( ! f.length ) return card.rank === 1 && card.suit === SUITS[ idx ];
            var t = f[ f.length - 1 ];
            return card.suit === t.suit && card.rank === t.rank + 1;
        }

        // ---- Move actions ----
        function tryFlipTopOfColumn( col ) {
            var c = tableau[ col ];
            if ( c.length && ! c[ c.length - 1 ].faceUp ) {
                c[ c.length - 1 ].faceUp = true;
                bumpScore( 5 );
                return true;
            }
            return false;
        }

        function attemptMove( dest ) {
            if ( ! selected || ! dest ) return false;
            // Foundation target — only single card
            if ( dest.source === 'foundation' ) {
                var card = getSelectedTopCard();
                if ( selected.source === 'tableau' ) {
                    var srcCol = tableau[ selected.col ];
                    if ( srcCol.length - selected.idx !== 1 ) return false; // multi-card to foundation not allowed
                    if ( ! canStackOnFoundation( card, dest.idx ) ) return false;
                    foundations[ dest.idx ].push( srcCol.pop() );
                    tryFlipTopOfColumn( selected.col );
                    bumpScore( 10 );
                    return true;
                }
                if ( selected.source === 'waste' ) {
                    if ( ! canStackOnFoundation( card, dest.idx ) ) return false;
                    foundations[ dest.idx ].push( waste.pop() );
                    bumpScore( 10 );
                    return true;
                }
                if ( selected.source === 'foundation' ) {
                    // Foundation → foundation is meaningless
                    return false;
                }
            }
            // Tableau target
            if ( dest.source === 'tableau' ) {
                var top = getSelectedTopCard();
                if ( ! canStackOnTableau( top, dest.col ) ) return false;
                if ( selected.source === 'tableau' ) {
                    var srcArr = tableau[ selected.col ];
                    var moving = srcArr.splice( selected.idx );
                    tableau[ dest.col ] = tableau[ dest.col ].concat( moving );
                    tryFlipTopOfColumn( selected.col );
                    return true;
                }
                if ( selected.source === 'waste' ) {
                    tableau[ dest.col ].push( waste.pop() );
                    bumpScore( 5 );
                    return true;
                }
                if ( selected.source === 'foundation' ) {
                    tableau[ dest.col ].push( foundations[ selected.idx ].pop() );
                    bumpScore( -15 );
                    return true;
                }
            }
            return false;
        }

        function getSelectedTopCard() {
            if ( ! selected ) return null;
            if ( selected.source === 'tableau' ) {
                var col = tableau[ selected.col ];
                return col[ selected.idx ];
            }
            if ( selected.source === 'waste' ) return waste[ waste.length - 1 ];
            if ( selected.source === 'foundation' ) {
                var f = foundations[ selected.idx ];
                return f[ f.length - 1 ];
            }
            return null;
        }

        function canSelect( hit ) {
            if ( hit.source === 'waste' ) return waste.length > 0;
            if ( hit.source === 'foundation' ) return foundations[ hit.idx ].length > 0;
            if ( hit.source === 'tableau' ) {
                if ( hit.empty ) return false;
                var card = tableau[ hit.col ][ hit.idx ];
                return !! card.faceUp;
            }
            return false;
        }

        function sameSelection( a, b ) {
            if ( a.source !== b.source ) return false;
            if ( a.source === 'tableau' ) return a.col === b.col && a.idx === b.idx;
            if ( a.source === 'foundation' ) return a.idx === b.idx;
            return true; // waste
        }

        function onCanvasClick( e ) {
            if ( ! alive ) return;
            var rect = canvas.getBoundingClientRect();
            var scaleX = canvas.width  / rect.width;
            var scaleY = canvas.height / rect.height;
            var x = ( e.clientX - rect.left ) * scaleX;
            var y = ( e.clientY - rect.top  ) * scaleY;
            var hit = hitTest( x, y );

            // Click stock — flip one to waste, or recycle if empty
            if ( hit && hit.source === 'stock' ) {
                if ( stock.length ) {
                    var c = stock.pop();
                    c.faceUp = true;
                    waste.push( c );
                } else {
                    // Recycle the waste back to stock (face down, original order reversed)
                    while ( waste.length ) {
                        var w = waste.pop();
                        w.faceUp = false;
                        stock.push( w );
                    }
                }
                selected = null;
                draw();
                return;
            }

            // No current selection — try to start one
            if ( ! selected ) {
                if ( hit && canSelect( hit ) ) {
                    // Auto-flip a face-down tableau card if you click it
                    if ( hit.source === 'tableau' && ! tableau[ hit.col ][ hit.idx ].faceUp
                         && hit.idx === tableau[ hit.col ].length - 1 ) {
                        tryFlipTopOfColumn( hit.col );
                        draw();
                        return;
                    }
                    selected = hit;
                    draw();
                }
                return;
            }

            // Click on same selection → deselect
            if ( hit && sameSelection( selected, hit ) ) {
                selected = null;
                draw();
                return;
            }

            // Otherwise attempt the move
            if ( hit ) {
                var moved = attemptMove( hit );
                selected = null;
                draw();
                if ( moved ) {
                    if ( checkWin() ) {
                        alive = false;
                        // Win bonus — every face-up card on the board got
                        // there with score; just stop the timer and bow out.
                        hooks.onGameOver( score, 'You won!' );
                    }
                }
                return;
            }

            // Click outside anything — deselect
            selected = null;
            draw();
        }

        function checkWin() {
            return foundations.every( function ( f ) { return f.length === 13; } );
        }

        canvas.addEventListener( 'click', onCanvasClick );

        deal();
        draw();

        return function stop() {
            alive = false;
            canvas.removeEventListener( 'click', onCanvasClick );
        };
    }

    // Expose individual game starters so other UIs (e.g. the secret-
    // drawer arcade interaction) can mount them onto their own canvas
    // without having to copy the desk-menu drawer markup. Each takes
    // (canvas, hooks) and returns a stop function — same contract the
    // desk drawer already uses internally.
    window.TCDeskGames = window.TCDeskGames || {};
    window.TCDeskGames.pacman    = startPacman;
    window.TCDeskGames.snake     = startSnake;
    window.TCDeskGames.pong      = startPong;
    window.TCDeskGames.asteroids = startAsteroids;
    window.TCDeskGames.brickles  = startBrickles;
    window.TCDeskGames.solitaire = startSolitaire;
    // G7: the games drawer markup doesn't exist at DOMContentLoaded
    // time anymore (it's part of the deferred desk-menu fetch), so
    // this file's own init() below bails on first run. desk-menu.js's
    // wireMenuTriggerLoader() calls this to re-run init() right after
    // injecting the markup, the same way it re-runs its own init().
    window.TCDeskGames.init = init;

    if ( doc.readyState === 'loading' ) {
        doc.addEventListener( 'DOMContentLoaded', init );
    } else {
        init();
    }
} )();
