/*
command to access psql (https://tomcam.github.io/postgres/)
Local machine - 
   "psql postgres"
   "\c <database name>"
   "\dt <list tables in db>"
*/
CREATE TABLE token_document_mapping(
   url_token TEXT PRIMARY KEY NOT NULL,
   document TEXT,
   is_password_protected BOOLEAN DEFAULT FALSE,
   password TEXT,
   refresh_token TEXT
);