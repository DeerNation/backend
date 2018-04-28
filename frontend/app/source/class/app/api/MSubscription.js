/**
 * MHidden
 *
 * @author Tobias Bräutigam <tbraeutigam@gmail.com>
 * @since 2018
 */
qx.Mixin.define('app.api.MSubscription', {

  /*
  ******************************************************
    CONSTRUCTOR
  ******************************************************
  */
  construct: function () {
    this.addListener('changeChannel', () => {
      this.setIcon(this.getChannel().getIcon())
    })
  },

  /*
  ******************************************************
    PROPERTIES
  ******************************************************
  */
  properties: {
    hidden: {
      check: 'Boolean',
      init: false,
      event: 'changedHidden'
    },
    icon: {
      check: 'String',
      nullable: true,
      event: 'changedIcon'
    }
  }
})
