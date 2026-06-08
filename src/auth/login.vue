<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/authStore'

const router = useRouter()
const authStore = useAuthStore()
const showPassword = ref(false)
const isSigningIn = ref(false)
const email = ref('')
const password = ref('')
const loginError = ref('')

const togglePass = () => {
  showPassword.value = !showPassword.value
}

const handleLogin = async () => {
  loginError.value = ''

  if (!email.value.trim() || !password.value) {
    loginError.value = 'Please enter your email and password.'
    return
  }

  isSigningIn.value = true

  try {
    await authStore.login({
      email: email.value.trim(),
      password: password.value,
    })

    router.push('/chat')
  } catch (error) {
    loginError.value = authStore.error || 'Invalid email or password.'
  } finally {
    isSigningIn.value = false
  }
}
</script>

<style scoped>
:root {
      --bg: #0d0f1a;
      --surface: #13162a;
      --card: #1a1e35;
      --border: rgba(255,255,255,0.07);
      --purple: #8b5cf6;
      --violet: #7c3aed;
      --indigo: #4f46e5;
      --pink: #ec4899;
      --text: #f1f5f9;
      --muted: #64748b;
      --soft: #94a3b8;
    }

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'DM Sans', sans-serif;
      background: var(--bg);
      color: var(--text);
      min-height: 100vh;
      display: flex;
      overflow: hidden;
    }

    /* ── Left panel ── */
    .left-panel {
      flex: 1;
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 60px;
      overflow: hidden;
    }

    .left-panel::before {
      content: '';
      position: absolute;
      inset: 0;
      background:
        radial-gradient(ellipse 80% 60% at 20% 50%, rgba(139,92,246,.35) 0%, transparent 60%),
        radial-gradient(ellipse 60% 80% at 80% 20%, rgba(79,70,229,.3) 0%, transparent 55%),
        radial-gradient(ellipse 70% 70% at 60% 90%, rgba(236,72,153,.2) 0%, transparent 60%);
      pointer-events: none;
    }

    .noise {
      position: absolute;
      inset: 0;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
      pointer-events: none;
    }

    /* Floating orbs */
    .orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(60px);
      opacity: 0.25;
      animation: drift 8s ease-in-out infinite alternate;
    }
    .orb-1 { width:380px; height:380px; background: var(--purple); top:-80px; left:-60px; animation-delay:0s; }
    .orb-2 { width:300px; height:300px; background: var(--indigo); bottom:-60px; right:10%; animation-delay:2s; }
    .orb-3 { width:200px; height:200px; background: var(--pink); top:40%; right:5%; animation-delay:4s; }

    @keyframes drift {
      from { transform: translate(0,0) scale(1); }
      to   { transform: translate(20px,30px) scale(1.05); }
    }

    /* Brand */
    .brand {
      position: relative;
      z-index: 2;
      margin-bottom: 60px;
    }
    .brand-logo {
      display: inline-flex;
      align-items: center;
      gap: 12px;
    }
    .brand-icon {
      width: 44px;
      height: 44px;
      border-radius: 14px;
      background: linear-gradient(135deg, var(--purple), var(--indigo));
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
      box-shadow: 0 0 24px rgba(139,92,246,.5);
    }
    .brand-name {
      font-family: 'Syne', sans-serif;
      font-size: 26px;
      font-weight: 800;
      letter-spacing: -0.5px;
    }

    .hero-text {
      position: relative;
      z-index: 2;
    }
    .hero-text h1 {
      font-family: 'Syne', sans-serif;
      font-size: clamp(38px, 5vw, 58px);
      font-weight: 800;
      line-height: 1.05;
      letter-spacing: -1.5px;
      margin-bottom: 20px;
    }
    .gradient-word {
      background: linear-gradient(135deg, #a78bfa, #818cf8, #ec4899);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .hero-text p {
      font-size: 17px;
      color: var(--soft);
      line-height: 1.7;
      max-width: 400px;
      font-weight: 300;
    }

    /* Feature pills */
    .features {
      position: relative;
      z-index: 2;
      margin-top: 48px;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .feature-item {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 14px;
      color: var(--soft);
    }
    .feature-dot {
      width: 32px;
      height: 32px;
      border-radius: 9px;
      background: rgba(139,92,246,.15);
      border: 1px solid rgba(139,92,246,.3);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 15px;
      flex-shrink: 0;
    }

    /* Chat bubble preview */
    .chat-preview {
      position: absolute;
      bottom: 50px;
      right: 40px;
      z-index: 2;
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-width: 260px;
    }
    .bubble {
      padding: 11px 16px;
      border-radius: 18px;
      font-size: 13px;
      line-height: 1.45;
      animation: floatUp .6s ease forwards;
      opacity: 0;
    }
    .bubble-in {
      background: var(--card);
      border: 1px solid var(--border);
      align-self: flex-start;
      border-bottom-left-radius: 4px;
      animation-delay: .3s;
    }
    .bubble-out {
      background: linear-gradient(135deg, var(--purple), var(--indigo));
      align-self: flex-end;
      border-bottom-right-radius: 4px;
      animation-delay: .7s;
    }
    .bubble-in-2 {
      background: var(--card);
      border: 1px solid var(--border);
      align-self: flex-start;
      border-bottom-left-radius: 4px;
      animation-delay: 1.1s;
    }
    @keyframes floatUp {
      from { opacity:0; transform:translateY(12px); }
      to   { opacity:1; transform:translateY(0); }
    }

    /* ── Right panel (form) ── */
    .right-panel {
      width: 480px;
      background: var(--surface);
      border-left: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 60px 52px;
      position: relative;
      overflow: hidden;
    }

    .right-panel::before {
      content: '';
      position: absolute;
      top: -120px;
      right: -100px;
      width: 300px;
      height: 300px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(139,92,246,.12), transparent 70%);
      pointer-events: none;
    }

    .form-head {
      margin-bottom: 36px;
    }
    .form-head h2 {
      font-family: 'Syne', sans-serif;
      font-size: 30px;
      font-weight: 700;
      letter-spacing: -0.5px;
      margin-bottom: 8px;
    }
    .form-head p {
      color: var(--muted);
      font-size: 15px;
    }
    .form-head a {
      color: var(--purple);
      text-decoration: none;
      font-weight: 500;
      transition: color .2s;
    }
    .form-head a:hover { color: #a78bfa; }

    .auth-error {
      background: rgba(239,68,68,.1);
      border: 1px solid rgba(239,68,68,.35);
      border-radius: 12px;
      color: #fecaca;
      font-size: 13px;
      line-height: 1.4;
      margin-bottom: 18px;
      padding: 11px 13px;
      position: relative;
      z-index: 2;
    }

    .form-group {
      margin-bottom: 20px;
      position: relative;
    }
    .form-label {
      display: block;
      font-size: 13px;
      font-weight: 500;
      color: var(--soft);
      margin-bottom: 8px;
      letter-spacing: .3px;
    }
    .input-wrap {
      position: relative;
    }
    .input-icon {
      position: absolute;
      left: 16px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--muted);
      font-size: 16px;
      pointer-events: none;
      transition: color .2s;
    }
    .form-input {
      width: 100%;
      background: var(--card);
      border: 1.5px solid var(--border);
      border-radius: 12px;
      padding: 14px 44px;
      color: var(--text);
      font-family: 'DM Sans', sans-serif;
      font-size: 15px;
      outline: none;
      transition: all .25s;
    }
    .form-input::placeholder { color: var(--muted); }
    .form-input:focus {
      border-color: var(--purple);
      background: rgba(139,92,246,.08);
      box-shadow: 0 0 0 4px rgba(139,92,246,.12);
    }
    .form-input:focus + .input-focus-ring { opacity: 1; }
    .input-wrap:focus-within .input-icon { color: var(--purple); }

    .eye-toggle {
      position: absolute;
      right: 14px;
      top: 50%;
      transform: translateY(-50%);
      background: transparent;
      border: none;
      color: var(--muted);
      cursor: pointer;
      font-size: 17px;
      padding: 4px;
      transition: color .2s;
    }
    .eye-toggle:hover { color: var(--soft); }

    .form-options {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 28px;
    }
    .remember-label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      color: var(--soft);
      cursor: pointer;
      user-select: none;
    }
    .custom-check {
      appearance: none;
      width: 18px; height: 18px;
      border: 1.5px solid var(--border);
      border-radius: 5px;
      background: var(--card);
      cursor: pointer;
      position: relative;
      transition: all .2s;
      flex-shrink: 0;
    }
    .custom-check:checked {
      background: var(--purple);
      border-color: var(--purple);
    }
    .custom-check:checked::after {
      content: '';
      position: absolute;
      left: 4px; top: 1px;
      width: 7px; height: 11px;
      border: 2px solid white;
      border-top: none; border-left: none;
      transform: rotate(45deg);
    }
    .forgot-link {
      font-size: 13px;
      color: var(--purple);
      text-decoration: none;
      font-weight: 500;
      transition: color .2s;
    }
    .forgot-link:hover { color: #a78bfa; }

    .btn-signin {
      width: 100%;
      padding: 15px;
      border: none;
      border-radius: 12px;
      background: linear-gradient(135deg, var(--purple), var(--indigo));
      color: white;
      font-family: 'Syne', sans-serif;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      transition: all .3s;
      letter-spacing: .3px;
    }
    .btn-signin::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, #a78bfa, var(--purple));
      opacity: 0;
      transition: opacity .3s;
    }
    .btn-signin:hover::before { opacity: 1; }
    .btn-signin span { position: relative; z-index: 1; }
    .btn-signin:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(139,92,246,.4); }
    .btn-signin:active { transform: translateY(0); }
    .btn-signin:disabled {
      cursor: not-allowed;
      opacity: .75;
      transform: none;
    }
    .spin-icon {
      animation: spin .6s linear infinite;
      display: inline-block;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .divider {
      display: flex;
      align-items: center;
      gap: 16px;
      margin: 28px 0;
      color: var(--muted);
      font-size: 13px;
    }
    .divider::before, .divider::after {
      content: '';
      flex: 1;
      height: 1px;
      background: var(--border);
    }

    .social-btns {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    .social-btn {
      padding: 12px;
      border: 1.5px solid var(--border);
      border-radius: 12px;
      background: var(--card);
      color: var(--soft);
      font-family: 'DM Sans', sans-serif;
      font-size: 14px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all .25s;
    }
    .social-btn:hover {
      border-color: var(--purple);
      color: var(--text);
      background: rgba(139,92,246,.08);
    }
    .social-icon { font-size: 18px; }

    /* Form animation */
    .form-group, .form-options, .btn-signin, .divider, .social-btns {
      animation: fadeUp .5s ease both;
    }
    .form-group:nth-child(1) { animation-delay: .1s; }
    .form-group:nth-child(2) { animation-delay: .2s; }
    .form-options { animation-delay: .3s; }
    .btn-signin { animation-delay: .35s; }
    .divider { animation-delay: .4s; }
    .social-btns { animation-delay: .45s; }

    @keyframes fadeUp {
      from { opacity:0; transform: translateY(16px); }
      to   { opacity:1; transform: translateY(0); }
    }

    @media (max-width: 900px) {
      .left-panel { display: none; }
      .right-panel { width: 100%; padding: 40px 28px; }
    }
</style>
<template>
     <!-- LEFT PANEL -->
  <div class="left-panel">
    <div class="noise"></div>
    <div class="orb orb-1"></div>
    <div class="orb orb-2"></div>
    <div class="orb orb-3"></div>

    <div class="brand">
      <div class="brand-logo">
        <div class="brand-icon">💬</div>
        <span class="brand-name">ChatterHub</span>
      </div>
    </div>

    <div class="hero-text">
      <h1>Connect with<br><span class="gradient-word">everyone,</span><br>everywhere.</h1>
      <p>Real-time messaging, group chats, and communities — all in one beautifully designed space.</p>
    </div>

    <div class="features">
      <div class="feature-item">
        <div class="feature-dot">💬</div>
        <span>Instant private & group messaging</span>
      </div>
      <div class="feature-item">
        <div class="feature-dot">🌐</div>
        <span>Join public communities & channels</span>
      </div>
      <div class="feature-item">
        <div class="feature-dot">🔐</div>
        <span>End-to-end encrypted conversations</span>
      </div>
    </div>

    <div class="chat-preview">
      <div class="bubble bubble-in">Hey! Are you joining the design meetup? 👋</div>
      <div class="bubble bubble-out">Absolutely! Can't wait 🎉</div>
      <div class="bubble bubble-in-2">Perfect, see you there ✨</div>
    </div>
  </div>

  <!-- RIGHT PANEL -->
  <div class="right-panel">
    <div class="form-head">
      <h2>Welcome back 👋</h2>
      <p>Don't have an account? <RouterLink to="/signup">Sign up free</RouterLink></p>
    </div>

    <div class="auth-error" v-if="loginError">{{ loginError }}</div>

    <div class="form-group">
      <label class="form-label">Email address</label>
      <div class="input-wrap">
        <i class="bi bi-envelope input-icon"></i>
        <input type="email" class="form-input" placeholder="you@example.com" v-model="email">
      </div>
    </div>

    <div class="form-group">
      <label class="form-label">Password</label>
      <div class="input-wrap">
        <i class="bi bi-lock input-icon"></i>
        <input :type="showPassword ? 'text' : 'password'" class="form-input" id="loginPass" placeholder="Enter your password" v-model="password" @keyup.enter="handleLogin">
        <button class="eye-toggle" type="button" @click="togglePass">
          <i :class="showPassword ? 'bi bi-eye' : 'bi bi-eye-slash'"></i>
        </button>
      </div>
    </div>

    <div class="form-options">
      <label class="remember-label">
        <input type="checkbox" class="custom-check">
        Remember me
      </label>
      <a href="#" class="forgot-link">Forgot password?</a>
    </div>

    <button class="btn-signin" @click="handleLogin" :disabled="isSigningIn">
      <span id="loginBtnText">
        <i v-if="isSigningIn" class="bi bi-arrow-clockwise spin-icon"></i>
        <i v-else class="bi bi-box-arrow-in-right"></i>
        &nbsp;{{ isSigningIn ? 'Signing in...' : 'Sign In' }}
      </span>
    </button>

    <div class="divider">or continue with</div>

    <div class="social-btns">
      <button class="social-btn">
        <span class="social-icon">G</span> Google
      </button>
      <button class="social-btn">
        <i class="bi bi-github social-icon"></i> GitHub
      </button>
    </div>
  </div>
</template>
