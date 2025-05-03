// Check if the device is a mobile device
function isMobileDevice() {
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  const isMobileByUserAgent = mobileRegex.test(navigator.userAgent);
  const isMobileByScreenSize = window.innerWidth < 768;
  
  return isMobileByUserAgent || isMobileByScreenSize;
}

// Only initialize and run the animation on desktop devices
if (!isMobileDevice()) {
  // Note: You'll need to include Three.js in your HTML file:
  // <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r159/three.min.js"></script>

  // Initialize the scene, camera, and renderer
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0); // Transparent background
  document.body.appendChild(renderer.domElement);

  // Make the canvas a fixed background
  renderer.domElement.style.position = 'absolute'; // Change from 'fixed' to 'absolute'
  renderer.domElement.style.top = '150px'; // Set a specific pixel position
  renderer.domElement.style.left = 0;
  renderer.domElement.style.zIndex = -1;
  renderer.domElement.style.transform = 'none'; // Remove transform

  // Update canvas size on window resize, but don't reposition
  window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  });

  // Particle system settings
  const PARTICLE_COUNT = 15000;
  const CUBE_SIZE = 100;
  const MAX_PARTICLE_SIZE = 3;
  const MIN_PARTICLE_SIZE = 0.5;

  // Create particle material
  const particleMaterial = new THREE.PointsMaterial({
    size: 2,
    sizeAttenuation: true,
    color: 0xffffff,
    transparent: true,
    opacity: 0.8,
    vertexColors: true,
    blending: THREE.AdditiveBlending
  });

  // Create particle geometry with buffer attributes
  const particleGeometry = new THREE.BufferGeometry();
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const colors = new Float32Array(PARTICLE_COUNT * 3);
  const sizes = new Float32Array(PARTICLE_COUNT);
  const phases = new Float32Array(PARTICLE_COUNT);
  const layerIndices = new Float32Array(PARTICLE_COUNT);

  // Create lookup arrays for animation
  const originalPositions = new Float32Array(PARTICLE_COUNT * 3);
  const targetPositions = new Float32Array(PARTICLE_COUNT * 3);
  const morphSpeed = new Float32Array(PARTICLE_COUNT);

  // Animation patterns
  const PATTERNS = {
    CUBE: 0,
    SPHERE: 1,
    TORNADO: 2,
    EXPLOSION: 3,
    IMPLOSION: 4,
    GRID: 5,
    WAVE: 6
  };

  let currentPattern = PATTERNS.CUBE;
  let nextPattern = PATTERNS.CUBE;
  let morphProgress = 0;
  let morphDirection = 1;
  let patternDuration = 8; // seconds per pattern

  // Helper function to distribute particles in a cube
  function positionInCube(index) {
    // 8 corners of the cube + internal points
    const half = CUBE_SIZE / 2;
    
    // Cube surface with some randomness
    let x, y, z;
    
    // Determine if the particle is on a face or inside the cube
    if (Math.random() > 0.7) {
      // Particle inside the cube with sparser distribution
      x = (Math.random() * 2 - 1) * half;
      y = (Math.random() * 2 - 1) * half;
      z = (Math.random() * 2 - 1) * half;
    } else {
      // Particle on a cube face
      const face = Math.floor(Math.random() * 6);
      
      switch (face) {
        case 0: // Front face
          x = (Math.random() * 2 - 1) * half;
          y = (Math.random() * 2 - 1) * half;
          z = half;
          break;
        case 1: // Back face
          x = (Math.random() * 2 - 1) * half;
          y = (Math.random() * 2 - 1) * half;
          z = -half;
          break;
        case 2: // Top face
          x = (Math.random() * 2 - 1) * half;
          y = half;
          z = (Math.random() * 2 - 1) * half;
          break;
        case 3: // Bottom face
          x = (Math.random() * 2 - 1) * half;
          y = -half;
          z = (Math.random() * 2 - 1) * half;
          break;
        case 4: // Right face
          x = half;
          y = (Math.random() * 2 - 1) * half;
          z = (Math.random() * 2 - 1) * half;
          break;
        case 5: // Left face
          x = -half;
          y = (Math.random() * 2 - 1) * half;
          z = (Math.random() * 2 - 1) * half;
          break;
      }
      
      // Add slight randomness to face particles
      x += (Math.random() * 2 - 1) * 5;
      y += (Math.random() * 2 - 1) * 5;
      z += (Math.random() * 2 - 1) * 5;
    }
    
    originalPositions[index * 3] = x;
    originalPositions[index * 3 + 1] = y;
    originalPositions[index * 3 + 2] = z;
    
    return [x, y, z];
  }

  // Helper function to position particles in a sphere
  function positionInSphere(index) {
    const radius = CUBE_SIZE / 2;
    const phi = Math.acos(-1 + (2 * Math.random()));
    const theta = Math.random() * Math.PI * 2;
    
    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi) * Math.sin(theta);
    const z = radius * Math.cos(phi);
    
    targetPositions[index * 3] = x;
    targetPositions[index * 3 + 1] = y;
    targetPositions[index * 3 + 2] = z;
    
    return [x, y, z];
  }

  // Helper function to position particles in a tornado
  function positionInTornado(index) {
    const height = CUBE_SIZE * 1.5;
    const radius = CUBE_SIZE / 3;
    
    const heightRatio = Math.random();
    const y = (heightRatio * 2 - 1) * height / 2;
    
    // Tornado gets wider at the top
    const adjustedRadius = radius * (0.1 + heightRatio * 0.9);
    const angle = Math.random() * Math.PI * 8; // Multiple revolutions
    
    const x = Math.cos(angle) * adjustedRadius;
    const z = Math.sin(angle) * adjustedRadius;
    
    targetPositions[index * 3] = x;
    targetPositions[index * 3 + 1] = y;
    targetPositions[index * 3 + 2] = z;
    
    return [x, y, z];
  }

  // Helper function to position particles in an explosion pattern
  function positionInExplosion(index) {
    const angle1 = Math.random() * Math.PI * 2;
    const angle2 = Math.random() * Math.PI * 2;
    
    const radius = CUBE_SIZE * (0.1 + Math.random() * 0.9);
    
    const x = Math.sin(angle1) * Math.cos(angle2) * radius;
    const y = Math.sin(angle1) * Math.sin(angle2) * radius;
    const z = Math.cos(angle1) * radius;
    
    targetPositions[index * 3] = x;
    targetPositions[index * 3 + 1] = y;
    targetPositions[index * 3 + 2] = z;
    
    return [x, y, z];
  }

  // Helper function to position particles in a grid
  function positionInGrid(index) {
    const gridSize = Math.cbrt(PARTICLE_COUNT);
    const spacing = CUBE_SIZE / gridSize;
    
    const ix = Math.floor(index % gridSize);
    const iy = Math.floor((index / gridSize) % gridSize);
    const iz = Math.floor(index / (gridSize * gridSize));
    
    const x = (ix / gridSize) * CUBE_SIZE - CUBE_SIZE / 2;
    const y = (iy / gridSize) * CUBE_SIZE - CUBE_SIZE / 2;
    const z = (iz / gridSize) * CUBE_SIZE - CUBE_SIZE / 2;
    
    targetPositions[index * 3] = x;
    targetPositions[index * 3 + 1] = y;
    targetPositions[index * 3 + 2] = z;
    
    return [x, y, z];
  }

  // Helper function to position particles in wave form
  function positionInWave(index) {
    const size = CUBE_SIZE * 0.8;
    const half = size / 2;
    
    // Distribute on a plane with wave height
    const x = (Math.random() * 2 - 1) * half;
    const z = (Math.random() * 2 - 1) * half;
    
    // Base y on position (wave pattern)
    const distFromCenter = Math.sqrt(x*x + z*z) / half;
    const y = Math.sin(distFromCenter * Math.PI * 3) * half * 0.5;
    
    targetPositions[index * 3] = x;
    targetPositions[index * 3 + 1] = y;
    targetPositions[index * 3 + 2] = z;
    
    return [x, y, z];
  }

  // Initialize particles
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    // Set initial positions in a cube formation
    const [x, y, z] = positionInCube(i);
    
    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
    
    // Enhanced color palette with broader spectrum
    // Create a gradient from cyan to purple to pink
    const h = 0.6 + (Math.random() * 0.4) % 1.0; // Cyan-blue-purple range (0.6-1.0)
    const s = 0.8 + Math.random() * 0.2; // Higher saturation for vibrancy
    const l = 0.5 + Math.random() * 0.3; // Slightly brighter
    
    const color = new THREE.Color();
    color.setHSL(h, s, l);
    
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
    
    // Random size
    sizes[i] = MIN_PARTICLE_SIZE + Math.random() * (MAX_PARTICLE_SIZE - MIN_PARTICLE_SIZE);
    
    // Random phase for animation
    phases[i] = Math.random() * Math.PI * 2;
    
    // Layer index for wave effects
    layerIndices[i] = Math.floor(Math.random() * 5);
    
    // Morph speed
    morphSpeed[i] = 0.5 + Math.random() * 1.5;
  }

  // Set geometry attributes
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  particleGeometry.setAttribute('phase', new THREE.BufferAttribute(phases, 1));
  particleGeometry.setAttribute('layer', new THREE.BufferAttribute(layerIndices, 1));

  // Create the particle system
  const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(particleSystem);

  // Add lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(1, 1, 1).normalize();
  scene.add(directionalLight);

  const pointLight = new THREE.PointLight(0x2233ff, 1, CUBE_SIZE * 3);
  pointLight.position.set(0, 0, CUBE_SIZE);
  scene.add(pointLight);

  // Position camera
  camera.position.z = CUBE_SIZE * 2;

  // Mouse interaction
  const mouse = { x: 0, y: 0 };
  document.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  });

  // Click to change pattern
  document.addEventListener('click', () => {
    // Cycle through patterns
    nextPattern = (currentPattern + 1) % Object.keys(PATTERNS).length;
    morphProgress = 0;
    
    // Calculate target positions for new pattern
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      let targetPos;
      
      switch(nextPattern) {
        case PATTERNS.CUBE:
          targetPos = positionInCube(i);
          break;
        case PATTERNS.SPHERE:
          targetPos = positionInSphere(i);
          break;
        case PATTERNS.TORNADO:
          targetPos = positionInTornado(i);
          break;
        case PATTERNS.EXPLOSION:
          targetPos = positionInExplosion(i);
          break;
        case PATTERNS.GRID:
          targetPos = positionInGrid(i);
          break;
        case PATTERNS.WAVE:
          targetPos = positionInWave(i);
          break;
        default:
          targetPos = positionInCube(i);
      }
    }
  });

  // Animation loop
  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    
    const time = clock.getElapsedTime();
    const deltaTime = clock.getDelta();
    
    // Update pattern morph if needed
    if (currentPattern !== nextPattern) {
      morphProgress += deltaTime * 0.5; // Transition over 2 seconds
      
      if (morphProgress >= 1) {
        currentPattern = nextPattern;
        morphProgress = 0;
      }
    }
    
    // Auto-transition patterns
    if (time % patternDuration < 0.1 && morphProgress === 0 && currentPattern === nextPattern) {
      nextPattern = (currentPattern + 1) % Object.keys(PATTERNS).length;
      
      // Calculate target positions for new pattern
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        let targetPos;
        
        switch(nextPattern) {
          case PATTERNS.CUBE:
            targetPos = positionInCube(i);
            break;
          case PATTERNS.SPHERE:
            targetPos = positionInSphere(i);
            break;
          case PATTERNS.TORNADO:
            targetPos = positionInTornado(i);
            break;
          case PATTERNS.EXPLOSION:
            targetPos = positionInExplosion(i);
            break;
          case PATTERNS.GRID:
            targetPos = positionInGrid(i);
            break;
          case PATTERNS.WAVE:
            targetPos = positionInWave(i);
            break;
          default:
            targetPos = positionInCube(i);
        }
      }
    }
    
    // Camera follows mouse subtly
    camera.position.x += (mouse.x * CUBE_SIZE - camera.position.x) * 0.01;
    camera.position.y += (mouse.y * CUBE_SIZE / 2 - camera.position.y) * 0.01;
    camera.lookAt(scene.position);
    
    // Rotate entire particle system
    particleSystem.rotation.y = time * 0.1;
    particleSystem.rotation.x = Math.sin(time * 0.05) * 0.2;
    
    // Update particle positions and colors
    const positions = particleGeometry.attributes.position.array;
    const colors = particleGeometry.attributes.color.array;
    const sizes = particleGeometry.attributes.size.array;
    const phases = particleGeometry.attributes.phase.array;
    
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Update position based on pattern morphing
      if (currentPattern !== nextPattern) {
        positions[i * 3] = originalPositions[i * 3] * (1 - morphProgress) + 
                           targetPositions[i * 3] * morphProgress;
        positions[i * 3 + 1] = originalPositions[i * 3 + 1] * (1 - morphProgress) + 
                               targetPositions[i * 3 + 1] * morphProgress;
        positions[i * 3 + 2] = originalPositions[i * 3 + 2] * (1 - morphProgress) + 
                               targetPositions[i * 3 + 2] * morphProgress;
      } 
      else {
        // Add subtle motion even when in stable pattern
        const noiseScale = 0.1;
        const noise1 = Math.sin(time + phases[i]) * noiseScale;
        const noise2 = Math.sin(time * 0.7 + phases[i] * 2) * noiseScale;
        const noise3 = Math.sin(time * 0.5 + phases[i] * 0.8) * noiseScale;
        
        // Apply the noise to positions
        positions[i * 3] += noise1;
        positions[i * 3 + 1] += noise2;
        positions[i * 3 + 2] += noise3;
      }
    }
    
    // Update colors based on time with improved transitions
    const timeHue = (time * 0.05) % 1;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Create a flowing color pattern based on position and time
      const distanceFromCenter = Math.sqrt(
        Math.pow(positions[i * 3], 2) + 
        Math.pow(positions[i * 3 + 1], 2) + 
        Math.pow(positions[i * 3 + 2], 2)
      ) / CUBE_SIZE;
      
      // Create a more dynamic color range that shifts through the spectrum
      const hue = (0.6 + timeHue + distanceFromCenter * 0.3) % 1.0;
      const saturation = 0.7 + Math.sin(time * 0.2 + phases[i]) * 0.3;
      const lightness = 0.5 + Math.cos(time * 0.3 + phases[i]) * 0.2;
      
      const color = new THREE.Color();
      color.setHSL(hue, saturation, lightness);
      
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
      
      // Pulse size
      const pulseFactor = 1 + Math.sin(time * 2 + phases[i]) * 0.3;
      sizes[i] = (MIN_PARTICLE_SIZE + Math.random() * (MAX_PARTICLE_SIZE - MIN_PARTICLE_SIZE)) * pulseFactor;
    }
  
    // Animate point light with more vibrant colors
    pointLight.position.x = Math.sin(time * 0.5) * CUBE_SIZE;
    pointLight.position.y = Math.cos(time * 0.7) * CUBE_SIZE;
    pointLight.position.z = Math.sin(time * 0.3) * CUBE_SIZE + CUBE_SIZE;
    
    // Change light color with complementary hues for more contrast
    const lightHue = (time * 0.1 + 0.5) % 1; // Offset from particle colors
    const lightColor = new THREE.Color();
    lightColor.setHSL(lightHue, 0.9, 0.6); // More saturated and brighter
    pointLight.color = lightColor;
    
    // Update geometry attributes that have changed
    particleGeometry.attributes.position.needsUpdate = true;
    particleGeometry.attributes.color.needsUpdate = true;
    particleGeometry.attributes.size.needsUpdate = true;
    
    renderer.render(scene, camera);
  }

  // Start animation
  animate();
} else {
  // Simple coding animation for mobile devices
  const mobileAnimation = document.createElement('div');
  mobileAnimation.className = 'mobile-animation';
  
  const codeContainer = document.createElement('div');
  codeContainer.className = 'code-container';
  
  // Sample code lines - using more compact code for better mobile display
  const codeLines = [
    'function createMobileAnim() {',
    '  let elements = [];',
    '  ',
    '  // Generate particles',
    '  for (let i = 0; i < 50; i++) {',
    '    const el = document.createElement("div");',
    '    el.style.color = "#64ffda";',
    '    el.classList.add("particle");',
    '    elements.push(el);',
    '  }',
    '  ',
    '  return elements;',
    '}',
    '',
    'const anim = createMobileAnim();',
    'anim.start();'
  ];
  
  mobileAnimation.appendChild(codeContainer);
  
  // Insert after H2 tag
  const h2Element = document.querySelector('h2');
  if (h2Element && h2Element.parentNode) {
    h2Element.parentNode.insertBefore(mobileAnimation, h2Element.nextSibling);
  } else {
    // Fallback if H2 not found
    document.body.appendChild(mobileAnimation);
  }
  
  // Display code lines with a typing effect
  let delay = 0;
  codeLines.forEach((line, index) => {
    const codeLine = document.createElement('pre');
    codeLine.className = 'code-line';
    codeLine.textContent = line;
    codeLine.style.animation = `fadeIn 0.5s ease forwards ${delay}s, typing 1.5s steps(40, end) ${delay}s forwards`;
    
    codeContainer.appendChild(codeLine);
    delay += 0.3; // Faster delay between lines for mobile
  });
  
  // Display the animation
  mobileAnimation.style.display = 'block';
}

