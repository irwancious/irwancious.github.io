document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================
     1. BACKGROUND FLOATING HEARTS
     ========================================== */
  const heartContainer = document.getElementById('heart-container');
  const heartEmojis = ['❤️', '💖', '💝', '🌸', '✨', '💕'];

  function createFloatingHeart() {
    const heart = document.createElement('div');
    heart.className = 'floating-heart';

    // Choose random heart emoji
    heart.innerText = heartEmojis[Math.floor(Math.random() * heartEmojis.length)];

    // Randomize positioning, size, animation duration
    const startX = Math.random() * 100; // left position in percentage
    const size = Math.random() * 20 + 15; // size between 15px and 35px
    const duration = Math.random() * 6 + 7; // duration between 7s and 13s
    const delay = Math.random() * 2;

    heart.style.left = `${startX}%`;
    heart.style.fontSize = `${size}px`;
    heart.style.animationDuration = `${duration}s`;
    heart.style.animationDelay = `${delay}s`;

    heartContainer.appendChild(heart);

    // Clean up heart element after animation completes
    setTimeout(() => {
      heart.remove();
    }, (duration + delay) * 1000);
  }

  // Initialize hearts
  for (let i = 0; i < 15; i++) {
    createFloatingHeart();
  }
  // Keep generating hearts
  setInterval(createFloatingHeart, 600);


  /* ==========================================
     2. BACKGROUND MUSIC SYSTEM
     ========================================== */
  const audio = document.getElementById('bg-music');
  const musicToggle = document.getElementById('music-toggle');
  const musicStatus = musicToggle.querySelector('.music-status');
  let isPlaying = false;

  // Set volume slightly lower for comfortable listening
  audio.volume = 0.5;

  function toggleMusic(forcePlay = null) {
    const shouldPlay = forcePlay !== null ? forcePlay : audio.paused;

    if (shouldPlay) {
      audio.play().then(() => {
        musicToggle.classList.add('playing');
        musicStatus.textContent = 'MUTE MUSIC';
        isPlaying = true;
      }).catch(err => {
        console.log("Audio autoplay prevented by browser. Waiting for interaction.", err);
      });
    } else {
      audio.pause();
      musicToggle.classList.remove('playing');
      musicStatus.textContent = 'PLAY MUSIC';
      isPlaying = false;
    }
  }

  musicToggle.addEventListener('click', () => toggleMusic());


  /* ==========================================
     3. ENVELOPE OPENING MECHANISM
     ========================================== */
  const envelope = document.getElementById('envelope');
  const envelopeWrapper = document.getElementById('envelope-wrapper');
  const letterCard = document.getElementById('letter-card');

  envelope.addEventListener('click', () => {
    // Open envelope
    envelope.classList.add('open');

    // Try to auto-play background music on interaction
    toggleMusic(true);

    // Wait for the opening animations to complete, then display the letter card
    setTimeout(() => {
      envelopeWrapper.style.opacity = '0';
      envelopeWrapper.style.transform = 'scale(0.9) translateY(-30px)';

      setTimeout(() => {
        envelopeWrapper.classList.add('hidden');
        letterCard.classList.remove('hidden');

        // Trigger carousel auto-play once visible
        startCarousel();
      }, 500);
    }, 1500);
  });


  /* ==========================================
     4. REASON CAROUSEL SLIDER
     ========================================== */
  let carouselInterval;

  function startCarousel() {
    const track = document.querySelector('.carousel-track');
    const slides = Array.from(track.children);
    const bulletsNav = document.querySelector('.carousel-nav');
    const bullets = Array.from(bulletsNav.children);
    let currentSlideIndex = 0;

    function moveToSlide(targetIndex) {
      slides[currentSlideIndex].classList.remove('current-slide');
      bullets[currentSlideIndex].classList.remove('current-indicator');

      slides[targetIndex].classList.add('current-slide');
      bullets[targetIndex].classList.add('current-indicator');

      currentSlideIndex = targetIndex;
    }

    // Bullet indicator clicks
    bullets.forEach((bullet, index) => {
      bullet.addEventListener('click', () => {
        clearInterval(carouselInterval);
        moveToSlide(index);
      });
    });

    // Auto rotate every 4 seconds
    carouselInterval = setInterval(() => {
      let nextIndex = (currentSlideIndex + 1) % slides.length;
      moveToSlide(nextIndex);
    }, 5500);
  }


  /* ==========================================
     5. TELEPORTING "NO" BUTTON (PERSUASION GAME)
     ========================================== */
  const btnNo = document.getElementById('btn-no');

  function teleportButton(e) {
    // Add teleporting class if not already added to apply absolute position styles
    if (!btnNo.classList.contains('teleporting')) {
      btnNo.classList.add('teleporting');
    }

    // Calculate new position within viewport boundaries
    const padding = 60; // keeps the button away from edge of screen
    const maxW = window.innerWidth - btnNo.offsetWidth - padding;
    const maxH = window.innerHeight - btnNo.offsetHeight - padding;

    let randomX = Math.random() * (maxW - padding) + padding;
    let randomY = Math.random() * (maxH - padding) + padding;

    // Check if the random position overlaps with the pointer/cursor
    // (helps prevent accidental clicks on hover/tap)
    let pointerX = e.clientX || (e.touches && e.touches[0].clientX) || window.innerWidth / 2;
    let pointerY = e.clientY || (e.touches && e.touches[0].clientY) || window.innerHeight / 2;

    const distanceX = Math.abs(randomX - pointerX);
    const distanceY = Math.abs(randomY - pointerY);

    // If too close, shift it further away
    if (distanceX < 150 && distanceY < 150) {
      randomX = (randomX + 200) % maxW;
      randomY = (randomY + 200) % maxH;
      if (randomX < padding) randomX = padding;
      if (randomY < padding) randomY = padding;
    }

    btnNo.style.left = `${randomX}px`;
    btnNo.style.top = `${randomY}px`;
  }

  // Hover events for Desktop
  btnNo.addEventListener('mouseenter', teleportButton);

  // Touch events for Mobile devices
  btnNo.addEventListener('touchstart', (e) => {
    e.preventDefault(); // Prevents default click trigger on touch
    teleportButton(e);
  });

  // Clicking the button (in case they somehow catch it)
  btnNo.addEventListener('click', (e) => {
    e.preventDefault();
    teleportButton(e);
  });


  /* ==========================================
     6. HIGH-PERFORMANCE CANVAS CONFETTI SYSTEM
     ========================================== */
  const canvas = document.getElementById('confetti-canvas');
  const ctx = canvas.getContext('2d');
  let confettiActive = false;
  const confettiArray = [];
  const confettiColors = ['#ff477e', '#ff8e9e', '#ffd1dc', '#ffd700', '#25d366', '#33b1ff', '#a87c84'];

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  window.addEventListener('resize', resizeCanvas);

  class ConfettiParticle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * -canvas.height - 20;
      this.size = Math.random() * 8 + 6;
      this.color = confettiColors[Math.floor(Math.random() * confettiColors.length)];
      this.speedY = Math.random() * 3 + 2;
      this.speedX = Math.random() * 2 - 1;
      this.rotation = Math.random() * 360;
      this.rotationSpeed = Math.random() * 4 - 2;
      this.shape = Math.random() > 0.4 ? 'circle' : 'rect';
    }

    update() {
      this.y += this.speedY;
      this.x += this.speedX;
      this.rotation += this.rotationSpeed;

      // Reset particle at top if it goes offscreen
      if (this.y > canvas.height) {
        this.y = -20;
        this.x = Math.random() * canvas.width;
      }
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate((this.rotation * Math.PI) / 180);
      ctx.fillStyle = this.color;

      if (this.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
      }

      ctx.restore();
    }
  }

  function initConfetti() {
    resizeCanvas();
    for (let i = 0; i < 120; i++) {
      confettiArray.push(new ConfettiParticle());
    }
  }

  function animateConfetti() {
    if (!confettiActive) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    confettiArray.forEach(p => {
      p.update();
      p.draw();
    });

    requestAnimationFrame(animateConfetti);
  }

  function startConfetti() {
    confettiActive = true;
    initConfetti();
    animateConfetti();
  }


  /* ==========================================
     7. SUCCESS FLOW & WHATSAPP REDIRECT
     ========================================== */
  const btnYes = document.getElementById('btn-yes');
  const successOverlay = document.getElementById('success-overlay');
  const whatsappLink = document.getElementById('whatsapp-link');

  btnYes.addEventListener('click', () => {
    // Hide letter and display success overlay
    letterCard.classList.add('hidden');
    successOverlay.classList.remove('hidden');

    // Clear carousel rotation
    clearInterval(carouselInterval);

    // Start confetti effect
    startConfetti();

    // Build pre-filled WhatsApp message
    const phoneNumber = '6281994429111'; // Target user number
    const message = 'Mamas Irwan, aku udah maafin kamu kok! Yuk chat-an lagi ❤️';
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;

    whatsappLink.href = whatsappUrl;
  });

});
