<!-- src/lib/components/ProductShowcase/+page.svelte -->

<script lang="ts">
  // @ts-nocheck
  let { onBuyClick } = $props();

  // --- MODIFIED: Data structure to handle product variants ---
  // We now have an object that holds different colors, each with multiple image views.
  const productVariants = {
    white: {
      front: 'https://res.cloudinary.com/dzaqqvfo1/image/upload/v1756817891/white_front_yeagka.jpg',
      back: 'https://res.cloudinary.com/dzaqqvfo1/image/upload/v1756817890/white_back_2_kzvuxh.jpg',
      side: 'https://res.cloudinary.com/dzaqqvfo1/image/upload/v1756788884/WhatsApp_Image_2025-09-02_at_01.44.12_625c2306_ih9dp4.jpg',
    },
    black: {
      front: 'https://res.cloudinary.com/dzaqqvfo1/image/upload/v1756788883/WhatsApp_Image_2025-09-02_at_01.44.11_3333a49e_e9ybbe.jpg',
      back: 'https://res.cloudinary.com/dzaqqvfo1/image/upload/v1756788883/WhatsApp_Image_2025-09-02_at_01.44.11_ea612330_czlcsb.jpg',
      side: 'https://res.cloudinary.com/dzaqqvfo1/image/upload/v1756788883/WhatsApp_Image_2025-09-02_at_01.44.12_174088a8_zwnpmn.jpg',
    }
  };

  const productDetails = {
    name: 'ML クラブティー',
    price: 499,
  };

  // --- NEW: State management for color and image selection ---
  let selectedColor = $state('black'); // Default to black
  let activeImageUrl = $state(productVariants[selectedColor].front);

  function selectColor(color) {
    selectedColor = color;
    // When a new color is selected, always show the front view first.
    activeImageUrl = productVariants[color].front;
  }

  function selectView(imageUrl) {
    activeImageUrl = imageUrl;
  }
</script>

<section class="max-w-6xl mx-auto">
  <!-- The hero section remains unchanged -->
  <div class="text-center mb-20 relative">
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
    <div>
      <!-- The main image holder now uses the dynamic `activeImageUrl` -->
      <div class="relative">
        <div class="aspect-square bg-gradient-to-br from-card to-muted/20 rounded-3xl p-12 border border-primary/30 futuristic-glow">
          <img 
            src={activeImageUrl} 
            alt="ML Club T-Shirt - {selectedColor}" 
            class="w-full h-full object-contain rounded-2xl"
          />
        </div>
        <div class="absolute -top-6 -right-6 bg-gradient-to-r from-primary to-orange-400 text-black px-6 py-3 rounded-2xl text-sm font-sans font-black tracking-wider futuristic-glow">
          Limited Edition
        </div>
      </div>
      
      <!-- NEW: View Selector Thumbnails -->
      <!-- This section appears below the main image and shows the different views -->
      <div class="mt-4 grid grid-cols-3 gap-4">
        {#each Object.entries(productVariants[selectedColor]) as [view, url]}
          <button
            onclick={() => selectView(url)}
            class="aspect-square p-2 rounded-2xl border-2 transition-all futuristic-glow"
            class:border-primary={activeImageUrl === url}
            class:border-transparent={activeImageUrl !== url}
          >
            <img src={url} alt="T-Shirt {view} view" class="w-full h-full object-cover rounded-xl" />
          </button>
        {/each}
      </div>
    </div>

    <!-- The product details section remains largely the same -->
    <div class="space-y-8">
      <div>
        <h3 class="font-sans font-black text-5xl mb-6 tracking-tight bg-gradient-to-r from-foreground to-primary/80 bg-clip-text text-transparent">{productDetails.name}</h3>
        <p class="text-muted-foreground mb-8 text-lg leading-relaxed font-medium">
          Premium cotton blend with cutting-edge design. Features the iconic ML Club logo with futuristic aesthetics perfect for tech events and daily wear.
        </p>
        
        <div class="flex items-center gap-6 mb-8">
          <span class="text-5xl font-sans font-black text-primary">₹{productDetails.price}</span>
          <span class="text-xl text-muted-foreground line-through">₹699</span>
          <span class="bg-gradient-to-r from-primary/20 to-orange-400/20 text-primary px-4 py-2 rounded-xl text-sm font-black tracking-wider border border-primary/30">28% OFF</span>
        </div>
      </div>

      <!-- NEW: Color Selector -->
      <div class="space-y-4">
        <h4 class="font-sans font-black text-primary tracking-wider">COLOR SELECTION</h4>
        <div class="grid grid-cols-2 gap-4">
          <button 
            onclick={() => selectColor('white')} 
            class="p-4 rounded-xl text-center font-sans font-bold transition-all border-2 {selectedColor === 'white' ? 'bg-white text-black border-primary' : 'border-muted/50'}"
          >
            White
          </button>
          <button 
            onclick={() => selectColor('black')} 
            class="p-4 rounded-xl text-center font-sans font-bold transition-all border-2 {selectedColor === 'black' ? 'bg-black text-white border-primary' : 'border-muted/50'}"
          >
            Black
          </button>
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
      </div>
      
      <!-- The "Buy Now" button still uses the original onBuyClick prop to open the modal -->
      <button 
        onclick={() => onBuyClick(productDetails)}
        class="w-full bg-gradient-to-r from-primary to-orange-400 hover:from-orange-400 hover:to-primary text-black font-sans font-black py-8 px-8 rounded-2xl transition-all duration-300 text-xl tracking-wider futuristic-glow hover:scale-[1.02] border border-primary/30"
      >
        BUY NOW - ₹{productDetails.price}
      </button>
    </div>
  </div>
</section>

