import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import withStyles from '@material-ui/core/styles/withStyles';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
// MUI
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

const styles = (theme) => ({
	...theme.spread,
	commentImage: {
		width: '5rem',
		height: '5rem',
		objectFit: 'cover',
		borderRadius: '50%',
		marginLeft: '32px'
	},
	commentData: {
		marginLeft: '48px'
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

class Comments extends Component {
	render () {
		const { comments, classes } = this.props;
		return (
			<Grid container>
				{comments.map((comment, index) => {
					const { body, createdAt, userImage, userHandle } = comment;
					return (
						<Fragment key={createdAt}>
							<Grid item sm={12}>
								<Grid container>
									<Grid item sm={2}>
										<img src={userImage} alt='comment' className={classes.commentImage} />
									</Grid>
									<Grid item sm={9}>
										<div className={classes.commentData}>
											<Typography
												variant='h6'
												component={DialogLink}
												to={`/users/${userHandle}`}
												color='primary'
												handleClose={this.props.handleClose}
											>
												{userHandle}
											</Typography>
											<br />
											<Typography variant='caption' color='textSecondary'>
												{dayjs(createdAt).format('h:mm a, MMMM DD YYYY')}
											</Typography>
											<hr className={classes.invisibleSeparator} />
											<Typography variant='body2'>{body}</Typography>
										</div>
									</Grid>
								</Grid>
							</Grid>
							{index !== comments.length - 1 && <hr className={classes.visibleSeparator} />}
						</Fragment>
					);
				})}
			</Grid>
		);
	}
}

Comments.propTypes = {
	comments: PropTypes.array.isRequired
};

export default withStyles(styles)(Comments);
