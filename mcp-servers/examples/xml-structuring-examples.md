# XML Tag Structuring Examples

## Reasoning Template Creation
```javascript
// Create XML template for complex reasoning
create_xml_template({
  name: "Multi-Step Reasoning",
  description: "Template for structured AI reasoning processes",
  category: "reasoning",
  rootElement: "reasoning",
  elements: [
    {
      name: "problem",
      type: "content",
      required: true,
      description: "Problem statement"
    },
    {
      name: "analysis",
      type: "container",
      required: true,
      children: ["step", "consideration", "conclusion"]
    },
    {
      name: "step",
      type: "content",
      required: false,
      repeatable: true
    },
    {
      name: "solution",
      type: "content",
      required: true,
      description: "Final solution"
    }
  ],
  optimizationLevel: "advanced"
})
```

## XML Prompt Generation
```javascript
// Generate optimized XML prompt
generate_xml_prompt({
  templateId: "reasoning-template-id",
  variables: {
    problem: "Design a scalable microservices architecture",
    context: "E-commerce platform with 1M+ daily users"
  },
  optimizeForAI: true,
  includeMetadata: false
})
```

## Performance Optimization
```javascript
// Optimize XML structure for performance
optimize_xml_performance({
  templateId: "reasoning-template-id",
  xmlContent: "<reasoning>...</reasoning>",
  optimizationGoals: ["performance", "effectiveness", "readability"],
  maxIterations: 5
})
```
