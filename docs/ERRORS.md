# Errors

## Expected
- Validation errors return 400 with error details
- Unauthorized returns 401
- Forbidden returns 403
- Not found returns 404

## Fatal
- Database connection failures
- Redis connection failures
- LiteLLM gateway failures
