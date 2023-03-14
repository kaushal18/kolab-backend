# Kolab - backend implementation
This is the backend implementation for Kolab. [Here](https://github.com/kaushal18/kolab-frontend) you can find the frotend repository and the architecture of the project.

## How to run locally
Before running the server locally create a Postgres database instance on your machine.\
Excecute the following seed for generating table -
```bash
$ CREATE TABLE token_document_mapping(
   url_token TEXT PRIMARY KEY NOT NULL,
   document TEXT,
   is_password_protected BOOLEAN DEFAULT FALSE,
   password TEXT,
   refresh_token TEXT
);
```

After creating the database add following environment variables -
```bash
$ export NODE_APP_DB_URL= <localhost postgres connection string>
$ export ACCESS_TOKEN_SECRET= <32 or 64 bytes random hex>
$ export REFRESH_TOKEN_SECRET= <32 or 64 bytes random hex>
```

The random bytes can be generated using "crypto" module in node. This is used as a private key to sign the Json Web Tokens (JWT) before they are sent to the client in order to ensure integrity.
```bash
> require('crypto').randomBytes(64).toString('hex')
```
After making these changes the backend server can be started using -
```bash
$ node index.js
```

## Frameworks & Languages
- Node.js - Backend server implementation
- Socket.io - Websocket implementation that enabled bi-directional communication between client and server.
- Json Web Tokens - Authentication and authorization.
- PostgreSQL - Database