// Add this to your existing JavaScript file

// Navbar scroll effect
document.addEventListener('DOMContentLoaded', function() {
  window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
      navbar.classList.add('navbar-scrolled');
    } else {
      navbar.classList.remove('navbar-scrolled');
    }
  });
  
  // Set active class based on current page
  const currentLocation = window.location.pathname;
  const navLinks = document.querySelectorAll('.navbar .nav-links li a');
  
  navLinks.forEach(link => {
    const linkPath = link.getAttribute('href');
    if (linkPath === currentLocation || 
        (linkPath === '/' && currentLocation === '/index.html') ||
        (currentLocation.includes(linkPath) && linkPath !== '/')) {
      link.classList.add('active');
    }
  });
});
// Add this to your existing JavaScript file

document.addEventListener('DOMContentLoaded', function() {
  const hamburger = document.createElement('div');
  hamburger.classList.add('hamburger');
  hamburger.innerHTML = '<span></span><span></span><span></span>';
  
  const navbar = document.querySelector('.navbar');
  const navLinks = document.querySelector('.nav-links');
  
  navbar.insertBefore(hamburger, navLinks);
  
  hamburger.addEventListener('click', function() {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
    document.body.classList.toggle('menu-open');
  });
  
  // Close mobile menu when clicking a link
  document.querySelectorAll('.nav-links li a').forEach(link => {
    link.addEventListener('click', function() {
      hamburger.classList.remove('active');
      navLinks.classList.remove('active');
      document.body.classList.remove('menu-open');
    });
  });
});