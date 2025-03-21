import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Agent } from '../types/agent'
import { Task, TaskArgument, TaskFormData } from '../types/task'
import { PencilIcon, ArrowLeftIcon, ClipboardIcon, LockClosedIcon, PlusIcon, TrashIcon, InboxIcon } from '@heroicons/react/24/outline'
import { mockAgents } from '../mocks/agent'
import useAgent from '../hooks/use-agent'
import { formatDate } from '../utils/time'
import useAgentCaps from '../hooks/use-agent-caps'

export function AgentProfile() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [isEditing, setIsEditing] = useState(false)
  const [isEditingPrompt, setIsEditingPrompt] = useState(false)

  const {agent} = useAgent({id: id!})
  const {caps} = useAgentCaps()
  const isOwner = useMemo(() => {
    if (caps.has(agent?.id)) {
      return true
    }
    return false
  }, [agent, caps])

  // Task related states
  const [tasks, setTasks] = useState<Task[]>([])
  const [isAddingTask, setIsAddingTask] = useState(false)
  const [isJsonMode, setIsJsonMode] = useState(false)
  const [jsonInput, setJsonInput] = useState('')
  const [taskForm, setTaskForm] = useState<TaskFormData>({
    name: '',
    description: '',
    arguments: [],
    resolverAddress: '',
    isOnChain: false,
    price: 0
  })
  const [taskError, setTaskError] = useState<string>('')

  // Mock whether user is the agent owner
  // const isOwner = true

  // Using the first mock agent as an example
  const [agentData, setAgentData] = useState<Partial<Agent>>(mockAgents[0])

  const [editForm, setEditForm] = useState({
    name: agentData.name || '',
    description: agentData.description || '',
    prompt: agentData.prompt || ''
  })

  // Task form handlers
  const handleAddArgument = () => {
    setTaskForm(prev => ({
      ...prev,
      arguments: [...prev.arguments, { name: '', type: 'String', description: '' }]
    }))
  }

  const handleRemoveArgument = (index: number) => {
    setTaskForm(prev => ({
      ...prev,
      arguments: prev.arguments.filter((_, i) => i !== index)
    }))
  }

  const handleArgumentChange = (index: number, field: keyof TaskArgument, value: string) => {
    setTaskForm(prev => ({
      ...prev,
      arguments: prev.arguments.map((arg, i) =>
        i === index ? { ...arg, [field]: value } : arg
      )
    }))
  }

  const handleSubmitTask = () => {
    try {
      if (!taskForm.name.trim()) {
        setTaskError('Task name is required')
        return
      }

      if (isJsonMode) {
        try {
          const jsonData = JSON.parse(jsonInput)
          if (!jsonData.name) {
            setTaskError('Task name is required in JSON')
            return
          }
          const newTask: Task = {
            id: Date.now().toString(),
            ...jsonData
          }
          setTasks(prev => [...prev, newTask])
        } catch (e) {
          setTaskError('Invalid JSON format')
          return
        }
      } else {
        const newTask: Task = {
          id: Date.now().toString(),
          ...taskForm
        }
        setTasks(prev => [...prev, newTask])
      }

      // Reset form
      setTaskForm({
        name: '',
        description: '',
        arguments: [],
        resolverAddress: '',
        isOnChain: false,
        price: 0
      })
      setJsonInput('')
      setIsAddingTask(false)
      setTaskError('')
    } catch (error) {
      setTaskError('Failed to add task')
    }
  }

  const handleEdit = () => {
    if (isEditing) {
      // Save changes
      setAgentData(prev => ({
        ...prev,
        name: editForm.name,
        description: editForm.description
      }))
    } else {
      // Start editing
      setEditForm({
        ...editForm,
        name: agentData.name || '',
        description: agentData.description || ''
      })
    }
    setIsEditing(!isEditing)
  }

  const handlePromptEdit = () => {
    if (!isOwner) return

    if (isEditingPrompt) {
      // Save changes
      setAgentData(prev => ({
        ...prev,
        prompt: editForm.prompt
      }))
    } else {
      // Start editing
      setEditForm({
        ...editForm,
        prompt: agentData.prompt || ''
      })
    }
    setIsEditingPrompt(!isEditingPrompt)
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          <span>Back</span>
        </button>

        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          {/* Cover Image */}
          <div className="h-32 bg-gradient-to-r from-purple-600 to-pink-600"></div>

          {/* Profile Info */}
          <div className="px-6 pb-6">
            {/* Avatar */}
            <div className="relative -mt-16 mb-4">
              <img
                src={agent?.avatar}
                alt={agent?.username}
                className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 bg-white dark:bg-gray-800"
              />
            </div>

            {/* Name and Username */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    className="block w-full text-2xl font-bold bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-purple-500 dark:focus:border-purple-400 focus:outline-none"
                    placeholder="Enter name"
                  />
                ) : (
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {agent?.name}
                  </h1>
                )}
                <div className="mt-1 text-purple-600 dark:text-purple-400">
                  @{agent?.username}
                </div>
              </div>
              {
                isOwner && <button
                onClick={handleEdit}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <PencilIcon className="w-4 h-4 mr-2" />
                {isEditing ? 'Save' : 'Edit'}
              </button>
              }
            </div>

            {/* Description */}
            <div className="max-w-2xl">
              {isEditing ? (
                <textarea
                  value={editForm.description}
                  onChange={e => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  className="block w-full text-gray-600 dark:text-gray-300 bg-transparent border rounded-lg p-2 focus:border-purple-500 dark:focus:border-purple-400 focus:outline-none"
                  placeholder="Enter description"
                  rows={2}
                />
              ) : (
                <p className="text-gray-600 dark:text-gray-300">
                  {agent?.description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Overview Section */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
              Overview
            </h2>

            <div className="space-y-6">
              {/* Character Username */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Character Username
                </h3>
                <div className="flex items-center group">
                  <code className="text-sm text-gray-900 dark:text-gray-100 font-mono bg-gray-50 dark:bg-gray-800/50 p-2 rounded flex-1">
                    {agent?.username}
                  </code>
                </div>
              </div>

              {/* Agent ID */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Agent ID
                </h3>
                <div className="flex items-center group">
                  <code className="text-sm text-gray-900 dark:text-gray-100 font-mono bg-gray-50 dark:bg-gray-800/50 p-2 rounded flex-1 break-all">
                    {agent?.id}
                  </code>
                  <button
                    onClick={() => handleCopy("0xb9e4b3c592dabbaf70dbc2e2cad66ebce0a91c2c864c99a8fa801863797893db")}
                    className="ml-2 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    title="Copy to Clipboard"
                  >
                    <ClipboardIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Agent Address */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Agent Address
                </h3>
                <div className="flex items-center group">
                  <code className="text-sm text-gray-900 dark:text-gray-100 font-mono bg-gray-50 dark:bg-gray-800/50 p-2 rounded flex-1 break-all">
                    {agent?.agent_address}
                  </code>
                  <button
                    onClick={() => handleCopy("rooch19n5zuqjc7rlcx6zgh3ln5fyateczs8n4des4v28y7gkrt7545a9qppy0rl")}
                    className="ml-2 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    title="Copy to Clipboard"
                  >
                    <ClipboardIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Character ID */}
              {/* <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Character ID
                </h3>
                <div className="flex items-center group">
                  <code className="text-sm text-gray-900 dark:text-gray-100 font-mono bg-gray-50 dark:bg-gray-800/50 p-2 rounded flex-1 break-all">
                    0x0aa7a2ed20a8683404411985f3d9347a17970c5396d5cfb7bf3906a7d2a4d67d
                  </code>
                  <button
                    onClick={() => handleCopy("0x0aa7a2ed20a8683404411985f3d9347a17970c5396d5cfb7bf3906a7d2a4d67d")}
                    className="ml-2 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    title="Copy to Clipboard"
                  >
                    <ClipboardIcon className="w-5 h-5" />
                  </button>
                </div>
              </div> */}

              {/* Other Info Grid */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Model Provider
                  </h3>
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    {agent?.model_provider}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Last Active
                  </h3>
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    {formatDate(agent?.last_active_timestamp)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Prompt Section */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Prompt
              </h2>
              {isOwner ? (
                <button
                  onClick={handlePromptEdit}
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <PencilIcon className="w-4 h-4 mr-2" />
                  {isEditingPrompt ? 'Save' : 'Edit'}
                </button>
              ) : (
                <div className="flex items-center text-gray-500 dark:text-gray-400">
                  <LockClosedIcon className="w-4 h-4 mr-2" />
                  <span className="text-sm">Only owner can edit</span>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {isEditingPrompt ? (
                <textarea
                  value={editForm.prompt}
                  onChange={e => setEditForm(prev => ({ ...prev, prompt: e.target.value }))}
                  className="block w-full text-gray-600 dark:text-gray-300 bg-transparent border rounded-lg p-4 focus:border-purple-500 dark:focus:border-purple-400 focus:outline-none font-mono text-sm leading-relaxed"
                  placeholder="Enter AI character's prompt..."
                  rows={12}
                />
              ) : (
                <pre className="whitespace-pre-wrap text-gray-600 dark:text-gray-300 font-mono text-sm leading-relaxed bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                  {agent?.instructions}
                </pre>
              )}
            </div>
          </div>
        </div>

        {/* Tasks Section */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Tasks
              </h2>
              {!isAddingTask && (
                <button
                  onClick={() => setIsAddingTask(true)}
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Add Task
                </button>
              )}
            </div>

            {/* Task List */}
            <div className="space-y-4 mb-6">
              {tasks.length === 0 ? (
                <div className="text-center py-8 px-4">
                  <div className="mx-auto w-24 h-24 bg-gray-50 dark:bg-gray-800/50 rounded-lg flex items-center justify-center mb-4">
                    <InboxIcon className="w-16 h-16 text-gray-300 dark:text-gray-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    No Tasks Yet
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                    This AI agent doesn't have any tasks yet. Click the "Add Task" button to create the first task.
                  </p>
                </div>
              ) : (
                tasks.map(task => (
                  <div
                    key={task.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        {task.name}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {task.price} RGAS
                        </span>
                        {task.isOnChain && (
                          <span className="px-2 py-1 text-xs bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400 rounded-full">
                            On-Chain
                          </span>
                        )}
                      </div>
                    </div>
                    {task.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                        {task.description}
                      </p>
                    )}
                    {task.arguments.length > 0 && (
                      <div className="mt-2">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Arguments:
                        </h4>
                        <div className="space-y-1">
                          {task.arguments.map((arg, index) => (
                            <div key={index} className="text-sm text-gray-600 dark:text-gray-400">
                              {arg.name} ({arg.type}): {arg.description}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      Resolver: {task.resolverAddress}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Add Task Form */}
            {isAddingTask && (
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Add New Task
                  </h3>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => setIsJsonMode(!isJsonMode)}
                      className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
                    >
                      Switch to {isJsonMode ? 'Form' : 'JSON'} Mode
                    </button>
                    <button
                      onClick={() => {
                        setIsAddingTask(false)
                        setTaskError('')
                      }}
                      className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>

                {taskError && (
                  <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-600 dark:text-red-400 text-sm">
                    {taskError}
                  </div>
                )}

                {isJsonMode ? (
                  <div className="space-y-4">
                    <textarea
                      value={jsonInput}
                      onChange={e => setJsonInput(e.target.value)}
                      placeholder="Enter task JSON..."
                      className="w-full h-64 p-3 text-sm font-mono bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 dark:focus:border-purple-400"
                    />
                    <div className="flex justify-end">
                      <button
                        onClick={handleSubmitTask}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        Add Task
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Task Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Task Name *
                      </label>
                      <input
                        type="text"
                        value={taskForm.name}
                        onChange={e => setTaskForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full p-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 dark:focus:border-purple-400 bg-transparent"
                        placeholder="Enter task name"
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Description
                      </label>
                      <textarea
                        value={taskForm.description}
                        onChange={e => setTaskForm(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full p-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 dark:focus:border-purple-400 bg-transparent"
                        placeholder="Enter task description"
                        rows={3}
                      />
                    </div>

                    {/* Arguments */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Arguments
                        </label>
                        <button
                          onClick={handleAddArgument}
                          className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
                        >
                          + Add Argument
                        </button>
                      </div>
                      <div className="space-y-3">
                        {taskForm.arguments.map((arg, index) => (
                          <div key={index} className="flex items-start space-x-3">
                            <div className="flex-1 grid grid-cols-3 gap-2">
                              <input
                                type="text"
                                value={arg.name}
                                onChange={e => handleArgumentChange(index, 'name', e.target.value)}
                                className="p-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 dark:focus:border-purple-400 bg-transparent"
                                placeholder="Name"
                              />
                              <select
                                value={arg.type}
                                onChange={e => handleArgumentChange(index, 'type', e.target.value)}
                                className="p-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 dark:focus:border-purple-400 bg-transparent"
                              >
                                <option value="String">String</option>
                                <option value="Number">Number</option>
                                <option value="Boolean">Boolean</option>
                              </select>
                              <input
                                type="text"
                                value={arg.description}
                                onChange={e => handleArgumentChange(index, 'description', e.target.value)}
                                className="p-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 dark:focus:border-purple-400 bg-transparent"
                                placeholder="Description"
                              />
                            </div>
                            <button
                              onClick={() => handleRemoveArgument(index)}
                              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Resolver Address */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Resolver Address
                      </label>
                      <input
                        type="text"
                        value={taskForm.resolverAddress}
                        onChange={e => setTaskForm(prev => ({ ...prev, resolverAddress: e.target.value }))}
                        className="w-full p-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 dark:focus:border-purple-400 bg-transparent"
                        placeholder="Enter resolver address"
                      />
                    </div>

                    {/* On-Chain Switch */}
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isOnChain"
                        checked={taskForm.isOnChain}
                        onChange={e => setTaskForm(prev => ({ ...prev, isOnChain: e.target.checked }))}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <label
                        htmlFor="isOnChain"
                        className="text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        On-Chain Task
                      </label>
                    </div>

                    {/* Price */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Price (RGAS)
                      </label>
                      <input
                        type="number"
                        value={taskForm.price}
                        onChange={e => setTaskForm(prev => ({ ...prev, price: Number(e.target.value) }))}
                        className="w-full p-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 dark:focus:border-purple-400 bg-transparent"
                        placeholder="Enter price in RGAS"
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={handleSubmitTask}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        Add Task
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 