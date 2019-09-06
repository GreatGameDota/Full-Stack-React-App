import React, { Component } from 'react';
import './App.css';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import home from './pages/home';
import login from './pages/login';
import signup from './pages/signup';
import Navbar from './components/Navbar';

class App extends Component {
	render () {
		return (
			<Router>
				<Navbar />
				<div id='container'>
					<Switch>
						<Route exact path='/' component={home} />
						<Route exact path='/login' component={login} />
						<Route exact path='/signup' component={signup} />
					</Switch>
				</div>
			</Router>
		);
	}
}

export default App;
