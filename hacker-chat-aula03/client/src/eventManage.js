import { constants } from "./constants.js"

export default class EventManager {
    #allUsers = new Map()

    constructor({ componentEmitter, socketClient }) {
        this.componentEmitter = componentEmitter
        this.socketClient = socketClient
    }

    joinRoomAndWaitForMessages(data) {
        this.socketClient.sendMessage(constants.events.socket.JOIN_ROOM, data)

        this.componentEmitter.on(constants.events.app.MESSAGE_SENT, msg => {
            this.socketClient.sendMessage(constants.events.socket.MESSAGE, msg)
        })
    }

    updateUsers(users) {
        console.log('updateUsers');
        const connectUsers = users
        connectUsers.forEach(({ id, userName }) => this.#allUsers.set(id, userName))
        this.#updateUsersComponents()

    }

    newUserConnected(message) {
        console.log('newUserConnected');
        const user = message
        this.#allUsers.set(user.id, user.userName)
        this.#updateUsersComponents()
        this.#updateActivityLogComponent(`${user.userName} joined!`)
    }

    #updateActivityLogComponent(message) {
        this.componentEmitter.emit(
            constants.events.app.ACTIVITYLOG_UPDATED,
            message
        )
    }

    #updateUsersComponents() {
        console.log("updateComponet");
        console.log(this.#allUsers.values())
        this.componentEmitter.emit(
            constants.events.app.STATUS_UPDATED,
            Array.from(this.#allUsers.values())
        )
    }

    getEvents() {
        const functions = Reflect.ownKeys(EventManager.prototype)
            .filter(fn => fn !== 'constructor')
            .map(name => [name, this[name].bind(this)])

        return new Map(functions)
    }
}