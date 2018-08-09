Backend for DeerNation community app
====================================

The backend uses [socketcluster](https://socketcluster.io/) as internal real-time communication system. Data is persisted in a [Dgraph](https://dgraph.io/)-database. The backend is designed to run in a kubernetes environment.

The communication interface is based on [grpc](https://grpc.io/) encoded messages sent over socketclusters websocket interface.
The structure of the interface is defined in [proto]https://github.com/DeerNation/protos/() files.

A default web-based client can be found here https://github.com/DeerNation/frontend.

The basic service this application provides is sending messages in channels. Those messages are persisted in a database.
A channel is a (public or private) message board where a defined group of people can read or write messages to.
The content of the messages is defined in plugins, currently two plugins are available:

* [Message plugin](https://github.com/DeerNation/plugin-content-messages): Providung simple text messages or links as message payload
* [Event plugin](https://github.com/DeerNation/plugin-content-events): Providing events as message payload
