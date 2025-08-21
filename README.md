# Adventure Van Rentals - Camper Van Rental Website

A modern, responsive website for your camper van rental business featuring an interactive booking calendar, van details, and trip inspiration.

## Features

### 🚐 **Van Showcase**
- Hero section with stunning van imagery
- Detailed specifications and features
- Interactive image gallery with modal view
- Professional presentation of your 2020 Coachman Beyond 22C

### 📅 **Interactive Booking System**
- Real-time availability calendar
- Date range selection with visual feedback
- Automatic price calculation
- Booking form with validation
- Similar to Outdoorsy booking experience

### 🗺️ **Trip Ideas Section**
- Inspirational trip suggestions
- Beautiful imagery and descriptions
- Duration and location information
- Helps customers plan their adventures

### 📱 **Mobile Responsive**
- Fully responsive design
- Mobile-friendly navigation
- Touch-optimized calendar interface
- Works perfectly on all devices

### 🎨 **Modern Design**
- Clean, professional aesthetic
- Smooth animations and transitions
- Green color scheme (easily customizable)
- Professional typography

## Quick Start

1. **Open the website**: Simply open `index.html` in your web browser
2. **No server required**: This is a static website that works locally
3. **Test the booking system**: Try selecting dates in the calendar

## Customization Guide

### Updating Van Information

Edit the van details in `index.html`:

```html
<!-- Update van specifications -->
<li><i class="fas fa-bed"></i> Queen bed + convertible dinette</li>
<li><i class="fas fa-utensils"></i> Full kitchen with refrigerator</li>
<!-- Add or modify features as needed -->
```

### Changing Pricing

Update the daily rate in `script.js`:

```javascript
this.dailyRate = 150; // Change to your desired rate
```

### Adding/Removing Booked Dates

Modify the booked dates array in `script.js`:

```javascript
this.bookedDates = [
    '2025-02-15',
    '2025-02-16',
    // Add or remove dates as needed
];
```

### Updating Contact Information

Edit the contact details in `index.html`:

```html
<div class="contact-item">
    <i class="fas fa-phone"></i>
    <div>
        <h4>Phone</h4>
        <p>(555) 123-4567</p> <!-- Update phone number -->
    </div>
</div>
```

### Changing Colors

The website uses a green color scheme. To change colors, update the CSS variables in `styles.css`:

```css
/* Primary colors */
--primary-color: #4a7c59;
--primary-dark: #2c5530;
--primary-light: #e8f5e8;
```

### Adding More Images

1. Place new images in the `Van - listing images/` folder
2. Update the image references in `index.html`:

```html
<img src="Van - listing images/your-new-image.jpg" alt="Description">
```

## File Structure

```
VanRentalSite/
├── index.html          # Main website file
├── styles.css          # All styling and responsive design
├── script.js           # Interactive functionality
├── README.md           # This file
└── Van - listing images/  # Your van photos
    ├── bathroom.jpg
    ├── IMG_5074.jpg
    └── ... (other images)
```

## Features in Detail

### Booking Calendar
- **Visual Date Selection**: Click dates to select start and end dates
- **Availability Display**: Booked dates are clearly marked
- **Price Calculation**: Automatic total calculation based on duration
- **Form Integration**: Seamless connection between calendar and booking form

### Mobile Navigation
- **Hamburger Menu**: Collapsible navigation for mobile devices
- **Smooth Scrolling**: Animated navigation between sections
- **Touch Friendly**: Optimized for mobile interaction

### Image Gallery
- **Modal View**: Click images to view in full screen
- **Hover Effects**: Subtle animations on image hover
- **Responsive Grid**: Automatically adjusts to screen size

### Contact Form
- **Form Validation**: Ensures all required fields are filled
- **Success Feedback**: User-friendly confirmation messages
- **Professional Styling**: Matches the overall design theme

## Browser Compatibility

- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Mobile browsers

## Deployment Options

### Option 1: GitHub Pages (Free)
1. Create a GitHub repository
2. Upload your files
3. Enable GitHub Pages in repository settings
4. Your site will be available at `https://username.github.io/repository-name`

### Option 2: Netlify (Free)
1. Drag and drop your folder to [netlify.com](https://netlify.com)
2. Get a custom URL instantly
3. Option to connect custom domain

### Option 3: Traditional Web Hosting
1. Upload files to your web hosting provider
2. Ensure all files are in the same directory
3. Access via your domain name

## Customization Tips

### Adding a Logo
Replace the text logo in the navigation with your own image:

```html
<div class="nav-logo">
    <img src="your-logo.png" alt="Your Company" style="height: 40px;">
</div>
```

### Changing Fonts
Update the Google Fonts link in `index.html`:

```html
<link href="https://fonts.googleapis.com/css2?family=YourFont:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

### Adding Social Media Links
Update the social media links in the footer:

```html
<div class="social-links">
    <a href="https://facebook.com/yourpage"><i class="fab fa-facebook"></i></a>
    <a href="https://instagram.com/yourpage"><i class="fab fa-instagram"></i></a>
</div>
```

## Support

This website is built with:
- **HTML5**: Semantic markup
- **CSS3**: Modern styling with Flexbox and Grid
- **Vanilla JavaScript**: No frameworks required
- **Font Awesome**: Icons
- **Google Fonts**: Typography

## License

This template is free to use for your camper van rental business. Feel free to modify and customize as needed.

---

**Ready to launch your van rental business online?** 🚐✨

Open `index.html` in your browser to see your new website in action!

