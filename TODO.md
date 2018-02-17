# Was fehlt noch

* JSON Schema für Activity-Types
* FormHandler für Message + Event (für create + edit von Activities)
* In einem Kanal nur bestimmte Activity-Types zulassen (auch Activity-Attachments prüfen)
* ungelesene Nachrichten (in Menü + Kanalansicht)
* Nachricht gelesen erfassen und anzeigen
* Nachrichten posten, ändern
* Attachments (Bilder, andere Nachrichten) 
* Nachrichten teilen (in anderen Kanäle, per Email, Whatsapp, etc.)
* Attachment hashes (keine Notification für bereits erhaltene Attachments)
* Kanal/Actor suche
* Kanäle in Gruppen umbenennen?
* OAuth über Facebook, Twitter, Google


# Mobile

* Dauerhafte Login-Tokens in DB speichern (User soll sich nur einmal anmelden)
* Channel-View zu breit (vlt. Kanaldescription weglassen)
* Appearance auf Zielsystem anpassen (Android -> Material), v.a. die Dialoge/Formularfelder, Scroll-Bounce usw.
* Push-Notifications

# Fehler/Probleme

* Autoscroll:
    * scrollt nicht bis ganz unten
    * automatisch anschalten, abschalten, wenn user nach oben gescrollt hat, anschalten, wenn user ganz nach unten gescrollt hat
* Scroll-Performance (ruckelt)
* Webfont Validierung schlägt fehl  und der Font wird dann wieder entfernt
* Compiler erzeugt die Font-Resources in der falschen Reihenfolge (initialisierung zu spät)