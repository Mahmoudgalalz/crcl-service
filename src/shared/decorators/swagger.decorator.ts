import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiQuery,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';

export interface SwaggerRouteConfig {
  tags: string[];
  operation: { summary: string; description?: string }; // Adjusted to match ApiOperation config format
  responses: Record<number, { description: string }>; // Updated to reflect ApiResponse config
  queries?: {
    name: string;
    required?: boolean;
    description?: string;
    type?: any;
  }[];
  params?: {
    name: string;
    description?: string;
    type?: any;
    required?: boolean;
  }[];
  body?: any;
}

export function SwaggerRoute(config: SwaggerRouteConfig) {
  const decorators = [
    ApiTags(...config.tags),
    ApiOperation({
      summary: config.operation.summary,
      description: config.operation.description,
    }),
    ...Object.entries(config.responses).map(([status, response]) =>
      ApiResponse({
        status: Number(status),
        description: response.description,
      }),
    ),
    ...(config.queries ? config.queries.map((query) => ApiQuery(query)) : []),
    ...(config.params ? config.params.map((param) => ApiParam(param)) : []),
  ];

  if (config.body) {
    ApiBody({ type: config.body });
  }
  return applyDecorators(...decorators);
}
