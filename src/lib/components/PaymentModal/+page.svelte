<!-- src/lib/components/PaymentModal/+page.svelte -->

<script lang="ts">
  // @ts-nocheck
  import { user } from '$lib/userStore.js';

  let { product, onClose } = $props();
  
  // This 'stage' variable controls the entire flow within the modal
  let stage = $state($user ? 'details' : 'auth'); // If user is already logged in, show details, otherwise show auth
  
  // --- State for Authentication Flow ---
  let authEmail = $state('');
  let authOtp = $state('');
  let authStage = $state<'email' | 'otp'>('email');
  let isAuthLoading = $state(false);
  let authErrorMessage = $state('');

  // --- State for Order Details Flow ---
  let formData = $state({
    name: '',
    phone: '',
    address: '',
    size: 'M',
    paymentScreenshot: null,
    includeNitsLogo: true,
    includeMlClubLogo: true
  });
  let isSubmitting = $state(false);
  let submitSuccess = $state(false);
  let orderErrorMessage = $state('');

  // --- Authentication Functions ---
  async function sendOtp(event) {
    event.preventDefault();
    isAuthLoading = true;
    authErrorMessage = '';
    const response = await fetch('/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: authEmail }),
    });
    if (response.ok) {
      authStage = 'otp'; // Move to OTP input screen
    } else {
      const data = await response.json();
      authErrorMessage = data.error || 'Failed to send OTP.';
    }
    isAuthLoading = false;
  }

  async function verifyOtp(event) {
    event.preventDefault();
    isAuthLoading = true;
    authErrorMessage = '';
    const response = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: authEmail, token: authOtp }),
    });
    if (response.ok) {
      // THE FIX IS HERE:
      // We get the session data back from the API and manually update our store.
      // This eliminates the timing issue.
      const data = await response.json();
      if (data.session && data.session.user) {
        user.set(data.session.user);
      }
      // Now we can safely switch to the details stage.
      stage = 'details';
    } else {
      const data = await response.json();
      authErrorMessage = data.error || 'Invalid OTP.';
    }
    isAuthLoading = false;
  }

  // --- Order Submission Function ---
  async function handleSubmit(event) {
    event.preventDefault();
    if (!formData.paymentScreenshot) {
      orderErrorMessage = 'Please select a payment screenshot to upload.';
      return;
    }
    isSubmitting = true;
    orderErrorMessage = null;
    try {
      // 1. Upload Screenshot
      const uploadFormData = new FormData();
      uploadFormData.append('screenshot', formData.paymentScreenshot);
      const uploadResponse = await fetch('/api/uploads', { method: 'POST', body: uploadFormData });
      if (!uploadResponse.ok) throw new Error('Screenshot upload failed.');
      const uploadData = await uploadResponse.json();
      
      // 2. Submit Order
      const orderDetails = {
        product,
        screenshotUrl: uploadData.screenshotUrl,
        fullName: formData.name,
        email: $user.email, // This is now safe to access
        phoneNumber: formData.phone,
        tshirtSize: formData.size,
        deliveryAddress: formData.address,
        include_nits_logo: formData.includeNitsLogo,
        include_ml_club_logo: formData.includeMlClubLogo
      };
      const orderResponse = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderDetails)
      });
      if (!orderResponse.ok) {
          const errorData = await orderResponse.json();
          throw new Error(errorData.details || 'Could not save your order.');
      }
      submitSuccess = true;
      setTimeout(() => onClose(), 3000);
    } catch (err) {
      orderErrorMessage = err.message;
    } finally {
      isSubmitting = false;
    }
  }

  function handleFileChange(event) {
    const file = event.target.files[0];
    if (file) formData.paymentScreenshot = file;
  }

  function handleBackdropClick(event) {
    if (event.target === event.currentTarget) onClose();
  }

  function handleKeyDown(event) {
    if (event.key === 'Escape') {
      onClose();
    }
  }
</script>

<div 
  class="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50" 
  onclick={handleBackdropClick} 
  role="dialog"
  tabindex="-1"
  onkeydown={handleKeyDown}
