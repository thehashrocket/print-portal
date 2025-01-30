-- Update product type descriptions
UPDATE "ProductType"
SET description = 'Custom printed bookmarks in various sizes and materials'
WHERE name = 'Bookmark';

UPDATE "ProductType"
SET description = 'General purpose cards including business cards, postcards, and greeting cards'
WHERE name = 'Cards';

UPDATE "ProductType"
SET description = 'Standard letter-sized documents and stationery'
WHERE name = 'Letter';

UPDATE "ProductType"
SET description = 'Specialized greeting cards for expressing gratitude and appreciation'
WHERE name = 'Thank You Card'; 