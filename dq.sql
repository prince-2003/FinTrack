-- Create user_info table
CREATE TABLE user_info (
    userid SERIAL PRIMARY KEY,
    fullname VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

-- Create portfolio table
CREATE TABLE portfolio (
    userid INTEGER PRIMARY KEY,
    income NUMERIC(10, 2) DEFAULT 0,
    savings_amount NUMERIC(10, 2) DEFAULT 0,
    expense_balance NUMERIC(10, 2) DEFAULT 0,
    expense_pie NUMERIC(10, 2) DEFAULT 0,
    rollon_amount NUMERIC(10, 2) DEFAULT 0,
    FOREIGN KEY (userid) REFERENCES user_info(userid) ON DELETE CASCADE
);

-- Create transaction_history table
CREATE TABLE transaction_history (
    transaction_id SERIAL PRIMARY KEY,
    userid INTEGER NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'credit' or 'debit'
    category VARCHAR(255) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userid) REFERENCES user_info(userid) ON DELETE CASCADE
);

-- Create archived_transaction_history table
CREATE TABLE archived_transaction_history (
    transaction_id SERIAL PRIMARY KEY,
    userid INTEGER NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'credit' or 'debit'
    category VARCHAR(255) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    month VARCHAR(50) NOT NULL,
    year INTEGER NOT NULL,
    archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userid) REFERENCES user_info(userid) ON DELETE CASCADE
);

-- Create session table for storing session data (used by connect-pg-simple)
CREATE TABLE session (
    sid VARCHAR NOT NULL COLLATE "default",
    sess JSON NOT NULL,
    expire TIMESTAMPTZ(6) NOT NULL,
    PRIMARY KEY (sid)
);

-- Indexes for session expiration
CREATE INDEX idx_session_expire ON session(expire);

-- Additional indexes for faster queries (optional)
CREATE INDEX idx_transaction_userid ON transaction_history(userid);
CREATE INDEX idx_archived_transaction_userid ON archived_transaction_history(userid);

-- Insert some test data (optional)
INSERT INTO user_info (fullname, email, password) VALUES ('John Doe', 'john@example.com', 'hashed_password');
INSERT INTO portfolio (userid, income, savings_amount, expense_balance, expense_pie) VALUES (1, 5000, 2000, 0, 0);
INSERT INTO transaction_history (userid, type, category, amount) VALUES (1, 'debit', 'Groceries', 100);
