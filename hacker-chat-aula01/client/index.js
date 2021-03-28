import Events from 'events'
import TerminalController from "./src/terminalController.js"; // Top level await

const componentEmitter = new Events()

const controller = new TerminalController()
await controller.initializeTable(componentEmitter)