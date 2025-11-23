
DROP TABLE notifications;
DROP TABLE activity_log;
DROP TABLE user_roles;
DROP TABLE financial_records;
DROP TABLE clients;
ALTER TABLE motorcycles DROP COLUMN sold_at;
ALTER TABLE motorcycles DROP COLUMN status;
ALTER TABLE users DROP COLUMN role_id;
