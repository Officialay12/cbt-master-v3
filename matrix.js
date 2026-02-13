// Matrix Background Animation
class MatrixBackground {
    constructor() {
        this.canvas = document.getElementById('matrixCanvas');
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.setupCanvas();
        this.setupMatrix();
        this.animate();
        this.setupResize();
    }

    setupCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    setupMatrix() {
        this.fontSize = 14;
        this.columns = Math.floor(this.canvas.width / this.fontSize);
        this.drops = [];

        // Matrix characters
        this.chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$+-*/=%\"'#&_(),.;:?!\\|{}<>[]^~";

        // Initialize drops
        for (let i = 0; i < this.columns; i++) {
            this.drops[i] = Math.floor(Math.random() * this.canvas.height / this.fontSize) * this.fontSize;
        }
    }

    draw() {
        // Semi-transparent background for trail effect
        this.ctx.fillStyle = 'rgba(5, 5, 15, 0.04)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Set font
        this.ctx.font = `${this.fontSize}px 'Courier New', monospace`;
        this.ctx.textAlign = 'start';

        // Draw characters
        for (let i = 0; i < this.drops.length; i++) {
            // Random character
            const char = this.chars[Math.floor(Math.random() * this.chars.length)];

            // Random color variation
            const greenValue = Math.floor(Math.random() * 155 + 100);
            const opacity = Math.random() * 0.5 + 0.5;
            this.ctx.fillStyle = `rgba(0, ${greenValue}, 0, ${opacity})`;

            // Draw character
            const x = i * this.fontSize;
            const y = this.drops[i];
            this.ctx.fillText(char, x, y);

            // Move drop down
            this.drops[i] += this.fontSize;

            // Reset drop if it goes beyond screen
            if (this.drops[i] > this.canvas.height && Math.random() > 0.975) {
                this.drops[i] = 0;
            }
        }
    }

    animate() {
        this.draw();
        requestAnimationFrame(() => this.animate());
    }

    setupResize() {
        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            this.setupMatrix();
        });
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new MatrixBackground();
});
