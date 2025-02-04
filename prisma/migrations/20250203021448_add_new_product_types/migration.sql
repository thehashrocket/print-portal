-- Add new product types
INSERT INTO "ProductType" (id, name, description, "createdAt", "updatedAt", deleted)
VALUES 
  (gen_random_uuid(), 'Folders', 'General purpose folders', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false); 