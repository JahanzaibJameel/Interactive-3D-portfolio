// DOM Elements
const card3d = document.getElementById("card-3d");
const flipBtn = document.getElementById("flip-btn");
const backBtn = document.getElementById("back-btn");
const sectionBtns = document.querySelectorAll(".section-btn");
const sectionContents = document.querySelectorAll(".section-content");
const themeToggle = document.getElementById("theme-toggle");
const chatbotToggle = document.getElementById("chatbot-toggle");
const chatbot = document.getElementById("chatbot");
const closeChatbot = document.getElementById("close-chatbot");
const chatMessages = document.getElementById("chat-messages");
const chatInput = document.getElementById("chat-input");
const sendMessage = document.getElementById("send-message");
const easterEgg = document.getElementById("easter-egg");
const skillBars = document.querySelectorAll(".skill-progress");
const projectCards = document.querySelectorAll(".project-card");
const socialIcons = document.querySelectorAll(".social-icon");

// Particle System
const canvas = document.getElementById("particle-canvas");
const ctx = canvas.getContext("2d");
let particles = [];
let mouse = { x: 0, y: 0, moved: false };

// Audio Visualizer
const visualizerCanvas = document.getElementById("visualizer");
const visualizerCtx = visualizerCanvas.getContext("2d");
let audioContext, analyser, dataArray, bufferLength;

// Initialize
function init() {
  setupCanvas();
  createParticles();
  setupEventListeners();
  animateParticles();
  setupSkillBars();
  setupAudioVisualizer();

  // Initial typing animation
  setTimeout(() => {
    document.querySelector(".typing").style.animation = "none";
    setTimeout(() => {
      document.querySelector(".typing").style.animation =
        "typing 3.5s steps(40, end), blink 1s step-end infinite";
    }, 100);
  }, 3500);
}

// Setup Canvas
function setupCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  visualizerCanvas.width = window.innerWidth;
  visualizerCanvas.height = 60;
}

// Create Particles
function createParticles() {
  particles = [];
  const particleCount = Math.min(150, Math.floor(window.innerWidth / 10));

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 0.5,
      speedX: (Math.random() - 0.5) * 0.5,
      speedY: (Math.random() - 0.5) * 0.5,
      color: `rgba(${Math.floor(Math.random() * 100 + 155)}, ${Math.floor(
        Math.random() * 100 + 155
      )}, 255, ${Math.random() * 0.5 + 0.2})`,
    });
  }
}

// Animate Particles
function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Update and draw particles
  particles.forEach((particle) => {
    // Move particles
    particle.x += particle.speedX;
    particle.y += particle.speedY;

    // Wrap around edges
    if (particle.x < 0) particle.x = canvas.width;
    if (particle.x > canvas.width) particle.x = 0;
    if (particle.y < 0) particle.y = canvas.height;
    if (particle.y > canvas.height) particle.y = 0;

    // Mouse interaction
    if (mouse.moved) {
      const dx = particle.x - mouse.x;
      const dy = particle.y - mouse.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 100) {
        const angle = Math.atan2(dy, dx);
        const force = (100 - distance) / 100;

        particle.x += Math.cos(angle) * force * 2;
        particle.y += Math.sin(angle) * force * 2;
      }
    }

    // Draw particle
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fillStyle = particle.color;
    ctx.fill();
  });

  // Draw shooting stars occasionally
  if (Math.random() < 0.005) {
    drawShootingStar();
  }

  requestAnimationFrame(animateParticles);
}

