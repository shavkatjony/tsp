import { useState } from 'react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { useLocations } from '../context/LocationContext'
import { useTheme } from '../context/ThemeContext'
import { SunIcon, MoonIcon, TrashIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

export default function Sidebar() {
  const {
    locations,
    optimizedRoute,
    isOptimizing,
    removeLocation,
    updateLocation,
    optimizeRoute,
    exportRoute
  } = useLocations()
  const { isDarkMode, toggleTheme } = useTheme()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const handleDragEnd = (result) => {
    if (!result.destination) return

    const items = Array.from(locations)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    // Update locations with new order
    items.forEach((item, index) => {
      updateLocation(item.id, { order: index })
    })
  }

  return (
    <div
      className={`relative bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-80'
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          {!isCollapsed && (
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">NYC TSP</h1>
          )}
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {isDarkMode ? (
                <SunIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              ) : (
                <MoonIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              )}
            </button>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ArrowPathIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </div>

        {/* Content */}
        {!isCollapsed && (
          <div className="flex-1 overflow-y-auto p-4">
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="locations">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    {locations.map((location, index) => (
                      <Draggable
                        key={location.id}
                        draggableId={location.id.toString()}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg mb-2 flex items-center justify-between"
                          >
                            <div className="flex-1">
                              <input
                                type="text"
                                value={location.name}
                                onChange={(e) =>
                                  updateLocation(location.id, { name: e.target.value })
                                }
                                className="w-full bg-transparent border-none focus:ring-0 text-gray-900 dark:text-white"
                              />
                            </div>
                            <button
                              onClick={() => removeLocation(location.id)}
                              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                            >
                              <TrashIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            </button>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        )}

        {/* Footer */}
        {!isCollapsed && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={optimizeRoute}
              disabled={isOptimizing || locations.length < 2}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isOptimizing ? 'Optimizing...' : 'Optimize Route'}
            </button>

            {optimizedRoute && (
              <div className="mt-4 space-y-2">
                <button
                  onClick={() => exportRoute('json')}
                  className="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium py-2 px-4 rounded-lg"
                >
                  Export JSON
                </button>
                <button
                  onClick={() => exportRoute('csv')}
                  className="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium py-2 px-4 rounded-lg"
                >
                  Export CSV
                </button>
                <button
                  onClick={() => exportRoute('gpx')}
                  className="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium py-2 px-4 rounded-lg"
                >
                  Export GPX
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 