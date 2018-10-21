/* eslint-env mocha */

/**
 * test_acl
 *
 * @author Tobias Bräutigam <tbraeutigam@gmail.com>
 * @since 2018
 */
// const expect = require('chai').expect
// const acl = require('../../backend/acl')
// const config = require('../../backend/config')
//
// describe('ACL', function () {
//   it('check that guest users can only read public channels', async function () {
//     let acls = await acl.getEntries(null, config.domain + '.channel.test.public')
//     expect(acls.actions).to.equal(acl.action.READ)
//     expect(acls.memberActions).to.equal('')
//     expect(acls.ownerActions).to.equal('')
//   })
//
//   it('check that guest users can call the login rpc', async function () {
//     let acls = await acl.getEntries(null, config.domain + '.rpc.login')
//     expect(acls.actions).to.include(acl.action.EXECUTE)
//     expect(acls.actions).to.have.lengthOf(1)
//
//     expect(acls.memberActions).to.have.lengthOf(0)
//     expect(acls.ownerActions).to.have.lengthOf(0)
//
//     // test other rpc
//     acls = await acl.getEntries(null, config.domain + '.rpc.getModel')
//     expect(acls.actions).to.have.lengthOf(0)
//   })
//
//   it('check that users with role \'user\' can read/enter public channels and do more with subscribed/owned ones', async function () {
//     let acls = await acl.getEntries('0x3', config.domain + '.channel.test.public')
//     expect(acls.actions).to.include(acl.action.READ)
//     expect(acls.actions).to.include(acl.action.ENTER)
//     expect(acls.actions).to.include(acl.action.CREATE)
//     expect(acls.actions).to.have.lengthOf(3)
//
//     expect(acls.memberActions).to.include(acl.action.READ)
//     expect(acls.memberActions).to.include(acl.action.LEAVE)
//     expect(acls.memberActions).to.include(acl.action.PUBLISH)
//     expect(acls.memberActions).to.have.lengthOf(3)
//
//     expect(acls.ownerActions).to.include(acl.action.DELETE)
//     expect(acls.ownerActions).to.include(acl.action.UPDATE)
//     expect(acls.ownerActions).to.have.lengthOf(2)
//   })
//
//   it('check that users with role \'user\' can create channels and do more with subscribed/owned ones', async function () {
//     let acls = await acl.getEntries('0x3', config.domain + '.channel.new-channel.private')
//     expect(acls.actions).to.include(acl.action.CREATE)
//     expect(acls.actions).to.have.lengthOf(1)
//
//     expect(acls.memberActions).to.include(acl.action.LEAVE)
//     expect(acls.memberActions).to.include(acl.action.PUBLISH)
//     expect(acls.memberActions).to.include(acl.action.READ)
//     expect(acls.memberActions).to.have.lengthOf(3)
//
//     expect(acls.ownerActions).to.include(acl.action.ENTER)
//     expect(acls.ownerActions).to.include(acl.action.DELETE)
//     expect(acls.ownerActions).to.include(acl.action.UPDATE)
//     expect(acls.ownerActions).to.have.lengthOf(3)
//   })
// })
