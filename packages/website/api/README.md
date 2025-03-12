# VanBlog API Layer

This directory contains the API layer for the VanBlog website. It provides a clean, consistent interface for interacting with the VanBlog backend API.

## Architecture

The API layer follows a service-oriented architecture with the following components:

### Core Components

- **client.ts**: Low-level API client with error handling, caching, and retry logic
- **service.ts**: Service layer that maps to all public API endpoints
- **types.ts**: Shared type definitions specific to the API layer

### Domain-Specific API Wrappers

- **getArticles.ts**: Article-related API functions including search functionality
- **pageview.ts**: Pageview tracking functions (client and server)
- **getArticleViewer.ts**: Article viewer statistics
- **getAllData.ts**: Site metadata and custom pages

## Public API Endpoints

The API layer interacts with the following public endpoints:

- `GET /api/public/article` - Get articles with pagination and filtering
- `GET /api/public/article/{id}` - Get a specific article by ID
- `POST /api/public/article/{id}` - Get an encrypted article with password
- `GET /api/public/article/viewer/{id}` - Get viewer statistics for an article
- `GET /api/public/search` - Search articles
- `GET /api/public/timeline` - Get articles organized by timeline
- `GET /api/public/category` - Get articles organized by category
- `GET /api/public/tag` - Get articles organized by tag
- `GET /api/public/tag/{name}` - Get articles for a specific tag
- `GET /api/public/meta` - Get site metadata
- `GET /api/public/viewer` - Get site viewer statistics
- `POST /api/public/viewer` - Update site viewer statistics
- `GET /api/public/customPage/all` - Get all custom pages
- `GET /api/public/customPage` - Get a specific custom page

## Usage Examples

```typescript
// Using the ApiService directly (recommended for new code)
import { apiService } from './api/service';

// Get articles with pagination
const articles = await apiService.getArticles({ page: 1, pageSize: 10 });

// Get article by ID
const article = await apiService.getArticleByIdOrPathname(123);

// Update pageview
const pageview = await apiService.updatePageView({ isNew: true, isNewByPath: true });

// Using the domain-specific wrappers (for backward compatibility)
import { getArticlesByOption, getArticleByIdOrPathname, getArticlesBySearch } from './api/getArticles';
import { updatePageview } from './api/pageview';

// Get articles
const articles = await getArticlesByOption({ page: 1, pageSize: 10 });

// Get article by ID
const article = await getArticleByIdOrPathname(123);

// Search articles
const searchResults = await getArticlesBySearch('query');

// Update pageview
const pageview = await updatePageview('/some-path');
```

## Error Handling

All API functions include error handling. They will:

1. Automatically retry failed requests (configurable)
2. Provide detailed error information
3. Return sensible defaults when appropriate
4. Log errors to the console for debugging

## Caching

The API client includes a built-in caching system to reduce redundant requests. The cache duration is configurable.

## Development

When adding new API endpoints:

1. Add the endpoint to the ApiService class in `service.ts`
2. Add any required types to `types.ts`
3. Update this README with the new endpoint 