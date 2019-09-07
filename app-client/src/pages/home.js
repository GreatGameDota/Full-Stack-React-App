import React, { Component } from 'react';
import Grid from '@material-ui/core/Grid';
// import PropTypes from 'prop-types';

import Post from '../components/post/Post';
// import Profile from '../components/profile/Profile';
// import ScreamSkeleton from '../util/ScreamSkeleton';

// import { connect } from 'react-redux';
// import { getScreams } from '../redux/actions/dataActions';

import axios from 'axios';

class home extends Component {
	state = { posts: null };
	componentDidMount () {
		// this.props.getPosts();
		axios
			.get('/posts')
			.then((res) => {
				this.setState({ posts: res.data });
			})
			.catch((e) => {
				console.error(e);
			});
	}
	render () {
		// const { posts, loading } = this.props.data;
		const { posts } = this.state;
		// let recentPostsMarkup = !loading
		let recentPostsMarkup = posts ? posts.map((post) => <Post post={post} user={null} />) : <h1>Loading...</h1>;
		//     ? (
		// 	posts.map((scream) => {
		// 		/*<Scream key={scream.screamId} scream={scream} />*/
		// 	})
		// ) : (
		// 	{
		// 		/*<ScreamSkeleton />*/
		// 	}
		// );
		return (
			<Grid container spacing={10}>
				<Grid item sm={8} xs={12}>
					{recentPostsMarkup}
				</Grid>
				<Grid item sm={4} xs={12}>
					{/* <Profile /> */}
					Profile...
				</Grid>
			</Grid>
		);
	}
}

// home.propTypes = {
// 	getScreams: PropTypes.func.isRequired,
// 	data: PropTypes.object.isRequired
// };

// const mapStateToProps = (state) => ({
// 	data: state.data
// });

// export default connect(mapStateToProps, { getScreams })(home);
export default home;
