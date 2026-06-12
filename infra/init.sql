-- Enable PostGIS for geospatial operations
CREATE EXTENSION IF NOT EXISTS postgis;

-- Enable pgvector for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Create indexes for performance (will be created after tables exist)
-- These will be run by Alembic migrations
