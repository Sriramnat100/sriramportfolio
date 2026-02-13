# Codebase Index

**Last Updated:** February 13, 2026  
**Project:** Portfolio Website - Sriram Natarajan  
**Framework:** Next.js 15.3.5 (App Router)  
**Language:** TypeScript

---

## 📁 Project Structure

```
portfolio/
├── updated-app/                    # Main Next.js application
│   ├── app/                        # Next.js App Router directory
│   │   ├── layout.tsx              # Root layout component
│   │   ├── page.tsx                # Main portfolio page (homepage)
│   │   ├── globals.css             # Global styles & Tailwind config
│   │   └── api/                    # API routes
│   │       ├── generate-images/    # Image generation endpoint
│   │       │   ├── route.ts        # Main image generation handler
│   │       │   └── backup.ts       # Backup implementation
│   │       ├── images-today/       # Daily image count endpoint
│   │       │   └── route.ts        # GET endpoint for daily count
│   │       └── submit-generation/  # Database submission endpoint
│   │           └── route.ts        # POST endpoint for storing generations
│   ├── components/                 # React components
│   │   └── ui/                     # shadcn/ui components
│   │       ├── badge.tsx           # Badge component
│   │       ├── button.tsx          # Button component
│   │       ├── card.tsx            # Card component
│   │       ├── input.tsx           # Input component
│   │       └── textarea.tsx        # Textarea component
│   ├── lib/                        # Utility functions
│   │   └── utils.ts                # cn() utility for className merging
│   ├── public/                     # Static assets
│   │   └── untitled folder 2/      # Image assets
│   ├── my-replicate-app/           # Replicate integration test app
│   ├── scripts/                    # Python scripts & virtual environment
│   ├── package.json                # Dependencies & scripts
│   ├── tsconfig.json               # TypeScript configuration
│   ├── next.config.ts              # Next.js configuration
│   └── components.json             # shadcn/ui configuration
└── package.json                    # Root package.json (minimal deps)
```

---

## 🎯 Core Features

### 1. **Portfolio Display**
- Personal portfolio website showcasing:
  - About section with animated typing effect
  - Education details (UIUC)
  - Professional experience timeline
  - Featured projects with stats
  - Skills carousel with autoplay
  - Hobbies section
  - Contact information

### 2. **AI Image Generation**
- Interactive feature allowing visitors to generate custom backgrounds
- Uses Replicate API (Google Imagen 4 Fast model)
- Overlays user's headshot on generated backgrounds
- Daily limit: 20 free image generations
- Stores generations in Supabase database

### 3. **Database Integration**
- Supabase for:
  - Storing image generation records
  - Tracking daily generation counts
  - Image storage via Supabase Storage

---

## 📄 Key Files

### **app/layout.tsx**
- Root layout component
- Configures Geist fonts (Sans & Mono)
- Sets global metadata
- Applies global CSS

**Key Exports:**
- `metadata`: Site metadata (title, description)
- `RootLayout`: Main layout wrapper

### **app/page.tsx** (1,372 lines)
Main portfolio page component with all sections:

**State Management:**
- `isSubmitting`: Contact form submission state
- `prompt`: User's image generation prompt
- `email`: User's email for image generation
- `step`: Form step ("prompt" | "email")
- `loading`: Image generation loading state
- `showGif`: Loading animation toggle
- `headshotUrl`: Current headshot image URL
- `showPrompt`: Display generated prompt
- `restatedPrompt`: User's prompt text
- `imagesToday`: Daily image generation count
- `showNotification`: Notification popup visibility
- `notificationMessage`: Notification message text

**Custom Components:**
- `AnimatedCounter`: Animated number counter with gradient text
- `useTypingEffect`: Typing animation hook for hero headline
- `SkillsCarousel`: Rotating skills display with autoplay

**Sections:**
1. **Hero Section**: Animated introduction with stats
2. **Education Section**: UIUC details with coursework
3. **Experience Timeline**: Professional journey with timeline visualization
4. **Projects Section**: Featured + grid layout projects
5. **Skills Section**: Interactive skills carousel
6. **Hobbies Section**: Personal interests display
7. **Contact Section**: Contact form and information
8. **Footer**: Site footer with links

**Data Arrays:**
- `stats`: Achievement statistics
- `experience`: Professional experience entries
- `projects`: Portfolio projects
- `hobbies`: Personal hobbies
- `skills`: Technical skills with proficiency levels

### **app/api/generate-images/route.ts**
Image generation API endpoint.

**Functionality:**
1. Receives prompt from client
2. Calls Replicate API (Google Imagen 4 Fast)
3. Downloads generated background image
4. Loads transparent headshot overlay
5. Composites images using Canvas API
6. Uploads final image to Supabase Storage
7. Returns public URL

**Request Body:**
```typescript
{
  prompt: string;
  aspect_ratio?: string;        // Default: "1:1"
  safety_filter_level?: string; // Default: "block_only_high"
  output_format?: string;       // Default: "png"
}
```

**Response:**
```typescript
{
  success: boolean;
  imageUrl: string;
  prompt: string;
  generatedAt: string;
}
```

**Dependencies:**
- `replicate`: Replicate API client
- `canvas`: Node.js Canvas API for image composition
- `@supabase/supabase-js`: Supabase client
- `uuid`: Unique filename generation

### **app/api/submit-generation/route.ts**
Database submission endpoint for image generations.

**Functionality:**
- Stores email, prompt, and image URL in Supabase
- Table: `image_generations`
- Fields: `email`, `prompt`, `image_url`, `created_at`

**Request Body:**
```typescript
{
  email: string;
  prompt: string;
  image_url: string;
}
```

