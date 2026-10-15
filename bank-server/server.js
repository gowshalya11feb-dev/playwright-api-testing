const express = require('express');
const app = express();
app.use(express.json());

// Fake database (lives in memory, resets when the server restarts)
const accounts = {
  101: { id: 101, owner: 'Gowshi', balance: 5000 },
  102: { id: 102, owner: 'Ravi', balance: 2000 },
  103: { id: 103, owner: 'Priya', balance: 3000 },
};
// Users who can log in (username, password, and which account they own)
const users = {
  gowshi: { password: 'pass123', accountId: 101 },
  ravi: { password: 'pass456', accountId: 102 },
  priya: { password: 'pass789', accountId: 103 },
};

// Tokens we have given out (token -> username)
const tokens = {};

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Get one account
app.get('/accounts/:id', (req, res) => {
  const account = accounts[req.params.id];
  if (!account) {
    return res.status(404).json({ error: 'Account not found' });
  }
  res.status(200).json(account);
});

// Guard: checks the token before letting the request continue
function requireLogin(req, res, next) {
  const header = req.headers['authorization'];
  if (!header) {
    return res.status(401).json({ error: 'Token required' });
  }

  const token = header.replace('Bearer ', '');
  const username = tokens[token];
  if (!username) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  req.user = users[username];
  next();
}

// Transfer money between two accounts
app.post('/transfer', requireLogin, (req, res) => {
  const { fromAccount, toAccount, amount } = req.body;

  const from = accounts[fromAccount];
  const to = accounts[toAccount];

  if (!from || !to) {
    return res.status(404).json({ error: 'Account not found' });
  }
    if (req.user.accountId !== from.id) {
    return res.status(403).json({ error: 'You can only transfer from your own account' });
  }

  if (typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ error: 'Amount must be a positive number' });
  }

  if (from.balance < amount) {
    return res.status(400).json({ error: 'Insufficient funds' });
  }

  from.balance = from.balance - amount;
  to.balance = to.balance + amount;
  res.status(200).json({ message: 'Transfer successful', from, to });
});

// Login: check username and password, give back a token
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users[username];

  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  const token = 'token-' + username + '-' + Date.now();
  tokens[token] = username;
  res.status(200).json({ token });
});

app.listen(3000, () => {

    // Deposit money into an account
app.post('/accounts/:id/deposit', (req, res) => {
  const account = accounts[req.params.id];
  if (!account) {
    return res.status(404).json({ error: 'Account not found' });
  }

  const amount = req.body.amount;
  if (typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ error: 'Amount must be a positive number' });
  }

  account.balance = account.balance + amount;
  res.status(200).json(account);
});
  console.log('Mini Bank API running on http://localhost:3000');
});