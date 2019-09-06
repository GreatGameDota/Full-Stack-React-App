const functions = require('firebase-functions');
const app = require('express')();
const { db } = require('./util/admin');
const {
	getAllPosts,
	postOnePost,
	getPost,
	createComment,
	likePost,
	unlikePost,
	deletePost
} = require('./handlers/posts');
const {
	signUp,
	login,
	uploadImage,
	addUserDetails,
	getAuthenticatedUser,
	getUserDetails,
	markNotificationsAsRead
} = require('./handlers/users');
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
app.get('/user/:handle', getUserDetails);
app.post('/notifications', FBAuth, markNotificationsAsRead);

exports.api = functions.region('us-central1').https.onRequest(app);

exports.createNotificationOnLike = functions
	.region('us-central1')
	.firestore.document('likes/{id}')
	.onCreate((snapshot) => {
		db
			.doc(`/posts/${snapshot.data().postId}`)
			.get()
			.then((doc) => {
				if (doc.exists) {
					return db.doc(`/notifications/${snapshot.id}`).set({
						createdAt: new Date().toISOString(),
						recipient: doc.data().userHandle,
						sender: snapshot.data().userHandle,
						type: 'like',
						read: false,
						postId: doc.id
					});
				}
			})
			.catch((e) => {
				console.error(e);
				return;
			});
	});

exports.createNotificationOnComment = functions
	.region('us-central1')
	.firestore.document('comments/{id}')
	.onCreate((snapshot) => {
		db
			.doc(`/posts/${snapshot.data().postId}`)
			.get()
			.then((doc) => {
				if (doc.exists) {
					return db.doc(`/notifications/${snapshot.id}`).set({
						createdAt: new Date().toISOString(),
						recipient: doc.data().userHandle,
						sender: snapshot.data().userHandle,
						type: 'comment',
						read: false,
						postId: doc.id
					});
				}
			})
			.catch((e) => {
				console.error(e);
				return;
			});
	});

exports.deleteNotificationOnUnlike = functions
	.region('us-central1')
	.firestore.document('likes/{id}')
	.onDelete((snapshot) => {
		db.doc(`/notifications/${snapshot.id}`).delete().catch((e) => {
			console.error(e);
			return;
		});
	});
