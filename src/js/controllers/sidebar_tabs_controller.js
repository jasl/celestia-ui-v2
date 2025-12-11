import { Controller } from "@hotwired/stimulus"

/**
 * Sidebar Tabs Controller
 * Handles tab switching in the left sidebar (Characters/Scenes/Memory)
 */
export default class extends Controller {
  static targets = ["tab", "panel"]

  connect() {
    // Show first panel by default
    this.showPanel("characters")
  }

  /**
   * Switch to a different panel
   */
  switch(event) {
    const panelName = event.currentTarget.dataset.panel
    this.showPanel(panelName)
    
    // Update tab active states
    this.tabTargets.forEach(tab => {
      if (tab.dataset.panel === panelName) {
        tab.classList.add("tab-active")
      } else {
        tab.classList.remove("tab-active")
      }
    })
  }

  /**
   * Show a specific panel by name
   */
  showPanel(name) {
    this.panelTargets.forEach(panel => {
      if (panel.dataset.name === name) {
        panel.classList.remove("hidden")
      } else {
        panel.classList.add("hidden")
      }
    })
  }
}
