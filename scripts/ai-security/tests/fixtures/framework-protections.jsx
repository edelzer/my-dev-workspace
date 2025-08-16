
// React protections - should have lower false positive rate
import React from 'react';

function UserProfile({ user }) {
  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
      <div className="bio">{user.bio}</div>
    </div>
  );
}

// Express with protection middleware
const express = require('express');
const helmet = require('helmet');
const app = express();

app.use(helmet());
app.use(express.json({ limit: '10mb' }));

app.get('/user/:id', (req, res) => {
  const userId = req.params.id;
  // This might look like SQL injection but has framework protections
  const user = orm.findById(userId);
  res.json(user);
});