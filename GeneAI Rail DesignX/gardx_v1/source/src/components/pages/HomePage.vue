<template>
  <div class="home-page">
    <!-- Hero Section -->
    <section class="hero-section bg-primary text-white py-5">
      <div class="container">
        <div class="row align-items-center min-vh-100">
          <div class="col-lg-6">
            <div class="hero-content">
              <h1 class="display-4 fw-bold mb-4">
                Railway Infrastructure Design Tool
              </h1>
              <p class="lead mb-4">
                Empower rail engineers with AI-powered design suggestions, real-time feedback,
                and comprehensive export capabilities for modern railway infrastructure planning.
              </p>
              <div class="d-flex gap-3 flex-wrap">
                <router-link v-if="!authStore.isAuthenticated" to="/login" class="btn btn-light btn-lg px-4">
                  <i class="bi bi-box-arrow-in-right me-2"></i>
                  Get Started
                </router-link>
                <router-link v-else to="/editor" class="btn btn-light btn-lg px-4">
                  <i class="bi bi-pencil-square me-2"></i>
                  Open Editor
                </router-link>
                <button class="btn btn-outline-light btn-lg px-4" @click="scrollToFeatures">
                  <i class="bi bi-info-circle me-2"></i>
                  Learn More
                </button>
              </div>
            </div>
          </div>
          <div class="col-lg-6">
            <div class="hero-image text-center">
              <div class="mockup-container p-4">
                <!-- Simple Railway Diagram SVG -->
                <svg width="100%" height="300" viewBox="0 0 600 300" class="border rounded bg-white p-3">
                  <!-- Grid -->
                  <defs>
                    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e0e0e0" stroke-width="1" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />

                  <!-- Main Track -->
                  <line x1="50" y1="150" x2="550" y2="150" stroke="#333" stroke-width="4" stroke-linecap="round" />

                  <!-- Switch -->
                  <line x1="200" y1="150" x2="300" y2="100" stroke="#666" stroke-width="4" stroke-linecap="round" />
                  <rect x="195" y="145" width="10" height="10" fill="#00ff00" stroke="#333" />

                  <!-- Signal -->
                  <line x1="150" y1="150" x2="150" y2="120" stroke="#666" stroke-width="3" />
                  <circle cx="150" cy="115" r="8" fill="#ff0000" stroke="#333" />

                  <!-- Station -->
                  <rect x="350" y="120" width="80" height="30" fill="#0066cc" stroke="#333" stroke-width="2" />
                  <text x="390" y="140" text-anchor="middle" fill="white" font-size="12"
                    font-weight="bold">Station</text>

                  <!-- Platform -->
                  <rect x="330" y="155" width="120" height="15" fill="#999" stroke="#333" />
                  <line x1="330" y1="155" x2="450" y2="155" stroke="#ffff00" stroke-width="2" />

                  <!-- Animated Train -->
                  <g class="animated-train">
                    <rect x="0" y="140" width="40" height="20" fill="#cc0000" stroke="#333" rx="5">
                      <animateTransform attributeName="transform" type="translate" values="0,0; 560,0; 0,0" dur="8s"
                        repeatCount="indefinite" />
                    </rect>
                  </g>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="features-section py-5 bg-light">
      <div class="container">
        <div class="row">
          <div class="col-lg-12 text-center mb-5">
            <h2 class="display-5 fw-bold text-primary">Powerful Features</h2>
            <p class="lead text-muted">Everything you need for modern railway infrastructure design</p>
          </div>
        </div>

        <div class="row g-4">
          <!-- Feature 1 -->
          <div class="col-md-6 col-lg-4">
            <div class="feature-card card h-100 border-0 shadow-sm">
              <div class="card-body text-center p-4">
                <div class="feature-icon mb-3">
                  <i class="bi bi-diagram-3 display-4 text-primary"></i>
                </div>
                <h5 class="card-title">Interactive Canvas</h5>
                <p class="card-text text-muted">
                  Drag-and-drop railway components with real-time visual feedback and precise positioning controls.
                </p>
              </div>
            </div>
          </div>

          <!-- Feature 2 -->
          <div class="col-md-6 col-lg-4">
            <div class="feature-card card h-100 border-0 shadow-sm">
              <div class="card-body text-center p-4">
                <div class="feature-icon mb-3">
                  <i class="bi bi-robot display-4 text-success"></i>
                </div>
                <h5 class="card-title">AI-Powered Design</h5>
                <p class="card-text text-muted">
                  Get intelligent suggestions for layout optimization, safety improvements, and efficiency enhancements.
                </p>
              </div>
            </div>
          </div>

          <!-- Feature 3 -->
          <div class="col-md-6 col-lg-4">
            <div class="feature-card card h-100 border-0 shadow-sm">
              <div class="card-body text-center p-4">
                <div class="feature-icon mb-3">
                  <i class="bi bi-layers display-4 text-info"></i>
                </div>
                <h5 class="card-title">Multi-Module Design</h5>
                <p class="card-text text-muted">
                  Work across track planning, I/O mapping, wiring diagrams, and system architecture in one platform.
                </p>
              </div>
            </div>
          </div>

          <!-- Feature 4 -->
          <div class="col-md-6 col-lg-4">
            <div class="feature-card card h-100 border-0 shadow-sm">
              <div class="card-body text-center p-4">
                <div class="feature-icon mb-3">
                  <i class="bi bi-download display-4 text-warning"></i>
                </div>
                <h5 class="card-title">Export Flexibility</h5>
                <p class="card-text text-muted">
                  Export your designs in multiple formats including SVG, PDF, JSON, and RailML for seamless integration.
                </p>
              </div>
            </div>
          </div>

          <!-- Feature 5 -->
          <div class="col-md-6 col-lg-4">
            <div class="feature-card card h-100 border-0 shadow-sm">
              <div class="card-body text-center p-4">
                <div class="feature-icon mb-3">
                  <i class="bi bi-people display-4 text-danger"></i>
                </div>
                <h5 class="card-title">Collaboration Ready</h5>
                <p class="card-text text-muted">
                  Real-time collaboration features with role-based access control for team-based design workflows.
                </p>
              </div>
            </div>
          </div>

          <!-- Feature 6 -->
          <div class="col-md-6 col-lg-4">
            <div class="feature-card card h-100 border-0 shadow-sm">
              <div class="card-body text-center p-4">
                <div class="feature-icon mb-3">
                  <i class="bi bi-check-circle display-4 text-primary"></i>
                </div>
                <h5 class="card-title">Design Validation</h5>
                <p class="card-text text-muted">
                  Automated validation against railway standards and best practices with detailed feedback reports.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Modules Section -->
    <section class="modules-section py-5">
      <div class="container">
        <div class="row">
          <div class="col-lg-12 text-center mb-5">
            <h2 class="display-5 fw-bold text-primary">Design Modules</h2>
            <p class="lead text-muted">Comprehensive tools for every aspect of railway infrastructure</p>
          </div>
        </div>

        <div class="row g-4">
          <div v-for="module in modules" :key="module.id" class="col-md-6 col-lg-4">
            <div class="module-card card h-100 border-0 shadow-sm hover-lift">
              <div class="card-body p-4">
                <div class="d-flex align-items-center mb-3">
                  <div class="module-icon me-3">
                    <i :class="`bi bi-${module.icon} fs-2 text-primary`"></i>
                  </div>
                  <div>
                    <h5 class="card-title mb-1">{{ module.name }}</h5>
                    <span class="badge bg-primary">{{ module.id }}</span>
                  </div>
                </div>
                <p class="card-text text-muted">{{ module.description }}</p>
                <div class="module-features">
                  <ul class="list-unstyled small">
                    <li v-for="feature in module.features" :key="feature" class="mb-1">
                      <i class="bi bi-check text-success me-2"></i>{{ feature }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section bg-primary text-white py-5">
      <div class="container">
        <div class="row justify-content-center text-center">
          <div class="col-lg-8">
            <h2 class="display-5 fw-bold mb-4">Ready to Design the Future?</h2>
            <p class="lead mb-4">
              Join thousands of railway engineers already using our platform to create
              safer, more efficient railway infrastructure.
            </p>
            <div class="d-flex gap-3 justify-content-center flex-wrap">
              <router-link v-if="!authStore.isAuthenticated" to="/login" class="btn btn-light btn-lg px-5">
                <i class="bi bi-rocket-takeoff me-2"></i>
                Start Designing
              </router-link>
              <router-link v-else to="/editor" class="btn btn-light btn-lg px-5">
                <i class="bi bi-pencil-square me-2"></i>
                Open Editor
              </router-link>
              <button class="btn btn-outline-light btn-lg px-4" @click="showDemo">
                <i class="bi bi-play-circle me-2"></i>
                Watch Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer bg-dark text-light py-4">
      <div class="container">
        <div class="row">
          <div class="col-md-6">
            <div class="d-flex align-items-center mb-3">
              <i class="bi bi-train-front me-2 fs-4"></i>
              <span class="fw-bold fs-5">Railway Designer</span>
            </div>
            <p class="text-muted small">
              Professional railway infrastructure design tool with AI-powered assistance
              and comprehensive export capabilities.
            </p>
          </div>
          <div class="col-md-6 text-md-end">
            <div class="footer-links">
              <a href="/help" class="text-light text-decoration-none me-3">Documentation</a>
              <a href="/api" class="text-light text-decoration-none me-3">API</a>
              <a href="/support" class="text-light text-decoration-none me-3">Support</a>
              <a href="/privacy" class="text-light text-decoration-none">Privacy</a>
            </div>
            <div class="mt-3">
              <small class="text-muted">
                © 2024 Railway Designer. Built with Vue.js 3 & Pinia.
              </small>
            </div>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { useAuthStore } from '@stores/authStore'

// Stores
const authStore = useAuthStore()

// Module data
const modules = [
  {
    id: 'track-editor',
    name: 'Track Plan Editor',
    icon: 'train',
    description: 'Design track layouts with precision tools for curves, switches, and junctions.',
    features: [
      'Interactive track drawing',
      'Switch and signal placement',
      'Geometric constraints',
      'Elevation profiles'
    ]
  },
  {
    id: 'io-mapping',
    name: 'Input-Output Mapping',
    icon: 'diagram-3',
    description: 'Map control systems and interface connections for railway operations.',
    features: [
      'Signal mapping',
      'Control interfaces',
      'Communication links',
      'System diagnostics'
    ]
  },
  {
    id: 'wiring-diagram',
    name: 'Wiring Diagram',
    icon: 'bezier',
    description: 'Create detailed electrical schematics for railway infrastructure.',
    features: [
      'Electrical schematics',
      'Cable routing',
      'Component libraries',
      'Automatic labeling'
    ]
  },
  {
    id: 'system-art',
    name: 'System Architecture',
    icon: 'boxes',
    description: 'Design high-level system architecture and component relationships.',
    features: [
      'System overview',
      'Component hierarchy',
      'Data flow diagrams',
      'Integration mapping'
    ]
  },
  {
    id: 'common-tools',
    name: 'Common Infrastructure',
    icon: 'tools',
    description: 'Shared tools and utilities for cross-module design consistency.',
    features: [
      'Component libraries',
      'Design templates',
      'Standards compliance',
      'Quality assurance'
    ]
  }
]

// Methods
const scrollToFeatures = () => {
  document.getElementById('features')?.scrollIntoView({
    behavior: 'smooth'
  })
}

const showDemo = () => {
  // Open demo video or tour
  alert('Demo coming soon! For now, try the live editor with demo accounts.')
}
</script>

<style scoped>
.hero-section {
  background: linear-gradient(135deg, #0d6efd 0%, #0056b3 100%);
}

.feature-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
}

.module-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.hover-lift:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
}

.module-icon {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(13, 110, 253, 0.1);
  border-radius: 12px;
}

.animated-train {
  filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3));
}

.mockup-container {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  backdrop-filter: blur(10px);
}

.footer-links a:hover {
  text-decoration: underline !important;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .hero-section .min-vh-100 {
    min-height: auto;
    padding: 3rem 0;
  }

  .display-4 {
    font-size: 2.5rem;
  }

  .display-5 {
    font-size: 2rem;
  }
}

/* Animation for hero elements */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.hero-content>* {
  animation: fadeInUp 0.8s ease-out forwards;
}

.hero-content>*:nth-child(2) {
  animation-delay: 0.2s;
}

.hero-content>*:nth-child(3) {
  animation-delay: 0.4s;
}
</style>