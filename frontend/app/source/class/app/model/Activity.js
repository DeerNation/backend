/* DeerNation community project
 *
 * copyright (c) 2017-2018, Tobias Braeutigam.
 *
 * This program is free software; you can redistribute it and/or modify it
 * under the terms of the GNU General Public License as published by the Free
 * Software Foundation; either version 3 of the License, or (at your option)
 * any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for
 * more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 59 Temple Place - Suite 330, Boston, MA  02111-1307, USA
 */

/**
 * Activity
 *
 * @author tobiasb
 * @since 2018
 * @deprecated
 */

qx.Class.define('app.model.Activity', {
  extend: app.model.AbstractModel,

  /*
  ******************************************************
    CONSTRUCTOR
  ******************************************************
  */
  construct: function (props) {
    this.base(arguments, props)
    this.initCreated(new Date())
  },

  /*
  ******************************************************
    PROPERTIES
  ******************************************************
  */
  properties: {

    title: {
      check: 'String',
      nullable: true,
      event: 'changeTitle',
      apply: '_applyTitle'
    },

    titleUrl: {
      check: 'String',
      nullable: true,
      event: 'changedTitleUrl'
    },

    /**
     * Transformed title (markdown -> HTML)
     */
    displayTitle: {
      check: 'String',
      nullable: true,
      event: 'changeDisplayTitle'
    },

    type: {
      check: ['Message', 'Event'],
      init: null,
      apply: '_updateContentObject'
    },

    content: {
      check: 'Object',
      nullable: true,
      apply: '_updateContentObject'
    },

    contentObject: {
      check: 'app.model.activity.content.AbstractActivityContent',
      nullable: true,
      event: 'changedContentObject'
    },

    /* Creation date of this Activity */
    created: {
      check: 'Date',
      deferredInit: true,
      event: 'changeCreated',
      transform: '_transformDate'
    },

    /* Publication date of this Activity */
    published: {
      check: 'Date',
      nullable: true,
      event: 'changePublished',
      transform: '_transformDate'
    },

    actorId: {
      check: 'String',
      init: null,
      apply: '_applyActorId'
    },

    hash: {
      check: 'String',
      init: null
    },

    channelId: {
      check: 'String',
      init: null
    },

    /**
     * Determines if this activity is the initial master publication
     */
    master: {
      check: 'Boolean',
      init: false
    },

    actor: {
      check: 'app.model.Actor',
      init: null,
      event: 'changeActor'
    },

    /**
     * Reference to another activity (e.g. this activity has been shared in another channel by an actor
     * the reference points to the original activity)
     */
    ref: {
      check: 'String',
      nullable: true
    },

    /**
     * Type of the reference
     */
    refType: {
      check: ['reply', 'share'],
      nullable: true
    },

    marked: {
      check: 'Boolean',
      init: false,
      event: 'changeMarked'
    }
  },

  /*
  ******************************************************
    MEMBERS
  ******************************************************
  */
  members: {

    // property apply
    _applyTitle: function (value) {
      this.setDisplayTitle(app.data.converter.Markdown.convert(value))
    },

    // property apply
    _applyActorId: function (value) {
      if (value) {
        this.setActor(app.Model.lookup('actor', value))
      }
    },

    /**
     * Transform data to activity content object
     * @protected
     */
    _updateContentObject: function () {
      if (!this.getType() || !this.getContent()) {
        // property not ready
        return
      }
      const Clazz = app.model.activity.Registry.getModelClass(this.getType())
      qx.core.Assert.assertNotNull(Clazz)
      const content = this.getContentObject()
      if (content instanceof Clazz) {
        // update content object of same type
        content.set(this.getContent())
      } else {
        // replace content object with new type
        if (content) {
          content.dispose()
        }
        this.setContentObject(new Clazz(this.getContent()))
      }
    }
  }
})
