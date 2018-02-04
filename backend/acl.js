/**
 * acl
 *
 * @author Tobias Bräutigam <tbraeutigam@gmail.com>
 * @since 2018
 */

class AclException extends Error {
}

const action = {
  CREATE: 'c',
  READ: 'r',
  UPDATE: 'u',
  DELETE: 'd',
}

module.exports = {
  action: action,

  /**
   * Checks if the user can execute the action on that topic, otherwise an AclException is thrown
   *
   * @param topic {String} Usually the model item type the action should be executed on
   * @param actions {String} a combination of acl.CREATE, acl.READ, ...
   * @param authToken {Object} auth token of the current user
   * @param exceptionText {String?} optional text if the check fails
   * @returns {boolean} true if the check succeeds
   * @throws {AclException} if the check fails
   */
  check: function (topic, actions, authToken, exceptionText) {
    // TODO read and evaluate ACLs, throw exception on failure
    return true
  },

  /**
   * Returns a concatenated string with all allowed actions on the topic
   * @param topic {String} Usually the model item type the action should be executed on
   * @param authToken {Object} auth token of the current user
   * @returns {string} concatenated allowed actions
   */
  getAllowedActions: function (topic, authToken) {
    return action.CREATE + action.READ + action.UPDATE + action.DELETE
  },

  AclException: AclException
}
