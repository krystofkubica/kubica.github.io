// Navigation functionality
const navSlide = () => {
    const burger = document.querySelector('.burger');
    const nav = document.querySelector('.nav-links');
    const navLinks = document.querySelectorAll('.nav-links li');
    const body = document.body;
    
    if (!burger || !nav) {
        console.error('Navbar elements not found!');
        return;
    }

    // Debug to check if elements are found
    console.log('Burger found:', burger);
    console.log('Nav links found:', nav);

    burger.addEventListener('click', () => {
        console.log('Burger clicked!');
        
        // Toggle Nav
        nav.classList.toggle('nav-active');
        
        // Toggle body class to prevent scrolling when menu is open
        body.classList.toggle('menu-open');

        // Animate Links
        navLinks.forEach((link, index) => {
            if (link.style.animation) {
                link.style.animation = '';
            } else {
                link.style.animation = `navLinkFade 0.5s ease forwards ${index / 7 + 0.3}s`;
            }
        });

        // Burger Animation
        burger.classList.toggle('toggle');
    });
    
    // Close menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (nav.classList.contains('nav-active')) {
                nav.classList.remove('nav-active');
                body.classList.remove('menu-open');
                burger.classList.remove('toggle');
                
                navLinks.forEach(link => {
                    link.style.animation = '';
                });
            }
        });
    });
};

// Scroll effects
const handleScroll = () => {
    const navbar = document.querySelector('.navbar');
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links a');
    
    window.addEventListener('scroll', () => {
        // Sticky navbar
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        // Active menu item based on scroll position
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (pageYOffset >= (sectionTop - 300)) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').substring(1) === current) {
                link.classList.add('active');
            }
        });
    });
};

// Blog posts data
const blogPosts = [
    {
        id: 1,
        title: "Getting Started with Web Development",
        excerpt: "My journey into the world of web development and the key concepts I learned along the way.",
        date: "February 15, 2025",
        category: "Coding"
    },
    {
        id: 2,
        title: "The Role of AI in Modern Development",
        excerpt: "How artificial intelligence is changing the way we approach programming challenges.",
        date: "January 28, 2025",
        category: "AI"
    },
    {
        id: 3,
        title: "Finding Inspiration in Nature",
        excerpt: "How my outdoor adventures inspire better programming solutions.",
        date: "January 5, 2025",
        category: "Nature"
    },
    {
        id: 4,
        title: "ChatGPT 4.5: Revolutionizing Creative Workflows",
        excerpt: "Exploring how the latest AI model is transforming content creation, coding, and problem-solving processes.",
        date: "February 28, 2025",
        category: "AI"
    }
];

// Load blog posts
const loadBlogPosts = () => {
    const blogContainer = document.getElementById('blogPosts');
    if (!blogContainer) return;
    
    blogContainer.innerHTML = '';
    
    blogPosts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.className = 'blog-card';
        
        const categoryIcons = {
            'Coding': 'fas fa-code',
            'AI': 'fas fa-robot',
            'Nature': 'fas fa-leaf',
            'Cats': 'fas fa-cat'
        };
        
        const iconClass = categoryIcons[post.category] || 'fas fa-pen';
        
        // Create a URL-friendly slug from the post title
        const slug = post.title.toLowerCase().replace(/[^\w\s]/gi, '').replace(/\s+/g, '-');
        
        postElement.innerHTML = `
            <div class="blog-card-img">
                <div><i class="${iconClass}"></i></div>
            </div>
            <div class="blog-card-content">
                <div class="blog-card-date">${post.date} • ${post.category}</div>
                <h3>${post.title}</h3>
                <p>${post.excerpt}</p>
                <a href="blog-post.html?id=${post.id}" class="blog-card-link">Read More <i class="fas fa-arrow-right"></i></a>
            </div>
        `;
        
        blogContainer.appendChild(postElement);
    });
};

// Contact form functionality with EmailJS
const handleContactForm = () => {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;
    
    // Add EmailJS script to the document
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js';
    document.head.appendChild(script);
    
    script.onload = () => {
        // Initialize EmailJS with your public key
        emailjs.init("4iSs5WdiCnNhsf8ajsdA");
        console.log("EmailJS initialized successfully!");
    };
    
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form data
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const message = document.getElementById('message').value;
        
        // Validate form data
        if (!name || !email || !message) {
            alert("Please fill in all required fields.");
            return;
        }
        
        // Update button state
        const submitButton = contactForm.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.innerHTML;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitButton.disabled = true;
        
        // Clear any existing messages
        const existingMessages = contactForm.querySelectorAll('.form-message');
        existingMessages.forEach(msg => msg.remove());
        
        // Prepare form data
        const formData = {
            name: name,
            email: email,
            message: message,
            // Include current date and time
            date: new Date().toLocaleString()
        };
        
        console.log("Sending email with data:", formData);
        
        // Send the email using EmailJS
        emailjs.send('serviceone', 'template_aaaabbs', formData)
            .then((response) => {
                console.log('SUCCESS!', response.status, response.text);
                contactForm.reset();
                
                // Create and show success message
                const successMessage = document.createElement('div');
                successMessage.className = 'form-success form-message';
                successMessage.innerHTML = `
                    <i class="fas fa-check-circle"></i>
                    <h4>Message Sent Successfully!</h4>
                    <p>Thank you ${name}, your message has been delivered to my inbox. I'll get back to you soon.</p>
                `;
                contactForm.appendChild(successMessage);
                
                // Reset button
                submitButton.innerHTML = originalButtonText;
                submitButton.disabled = false;
                
                // Remove success message after 7 seconds
                setTimeout(() => {
                    if (successMessage.parentNode) {
                        successMessage.classList.add('fade-out');
                        setTimeout(() => successMessage.remove(), 1000);
                    }
                }, 7000);
            })
            .catch((error) => {
                console.error('FAILED...', error);
                
                // Create and show error message
                const errorMessage = document.createElement('div');
                errorMessage.className = 'form-error form-message';
                errorMessage.innerHTML = `
                    <i class="fas fa-exclamation-circle"></i>
                    <h4>Message Could Not Be Sent</h4>
                    <p>Sorry, there was a problem sending your message. Please try again or contact me directly at kkubica912@gmail.com</p>
                    <p>Error: ${error.text || 'Unknown error'}</p>
                `;
                contactForm.appendChild(errorMessage);
                
                // Reset button
                submitButton.innerHTML = originalButtonText;
                submitButton.disabled = false;
            });
    });
};

// Initialize all functions when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing navigation');
    navSlide();
    handleScroll();
    loadBlogPosts();
    handleContactForm();
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 70, // Adjust for navbar height
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                const nav = document.querySelector('.nav-links');
                const burger = document.querySelector('.burger');
                if (nav.classList.contains('nav-active')) {
                    nav.classList.remove('nav-active');
                    burger.classList.remove('toggle');
                }
            }
        });
    });
    
    // Load more posts button
    const loadMoreBtn = document.getElementById('loadMorePosts');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            alert('More posts feature will be implemented soon!');
        });
    }
});