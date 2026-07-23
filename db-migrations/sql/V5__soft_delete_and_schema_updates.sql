-- ============================================================================
-- V5__soft_delete_and_schema_updates.sql
-- Flyway Migration V5: Soft Delete Support (is_deleted & deleted_at)
-- ============================================================================

ALTER TABLE cms_service.portfolio_items 
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE cms_service.feature_items 
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE cms_service.pricing_plans 
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
