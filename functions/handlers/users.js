const { db } = require('../util/admin');
const config = require('../config');
const firebase = require('firebase');
firebase.initializeApp(config);
const { validateSignupData, validateLoginData } = require('../util/validators');

exports.signUp = (req, res) => {
	const newUser = {
		email: req.body.email,
		password: req.body.password,
		confirmPassword: req.body.confirmPassword,
		handle: req.body.handle
	};

  const { errors, valid } = validateSignupData(newUser);
  
  if (!valid) {
    return res.status(400).json({ errors });
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
};

exports.login = (req, res) => {
	const user = {
		email: req.body.email,
		password: req.body.password
  };
  
  const { errors, valid } = validateLoginData(user);
  
  if (!valid) {
    return res.status(400).json({ errors });
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
			} else if (e.code === 'auth/user-not-found') {
				return res.status(403).json({ general: 'Wrong credentials, please try again' });
			} else {
				return res.status(500).json({ error: e.code });
			}
		});
};
