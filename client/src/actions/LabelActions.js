// client/src/actions/labelActions.js
import axios from 'axios';
import {
  GET_LABELS,
  CREATE_LABEL,
  UPDATE_LABEL,
  DELETE_LABEL,
  LABEL_ERROR
} from './types';
import { setAlert } from './alertActions';

// Get all labels for a board
export const getBoardLabels = boardId => async dispatch => {
  try {
    const res = await axios.get(`/api/boards/${boardId}/labels`);

    dispatch({
      type: GET_LABELS,
      payload: res.data.data
    });
  } catch (err) {
    dispatch({
      type: LABEL_ERROR,
      payload: { msg: err.response.data.error, status: err.response.status }
    });
  }
};

// Create a new label
export const createLabel = (boardId, formData) => async dispatch => {
  try {
    const res = await axios.post(`/api/boards/${boardId}/labels`, formData);

    dispatch({
      type: CREATE_LABEL,
      payload: res.data.data
    });

    dispatch(setAlert('Label created', 'success'));
  } catch (err) {
    dispatch({
      type: LABEL_ERROR,
      payload: { msg: err.response.data.error, status: err.response.status }
    });
  }
};

// Update a label
export const updateLabel = (labelId, formData) => async dispatch => {
  try {
    const res = await axios.put(`/api/labels/${labelId}`, formData);

    dispatch({
      type: UPDATE_LABEL,
      payload: res.data.data
    });

    dispatch(setAlert('Label updated', 'success'));
  } catch (err) {
    dispatch({
      type: LABEL_ERROR,
      payload: { msg: err.response.data.error, status: err.response.status }
    });
  }
};

// Delete a label
export const deleteLabel = labelId => async dispatch => {
  try {
    await axios.delete(`/api/labels/${labelId}`);

    dispatch({
      type: DELETE_LABEL,
      payload: labelId
    });

    dispatch(setAlert('Label removed', 'success'));
  } catch (err) {
    dispatch({
      type: LABEL_ERROR,
      payload: { msg: err.response.data.error, status: err.response.status }
    });
  }
};