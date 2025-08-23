// Carousel functionality
class HeroCarousel {
    constructor() {
        this.currentSlide = 0;
        this.slides = document.querySelectorAll('.carousel-slide');
        this.dots = document.querySelectorAll('.dot');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.autoPlayInterval = null;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.startAutoPlay();
    }
    
    setupEventListeners() {
        this.prevBtn.addEventListener('click', () => this.prevSlide());
        this.nextBtn.addEventListener('click', () => this.nextSlide());
        
        this.dots.forEach((dot, index) => {
            dot.addEventListener('click', () => this.goToSlide(index));
        });
        
        // Pause autoplay on hover
        const carousel = document.querySelector('.hero-carousel');
        carousel.addEventListener('mouseenter', () => this.stopAutoPlay());
        carousel.addEventListener('mouseleave', () => this.startAutoPlay());
    }
    
    goToSlide(index) {
        // Remove active class from current slide and dot
        this.slides[this.currentSlide].classList.remove('active');
        this.dots[this.currentSlide].classList.remove('active');
        
        // Update current slide
        this.currentSlide = index;
        
        // Add active class to new slide and dot
        this.slides[this.currentSlide].classList.add('active');
        this.dots[this.currentSlide].classList.add('active');
    }
    
    nextSlide() {
        const nextIndex = (this.currentSlide + 1) % this.slides.length;
        this.goToSlide(nextIndex);
    }
    
    prevSlide() {
        const prevIndex = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
        this.goToSlide(prevIndex);
    }
    
    startAutoPlay() {
        this.autoPlayInterval = setInterval(() => {
            this.nextSlide();
        }, 4000); // Change slide every 4 seconds
    }
    
    stopAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }
}

// Mobile Navigation
const hamburger = document.querySelector('.hamburger');
const mobileNavMenu = document.querySelector('.mobile-nav-menu');
const mobileNavClose = document.querySelector('.mobile-nav-close');

hamburger.addEventListener('click', () => {
    mobileNavMenu.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
});

mobileNavClose.addEventListener('click', () => {
    mobileNavMenu.classList.remove('active');
    document.body.style.overflow = 'auto'; // Restore scrolling
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.mobile-nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        mobileNavMenu.classList.remove('active');
        document.body.style.overflow = 'auto';
    });
});

