<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/authStore'

const router = useRouter()
const authStore = useAuthStore()
const email = ref('')
const touched = ref(false)
const currentStep = ref(1)
const password = ref('')
const confirmPass = ref('')
const username = ref('')
const firstName = ref('')
const lastName = ref('')
const bio = ref('')
const showPassword = ref(false)
const avatarFile = ref(null)
const avatarSrc = ref('https://i.pravatar.cc/150?img=1')
const selectedAvatarSeed = ref(1)
const selectedInterests = ref([])
const termsAccepted = ref(false)
const isCreating = ref(false)
const signupComplete = ref(false)
const signupError = ref('')
const stepTitles = ['', 'Create your account', 'Set up your profile', 'Pick your interests']
const stepSubs = ['', 'Already a member?', 'Tell people who you are', 'Personalize your experience']
const progressWidths = ['', '33%', '66%', '100%']
const avatarSeeds = [1, 5, 12, 9, 14]
const interests = [
    { icon: '🎨', name: 'Design' },
    { icon: '💻', name: 'Tech' },
    { icon: '🎮', name: 'Gaming' },
    { icon: '📚', name: 'Books' },
    { icon: '🎵', name: 'Music' },
    { icon: '🏋️', name: 'Fitness' },
    { icon: '🍕', name: 'Food' },
    { icon: '✈️', name: 'Travel' },
    { icon: '📸', name: 'Photography' },
    { icon: '🎬', name: 'Movies' },
    { icon: '🌿', name: 'Nature' },
    { icon: '🚀', name: 'Science' },
]

defineProps({
    msg: {
        type: String,
        required: true,
    },
})

const goStep = (n) => {
    currentStep.value = n
}

const emailValidation = computed(() => {
    if(!touched.value) return null
    const value = email.value.trim()
    if(!value) return false
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) return false
    return true
})
const showEmailError = computed(() => emailValidation.value === false)
const showEmailSuccess = computed(() => emailValidation.value === true)
const validateEmail = () => {
    touched.value = true
}

const passwordStrength = computed(() => {
    const val = password.value
    if(!val) {
        return { width: '0', background: 'transparent', label: 'Enter a password to see strength' }
    }

    let score = 0
    if(val.length >= 8) score++
    if(/[A-Z]/.test(val)) score++
    if(/[0-9]/.test(val)) score++
    if(/[^A-Za-z0-9]/.test(val)) score++

    const levels = [
        { width: '20%', background: '#ef4444', label: 'Too weak' },
        { width: '40%', background: '#f97316', label: 'Weak' },
        { width: '65%', background: '#f59e0b', label: 'Fair' },
        { width: '82%', background: '#10b981', label: 'Strong' },
        { width: '100%', background: '#059669', label: 'Very strong 💪' },
    ]

    return levels[Math.min(score, 4)]
})

const confirmState = computed(() => {
    if(!confirmPass.value) return null
    return password.value === confirmPass.value
})

const usernameState = computed(() => {
    if(!username.value) return null
    return /^[a-z0-9_]{3,20}$/.test(username.value)
})

const usernameHint = computed(() => {
    if(usernameState.value === null) return 'This is how others will find you'
    if(usernameState.value) return `@${username.value} is available`
    return 'Use lowercase letters, numbers, _ only (3-20 chars)'
})

const interestHint = computed(() => {
    const count = selectedInterests.value.length
    if(count === 0) return 'Select at least 3 interests'
    if(count < 3) return `${3 - count} more to go...`
    return `${count} selected ✓`
})

const togglePass = () => {
    showPassword.value = !showPassword.value
}

const openAvatarPicker = () => {
    avatarFile.value?.click()
}

const selectSeed = (num) => {
    selectedAvatarSeed.value = num
    avatarSrc.value = `https://i.pravatar.cc/150?img=${num}`
}

const previewAvatar = (event) => {
    const file = event.target.files?.[0]
    if(!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
        avatarSrc.value = e.target.result
        selectedAvatarSeed.value = null
    }
    reader.readAsDataURL(file)
}

const toggleInterest = (name) => {
    if(selectedInterests.value.includes(name)) {
        selectedInterests.value = selectedInterests.value.filter((item) => item !== name)
        return
    }

    selectedInterests.value = [...selectedInterests.value, name]
}

