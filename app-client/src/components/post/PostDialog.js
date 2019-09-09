import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import withStyles from '@material-ui/core/styles/withStyles';
import MyButton from '../../util/MyButton';
import LikeButton from './LikeButton';
import Comments from './Comments';
import CommentForm from './CommentForm';
import dayjs from 'dayjs';
import { Link } from 'react-router-dom';
// MUI Stuff
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';
// Icons
import CloseIcon from '@material-ui/icons/Close';
import UnfoldMore from '@material-ui/icons/UnfoldMore';
import ChatIcon from '@material-ui/icons/Chat';
// Redux stuff
import { connect } from 'react-redux';
import { getPost, clearErrors } from '../../redux/actions/dataActions';

import history from '../../history';

const styles = (theme) => ({
	...theme.spread,
	profileImage: {
		width: '10rem',
		height: '10rem',
		borderRadius: '50%',
		objectFit: 'cover'
	},
	dialogContent: {
		padding: 20
	},
	closeButton: {
		position: 'absolute',
		left: '90%'
	},
	expandButton: {
		position: 'absolute',
		left: '90%'
	},
	spinnerDiv: {
		textAlign: 'center',
		marginTop: 50,
		marginBottom: 50
	},
	postHr: {
		width: '100%',
		borderBottom: '1px solid rgba(0,0,0,0.1)'
	},
	content: {
		float: 'right'
	}
});

function DialogLink (props) {
	return (
		<div>
			<Link onClick={() => props.handleClose(props.to)} to={props.to} className={props.className}>
				{props.children}
			</Link>
		</div>
	);
}

class PostDialog extends Component {
	state = {
		open: false,
		oldPath: '',
		newPath: ''
	};
	componentDidMount () {
		if (this.props.openDialog) {
			this.handleOpen();
		}
	}
	handleOpen = () => {
		let oldPath = window.location.pathname;

		const { userHandle, postId } = this.props;
		const newPath = `/users/${userHandle}/post/${postId}`;

		if (oldPath === newPath) oldPath = `/users/${userHandle}`;

		window.history.pushState(null, null, newPath);

		this.setState({ open: true, oldPath, newPath });
		this.props.getPost(this.props.postId);
	};
	handleClose = (path) => {
		if (path == null) {
			window.history.pushState(null, null, this.state.oldPath);
		} else {
			history.push({ pathname: path });
		}
		this.setState({ open: false });
		this.props.clearErrors();
	};

	render () {
		const {
			classes,
			post: { postId, body, createdAt, likeCount, commentCount, userImage, userHandle, comments },
			UI: { loading }
		} = this.props;

		const dialogMarkup = loading ? (
			<div className={classes.spinnerDiv}>
				<CircularProgress size={200} thickness={2} />
			</div>
		) : (
			<div>
				<img src={userImage} alt='Profile' className={classes.profileImage} />
				<div className={classes.content}>
					<Typography
						component={DialogLink}
						color='primary'
						variant='h5'
						to={`/users/${userHandle}`}
						handleClose={this.handleClose}
					>
						@{userHandle}
					</Typography>
					<hr className={classes.invisibleSeparator} />
					<Typography variant='body2' color='textSecondary'>
						{dayjs(createdAt).format('h:mm a, MMMM DD YYYY')}
					</Typography>
					<hr className={classes.invisibleSeparator} />
					<Typography variant='body1'>{body}</Typography>
					<LikeButton postId={postId} />
					<span>{likeCount} likes</span>
					<MyButton tip='Comments'>
						<ChatIcon color='primary' />
					</MyButton>
					<span>{commentCount} comments</span>
				</div>
				<hr className={classes.postHr} />
				<CommentForm postId={postId} />
				<Comments comments={comments} handleClose={this.handleClose} />
			</div>
		);
		return (
			<Fragment>
				<MyButton onClick={this.handleOpen} tip='Expand post' tipClassName={classes.expandButton}>
					<UnfoldMore color='primary' />
				</MyButton>
				<Dialog open={this.state.open} onClose={() => this.handleClose(null)} fullWidth maxWidth='sm'>
					<MyButton tip='Close' onClick={() => this.handleClose(null)} tipClassName={classes.closeButton}>
						<CloseIcon />
					</MyButton>
					<DialogContent className={classes.dialogContent}>{dialogMarkup}</DialogContent>
				</Dialog>
			</Fragment>
		);
	}
}

PostDialog.propTypes = {
	clearErrors: PropTypes.func.isRequired,
	getPost: PropTypes.func.isRequired,
	postId: PropTypes.string.isRequired,
	userHandle: PropTypes.string.isRequired,
	post: PropTypes.object.isRequired,
	UI: PropTypes.object.isRequired
};

const mapStateToProps = (state) => ({
	post: state.data.post,
	UI: state.UI
});

const mapActionsToProps = {
	getPost,
	clearErrors
};

export default connect(mapStateToProps, mapActionsToProps)(withStyles(styles)(PostDialog));
