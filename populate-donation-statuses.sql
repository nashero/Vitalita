-- Populate donation_statuses table with predefined statuses
-- Run this script in your Supabase SQL Editor

-- First, ensure the categories table exists and has data
INSERT INTO donation_status_categories (category_name, description, sort_order) VALUES
('Pre-Donation Statuses', 'Statuses that occur before the actual donation process begins', 1),
('In-Progress and Post-Donation Statuses', 'Statuses that occur during and after the donation process', 2)
ON CONFLICT (category_name) DO NOTHING;

-- Get category IDs
DO $$
DECLARE
    pre_donation_id INTEGER;
    post_donation_id INTEGER;
BEGIN
    SELECT category_id INTO pre_donation_id FROM donation_status_categories WHERE category_name = 'Pre-Donation Statuses';
    SELECT category_id INTO post_donation_id FROM donation_status_categories WHERE category_name = 'In-Progress and Post-Donation Statuses';
    
    -- Insert all predefined statuses
    INSERT INTO donation_statuses (status_code, status_name, description, category_id, sort_order) VALUES
    -- Pre-Donation Statuses
    ('SCHEDULED', 'Scheduled', 'The donor has successfully booked an appointment', pre_donation_id, 1),
    ('CONFIRMED', 'Confirmed', 'The donor has confirmed their appointment, often through a reminder or follow-up notification', pre_donation_id, 2),
    ('REMINDER_SENT', 'Reminder Sent', 'A reminder notification for the upcoming appointment has been sent to the donor', pre_donation_id, 3),
    ('CANCELLED', 'Cancelled', 'The donor has proactively cancelled their appointment before the scheduled time', pre_donation_id, 4),
    ('NO_SHOW', 'No-Show', 'The donor failed to attend their scheduled appointment without prior cancellation', pre_donation_id, 5),
    ('LATE_ARRIVAL', 'Late Arrival', 'The donor arrived after their scheduled appointment time, which may or may not be acceptable depending on your clinic''s policy', pre_donation_id, 6),
    ('RESCHEDULED', 'Rescheduled', 'The donor has changed their appointment to a new date and/or time', pre_donation_id, 7),
    ('WAITLIST', 'Waitlist', 'The donor is on a waiting list for a specific date and time that is currently full', pre_donation_id, 8),

    -- In-Progress and Post-Donation Statuses
    ('IN_PROGRESS', 'In Progress', 'The donor has arrived and has begun the donation process (e.g., check-in, pre-screening)', post_donation_id, 9),
    ('COMPLETED', 'Completed', 'The donor has successfully finished the entire donation process', post_donation_id, 10),
    ('DEFERRED', 'Deferred', 'The donor was unable to donate for a specific reason (e.g., low iron, recent travel, medication). This can be further specified with sub-statuses like Deferred - Temporary or Deferred - Permanent', post_donation_id, 11),
    ('SELF_DEFERRED', 'Self-Deferred', 'The donor arrived but decided not to donate for personal reasons before the screening process began', post_donation_id, 12),
    ('INCOMPLETE', 'Incomplete', 'The donation process was started but couldn''t be finished (e.g., the donor felt unwell during the donation)', post_donation_id, 13),
    ('ELIGIBILITY_EXPIRED', 'Eligibility Expired', 'The donor''s eligibility to donate has expired and they need to complete an updated health screening questionnaire', post_donation_id, 14),
    ('POST_DONATION_FOLLOWUP', 'Post-Donation Follow-up', 'The donor is being followed up with after their donation (e.g., to check on their well-being, to notify them of test results)', post_donation_id, 15),
    ('TEST_RESULTS_READY', 'Test Results Ready', 'The results of the blood tests conducted on the donated blood are available', post_donation_id, 16),
    ('UNIT_USED', 'Unit Used', 'The donated blood unit has been processed and sent for use', post_donation_id, 17),
    ('UNIT_DISCARDED', 'Unit Discarded', 'The donated blood unit was found to be unusable for any number of reasons (e.g., contamination, failed screening tests) and was discarded', post_donation_id, 18)
    ON CONFLICT (status_code) DO NOTHING;
    
    RAISE NOTICE 'Successfully inserted donation statuses';
END $$;

-- Verify the data was inserted
SELECT 
    ds.status_code, 
    ds.status_name, 
    dsc.category_name,
    ds.sort_order
FROM donation_statuses ds
JOIN donation_status_categories dsc ON ds.category_id = dsc.category_id
ORDER BY ds.sort_order; 