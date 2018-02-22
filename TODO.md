# Was fehlt noch

* JSON Schema für Activity-Types
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
 * Activity de-selektieren bei erneutem Klick
 * ✔ FormHandler für Messages (Anlegen/Editieren)
 * FormHandler für Event (Anlegen/Editieren)
 * ✔ Nachrichten posten, ändern, löschen
 * Nachricht gelesen erfassen und anzeigen
 * In einem Kanal nur bestimmte Activity-Types zulassen (auch Activity-Attachments prüfen)
 * keine Notification für bereits erhalten Content
 * Attachments (Bilder, andere Nachrichten) 
 * Nachrichten teilen (in anderen Kanäle, per Email, Whatsapp, etc.)
 * Ungelesene Nachrichten kennzeichen + tracken
 * User xy schreibt...
 

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