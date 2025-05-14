import { useState, useRef } from 'react';
import { Clock, Plus, Bell, Menu, X, Search, MoreHorizontal, UserPlus, Calendar } from 'lucide-react';

// Sample data
const initialData = {
  boards: [
    {
      id: 'board-1',
      title: 'Main Project',
      lists: ['list-1', 'list-2', 'list-3'],
    }
  ],
  lists: {
    'list-1': {
      id: 'list-1',
      title: 'To Do',
      taskIds: ['task-1', 'task-2', 'task-3'],
    },
    'list-2': {
      id: 'list-2',
      title: 'In Progress',
      taskIds: ['task-4', 'task-5'],
    },
    'list-3': {
      id: 'list-3',
      title: 'Done',
      taskIds: ['task-6'],
    },
  },
  tasks: {
    'task-1': {
      id: 'task-1',
      title: 'Create project wireframes',
      description: 'Design the UI mockups for all pages',
      assignedTo: 'user-1',
      dueDate: '2025-05-20',
      labels: ['Design', 'High Priority'],
    },
    'task-2': {
      id: 'task-2',
      title: 'Set up database schema',
      description: 'Design MongoDB collections and relationships',
      assignedTo: 'user-2',
      dueDate: '2025-05-18',
      labels: ['Backend', 'Medium Priority'],
    },
    'task-3': {
      id: 'task-3',
      title: 'Implement authentication',
      description: 'Create login, signup, and JWT middleware',
      assignedTo: 'user-3',
      dueDate: '2025-05-21',
      labels: ['Backend', 'High Priority'],
    },
    'task-4': {
      id: 'task-4',
      title: 'Implement drag and drop',
      description: 'Add drag and drop to task components',
      assignedTo: 'user-1',
      dueDate: '2025-05-17',
      labels: ['Frontend', 'Medium Priority'],
    },
    'task-5': {
      id: 'task-5',
      title: 'Create task detail modal',
      description: 'Modal popup to show and edit task details',
      assignedTo: 'user-2',
      dueDate: '2025-05-19',
      labels: ['Frontend', 'Low Priority'],
    },
    'task-6': {
      id: 'task-6',
      title: 'Project setup',
      description: 'Initialize repo and configure dev environment',
      assignedTo: 'user-3',
      dueDate: '2025-05-15',
      labels: ['DevOps', 'Completed'],
    },
  },
  users: {
    'user-1': {
      id: 'user-1',
      name: 'Alex Johnson',
      avatar: '/api/placeholder/40/40',
    },
    'user-2': {
      id: 'user-2',
      name: 'Sam Chen',
      avatar: '/api/placeholder/40/40',
    },
    'user-3': {
      id: 'user-3',
      name: 'Taylor Kim',
      avatar: '/api/placeholder/40/40',
    },
  },
  activity: [
    {
      id: 'activity-1',
      userId: 'user-1',
      action: 'moved',
      taskId: 'task-4',
      from: 'To Do',
      to: 'In Progress',
      timestamp: '2025-05-14T09:30:00',
    },
    {
      id: 'activity-2',
      userId: 'user-3',
      action: 'completed',
      taskId: 'task-6',
      timestamp: '2025-05-13T16:45:00',
    },
    {
      id: 'activity-3',
      userId: 'user-2',
      action: 'created',
      taskId: 'task-5',
      timestamp: '2025-05-13T11:20:00',
    },
    {
      id: 'activity-4',
      userId: 'user-1',
      action: 'assigned',
      taskId: 'task-2',
      to: 'user-2',
      timestamp: '2025-05-12T14:15:00',
    },
  ]
};

const getTimeAgo = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffDay > 0) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
  if (diffHour > 0) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
  if (diffMin > 0) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
  return 'Just now';
};

// Label colors
const labelColors = {
  'Frontend': 'bg-blue-500',
  'Backend': 'bg-green-500',
  'Design': 'bg-purple-500',
  'DevOps': 'bg-yellow-500',
  'High Priority': 'bg-red-500',
  'Medium Priority': 'bg-orange-400',
  'Low Priority': 'bg-gray-400',
  'Completed': 'bg-emerald-500',
};

