Backend for DeerNation community app
====================================

Advanced features:
* End-to-End encryption for direct messages
* OTR messaging between 2 users
* Fulltext search (elastic search or sphinxsearch)
* Custom User status/location/Profile Pictures

Advanced messaging features
* Multiple Attachments (Images, Videos, Audio, PDF, Doc, Excel, Powerpoint, VCard, ICal, Link)
* Attachment Preview
* Hashtags (can be used as filters/search)
* DONE Markdown
* Emojies




# Was fehlt noch

* JSON Schema für Activity-Types (im ChannelHandler implementiert, nur valide Activities werden im Kanal ge-published)
* Logout Funktion (automatisch triggern bei Serverwechsel)
* ungelesene Nachrichten: Badge an Kanal im Menü
* Kanal/Actor suche
* Kanäle in Gruppen umbenennen?
* OAuth über Facebook, Twitter, Google
* Unit-, Integrations & End-to-end Tests
* DB-Migration + Backup + Restore
* Deployment auf Openshift? (automatische Skalierung von Backend + DB)
* User Online bei pointerover

* app.ui.Channel
 * ✔ Activity de-selektieren bei erneutem Klick
 * ✔ FormHandler für Messages (Anlegen/Editieren)
 * FormHandler für Event (Anlegen/Editieren)
 * ✔ Nachrichten posten, ändern, löschen
 * Nachricht gelesen erfassen und anzeigen
 * Ungelesene Nachrichten kennzeichen + tracken
 * In einem Kanal nur bestimmte Activity-Types zulassen (auch Activity-Attachments prüfen)
 * keine Notification für bereits erhalten Content
 * Attachments (Bilder, andere Nachrichten) 
 * Nachrichten teilen (in anderen Kanäle, per Email, Whatsapp, etc.)
 * ✔ User xy schreibt...
 * Spezielle Nachrichten: Orte (Blitzermeldungen)
 
* ? Rückkanal für geänderte Events (wenn sie von externer Quelle stammen und diese editierbar ist)
 
# ACL

* Bekannte Rollen:
 * guest: nicht angemeldete Benutzer
  * Public Kanäle lesen (Liste der Kanäle + Activities abfragen + öffentliche Kanäle automatisch subscriben)
  * Keine Kanal Aktionen (Favoriten anlegen, Kanal verlassen, usw.)
  * Keine Notifications jeglicher Art
  * RPC: login
 * user: angemeldete Benutzer (Standard-Rolle)
  * Public Kanäle subscriben
  * Kanalaktionen (Favoriten, verlassen usw.)
  * der Rest 
 * admin: darf alles
 * public/private-channel: spezielle Rolle um Rechte für öffentliche/private Kanäle zu definieren, 
 dann gilt folgende Rollenhierachie in er die ACLs gelesen werden:
  
  public-channel-ACLEntry
   -> channel-ACLEntry
    -> user-role-ACLEntry
 
## ACL actions

* Channels (General) -> Object:
 * c: create channel
 * u: update channel item
 * d: delete channel

* Channel (specific):
 * c: publish activity in channel
 * r: read activity (without subscription)
 * u: update activity in this channel
 * d: delete activity
 * e: subscribe to / enter this channel
 * l: unsubscribe from / leave this channel
 * f: toggle favorite of this channel
 * i: invite others to this channel (add subscription for others to this channel)
 
* Object/Property:
 * c: create
 * r: read
 * u: update
 * d: delete
 
* RPC:
 * x: execute
 
 Channels can have types (public, private) and a read-only flag (only selected users can publish in this channel)
 * public channels can be (un)-subscribed by users, read by guests
   - user: rsutp(eo)
   - guest: r
   - admin: *
 * private channels cannot be subscribed and read, certain users can invite others to this channel
   users can unsubscribe from this channel
    - user: utp(eo)
    - guest: -
    - admin: user
 * Read-only channels: only users with 'p' rights can publish to this channel
    * Default ACL (if not overridden by current user): 
    - user: -p
    - guest: -
    - admin: user
 * Not-Read-Only channels (user has p rights): 
    
 
* RPCs:
 * e: execute
 
# ACLEntry Schema:
 id: uuid
 type: channel|rpc|activity|template
 topic: channelId|RPCname|ownActivity/allActivities|(public-/private-channel)
 actions: rsutp
 target-type: role|actor|channel
 target: role-name|actorId|channelId

# Mobile

* Dauerhafte Login-Tokens in DB speichern (User soll sich nur einmal anmelden)
* Channel-View zu breit (vlt. Kanaldescription weglassen)
* Appearance auf Zielsystem anpassen (Android -> Material), v.a. die Dialoge/Formularfelder, Scroll-Bounce usw.
* Push-Notifications:
  * ✔ notId, Gruppierungen usw.
  * ✔ Leerer Kreis ohne Icon im Locked-Screen
  * ✔ Nachrichten die von Dev-System gesendet werden dürfen nicht auf Clients, die mit dem Prod-System verbunden sind angezeigt werden
    (=> ServerName in die Topics mit einbauen, der Server muss dann aber auch die Subscriptions löschen, wenn der CLient
    sich auslogged (durch serverwechel), sonst kann der Client nach Wechsel des Servers auf beiden subscribed sein)
  * Subscriptions löschen, bei logout (nicht beim disconnect)

# Fehler/Probleme

* Kein Icon in Desktop-Notifications
* Autoscroll:
    * scrollt nicht bis ganz unten
    * automatisch anschalten, abschalten, wenn user nach oben gescrollt hat, anschalten, wenn user ganz nach unten gescrollt hat
* Scroll-Performance (ruckelt)
* Webfont Validierung schlägt fehl  und der Font wird dann wieder entfernt
* Compiler erzeugt die Font-Resources in der falschen Reihenfolge (initialisierung zu spät)
