<template>
  <div class="login-page min-vh-100 d-flex align-items-center justify-content-center bg-light">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-6 col-lg-4">
          <div class="card shadow">
            <div class="card-body p-4">
              <!-- Logo and Title -->
              <div class="text-center mb-4">
                <div class="mb-3">
                  <i class="bi bi-train-front display-4 text-primary"></i>
                </div>
                <h2 class="fw-bold text-primary">Railway Designer</h2>
                <p class="text-muted">Sign in to your account</p>
              </div>

              <!-- Login Form -->
              <form @submit.prevent="handleLogin" v-if="!showRegister">
                <div class="mb-3">
                  <label for="email" class="form-label">Email</label>
                  <input id="email" type="email" class="form-control" v-model="loginForm.email"
                    :class="{ 'is-invalid': loginError && loginForm.email }" required autocomplete="username">
                </div>

                <div class="mb-3">
                  <label for="password" class="form-label">Password</label>
                  <div class="input-group">
                    <input id="password" :type="showPassword ? 'text' : 'password'" class="form-control"
                      v-model="loginForm.password" :class="{ 'is-invalid': loginError && loginForm.password }" required
                      autocomplete="current-password">
                    <button type="button" class="btn btn-outline-secondary" @click="showPassword = !showPassword">
                      <i :class="showPassword ? 'bi-eye-slash' : 'bi-eye'"></i>
                    </button>
                  </div>
                </div>

                <div class="mb-3 form-check">
                  <input type="checkbox" class="form-check-input" id="rememberMe" v-model="loginForm.rememberMe">
                  <label class="form-check-label" for="rememberMe">
                    Remember me
                  </label>
                </div>

                <!-- Error Message -->
                <div v-if="loginError" class="alert alert-danger" role="alert">
                  <i class="bi bi-exclamation-triangle me-2"></i>
                  {{ loginError }}
                </div>

                <!-- Submit Button -->
                <button type="submit" class="btn btn-primary w-100 mb-3" :disabled="authStore.loading">
                  <span v-if="authStore.loading" class="spinner-border spinner-border-sm me-2" role="status">
                    <span class="visually-hidden">Loading...</span>
                  </span>
                  Sign In
                </button>

                <!-- Demo Accounts -->
                <div class="mb-3">
                  <p class="text-muted small text-center mb-2">Demo Accounts:</p>
                  <div class="d-grid gap-2">
                    <button type="button" class="btn btn-outline-info btn-sm" @click="fillDemoAccount('admin')">
                      <i class="bi bi-person-badge me-1"></i>
                      Admin Demo
                    </button>
                    <button type="button" class="btn btn-outline-success btn-sm" @click="fillDemoAccount('engineer')">
                      <i class="bi bi-person-gear me-1"></i>
                      Engineer Demo
                    </button>
                  </div>
                </div>
              </form>

              <!-- Register Form -->
              <form @submit.prevent="handleRegister" v-else>
                <div class="mb-3">
                  <label for="regName" class="form-label">Full Name</label>
                  <input id="regName" type="text" class="form-control" v-model="registerForm.name" required>
                </div>

                <div class="mb-3">
                  <label for="regEmail" class="form-label">Email</label>
                  <input id="regEmail" type="email" class="form-control" v-model="registerForm.email" required>
                </div>

                <div class="mb-3">
                  <label for="regPassword" class="form-label">Password</label>
                  <input id="regPassword" type="password" class="form-control" v-model="registerForm.password" required
                    minlength="6">
                </div>

                <div class="mb-3">
                  <label for="regRole" class="form-label">Role</label>
                  <select id="regRole" class="form-select" v-model="registerForm.role">
                    <option value="viewer">Viewer</option>
                    <option value="editor">Editor</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <!-- Register Error -->
                <div v-if="registerError" class="alert alert-danger" role="alert">
                  <i class="bi bi-exclamation-triangle me-2"></i>
                  {{ registerError }}
                </div>

                <!-- Register Success -->
                <div v-if="registerSuccess" class="alert alert-success" role="alert">
                  <i class="bi bi-check-circle me-2"></i>
                  Registration successful! You can now sign in.
                </div>

                <button type="submit" class="btn btn-success w-100 mb-3" :disabled="authStore.loading">
                  <span v-if="authStore.loading" class="spinner-border spinner-border-sm me-2" role="status">
                    <span class="visually-hidden">Loading...</span>
                  </span>
                  Create Account
                </button>
              </form>

              <!-- Toggle Forms -->
              <div class="text-center">
                <button type="button" class="btn btn-link text-decoration-none" @click="toggleForm">
                  {{ showRegister ? 'Already have an account? Sign in' : "Don't have an account? Sign up" }}
                </button>
              </div>

              <!-- Divider -->
              <hr class="my-4">

              <!-- Additional Links -->
              <div class="text-center">
                <div class="d-flex justify-content-between align-items-center">
                  <a href="#" class="text-muted small text-decoration-none">
                    Forgot Password?
                  </a>
                  <a href="/help" class="text-muted small text-decoration-none" target="_blank">
                    Need Help?
                  </a>
                </div>
              </div>
            </div>
          </div>

          <!-- Features Card -->
          <div class="card mt-4 border-0 bg-transparent">
            <div class="card-body text-center">
              <h6 class="text-muted mb-3">Railway Infrastructure Design Tool</h6>
              <div class="row text-center">
                <div class="col-4">
                  <i class="bi bi-diagram-3 display-6 text-primary mb-2"></i>
                  <div class="small text-muted">Track Planning</div>
                </div>
                <div class="col-4">
                  <i class="bi bi-robot display-6 text-success mb-2"></i>
                  <div class="small text-muted">AI Assistance</div>
                </div>
                <div class="col-4">
                  <i class="bi bi-cloud-download display-6 text-info mb-2"></i>
                  <div class="small text-muted">Export Options</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@stores/authStore'

