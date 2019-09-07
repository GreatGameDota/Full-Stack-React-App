import axios from 'axios';

// export const loginUser = (userData, history) => (dispatch) => {
export const loginUser = (userData, history) => {
	// dispatch({ type: LOADING_UI });
	axios
		.post('/login', userData)
		.then((res) => {
			// setAuthorizationHeader(res.data.token);
			// dispatch(getUserData());
			// dispatch({ type: CLEAR_ERRORS });
			console.log(res.data);
			history.push('/');
		})
		.catch((err) => {
			// dispatch({
			// 	type: SET_ERRORS,
			// 	payload: err.response.data
			// });
			// console.error(err);
		});
};
