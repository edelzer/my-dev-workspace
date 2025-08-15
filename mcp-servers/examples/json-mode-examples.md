# JSON Mode Configuration Examples

## Basic JSON Schema Configuration
```javascript
// Create a JSON configuration for API responses
create_json_config({
  name: "API Response Schema",
  description: "Standard API response format",
  schema: {
    type: "object",
    properties: {
      success: { type: "boolean" },
      data: { type: "object" },
      message: { type: "string" },
      timestamp: { type: "string", format: "date-time" }
    },
    required: ["success", "data"]
  },
  optimizationLevel: "standard"
})
```

## Advanced JSON Optimization
```javascript
// Optimize JSON output with schema validation
optimize_json_output({
  configId: "api-response-config-id",
  inputData: {
    success: true,
    data: { users: [1, 2, 3] },
    message: "Users retrieved successfully"
  },
  promptContext: "Generate API response for user list request",
  maxRetries: 3
})
```

## Workflow Integration
```javascript
// Create multi-step JSON workflow
create_workflow_integration({
  name: "API Processing Pipeline",
  configIds: ["validation-config", "processing-config", "response-config"],
  fallbackStrategy: "retry",
  maxRetries: 3,
  successThreshold: 0.9
})
```