// Router and stores
const router = useRouter()
const authStore = useAuthStore()

// Component state
const showRegister = ref(false)
const showPassword = ref(false)
const loginError = ref('')
const registerError = ref('')
const registerSuccess = ref(false)

// Forms
const loginForm = ref({
  email: '',
  password: '',
  rememberMe: false
})

const registerForm = ref({
  name: '',
  email: '',
  password: '',
  role: 'editor'
})

// Methods
const handleLogin = async () => {
  try {
    loginError.value = ''
    authStore.clearError()

    await authStore.login({
      email: loginForm.value.email,
      password: loginForm.value.password,
      rememberMe: loginForm.value.rememberMe
    })

    // Redirect to editor
    router.push('/editor')
  } catch (error) {
    loginError.value = error.message || 'Login failed. Please try again.'
  }
}

const handleRegister = async () => {
  try {
    registerError.value = ''
    registerSuccess.value = false
    authStore.clearError()

    await authStore.register(registerForm.value)

    registerSuccess.value = true

    // Auto switch to login after successful registration
    setTimeout(() => {
      showRegister.value = false
      registerSuccess.value = false
      // Pre-fill login form
      loginForm.value.email = registerForm.value.email
    }, 2000)

  } catch (error) {
    registerError.value = error.message || 'Registration failed. Please try again.'
  }
}

const toggleForm = () => {
  showRegister.value = !showRegister.value
  loginError.value = ''
  registerError.value = ''
  registerSuccess.value = false
  authStore.clearError()
}

const fillDemoAccount = (type) => {
  if (type === 'admin') {
    loginForm.value.email = 'admin@railway.com'
    loginForm.value.password = 'admin123'
  } else if (type === 'engineer') {
    loginForm.value.email = 'engineer@railway.com'
    loginForm.value.password = 'engineer123'
  }
}

// Lifecycle
onMounted(() => {
  // Clear any existing auth state
  if (authStore.isAuthenticated) {
    router.push('/editor')
  }

  // Clear any previous errors
  authStore.clearError()
})

</script>