import { SwaggerRouteConfig } from 'src/shared/decorators/swagger.decorator';
import { CreateUserViaAdminDto } from './dto/create-user.dto';
import { CreateSuperUserViaAdminDto } from './dto/create-admin.dto';

export enum UserEndpoints {
  CREATE_USER = 'createUser',
  LIST_ALL_USERS = 'listAllUsers',
  CHANGE_USER_STATUS = 'changeUserStatus',
  FIND_USER = 'findUser',
}

export enum SuperUserEndpoints {
  CREATE_SUPER_USER = 'createSuperUser',
  FIND_ALL_SUPER_USERS = 'findAllSuperUsers',
}

type SwaggerConfigMap<T extends string> = {
  [K in T]: SwaggerRouteConfig;
};

export const UsersSwaggerConfig: SwaggerConfigMap<UserEndpoints> = {
  [UserEndpoints.CREATE_USER]: {
    tags: ['users'],
    operation: { summary: 'Create a new user' },
    responses: {
      201: { description: 'User created successfully.' },
      400: { description: 'Bad request.' },
    },
    body: CreateUserViaAdminDto,
  },
  [UserEndpoints.LIST_ALL_USERS]: {
    tags: ['users'],
    operation: { summary: 'List all users' },
    responses: {
      200: { description: 'List of users returned successfully.' },
      404: { description: 'No users found.' },
    },
    queries: [
      {
        name: 'page',
        required: false,
        type: Number,
        description: 'Page number for pagination',
      },
      {
        name: 'limit',
        required: false,
        type: Number,
        description: 'Number of users per page',
      },
      {
        name: 'status',
        required: false,
        type: String,
        description: 'Filter by user status',
      },
      {
        name: 'gender',
        required: false,
        type: String,
        description: 'Filter by user gender',
      },
    ],
  },
  [UserEndpoints.CHANGE_USER_STATUS]: {
    tags: ['users'],
    operation: { summary: 'Change user status' },
    responses: {
      200: { description: 'User status updated successfully.' },
      404: { description: 'User not found.' },
    },
    params: [
      {
        name: 'id',
        required: true,
        description: 'The ID of the user whose status is to be changed',
      },
    ],
  },
  [UserEndpoints.FIND_USER]: {
    tags: ['users'],
    operation: { summary: 'Find a user by ID' },
    responses: {
      200: { description: 'User found successfully.' },
      404: { description: 'User not found.' },
    },
    params: [
      { name: 'id', required: true, description: 'The ID of the user to find' },
    ],
  },
};

export const SuperUsersSwaggerConfig: SwaggerConfigMap<SuperUserEndpoints> = {
  [SuperUserEndpoints.CREATE_SUPER_USER]: {
    tags: ['users'],
    body: CreateSuperUserViaAdminDto,
    operation: { summary: 'Create a new super user' },
    responses: {
      201: { description: 'Super user created successfully.' },
      400: { description: 'Bad request.' },
    },
  },
  [SuperUserEndpoints.FIND_ALL_SUPER_USERS]: {
    tags: ['users'],
    operation: { summary: 'List all super users' },
    responses: {
      200: { description: 'List of super users returned successfully.' },
    },
  },
};
