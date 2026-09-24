-- Runs once, the first time the Postgres container initializes its data volume.

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "citext";

-- Bootstrap database for Adminer and migration tooling.
-- Will be dropped once all services own their own databases.
-- CREATE DATABASE nexus;

-- Per-service databases. Each is owned by a dedicated role with grants
-- only on its own database. Services never connect cross-database.

CREATE ROLE auth_service   LOGIN PASSWORD 'auth_dev_password';
CREATE ROLE catalog_service LOGIN PASSWORD 'catalog_dev_password';
CREATE ROLE cart_service    LOGIN PASSWORD 'cart_dev_password';
CREATE ROLE orders_service  LOGIN PASSWORD 'orders_dev_password';
CREATE ROLE payments_service LOGIN PASSWORD 'payments_dev_password';
CREATE ROLE inventory_service LOGIN PASSWORD 'inventory_dev_password';
CREATE ROLE notifications_service LOGIN PASSWORD 'notifications_dev_password';
CREATE ROLE analytics_service LOGIN PASSWORD 'analytics_dev_password';

CREATE DATABASE nexus_auth         OWNER auth_service;
CREATE DATABASE nexus_catalog      OWNER catalog_service;
CREATE DATABASE nexus_cart         OWNER cart_service;
CREATE DATABASE nexus_orders       OWNER orders_service;
CREATE DATABASE nexus_payments     OWNER payments_service;
CREATE DATABASE nexus_inventory    OWNER inventory_service;
CREATE DATABASE nexus_notifications OWNER notifications_service;
CREATE DATABASE nexus_analytics    OWNER analytics_service;

-- Revoke default CONNECT privileges so services cannot reach each other's
-- databases even if they try.
REVOKE CONNECT ON DATABASE nexus_auth         FROM PUBLIC;
REVOKE CONNECT ON DATABASE nexus_catalog      FROM PUBLIC;
REVOKE CONNECT ON DATABASE nexus_cart         FROM PUBLIC;
REVOKE CONNECT ON DATABASE nexus_orders       FROM PUBLIC;
REVOKE CONNECT ON DATABASE nexus_payments     FROM PUBLIC;
REVOKE CONNECT ON DATABASE nexus_inventory    FROM PUBLIC;
REVOKE CONNECT ON DATABASE nexus_notifications FROM PUBLIC;
REVOKE CONNECT ON DATABASE nexus_analytics    FROM PUBLIC;