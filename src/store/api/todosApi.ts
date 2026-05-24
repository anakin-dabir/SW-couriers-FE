/**
 * Todos API slice using JSONPlaceholder API
 * API Documentation: https://jsonplaceholder.typicode.com/
 */

import { baseApi } from './baseApi';

// Todo type based on JSONPlaceholder API response
export interface Todo {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
}

export interface CreateTodoDto {
  title: string;
  completed?: boolean;
  userId?: number;
}

export interface UpdateTodoDto extends Partial<CreateTodoDto> {
  id: number;
}

// Inject endpoints into the base API
export const todosApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all todos
    getTodos: builder.query<Todo[], void>({
      query: () => 'https://jsonplaceholder.typicode.com/todos',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Todo' as const, id })),
              { type: 'Todo', id: 'LIST' },
            ]
          : [{ type: 'Todo', id: 'LIST' }],
    }),

    // Get a single todo by ID
    getTodoById: builder.query<Todo, number>({
      query: (id) => `https://jsonplaceholder.typicode.com/todos/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Todo', id }],
    }),

    // Get todos by user ID
    getTodosByUserId: builder.query<Todo[], number>({
      query: (userId) => `https://jsonplaceholder.typicode.com/todos?userId=${userId}`,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Todo' as const, id })),
              { type: 'Todo', id: 'LIST' },
            ]
          : [{ type: 'Todo', id: 'LIST' }],
    }),

    // Create a new todo
    createTodo: builder.mutation<Todo, CreateTodoDto>({
      query: (body) => ({
        url: 'https://jsonplaceholder.typicode.com/todos',
        method: 'POST',
        body: {
          title: body.title,
          completed: body.completed ?? false,
          userId: body.userId ?? 1,
        },
      }),
      invalidatesTags: [{ type: 'Todo', id: 'LIST' }],
    }),

    // Update a todo
    updateTodo: builder.mutation<Todo, UpdateTodoDto>({
      query: ({ id, ...body }) => ({
        url: `https://jsonplaceholder.typicode.com/todos/${id}`,
        method: 'PUT',
        body: {
          id,
          ...body,
        },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Todo', id },
        { type: 'Todo', id: 'LIST' },
      ],
    }),

    // Patch (partial update) a todo
    patchTodo: builder.mutation<Todo, UpdateTodoDto>({
      query: ({ id, ...body }) => ({
        url: `https://jsonplaceholder.typicode.com/todos/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Todo', id },
        { type: 'Todo', id: 'LIST' },
      ],
    }),

    // Delete a todo
    deleteTodo: builder.mutation<void, number>({
      query: (id) => ({
        url: `https://jsonplaceholder.typicode.com/todos/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Todo', id },
        { type: 'Todo', id: 'LIST' },
      ],
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useGetTodosQuery,
  useGetTodoByIdQuery,
  useGetTodosByUserIdQuery,
  useCreateTodoMutation,
  useUpdateTodoMutation,
  usePatchTodoMutation,
  useDeleteTodoMutation,
  // Lazy query hooks (for manual triggering)
  useLazyGetTodosQuery,
  useLazyGetTodoByIdQuery,
  useLazyGetTodosByUserIdQuery,
} = todosApi;
