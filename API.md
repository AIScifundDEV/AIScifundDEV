# SciFund API Documentation

## Authentication

All API endpoints require authentication using Web3 wallet signatures. Include the following headers in your requests:

```
Authorization: Bearer <jwt_token>
```

## Endpoints

### Projects

#### List Projects
```http
GET /api/projects
```

Query Parameters:
- `category`: Filter by category ID
- `status`: Filter by project status (ACTIVE, COMPLETED, CANCELLED)
- `sort`: Sort by (newest, oldest, funding_goal, current_funding)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

Response:
```json
{
  "projects": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "fundingGoal": "string",
      "currentFunding": "string",
      "deadline": "string",
      "status": "string",
      "researcher": {
        "id": "string",
        "name": "string",
        "avatar": "string"
      },
      "category": {
        "id": "string",
        "name": "string"
      }
    }
  ],
  "total": "number",
  "page": "number",
  "limit": "number"
}
```

#### Get Project
```http
GET /api/projects/:id
```

Response:
```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "fundingGoal": "string",
  "currentFunding": "string",
  "deadline": "string",
  "status": "string",
  "researcher": {
    "id": "string",
    "name": "string",
    "avatar": "string"
  },
  "category": {
    "id": "string",
    "name": "string"
  },
  "contributions": [
    {
      "id": "string",
      "amount": "string",
      "user": {
        "id": "string",
        "name": "string",
        "avatar": "string"
      }
    }
  ]
}
```

#### Create Project
```http
POST /api/projects
```

Request Body:
```json
{
  "title": "string",
  "description": "string",
  "fundingGoal": "string",
  "deadline": "string",
  "categoryId": "string",
  "tags": ["string"]
}
```

### Research Outputs

#### Create Research Output
```http
POST /api/projects/:id/output
```

Request Body:
```json
{
  "title": "string",
  "description": "string",
  "methodology": "string",
  "results": "string",
  "conclusions": "string",
  "data": "string",
  "code": "string"
}
```

#### Get Research Output
```http
GET /api/projects/:id/output/:outputId
```

### Rewards

#### Distribute Rewards
```http
POST /api/projects/:id/output/:outputId/rewards
```

Request Body:
```json
{
  "amount": "string"
}
```

#### Get Reward Distribution
```http
GET /api/projects/:id/output/:outputId/rewards
```

## Error Responses

All endpoints may return the following error responses:

```json
{
  "error": "string",
  "status": "number"
}
```

Common status codes:
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

## Rate Limiting

API requests are limited to 100 requests per minute per IP address. 