
let schema = ''

// edges to other objects
schema += `
actor: uid @reverse .
roleTarget: uid @reverse .
channel: uid @reverse .
ref: uid @reverse .
publication: uid @reverse .
activity: uid @reverse .
payload: uid .`

// common edges
schema += `
baseName: string @index(exact) .`

// actor
schema += `
actor.type: int .
username: string @index(hash) @upsert .
password: password .
email: string .`

// misc
schema += `
id: string @index(hash) @upsert .
type: string @index(hash) .
tokenId: string @index(hash) .
identifier: string @index(hash) .
created: datetime @index(month) .
published: datetime @index(month) .
allowedActivityTypes: [string] .
published: datetime @index(hour) .
info: string .`

module.exports = schema