// Draw Shooting Star
function drawShootingStar() {
  const x = Math.random() * canvas.width;
  const y = 0;
  const length = Math.random() * 100 + 50;
  const speed = Math.random() * 10 + 5;

  let currentX = x;
  let currentY = y;
  const trail = [];

  function animateStar() {
    ctx.beginPath();
    ctx.moveTo(currentX, currentY);
    currentX += speed;
    currentY += speed;
    ctx.lineTo(currentX, currentY);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
    ctx.lineWidth = 2;
    ctx.stroke();

    trail.push({ x: currentX, y: currentY });

    // Draw trail
    for (let i = 0; i < trail.length; i++) {
      const point = trail[i];
      ctx.beginPath();
      ctx.arc(point.x, point.y, 2 - (i / trail.length) * 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${0.7 - (i / trail.length) * 0.7})`;
      ctx.fill();
    }

    if (currentX < canvas.width && currentY < canvas.height) {
      requestAnimationFrame(animateStar);
    }
  }

  animateStar();
}

// Setup Event Listeners
function setupEventListeners() {
  // Card flip
  flipBtn.addEventListener("click", flipCard);
  backBtn.addEventListener("click", flipCard);

  // Section navigation
  sectionBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const section = btn.getAttribute("data-section");
      showSection(section);

      // Update active button
      sectionBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });

  // Mouse move for 3D effect
  document.addEventListener("mousemove", (e) => {
    mouse.moved = true;
    mouse.x = e.clientX;
    mouse.y = e.clientY;

    // Update card tilt
    if (!card3d.classList.contains("flipped")) {
      const rotateY = (e.clientX / window.innerWidth - 0.5) * 20;
      const rotateX = (e.clientY / window.innerHeight - 0.5) * 20;
      card3d.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    }
  });

  // Mouse leave reset
  document.addEventListener("mouseleave", () => {
    if (!card3d.classList.contains("flipped")) {
      card3d.style.transform = "perspective(1000px) rotateX(0) rotateY(0)";
    }
  });

  // Keyboard navigation
  document.addEventListener("keydown", (e) => {
    // Arrow keys for section navigation
    if (card3d.classList.contains("flipped")) {
      const activeIndex = Array.from(sectionBtns).findIndex((btn) =>
        btn.classList.contains("active")
      );

      if (e.key === "ArrowRight") {
        const nextIndex = (activeIndex + 1) % sectionBtns.length;
        sectionBtns[nextIndex].click();
      } else if (e.key === "ArrowLeft") {
        const prevIndex =
          (activeIndex - 1 + sectionBtns.length) % sectionBtns.length;
        sectionBtns[prevIndex].click();
      }
    }

    // Easter egg - U key for Universe Mode
    if (e.key === "u" || e.key === "U") {
      activateUniverseMode();
    }

    // Escape key to flip card back
    if (e.key === "Escape" && card3d.classList.contains("flipped")) {
      flipCard();
    }
  });

  // Theme toggle
  themeToggle.addEventListener("click", toggleTheme);

  // Chatbot
  chatbotToggle.addEventListener("click", toggleChatbot);
  closeChatbot.addEventListener("click", toggleChatbot);
  sendMessage.addEventListener("click", sendChatMessage);
  chatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendChatMessage();
  });

  // Window resize
  window.addEventListener("resize", () => {
    setupCanvas();
    createParticles();
  });

  // Project card hover effects
  projectCards.forEach((card) => {
    card.addEventListener("mouseenter", () => {
      card.classList.add("glow-accent");
      card.style.transform = "scale(1.05)";
    });

    card.addEventListener("mouseleave", () => {
      card.classList.remove("glow-accent");
      card.style.transform = "scale(1)";
    });
  });

  // Social icon hover effects
  socialIcons.forEach((icon) => {
    icon.addEventListener("mouseenter", () => {
      icon.style.transform = "rotate(15deg) scale(1.2)";
    });

    icon.addEventListener("mouseleave", () => {
      icon.style.transform = "rotate(0) scale(1)";
    });
  });
}

// Flip Card
function flipCard() {
  card3d.classList.toggle("flipped");

  if (card3d.classList.contains("flipped")) {
    card3d.style.transform = "perspective(1000px) rotateY(180deg)";
    showSection("about");
  } else {
    card3d.style.transform = "perspective(1000px) rotateX(0) rotateY(0)";
  }
}

// Show Section
function showSection(section) {
  sectionContents.forEach((content) => {
    content.classList.add("hidden");
    content.classList.remove("active");
  });

  document.getElementById(`${section}-section`).classList.remove("hidden");
  document.getElementById(`${section}-section`).classList.add("active");

  // Animate skill bars when skills section is shown
  if (section === "skills") {
    setTimeout(animateSkillBars, 300);
  }
}

// Setup Skill Bars
function setupSkillBars() {
  skillBars.forEach((bar) => {
    bar.style.width = "0%";
  });
}

// Animate Skill Bars
function animateSkillBars() {
  skillBars.forEach((bar) => {
    const width = bar.getAttribute("data-width");
    bar.style.width = `${width}%`;
  });
}

// Toggle Theme
function toggleTheme() {
  document.body.classList.toggle("universe-mode");

  if (document.body.classList.contains("universe-mode")) {
    themeToggle.innerHTML = '<i class="fas fa-sun mr-2"></i> Light Mode';
  } else {
    themeToggle.innerHTML = '<i class="fas fa-moon mr-2"></i> Dark Mode';
  }
}

// Activate Universe Mode (Easter Egg)
function activateUniverseMode() {
  document.body.classList.add("universe-mode");
  themeToggle.innerHTML = '<i class="fas fa-sun mr-2"></i> Light Mode';

  // Show notification
  easterEgg.classList.remove("hidden");
  setTimeout(() => {
    easterEgg.classList.add("hidden");
  }, 3000);

  // Add special effects
  createSpecialParticles();
}

// Create Special Particles for Universe Mode
function createSpecialParticles() {
  for (let i = 0; i < 50; i++) {
    setTimeout(() => {
      const particle = {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 2,
        speedY: (Math.random() - 0.5) * 2,
        color: `hsl(${Math.random() * 360}, 100%, 70%)`,
        life: 100,
      };

      particles.push(particle);

      // Remove after life expires
      setTimeout(() => {
        const index = particles.indexOf(particle);
        if (index > -1) {
          particles.splice(index, 1);
        }
      }, 2000);
    }, i * 50);
  }
}

// Toggle Chatbot
function toggleChatbot() {
  chatbot.classList.toggle("open");
}

// Send Chat Message
function sendChatMessage() {
  const message = chatInput.value.trim();
  if (message === "") return;

  // Add user message
  addChatMessage(message, "user");
  chatInput.value = "";

  // Bot response
  setTimeout(() => {
    let response =
      "I'm not sure how to respond to that. Try asking about my skills, projects, or experience.";

    if (
      message.toLowerCase().includes("hello") ||
      message.toLowerCase().includes("hi")
    ) {
      response = "Hello! How can I help you explore this portfolio?";
    } else if (message.toLowerCase().includes("skill")) {
      response =
        "I have expertise in JavaScript, React, Three.js, and UI/UX design. Check out the Skills section for details!";
    } else if (message.toLowerCase().includes("project")) {
      response =
        "I've worked on various projects including interactive dashboards, UI libraries, and e-commerce experiences. See the Projects section!";
    } else if (
      message.toLowerCase().includes("experience") ||
      message.toLowerCase().includes("year")
    ) {
      response =
        "I have over 5 years of experience in web development, specializing in creating immersive digital experiences.";
    } else if (message.toLowerCase().includes("contact")) {
      response =
        "You can reach me through the contact form or via the social links in the Contact section.";
    } else if (message.toLowerCase().includes("universe")) {
      response = "Try pressing the 'U' key to activate Universe Mode!";
    }

    addChatMessage(response, "bot");
  }, 1000);
}

// Add Chat Message
function addChatMessage(message, sender) {
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("bg-gray-700", "p-3", "rounded-lg", "max-w-xs");

  if (sender === "user") {
    messageDiv.classList.add("ml-auto", "bg-primary", "bg-opacity-20");
  }

  messageDiv.innerHTML = `<p class="text-sm">${message}</p>`;
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Setup Audio Visualizer
function setupAudioVisualizer() {
  // Create audio context
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  analyser = audioContext.createAnalyser();
  analyser.fftSize = 256;
  bufferLength = analyser.frequencyBinCount;
  dataArray = new Uint8Array(bufferLength);

  // Create oscillator for demo (in a real app, you'd connect to actual audio)
  const oscillator = audioContext.createOscillator();
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(440, audioContext.currentTime);

  const gainNode = audioContext.createGain();
  gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);

  oscillator.connect(gainNode);
  gainNode.connect(analyser);
  analyser.connect(audioContext.destination);

  oscillator.start();

  // Animate visualizer
  function animateVisualizer() {
    requestAnimationFrame(animateVisualizer);
    analyser.getByteFrequencyData(dataArray);

    visualizerCtx.clearRect(
      0,
      0,
      visualizerCanvas.width,
      visualizerCanvas.height
    );

    const barWidth = (visualizerCanvas.width / bufferLength) * 2.5;
    let barHeight;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      barHeight = dataArray[i] / 2;

      const gradient = visualizerCtx.createLinearGradient(
        0,
        0,
        0,
        visualizerCanvas.height
      );
      gradient.addColorStop(0, "#00f3ff");
      gradient.addColorStop(1, "#9d4edd");

      visualizerCtx.fillStyle = gradient;
      visualizerCtx.fillRect(
        x,
        visualizerCanvas.height - barHeight,
        barWidth,
        barHeight
      );

      x += barWidth + 1;
    }
  }

  animateVisualizer();
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", init);
