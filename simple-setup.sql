-- Step 1: Basic Setup
-- Run this first

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user role enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('SUPER_ADMIN', 'SUB_ADMIN', 'SUPERVISOR', 'EVALUATOR', 'STUDENT', 'EXTERNAL');
    END IF;
END $$;