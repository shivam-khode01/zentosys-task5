export const addLabelToCard = (cardId, labelId) => async dispatch => {
  try {
    const res = await axios.post(`/api/cards/${cardId}/labels/${labelId}`);

    dispatch({
      type: ADD_LABEL_TO_CARD,
      payload: { cardId, card: res.data.data }
    });

    dispatch(setAlert('Label added to card', 'success'));
  } catch (err) {
    dispatch({
      type: CARD_ERROR,
      payload: { msg: err.response.data.error, status: err.response.status }
    });
  }
};

// Remove label from card
export const removeLabelFromCard = (cardId, labelId) => async dispatch => {
  try {
    const res = await axios.delete(`/api/cards/${cardId}/labels/${labelId}`);

    dispatch({
      type: REMOVE_LABEL_FROM_CARD,
      payload: { cardId, card: res.data.data }
    });

    dispatch(setAlert('Label removed from card', 'success'));
  } catch (err) {
    dispatch({
      type: CARD_ERROR,
      payload: { msg: err.response.data.error, status: err.response.status }
    });
  }
};