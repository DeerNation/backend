/**
 * Database schema migrations. Please note that the migration scripts must be idempotent!
 *
 * @author Tobias Bräutigam <tbraeutigam@gmail.com>
 * @since 2018
 */
const semver = require('semver')
const logger = require('../logger')(__filename)

class DbMigration {
  constructor (schema) {
    this.dbSchemaVersion = '0.0.1'
    this.currentSchemaVersion = schema.getVersion()
    this.schema = schema

    // migrations
    this.__migrations = {
      '0.0.1-0.1.0': [this.migrate001To010],
      '0.1.0-0.1.1': [this.migrate010To011]
    }
  }

  async run () {
    const entry = await this.schema.getModel('System').filter({key: 'schemaVersion'}).run()
    this.dbSchemaVersion = entry.length ? entry[0].value : '0.0.1'
    logger.info('comparing schema versions %s, %s', this.currentSchemaVersion, this.dbSchemaVersion)

    if (semver.gt(this.currentSchemaVersion, this.dbSchemaVersion)) {
      // we need to migrate, check if we have a migration method for this
      const migrationKey = this.dbSchemaVersion + '-' + this.currentSchemaVersion
      if (this.__migrations.hasOwnProperty(migrationKey)) {
        logger.info('starting migration process %s', migrationKey)
        this.__migrations[migrationKey].forEach(async (migrationStep) => {
          await migrationStep.call(this)
        })
      } else {
        logger.info('no migration procedure defined to migrate from %s to %s', this.dbSchemaVersion, this.currentSchemaVersion)
      }
    } else {
      logger.info('current DB schema is up to date %s', this.dbSchemaVersion)
    }
  }

  async migrate001To010 () {
    logger.info('running migrate001To010')
    const r = this.schema.getR()
    const activityModel = this.schema.getModel('Activity')
    const publicationModel = this.schema.getModel('Publication')
    const activities = await activityModel.filter(r.row.hasFields(['actorId', 'channelId', 'published'])).run()
    activities.forEach(async (activity) => {
      await publicationModel.save({
        actorId: activity.actorId,
        channelId: activity.channelId,
        published: activity.published,
        activityId: activity.id,
        master: true
      })
    })
    // delete keys
    await activityModel.replace(r.row.without(['actorId', 'channelId', 'published'])).run()
    const entry = await this.schema.getModel('System').filter({key: 'schemaVersion'}).run()
    entry.value = '0.1.0'
    this.schema.getModel('System').update(entry, {conflict: 'update'})
    logger.info('successfully migrated schema from 0.0.1 to 0.1.0')
  }

  async migrate010To011 () {
    logger.info('running migrate010To011')
    const activityModel = this.schema.getModel('Activity')
    const publicationModel = this.schema.getModel('Publication')
    const publications = await publicationModel.filter({master: true}).run()
    publications.forEach(async (publication) => {
      const activity = await activityModel.get(publication.activityId).run()
      await activity.merge({actorId: publication.actorId}).save()
    })
    const entry = await this.schema.getModel('System').filter({key: 'schemaVersion'}).run()
    entry.value = '0.1.1'
    this.schema.getModel('System').update(entry, {conflict: 'update'})
    logger.info('successfully migrated schema from 0.1.0 to 0.1.1')
  }
}
module.exports = DbMigration
