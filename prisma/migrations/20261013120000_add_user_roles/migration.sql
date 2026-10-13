-- Add persisted roles while keeping all existing accounts as citizens.
CREATE TYPE "UserRole" AS ENUM ('CITIZEN', 'ADMIN');

ALTER TABLE "users"
ADD COLUMN "role" "UserRole" NOT NULL DEFAULT 'CITIZEN';-- Add persisted roles while keeping all existing accounts as citizens.
CREATE TYPE "UserRole" AS ENUM ('CITIZEN', 'ADMIN');

ALTER TABLE "users"
ADD COLUMN "role" "UserRole" NOT NULL DEFAULT 'CITIZEN';