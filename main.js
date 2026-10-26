// Bread Co. Sourdough Scroll Animation - Scroll Only Mode

document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const preloader = document.getElementById('preloader');
  const loaderBar = document.getElementById('loader-bar');
  const loaderPercentage = document.getElementById('loader-percentage');
  const canvas = document.getElementById('animation-canvas');
  const ctx = canvas.getContext('2d');
  const heroOverlay = document.getElementById('hero-overlay');

  // --- Constants & Config ---
  const totalFrames = 285;
  const imageSequence = [];
  const lerpFactor = 0.08; // Damping factor for smooth frame scrubbing (0.08 = smooth, 0.15 = quick)
  
  // Animation State
  let loadedImagesCount = 0;
  let currentFrameIndex = 1;
  let targetFrameIndex = 1;
  let isLoaded = false;
  let animationFrameId = null;

  // --- 1. Preload Image Frames ---
  function preloadImages() {
    return new Promise((resolve) => {
      for (let i = 1; i <= totalFrames; i++) {
        const img = new Image();
        const frameNum = String(i).padStart(3, '0');
        // Updated to match the user's GitHub repository structure (images in root)
        img.src = `ezgif-frame-${frameNum}.jpg`;
        
        img.onload = () => {
          loadedImagesCount++;
          const progress = Math.min(Math.floor((loadedImagesCount / totalFrames) * 100), 100);
          
          // Update loader UI
          loaderBar.style.width = `${progress}%`;
          loaderPercentage.textContent = `${progress}%`;
          
          if (loadedImagesCount === totalFrames) {
            isLoaded = true;
            resolve();
          }
        };

        img.onerror = () => {
          console.error(`Failed to load frame ${frameNum}`);
          loadedImagesCount++;
          if (loadedImagesCount === totalFrames) {
            isLoaded = true;
            resolve();
          }
        };

        imageSequence.push(img);
      }
    });
  }

  // --- 2. Scale and Fit Image in Canvas (Cover Style) ---
  function drawImageToCanvas(img) {
    if (!img || !img.complete || img.naturalWidth === 0) return;

    const imgWidth = img.naturalWidth || img.width;
    const imgHeight = img.naturalHeight || img.height;
    
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    const imgRatio = imgWidth / imgHeight;
    const canvasRatio = canvasWidth / canvasHeight;

    let drawWidth, drawHeight, startX, startY;

    if (canvasRatio < imgRatio) {
      // Canvas is narrower than the image (portrait viewports)
      drawHeight = canvasHeight;
      drawWidth = canvasHeight * imgRatio;
      startX = (canvasWidth - drawWidth) / 2;
      startY = 0;
    } else {
      // Canvas is wider than the image (landscape viewports)
      drawWidth = canvasWidth;
      drawHeight = canvasWidth / imgRatio;
      startX = 0;
      startY = (canvasHeight - drawHeight) / 2;
    }

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.drawImage(img, startX, startY, drawWidth, drawHeight);
  }

  // --- 3. Resize Canvas Handler ---
  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    
    const currentFrame = imageSequence[Math.round(currentFrameIndex) - 1];
    if (currentFrame && currentFrame.complete) {
      drawImageToCanvas(currentFrame);
    }
  }

  // --- 4. Scroll Tracking Event ---
  function updateScrollProgress() {
    const scrollTop = window.scrollY || window.pageYOffset;
    const spacer = document.querySelector('.scroll-spacer');
    const scrollRange = spacer ? spacer.offsetHeight : (document.documentElement.scrollHeight - window.innerHeight);

    const progress = Math.min(1, Math.max(0, scrollTop / scrollRange));

    // Calculate target frame index
    targetFrameIndex = Math.min(
      Math.max(1, Math.floor((progress) * (totalFrames - 1)) + 1),
      totalFrames
    );

    // Calculate hero overlay opacity (fade out completely by 30% scroll progress)
    if (heroOverlay) {
      if (progress >= 0.3) {
        heroOverlay.style.opacity = '0';
        heroOverlay.style.visibility = 'hidden';
      } else {
        heroOverlay.style.opacity = (1 - (progress / 0.3)).toFixed(3);
        heroOverlay.style.visibility = 'visible';
      }
    }
  }

  // --- 5. Frame Interpolation Animation Loop ---
  let lastDrawnFrameIndex = -1;

  function renderLoop() {
    const diff = targetFrameIndex - currentFrameIndex;
    
    if (Math.abs(diff) < 0.01) {
      currentFrameIndex = targetFrameIndex;
    } else {
      currentFrameIndex += diff * lerpFactor;
    }

    const roundedFrameIndex = Math.round(currentFrameIndex);
    
    if (roundedFrameIndex !== lastDrawnFrameIndex) {
      const img = imageSequence[roundedFrameIndex - 1];
      if (img && img.complete) {
        drawImageToCanvas(img);
        lastDrawnFrameIndex = roundedFrameIndex;
      }
    }

    animationFrameId = requestAnimationFrame(renderLoop);
  }

  // --- 6. Event Listeners Setup ---
  function setupEventListeners() {
    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    window.addEventListener('resize', () => {
      resizeCanvas();
      updateScrollProgress();
    });
  }

  // --- Initialize Web Experience ---
  preloadImages().then(() => {
    // Fade out preloader screen
    setTimeout(() => {
      preloader.classList.add('fade-out');
      
      setTimeout(() => {
        preloader.style.display = 'none';
        
        // Initial setup
        resizeCanvas();
        setupEventListeners();
        updateScrollProgress();
        
        // Run animation loop
        renderLoop();
      }, 800);
    }, 500);
  });
});
