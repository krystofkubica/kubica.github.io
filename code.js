document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('codeCanvas');
    const ctx = canvas.getContext('2d');
    
    const resizeCanvas = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    const colors = ['#64ffda', '#00bcd4', '#6200ea', '#3d5afe'];
    const codeSymbols = ['{ }', '[ ]', '( )', '//', '/*', '*/', ';', '=', '==', '=>', 'const', 'let', 'function', '<div>', '</div>'];
    
    let mouse = {
        x: null,
        y: null,
        radius: 150
    };
    
    window.addEventListener('mousemove', (event) => {
        mouse.x = event.x;
        mouse.y = event.y;
    });
    
    window.addEventListener('mouseout', () => {
        mouse.x = null;
        mouse.y = null;
    });
    
    class Particle {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.size = Math.random() * 3 + 1;
            this.baseX = this.x;
            this.baseY = this.y;
            this.density = (Math.random() * 30) + 1;
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.opacity = Math.random() * 0.6 + 0.2;
            
            this.hasText = Math.random() > 0.97;
            if (this.hasText) {
                this.text = codeSymbols[Math.floor(Math.random() * codeSymbols.length)];
                this.textOpacity = 0;
                this.textFadeIn = true;
                this.textFadeSpeed = Math.random() * 0.02 + 0.005;
            }
        }
        
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.globalAlpha = this.opacity;
            ctx.fill();
            ctx.globalAlpha = 1;
            
            if (this.hasText && this.textOpacity > 0) {
                ctx.font = '12px monospace';
                ctx.fillStyle = this.color;
                ctx.globalAlpha = this.textOpacity;
                ctx.fillText(this.text, this.x + 10, this.y);
                ctx.globalAlpha = 1;
            }
        }
        
        update() {
            if (mouse.x && mouse.y) {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < mouse.radius) {
                    const forceDirectionX = dx / distance;
                    const forceDirectionY = dy / distance;
                    const force = (mouse.radius - distance) / mouse.radius;
                    
                    const directionX = forceDirectionX * force * this.density * -1;
                    const directionY = forceDirectionY * force * this.density * -1;
                    
                    this.x += directionX;
                    this.y += directionY;
                }
            }
            
            const dx = this.baseX - this.x;
            const dy = this.baseY - this.y;
            
            this.x += dx * 0.05;
            this.y += dy * 0.05;
            
            if (this.hasText) {
                if (this.textFadeIn) {
                    this.textOpacity += this.textFadeSpeed;
                    if (this.textOpacity >= 0.7) {
                        this.textFadeIn = false;
                    }
                } else {
                    this.textOpacity -= this.textFadeSpeed;
                    if (this.textOpacity <= 0) {
                        this.textFadeIn = true;
                        if (Math.random() > 0.7) {
                            this.text = codeSymbols[Math.floor(Math.random() * codeSymbols.length)];
                        }
                    }
                }
            }
        }
    }
    
    let particles = [];
    
    const init = () => {
        particles = [];
        const numberOfParticles = Math.min(Math.floor(canvas.width * canvas.height / 8000), 300);
        
        for (let i = 0; i < numberOfParticles; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            particles.push(new Particle(x, y));
        }
    };
    
    const connect = () => {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 150) {
                    ctx.beginPath();
                    ctx.strokeStyle = particles[i].color;
                    ctx.globalAlpha = (150 - distance) / 1500;
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                    ctx.globalAlpha = 1;
                }
            }
        }
    };
    
    const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
        
        connect();
        requestAnimationFrame(animate);
    };
    
    init();
    animate();
    
    const navbarToggle = document.querySelector('.navbar-toggle');
    const navbarLinks = document.querySelector('.navbar-links');
    
    navbarToggle.addEventListener('click', () => {
        navbarLinks.classList.toggle('active');
    });
    
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.classList.add('navbar-scrolled');
        } else {
            navbar.classList.remove('navbar-scrolled');
        }
    });
    
    const scrollToAbout = function(e) {
        if (e) e.preventDefault();
        const target = document.getElementById('aboutMe');
        const offset = 100; 
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
        
        if (navbarLinks.classList.contains('active')) {
            navbarLinks.classList.remove('active');
        }
    };
    
    const scrollToSkills = function(e) {
        if (e) e.preventDefault();
        const target = document.getElementById('skills');
        if (!target) {
            console.error('Skills section not found with ID "skills"');
            return;
        }
        const offset = 100; 
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
        
        if (navbarLinks.classList.contains('active')) {
            navbarLinks.classList.remove('active');
        }
    };

    const scrollToProjects = function(e) {
        if (e) e.preventDefault();
        const target = document.getElementById('projects');
        if (!target) {
            console.error('Projects section not found with ID "projects"');
            return;
        }
        const offset = 100; 
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
        
        if (navbarLinks.classList.contains('active')) {
            navbarLinks.classList.remove('active');
        }
    };
    
    // Add new scroll to contact function
    const scrollToContact = function(e) {
        if (e) e.preventDefault();
        const target = document.getElementById('contact');
        if (!target) {
            console.error('Contact section not found with ID "contact"');
            return;
        }
        const offset = 100; 
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
        
        if (navbarLinks.classList.contains('active')) {
            navbarLinks.classList.remove('active');
        }
    };

    const aboutNavLink = document.querySelector('.navbar-links a[href="#about"]');
    if (aboutNavLink) {
        aboutNavLink.addEventListener('click', scrollToAbout);
    }

    const skillsNavLink = document.querySelector('.navbar-links a[href="#skills"]');
    if (skillsNavLink) {
        skillsNavLink.addEventListener('click', scrollToSkills);
    }
    
    const projectsNavLink = document.querySelector('.navbar-links a[href="#projects"]');
    if (projectsNavLink) {
        projectsNavLink.addEventListener('click', scrollToProjects);
    }
    
    const learnMoreBtn = document.getElementById('learnMoreBtn');
    if (learnMoreBtn) {
        learnMoreBtn.addEventListener('click', scrollToAbout);
    }
    
    const homeNavLink = document.querySelector('.navbar-links a[href="#home"]');
    if (homeNavLink) {
        homeNavLink.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            
            if (navbarLinks.classList.contains('active')) {
                navbarLinks.classList.remove('active');
            }
        });
    }
    
    // Add contact nav link event listener
    const contactNavLink = document.querySelector('.navbar-links a[href="#contact"]');
    if (contactNavLink) {
        contactNavLink.addEventListener('click', scrollToContact);
    }
    
    // Initialize contact section animations
    animateContactSection();
    
    // Initialize contact particles when scrolling near the contact section
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                initContactParticles();
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    const contactSection = document.getElementById('contact');
    if (contactSection) {
        observer.observe(contactSection);
    }
});

