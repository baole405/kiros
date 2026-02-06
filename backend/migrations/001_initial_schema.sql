-- Create ENUM types
CREATE TYPE ticket_status AS ENUM ('pending', 'processing', 'processed', 'resolved', 'ai_failed');
CREATE TYPE ticket_category AS ENUM ('billing', 'technical', 'feature_request');
CREATE TYPE ticket_urgency AS ENUM ('high', 'medium', 'low');

-- Create tickets table
CREATE TABLE tickets (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255),
    content TEXT NOT NULL,
    status ticket_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create ticket_ai_results table
CREATE TABLE ticket_ai_results (
    id BIGSERIAL PRIMARY KEY,
    ticket_id BIGINT NOT NULL UNIQUE,
    category ticket_category NOT NULL,
    sentiment_score INT NOT NULL CHECK (sentiment_score >= 1 AND sentiment_score <= 10),
    urgency ticket_urgency NOT NULL,
    draft_reply TEXT NOT NULL,
    processed_at TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_created_at ON tickets(created_at DESC);
CREATE INDEX idx_tickets_status_created ON tickets(status, created_at DESC);
CREATE INDEX idx_ticket_ai_results_ticket_id ON ticket_ai_results(ticket_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tickets table
CREATE TRIGGER update_tickets_updated_at
    BEFORE UPDATE ON tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
