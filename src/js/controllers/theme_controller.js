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
    let storedTheme = null
    try {
      storedTheme = localStorage.getItem("theme")
    } catch (e) {
      storedTheme = null
    }

    const prefersDark = (() => {
      try {
        return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
      } catch (e) {
        return false
      }
    })()
    
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
    document.documentElement.style.colorScheme = isDark ? "dark" : "light"
    
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
    document.documentElement.style.colorScheme = isDark ? "dark" : "light"
    
    // Store preference
    try {
      localStorage.setItem("theme", theme)
    } catch (e) {
      // localStorage might be unavailable
    }
    
    // Sync all theme controllers on the page
    this.syncAllThemeCheckboxes(isDark)
  }

  /**
   * Sync all theme checkboxes across the page
   */
  syncAllThemeCheckboxes(isDark) {
    const currentCheckbox = this.hasCheckboxTarget ? this.checkboxTarget : null

    // Sync only our theme toggle checkboxes (avoid accidentally toggling other theme-controller inputs in demos)
    document.querySelectorAll('input[data-theme-target="checkbox"]').forEach((checkbox) => {
      if (currentCheckbox && checkbox === currentCheckbox) return
      checkbox.checked = isDark
    })
  }
}
