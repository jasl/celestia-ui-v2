import { Application } from "@hotwired/stimulus"

// Import controllers
import ThemeController from "./controllers/theme_controller"
import PanelSwitcherController from "./controllers/panel_switcher_controller"
import PlaygroundController from "./controllers/playground_controller"
import ToastController from "./controllers/toast_controller"
import DrawerController from "./controllers/drawer_controller"

// Start Stimulus application
const application = Application.start()

// Configure Stimulus development experience
application.debug = false
window.Stimulus = application

// Register controllers
application.register("theme", ThemeController)
application.register("panel-switcher", PanelSwitcherController)
application.register("playground", PlaygroundController)
application.register("toast", ToastController)
application.register("drawer", DrawerController)
