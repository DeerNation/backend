/**
 * ModelSubscriptions
 *
 * @author Tobias Bräutigam <tbraeutigam@gmail.com>
 * @since 2018
 */
const logger = require('../logger')(__filename)

class ModelSubscriptions {
  constructor () {
    this._listeners = {}
    this._listenerIdRegex = /([^>]*)>?([\w]*)\[?(0x[\d]+)\]?/
  }

  __parseListenerId (listenerId) {
    const res = this._listenerIdRegex.exec(listenerId)
    if (!res) {
      throw new Error('Invalid listener ID:' + listenerId)
    }
    return {
      type: res[1],
      edge: res[2],
      uid: res[3]
    }
  }

  /**
   * Add listener to changes for the given UID
   * @param listenerId {String}
   * @param callback {Function}
   * @param context {Object?}
   */
  addListener (listenerId, callback, context, socket) {
    listenerId = listenerId.toLowerCase()
    if (!this._listeners.hasOwnProperty(listenerId)) {
      this._listeners[listenerId] = {
        parsedId: this.__parseListenerId(listenerId),
        listeners: []
      }
      logger.debug('listening to ' + listenerId)
    }
    this._listeners[listenerId].listeners.push({
      callback: callback,
      context: context || this
    })
  }

  /**
   * Remove listener to changes for the given UID
   * @param listenerId {String}
   * @param callback {Function}
   * @param context {Object?}
   */
  removeListener (listenerId, callback, context) {
    listenerId = listenerId.toLowerCase()
    if (this._listeners.hasOwnProperty(listenerId)) {
      this._listeners[listenerId].listeners = this._listeners[listenerId].listeners.filter((entry) => {
        return !(entry.callback === callback && entry.context === (context || this))
      })
    }
  }

  /**
   * Remove all listeners for changes on the UID
   * @param listenerId {String\
   */
  removeAllListeners (listenerId) {
    delete this._listeners[listenerId]
  }

  /**
   * Notify listeners about a change for the UID
   * @param uid {String}
   * @param change {Map} change data of structure proto.dn.Object
   */
  notifyListeners (change) {
    const changedObject = change.object[change.object.content]
    const baseName = change.object.content.toLowerCase()
    Object.keys(this._listeners).forEach(listenerId => {
      const listener = this._listeners[listenerId]
      console.log(listener)
      if (listener.parsedId.type && baseName !== listener.parsedId.type) {
        return
      }
      if (listener.parsedId.edge) {
        if (!changedObject.hasOwnProperty(listener.parsedId.edge) ||
          !changedObject[listener.parsedId.edge] ||
          listener.parsedId.uid) {
          if (Array.isArray(changedObject[listener.parsedId.edge])) {
            if (!changedObject[listener.parsedId.edge].map(x => x.uid).includes(listener.parsedId.uid)) {
              return
            }
          } else if (changedObject[listener.parsedId.edge].uid !== listener.parsedId.uid) {
            return
          }
        }
      } else if (listener.parsedId.uid && changedObject.uid !== listener.parsedId.uid) {
        return
      }

      logger.debug(`notifying ${listener.listeners.length} listeners about change on type ${baseName} on ID ${listenerId}`)
      listener.listeners.forEach(entry => {
        entry.callback.call(entry.context, change)
      })
    })
  }
}

const modelSub = new ModelSubscriptions()
module.exports = modelSub