// Close mobile menu when clicking outside
mobileNavMenu.addEventListener('click', (e) => {
    if (e.target === mobileNavMenu) {
        mobileNavMenu.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
});

// Calendar sync functionality
const CALENDAR_URLS = {
    outdoorsy: 'https://api.outdoorsy.com/v0/ics-export.ics?rental_id=443126&t=8edf7d71-6cc3-43e2-8d46-82deb22e3307',
    rvezy: 'https://api.rvezy.com/api/v3/calendars/2b4ad3f5d55e40b484ca0e71e57f1f6f',
    rvshare: 'https://api.rvshare.com/v1/ical/QO5rkXLj7odJjvP3P4EdblBp'
};

let blockedDates = new Set();

// Function to fetch calendar data using a proxy to avoid CORS issues
async function fetchCalendarData() {
    const allBlockedDates = new Set();
    
    for (const [platform, url] of Object.entries(CALENDAR_URLS)) {
        try {
            // Use a CORS proxy service
            const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
            const response = await fetch(proxyUrl);
            const icalData = await response.text();
            
            const dates = parseICalData(icalData);
            dates.forEach(date => allBlockedDates.add(date));
            
            console.log(`Loaded ${dates.length} blocked dates from ${platform}`);
        } catch (error) {
            console.error(`Error fetching calendar from ${platform}:`, error);
        }
    }
    
    blockedDates = allBlockedDates;
    generateDualCalendar(); // Refresh calendar display
}

// Parse iCal data to extract blocked date ranges
function parseICalData(icalData) {
    const dates = [];
    const lines = icalData.split('\n');
    let currentEvent = {};
    
    for (let line of lines) {
        line = line.trim();
        
        if (line === 'BEGIN:VEVENT') {
            currentEvent = {};
        } else if (line === 'END:VEVENT') {
            if (currentEvent.start && currentEvent.end) {
                const dateRange = getDateRange(currentEvent.start, currentEvent.end);
                dates.push(...dateRange);
            }
        } else if (line.startsWith('DTSTART')) {
            const dateMatch = line.match(/(\d{8})/);
            if (dateMatch) {
                currentEvent.start = parseICalDate(dateMatch[1]);
            }
        } else if (line.startsWith('DTEND')) {
            const dateMatch = line.match(/(\d{8})/);
            if (dateMatch) {
                currentEvent.end = parseICalDate(dateMatch[1]);
            }
        }
    }
    
    return dates;
}

// Parse iCal date format (YYYYMMDD) to Date object
function parseICalDate(dateString) {
    const year = parseInt(dateString.substr(0, 4));
    const month = parseInt(dateString.substr(4, 2)) - 1; // Month is 0-indexed
    const day = parseInt(dateString.substr(6, 2));
    return new Date(year, month, day);
}

// Get all dates in a range
function getDateRange(startDate, endDate) {
    const dates = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
        dates.push(currentDate.toDateString());
        currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dates;
}

// Check if a date is blocked
function isDateBlocked(date) {
    return blockedDates.has(date.toDateString());
}

// Thumbnail carousel functionality
document.addEventListener('DOMContentLoaded', () => {
    const mainImage = document.getElementById('mainImage');
    const thumbnails = document.querySelectorAll('.thumbnail');
    const track = document.querySelector('.thumbnail-track');
    const prevBtn = document.querySelector('.carousel-prev');
    const nextBtn = document.querySelector('.carousel-next');
    
    let currentPosition = 0;
    const thumbnailWidth = 120; // Width of each thumbnail
    const gap = 8; // Gap between thumbnails
    const visibleThumbnails = Math.floor((track.parentElement.offsetWidth - 80) / (thumbnailWidth + gap)); // Account for arrow buttons
    
    // Initialize carousel
    function initCarousel() {
        updateArrowStates();
        centerActiveThumbnail();
        
        // Set initial CSS variable for blur effect
        const activeThumbnail = document.querySelector('.thumbnail.active');
        if (activeThumbnail && mainImage) {
            const mainImageContainer = mainImage.closest('.main-image');
            if (mainImageContainer) {
                mainImageContainer.style.setProperty('--current-image', `url('${activeThumbnail.dataset.src}')`);
            }
        }
    }
    
    // Update arrow states
    function updateArrowStates() {
        prevBtn.disabled = currentPosition <= 0;
        nextBtn.disabled = currentPosition >= thumbnails.length - visibleThumbnails;
    }
    
    // Center the active thumbnail
    function centerActiveThumbnail() {
        const activeThumbnail = document.querySelector('.thumbnail.active');
        if (activeThumbnail) {
            const activeIndex = Array.from(thumbnails).indexOf(activeThumbnail);
            const targetPosition = Math.max(0, Math.min(activeIndex - Math.floor(visibleThumbnails / 2), thumbnails.length - visibleThumbnails));
            currentPosition = targetPosition;
            updateCarouselPosition();
        }
    }
    
    // Update carousel position
    function updateCarouselPosition() {
        const translateX = -(currentPosition * (thumbnailWidth + gap));
        track.style.transform = `translateX(${translateX}px)`;
        updateArrowStates();
    }
    
    // Navigation functions
    function nextSlide() {
        if (currentPosition < thumbnails.length - visibleThumbnails) {
            currentPosition++;
            updateCarouselPosition();
        }
    }
    
    function prevSlide() {
        if (currentPosition > 0) {
            currentPosition--;
            updateCarouselPosition();
        }
    }
    
    // Event listeners
    prevBtn.addEventListener('click', prevSlide);
    nextBtn.addEventListener('click', nextSlide);
    
    // Thumbnail click functionality
    thumbnails.forEach(thumbnail => {
        thumbnail.addEventListener('click', () => {
            // Remove active class from all thumbnails
            thumbnails.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked thumbnail
            thumbnail.classList.add('active');
            
            // Update main image
            mainImage.src = thumbnail.dataset.src;
            
            // Update CSS variable for blur effect
            const mainImageContainer = mainImage.closest('.main-image');
            if (mainImageContainer) {
                mainImageContainer.style.setProperty('--current-image', `url('${thumbnail.dataset.src}')`);
            }
            
            // Center the clicked thumbnail
            centerActiveThumbnail();
        });
    });
    
    // Initialize on load
    initCarousel();
    
    // Handle window resize
    window.addEventListener('resize', () => {
        initCarousel();
    });
});

// Calendar functionality
class BookingCalendar {
    constructor() {
        this.currentDate = new Date();
        this.selectedStartDate = null;
        this.selectedEndDate = null;
        this.dailyRate = 227;
        this.bookedDates = [];
        this.calendarUrls = {
            outdoorsy: 'https://api.outdoorsy.com/v0/ics-export.ics?rental_id=443126&t=8edf7d71-6cc3-43e2-8d46-82deb22e3307',
            rvezy: 'https://api.rvezy.com/api/v3/calendars/2b4ad3f5d55e40b484ca0e71e57f1f6f',
            rvshare: 'https://api.rvshare.com/v1/ical/QO5rkXLj7odJjvP3P4EdblBp'
        };
        
        this.init();
    }
    
    async init() {
        await this.syncCalendars();
        this.renderCalendar();
        this.setupEventListeners();
    }

    async syncCalendars() {
        try {
            // Fetch calendar data from all platforms
            const promises = Object.values(this.calendarUrls).map(url => 
                fetch(url).then(response => response.text()).catch(() => '')
            );
            
            const results = await Promise.all(promises);
            
            // Parse ICS files and extract booked dates
            results.forEach(icsData => {
                if (icsData) {
                    const dates = this.parseICSData(icsData);
                    this.bookedDates.push(...dates);
                }
            });
            
            // Remove duplicates
            this.bookedDates = [...new Set(this.bookedDates)];
            
        } catch (error) {
            console.log('Calendar sync failed, using default dates');
            // Fallback to some default booked dates
            this.bookedDates = [
                '2025-08-01', '2025-08-02', '2025-08-03', '2025-08-04', '2025-08-05', '2025-08-06',
                '2025-08-07', '2025-08-08', '2025-08-09', '2025-08-10', '2025-08-11', '2025-08-12',
                '2025-08-13', '2025-08-14', '2025-08-15', '2025-08-16', '2025-08-17', '2025-08-18',
                '2025-08-19', '2025-08-20', '2025-08-21', '2025-08-22', '2025-08-23', '2025-08-24',
                '2025-08-25', '2025-08-26', '2025-08-27', '2025-08-28', '2025-08-29', '2025-08-30',
                '2025-08-31',
                '2025-09-01', '2025-09-02', '2025-09-03', '2025-09-04', '2025-09-05', '2025-09-06',
                '2025-09-12', '2025-09-13',
                '2025-09-19', '2025-09-20',
                '2025-09-26', '2025-09-27'
            ];
        }
    }

    parseICSData(icsData) {
        const dates = [];
        const lines = icsData.split('\n');
        let currentEvent = {};
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            if (line.startsWith('BEGIN:VEVENT')) {
                currentEvent = {};
            } else if (line.startsWith('DTSTART:')) {
                const dateStr = line.substring(8);
                const date = this.parseICSDate(dateStr);
                if (date) {
                    currentEvent.start = date;
                }
            } else if (line.startsWith('DTEND:')) {
                const dateStr = line.substring(6);
                const date = this.parseICSDate(dateStr);
                if (date) {
                    currentEvent.end = date;
                }
            } else if (line.startsWith('END:VEVENT')) {
                if (currentEvent.start && currentEvent.end) {
                    // Add all dates between start and end
                    const start = new Date(currentEvent.start);
                    const end = new Date(currentEvent.end);
                    
                    for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
                        dates.push(d.toISOString().split('T')[0]);
                    }
                }
            }
        }
        
        return dates;
    }

    parseICSDate(dateStr) {
        // Handle different ICS date formats
        if (dateStr.includes('T')) {
            // Format: 20250801T120000Z
            const year = dateStr.substring(0, 4);
            const month = dateStr.substring(4, 6);
            const day = dateStr.substring(6, 8);
            return `${year}-${month}-${day}`;
        } else {
            // Format: 20250801
            const year = dateStr.substring(0, 4);
            const month = dateStr.substring(4, 6);
            const day = dateStr.substring(6, 8);
            return `${year}-${month}-${day}`;
        }
    }
    
    renderCalendar() {
        const calendar1 = document.getElementById('calendar1');
        const calendar2 = document.getElementById('calendar2');
        const currentMonth1El = document.getElementById('currentMonth1');
        const currentMonth2El = document.getElementById('currentMonth2');
        
        const year = this.currentDate.getFullYear();
        const month1 = this.currentDate.getMonth();
        const month2 = this.currentDate.getMonth() + 1;
        
        currentMonth1El.textContent = new Date(year, month1).toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric'
        });
        
        currentMonth2El.textContent = new Date(year, month2).toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric'
        });
        
        // Render both months
        this.renderMonth(calendar1, year, month1);
        this.renderMonth(calendar2, year, month2);
    }
    
    renderMonth(calendar, year, month) {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());
        
        let calendarHTML = '';
        
        // Add day headers
        const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
        daysOfWeek.forEach(day => {
            calendarHTML += `<div class="calendar-day header">${day}</div>`;
        });
        
        // Add calendar days
        for (let i = 0; i < 42; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);
            
            const dateString = currentDate.toISOString().split('T')[0];
            const isCurrentMonth = currentDate.getMonth() === month;
            const isBooked = this.bookedDates.includes(dateString);
            const isSelected = this.isDateSelected(dateString);
            const isPast = currentDate < new Date().setHours(0, 0, 0, 0);
            
            let className = 'calendar-day';
            if (!isCurrentMonth) className += ' other-month';
            if (isBooked) className += ' booked';
            else if (isSelected) className += ' selected';
            else if (!isPast) className += ' available';
            
            calendarHTML += `
                <div class="${className}" data-date="${dateString}">
                    ${currentDate.getDate()}
                </div>
            `;
        }
        
        calendar.innerHTML = calendarHTML;
    }
    
    isDateSelected(dateString) {
        if (!this.selectedStartDate || !this.selectedEndDate) return false;
        const date = new Date(dateString);
        return date >= this.selectedStartDate && date <= this.selectedEndDate;
    }
    
    setupEventListeners() {
        // Calendar navigation
        document.getElementById('prevMonth').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.renderCalendar();
        });
        
        document.getElementById('nextMonth').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.renderCalendar();
        });
        
        // Calendar day clicks for both calendars
        document.getElementById('calendar1').addEventListener('click', (e) => {
            if (e.target.classList.contains('calendar-day') && 
                !e.target.classList.contains('header') && 
                !e.target.classList.contains('other-month') && 
                !e.target.classList.contains('booked')) {
                
                const dateString = e.target.dataset.date;
                this.handleDateSelection(dateString);
            }
        });
        
        document.getElementById('calendar2').addEventListener('click', (e) => {
            if (e.target.classList.contains('calendar-day') && 
                !e.target.classList.contains('header') && 
                !e.target.classList.contains('other-month') && 
                !e.target.classList.contains('booked')) {
                
                const dateString = e.target.dataset.date;
                this.handleDateSelection(dateString);
            }
        });
        
        // Modal close
        document.getElementById('closeModal').addEventListener('click', () => {
            this.closeBookingModal();
        });
        
        // Modal background click
        document.getElementById('bookingModal').addEventListener('click', (e) => {
            if (e.target.id === 'bookingModal') {
                this.closeBookingModal();
            }
        });
        
        // Booking form submission
        document.getElementById('bookingForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitBooking();
        });
    }
    
    handleDateSelection(dateString) {
        const selectedDate = new Date(dateString);
        
        if (!this.selectedStartDate || (this.selectedStartDate && this.selectedEndDate)) {
            // Start new selection
            this.selectedStartDate = selectedDate;
            this.selectedEndDate = null;
        } else {
            // Complete selection
            if (selectedDate > this.selectedStartDate) {
                this.selectedEndDate = selectedDate;
            } else {
                // Swap dates if end date is before start date
                this.selectedEndDate = this.selectedStartDate;
                this.selectedStartDate = selectedDate;
            }
        }
        
        this.renderCalendar();
        this.updateDateDisplay();
        this.updatePriceBreakdown();
    }

    updateDateDisplay() {
        const dateDisplay = document.getElementById('dateDisplay');
        const placeholder = document.querySelector('.date-placeholder');
        
        if (this.selectedStartDate && this.selectedEndDate) {
            const startStr = this.selectedStartDate.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
            });
            const endStr = this.selectedEndDate.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
            });
            
            if (placeholder) {
                placeholder.textContent = `${startStr} - ${endStr}`;
            }
        } else if (this.selectedStartDate) {
            const startStr = this.selectedStartDate.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
            });
            
            if (placeholder) {
                placeholder.textContent = `${startStr} - Select end date`;
            }
        } else {
            if (placeholder) {
                placeholder.textContent = 'Select your dates';
            }
        }
    }

    updatePriceBreakdown() {
        const breakdown = document.getElementById('priceBreakdown');
        const duration = document.getElementById('duration');
        const totalPrice = document.getElementById('totalPrice');
        
        if (this.selectedStartDate && this.selectedEndDate) {
            const diffTime = Math.abs(this.selectedEndDate - this.selectedStartDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            const total = diffDays * this.dailyRate;
            
            duration.textContent = `${diffDays} nights`;
            totalPrice.textContent = `$${total.toLocaleString()}`;
            breakdown.style.display = 'block';
        } else {
            breakdown.style.display = 'none';
        }
    }

    handleBooking() {
        if (!this.selectedStartDate || !this.selectedEndDate) {
            alert('Please select your dates first');
            return;
        }
        
        this.openBookingModal();
    }

    openBookingModal() {
        const modal = document.getElementById('bookingModal');
        const checkIn = document.getElementById('modalCheckIn');
        const checkOut = document.getElementById('modalCheckOut');
        const guests = document.getElementById('modalGuests');
        const total = document.getElementById('modalTotal');
        
        // Populate modal with booking details
        checkIn.textContent = this.selectedStartDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        checkOut.textContent = this.selectedEndDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        guests.textContent = document.getElementById('guestCount').value + ' guests';
        
        const diffTime = Math.abs(this.selectedEndDate - this.selectedStartDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        const totalPrice = diffDays * this.dailyRate;
        total.textContent = `$${totalPrice.toLocaleString()}`;
        
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    closeBookingModal() {
        const modal = document.getElementById('bookingModal');
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    async submitBooking() {
        const formData = {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            message: document.getElementById('message').value,
            checkIn: this.selectedStartDate.toISOString().split('T')[0],
            checkOut: this.selectedEndDate.toISOString().split('T')[0],
            guests: document.getElementById('guestCount').value,
            totalPrice: (() => {
                const diffTime = Math.abs(this.selectedEndDate - this.selectedStartDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                return diffDays * this.dailyRate;
            })()
        };

        try {
            // Here you would typically send the booking data to your server
            // For now, we'll simulate a successful booking
            console.log('Booking submitted:', formData);
            
            // Show success message
            alert('Booking submitted successfully! We will contact you shortly to confirm your reservation.');
            
            // Close modal and reset form
            this.closeBookingModal();
            document.getElementById('bookingForm').reset();
            
            // Add the booked dates to prevent double booking
            const start = new Date(this.selectedStartDate);
            const end = new Date(this.selectedEndDate);
            
            for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                this.bookedDates.push(d.toISOString().split('T')[0]);
            }
            
            // Reset selection and update calendar
            this.selectedStartDate = null;
            this.selectedEndDate = null;
            this.renderCalendar();
            this.updateDateDisplay();
            this.updatePriceBreakdown();
            
        } catch (error) {
            alert('There was an error submitting your booking. Please try again.');
        }
    }
}

// Initialize calendar when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    new BookingCalendar();
    
    // Features carousel functionality
    const featuresCarousel = document.querySelector('.features-carousel');
    if (featuresCarousel) {
        const slides = document.querySelectorAll('.features-slide');
        const dots = document.querySelectorAll('.dot');
        const prevBtn = document.querySelector('.features-prev');
        const nextBtn = document.querySelector('.features-next');
        
        let currentSlide = 0;
        
        function showSlide(index) {
            // Hide all slides
            slides.forEach(slide => slide.classList.remove('active'));
            dots.forEach(dot => dot.classList.remove('active'));
            
            // Show current slide
            slides[index].classList.add('active');
            dots[index].classList.add('active');
            
            // Update arrow states
            prevBtn.disabled = index === 0;
            nextBtn.disabled = index === slides.length - 1;
        }
        
        function nextSlide() {
            currentSlide = (currentSlide + 1) % slides.length;
            showSlide(currentSlide);
        }
        
        function prevSlide() {
            currentSlide = (currentSlide - 1 + slides.length) % slides.length;
            showSlide(currentSlide);
        }
        
        // Event listeners
        prevBtn.addEventListener('click', prevSlide);
        nextBtn.addEventListener('click', nextSlide);
        
        // Dot navigation
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                currentSlide = index;
                showSlide(currentSlide);
            });
        });
        
        // Initialize
        showSlide(0);
    }

    // Amenities carousel functionality
    const amenitiesCarousel = document.querySelector('.amenities-carousel');
    if (amenitiesCarousel) {
        const amenitiesSlides = document.querySelectorAll('.amenities-slide');
        const amenitiesDots = document.querySelectorAll('.amenity-dot');
        const amenitiesPrevBtn = document.querySelector('.amenities-prev');
        const amenitiesNextBtn = document.querySelector('.amenities-next');
        
        let currentAmenitySlide = 0;
        
        function showAmenitySlide(index) {
            // Hide all slides
            amenitiesSlides.forEach(slide => slide.classList.remove('active'));
            amenitiesDots.forEach(dot => dot.classList.remove('active'));
            
            // Show current slide
            amenitiesSlides[index].classList.add('active');
            amenitiesDots[index].classList.add('active');
            
            // Update arrow states
            amenitiesPrevBtn.disabled = index === 0;
            amenitiesNextBtn.disabled = index === amenitiesSlides.length - 1;
        }
        
        function nextAmenitySlide() {
            currentAmenitySlide = (currentAmenitySlide + 1) % amenitiesSlides.length;
            showAmenitySlide(currentAmenitySlide);
        }
        
        function prevAmenitySlide() {
            currentAmenitySlide = (currentAmenitySlide - 1 + amenitiesSlides.length) % amenitiesSlides.length;
            showAmenitySlide(currentAmenitySlide);
        }
        
        // Event listeners
        amenitiesPrevBtn.addEventListener('click', prevAmenitySlide);
        amenitiesNextBtn.addEventListener('click', nextAmenitySlide);
        
        // Dot navigation
        amenitiesDots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                currentAmenitySlide = index;
                showAmenitySlide(currentAmenitySlide);
            });
        });
        
        // Initialize
        showAmenitySlide(0);
    }
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Navbar scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'linear-gradient(135deg, #4a7c59 0%, #2c5530 100%)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.2)';
    } else {
        navbar.style.background = 'linear-gradient(135deg, #4a7c59 0%, #2c5530 100%)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    }
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.van-description, .host-info, .features-section, .amenities-section, .rules-section');
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Gallery image modal (optional enhancement)
document.addEventListener('DOMContentLoaded', () => {
    const galleryImages = document.querySelectorAll('.gallery-img');
    
    galleryImages.forEach(img => {
        img.addEventListener('click', () => {
            // Create modal for image viewing
            const modal = document.createElement('div');
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.9);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
                cursor: pointer;
            `;
            
            const modalImg = document.createElement('img');
            modalImg.src = img.src;
            modalImg.style.cssText = `
                max-width: 90%;
                max-height: 90%;
                object-fit: contain;
                border-radius: 10px;
            `;
            
            modal.appendChild(modalImg);
            document.body.appendChild(modal);
            
            modal.addEventListener('click', () => {
                document.body.removeChild(modal);
            });
        });
    });
});

// Interactive Calendar Functionality
let startDate = null;
let endDate = null;
let currentMonth = 7; // August (0-indexed)
let currentYear = 2025;
const pricePerNight = 227;

// Initialize calendar when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    generateDualCalendar();
});

function generateDualCalendar() {
    generateSingleMonth('calendar1', currentMonth, currentYear);
    generateSingleMonth('calendar2', currentMonth + 1, currentYear);
    updateMonthHeaders();
}

function generateSingleMonth(calendarId, month, year) {
    const calendarGrid = document.getElementById(calendarId);
    
    if (!calendarGrid) return;
    
    // Clear existing calendar
    calendarGrid.innerHTML = '';
    
    // Add day headers
    const dayHeaders = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    dayHeaders.forEach(day => {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day header';
        dayElement.textContent = day;
        dayElement.style.fontWeight = '600';
        dayElement.style.color = '#717171';
        dayElement.style.cursor = 'default';
        calendarGrid.appendChild(dayElement);
    });
    
    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day disabled';
        calendarGrid.appendChild(emptyDay);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement('div');
        const date = new Date(year, month, day);
        const today = new Date();
        
        dayElement.className = 'calendar-day';
        dayElement.textContent = day;
        
        // Check if date is in the past
        if (date < today) {
            dayElement.classList.add('past-date');
        }
        // Check if date is blocked
        else if (isDateBlocked(date)) {
            dayElement.classList.add('blocked-date');
            dayElement.title = 'This date is not available';
        }
        // Available dates
        else {
            dayElement.addEventListener('click', () => selectDate(day, dayElement, month, year));
            dayElement.addEventListener('mouseenter', () => hoverDate(day, month, year));
            dayElement.addEventListener('mouseleave', clearHoverRange);
        }
        
        calendarGrid.appendChild(dayElement);
    }
}

function updateMonthHeaders() {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
    
    const month1 = document.getElementById('month1');
    const month2 = document.getElementById('month2');
    
    if (month1) month1.textContent = `${monthNames[currentMonth]} ${currentYear}`;
    if (month2) {
        let nextMonth = currentMonth + 1;
        let nextYear = currentYear;
        if (nextMonth > 11) {
            nextMonth = 0;
            nextYear++;
        }
        month2.textContent = `${monthNames[nextMonth]} ${nextYear}`;
    }
}

function selectDate(day, element, month, year) {
    const selectedDate = new Date(year, month, day);
    
    if (!startDate || (startDate && endDate)) {
        // First selection or restart
        clearSelection();
        startDate = selectedDate;
        element.classList.add('selected');
        updateBookingSummary();
    } else if (startDate && !endDate && selectedDate > startDate) {
        // Second selection
        endDate = selectedDate;
        element.classList.add('selected');
        highlightRange();
        updateBookingSummary();
    } else {
        // If second date is before first, restart with new start date
        clearSelection();
        startDate = selectedDate;
        element.classList.add('selected');
        updateBookingSummary();
    }
    
    // Show visual indicator for mobile cross-month selection
    showMobileSelectionIndicator();
}

function hoverDate(day, month, year) {
    if (startDate && !endDate) {
        const hoverDate = new Date(year, month, day);
        if (hoverDate > startDate) {
            clearHoverRange();
            highlightHoverRange(startDate, hoverDate);
        }
    }
}

function highlightHoverRange(start, end) {
    const days = document.querySelectorAll('.calendar-day:not(.header):not(.disabled)');
    days.forEach(dayEl => {
        const day = parseInt(dayEl.textContent);
        // Get the calendar container to determine which month this day belongs to
        const calendarContainer = dayEl.closest('.month-calendar');
        const calendarId = calendarContainer.querySelector('.calendar-grid').id;
        
        let month, year;
        if (calendarId === 'calendar1') {
            month = currentMonth;
            year = currentYear;
        } else {
            month = currentMonth + 1;
            year = currentYear;
            if (month > 11) {
                month = 0;
                year++;
            }
        }
        
        const dayDate = new Date(year, month, day);
        if (dayDate > start && dayDate < end) {
            dayEl.classList.add('hover-range');
        }
    });
}

function clearHoverRange() {
    document.querySelectorAll('.hover-range').forEach(el => {
        el.classList.remove('hover-range');
    });
}

function showMobileSelectionIndicator() {
    // Clear any existing indicators
    document.querySelectorAll('.mobile-selection-indicator').forEach(el => {
        el.classList.remove('mobile-selection-indicator');
    });
    
    // Show indicator for start date if it exists and we're in selection mode
    if (startDate && !endDate) {
        const days = document.querySelectorAll('.calendar-day:not(.header):not(.disabled)');
        days.forEach(dayEl => {
            const day = parseInt(dayEl.textContent);
            if (isNaN(day)) return;
            
            // Get the calendar container to determine which month this day belongs to
            const calendarContainer = dayEl.closest('.month-calendar');
            const calendarId = calendarContainer.querySelector('.calendar-grid').id;
            
            let month, year;
            if (calendarId === 'calendar1') {
                month = currentMonth;
                year = currentYear;
            } else {
                month = currentMonth + 1;
                year = currentYear;
                if (month > 11) {
                    month = 0;
                    year++;
                }
            }
            
            const dayDate = new Date(year, month, day);
            
            // If this day matches the start date, show it as selected
            if (dayDate.getTime() === startDate.getTime()) {
                dayEl.classList.add('selected');
            }
            // If this day is after the start date, show it as available for end date selection
            else if (dayDate > startDate) {
                dayEl.classList.add('available-for-end');
            }
        });
    }
}

function highlightRange() {
    if (!startDate || !endDate) return;
    
    // Clear any available-for-end indicators since we now have a complete selection
    document.querySelectorAll('.calendar-day.available-for-end').forEach(el => {
        el.classList.remove('available-for-end');
    });
    
    const days = document.querySelectorAll('.calendar-day:not(.header):not(.disabled)');
    days.forEach(dayEl => {
        const day = parseInt(dayEl.textContent);
        // Get the calendar container to determine which month this day belongs to
        const calendarContainer = dayEl.closest('.month-calendar');
        const calendarId = calendarContainer.querySelector('.calendar-grid').id;
        
        let month, year;
        if (calendarId === 'calendar1') {
            month = currentMonth;
            year = currentYear;
        } else {
            month = currentMonth + 1;
            year = currentYear;
            if (month > 11) {
                month = 0;
                year++;
            }
        }
        
        const dayDate = new Date(year, month, day);
        if (dayDate > startDate && dayDate < endDate) {
            dayEl.classList.add('in-range');
        }
    });
}

function clearSelection() {
    startDate = null;
    endDate = null;
    document.querySelectorAll('.calendar-day.selected, .calendar-day.in-range, .calendar-day.available-for-end').forEach(el => {
        el.classList.remove('selected', 'in-range', 'available-for-end');
    });
}

function updateBookingSummary() {
    // Update the sidebar dates section
    const dateDisplay = document.getElementById('dateDisplay');
    if (dateDisplay) {
        if (startDate && endDate) {
            // Complete selection
            const nights = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
            let totalPrice = nights * 227;
            let discount = 0;
            let discountText = '';
            
            // Apply discounts
            if (nights >= 28) {
                discount = 0.15;
                discountText = '15% off for monthly stays (28+ nights)';
            } else if (nights >= 7) {
                discount = 0.07;
                discountText = '7% off for weekly stays (7+ nights)';
            }
            
            const discountAmount = totalPrice * discount;
            const finalPrice = totalPrice - discountAmount;
            
            dateDisplay.innerHTML = `
                <span>${startDate.toLocaleDateString()} → ${endDate.toLocaleDateString()}</span>
                <i class="fas fa-chevron-right"></i>
            `;
            
            // Update the total section in sidebar
            const totalSection = document.querySelector('.total-section');
            if (totalSection) {
                totalSection.innerHTML = `
                    <div class="total-header">
                        <h4>Total</h4>
                        <span class="view-details">View details <i class="fas fa-chevron-right"></i></span>
                    </div>
                    <div class="total-amount" id="totalAmount">$${finalPrice.toFixed(2)}</div>
                    ${discount > 0 ? `
                        <div class="discount-highlight">
                            <div class="discount-text">${discountText}</div>
                            <div>Discount: -$${discountAmount.toFixed(2)}</div>
                        </div>
                    ` : ''}
                `;
            }
            
            // Update the main booking summary
            const checkinEl = document.getElementById('checkinDate');
            const checkoutEl = document.getElementById('checkoutDate');
            const totalEl = document.getElementById('totalPrice');
            
            if (checkinEl) checkinEl.textContent = startDate.toLocaleDateString();
            if (checkoutEl) checkoutEl.textContent = endDate.toLocaleDateString();
            if (totalEl) totalEl.textContent = `$${finalPrice.toFixed(2)}`;
            
            // Update the modal booking summary
            const modalCheckIn = document.getElementById('modalCheckIn');
            const modalCheckOut = document.getElementById('modalCheckOut');
            const modalTotal = document.getElementById('modalTotal');
            
            if (modalCheckIn) modalCheckIn.textContent = startDate.toLocaleDateString();
            if (modalCheckOut) modalCheckOut.textContent = endDate.toLocaleDateString();
            if (modalTotal) modalTotal.textContent = `$${finalPrice.toFixed(2)}`;
        } else if (startDate && !endDate) {
            // Partial selection - show start date and prompt for end date
            dateDisplay.innerHTML = `
                <span>${startDate.toLocaleDateString()} → Select end date</span>
                <i class="fas fa-chevron-right"></i>
            `;
            
            // Update the total section to show prompt
            const totalSection = document.querySelector('.total-section');
            if (totalSection) {
                totalSection.innerHTML = `
                    <div class="total-header">
                        <h4>Select End Date</h4>
                    </div>
                    <div class="total-amount" id="totalAmount" style="color: #4a7c59; font-size: 0.9rem;">
                        Choose your checkout date to see pricing
                    </div>
                `;
            }
        } else {
            // No selection
            dateDisplay.innerHTML = `
                <span>Select your dates</span>
                <i class="fas fa-chevron-right"></i>
            `;
            
            // Update the total section
            const totalSection = document.querySelector('.total-section');
            if (totalSection) {
                totalSection.innerHTML = `
                    <div class="total-header">
                        <h4>Total</h4>
                    </div>
                    <div class="total-amount" id="totalAmount">$0.00</div>
                `;
            }
        }
    }
}

function previousMonth() {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    generateDualCalendar();
    // Preserve selection state after navigation
    showMobileSelectionIndicator();
}

function nextMonth() {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    generateDualCalendar();
    // Preserve selection state after navigation
    showMobileSelectionIndicator();
}

// Initialize calendar sync on page load
document.addEventListener('DOMContentLoaded', function() {
    // Show loading status
    const calendarContainer = document.querySelector('.calendar-container');
    if (calendarContainer) {
        const statusDiv = document.createElement('div');
        statusDiv.className = 'sync-status';
        statusDiv.textContent = 'Syncing calendar availability...';
        calendarContainer.prepend(statusDiv);
        
        // Fetch calendar data
        fetchCalendarData().then(() => {
            statusDiv.textContent = 'Calendar synced with booking platforms ✓';
            setTimeout(() => statusDiv.remove(), 3000);
        }).catch(() => {
            statusDiv.textContent = 'Calendar sync failed - showing local availability only';
            setTimeout(() => statusDiv.remove(), 3000);
        });
        
        // Refresh calendar data every 30 minutes
        setInterval(fetchCalendarData, 30 * 60 * 1000);
    }
    
    // Modal functionality
    const modal = document.getElementById('bookingModal');
    const modalBtn = document.getElementById('instantBookBtn');
    const modalClose = document.getElementById('modalClose');
    
    // Open modal
    modalBtn.addEventListener('click', function() {
        // Update modal with selected dates and total
        if (startDate && endDate) {
            const nights = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
            let totalPrice = nights * 227;
            let discount = 0;
            
            // Apply discounts
            if (nights >= 28) {
                discount = 0.15;
            } else if (nights >= 7) {
                discount = 0.07;
            }
            
            const discountAmount = totalPrice * discount;
            const finalPrice = totalPrice - discountAmount;
            
            // Update modal fields
            const modalCheckIn = document.getElementById('modalCheckIn');
            const modalCheckOut = document.getElementById('modalCheckOut');
            const modalTotal = document.getElementById('modalTotal');
            
            if (modalCheckIn) modalCheckIn.textContent = startDate.toLocaleDateString();
            if (modalCheckOut) modalCheckOut.textContent = endDate.toLocaleDateString();
            if (modalTotal) modalTotal.textContent = `$${finalPrice.toFixed(2)}`;
        } else {
            // Show message if no dates selected
            const modalCheckIn = document.getElementById('modalCheckIn');
            const modalCheckOut = document.getElementById('modalCheckOut');
            const modalTotal = document.getElementById('modalTotal');
            
            if (modalCheckIn) modalCheckIn.textContent = 'Please select dates first';
            if (modalCheckOut) modalCheckOut.textContent = 'Please select dates first';
            if (modalTotal) modalTotal.textContent = '$0.00';
        }
        
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    });
    
    // Close modal
    modalClose.addEventListener('click', function() {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto'; // Restore scrolling
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && modal.style.display === 'block') {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
    
    // Map is now interactive via Google Maps iframe
    // No additional JavaScript needed as the iframe handles all interactions
    
    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('.nav-menu a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const headerHeight = 80; // Height of the fixed header
                const targetPosition = targetElement.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Date display click to scroll to availability section
    const dateDisplay = document.getElementById('dateDisplay');
    if (dateDisplay) {
        dateDisplay.addEventListener('click', function() {
            const availabilitySection = document.getElementById('booking');
            if (availabilitySection) {
                const headerHeight = 80; // Height of the fixed header
                const targetPosition = availabilitySection.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    }
    
    // Form submission functionality
    const bookingForm = document.getElementById('bookingForm');
    const formSuccess = document.getElementById('formSuccess');
    const formError = document.getElementById('formError');
    
    if (bookingForm) {
        bookingForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            console.log('Form submitted!'); // Debug log
            
            // Show loading state
            const submitBtn = bookingForm.querySelector('.confirm-booking-btn');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
            submitBtn.disabled = true;
            
            // Hide any previous messages
            formSuccess.style.display = 'none';
            formError.style.display = 'none';
            
            try {
                // Get form data
                const formData = new FormData(bookingForm);
                const bookingData = {
                    firstName: formData.get('firstName'),
                    lastName: formData.get('lastName'),
                    email: formData.get('email'),
                    phone: formData.get('phone'),
                    specialRequests: formData.get('specialRequests') || '',
                    checkIn: startDate ? startDate.toLocaleDateString() : 'No dates selected',
                    checkOut: endDate ? endDate.toLocaleDateString() : 'No dates selected',
                    total: document.getElementById('modalTotal').textContent,
                    selectedDates: startDate && endDate ? 
                        `${startDate.toLocaleDateString()} → ${endDate.toLocaleDateString()}` : 
                        'No dates selected'
                };
                
                console.log('Booking data:', bookingData); // Debug log
                
                                        // Google Apps Script web app URL
                        const scriptUrl = 'https://script.google.com/macros/s/AKfycbzznaZ4jOwoVfF6eoz2jtDyED86NTdEc3ALBqgQkcBr_852lHu5cdDLDK-qcHn5oB-ItQ/exec'; // Latest URL with owner notifications
                
                console.log('Sending request to:', scriptUrl); // Debug log
                
                const response = await fetch(scriptUrl, {
                    method: 'POST',
                    mode: 'no-cors', // Add this to handle CORS issues
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(bookingData)
                });
                
                console.log('Response received:', response); // Debug log
                
                // Since we're using no-cors, we can't read the response
                // We'll assume success if we get here
                console.log('Request sent successfully!');
                
                // Show success message
                bookingForm.style.display = 'none';
                formSuccess.style.display = 'block';
                
                // Reset form
                bookingForm.reset();
                
                // Close modal after 3 seconds
                setTimeout(() => {
                    modal.style.display = 'none';
                    document.body.style.overflow = 'auto';
                    bookingForm.style.display = 'flex';
                    formSuccess.style.display = 'none';
                }, 3000);
                
            } catch (error) {
                console.error('Form submission error:', error);
                
                // Show error message
                formError.style.display = 'block';
                
                // Reset button
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }
});
