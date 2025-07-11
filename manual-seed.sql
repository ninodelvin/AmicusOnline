// Manual seeding script for new lookup tables
// Run this in Prisma Studio or directly in database

-- Case Kinds
INSERT INTO case_kinds (kind_name, description, is_active, created_at) VALUES
('Litigation', 'Court-based legal proceedings', 1, datetime('now')),
('Transactional', 'Contract and business transactions', 1, datetime('now')),
('Advisory', 'Legal consultation and advice', 1, datetime('now')),
('Compliance', 'Regulatory compliance matters', 1, datetime('now')),
('Investigation', 'Fact-finding and discovery work', 1, datetime('now')),
('Negotiation', 'Settlement and negotiation work', 1, datetime('now')),
('Arbitration', 'Alternative dispute resolution', 1, datetime('now')),
('Mediation', 'Mediated dispute resolution', 1, datetime('now'));

-- Case Stages  
INSERT INTO case_stages (stage_name, description, is_active, sort_order, created_at) VALUES
('Initial Consultation', 'First client meeting', 1, 1, datetime('now')),
('Case Assessment', 'Evaluating case merits', 1, 2, datetime('now')),
('Client Intake', 'Formal client onboarding', 1, 3, datetime('now')),
('Discovery', 'Evidence gathering phase', 1, 4, datetime('now')),
('Motion Practice', 'Court motions and hearings', 1, 5, datetime('now')),
('Negotiation', 'Settlement discussions', 1, 6, datetime('now')),
('Trial Preparation', 'Preparing for trial', 1, 7, datetime('now')),
('Trial', 'Active trial proceedings', 1, 8, datetime('now')),
('Settlement', 'Finalizing settlement', 1, 9, datetime('now')),
('Appeal', 'Appellate proceedings', 1, 10, datetime('now')),
('Case Closure', 'Final case wrap-up', 1, 11, datetime('now'));
