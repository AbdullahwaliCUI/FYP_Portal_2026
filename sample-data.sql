-- Step 5: Create Sample Data for Testing

-- Create a sample batch
INSERT INTO batches (name, program, section, intake_term, current_semester) 
VALUES ('Spring 2026', 'BSSE', 'A', 'Fall 2022', 6);

-- Create sample settings for the batch
INSERT INTO settings (batch_id, visibility_flags, supervisor_capacity)
SELECT 
  id,
  '{"scope6": false, "srs7": false, "sdd7": false, "progress60_8": false, "progress100_8": false, "external8": false}'::JSONB,
  4
FROM batches 
WHERE name = 'Spring 2026';

-- Verify sample data
SELECT 
  b.id,
  b.name,
  b.program,
  b.section,
  b.current_semester,
  s.supervisor_capacity
FROM batches b
LEFT JOIN settings s ON b.id = s.batch_id
WHERE b.name = 'Spring 2026';

SELECT 'Sample data created successfully!' as message;