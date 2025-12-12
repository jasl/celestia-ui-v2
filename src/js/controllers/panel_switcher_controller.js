import { Controller } from "@hotwired/stimulus"

let panel_switcher_instance_counter = 0

function to_safe_dom_id(value) {
  return String(value).trim().replace(/[^a-zA-Z0-9_-]/g, "-")
}

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
    // A stable-ish per-instance id prefix for generated ARIA ids (avoids collisions across multiple instances)
    this.instanceId = this.element.id ? to_safe_dom_id(this.element.id) : `panel-switcher-${++panel_switcher_instance_counter}`

    // Ensure tabs/panels have consistent ARIA wiring (controls/labelledby/roles)
    this.setupAria()

    // Keyboard support: arrow keys + Home/End on tabs
    this.boundHandleKeydown = this.handleKeydown.bind(this)
    this.tabTargets.forEach((tab) => tab.addEventListener("keydown", this.boundHandleKeydown))

    // Check if there's already an active tab (server-side rendered state)
    const activeTab = this.tabTargets.find(tab => tab.classList.contains(this.activeClassValue))
    
    if (activeTab) {
      // Server has pre-rendered active state, ensure panels are in sync
      const panelId = this.getPanelId(activeTab)
      if (panelId) {
        this.updateTabs(panelId)
        this.showPanel(panelId)
      }
    } else if (this.hasDefaultValue && this.defaultValue) {
      // Use the default value from data attribute
      this.show(this.defaultValue)
    } else if (this.tabTargets.length > 0) {
      // Default to first tab
      const firstPanelId = this.getPanelId(this.tabTargets[0])
      if (firstPanelId) this.show(firstPanelId)
    }
  }

  disconnect() {
    if (this.boundHandleKeydown) {
      this.tabTargets.forEach((tab) => tab.removeEventListener("keydown", this.boundHandleKeydown))
    }
  }

  /**
   * Keyboard navigation for tabs (arrow keys + Home/End)
   */
  handleKeydown(event) {
    const keys = new Set(["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"])
    if (!keys.has(event.key)) return

    const tabs = this.tabTargets
    if (tabs.length === 0) return

    const currentIndex = tabs.indexOf(event.currentTarget)
    if (currentIndex === -1) return

    let nextIndex = currentIndex

    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex = (currentIndex - 1 + tabs.length) % tabs.length
    } else if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = (currentIndex + 1) % tabs.length
    } else if (event.key === "Home") {
      nextIndex = 0
    } else if (event.key === "End") {
      nextIndex = tabs.length - 1
    }

    event.preventDefault()
    const nextTab = tabs[nextIndex]
    nextTab.focus()

    const panelId = this.getPanelId(nextTab)
    if (panelId) this.show(panelId)
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
        tab.setAttribute("tabindex", "0")
      } else {
        tab.classList.remove(this.activeClassValue)
        tab.setAttribute("aria-selected", "false")
        tab.setAttribute("tabindex", "-1")
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
        panel.hidden = false
        panel.setAttribute("aria-hidden", "false")
      } else {
        panel.classList.add(this.hiddenClassValue)
        panel.hidden = true
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

  /**
   * Ensure WAI-ARIA tabs wiring is correct, even when markup is server-rendered.
   */
  setupAria() {
    const panelById = new Map()
    this.panelTargets.forEach((panel) => {
      const panelId = panel.dataset.panelSwitcherId
      if (!panelId) return
      panelById.set(panelId, panel)
    })

    this.tabTargets.forEach((tab) => {
      const panelId = this.getPanelId(tab)
      if (!panelId) return

      // Roles
      tab.setAttribute("role", "tab")

      const panel = panelById.get(panelId)
      if (!panel) return

      panel.setAttribute("role", "tabpanel")

      // IDs + relationships
      if (!tab.id) tab.id = `${this.instanceId}-tab-${to_safe_dom_id(panelId)}`
      if (!panel.id) panel.id = `${this.instanceId}-panel-${to_safe_dom_id(panelId)}`

      tab.setAttribute("aria-controls", panel.id)
      panel.setAttribute("aria-labelledby", tab.id)
    })
  }
}
