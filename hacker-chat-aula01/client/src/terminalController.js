import ComponentsBuilder from './components.js';
import { constants } from "./constants.js";

export default class TerminalController {
    #usersCollors = new Map()

    constructor() { }

    #pickColor() {
        return `#${((1 << 24) * Math.random() | 0).toString(16)}-fg`
    }

    #getUserCollor(userName) {
        if (this.#usersCollors.has(userName))
            return this.#usersCollors.get(userName)

        const collor = this.#pickColor()
        this.#usersCollors.set(userName, collor)

        return collor
    }

    #onInputReceived(eventEmitter) {
        return function () {
            const message = this.getValue()
            console.log(message)
            this.clearValue()
        }
    }

    #onMenssageReceived({ screen, chat }) {
        return msg => {
            const { username, message } = msg
            const collor = this.#getUserCollor(username)
            chat.addItem(`{${collor}}{bold}${username}{/}: ${message}`)
            screen.render()
        }
    }

    #onLogChanged({ screen, activityLog }) {
        return msg => {
            const [userName] = msg.split(/\s/)
            const collor = this.#getUserCollor(userName)
            activityLog.addItem(`{${collor}}{bold}${msg.toString()}{/}`)
            screen.render()
        }
    }

    #onStatusChanged({ screen, status }) {
        return users => {
            const { content } = status.items.shift()
            status.clearItems()
            status.addItem(content)

            users.forEach(userName => {
                const collor = this.#getUserCollor(userName)
                status.addItem(`{${collor}}{bold}${userName}{/}`)
            })

            screen.render()
        }
    }

    #registerEvents(eventEmitter, components) {
        eventEmitter.on(constants.events.app.MESSAGE_RECEIVED, this.#onMenssageReceived(components))
        eventEmitter.on(constants.events.app.ACTIVITYLOG_UPDATED, this.#onLogChanged(components))
        eventEmitter.on(constants.events.app.STATUS_UPDATE, this.#onStatusChanged(components))
    }

    async initializeTable(eventEmitter) {
        const components = new ComponentsBuilder()
            .setScreen({ title: 'HackerChat - Erick Wendel' })
            .setLayoutComponent()
            .setInputComponent(this.#onInputReceived(eventEmitter))
            .setChatComponent()
            .setActiviteLogComponent()
            .setStatusComponent()
            .build()

        this.#registerEvents(eventEmitter, components)

        components.input.focus()
        components.screen.render()
    }
}