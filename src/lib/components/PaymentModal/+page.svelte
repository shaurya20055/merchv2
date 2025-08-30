<!-- src/lib/components/PaymentModal/+page.svelte -->

<script lang="ts">
  // @ts-nocheck
  import { user } from '$lib/userStore.js';

  let { product, onClose } = $props();
  
  // --- State for the entire form ---
  let formData = $state({
    name: '',
    email: '', // Email is now part of the main form
    phone: '',
    address: '',
    size: 'M',
    paymentScreenshot: null,
    includeNitsLogo: true,
    includeMlClubLogo: true
  });
  
  let otp = $state('');
  let otpSent = $state(false);
  let otpVerified = $state(false);
  
  // This state controls the success screen
  let orderComplete = $state(false); 

  let isLoading = $state(false);
  let errorMessage = $state('');
  let successMessage = $state('');
  let qrCodeUrl = $state('');

  // --- Functions ---
  async function sendOtp() {
    // This is triggered by a button, not a form submission
    isLoading = true;
    errorMessage = '';
    successMessage = '';
    const response = await fetch('/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: formData.email }),
    });
    if (response.ok) {
      otpSent = true;
      successMessage = `An OTP has been sent to ${formData.email}`;
    } else {
      const data = await response.json();
      errorMessage = data.error || 'Failed to send OTP.';
    }
    isLoading = false;
  }

  async function verifyOtp() {
    // This is also triggered by a button
    isLoading = true;
    errorMessage = '';
    successMessage = '';
    try {
      const verifyResponse = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, token: otp }),
      });

      if (!verifyResponse.ok) throw new Error('Invalid OTP.');
      const data = await verifyResponse.json();
      if (data.session && data.session.user) user.set(data.session.user);
      
      const qrResponse = await fetch('/api/get-random-qr');
      if (!qrResponse.ok) throw new Error('Could not load payment QR code.');
      const qrData = await qrResponse.json();
      qrCodeUrl = qrData.qr_code_url;

      otpVerified = true;
      successMessage = 'Email successfully verified!';
    } catch (err) {
      errorMessage = err.message;
    } finally {
      isLoading = false;
    }
  }

  async function handleSubmit(event) {
    // This is the main form submission for the entire order
    event.preventDefault();
    if (!otpVerified) {
      errorMessage = 'Please verify your email before submitting the order.';
      return;
    }
    if (!formData.paymentScreenshot) {
      errorMessage = 'Please select a payment screenshot to upload.';
      return;
    }
    isLoading = true;
    errorMessage = '';
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('screenshot', formData.paymentScreenshot);
      const uploadResponse = await fetch('/api/uploads', { method: 'POST', body: uploadFormData });
      if (!uploadResponse.ok) throw new Error('Screenshot upload failed.');
      const uploadData = await uploadResponse.json();
      
      const orderDetails = {
        product,
        screenshotUrl: uploadData.screenshotUrl,
        fullName: formData.name,
        email: formData.email, // Use email from the form
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
      // Trigger the success screen
      orderComplete = true; 
      setTimeout(() => onClose(), 3000);
    } catch (err) {
      errorMessage = err.message;
    } finally {
      isLoading = false;
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
    if (event.key === 'Escape') onClose();
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
          {#if orderComplete}
            Order Confirmed!
          {:else}
            Complete Your Order
          {/if}
        </h2>
        <button onclick={onClose} class="text-muted-foreground hover:text-card-foreground">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      {#if orderComplete}
        <!-- This is the Success Screen UI -->
        <div class="text-center py-8">
          <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
          </div>
          <h3 class="font-sans font-bold text-xl mb-2">Order Submitted Successfully!</h3>
          <p class="text-muted-foreground">We'll verify your payment and contact you soon.</p>
        </div>
      {:else}
        <!-- The single, integrated Order Details Form -->
        <form onsubmit={handleSubmit} class="space-y-6">
          
          <!-- Personal Details with Integrated Auth -->
          <div class="space-y-4">
              <h3 class="font-sans font-semibold text-lg">Personal Details</h3>
              <input type="text" bind:value={formData.name} required class="w-full bg-input px-4 py-3 rounded-lg border" placeholder="Full Name *" />
              
              <div class="flex items-start gap-2">
                <input type="email" bind:value={formData.email} required disabled={otpSent || otpVerified} class="w-full bg-input px-4 py-3 rounded-lg border disabled:opacity-50" placeholder="Email *" />
                {#if !otpVerified}
                  <button type="button" onclick={sendOtp} disabled={isLoading || !formData.email} class="bg-secondary text-secondary-foreground font-semibold px-4 py-3 rounded-lg whitespace-nowrap disabled:opacity-50">
                    Send OTP
                  </button>
                {/if}
              </div>

              {#if otpSent && !otpVerified}
                <div class="flex items-start gap-2">
                  <input type="text" bind:value={otp} required class="w-full bg-input px-4 py-3 rounded-lg border" placeholder="Enter OTP" />
                  <button type="button" onclick={verifyOtp} disabled={isLoading || otp.length < 6} class="bg-green-600 text-white font-semibold px-4 py-3 rounded-lg whitespace-nowrap disabled:opacity-50">
                    Verify
                  </button>
                </div>
              {/if}
              
              <input type="tel" bind:value={formData.phone} required class="w-full bg-input px-4 py-3 rounded-lg border" placeholder="Phone Number *" />
              <select bind:value={formData.size} class="w-full bg-input text-foreground px-4 py-3 rounded-lg border focus:outline-none">
                  <option value="S">Small (S)</option>
                  <option value="M">Medium (M)</option>
                  <option value="L">Large (L)</option>
                  <option value="XL">Extra Large (XL)</option>
                  <option value="XXL">Double XL (XXL)</option>
              </select>
              <textarea bind:value={formData.address} required rows="3" class="w-full bg-input px-4 py-3 rounded-lg border resize-none" placeholder="Delivery Address *"></textarea>
          </div>
          
          <!-- Customization Section -->
          <div class="space-y-4">
            <h3 class="font-sans font-semibold text-lg">Customization</h3>
            <div class="grid sm:grid-cols-2 gap-4">
                <label class="flex items-center gap-3 bg-input p-4 rounded-lg border has-[:checked]:border-primary cursor-pointer">
                    <input type="checkbox" bind:checked={formData.includeNitsLogo} class="w-5 h-5 accent-primary" />
                    <span>Include <strong>NIT Silchar</strong> Logo</span>
                </label>
                <label class="flex items-center gap-3 bg-input p-4 rounded-lg border has-[:checked]:border-primary cursor-pointer">
                    <input type="checkbox" bind:checked={formData.includeMlClubLogo} class="w-5 h-5 accent-primary" />
                    <span>Include <strong>ML Club</strong> Logo</span>
                </label>
            </div>
          </div>
          
          <!-- Payment Details Section -->
          <div class="space-y-4">
            <h3 class="font-sans font-semibold text-lg">Payment Details</h3>
            <div class="bg-primary/10 border border-primary/20 rounded-lg p-4 flex items-start gap-4">
              <div class="flex-1">
                <p class="text-sm text-muted-foreground mb-3">
                  {#if !otpVerified}
                    Please verify your email to reveal the QR code.
                  {:else}
                    Scan the QR code below to pay ₹{product.price}
                  {/if}
                </p>
                <p><strong>Amount:</strong> ₹{product.price}</p>
              </div>
              <div class="bg-white p-2 rounded-lg">
                <img 
                  src={qrCodeUrl || 'https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=placeholder'} 
                  alt="Payment QR Code" 
                  class="w-30 h-30 transition-all duration-300"
                  class:blur-md={!otpVerified}
                />
              </div>
            </div>
          </div>
          
          <!-- Screenshot Upload Section -->
          <div>
              <label for="payment-screenshot" class="block text-sm font-medium mb-2">Upload Payment Screenshot *</label>
              <input type="file" accept="image/*" onchange={handleFileChange} required id="payment-screenshot" class="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-600/20 file:text-orange-400 hover:file:bg-orange-600/30" />
              {#if formData.paymentScreenshot}
                <p class="text-sm text-green-400 mt-2">✓ {formData.paymentScreenshot.name}</p>
              {/if}
          </div>

          {#if successMessage && !orderComplete}<p class="text-green-400 text-center">{successMessage}</p>{/if}
          {#if errorMessage}<p class="text-red-500 text-center">{errorMessage}</p>{/if}

          <button type="submit" disabled={isLoading || !otpVerified} class="w-full bg-primary text-primary-foreground font-semibold py-4 rounded-lg disabled:opacity-50">
            {isLoading ? 'Submitting...' : 'Submit Order'}
          </button>
        </form>
      {/if}
    </div>
  </div>
</div>

