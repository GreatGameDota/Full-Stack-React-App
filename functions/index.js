const functions = require('firebase-functions');
const express = require('express');
const app = express();
const admin = require('firebase-admin');
admin.initializeApp();

const config = {
	apiKey: 'AIzaSyDX25FCYRm4UrLQeAJqVD6Q5EIEaSUrd_s',
	authDomain: 'fullstackproject-c76f0.firebaseapp.com',
	databaseURL: 'https://fullstackproject-c76f0.firebaseio.com',
	projectId: 'fullstackproject-c76f0',
	storageBucket: 'fullstackproject-c76f0.appspot.com',
	messagingSenderId: '525713981542',
	appId: '1:525713981542:web:2ce74855acb1f90d'
};
const firebase = require('firebase');
firebase.initializeApp(config);

const db = admin.firestore();

app.get('/posts', (req, res) => {
	db
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
	db
		.collection('posts')
		.add(newPost)
		.then((doc) => {
			return res.json({ message: `document ${doc.id} created successfully` });
		})
		.catch((e) => {
			console.error(e.code);
			return res.status(500).json({ error: 'Something went wrong' });
		});
});

app.post('/signup', (req, res) => {
	const newUser = {
		email: req.body.email,
		password: req.body.password,
		confirmPassword: req.body.confirmPassword,
		handle: req.body.handle
	};
	let token, userId;
	db
		.doc(`/users/${newUser.handle}`)
		.get()
		.then((doc) => {
			if (doc.exists) {
				return res.status(400).json({ handle: 'This handle is already taken' });
			} else {
				return firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password);
			}
		})
		.then((data) => {
			userId = data.user.uid;
			return data.user.getIdToken();
		})
		.then((userToken) => {
			token = userToken;
			const userCredentials = {
				handle: newUser.handle,
				email: newUser.email,
				createdAt: new Date().toISOString(),
				userId
			};
			return db.doc(`/users/${newUser.handle}`).set(userCredentials);
		})
		.then(() => {
			return res.status(201).json({ token });
		})
		.catch((e) => {
			console.error(e);
			if (e.code === 'auth/email-already-in-use') {
				return res.status(400).json({ email: 'Email already in use' });
			} else {
				return res.status(500).json({ error: e.code });
			}
		});
});

exports.api = functions.region('us-central1').https.onRequest(app);
