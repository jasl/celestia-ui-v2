import { Controller } from "@hotwired/stimulus"

/**
 * Theme Controller
 * Handles dark/light theme switching with localStorage persistence
 */
export default class extends Controller {
  static targets = ["checkbox"]

  connect() {
    this.applyStoredTheme()
  }

  /**
   * Apply stored theme preference from localStorage
   */
  applyStoredTheme() {
    const storedTheme = localStorage.getItem("theme")
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    
    // Determine which theme to use
    let isDark = false
    if (storedTheme === "celestia-night") {
      isDark = true
    } else if (storedTheme === "celestia-dawn") {
      isDark = false
    } else {
      // No stored preference, use system preference
      isDark = prefersDark
    }
    
    // Apply theme
    const theme = isDark ? "celestia-night" : "celestia-dawn"
    document.documentElement.setAttribute("data-theme", theme)
    
    // Sync checkbox state if it exists
    if (this.hasCheckboxTarget) {
      this.checkboxTarget.checked = isDark
    }
  }

  /**
   * Toggle theme when checkbox changes
   */
  toggle(event) {
    const isDark = event.target.checked
    const theme = isDark ? "celestia-night" : "celestia-dawn"
    
    // Apply theme
    document.documentElement.setAttribute("data-theme", theme)
    
    // Store preference
    localStorage.setItem("theme", theme)
    
    // Sync all theme controllers on the page
    this.syncAllThemeCheckboxes(isDark)
  }

  /**
   * Sync all theme checkboxes across the page
   */
  syncAllThemeCheckboxes(isDark) {
    document.querySelectorAll('.theme-controller').forEach(checkbox => {
      if (checkbox !== this.checkboxTarget) {
        checkbox.checked = isDark
      }
    })
  }
}
