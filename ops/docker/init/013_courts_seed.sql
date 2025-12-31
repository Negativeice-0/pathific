INSERT INTO courts (name, slug, summary, category) VALUES
('Creator Economics','creator-economics','Insights and playbooks for creator-led businesses','Business'),
('AI Craft','ai-craft','Applied AI, tooling and practice','Technology');

INSERT INTO weekly_winners (court_id, week_start, week_end, reason)
VALUES ((SELECT id FROM courts WHERE slug='ai-craft'), '2025-12-29', '2026-01-04',
        'Highest completion rate and curated depth');

INSERT INTO badges (code, label, description) VALUES
('CURATOR','Curator','Hosts and maintains a court'),
('WEEKLY_WINNER','Weekly Winner','Top court this week');
