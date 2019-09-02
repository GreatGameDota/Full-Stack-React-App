const functions = require('firebase-functions');
const express = require('express');
const app = express();
const admin = require('firebase-admin');
admin.initializeApp();

app.get('/posts', (req, res) => {
	admin
		.firestore()
		.collection('posts')
		.orderBy('createdAt', 'desc')
		.get()
		.then((data) => {
			let posts = [];
			data.forEach((doc) => {
				posts.push({
					postId: doc.id,
					...doc.data()
				});
			});
			return res.json(posts);
		})
		.catch((e) => {
			console.error(e);
		});
});

app.post('/posts', (req, res) => {
	const newPost = {
		body: req.body.body,
		userHandle: req.body.userHandle,
		createdAt: new Date().toISOString()
	};
	admin
		.firestore()
		.collection('posts')
		.add(newPost)
		.then((doc) => {
			res.json({ message: `document ${doc.id} created successfully` });
		})
		.catch((err) => {
			res.status(500).json({ error: 'Something went wrong' });
			console.error(err);
		});
});

exports.api = functions.https.onRequest(app);
