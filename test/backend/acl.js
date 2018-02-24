/* eslint-env mocha */

/**
 * test_acl
 *
 * @author Tobias Bräutigam <tbraeutigam@gmail.com>
 * @since 2018
 */
const expect = require('chai').expect
const acl = require('../../backend/acl')

describe('ACL', function () {
  it('check that guest users can only read public channels', async function () {
    let acls = await acl.getEntries(null, 'generic', 'public-channel')
    expect(acls.actions).to.equal(acl.action.READ)
    expect(acls.memberActions).to.equal('')
    expect(acls.ownerActions).to.equal('')
  })

  it('check that users with role \'user\' can read/enter public channels and do more with subscribed/owned ones', async function () {
    let acls = await acl.getEntries('39c83094-aaee-44bf-abc3-65281cc932dc', 'generic', 'public-channel')
    expect(acls.actions).to.include(acl.action.READ)
    expect(acls.actions).to.include(acl.action.ENTER)
    expect(acls.actions).to.have.lengthOf(2)

    expect(acls.memberActions).to.include(acl.action.LEAVE)
    expect(acls.memberActions).to.include(acl.action.PUBLISH)
    expect(acls.memberActions).to.have.lengthOf(2)

    expect(acls.ownerActions).to.include(acl.action.DELETE)
    expect(acls.ownerActions).to.include(acl.action.UPDATE)
    expect(acls.ownerActions).to.have.lengthOf(2)
  })
})