const handleSignup = async () => {
    signupError.value = ''

    if(selectedInterests.value.length < 3) {
        signupError.value = 'Please select at least 3 interests.'
        return
    }

    if(!termsAccepted.value) {
        signupError.value = 'Please agree to the Terms of Service.'
        return
    }

    if(!emailValidation.value || !usernameState.value || password.value.length < 8 || confirmState.value !== true) {
        signupError.value = 'Please complete the account details before creating your account.'
        return
    }

    isCreating.value = true

    try {
        await authStore.register({
            username: username.value.trim(),
            firstName: firstName.value.trim(),
            lastName: lastName.value.trim(),
            email: email.value.trim(),
            password: password.value,
            bio: bio.value.trim(),
            profilePicture: avatarSrc.value,
            agreeTerms: termsAccepted.value,
        })

        signupComplete.value = true
    } catch (error) {
        signupError.value = authStore.error || 'Unable to create your account.'
    } finally {
        isCreating.value = false
    }
}

const startChatting = () => {
    router.push('/chat')
}
</script>

<style :scoped>
:root {
      --bg: #0d0f1a;
      --surface: #13162a;
      --card: #1a1e35;
      --border: rgba(255,255,255,0.07);
      --purple: #8b5cf6;
      --violet: #7c3aed;
      --indigo: #4f46e5;
      --pink: #ec4899;
      --green: #10b981;
      --text: #f1f5f9;
      --muted: #64748b;
      --soft: #94a3b8;
    }

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body >#app {
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
        radial-gradient(ellipse 80% 60% at 30% 40%, rgba(236,72,153,.3) 0%, transparent 60%),
        radial-gradient(ellipse 60% 80% at 80% 80%, rgba(79,70,229,.28) 0%, transparent 55%),
        radial-gradient(ellipse 70% 70% at 10% 90%, rgba(139,92,246,.25) 0%, transparent 60%);
      pointer-events: none;
    }

    .noise {
      position: absolute;
      inset: 0;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
      pointer-events: none;
    }

    .orb { position:absolute; border-radius:50%; filter:blur(60px); opacity:.22; animation:drift 8s ease-in-out infinite alternate; }
    .orb-1 { width:350px; height:350px; background:var(--pink); top:-60px; right:10%; animation-delay:0s; }
    .orb-2 { width:280px; height:280px; background:var(--purple); bottom:-40px; left:-40px; animation-delay:2s; }
    .orb-3 { width:180px; height:180px; background:var(--indigo); top:40%; left:15%; animation-delay:4s; }

    @keyframes drift {
      from { transform:translate(0,0) scale(1); }
      to   { transform:translate(20px,30px) scale(1.05); }
    }

    .brand {
      position: relative;
      z-index: 2;
      margin-bottom: 50px;
    }
    .brand-logo {
      display: inline-flex;
      align-items: center;
      gap: 12px;
    }
    .brand-icon {
      width: 44px; height: 44px;
      border-radius: 14px;
      background: linear-gradient(135deg, var(--pink), var(--purple));
      display: flex; align-items: center; justify-content: center;
      font-size: 22px;
      box-shadow: 0 0 24px rgba(236,72,153,.5);
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
      font-size: clamp(36px, 4.5vw, 54px);
      font-weight: 800;
      line-height: 1.05;
      letter-spacing: -1.5px;
      margin-bottom: 20px;
    }
    .gradient-word {
      background: linear-gradient(135deg, #f9a8d4, #c084fc, #818cf8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .hero-text p {
      font-size: 17px;
      color: var(--soft);
      line-height: 1.7;
      max-width: 380px;
      font-weight: 300;
    }

    /* Onboarding steps visual */
    .steps-visual {
      position: relative;
      z-index: 2;
      margin-top: 50px;
      display: flex;
      flex-direction: column;
      gap: 0;
    }
    .step-visual-item {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      padding: 16px 0;
      position: relative;
    }
    .step-visual-item:not(:last-child)::after {
      content: '';
      position: absolute;
      left: 15px;
      top: 44px;
      bottom: 0;
      width: 2px;
      background: linear-gradient(to bottom, rgba(139,92,246,.4), transparent);
    }
    .step-num {
      width: 32px; height: 32px;
      border-radius: 50%;
      border: 2px solid rgba(139,92,246,.4);
      background: rgba(139,92,246,.12);
      display: flex; align-items: center; justify-content: center;
      font-family: 'Syne', sans-serif;
      font-size: 13px;
      font-weight: 700;
      color: var(--purple);
      flex-shrink: 0;
    }
    .step-num.done {
      background: var(--green);
      border-color: var(--green);
      color: white;
    }
    .step-text strong {
      display: block;
      font-size: 14px;
      font-weight: 500;
      margin-bottom: 3px;
    }
    .step-text span {
      font-size: 13px;
      color: var(--muted);
    }

    /* ── Right panel ── */
    .right-panel {
      width: 500px;
      background: var(--surface);
      border-left: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 50px 52px;
      position: relative;
      overflow: hidden;
    }

    .right-panel::before {
      content: '';
      position: absolute;
      top: -100px; left: -100px;
      width: 280px; height: 280px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(236,72,153,.1), transparent 70%);
      pointer-events: none;
    }

    /* ── Progress bar ── */
    .progress-bar-wrap {
      margin-bottom: 36px;
      position: relative;
      z-index: 2;
    }
    .progress-steps {
      display: flex;
      justify-content: space-between;
      margin-bottom: 12px;
    }
    .progress-step-label {
      font-size: 11px;
      font-weight: 600;
      color: var(--muted);
      text-transform: uppercase;
      letter-spacing: .5px;
      transition: color .3s;
    }
    .progress-step-label.active { color: var(--purple); }
    .progress-step-label.done { color: var(--green); }

    .progress-track {
      width: 100%;
      height: 4px;
      background: var(--border);
      border-radius: 2px;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      border-radius: 2px;
      background: linear-gradient(90deg, var(--purple), var(--pink));
      transition: width .5s cubic-bezier(.4,0,.2,1);
      width: 33%;
    }

    /* ── Form head ── */
    .form-head {
      margin-bottom: 30px;
      position: relative;
      z-index: 2;
    }
    .form-head h2 {
      font-family: 'Syne', sans-serif;
      font-size: 26px;
      font-weight: 700;
      letter-spacing: -0.5px;
      margin-bottom: 6px;
    }
    .form-head p {
      color: var(--muted);
      font-size: 14px;
    }
    .form-head a {
      color: var(--purple);
      text-decoration: none;
      font-weight: 500;
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

    /* ── Steps ── */
    .step { display: none; position: relative; z-index: 2; }
    .step.active { display: block; animation: stepIn .35s ease both; }

    @keyframes stepIn {
      from { opacity:0; transform: translateX(20px); }
      to   { opacity:1; transform: translateX(0); }
    }

    /* ── Fields ── */
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

    .form-group { margin-bottom: 18px; }
    .form-label {
      display: block;
      font-size: 13px;
      font-weight: 500;
      color: var(--soft);
      margin-bottom: 8px;
    }
    .input-wrap { position: relative; }
    .input-icon {
      position: absolute;
      left: 14px;
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
      padding: 13px 44px;
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
      box-shadow: 0 0 0 4px rgba(139,92,246,.1);
    }
    .form-input.error {
      border-color: #ef4444;
      box-shadow: 0 0 0 4px rgba(239,68,68,.08);
    }
    .form-input.success {
      border-color: var(--green);
    }
    .input-wrap:focus-within .input-icon { color: var(--purple); }

    .input-check {
      position: absolute;
      right: 14px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 15px;
      pointer-events: none;
    }
    .input-check.ok  { color: var(--green); }
    .input-check.err { color: #ef4444; }

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

    .field-hint {
      font-size: 12px;
      color: var(--muted);
      margin-top: 6px;
    }
    .field-hint.err { color: #ef4444; }

    /* Password strength */
    .strength-bar {
      height: 3px;
      border-radius: 2px;
      background: var(--border);
      margin-top: 8px;
      overflow: hidden;
    }
    .strength-fill {
      height: 100%;
      border-radius: 2px;
      width: 0;
      transition: width .3s, background .3s;
    }

    /* Avatar picker */
    .avatar-picker {
      display: flex;
      align-items: center;
      gap: 20px;
      margin-bottom: 24px;
    }
    .avatar-preview {
      width: 80px; height: 80px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--purple), var(--pink));
      display: flex; align-items: center; justify-content: center;
      font-size: 30px;
      border: 3px solid var(--border);
      overflow: hidden;
      flex-shrink: 0;
      position: relative;
      cursor: pointer;
      transition: all .3s;
    }
    .avatar-preview:hover { border-color: var(--purple); }
    .avatar-preview img { width:100%; height:100%; object-fit:cover; border-radius:50%; }
    .avatar-preview .overlay {
      position: absolute; inset:0;
      background: rgba(0,0,0,.5);
      display: flex; align-items:center; justify-content:center;
      opacity: 0;
      border-radius: 50%;
      font-size: 22px;
      transition: opacity .3s;
    }
    .avatar-preview:hover .overlay { opacity:1; }
    .avatar-options { display:flex; flex-direction:column; gap:8px; }
    .avatar-options p { font-size: 13px; color: var(--soft); }
    .avatar-seeds { display:flex; gap:10px; flex-wrap:wrap; }
    .seed-avatar {
      width: 36px; height: 36px;
      border-radius: 50%;
      overflow: hidden;
      cursor: pointer;
      border: 2px solid transparent;
      transition: all .2s;
    }
    .seed-avatar:hover { border-color: var(--purple); transform: scale(1.1); }
    .seed-avatar.selected { border-color: var(--purple); }
    .seed-avatar img { width:100%; height:100%; object-fit:cover; }

    /* Interest pills */
    .interests-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-bottom: 8px;
    }
    .interest-pill {
      padding: 8px 16px;
      border-radius: 50px;
      border: 1.5px solid var(--border);
      background: var(--card);
      color: var(--soft);
      font-size: 13px;
      cursor: pointer;
      transition: all .25s;
      user-select: none;
    }
    .interest-pill:hover {
      border-color: var(--purple);
      color: var(--text);
    }
    .interest-pill.selected {
      background: rgba(139,92,246,.2);
      border-color: var(--purple);
      color: var(--text);
    }
    .interest-pill span { margin-right: 5px; }

    /* Terms */
    .terms-label {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      font-size: 13px;
      color: var(--soft);
      cursor: pointer;
      margin-bottom: 24px;
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
      margin-top: 1px;
    }
    .custom-check:checked { background: var(--purple); border-color: var(--purple); }
    .custom-check:checked::after {
      content: '';
      position: absolute;
      left: 4px; top: 1px;
      width: 7px; height: 11px;
      border: 2px solid white;
      border-top: none; border-left: none;
      transform: rotate(45deg);
    }
    .terms-label a { color: var(--purple); text-decoration: none; }

    /* Buttons */
    .btn-next {
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
    .btn-next::before {
      content: '';
      position: absolute; inset:0;
      background: linear-gradient(135deg, #a78bfa, var(--purple));
      opacity: 0;
      transition: opacity .3s;
    }
    .btn-next:hover::before { opacity:1; }
    .btn-next span { position: relative; z-index:1; }
    .btn-next:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(139,92,246,.4); }
    .btn-next:active { transform: translateY(0); }

    .btn-back {
      width: 100%;
      padding: 13px;
      border: 1.5px solid var(--border);
      border-radius: 12px;
      background: transparent;
      color: var(--soft);
      font-family: 'DM Sans', sans-serif;
      font-size: 15px;
      cursor: pointer;
      transition: all .3s;
      margin-top: 12px;
    }
    .btn-back:hover { border-color: var(--purple); color: var(--text); }
    .btn-next:disabled {
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

    /* Success screen */
    .success-screen {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 20px 0;
      animation: fadeUp .5s ease;
      position: relative;
      z-index: 2;
    }
    .success-icon {
      width: 90px; height: 90px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--green), #059669);
      display: flex; align-items:center; justify-content:center;
      font-size: 40px;
      margin-bottom: 24px;
      box-shadow: 0 0 40px rgba(16,185,129,.3);
      animation: popIn .5s cubic-bezier(.34,1.56,.64,1) .2s both;
    }
    @keyframes popIn {
      from { transform: scale(0); opacity:0; }
      to   { transform: scale(1); opacity:1; }
    }
    .success-screen h2 {
      font-family: 'Syne', sans-serif;
      font-size: 26px;
      font-weight: 700;
      letter-spacing: -.5px;
      margin-bottom: 10px;
    }
    .success-screen p {
      color: var(--soft);
      font-size: 15px;
      max-width: 300px;
      line-height: 1.6;
      margin-bottom: 30px;
    }

    @keyframes fadeUp {
      from { opacity:0; transform:translateY(16px); }
      to   { opacity:1; transform:translateY(0); }
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
            <h1>Your voice,<br>your <span class="gradient-word">community,</span><br>your space.</h1>
            <p>Join millions who connect, share, and build meaningful conversations on ChatterHub.</p>
        </div>

        <div class="steps-visual" id="stepsVisual">
            <div class="step-visual-item">
                <div class="step-num" :class="{ done: currentStep > 1 }" id="sv1">{{ currentStep > 1 ? '✓' : '1' }}</div>
                <div class="step-text">
                    <strong>Create your account</strong>
                    <span>Your email and a strong password</span>
                </div>
            </div>
            <div class="step-visual-item">
                <div class="step-num" :class="{ done: currentStep > 2 }" id="sv2">{{ currentStep > 2 ? '✓' : '2' }}</div>
                <div class="step-text">
                    <strong>Set up your profile</strong>
                    <span>A name and photo people will see</span>
                </div>
            </div>
            <div class="step-visual-item">
                <div class="step-num" :class="{ done: currentStep > 3 }" id="sv3">3</div>
                <div class="step-text">
                    <strong>Pick your interests</strong>
                    <span>We'll find the right communities for you</span>
                </div>
            </div>
        </div>
    </div>

    <!-- RIGHT PANEL -->
    <div class="right-panel">

        <!-- Progress bar -->
        <div class="progress-bar-wrap" v-if="!signupComplete">
            <div class="progress-steps">
                <span class="progress-step-label" :class="{ active: currentStep === 1, done: currentStep > 1 }" id="pl1">Account</span>
                <span class="progress-step-label" :class="{ active: currentStep === 2, done: currentStep > 2 }" id="pl2">Profile</span>
                <span class="progress-step-label" :class="{ active: currentStep === 3 }" id="pl3">Interests</span>
            </div>
            <div class="progress-track">
                <div class="progress-fill" id="progressFill" :style="{ width: progressWidths[currentStep] }"></div>
            </div>
        </div>

        <div class="form-head" v-if="!signupComplete">
            <h2 id="stepTitle">{{ stepTitles[currentStep] }}</h2>
            <p id="stepSub">
                {{ stepSubs[currentStep] }}
                <RouterLink v-if="currentStep === 1" to="/login">Sign in</RouterLink>
            </p>
        </div>

        <div class="auth-error" v-if="signupError && !signupComplete">{{ signupError }}</div>

        <!-- STEP 1: Account -->
        <div class="step" :class="{ active: currentStep === 1 }" id="step1" v-if="!signupComplete">
            <div class="form-group">
                <label class="form-label">Email address</label>
                <div class="input-wrap">
                    <i class="bi bi-envelope input-icon"></i>
                    <input type="email" @input="validateEmail" class="form-input" :class="{'error':showEmailError,'success':showEmailSuccess}" id="email" placeholder="you@example.com"
                         v-model="email">
                    <i class="input-check ok" id="emailCheck" v-if="showEmailSuccess"><i class="bi bi-check-circle-fill"></i></i>
                </div>
                <div class="field-hint err" id="emailHint" v-if="showEmailError">Please enter a valid email address</div>
            </div>

            <div class="form-group">
                <label class="form-label">Password</label>
                <div class="input-wrap">
                    <i class="bi bi-lock input-icon"></i>
                    <input :type="showPassword ? 'text' : 'password'" class="form-input" id="password" placeholder="At least 8 characters"
                        v-model="password">
                    <button class="eye-toggle" type="button" @click="togglePass"><i
                            :class="showPassword ? 'bi bi-eye' : 'bi bi-eye-slash'"></i></button>
                </div>
                <div class="strength-bar">
                    <div class="strength-fill" id="strengthFill" :style="{ width: passwordStrength.width, background: passwordStrength.background }"></div>
                </div>
                <div class="field-hint" id="strengthLabel">{{ passwordStrength.label }}</div>
            </div>

            <div class="form-group">
                <label class="form-label">Confirm password</label>
                <div class="input-wrap">
                    <i class="bi bi-shield-lock input-icon"></i>
                    <input type="password" class="form-input" :class="{ success: confirmState === true, error: confirmState === false }" id="confirmPass" placeholder="Repeat your password"
                        v-model="confirmPass">
                    <i class="input-check ok" id="confirmCheck" v-if="confirmState === true"><i class="bi bi-check-circle-fill"></i></i>
                    <i class="input-check err" id="confirmCheck" v-else-if="confirmState === false"><i class="bi bi-x-circle-fill"></i></i>
                </div>
            </div>

            <button class="btn-next" @click="goStep(2)"><span><i class="bi bi-arrow-right"></i>
                    &nbsp;Continue</span></button>
        </div>

        <!-- STEP 2: Profile -->
        <div class="step" :class="{ active: currentStep === 2 }" id="step2" v-if="!signupComplete">
            <div class="avatar-picker">
                <div class="avatar-preview" id="avatarPreview" @click="openAvatarPicker">
                    <img id="avatarImg" :src="avatarSrc" alt="">
                    <div class="overlay">📷</div>
                </div>
                <input type="file" id="avatarFile" accept="image/*" style="display:none" ref="avatarFile" @change="previewAvatar">
                <div class="avatar-options">
                    <p>Choose an avatar</p>
                    <div class="avatar-seeds">
                        <div class="seed-avatar" :class="{ selected: selectedAvatarSeed === seed }" @click="selectSeed(seed)" v-for="seed in avatarSeeds" :key="seed"><img
                                :src="`https://i.pravatar.cc/150?img=${seed}`" alt=""></div>
                    </div>
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">First name</label>
                    <div class="input-wrap">
                        <i class="bi bi-person input-icon"></i>
                        <input type="text" class="form-input" id="firstName" placeholder="John" v-model="firstName">
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Last name</label>
                    <div class="input-wrap">
                        <i class="bi bi-person input-icon"></i>
                        <input type="text" class="form-input" id="lastName" placeholder="Doe" v-model="lastName">
                    </div>
                </div>
            </div>

            <div class="form-group">
                <label class="form-label">Username</label>
                <div class="input-wrap">
                    <i class="bi bi-at input-icon"></i>
                    <input type="text" class="form-input" :class="{ success: usernameState === true, error: usernameState === false }" id="username" placeholder="johndoe"
                        v-model="username">
                    <i class="input-check ok" id="usernameCheck" v-if="usernameState === true"><i class="bi bi-check-circle-fill"></i></i>
                    <i class="input-check err" id="usernameCheck" v-else-if="usernameState === false"><i class="bi bi-x-circle-fill"></i></i>
                </div>
                <div class="field-hint" :class="{ err: usernameState === false }" id="usernameHint">{{ usernameHint }}</div>
            </div>

            <div class="form-group">
                <label class="form-label">Bio <span style="color:var(--muted)">(optional)</span></label>
                <div class="input-wrap">
                    <i class="bi bi-chat-quote input-icon" style="top:16px;transform:none"></i>
                    <textarea class="form-input" id="bio" placeholder="Say something about yourself…" rows="2"
                        style="padding-top:13px;resize:none;padding-left:44px" v-model="bio"></textarea>
                </div>
            </div>

            <button class="btn-next" @click="goStep(3)"><span><i class="bi bi-arrow-right"></i>
                    &nbsp;Continue</span></button>
            <button class="btn-back" @click="goStep(1)"><i class="bi bi-arrow-left"></i> Back</button>
        </div>

        <!-- STEP 3: Interests -->
        <div class="step" :class="{ active: currentStep === 3 }" id="step3" v-if="!signupComplete">
            <p style="font-size:14px;color:var(--soft);margin-bottom:20px;">Pick topics you love — we'll match you with
                the right communities.</p>

            <div class="interests-grid" id="interestGrid">
                <div class="interest-pill" :class="{ selected: selectedInterests.includes(interest.name) }" @click="toggleInterest(interest.name)" v-for="interest in interests" :key="interest.name"><span>{{ interest.icon }}</span> {{ interest.name }}</div>
            </div>

            <div class="field-hint" style="margin-bottom:20px;" id="interestHint">{{ interestHint }}</div>

            <label class="terms-label">
                <input type="checkbox" class="custom-check" id="termsCheck" v-model="termsAccepted">
                <span>I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a></span>
            </label>

            <button class="btn-next" @click="handleSignup" :disabled="isCreating"><span id="signupBtnText">
                    <i v-if="isCreating" class="bi bi-arrow-clockwise spin-icon"></i>
                    <i v-else class="bi bi-rocket-takeoff"></i>
                    &nbsp;{{ isCreating ? 'Creating account...' : 'Create My Account' }}</span></button>
            <button class="btn-back" @click="goStep(2)"><i class="bi bi-arrow-left"></i> Back</button>
        </div>

        <!-- Success screen -->
        <div class="success-screen" id="successScreen" v-if="signupComplete">
            <div class="success-icon">🎉</div>
            <h2>You're all set!</h2>
            <p>Your ChatterHub account is ready. Time to start connecting with amazing people.</p>
            <button class="btn-next" @click="startChatting" style="max-width:260px;">
                <span><i class="bi bi-chat-heart-fill"></i> &nbsp;Start Chatting</span>
            </button>
        </div>

    </div>
</template>


