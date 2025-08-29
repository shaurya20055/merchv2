<!-- src/routes/+page.svelte -->

<script>
// @ts-nocheck

  import Header from '../lib/components/Header/+page.svelte';
  import ProductShowcase from '../lib/components/ProductShowcase/+page.svelte';
  import PaymentModal from '../lib/components/PaymentModal/+page.svelte';
  import Footer from '../lib/components/Footer/+page.svelte';
  import NeuralNetworkBackground from '../lib/components/NeuralNetworkBackground/+page.svelte';

  let showPaymentModal = $state(false);
  let selectedProduct = $state(null); // 1. Added state to hold the selected product

  // 2. Updated function to accept the product object when a "Buy" button is clicked
  function openPaymentModal(product) {
    selectedProduct = product;
    showPaymentModal = true;
  }

  function closePaymentModal() {
    showPaymentModal = false;
    selectedProduct = null; // Clear the product when closing the modal
  }
</script>

<!-- Added neural network background as the base layer -->
<NeuralNetworkBackground />

<div class="min-h-screen bg-transparent text-foreground relative z-10">
  <Header />
  
  <main class="container mx-auto px-4 py-12">
    <ProductShowcase onBuyClick={openPaymentModal} />
  </main>

  <Footer />

  <!-- 3. Pass the selectedProduct to the PaymentModal component -->
  {#if showPaymentModal && selectedProduct}
    <PaymentModal product={selectedProduct} onClose={closePaymentModal} />
  {/if}
</div>
