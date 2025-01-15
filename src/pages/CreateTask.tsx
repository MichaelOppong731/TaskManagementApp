import React, { useState, useEffect } from 'react';
import { useAuth } from 'react-oidc-context';
import { useNavigate } from 'react-router-dom';

const CreateTask: React.FC = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState('Pending');
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [assignedNames, setAssignedNames] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const auth = useAuth();

  // Fetch all users from the API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://imls207qid.execute-api.eu-west-1.amazonaws.com/Prod/getAllUsers');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      setUsers(data.users || []);
    } catch (err: any) {
      setError('An error occurred while fetching users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch users when the component mounts
  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUserSelection = (userId: string, userEmail: string, userName: string) => {
    setSelectedUsers((prevSelectedUsers) => {
      const newSelectedUsers = prevSelectedUsers.includes(userId)
        ? prevSelectedUsers.filter((id) => id !== userId)
        : [...prevSelectedUsers, userId];

      // Update assigned names
      setAssignedNames((prevNames) => {
        if (prevNames.some((member) => member.id === userId)) {
          return prevNames;
        } else {
          return [...prevNames, { name: userName, id: userId, email: userEmail }];
        }
      });

      return newSelectedUsers;
    });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const userIdFromAuth = auth.user?.profile.sub; // Replace with actual method to get user ID
    const apiUrl = 'https://imls207qid.execute-api.eu-west-1.amazonaws.com/Prod/createTask';

    const payload = {
      name,
      description,
      dueDate,
      status,
      userId: userIdFromAuth,
      assignedUsers: selectedUsers,
      assignedNames: assignedNames,
    };

    try {
      setLoading(true);
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create task');
      }

      setSuccess(data.message || 'Task created successfully');
      setShowModal(true);
      //navigate('/Admin-dashboard');

      // Clear the form after successful submission
      setName('');
      setDescription('');
      setDueDate('');
      setStatus('Pending');
      setSelectedUsers([]);
      setAssignedNames([]);
    } catch (err: any) {
      setError(err.message);
      console.error('Error creating task:', err);
      setShowModal(true); // Show the modal on error
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    navigate('/Admin-dashboard'); // Redirect after the modal is closed
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg space-y-6">
      <h3 className="text-2xl font-semibold text-center mb-6">Create Task</h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Task Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={4}
            className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Due Date</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
            className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            required
            className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        {/* Display users in checkboxes */}
        <div>
          <h4 className="text-lg font-semibold text-gray-700">Assign Users</h4>
          {users.length > 0 ? (
            users.map((user: any) => (
              <div key={user.UserId} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`user-${user.UserId}`}
                  checked={selectedUsers.includes(user.UserId)}
                  onChange={() => handleUserSelection(user.UserId, user.Email, user.Name)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <label htmlFor={`user-${user.UserId}`} className="text-sm">{user.Name}</label>
              </div>
            ))
          ) : (
            <p>No users available</p>
          )}
        </div>

        <div className="text-center">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:bg-blue-300"
          >
            {loading ? 'Creating Task...' : 'Create Task'}
          </button>
        </div>
      </form>

      {error && <p className="mt-4 text-red-600">{error}</p>}
      {success && <p className="mt-4 text-green-600">{success}</p>}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-80">
            <h3 className="text-center mb-4">{error || success}</h3>
            <div className="flex justify-center">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateTask;
