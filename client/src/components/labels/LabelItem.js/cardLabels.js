// client/src/components/cards/CardLabels.js
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { addLabelToCard, removeLabelFromCard } from '../../actions/cardActions';

const CardLabels = ({ card }) => {
  const dispatch = useDispatch();
  const { labels } = useSelector(state => state.label);
  const [showLabelPicker, setShowLabelPicker] = useState(false);

  // Check if a label is already on the card
  const isLabelOnCard = labelId => {
    return card.labels.some(label => label._id === labelId);
  };

  // Toggle label on the card
  const toggleLabel = label => {
    if (isLabelOnCard(label._id)) {
      dispatch(removeLabelFromCard(card._id, label._id));
    } else {
      dispatch(addLabelToCard(card._id, label._id));
    }
  };

  return (
    <div className="card-labels">
      {/* Display labels on the card */}
      <div className="labels-display">
        {card.labels.map(label => (
          <span
            key={label._id}
            className="label-pill"
            style={{ backgroundColor: label.color }}
            title={label.name}
          >
            {label.name}
          </span>
        ))}
      </div>

      {/* Button to show/hide label picker */}
      <button
        className="btn btn-sm btn-light"
        onClick={() => setShowLabelPicker(!showLabelPicker)}
      >
        {showLabelPicker ? 'Hide Labels' : 'Edit Labels'}
      </button>

      {/* Label picker */}
      {showLabelPicker && (
        <div className="label-picker">
          <h5>Labels</h5>
          {labels.length > 0 ? (
            <ul className="label-list">
              {labels.map(label => (
                <li key={label._id} className="label-item">
                  <div
                    className="label-color"
                    style={{ backgroundColor: label.color }}
                  ></div>
                  <span className="label-name">{label.name}</span>
                  <input
                    type="checkbox"
                    checked={isLabelOnCard(label._id)}
                    onChange={() => toggleLabel(label)}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <p>No labels available</p>
          )}
        </div>
      )}
    </div>
  );
};

CardLabels.propTypes = {
  card: PropTypes.object.isRequired
};

export default CardLabels;
