/**
 * exceptions
 *
 * @author Tobias Bräutigam <tbraeutigam@gmail.com>
 * @since 2018
 */

class AclException extends Error {}

class ResponseException extends Error {
  constructor (code, message) {
    super(message)
    this.code = code
  }
}

module.exports = {
  AclException: AclException,
  ResponseException: ResponseException
}