### **app/api/images-today/route.ts**
Daily image count endpoint.

**Functionality:**
- Counts image generations since a given timestamp
- Used to enforce daily limit (20 images/day)

**Query Parameters:**
- `since`: ISO timestamp string (start of day)

**Response:**
```typescript
{
  count: number;
}
```

### **components/ui/**
shadcn/ui component library components:
- **badge.tsx**: Badge component for tags/labels
- **button.tsx**: Button component with variants
- **card.tsx**: Card component (CardHeader, CardTitle, CardDescription, CardContent)
- **input.tsx**: Input field component
- **textarea.tsx**: Textarea component

### **lib/utils.ts**
Utility function:
- `cn(...inputs: ClassValue[])`: Merges Tailwind classes using `clsx` and `tailwind-merge`

---

## 🔧 Configuration Files

### **package.json**
**Dependencies:**
- `next`: ^15.3.5
- `react`: ^19.1.0
- `react-dom`: ^19.1.0
- `typescript`: ^5
- `tailwindcss`: ^4
- `framer-motion`: ^12.23.0 (animations)
- `lucide-react`: ^0.525.0 (icons)
- `@supabase/supabase-js`: ^2.50.4 (database)
- `replicate`: ^1.0.1 (AI image generation)
- `canvas`: ^3.1.2 (image composition)
- `openai`: ^5.8.3
- `uuid`: ^11.1.0

**Scripts:**
- `dev`: Development server with Turbopack
- `dev:debug`: Development with Node.js inspector
- `build`: Production build
- `start`: Production server
- `lint`: ESLint

### **tsconfig.json**
TypeScript configuration:
- Target: ES2017
- Module: ESNext
- JSX: preserve
- Path alias: `@/*` → `./*`
- Strict mode enabled

### **next.config.ts**
Next.js configuration:
- ESLint ignored during builds
- Image domains: Supabase storage domain

### **components.json**
shadcn/ui configuration for component generation.

---

## 🎨 Styling

### **app/globals.css**
- Tailwind CSS v4 with custom theme
- CSS variables for theming (light/dark mode support)
- Custom animations and utilities
- Glass morphism effects
- Gradient animations

**Key Features:**
- Custom color system using OKLCH
- Dark mode support
- Chart color variables
- Sidebar theme variables
- Border radius utilities

---

## 🔌 External Services

### **Supabase**
- **Database**: PostgreSQL database for storing image generations
- **Storage**: Object storage for generated images
- **Table**: `image_generations` (email, prompt, image_url, created_at)

**Environment Variables:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### **Replicate**
- **Service**: AI model hosting platform
- **Model**: `google/imagen-4-fast`
- **Purpose**: Generate background images from text prompts

**Environment Variables:**
- `REPLICATE_API_TOKEN`

---

## 🎭 UI Components & Patterns

### **Navigation**
- Fixed top navigation bar
- Smooth scroll anchors
- Hover effects with gradient underlines

### **Hero Section**
- Animated typing effect for name
- Gradient text effects
- Animated counter statistics
- Social media links
- Image generation form

### **Experience Timeline**
- Vertical timeline with alternating sides
- Card-based entries
- Date and location badges
- Technology tags

### **Projects Section**
- Featured projects: Large cards with images
- Other projects: Grid layout
- Stats display (users, rating, downloads)
- Technology badges
- GitHub and demo links

### **Skills Carousel**
- Autoplay rotation (3s intervals)
- Manual navigation arrows
- Pause on hover
- Icon + name display

### **Animations**
- Framer Motion for transitions
- CSS keyframe animations
- Gradient animations
- Hover scale effects
- Pulse glow effects

---

## 📊 Data Structures

### **Experience Entry**
```typescript
{
  title: string;
  company: string;
  period: string;
  location: string;
  description: string[];
  technologies: string[];
}
```

### **Project Entry**
```typescript
{
  title: string;
  period: string;
  description: string[];
  technologies: string[];
  featured: boolean;
  category: string;
  longDescription: string;
  stats: {
    users: string;
    rating: number;
    downloads: string;
  };
  github: string;
  demo: string;
  image: string;
}
```

### **Skill Entry**
```typescript
{
  name: string;
  level: number;      // 0-100
  icon: React.ComponentType;
  projects: number;
}
```

---

## 🚀 Deployment

**Platform:** Vercel (recommended by Next.js)  
**Build Command:** `npm run build`  
**Output Directory:** `.next`

---

## 🔐 Environment Variables Required

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Replicate
REPLICATE_API_TOKEN=your_replicate_token
```

---

## 📝 Notes

- Image assets stored in `/public/untitled folder 2/`
- Daily image generation limit: 20 per day
- Uses Canvas API for server-side image composition
- All API routes are server-side only (no client exposure)
- Responsive design with mobile-first approach
- SEO optimized with proper metadata

---

## 🐛 Known Issues / Areas for Improvement

1. **File Organization**: Image folder named "untitled folder 2" could be renamed
2. **Error Handling**: Could add more comprehensive error boundaries
3. **Loading States**: Some async operations could benefit from better loading indicators
4. **Type Safety**: Some `any` types could be more specific
5. **Testing**: No test files present
6. **Documentation**: API endpoints could use OpenAPI/Swagger docs

---

## 📚 Related Files

- `my-replicate-app/`: Separate Replicate testing application
- `test-image-generation.js`: Test script for image generation
- `replicate_test.js`: Replicate API testing script
- `scripts/myVenv/`: Python virtual environment (unused in main app)

---

**Generated by Codex AI Assistant**  
*For questions or updates, refer to individual file comments or documentation.*
