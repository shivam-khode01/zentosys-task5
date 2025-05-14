
// client/src/components/labels/LabelList.js
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { getBoardLabels } from '../../actions/labelActions';
import LabelItem from './LabelItem';
import CreateLabel from './CreateLabel';

const LabelList = ({ boardId }) => {
  const dispatch = useDispatch();
  const { labels, loading } = useSelector(state => state.label);

  useEffect(() => {
    dispatch(getBoardLabels(boardId));
  }, [dispatch, boardId]);

  return (
    <div className="label-management">
      <h3>Labels</h3>
      <CreateLabel boardId={boardId} />
      
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="label-list">
          {labels.length > 0 ? (
            labels.map(label => (
              <LabelItem key={label._id} label={label} board={boardId} />
            ))
          ) : (
            <p>No labels created yet</p>
          )}
        </div>
      )}
    </div>
  );
};

LabelList.propTypes = {
  boardId: PropTypes.string.isRequired
};

export default LabelList;
