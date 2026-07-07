/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "mutation Login($input: LoginInput!) {\n  login(input: $input) {\n    accessToken\n    refreshToken\n    user {\n      id\n      name\n      email\n      role\n    }\n  }\n}": typeof types.LoginDocument,
    "query Me {\n  me {\n    id\n    name\n    email\n    role\n  }\n}": typeof types.MeDocument,
    "mutation Register($input: RegisterInput!) {\n  register(input: $input) {\n    accessToken\n    refreshToken\n    user {\n      id\n      name\n      email\n      role\n    }\n  }\n}": typeof types.RegisterDocument,
    "query Boards {\n  boards {\n    id\n    name\n    createdAt\n    updatedAt\n    owner {\n      id\n      name\n      email\n    }\n  }\n}\n\nquery Board($id: ID!) {\n  board(id: $id) {\n    id\n    name\n    createdAt\n    updatedAt\n    owner {\n      id\n      name\n      email\n    }\n    tasks {\n      id\n      title\n      status\n      priority\n      dueDate\n      assignee {\n        id\n        name\n      }\n    }\n  }\n}\n\nmutation CreateBoard($input: CreateBoardInput!) {\n  createBoard(input: $input) {\n    id\n    name\n    createdAt\n    updatedAt\n  }\n}\n\nmutation UpdateBoard($id: ID!, $input: UpdateBoardInput!) {\n  updateBoard(id: $id, input: $input) {\n    id\n    name\n    updatedAt\n  }\n}\n\nmutation DeleteBoard($id: ID!) {\n  deleteBoard(id: $id)\n}": typeof types.BoardsDocument,
    "query DashboardTasks {\n  tasks(filter: {page: 1, limit: 5}) {\n    data {\n      id\n      title\n      status\n      priority\n      board {\n        id\n        name\n      }\n      assignee {\n        id\n        name\n      }\n    }\n    total\n  }\n}": typeof types.DashboardTasksDocument,
    "query Tasks($page: Int, $limit: Int, $search: String, $status: TaskStatus, $priority: TaskPriority, $sortBy: TaskSortField, $order: SortOrder) {\n  tasks(\n    filter: {page: $page, limit: $limit, search: $search, status: $status, priority: $priority, sortBy: $sortBy, order: $order}\n  ) {\n    data {\n      id\n      title\n      description\n      status\n      priority\n      dueDate\n      createdAt\n      updatedAt\n      board {\n        id\n        name\n      }\n      assignee {\n        id\n        name\n        email\n      }\n    }\n    total\n    page\n    limit\n    totalPages\n  }\n}\n\nquery Task($id: ID!) {\n  task(id: $id) {\n    id\n    title\n    description\n    status\n    priority\n    dueDate\n    createdAt\n    updatedAt\n    board {\n      id\n      name\n    }\n    assignee {\n      id\n      name\n      email\n    }\n  }\n}\n\nmutation CreateTask($input: CreateTaskInput!) {\n  createTask(input: $input) {\n    id\n    title\n    status\n    priority\n    dueDate\n    createdAt\n    board {\n      id\n      name\n    }\n    assignee {\n      id\n      name\n    }\n  }\n}\n\nmutation UpdateTask($id: ID!, $input: UpdateTaskInput!) {\n  updateTask(id: $id, input: $input) {\n    id\n    title\n    description\n    status\n    priority\n    dueDate\n    updatedAt\n  }\n}\n\nmutation DeleteTask($id: ID!) {\n  deleteTask(id: $id)\n}\n\nmutation DeleteTask($id: ID!) {\n  deleteTask(id: $id)\n}\n\nmutation DeleteTask($id: ID!) {\n  deleteTask(id: $id)\n}": typeof types.TasksDocument,
};
const documents: Documents = {
    "mutation Login($input: LoginInput!) {\n  login(input: $input) {\n    accessToken\n    refreshToken\n    user {\n      id\n      name\n      email\n      role\n    }\n  }\n}": types.LoginDocument,
    "query Me {\n  me {\n    id\n    name\n    email\n    role\n  }\n}": types.MeDocument,
    "mutation Register($input: RegisterInput!) {\n  register(input: $input) {\n    accessToken\n    refreshToken\n    user {\n      id\n      name\n      email\n      role\n    }\n  }\n}": types.RegisterDocument,
    "query Boards {\n  boards {\n    id\n    name\n    createdAt\n    updatedAt\n    owner {\n      id\n      name\n      email\n    }\n  }\n}\n\nquery Board($id: ID!) {\n  board(id: $id) {\n    id\n    name\n    createdAt\n    updatedAt\n    owner {\n      id\n      name\n      email\n    }\n    tasks {\n      id\n      title\n      status\n      priority\n      dueDate\n      assignee {\n        id\n        name\n      }\n    }\n  }\n}\n\nmutation CreateBoard($input: CreateBoardInput!) {\n  createBoard(input: $input) {\n    id\n    name\n    createdAt\n    updatedAt\n  }\n}\n\nmutation UpdateBoard($id: ID!, $input: UpdateBoardInput!) {\n  updateBoard(id: $id, input: $input) {\n    id\n    name\n    updatedAt\n  }\n}\n\nmutation DeleteBoard($id: ID!) {\n  deleteBoard(id: $id)\n}": types.BoardsDocument,
    "query DashboardTasks {\n  tasks(filter: {page: 1, limit: 5}) {\n    data {\n      id\n      title\n      status\n      priority\n      board {\n        id\n        name\n      }\n      assignee {\n        id\n        name\n      }\n    }\n    total\n  }\n}": types.DashboardTasksDocument,
    "query Tasks($page: Int, $limit: Int, $search: String, $status: TaskStatus, $priority: TaskPriority, $sortBy: TaskSortField, $order: SortOrder) {\n  tasks(\n    filter: {page: $page, limit: $limit, search: $search, status: $status, priority: $priority, sortBy: $sortBy, order: $order}\n  ) {\n    data {\n      id\n      title\n      description\n      status\n      priority\n      dueDate\n      createdAt\n      updatedAt\n      board {\n        id\n        name\n      }\n      assignee {\n        id\n        name\n        email\n      }\n    }\n    total\n    page\n    limit\n    totalPages\n  }\n}\n\nquery Task($id: ID!) {\n  task(id: $id) {\n    id\n    title\n    description\n    status\n    priority\n    dueDate\n    createdAt\n    updatedAt\n    board {\n      id\n      name\n    }\n    assignee {\n      id\n      name\n      email\n    }\n  }\n}\n\nmutation CreateTask($input: CreateTaskInput!) {\n  createTask(input: $input) {\n    id\n    title\n    status\n    priority\n    dueDate\n    createdAt\n    board {\n      id\n      name\n    }\n    assignee {\n      id\n      name\n    }\n  }\n}\n\nmutation UpdateTask($id: ID!, $input: UpdateTaskInput!) {\n  updateTask(id: $id, input: $input) {\n    id\n    title\n    description\n    status\n    priority\n    dueDate\n    updatedAt\n  }\n}\n\nmutation DeleteTask($id: ID!) {\n  deleteTask(id: $id)\n}\n\nmutation DeleteTask($id: ID!) {\n  deleteTask(id: $id)\n}\n\nmutation DeleteTask($id: ID!) {\n  deleteTask(id: $id)\n}": types.TasksDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation Login($input: LoginInput!) {\n  login(input: $input) {\n    accessToken\n    refreshToken\n    user {\n      id\n      name\n      email\n      role\n    }\n  }\n}"): (typeof documents)["mutation Login($input: LoginInput!) {\n  login(input: $input) {\n    accessToken\n    refreshToken\n    user {\n      id\n      name\n      email\n      role\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query Me {\n  me {\n    id\n    name\n    email\n    role\n  }\n}"): (typeof documents)["query Me {\n  me {\n    id\n    name\n    email\n    role\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation Register($input: RegisterInput!) {\n  register(input: $input) {\n    accessToken\n    refreshToken\n    user {\n      id\n      name\n      email\n      role\n    }\n  }\n}"): (typeof documents)["mutation Register($input: RegisterInput!) {\n  register(input: $input) {\n    accessToken\n    refreshToken\n    user {\n      id\n      name\n      email\n      role\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query Boards {\n  boards {\n    id\n    name\n    createdAt\n    updatedAt\n    owner {\n      id\n      name\n      email\n    }\n  }\n}\n\nquery Board($id: ID!) {\n  board(id: $id) {\n    id\n    name\n    createdAt\n    updatedAt\n    owner {\n      id\n      name\n      email\n    }\n    tasks {\n      id\n      title\n      status\n      priority\n      dueDate\n      assignee {\n        id\n        name\n      }\n    }\n  }\n}\n\nmutation CreateBoard($input: CreateBoardInput!) {\n  createBoard(input: $input) {\n    id\n    name\n    createdAt\n    updatedAt\n  }\n}\n\nmutation UpdateBoard($id: ID!, $input: UpdateBoardInput!) {\n  updateBoard(id: $id, input: $input) {\n    id\n    name\n    updatedAt\n  }\n}\n\nmutation DeleteBoard($id: ID!) {\n  deleteBoard(id: $id)\n}"): (typeof documents)["query Boards {\n  boards {\n    id\n    name\n    createdAt\n    updatedAt\n    owner {\n      id\n      name\n      email\n    }\n  }\n}\n\nquery Board($id: ID!) {\n  board(id: $id) {\n    id\n    name\n    createdAt\n    updatedAt\n    owner {\n      id\n      name\n      email\n    }\n    tasks {\n      id\n      title\n      status\n      priority\n      dueDate\n      assignee {\n        id\n        name\n      }\n    }\n  }\n}\n\nmutation CreateBoard($input: CreateBoardInput!) {\n  createBoard(input: $input) {\n    id\n    name\n    createdAt\n    updatedAt\n  }\n}\n\nmutation UpdateBoard($id: ID!, $input: UpdateBoardInput!) {\n  updateBoard(id: $id, input: $input) {\n    id\n    name\n    updatedAt\n  }\n}\n\nmutation DeleteBoard($id: ID!) {\n  deleteBoard(id: $id)\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query DashboardTasks {\n  tasks(filter: {page: 1, limit: 5}) {\n    data {\n      id\n      title\n      status\n      priority\n      board {\n        id\n        name\n      }\n      assignee {\n        id\n        name\n      }\n    }\n    total\n  }\n}"): (typeof documents)["query DashboardTasks {\n  tasks(filter: {page: 1, limit: 5}) {\n    data {\n      id\n      title\n      status\n      priority\n      board {\n        id\n        name\n      }\n      assignee {\n        id\n        name\n      }\n    }\n    total\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query Tasks($page: Int, $limit: Int, $search: String, $status: TaskStatus, $priority: TaskPriority, $sortBy: TaskSortField, $order: SortOrder) {\n  tasks(\n    filter: {page: $page, limit: $limit, search: $search, status: $status, priority: $priority, sortBy: $sortBy, order: $order}\n  ) {\n    data {\n      id\n      title\n      description\n      status\n      priority\n      dueDate\n      createdAt\n      updatedAt\n      board {\n        id\n        name\n      }\n      assignee {\n        id\n        name\n        email\n      }\n    }\n    total\n    page\n    limit\n    totalPages\n  }\n}\n\nquery Task($id: ID!) {\n  task(id: $id) {\n    id\n    title\n    description\n    status\n    priority\n    dueDate\n    createdAt\n    updatedAt\n    board {\n      id\n      name\n    }\n    assignee {\n      id\n      name\n      email\n    }\n  }\n}\n\nmutation CreateTask($input: CreateTaskInput!) {\n  createTask(input: $input) {\n    id\n    title\n    status\n    priority\n    dueDate\n    createdAt\n    board {\n      id\n      name\n    }\n    assignee {\n      id\n      name\n    }\n  }\n}\n\nmutation UpdateTask($id: ID!, $input: UpdateTaskInput!) {\n  updateTask(id: $id, input: $input) {\n    id\n    title\n    description\n    status\n    priority\n    dueDate\n    updatedAt\n  }\n}\n\nmutation DeleteTask($id: ID!) {\n  deleteTask(id: $id)\n}\n\nmutation DeleteTask($id: ID!) {\n  deleteTask(id: $id)\n}\n\nmutation DeleteTask($id: ID!) {\n  deleteTask(id: $id)\n}"): (typeof documents)["query Tasks($page: Int, $limit: Int, $search: String, $status: TaskStatus, $priority: TaskPriority, $sortBy: TaskSortField, $order: SortOrder) {\n  tasks(\n    filter: {page: $page, limit: $limit, search: $search, status: $status, priority: $priority, sortBy: $sortBy, order: $order}\n  ) {\n    data {\n      id\n      title\n      description\n      status\n      priority\n      dueDate\n      createdAt\n      updatedAt\n      board {\n        id\n        name\n      }\n      assignee {\n        id\n        name\n        email\n      }\n    }\n    total\n    page\n    limit\n    totalPages\n  }\n}\n\nquery Task($id: ID!) {\n  task(id: $id) {\n    id\n    title\n    description\n    status\n    priority\n    dueDate\n    createdAt\n    updatedAt\n    board {\n      id\n      name\n    }\n    assignee {\n      id\n      name\n      email\n    }\n  }\n}\n\nmutation CreateTask($input: CreateTaskInput!) {\n  createTask(input: $input) {\n    id\n    title\n    status\n    priority\n    dueDate\n    createdAt\n    board {\n      id\n      name\n    }\n    assignee {\n      id\n      name\n    }\n  }\n}\n\nmutation UpdateTask($id: ID!, $input: UpdateTaskInput!) {\n  updateTask(id: $id, input: $input) {\n    id\n    title\n    description\n    status\n    priority\n    dueDate\n    updatedAt\n  }\n}\n\nmutation DeleteTask($id: ID!) {\n  deleteTask(id: $id)\n}\n\nmutation DeleteTask($id: ID!) {\n  deleteTask(id: $id)\n}\n\nmutation DeleteTask($id: ID!) {\n  deleteTask(id: $id)\n}"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;