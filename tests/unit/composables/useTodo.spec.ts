import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useTodo } from '@/features/todo/composables/useTodo'

describe('useTodo', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should initialize with default todos', () => {
    const { todos, filter } = useTodo()
    expect(todos.value).toHaveLength(2)
    expect(filter.value).toBe('all')
  })

  it('should add a new todo', () => {
    const { todos, addTodo } = useTodo()
    const initialCount = todos.value.length

    addTodo('New task')

    expect(todos.value).toHaveLength(initialCount + 1)
    expect(todos.value[todos.value.length - 1].title).toBe('New task')
    expect(todos.value[todos.value.length - 1].completed).toBe(false)
  })

  it('should toggle todo completion', () => {
    const { todos, toggleTodo } = useTodo()
    const firstTodo = todos.value[0]
    const initialStatus = firstTodo.completed

    toggleTodo(firstTodo.id)

    const updatedTodo = todos.value.find(t => t.id === firstTodo.id)!
    expect(updatedTodo.completed).toBe(!initialStatus)
  })

  it('should delete a todo', () => {
    const { todos, deleteTodo } = useTodo()
    const initialCount = todos.value.length
    const firstTodoId = todos.value[0].id

    deleteTodo(firstTodoId)

    expect(todos.value).toHaveLength(initialCount - 1)
    expect(todos.value.find(t => t.id === firstTodoId)).toBeUndefined()
  })

  it('should filter todos correctly', () => {
    const { todos, filter, setFilter } = useTodo()

    // Initially all
    expect(todos.value).toHaveLength(2)

    // Set filter to active (not completed)
    setFilter('active')
    expect(filter.value).toBe('active')
    expect(todos.value.every(t => !t.completed)).toBe(true)

    // Set filter to completed
    setFilter('completed')
    expect(filter.value).toBe('completed')
    expect(todos.value.every(t => t.completed)).toBe(true)

    // Set filter back to all
    setFilter('all')
    expect(todos.value).toHaveLength(2)
  })

  it('should provide computed todos based on filter', () => {
    const { todos, setFilter } = useTodo()

    // Default sample has one completed, one active
    setFilter('active')
    expect(todos.value.some(t => t.completed)).toBe(false)

    setFilter('completed')
    expect(todos.value.every(t => t.completed)).toBe(true)
  })
})
