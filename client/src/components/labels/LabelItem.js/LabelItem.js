// client/src/components/labels/LabelItem.js
import React from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { deleteLabel, updateLabel } from '../../actions/labelActions';

const LabelItem = ({ label, board }) => {
  const dispatch = useDispatch();
  const [editing, setEditing] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: label.name,
    color: label.color
  });

  const { name, color } = formData;

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = e => {
    e.preventDefault();
    dispatch(updateLabel(label._id, formData));
    setEditing(false);
  };

  const onDelete = () => {
    if (window.confirm('Are you sure you want to delete this label?')) {
      dispatch(deleteLabel(label._id, board));
    }
  };

  const labelStyle = {
    backgroundColor: color,
    color: getContrastColor(color)
  };

  // Function to determine if text should be white or black based on background
  function getContrastColor(hexColor) {
    // Remove # if present
    hexColor = hexColor.replace('#', '');
    
    // Convert to RGB
    const r = parseInt(hexColor.substr(0, 2), 16);
    const g = parseInt(hexColor.substr(2, 2), 16);
    const b = parseInt(hexColor.substr(4, 2), 16);
    
    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Return black or white based on luminance
    return luminance > 0.5 ? '#000000' : '#ffffff';
  }

  return (
    <div className="label-item" style={labelStyle}>
      {editing ? (
        <form onSubmit={onSubmit}>
          <input
            type="text"
            name="name"
            value={name}
            onChange={onChange}
            required
          />
          <input
            type="color"
            name="color"
            value={color}
            onChange={onChange}
            required
          />
          <button type="submit">Save</button>
          <button type="button" onClick={() => setEditing(false)}>
            Cancel
          </button>
        </form>
      ) : (
        <>
          <span className="label-name">{name}</span>
          <div className="label-actions">
            <button onClick={() => setEditing(true)}>Edit</button>
            <button onClick={onDelete}>Delete</button>
          </div>
        </>
      )}
    </div>
  );
};

LabelItem.propTypes = {
  label: PropTypes.object.isRequired,
  board: PropTypes.string.isRequired
};

export default LabelItem;