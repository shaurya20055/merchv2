<!-- src/lib/components/ProductShowcase/+page.svelte -->

<script lang="ts">
  // This function is passed down from +page.svelte and expects a 'product' object
  let { onBuyClick } = $props<(product: any) => void>();

  // For a single product, we can define it directly here instead of fetching from a database.
  // This simplifies the code and removes the need for an API call.
  const product = {
    name: 'ML クラブティー',
    price: 499,
    // Using the image URL you provided from the original code
    image_url: 'https://imgs.search.brave.com/hVBsca7cm5-oUytHXNgoSZjav2uZQ5YsRnr_OvBzdfk/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9pbWFn/ZXMtcGxhdGZvcm0u/OTlzdGF0aWMuY29t/Ly9Fc0tBXzN0WGtf/OVE3R2FuT240UkRY/a0NWWVk9LzB4MTM1/MjoxMDAweDIzNTIv/Zml0LWluLzUwMHg1/MDAvOTlkZXNpZ25z/LWNvbnRlc3RzLWF0/dGFjaG1lbnRzLzk3/Lzk3MzU1L2F0dGFj/aG1lbnRfOTczNTUz/MTU' 
  };
</script>

<section class="max-w-6xl mx-auto">
  <!-- Enhanced hero section from your original code -->
  <div class="text-center mb-20 relative">
    <div class="absolute top-0 left-1/4 w-1 h-1 bg-primary rounded-full animate-pulse opacity-60"></div>
    <div class="absolute top-10 right-1/3 w-2 h-2 bg-primary/40 rounded-full animate-pulse" style="animation-delay: 1s"></div>
    <div class="absolute top-5 right-1/4 w-1 h-1 bg-primary/60 rounded-full animate-pulse" style="animation-delay: 2s"></div>
    
    <h1 class="font-sans font-black text-6xl md:text-8xl mb-8 bg-gradient-to-r from-primary via-orange-400 to-primary bg-clip-text text-transparent tracking-tighter leading-none">
      ML クラブ
    </h1>
    <div class="flex items-center justify-center gap-4 mb-6">
      <div class="h-px bg-gradient-to-r from-transparent via-primary to-transparent w-20"></div>
      <h2 class="font-sans font-bold text-xl md:text-2xl text-primary tracking-[0.3em]">
        EXCLUSIVE MERCH
      </h2>
      <div class="h-px bg-gradient-to-r from-transparent via-primary to-transparent w-20"></div>
    </div>
    <p class="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed font-medium">
      Premium tech wear for the future innovators. Limited edition design crafted for the Machine Learning enthusiasts.
    </p>
  </div>

  <div class="grid lg:grid-cols-2 gap-16 items-center">
    <!-- Product image with futuristic styling -->
    <div class="relative">
      <div class="aspect-square bg-gradient-to-br from-card to-muted/20 rounded-3xl p-12 border border-primary/30 futuristic-glow">
        <img 
          src={product.image_url} 
          alt={product.name} 
          class="w-full h-full object-contain rounded-2xl"
          onerror={(e) => { const target = e.target as HTMLImageElement; target.onerror = null; target.src = 'https://placehold.co/500x500/000000/FFFFFF?text=Image+Not+Found'; }}
        />
      </div>
      <div class="absolute -top-6 -right-6 bg-gradient-to-r from-primary to-orange-400 text-black px-6 py-3 rounded-2xl text-sm font-sans font-black tracking-wider futuristic-glow">
          Limited Edition
      </div>
    </div>

    <!-- Product details with dynamic data -->
    <div class="space-y-8">
      <div>
        <h3 class="font-sans font-black text-5xl mb-6 tracking-tight bg-gradient-to-r from-foreground to-primary/80 bg-clip-text text-transparent">{product.name}</h3>
        <p class="text-muted-foreground mb-8 text-lg leading-relaxed font-medium">
          Premium cotton blend with cutting-edge design. Features the iconic ML Club logo with futuristic aesthetics perfect for tech events and daily wear.
        </p>
        
        <div class="flex items-center gap-6 mb-8">
          <span class="text-5xl font-sans font-black text-primary">₹{product.price}</span>
          <span class="text-xl text-muted-foreground line-through">₹699</span>
          <span class="bg-gradient-to-r from-primary/20 to-orange-400/20 text-primary px-4 py-2 rounded-xl text-sm font-black tracking-wider border border-primary/30">28% OFF</span>
        </div>
      </div>

      <div class="space-y-6">
        <div class="grid grid-cols-2 gap-4">
          <div class="bg-gradient-to-br from-card/50 to-muted/20 p-6 rounded-2xl border border-primary/20 futuristic-glow">
            <div class="text-primary font-sans font-black mb-2 tracking-wider">MATERIAL</div>
            <div class="text-sm text-muted-foreground font-medium">Premium Cotton</div>
          </div>
          <div class="bg-gradient-to-br from-card/50 to-muted/20 p-6 rounded-2xl border border-primary/20 futuristic-glow">
            <div class="text-primary font-sans font-black mb-2 tracking-wider">FIT</div>
            <div class="text-sm text-muted-foreground font-medium">Regular Comfort</div>
          </div>
        </div>
        <div>
          <h4 class="font-sans font-black mb-4 text-primary tracking-wider">SIZE SELECTION</h4>
          <div class="grid grid-cols-5 gap-3">
            <div class="bg-muted/30 hover:bg-primary/20 hover:border-primary/50 border border-muted/50 p-4 rounded-xl text-center font-sans font-bold transition-all cursor-pointer futuristic-glow">S</div>
            <div class="bg-muted/30 hover:bg-primary/20 hover:border-primary/50 border border-muted/50 p-4 rounded-xl text-center font-sans font-bold transition-all cursor-pointer futuristic-glow">M</div>
            <div class="bg-muted/30 hover:bg-primary/20 hover:border-primary/50 border border-muted/50 p-4 rounded-xl text-center font-sans font-bold transition-all cursor-pointer futuristic-glow">L</div>
            <div class="bg-muted/30 hover:bg-primary/20 hover:border-primary/50 border border-muted/50 p-4 rounded-xl text-center font-sans font-bold transition-all cursor-pointer futuristic-glow">XL</div>
            <div class="bg-muted/30 hover:bg-primary/20 hover:border-primary/50 border border-muted/50 p-4 rounded-xl text-center font-sans font-bold transition-all cursor-pointer futuristic-glow">XXL</div>
          </div>
        </div>
      </div>

      <!-- Buy button now correctly passes the product object -->
      <button 
        onclick={() => onBuyClick(product)}
        class="w-full bg-gradient-to-r from-primary to-orange-400 hover:from-orange-400 hover:to-primary text-black font-sans font-black py-8 px-8 rounded-2xl transition-all duration-300 text-xl tracking-wider futuristic-glow hover:scale-[1.02] border border-primary/30"
      >
        BUY NOW - ₹{product.price}
      </button>
    </div>
  </div>
</section>