>
  <div class="bg-card text-card-foreground rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
    <div class="p-6">
      <div class="flex items-center justify-between mb-6">
        <h2 class="font-sans font-bold text-2xl">
          {#if stage === 'auth'}Login to Continue{:else}Complete Your Order{/if}
        </h2>
        <button onclick={onClose} class="text-muted-foreground hover:text-card-foreground">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      {#if stage === 'auth'}
        <!-- AUTHENTICATION STAGE -->
        {#if authStage === 'email'}
          <form onsubmit={sendOtp} class="space-y-4">
            <p class="text-muted-foreground">Please enter your email to sign in or create an account.</p>
            <input type="email" bind:value={authEmail} required class="w-full bg-input text-foreground px-4 py-3 rounded-lg border border-border" placeholder="you@example.com" />
            <button type="submit" disabled={isAuthLoading} class="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-lg">
              {isAuthLoading ? 'Sending...' : 'Send One-Time Password'}
            </button>
          </form>
        {:else}
          <form onsubmit={verifyOtp} class="space-y-4">
            <p class="text-muted-foreground">An OTP has been sent to <strong>{authEmail}</strong>.</p>
            <input type="text" bind:value={authOtp} required class="w-full bg-input text-foreground px-4 py-3 rounded-lg border border-border" placeholder="123456" />
            <button type="submit" disabled={isAuthLoading} class="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-lg">
              {isAuthLoading ? 'Verifying...' : 'Verify & Continue'}
            </button>
            <button type="button" onclick={() => authStage = 'email'} class="w-full text-sm text-muted-foreground">Use a different email</button>
          </form>
        {/if}
        {#if authErrorMessage}<p class="text-red-500 text-center mt-4">{authErrorMessage}</p>{/if}
      
      {:else if stage === 'details'}
        <!-- ORDER DETAILS STAGE -->
        {#if submitSuccess}
          <div class="text-center py-8">
            <h3 class="font-sans font-bold text-xl mb-2">Order Submitted!</h3>
            <p class="text-muted-foreground">We'll verify your payment and contact you soon.</p>
          </div>
        {:else}
          <form onsubmit={handleSubmit} class="space-y-6">
            {#if $user}
              <p class="text-muted-foreground text-sm">Signed in as: <strong>{$user.email}</strong></p>
            {/if}
            <!-- Personal Details -->
            <input type="text" bind:value={formData.name} required class="w-full bg-input px-4 py-3 rounded-lg border" placeholder="Full Name *" />
            <input type="tel" bind:value={formData.phone} required class="w-full bg-input px-4 py-3 rounded-lg border" placeholder="Phone Number *" />
            <textarea bind:value={formData.address} required rows="3" class="w-full bg-input px-4 py-3 rounded-lg border resize-none" placeholder="Delivery Address *"></textarea>
            
            <!-- Customization Section -->
            <div class="space-y-4">
              <h3 class="font-sans font-semibold text-lg">Customization</h3>
              <div class="grid sm:grid-cols-2 gap-4">
                <label class="flex items-center gap-3 bg-input p-4 rounded-lg border border-border has-[:checked]:border-primary has-[:checked]:bg-primary/10 transition-all cursor-pointer">
                  <input type="checkbox" bind:checked={formData.includeNitsLogo} class="w-5 h-5 accent-primary" />
                  <span>Include <strong>NIT Silchar</strong> Logo</span>
                </label>
                <label class="flex items-center gap-3 bg-input p-4 rounded-lg border border-border has-[:checked]:border-primary has-[:checked]:bg-primary/10 transition-all cursor-pointer">
                  <input type="checkbox" bind:checked={formData.includeMlClubLogo} class="w-5 h-5 accent-primary" />
                  <span>Include <strong>ML Club</strong> Logo</span>
                </label>
              </div>
            </div>

            <!-- Payment Section -->
            <div class="space-y-4">
              <h3 class="font-sans font-semibold text-lg">Payment Details</h3>
              <div class="bg-primary/10 border border-primary/20 rounded-lg p-4">
                <div class="flex items-start gap-4">
                  <div class="flex-1">
                    <h4 class="font-semibold mb-2">Scan QR Code to Pay</h4>
                    <p class="text-sm text-muted-foreground mb-3">Scan the QR code below with any UPI app and pay ₹{product.price}</p>
                    <div class="text-sm">
                      <p><strong>Amount:</strong> ₹{product.price}</p>
                      <p><strong>UPI ID:</strong> mlclub@nits</p>
                    </div>
                  </div>
                  <div class="bg-white p-3 rounded-lg">
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=upi://pay?pa=ml.club@nits&pn=Merch%20Shop&am={product.price}&cu=INR" alt="Payment QR Code" class="w-30 h-30" />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label for="payment-screenshot" class="block text-sm font-medium mb-2">Upload Payment Screenshot *</label>
              <input type="file" accept="image/*" onchange={handleFileChange} required id="payment-screenshot" class="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-600/20 file:text-orange-400 hover:file:bg-orange-600/30" />
              {#if formData.paymentScreenshot}
                <p class="text-sm text-green-400 mt-2">✓ {formData.paymentScreenshot.name}</p>
              {/if}
            </div>
            
            <button 
              type="submit" 
              disabled={isSubmitting} 
              class="w-full bg-primary text-primary-foreground font-semibold py-4 rounded-lg disabled:bg-gray-500"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Order'}
            </button>
            {#if orderErrorMessage}<p class="text-red-500 text-center mt-4">{orderErrorMessage}</p>{/if}
          </form>
        {/if}
      {/if}
    </div>
  </div>
</div>
