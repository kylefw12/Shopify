class LuminauraHeroCarousel extends HTMLElement {
  connectedCallback() {
    this.slides = Array.from(this.querySelectorAll('[data-hero-slide]'));
    this.dots = Array.from(this.querySelectorAll('[data-hero-dot]'));
    this.previousButton = this.querySelector('[data-hero-previous]');
    this.nextButton = this.querySelector('[data-hero-next]');
    this.currentIndex = this.slides.findIndex((slide) => slide.classList.contains('is-active'));
    this.currentIndex = this.currentIndex < 0 ? 0 : this.currentIndex;
    this.delay = Number(this.dataset.autoplayDelay) || 6000;
    this.shouldAutoplay = this.dataset.autoplay === 'true' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (this.slides.length < 2) return;

    this.previousButton?.addEventListener('click', () => this.show(this.currentIndex - 1));
    this.nextButton?.addEventListener('click', () => this.show(this.currentIndex + 1));
    this.dots.forEach((dot) => dot.addEventListener('click', () => this.show(Number(dot.dataset.heroDot))));

    this.addEventListener('pointerenter', this.stopAutoplay);
    this.addEventListener('pointerleave', this.startAutoplay);
    this.addEventListener('focusin', this.stopAutoplay);
    this.addEventListener('focusout', (event) => {
      if (!this.contains(event.relatedTarget)) this.startAutoplay();
    });
    this.startAutoplay();
  }

  disconnectedCallback() {
    this.stopAutoplay();
  }

  show(index) {
    const nextIndex = (index + this.slides.length) % this.slides.length;
    this.slides.forEach((slide, slideIndex) => {
      const isActive = slideIndex === nextIndex;
      slide.classList.toggle('is-active', isActive);
      slide.setAttribute('aria-hidden', String(!isActive));
      slide.inert = !isActive;
    });
    this.dots.forEach((dot, dotIndex) => {
      const isActive = dotIndex === nextIndex;
      dot.classList.toggle('is-active', isActive);
      dot.setAttribute('aria-selected', String(isActive));
    });
    this.currentIndex = nextIndex;
    this.stopAutoplay();
    this.startAutoplay();
  }

  startAutoplay = () => {
    if (!this.shouldAutoplay || this.autoplayTimer) return;
    this.autoplayTimer = window.setInterval(() => this.show(this.currentIndex + 1), this.delay);
  };

  stopAutoplay = () => {
    if (!this.autoplayTimer) return;
    window.clearInterval(this.autoplayTimer);
    this.autoplayTimer = undefined;
  };
}

if (!customElements.get('luminaura-hero-carousel')) {
  customElements.define('luminaura-hero-carousel', LuminauraHeroCarousel);
}
