-- Add new product types
INSERT INTO "ProductType" (id, name, description, "createdAt", "updatedAt", deleted)
VALUES 
  (gen_random_uuid(), 'Bookmark', '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
  (gen_random_uuid(), 'Cards', '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
  (gen_random_uuid(), 'Letter', '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
  (gen_random_uuid(), 'Thank You Card', '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false); 