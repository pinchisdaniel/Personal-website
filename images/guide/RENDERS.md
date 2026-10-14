# Danny renders

The PNGs in this folder are the WEB versions: cropped to the character and scaled to 900 px tall (about 150 KB each).
Your full resolution renders live in `originals/`, which git ignores so they never get uploaded.

| File | Pose | Where it shows |
|---|---|---|
| guide-wave.png | Waving hello | Hero (big), tour step 4 (contact) |
| guide-presenting.png | Open palm toward screen left | Top of each Work scene card, contact section |
| guide-wide-arms.png | Arms spread wide, ta da | Scene card when the brief is open, tour step 1 (reel), end of tour, after a message is sent |
| guide-point-right.png | Pointing toward screen right | Tour step 2 (project cards) |
| guide-thinking.png | Hand on chin, thinking | About section, tour step 3 |

Adding a new pose: render it with a transparent background, shrink it (crop to the character, about 900 px tall,
under 300 KB, squoosh.app works), save it here as guide-<name>.png and add the name to DANNY_POSES in script.js.
