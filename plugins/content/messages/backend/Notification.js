/**
 * create Notification from message
 *
 * @author Tobias Bräutigam <tbraeutigam@gmail.com>
 * @since 2018
 */
const createNotification = (message) => {
  return {
    phrase: 'New message in %s',
    content: message.content.content
  }
}

module.exports = createNotification