// Task component
const Task = ({ task, users, onDragStart }) => {
  const assignedUser = users[task.assignedTo];
  
  return (
    <div
      draggable={true}
      onDragStart={(e) => onDragStart(e, task.id)}
      className="bg-white p-3 mb-2 rounded shadow-sm hover:shadow cursor-grab active:cursor-grabbing"
    >
      <div className="flex flex-wrap gap-1 mb-2">
        {task.labels && task.labels.map((label, i) => (
          <span key={i} className={`${labelColors[label] || 'bg-gray-500'} text-white text-xs px-2 py-1 rounded-full`}>
            {label}
          </span>
        ))}
      </div>
      <h4 className="font-medium mb-1">{task.title}</h4>
      <p className="text-sm text-gray-600 mb-3">{task.description}</p>
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          {assignedUser && (
            <div className="flex items-center mr-3" title={assignedUser.name}>
              <div className="h-6 w-6 rounded-full overflow-hidden mr-1">
                <img src={assignedUser.avatar} alt={assignedUser.name} className="h-full w-full object-cover" />
              </div>
            </div>
          )}
          <div className="flex items-center text-xs text-gray-500">
            <Calendar size={12} className="mr-1" />
            <span>{new Date(task.dueDate).toLocaleDateString()}</span>
          </div>
        </div>
        <button className="text-gray-500 hover:text-gray-700">
          <MoreHorizontal size={16} />
        </button>
      </div>
    </div>
  );
};

// List component
const TaskList = ({ list, tasks, users, onDragStart, onDragOver, onDrop }) => {
  const listTasks = list.taskIds.map(taskId => tasks[taskId]);
  
  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('bg-gray-200');
  };
  
  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('bg-gray-200');
  };
  
  return (
    <div className="bg-gray-100 p-2 rounded-md shadow-sm w-72 flex-shrink-0 max-h-full">
      <div className="flex justify-between items-center mb-2 px-1">
        <h3 className="font-semibold text-gray-700">{list.title}</h3>
        <span className="text-gray-500 text-sm">{list.taskIds.length}</span>
      </div>
      <div 
        className="min-h-12 transition-colors"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={(e) => {
          e.currentTarget.classList.remove('bg-gray-200');
          onDrop(e, list.id);
        }}
      >
        {listTasks.map((task) => (
          <Task 
            key={task.id} 
            task={task} 
            users={users} 
            onDragStart={onDragStart} 
          />
        ))}
      </div>
      <button className="flex items-center text-gray-500 hover:text-gray-700 mt-2 px-1 py-2 w-full rounded-md hover:bg-gray-200 transition">
        <Plus size={20} className="mr-1" />
        <span>Add a card</span>
      </button>
    </div>
  );
};

