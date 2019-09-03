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

const isEmpty = (string) => {
	return string.trim() === '' ? true : false;
};

const isEmail = (email) => {
	const emailRegEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return email.match(emailRegEx) ? true : false;
};

app.post('/signup', (req, res) => {
	const newUser = {
		email: req.body.email,
		password: req.body.password,
		confirmPassword: req.body.confirmPassword,
		handle: req.body.handle
	};

	let errors = {};
	if (isEmpty(newUser.email)) {
		errors.email = 'Must not be empty';
	} else if (!isEmail(newUser.email)) {
		errors.email = 'Must be a valid email address';
	}
	if (isEmpty(newUser.password)) {
		errors.password = 'Must not be empty';
	}
	if (newUser.password != newUser.confirmPassword) {
		errors.confirmPassword = 'Passwords must be the same';
	}
	if (isEmpty(newUser.handle)) {
		errors.handle = 'Must not be empty';
	}
	if (Object.keys(errors).length > 0) {
		return res.status(400).json(errors);
	}

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

app.post('/login', (req, res) => {
	const user = {
		email: req.body.email,
		password: req.body.password
	};

	let errors = {};
	if (isEmpty(user.email)) {
		errors.email = 'Must not be empty';
	}
	if (isEmpty(user.password)) {
		errors.password = 'Must not be empty';
	}
	if (Object.keys(errors).length > 0) {
		return res.status(400).json(errors);
	}

	firebase
		.auth()
		.signInWithEmailAndPassword(user.email, user.password)
		.then((data) => {
			return data.user.getIdToken();
		})
		.then((token) => {
			return res.status(200).json({ token });
		})
		.catch((e) => {
			console.error(e.code);
			if (e.code === 'auth/wrong-password') {
				return res.status(403).json({ general: 'Wrong credentials, please try again' });
			} else {
				return res.status(500).json({ error: e.code });
			}
		});
});

exports.api = functions.region('us-central1').https.onRequest(app);
