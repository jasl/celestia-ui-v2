import { Controller } from "@hotwired/stimulus"

/**
 * Panel Switcher Controller
 * A universal panel switching component for cases where tabs and panels need to be separated.
 * Use this when daisyUI's native radio + tab-content structure doesn't fit your layout needs.
 * 
 * Usage:
 * <div data-controller="panel-switcher" data-panel-switcher-default-value="panel1">
 *   <!-- Tab buttons (can be anywhere in the container) -->
 *   <button data-panel-switcher-target="tab" data-panel-switcher-id-param="panel1" data-action="click->panel-switcher#switch">Tab 1</button>
 *   <button data-panel-switcher-target="tab" data-panel-switcher-id-param="panel2" data-action="click->panel-switcher#switch">Tab 2</button>
 *   
 *   <!-- Panels (can be in a different location from tabs) -->
 *   <div data-panel-switcher-target="panel" data-panel-switcher-id="panel1">Content 1</div>
 *   <div data-panel-switcher-target="panel" data-panel-switcher-id="panel2">Content 2</div>
 * </div>
 * 
 * Features:
 * - Support arbitrary number of tabs and panels
 * - Support pre-selected tab via data-panel-switcher-default-value or existing tab-active class
 * - Backend can pre-render active state by adding tab-active class and removing hidden class
 * - Uses data attributes for configuration, compatible with server-side rendering (Rails, etc.)
 */
export default class extends Controller {
  static targets = ["tab", "panel"]
  static values = {
    default: String,      // Default panel ID to show on connect
    activeClass: { type: String, default: "tab-active" },  // Class for active tab
    hiddenClass: { type: String, default: "hidden" }       // Class for hidden panel
  }

  connect() {
    // Check if there's already an active tab (server-side rendered state)
    const activeTab = this.tabTargets.find(tab => tab.classList.contains(this.activeClassValue))
    
    if (activeTab) {
      // Server has pre-rendered active state, ensure panels are in sync
      const panelId = this.getPanelId(activeTab)
      if (panelId) this.showPanel(panelId)
    } else if (this.hasDefaultValue && this.defaultValue) {
      // Use the default value from data attribute
      this.show(this.defaultValue)
    } else if (this.tabTargets.length > 0) {
      // Default to first tab
      const firstPanelId = this.getPanelId(this.tabTargets[0])
      if (firstPanelId) this.show(firstPanelId)
    }
  }

  /**
   * Switch to a different panel
   * @param {Event} event - Click event from tab button
   */
  switch(event) {
    const panelId = event.params.id || this.getPanelId(event.currentTarget)
    if (panelId) this.show(panelId)
  }

  /**
   * Programmatically show a specific panel by ID
   * @param {string} panelId - The panel identifier
   */
  show(panelId) {
    this.updateTabs(panelId)
    this.showPanel(panelId)
    
    // Dispatch custom event for external listeners
    this.dispatch("changed", { detail: { panelId } })
  }

  /**
   * Update tab active states
   * @param {string} activePanelId - The ID of the panel to activate
   */
  updateTabs(activePanelId) {
    this.tabTargets.forEach(tab => {
      const panelId = this.getPanelId(tab)
      if (panelId === activePanelId) {
        tab.classList.add(this.activeClassValue)
        tab.setAttribute("aria-selected", "true")
      } else {
        tab.classList.remove(this.activeClassValue)
        tab.setAttribute("aria-selected", "false")
      }
    })
  }

  /**
   * Show the panel matching the given ID, hide others
   * @param {string} panelId - The ID of the panel to show
   */
  showPanel(panelId) {
    this.panelTargets.forEach(panel => {
      const id = panel.dataset.panelSwitcherId
      if (id === panelId) {
        panel.classList.remove(this.hiddenClassValue)
        panel.setAttribute("aria-hidden", "false")
      } else {
        panel.classList.add(this.hiddenClassValue)
        panel.setAttribute("aria-hidden", "true")
      }
    })
  }

  /**
   * Get the panel ID from a tab element
   * Supports both data-panel-switcher-id-param (Stimulus params) and data-panel-switcher-id attributes
   * @param {HTMLElement} tab - The tab element
   * @returns {string|null} - The panel ID or null
   */
  getPanelId(tab) {
    return tab.dataset.panelSwitcherIdParam || tab.dataset.panelSwitcherId || null
  }

  /**
   * Get the currently active panel ID
   * @returns {string|null} - The active panel ID or null
   */
  get activePanelId() {
    const activeTab = this.tabTargets.find(tab => tab.classList.contains(this.activeClassValue))
    return activeTab ? this.getPanelId(activeTab) : null
  }
}
