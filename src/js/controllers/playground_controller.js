import { Controller } from "@hotwired/stimulus"

/**
 * Playground Controller
 * Handles the main chat interface interactions
 */
export default class extends Controller {
  static targets = ["messages", "input", "typingIndicator", "sendButton"]

  connect() {
    // Scroll to bottom of messages on load
    this.scrollToBottom()
    // Initialize sending state
    this.isSending = false
    // Track any pending simulated response so we can clean up on disconnect
    this.aiResponseTimeoutId = null
  }

  disconnect() {
    if (this.aiResponseTimeoutId) {
      clearTimeout(this.aiResponseTimeoutId)
      this.aiResponseTimeoutId = null
    }
  }

  /**
   * Handle keyboard shortcuts in the input
   */
  handleKeydown(event) {
    // Enter without Shift sends the message
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      this.send()
    }
  }

  /**
   * Send a message
   */
  send() {
    // Prevent sending if already processing
    if (this.isSending) return

    if (!this.hasInputTarget) return

    const input = this.inputTarget
    const message = input.value.trim()
    
    if (!message) return
    
    // Lock input before any operation
    this.lockInput()
    
    // Add user message to chat
    this.addUserMessage(message)
    
    // Clear input
    input.value = ""
    
    // Show typing indicator
    this.showTypingIndicator()
    
    // Simulate AI response (in real implementation, this would call an API)
    if (this.aiResponseTimeoutId) clearTimeout(this.aiResponseTimeoutId)
    this.aiResponseTimeoutId = setTimeout(() => {
      this.aiResponseTimeoutId = null
      this.hideTypingIndicator()
      this.addAIMessage(this.generateMockResponse(message), { isHtml: true })
      // Unlock input after AI response
      this.unlockInput()
    }, 1500 + Math.random() * 1000)
  }

  /**
   * Lock input during message processing
   */
  lockInput() {
    this.isSending = true
    if (this.hasInputTarget) {
      this.inputTarget.disabled = true
    }
    if (this.hasSendButtonTarget) {
      this.sendButtonTarget.disabled = true
    }
  }

  /**
   * Unlock input after message processing
   */
  unlockInput() {
    this.isSending = false
    if (this.hasInputTarget) {
      this.inputTarget.disabled = false
      this.inputTarget.focus()
    }
    if (this.hasSendButtonTarget) {
      this.sendButtonTarget.disabled = false
    }
  }

  /**
   * Add a user message to the chat
   */
  addUserMessage(text) {
    const time = this.getCurrentTime()
    const messageHTML = `
      <div class="chat chat-end">
        <div class="chat-header mb-1">
          <time class="text-xs opacity-50 mr-2">${time}</time>
          <span class="font-medium">你</span>
        </div>
        <div class="chat-bubble chat-bubble-primary">${this.escapeHTML(text)}</div>
        <div class="chat-footer mt-1 flex gap-1 justify-end [&>button]:opacity-50 [&>button:hover]:opacity-100">
          <button class="btn btn-ghost btn-xs">
            <svg xmlns="http://www.w3.org/2000/svg" class="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
            </svg>
          </button>
        </div>
      </div>
    `
    
    this.messagesTarget.insertAdjacentHTML("beforeend", messageHTML)
    this.scrollToBottom()
  }

  /**
   * Add an AI message to the chat
   */
  addAIMessage(text, { isHtml = false } = {}) {
    const time = this.getCurrentTime()
    const content = isHtml ? text : this.escapeHTML(text)
    const messageHTML = `
      <div class="chat chat-start">
        <div class="chat-image avatar placeholder">
          <div class="w-10 rounded-full bg-secondary text-secondary-content">
            <span>艾</span>
          </div>
        </div>
        <div class="chat-header mb-1">
          <span class="font-medium">艾丽西亚</span>
          <time class="text-xs opacity-50 ml-2">${time}</time>
        </div>
        <div class="chat-bubble chat-bubble-secondary">${content}</div>
        <div class="chat-footer mt-1 flex gap-1 [&>button]:opacity-50 [&>button:hover]:opacity-100">
          <button class="btn btn-ghost btn-xs">
            <svg xmlns="http://www.w3.org/2000/svg" class="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
            </svg>
          </button>
          <button class="btn btn-ghost btn-xs">
            <svg xmlns="http://www.w3.org/2000/svg" class="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
              <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
            </svg>
          </button>
          <button class="btn btn-ghost btn-xs">
            <svg xmlns="http://www.w3.org/2000/svg" class="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
              <path d="M21 3v5h-5"/>
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
              <path d="M8 16H3v5"/>
            </svg>
          </button>
        </div>
      </div>
    `
    
    this.messagesTarget.insertAdjacentHTML("beforeend", messageHTML)
    this.scrollToBottom()
  }

  /**
   * Show typing indicator
   */
  showTypingIndicator() {
    if (this.hasTypingIndicatorTarget) {
      // Move typing indicator to end of messages container
      this.messagesTarget.appendChild(this.typingIndicatorTarget)
      this.typingIndicatorTarget.style.display = ""
      this.scrollToBottom()
    }
  }

  /**
   * Hide typing indicator
   */
  hideTypingIndicator() {
    if (this.hasTypingIndicatorTarget) {
      this.typingIndicatorTarget.style.display = "none"
    }
  }

  /**
   * Scroll messages to bottom
   */
  scrollToBottom() {
    if (this.hasMessagesTarget) {
      this.messagesTarget.scrollTop = this.messagesTarget.scrollHeight
    }
  }

  /**
   * Get current time string
   */
  getCurrentTime() {
    const now = new Date()
    return `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`
  }

  /**
   * Escape HTML to prevent XSS
   */
  escapeHTML(text) {
    const div = document.createElement("div")
    div.textContent = text
    return div.innerHTML.replace(/\n/g, "<br>")
  }

  /**
   * Generate a mock response (for demo purposes)
   */
  generateMockResponse(userMessage) {
    const responses = [
      `<p>*轻轻点头，眼中闪烁着兴趣的光芒*</p><p class="mt-2">这是个很好的问题。让我想想该如何回答...</p>`,
      `<p>*微笑着倾听*</p><p class="mt-2">我明白你的意思了。在这个酒馆里，每个旅人都有自己独特的故事。</p>`,
      `<p>有趣的想法！</p><p class="mt-2">*从书架上取下一本古老的魔法书*</p><p class="mt-2">也许这本书里有你想要的答案...</p>`,
      `<p>*若有所思地望向窗外*</p><p class="mt-2">你知道吗，这让我想起了一个古老的传说。据说在遥远的北方山脉之中...</p>`,
    ]
    
    return responses[Math.floor(Math.random() * responses.length)]
  }
}
