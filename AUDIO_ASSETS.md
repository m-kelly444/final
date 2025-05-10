# Audio Assets for Echelon

The Echelon system uses audio effects to create an immersive cyberpunk interface experience. Place the following audio files in the `/public/sounds/` directory:

## Required Sound Files

1. **cyberui.mp3**
   - Used for button clicks and interaction events
   - Duration: ~1 second
   - Sound type: Electronic beep/click

2. **interface-startup.mp3**
   - Played when the dashboard initializes
   - Duration: ~3 seconds
   - Sound type: Low-to-high rising electronic tone

3. **hologram-activate.mp3**
   - Played when holographic interfaces are activated
   - Duration: ~2 seconds
   - Sound type: Electric hum with a slight wobble

4. **scan.mp3**
   - Used for the biometric scanning animation
   - Duration: ~3 seconds
   - Sound type: Electronic scanning sounds

You can create these files using sound generators or download similar royalty-free sounds from sites like [Freesound](https://freesound.org/) or [ZapSplat](https://www.zapsplat.com/). 

For the perfect spy-movie aesthetic, look for sounds that have:
- Electronic/synthetic quality
- Futuristic feeling
- Slight reverb
- Not too harsh or loud

## Audio Configuration

The audio volume is intentionally set low (0.3-0.5 range) to avoid overwhelming the user while still providing subtle audio feedback.

In production, the app includes a fallback for browsers that block autoplay:

```javascript
audioRef.current.play().catch(e => console.log('Audio playback prevented by browser'));
```

This ensures the experience degrades gracefully when audio cannot be automatically played.

## Additional Sound Effects (Optional)

For an even more immersive experience, you could add:

- **alert.mp3** - For security alerts and warnings
- **success.mp3** - For successful operations
- **error.mp3** - For errors and failed operations
- **typing.mp3** - Subtle keyboard sounds for typing animations
- **data-transfer.mp3** - For data loading operations

These sounds should share the same cyberpunk aesthetic as the core sound effects.