// Contact section animations
function animateContactSection() {
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('contact-visible');
                
                // Stagger animations for contact links
                const links = entry.target.querySelectorAll('.contact-link');
                links.forEach((link, index) => {
                    setTimeout(() => {
                        link.classList.add('contact-link-visible');
                    }, 300 * (index + 1));
                });
                
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });
    
    const contactSection = document.getElementById('contact');
    if (contactSection) {
        observer.observe(contactSection);
    }
}

// Add to the end of your code.js file
function initContactParticles() {
    const container = document.getElementById('contactParticles');
    if (!container) return;
    
    const colors = ['#64ffda', '#00bcd4', '#6200ea', '#3d5afe'];
    const particleCount = 30;
    const particles = [];
    
    class ContactParticle {
        constructor() {
            this.x = Math.random() * container.offsetWidth;
            this.y = Math.random() * container.offsetHeight;
            this.size = Math.random() * 5 + 1;
            this.speedX = Math.random() * 2 - 1;
            this.speedY = Math.random() * 2 - 1;
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.alpha = Math.random() * 0.5 + 0.1;
            this.element = document.createElement('div');
            this.element.className = 'contact-particle';
            this.element.style.cssText = `
                position: absolute;
                width: ${this.size}px;
                height: ${this.size}px;
                background-color: ${this.color};
                border-radius: 50%;
                opacity: ${this.alpha};
                top: ${this.y}px;
                left: ${this.x}px;
                pointer-events: none;
                box-shadow: 0 0 ${this.size * 2}px ${this.color};
            `;
            container.appendChild(this.element);
        }
        
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            
            // Bounce off edges
            if (this.x < 0 || this.x > container.offsetWidth) this.speedX *= -1;
            if (this.y < 0 || this.y > container.offsetHeight) this.speedY *= -1;
            
            this.element.style.left = `${this.x}px`;
            this.element.style.top = `${this.y}px`;
        }
    }
    
    // Create particles
    for (let i = 0; i < particleCount; i++) {
        particles.push(new ContactParticle());
    }
    
    // Animation loop
    function animate() {
        particles.forEach(p => p.update());
        requestAnimationFrame(animate);
    }
    
    animate();
}
