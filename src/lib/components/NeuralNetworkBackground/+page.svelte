<script>
  import { onMount } from 'svelte';
  
  let canvas = $state();
  let ctx;
  let animationId;
  
  // Neural network nodes and connections
  let nodes = [];
  let connections = [];
  
  class Node {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.vx = (Math.random() - 0.5) * 0.5;
      this.vy = (Math.random() - 0.5) * 0.5;
      this.radius = Math.random() * 3 + 2;
      this.opacity = Math.random() * 0.5 + 0.3;
    }
    
    update() {
      this.x += this.vx;
      this.y += this.vy;
      
      // Bounce off edges
      if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
      if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
      
      // Keep within bounds
      this.x = Math.max(0, Math.min(canvas.width, this.x));
      this.y = Math.max(0, Math.min(canvas.height, this.y));
    }
    
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 147, 0, ${this.opacity})`;
      ctx.fill();
      
      // Add glow effect
      ctx.shadowColor = '#ff9300';
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }
  
  function createNodes() {
    nodes = [];
    const nodeCount = Math.floor((canvas.width * canvas.height) / 15000);
    
    for (let i = 0; i < nodeCount; i++) {
      nodes.push(new Node(
        Math.random() * canvas.width,
        Math.random() * canvas.height
      ));
    }
  }
  
  function drawConnections() {
    connections = [];
    
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 150) {
          const opacity = (150 - distance) / 150 * 0.3;
          
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = `rgba(255, 147, 0, ${opacity})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }
  }
  
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Update and draw nodes
    nodes.forEach(node => {
      node.update();
      node.draw();
    });
    
    // Draw connections
    drawConnections();
    
    animationId = requestAnimationFrame(animate);
  }
  
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    createNodes();
  }
  
  onMount(() => {
    ctx = canvas.getContext('2d');
    resizeCanvas();
    animate();
    
    window.addEventListener('resize', resizeCanvas);
    
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
    };
  });
</script>

<canvas
  bind:this={canvas}
  class="fixed inset-0 w-full h-full pointer-events-none z-0"
  style="background: linear-gradient(135deg, #000000 0%, #0a0a0a 100%);"
></canvas>
