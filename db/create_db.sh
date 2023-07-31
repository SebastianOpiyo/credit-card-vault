#!/bin/bash
psql -d postgres --set=APP_USER=$APP_USER --set=APP_PASSWORD=$APP_PASSWORD --set=APP_DATABASE=$APP_DATABASE << EOF

-- Create a new role
CREATE USER :APP_USER WITH PASSWORD :'APP_PASSWORD';

-- Create a new database
CREATE DATABASE :APP_DATABASE;

-- Make the new role the owner of the new database
ALTER DATABASE :APP_DATABASE OWNER TO :APP_USER;

\q
EOF
