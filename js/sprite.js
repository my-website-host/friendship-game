/**
 * 👩‍⚕️ The Friendship Run — RETRO EMOJI PIXEL RENDERER
 * 
 * Dynamic pixelation trick: Draws standard emojis to a tiny offscreen canvas,
 * caches them, and draws them scaled-up with imageSmoothingEnabled = false.
 * This instantly generates customizable, authentic 8-bit retro pixel-art characters.
 */

class SpriteManager {
  constructor() {
    this.spriteConfig = {
      totalFrames: 7
    };

    // Caches pixelated off-screen canvas buffers for emojis
    this.pixelBufferCache = {};
    this.bufferSize = 24; // Small resolution for high-quality pixelation grid
  }

  /**
   * Pre-generates and caches a pixelated offscreen canvas for a given emoji/character.
   * This is extremely high performance since it only draws the text once.
   */
  getPixelatedEmojiBuffer(emoji, key) {
    if (this.pixelBufferCache[key]) {
      return this.pixelBufferCache[key];
    }

    // Create a tiny off-screen canvas
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = this.bufferSize;
    tempCanvas.height = this.bufferSize;
    const tempCtx = tempCanvas.getContext("2d");

    // Clear buffer
    tempCtx.clearRect(0, 0, this.bufferSize, this.bufferSize);

    // Draw the emoji at small size centered in the tiny buffer
    // Doctor emoji (👩‍⚕️) requires slightly more padding to fit both characters
    const sizeFactor = emoji.includes('⚕') ? 0.72 : 0.78;
    tempCtx.font = `${this.bufferSize * sizeFactor}px Outfit, Arial, sans-serif`;
    tempCtx.textAlign = "center";
    tempCtx.textBaseline = "middle";
    tempCtx.fillText(emoji, this.bufferSize / 2, this.bufferSize / 2);

    // Cache the off-screen canvas buffer
    this.pixelBufferCache[key] = tempCanvas;
    return tempCanvas;
  }

  /**
   * Renders the character emoji pixelated using our off-screen scaling technique.
   * Applies realistic squishy vintage game physics scaling on top of the pixel grid.
   */
  drawEmojiCharacter(ctx, emoji, x, y, width, height, yVelocity, isGrounded) {
    ctx.save();

    // Calculate physical squash and stretch scaling
    let scaleX = 1;
    let scaleY = 1;

    if (!isGrounded) {
      if (yVelocity < 0) {
        scaleY = 1 + Math.min(Math.abs(yVelocity) * 0.02, 0.22);
        scaleX = 1 - Math.min(Math.abs(yVelocity) * 0.015, 0.1);
      } else {
        scaleY = 1 + Math.min(yVelocity * 0.015, 0.15);
        scaleX = 1 - Math.min(yVelocity * 0.008, 0.08);
      }
    } else {
      // Dynamic run bounce animation
      const pulseTime = Date.now() * 0.014;
      scaleY = 1 + Math.sin(pulseTime) * 0.04;
      scaleX = 1 - Math.sin(pulseTime) * 0.04;
    }

    // Centered scaling coordinates
    ctx.translate(x + width / 2, y + height / 2);
    ctx.scale(scaleX, scaleY);

    // Fetch or create the pixel buffer
    const buffer = this.getPixelatedEmojiBuffer(emoji, emoji);

    // Disable image smoothing to force crisp pixel-art styling on scaling up
    ctx.imageSmoothingEnabled = false;
    ctx.mozImageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.msImageSmoothingEnabled = false;

    // Draw the tiny canvas stretched to full character dimensions
    ctx.drawImage(
      buffer,
      0, 0, this.bufferSize, this.bufferSize, // Source
      -width / 2, -height / 2, width, height  // Stretched Destination
    );

    ctx.restore();
  }

  /**
   * Wrapper function. In this pure emoji layout, it directly draws the pixelated emoji
   * for all selected characters (Riya, Me, and Nishthi) with identical squishy physics.
   */
  drawSpriteFrame(ctx, emoji, frameIndex, x, y, width, height, yVelocity, isGrounded) {
    this.drawEmojiCharacter(ctx, emoji, x, y, width, height, yVelocity, isGrounded);
  }
}

// Instantiate global sprite controller
const SPRITES = new SpriteManager();
