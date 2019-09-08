const functions = require('firebase-functions');
const app = require('express')();
const cors = require('cors');
app.use(cors());
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
		return db
			.doc(`/posts/${snapshot.data().postId}`)
			.get()
			.then((doc) => {
				if (doc.exists && doc.data().userHandle !== snapshot.data().userHandle) {
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
			});
	});

exports.createNotificationOnComment = functions
	.region('us-central1')
	.firestore.document('comments/{id}')
	.onCreate((snapshot) => {
		return db
			.doc(`/posts/${snapshot.data().postId}`)
			.get()
			.then((doc) => {
				if (doc.exists && doc.data().userHandle !== snapshot.data().userHandle) {
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
			});
	});

exports.deleteNotificationOnUnlike = functions
	.region('us-central1')
	.firestore.document('likes/{id}')
	.onDelete((snapshot) => {
		return db.doc(`/notifications/${snapshot.id}`).delete().catch((e) => {
			console.error(e);
		});
	});

exports.onUserImageChange = functions.region('us-central1').firestore.document('users/{userId}').onUpdate((change) => {
	const batch = db.batch();
	if (change.before.data().imageUrl !== change.after.data().imageUrl) {
		return db.collection('posts').where('userHandle', '==', change.after.data().handle).get().then((data) => {
			data.forEach((doc) => {
				const post = db.doc(`/posts/${doc.id}`);
				batch.update(post, { userImage: change.after.data().imageUrl });
			});
			return batch.commit();
		});
	}
	return true;
});

exports.onPostDeleted = functions
	.region('us-central1')
	.firestore.document('posts/{postId}')
	.onDelete((snapshot, context) => {
		const postId = context.params.postId;
		const batch = db.batch();
		return db
			.collection('comments')
			.where('postId', '==', postId)
			.get()
			.then((data) => {
				data.forEach((doc) => {
					batch.delete(db.doc(`/comments/${doc.id}`));
				});
				return db.collection('likes').where('postId', '==', postId).get();
			})
			.then((data) => {
				data.forEach((doc) => {
					batch.delete(db.doc(`/likes/${doc.id}`));
				});
				return db.collection('notifications').where('postId', '==', postId).get();
			})
			.then((data) => {
				data.forEach((doc) => {
					batch.delete(db.doc(`/notifications/${doc.id}`));
				});
				return batch.commit();
			})
			.catch((e) => {
				console.error(e);
			});
	});
