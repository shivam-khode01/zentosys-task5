// client/src/reducers/labelReducer.js
import {
  GET_LABELS,
  CREATE_LABEL,
  UPDATE_LABEL,
  DELETE_LABEL,
  LABEL_ERROR
} from '../actions/types';

const initialState = {
  labels: [],
  loading: true,
  error: {}
};

export default function(state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case GET_LABELS:
      return {
        ...state,
        labels: payload,
        loading: false
      };
    case CREATE_LABEL:
      return {
        ...state,
        labels: [...state.labels, payload],
        loading: false
      };
    case UPDATE_LABEL:
      return {
        ...state,
        labels: state.labels.map(label =>
          label._id === payload._id ? payload : label
        ),
        loading: false
      };
    case DELETE_LABEL:
      return {
        ...state,
        labels: state.labels.filter(label => label._id !== payload),
        loading: false
      };
    case LABEL_ERROR:
      return {
        ...state,
        error: payload,
        loading: false
      };
    default:
      return state;
  }
}