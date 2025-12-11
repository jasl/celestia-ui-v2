import { Controller } from "@hotwired/stimulus"

/**
 * Auth Tabs Controller
 * Handles login/register tab switching on the auth page
 */
export default class extends Controller {
  static targets = ["loginTab", "registerTab", "loginForm", "registerForm", "subtitle"]

  connect() {
    // Default to login view
    this.showLogin()
  }

  /**
   * Show login form
   */
  showLogin() {
    // Update tabs
    this.loginTabTarget.classList.add("tab-active")
    this.registerTabTarget.classList.remove("tab-active")
    
    // Show/hide forms
    this.loginFormTarget.classList.remove("hidden")
    this.registerFormTarget.classList.add("hidden")
    
    // Update subtitle
    if (this.hasSubtitleTarget) {
      this.subtitleTarget.textContent = "登录你的账号，继续昨晚没讲完的故事"
    }
  }

  /**
   * Show register form
   */
  showRegister() {
    // Update tabs
    this.loginTabTarget.classList.remove("tab-active")
    this.registerTabTarget.classList.add("tab-active")
    
    // Show/hide forms
    this.loginFormTarget.classList.add("hidden")
    this.registerFormTarget.classList.remove("hidden")
    
    // Update subtitle
    if (this.hasSubtitleTarget) {
      this.subtitleTarget.textContent = "创建新账号，开启你的冒险之旅"
    }
  }
}
