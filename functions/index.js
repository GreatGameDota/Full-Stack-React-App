const functions = require('firebase-functions');
const express = require('express');
const app = express();
const { getAllPosts, postOnePost } = require('./handlers/posts');
const { signUp, login } = require('./handlers/users');
const FBAuth = require('./util/fbAuth');

app.get('/posts', getAllPosts);
app.post('/posts', FBAuth, postOnePost);

app.post('/signup', signUp);
app.post('/login', login);

exports.api = functions.region('us-central1').https.onRequest(app);
