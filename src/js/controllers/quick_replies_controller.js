import { Controller } from "@hotwired/stimulus"

/**
 * Quick Replies Controller
 * Manages the expand/collapse functionality for quick reply suggestions
 */
export default class extends Controller {
  static targets = ["container", "extra", "icon", "toggleBtn"]
  
  connect() {
    this.expanded = false
    this.collapsedHeight = "7.5rem" // Show ~3 items
  }

  toggle() {
    this.expanded = !this.expanded
    
    if (this.expanded) {
      this.expand()
    } else {
      this.collapse()
    }
  }

  expand() {
    // Show extra items
    this.extraTargets.forEach(el => el.classList.remove("hidden"))
    
    // Expand container height
    if (this.hasContainerTarget) {
      this.containerTarget.style.maxHeight = `${this.containerTarget.scrollHeight}px`
    }
    
    // Rotate icon
    if (this.hasIconTarget) {
      this.iconTarget.classList.add("rotate-180")
    }
    
    // Update button title
    if (this.hasToggleBtnTarget) {
      this.toggleBtnTarget.title = "收起"
    }
  }

  collapse() {
    // Collapse container height first for animation
    if (this.hasContainerTarget) {
      this.containerTarget.style.maxHeight = this.collapsedHeight
    }
    
    // Hide extra items after animation
    setTimeout(() => {
      this.extraTargets.forEach(el => el.classList.add("hidden"))
    }, 300)
    
    // Reset icon rotation
    if (this.hasIconTarget) {
      this.iconTarget.classList.remove("rotate-180")
    }
    
    // Update button title
    if (this.hasToggleBtnTarget) {
      this.toggleBtnTarget.title = "展开更多"
    }
  }
}
