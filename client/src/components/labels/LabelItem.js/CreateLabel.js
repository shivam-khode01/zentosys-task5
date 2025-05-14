
// client/src/components/labels/CreateLabel.js
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { createLabel } from '../../actions/labelActions';

const CreateLabel = ({ boardId }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    name: '',
    color: '#61bd4f' // Default green color
  });
  const [showForm, setShowForm] = useState(false);

  const { name, color } = formData;

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = e => {
    e.preventDefault();
    dispatch(createLabel(boardId, formData));
    setFormData({ name: '', color: '#61bd4f' });
    setShowForm(false);
  };

  return (
    <div className="create-label">
      {showForm ? (
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label htmlFor="name">Label Name</label>
            <input
              type="text"
              name="name"
              value={name}
              onChange={onChange}
              required
              placeholder="Enter label name"
            />
          </div>
          <div className="form-group">
            <label htmlFor="color">Color</label>
            <input
              type="color"
              name="color"
              value={color}
              onChange={onChange}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Create
          </button>
          <button
            type="button"
            className="btn btn-light"
            onClick={() => setShowForm(false)}
          >
            Cancel
          </button>
        </form>
      ) : (
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
        >
          Add Label
        </button>
      )}
    </div>
  );
};

CreateLabel.propTypes = {
  boardId: PropTypes.string.isRequired
};

export default CreateLabel;