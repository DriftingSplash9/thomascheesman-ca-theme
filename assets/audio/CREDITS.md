# Audio credits

Theme-bundled audio in this directory. License terms below; every
file is free for use with attribution. Attribution markup that
must accompany each file is reproduced verbatim where each clip
is played in the running site.

---

## pacman-startup.mp3 — Pac-Man modal startup ding

- Source file: `lucadialessandro-arcade-fx-288597.mp3`
- Author: Luca Di Alessandro
- Provider: Pixabay — https://pixabay.com/sound-effects/arcade-fx-288597/
- Plays once when the Pac-Man modal opens
- Attribution markup:

```
Sound Effect by <a href="https://pixabay.com/users/lucadialessandro-25927643/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=288597">Luca Di Alessandro</a> from <a href="https://pixabay.com//?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=288597">Pixabay</a>
```

## pacman-loop.mp3 — Pac-Man gameplay background loop

- Source file: `freesound_community-playing-pac-man-6783.mp3`
- Author: freesound.org community contributor (Pixabay item 6783)
- Provider: Pixabay — https://pixabay.com/sound-effects/playing-pac-man-6783/
- Plays on `loop: true` for the duration of the Pac-Man modal
- Attribution markup:

```
Sound Effect from <a href="https://pixabay.com/sound-effects/playing-pac-man-6783/">freesound community on Pixabay</a>
```

---

## asteroids-shoot.mp3 — Asteroids weapon fire

- Source file: `lucadialessandro-arcade-fx-288597 (1).mp3`
  (same author as the Pac-Man ding; a different upload)
- Author: Luca Di Alessandro
- Provider: Pixabay
- Plays each time the Asteroids ship fires a bullet
- Attribution markup:

```
Sound Effect by <a href="https://pixabay.com/users/lucadialessandro-25927643/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=288597">Luca Di Alessandro</a> from <a href="https://pixabay.com/sound-effects//?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=288597">Pixabay</a>
```

## pong-hit.mp3 — Pong paddle hit

- Source file: `freesound_community-071658_pongwav-93028.mp3`
- Author: freesound.org community contributor (Pixabay item 93028)
- Provider: Pixabay
- Plays each time the ball hits a paddle
- Attribution markup:

```
Sound Effect by <a href="https://pixabay.com/users/freesound_community-46691455/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=93028">freesound_community</a> from <a href="https://pixabay.com/sound-effects//?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=93028">Pixabay</a>
```

---

## arcade-bg.mp3 — desk arcade background loop

- Source file: `freesound_community-retro-wave-style-track-59892.mp3`
- Author: freesound.org community contributor (Pixabay item 59892)
- Provider: Pixabay
- Plays on `loop: true` at low volume (~18%) while ANY game is
  active in the desk arcade (Snake, Pong, Pac-Man, Asteroids,
  Brickles, Solitaire). Owned by play() / stopCurrent() in
  desk-games.js. The secret-drawer's separate Pac-Man modal
  keeps its own dedicated loop (pacman-loop.mp3); they don't
  overlap because the two contexts are mutually exclusive.
- Attribution markup:

```
Sound Effect from <a href="https://pixabay.com/sound-effects/retro-wave-style-track-59892/">Pixabay</a>
```

---

## combine-whoosh.mp3 — drawer combine SFX

- Source file: `dragon-studio-whoosh-cinematic-376875.mp3`
- Author: DRAGON-STUDIO
- Provider: Pixabay — https://pixabay.com/sound-effects/whoosh-cinematic-376875/
- Plays each time a `combine` interaction fires in the secret
  drawer (screwdriver+screw, banana+tape, etc.). Interactions can
  opt out by setting `silent: true` on the interaction definition
  — e.g. for moments that ship their own audio (the Faberge reveal
  is a `video:` action and never hits this code path anyway).
- Attribution markup:

```
Sound Effect by <a href="https://pixabay.com/users/dragon-studio-38165424/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=376875">DRAGON-STUDIO</a> from <a href="https://pixabay.com//?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=376875">Pixabay</a>
```

---

## Where attribution is rendered

The Pac-Man modal carries an inline credit line (`.tc-pacman__credits`)
that points at the three Pac-Man / arcade sources. Pong, Asteroids,
and the drawer-combine whoosh do not have a dedicated UI footer
yet; if/when one lands, the markup above should be copied verbatim
to satisfy the licenses.

If any source file is replaced, update this CREDITS file and the
relevant rendered attribution in lockstep.
