import { Controller } from "@hotwired/stimulus"

/**
 * Drawer Controller
 * A reusable controller for managing daisyUI drawer components
 * 
 * Usage:
 * ```html
 * <div class="drawer lg:drawer-open" data-controller="drawer" data-drawer-id-value="my-drawer">
 *   <input id="my-drawer" type="checkbox" class="drawer-toggle" data-drawer-target="toggle">
 *   <div class="drawer-content">
 *     <!-- Content here -->
 *     <button data-action="drawer#open">Open</button>
 *     <button data-action="drawer#close">Close</button>
 *     <button data-action="drawer#toggle">Toggle</button>
 *   </div>
 *   <div class="drawer-side">
 *     <!-- Sidebar here -->
 *   </div>
 * </div>
 * ```
 * 
 * Or control from outside:
 * ```html
 * <button data-action="drawer#toggle" data-drawer-id-param="my-drawer">Toggle Drawer</button>
 * ```
 */
export default class extends Controller {
  static targets = ["toggle"]
  static values = {
    id: String,           // The drawer toggle checkbox id
    persist: Boolean,     // Whether to persist state in localStorage
    persistKey: String,   // Custom key for localStorage
  }

  connect() {
    // Restore persisted state if enabled
    if (this.persistValue && this.hasToggleTarget) {
      this.restoreState()
    }

    // Listen for custom events from other parts of the app
    this.boundHandleCustomToggle = this.handleCustomToggle.bind(this)
    document.addEventListener("drawer:toggle", this.boundHandleCustomToggle)
    document.addEventListener("drawer:open", this.boundHandleCustomToggle)
    document.addEventListener("drawer:close", this.boundHandleCustomToggle)
  }

  disconnect() {
    document.removeEventListener("drawer:toggle", this.boundHandleCustomToggle)
    document.removeEventListener("drawer:open", this.boundHandleCustomToggle)
    document.removeEventListener("drawer:close", this.boundHandleCustomToggle)
  }

  /**
   * Open the drawer
   */
  open(event) {
    const toggle = this.getToggle(event)
    if (toggle) {
      toggle.checked = true
      this.saveState(true)
      this.dispatchStateChange(true)
    }
  }

  /**
   * Close the drawer
   */
  close(event) {
    const toggle = this.getToggle(event)
    if (toggle) {
      toggle.checked = false
      this.saveState(false)
      this.dispatchStateChange(false)
    }
  }

  /**
   * Toggle the drawer state
   */
  toggle(event) {
    const toggle = this.getToggle(event)
    if (toggle) {
      toggle.checked = !toggle.checked
      this.saveState(toggle.checked)
      this.dispatchStateChange(toggle.checked)
    }
  }

  /**
   * Check if drawer is open
   */
  get isOpen() {
    return this.hasToggleTarget ? this.toggleTarget.checked : false
  }

  /**
   * Handle state change from the toggle input
   */
  handleChange(event) {
    this.saveState(event.target.checked)
    this.dispatchStateChange(event.target.checked)
  }

  /**
   * Get the toggle element - either from target or by id param
   */
  getToggle(event) {
    // Check if there's an id param in the event (for external triggers)
    if (event?.params?.id) {
      return document.getElementById(event.params.id)
    }
    
    // Use the target if available
    if (this.hasToggleTarget) {
      return this.toggleTarget
    }

    // Fall back to id value
    if (this.hasIdValue) {
      return document.getElementById(this.idValue)
    }

    return null
  }

  /**
   * Handle custom events from other parts of the app
   */
  handleCustomToggle(event) {
    // Only respond if the event is for this drawer
    const targetId = event.detail?.id
    if (!targetId) return

    const myId = this.hasIdValue ? this.idValue : this.toggleTarget?.id
    if (targetId !== myId) return

    switch (event.type) {
      case "drawer:open":
        this.open()
        break
      case "drawer:close":
        this.close()
        break
      case "drawer:toggle":
        this.toggle()
        break
    }
  }

  /**
   * Save state to localStorage if persistence is enabled
   */
  saveState(isOpen) {
    if (!this.persistValue) return

    const key = this.getStorageKey()
    if (key) {
      try {
        localStorage.setItem(key, JSON.stringify(isOpen))
      } catch (e) {
        // localStorage might be unavailable
      }
    }
  }

  /**
   * Restore state from localStorage
   */
  restoreState() {
    const key = this.getStorageKey()
    if (!key) return

    try {
      const stored = localStorage.getItem(key)
      if (stored !== null) {
        const isOpen = JSON.parse(stored)
        if (this.hasToggleTarget) {
          this.toggleTarget.checked = isOpen
        }
      }
    } catch (e) {
      // localStorage might be unavailable or data corrupted
    }
  }

  /**
   * Get the localStorage key for this drawer
   */
  getStorageKey() {
    if (this.hasPersistKeyValue) {
      return `drawer:${this.persistKeyValue}`
    }
    
    if (this.hasIdValue) {
      return `drawer:${this.idValue}`
    }
    
    if (this.hasToggleTarget) {
      return `drawer:${this.toggleTarget.id}`
    }
    
    return null
  }

  /**
   * Dispatch a state change event for other controllers to listen to
   */
  dispatchStateChange(isOpen) {
    const id = this.hasIdValue ? this.idValue : this.toggleTarget?.id
    
    this.dispatch("stateChange", {
      detail: { id, isOpen },
      bubbles: true
    })
  }
}