// Activity component
const ActivityFeed = ({ activities, users, tasks }) => {
  return (
    <div className="bg-white rounded-md shadow-sm p-4 max-h-96 overflow-y-auto">
      <h3 className="font-semibold text-gray-700 mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {activities.map(activity => {
          const user = users[activity.userId];
          const task = tasks[activity.taskId];
          const timeAgo = getTimeAgo(activity.timestamp);
          
          let actionText = '';
          switch (activity.action) {
            case 'moved':
              actionText = `moved "${task.title}" from ${activity.from} to ${activity.to}`;
              break;
            case 'completed':
              actionText = `marked "${task.title}" as complete`;
              break;
            case 'created':
              actionText = `created "${task.title}"`;
              break;
            case 'assigned':
              const assignee = users[activity.to];
              actionText = `assigned "${task.title}" to ${assignee.name}`;
              break;
            default:
              actionText = `updated "${task.title}"`;
          }
          
          return (
            <div key={activity.id} className="flex">
              <div className="h-8 w-8 rounded-full overflow-hidden mr-3 flex-shrink-0">
                <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
              </div>
              <div>
                <div className="text-sm">
                  <span className="font-medium text-gray-800">{user.name}</span>
                  {' '}
                  <span className="text-gray-600">{actionText}</span>
                </div>
                <div className="text-xs text-gray-500 flex items-center mt-1">
                  <Clock size={12} className="mr-1" />
                  {timeAgo}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Main application component
export default function TrelloLite() {
  const [data, setData] = useState(initialData);
  const [showMenu, setShowMenu] = useState(false);
  const [showActivity, setShowActivity] = useState(false);
  const [currentBoard, setCurrentBoard] = useState(data.boards[0]);
  const [draggedTask, setDraggedTask] = useState(null);
  
  const handleDragStart = (e, taskId) => {
    setDraggedTask(taskId);
    e.dataTransfer.effectAllowed = "move";
  };
  
  const handleDrop = (e, listId) => {
    e.preventDefault();
    
    if (!draggedTask) return;
    
    // Find which list currently has the task
    let sourceListId = null;
    Object.keys(data.lists).forEach(key => {
      const list = data.lists[key];
      if (list.taskIds.includes(draggedTask)) {
        sourceListId = key;
      }
    });
    
    if (!sourceListId || sourceListId === listId) return;
    
    const sourceList = data.lists[sourceListId];
    const destinationList = data.lists[listId];
    
    // Remove from source list
    const newSourceTaskIds = sourceList.taskIds.filter(id => id !== draggedTask);
    
    // Add to destination list
    const newDestinationTaskIds = [...destinationList.taskIds, draggedTask];
    
    // Add a new activity
    const newActivity = {
      id: `activity-${Date.now()}`,
      userId: 'user-1', // Assuming current user is user-1
      action: 'moved',
      taskId: draggedTask,
      from: sourceList.title,
      to: destinationList.title,
      timestamp: new Date().toISOString(),
    };
    
    // Update state
    setData({
      ...data,
      lists: {
        ...data.lists,
        [sourceListId]: {
          ...sourceList,
          taskIds: newSourceTaskIds,
        },
        [listId]: {
          ...destinationList,
          taskIds: newDestinationTaskIds,
        },
      },
      activity: [newActivity, ...data.activity],
    });
    
    setDraggedTask(null);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-blue-700 text-white py-3 px-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <button 
              className="p-2 rounded hover:bg-blue-600 mr-2 md:hidden"
              onClick={() => setShowMenu(!showMenu)}
            >
              <Menu size={20} />
            </button>
            <h1 className="font-bold text-xl mr-6">Trello-Lite</h1>
            <div className="hidden md:flex space-x-2">
              <button className="px-3 py-1 rounded hover:bg-blue-600">Boards</button>
              <button className="px-3 py-1 rounded hover:bg-blue-600">Templates</button>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="relative hidden md:block">
              <input
                type="text"
                placeholder="Search..."
                className="bg-blue-600 text-white placeholder-blue-300 px-3 py-1 rounded w-48 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                <Search size={16} />
              </div>
            </div>
            
            <button 
              className="p-2 rounded hover:bg-blue-600 relative"
              onClick={() => setShowActivity(!showActivity)}
            >
              <Bell size={20} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            
            <div className="h-8 w-8 rounded-full overflow-hidden">
              <img src="/api/placeholder/40/40" alt="User Avatar" className="h-full w-full object-cover" />
            </div>
          </div>
        </div>
      </header>
      
      {/* Mobile Sidebar */}
      {showMenu && (
        <div className="fixed inset-0 z-10 bg-black bg-opacity-50 md:hidden">
          <div className="w-64 h-full bg-white shadow-lg p-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-bold text-lg">Menu</h2>
              <button onClick={() => setShowMenu(false)}>
                <X size={20} />
              </button>
            </div>
            <nav className="space-y-2">
              <a href="#" className="block px-4 py-2 rounded hover:bg-gray-100">Boards</a>
              <a href="#" className="block px-4 py-2 rounded hover:bg-gray-100">Templates</a>
              <a href="#" className="block px-4 py-2 rounded hover:bg-gray-100">Settings</a>
            </nav>
          </div>
        </div>
      )}
      
      {/* Activity dropdown */}
      {showActivity && (
        <div className="absolute right-4 top-14 z-10 w-80">
          <ActivityFeed 
            activities={data.activity.slice(0, 5)} 
            users={data.users} 
            tasks={data.tasks} 
          />
        </div>
      )}
      
      {/* Board header */}
      <div className="px-4 py-3 flex justify-between items-center border-b border-gray-200">
        <div>
          <h2 className="font-bold text-xl">{currentBoard.title}</h2>
        </div>
        <div className="flex items-center space-x-2">
          <button className="flex items-center bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded text-sm">
            <UserPlus size={16} className="mr-1" />
            <span>Share</span>
          </button>
          <button className="bg-gray-200 hover:bg-gray-300 p-2 rounded">
            <MoreHorizontal size={16} />
          </button>
        </div>
      </div>
      
      {/* Main content */}
      <main className="flex-grow p-4 overflow-x-auto">
        <div className="flex flex-col h-full">
          <div className="flex space-x-2 flex-grow overflow-x-auto pb-4">
            {currentBoard.lists.map(listId => {
              const list = data.lists[listId];
              return (
                <TaskList 
                  key={list.id} 
                  list={list} 
                  tasks={data.tasks}
                  users={data.users}
                  onDragStart={handleDragStart}
                  onDrop={handleDrop}
                />
              );
            })}
            
            <div className="flex-shrink-0 w-72">
              <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-2 rounded flex items-center w-full">
                <Plus size={20} className="mr-1" />
                <span>Add another list</span>
              </button>
            </div>
          </div>
        </div>
      </main>
      
      {/* Right sidebar */}
      <div className="hidden lg:block w-80 border-l border-gray-200 h-full fixed right-0 top-14 bg-white p-4 overflow-y-auto">
        <h3 className="font-semibold text-gray-700 mb-4">Activity</h3>
        <ActivityFeed 
          activities={data.activity} 
          users={data.users} 
          tasks={data.tasks} 
        />
      </div>
    </div>
  );
}
