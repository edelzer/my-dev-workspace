# Quick Start Guide: AI Optimization Systems

## 🚀 Get Started in 5 Minutes

### 1. Verify Installation
Check that both servers are configured in Claude Code:
```bash
# Servers should be listed in .claude/settings.local.json
```

### 2. Create Your First JSON Configuration
```javascript
// Basic API response schema
const result = await create_json_config({
  name: "My API Response",
  description: "Standard response format",
  schema: {
    type: "object",
    properties: {
      success: { type: "boolean" },
      message: { type: "string" },
      data: { type: "object" }
    },
    required: ["success", "message"]
  }
});
```

### 3. Create Your First XML Template  
```javascript
// Simple reasoning template
const template = await create_xml_template({
  name: "Basic Reasoning",
  rootElement: "thinking",
  elements: [
    { name: "question", type: "content", required: true },
    { name: "analysis", type: "content", required: true },
    { name: "answer", type: "content", required: true }
  ]
});
```

### 4. Optimize Your AI Interactions
```javascript
// Use JSON optimization
const optimized = await optimize_json_output({
  configId: "your-config-id",
  inputData: yourRawData,
  promptContext: "API response for user data"
});

// Generate XML prompt
const prompt = await generate_xml_prompt({
  templateId: "your-template-id",  
  variables: {
    question: "How do I optimize AI responses?",
    context: "Structured output generation"
  }
});
```

### 5. Monitor & Analyze
```javascript
// Get analytics
const analytics = await get_optimization_analytics();
const xmlAnalytics = await get_xml_analytics();
```

## 💡 Pro Tips

1. **Start Simple**: Begin with basic schemas and templates
2. **Iterate Often**: Use analytics to improve configurations
3. **Monitor Performance**: Track success rates and response times
4. **Leverage Templates**: Reuse successful XML patterns
5. **Optimize Gradually**: Increase complexity as you learn

## 🆘 Need Help?

- Check the examples directory for more samples
- Review the comprehensive README for detailed documentation
- Monitor logs for troubleshooting information
- Use analytics tools to identify optimization opportunities

Happy optimizing! 🎯
