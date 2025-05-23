# Responsive Classes Reference Guide

## 🎯 Quick Reference for Responsive Design

### **Grid Layouts**
```css
/* Mobile-first approach */
grid-cols-1                    /* 1 column on mobile */
sm:grid-cols-2                 /* 2 columns on small screens (640px+) */
lg:grid-cols-3                 /* 3 columns on large screens (1024px+) */
xl:grid-cols-4                 /* 4 columns on extra large screens (1280px+) */

/* Specific implementations */
grid-cols-1 sm:grid-cols-2 lg:grid-cols-4    /* Stats cards */
grid-cols-1 xl:grid-cols-3                   /* Calendar layout */
```

### **Spacing & Padding**
```css
/* Responsive padding */
p-3 sm:p-4 lg:p-6             /* Padding: 12px -> 16px -> 24px */
px-3 sm:px-4 lg:px-6          /* Horizontal padding */
gap-4 lg:gap-6                /* Grid gap: 16px -> 24px */

/* Responsive margins */
mb-4 lg:mb-6                  /* Margin bottom: 16px -> 24px */
```

### **Typography**
```css
/* Responsive text sizes */
text-lg lg:text-xl            /* 18px -> 20px */
text-xl lg:text-2xl           /* 20px -> 24px */
text-2xl lg:text-3xl          /* 24px -> 30px */
text-xs lg:text-sm            /* 12px -> 14px */
```

### **Layout & Positioning**
```css
/* Sidebar responsive behavior */
fixed lg:static               /* Fixed on mobile, static on desktop */
-translate-x-full lg:translate-x-0  /* Hidden on mobile, visible on desktop */
w-64 lg:w-64                  /* Consistent width */

/* Mobile menu */
lg:hidden                     /* Hide on large screens */
block lg:hidden               /* Show on mobile, hide on desktop */
hidden lg:block               /* Hide on mobile, show on desktop */
```

### **Flexbox & Display**
```css
/* Responsive flex direction */
flex-col sm:flex-row          /* Column on mobile, row on larger screens */

/* Responsive items alignment */
items-start sm:items-center   /* Start alignment on mobile, center on larger */

/* Responsive justify content */
justify-start sm:justify-between  /* Start on mobile, space-between on larger */
```

### **Dark Mode Classes**
```css
/* Background colors */
bg-white dark:bg-gray-800     /* White in light mode, gray-800 in dark */
bg-gray-50 dark:bg-gray-700   /* Light gray -> darker gray */
bg-blue-50 dark:bg-blue-900/30  /* Blue tint with opacity */

/* Text colors */
text-gray-900 dark:text-gray-100    /* Dark text -> light text */
text-gray-600 dark:text-gray-400    /* Medium gray -> lighter gray */

/* Border colors */
border-gray-200 dark:border-gray-600  /* Light border -> darker border */
border-blue-200 dark:border-blue-700  /* Blue borders */
```

### **Component-Specific Classes**

#### **Calendar Grid**
```css
/* Calendar cell sizing */
min-h-[60px] sm:min-h-[80px]  /* Smaller cells on mobile */
p-1 sm:p-2                    /* Less padding on mobile */

/* Day headers */
text-xs lg:text-sm            /* Smaller text on mobile */
p-1 lg:p-2                    /* Less padding on mobile */
```

#### **Cards**
```css
/* Responsive card padding */
p-4 sm:p-6                    /* Less padding on mobile */
rounded-lg                    /* Smaller border radius on mobile */
```

#### **Buttons**
```css
/* Responsive button sizing */
text-sm lg:text-base          /* Smaller text on mobile */
px-3 py-2                     /* Smaller padding on mobile */
btn-sm                        /* Small button variant */
```

### **Utility Classes Added**

#### **Custom Responsive Grids**
```css
.responsive-grid              /* Base grid with responsive gaps */
.responsive-grid-1            /* 1 column grid */
.responsive-grid-2            /* 1 -> 2 column grid */
.responsive-grid-3            /* 1 -> 2 -> 3 column grid */
.responsive-grid-4            /* 1 -> 2 -> 4 column grid */
```

#### **Mobile-Specific Styles**
```css
@media (max-width: 640px) {
  .card { @apply rounded-lg; }     /* Smaller border radius */
  .btn { @apply text-sm px-3 py-2; } /* Smaller buttons */
}
```

### **Breakpoint Reference**
```css
/* Tailwind CSS Breakpoints */
sm: 640px   /* Small devices (landscape phones) */
md: 768px   /* Medium devices (tablets) */
lg: 1024px  /* Large devices (laptops/desktops) */
xl: 1280px  /* Extra large devices (large laptops/desktops) */
2xl: 1536px /* 2X Extra large devices (larger desktops) */
```

### **Common Patterns Used**

#### **Mobile-First Grid**
```jsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
  {/* Content */}
</div>
```

#### **Responsive Text**
```jsx
<h1 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-gray-100">
  Title
</h1>
```

#### **Mobile Navigation**
```jsx
<button className="lg:hidden fixed top-4 left-4 z-50">
  {/* Hamburger menu */}
</button>
```

#### **Conditional Display**
```jsx
<span className="hidden sm:inline">Full Text</span>
<span className="sm:hidden">Short</span>
```

This reference guide helps maintain consistency across the application and makes it easy to implement responsive design patterns.
