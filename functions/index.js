const functions = require('firebase-functions');
const app = require('express')();
const {
	getAllPosts,
	postOnePost,
	getPost,
	createComment,
	likePost,
	unlikePost,
	deletePost
} = require('./handlers/posts');
const { signUp, login, uploadImage, addUserDetails, getAuthenticatedUser } = require('./handlers/users');
const FBAuth = require('./util/fbAuth');

app.get('/posts', getAllPosts);
app.post('/posts', FBAuth, postOnePost);
app.get('/posts/:postId', getPost);
app.post('/posts/:postId/comment', FBAuth, createComment);
app.get('/posts/:postId/like', FBAuth, likePost);
app.get('/posts/:postId/unlike', FBAuth, unlikePost);
app.delete('/posts/:postId', FBAuth, deletePost);

app.post('/signup', signUp);
app.post('/login', login);
app.post('/user/image', FBAuth, uploadImage);
app.post('/user', FBAuth, addUserDetails);
app.get('/user', FBAuth, getAuthenticatedUser);

exports.api = functions.region('us-central1').https.onRequest(app);
