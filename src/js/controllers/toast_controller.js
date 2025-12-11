import { Controller } from "@hotwired/stimulus"

/**
 * Toast Controller
 * 
 * A global toast notification component that supports:
 * - Server-side rendering (content embedded in HTML)
 * - Auto-dismiss with countdown timer
 * - Manual dismiss via close button
 * - Multiple toast types (info, success, warning, error)
 * - Progress bar indicator for countdown
 * 
 * Usage:
 * <div data-controller="toast" 
 *      data-toast-duration-value="5000"
 *      data-toast-auto-dismiss-value="true">
 *   <div class="toast toast-top toast-end">
 *     <div class="alert alert-success" data-toast-target="alert">
 *       <span>登录成功！</span>
 *       <button type="button" data-action="toast#dismiss" class="btn btn-ghost btn-sm btn-circle">✕</button>
 *     </div>
 *   </div>
 * </div>
 */
export default class extends Controller {
  static targets = ["alert", "progress"]
  
  static values = {
    duration: { type: Number, default: 5000 },      // Duration in milliseconds
    autoDismiss: { type: Boolean, default: true },  // Whether to auto dismiss
    pauseOnHover: { type: Boolean, default: true }  // Pause countdown on hover
  }

  connect() {
    // Initialize state
    this.remainingTime = this.durationValue
    this.isPaused = false
    this.startTime = null
    this.animationFrameId = null

    // Show the toast with animation
    this.show()

    // Setup auto dismiss if enabled
    if (this.autoDismissValue && this.durationValue > 0) {
      this.startCountdown()
      
      // Setup pause on hover if enabled
      if (this.pauseOnHoverValue) {
        this.element.addEventListener("mouseenter", this.pause.bind(this))
        this.element.addEventListener("mouseleave", this.resume.bind(this))
      }
    }
  }

  disconnect() {
    this.clearTimers()
    
    // Remove event listeners
    if (this.pauseOnHoverValue) {
      this.element.removeEventListener("mouseenter", this.pause.bind(this))
      this.element.removeEventListener("mouseleave", this.resume.bind(this))
    }
  }

  show() {
    // Add entrance animation
    this.element.style.opacity = "0"
    this.element.style.transform = "translateX(100%)"
    
    requestAnimationFrame(() => {
      this.element.style.transition = "opacity 300ms ease-out, transform 300ms ease-out"
      this.element.style.opacity = "1"
      this.element.style.transform = "translateX(0)"
    })
  }

  dismiss() {
    this.clearTimers()
    
    // Add exit animation
    this.element.style.transition = "opacity 200ms ease-in, transform 200ms ease-in"
    this.element.style.opacity = "0"
    this.element.style.transform = "translateX(100%)"
    
    // Remove element after animation
    setTimeout(() => {
      this.element.remove()
    }, 200)
  }

  startCountdown() {
    this.startTime = performance.now()
    this.updateProgress()
  }

  updateProgress() {
    if (this.isPaused) return

    const elapsed = performance.now() - this.startTime
    const remaining = this.remainingTime - elapsed

    if (remaining <= 0) {
      this.dismiss()
      return
    }

    // Update progress bar if exists
    if (this.hasProgressTarget) {
      const percentage = (remaining / this.durationValue) * 100
      this.progressTarget.style.width = `${percentage}%`
    }

    this.animationFrameId = requestAnimationFrame(() => this.updateProgress())
  }

  pause() {
    if (!this.autoDismissValue || this.isPaused) return
    
    this.isPaused = true
    const elapsed = performance.now() - this.startTime
    this.remainingTime = Math.max(0, this.remainingTime - elapsed)
    
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }
  }

  resume() {
    if (!this.autoDismissValue || !this.isPaused) return
    
    this.isPaused = false
    this.startTime = performance.now()
    this.updateProgress()
  }

  clearTimers() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }
  }
}
