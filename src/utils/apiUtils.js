/**
 * Organizes API endpoints by their tags
 * @param {Object} apiSpec - The OpenAPI specification object
 * @returns {Object} - Endpoints organized by tags
 */
export const categorizeEndpoints = (apiSpec) => {
  const categorized = {};
  
  // Initialize categories from tags
  if (apiSpec.tags) {
    apiSpec.tags.forEach(tag => {
      categorized[tag.name] = {
        description: tag.description,
        endpoints: []
      };
    });
  }
  
  // Add "Other" category for endpoints without tags
  categorized["Other"] = {
    description: "Other API endpoints",
    endpoints: []
  };

  // Categorize each endpoint
  Object.entries(apiSpec.paths || {}).forEach(([path, pathItem]) => {
    Object.entries(pathItem).forEach(([method, operation]) => {
      // Skip non-HTTP methods like parameters
      if (!['get', 'post', 'put', 'delete', 'patch', 'options', 'head'].includes(method)) {
        return;
      }

      const tags = operation.tags || ['Other'];
      
      // Create endpoint object
      const endpoint = {
        path,
        method,
        summary: operation.summary || '',
        description: operation.description || '',
        alias: operation.alias || '',
        deprecated: operation.deprecated || false,
        parameters: operation.parameters || [],
        responses: operation.responses || {},
        security: operation.security || pathItem.security || apiSpec.security || []
      };
      
      // Add to each relevant category
      tags.forEach(tag => {
        if (!categorized[tag]) {
          categorized[tag] = {
            description: "",
            endpoints: []
          };
        }
        categorized[tag].endpoints.push(endpoint);
      });
    });
  });
  
  return categorized;
};

/**
 * Filters endpoints based on search query
 * @param {Object} groupedEndpoints - Endpoints organized by tags
 * @param {string} query - Search query
 * @returns {Object} - Filtered endpoints
 */
export const filterEndpoints = (groupedEndpoints, query) => {
  const lowerQuery = query.toLowerCase();
  const filtered = {};
  
  Object.entries(groupedEndpoints).forEach(([tag, category]) => {
    const matchingEndpoints = category.endpoints.filter(endpoint => {
      return (
        endpoint.path.toLowerCase().includes(lowerQuery) ||
        endpoint.summary.toLowerCase().includes(lowerQuery) ||
        endpoint.description.toLowerCase().includes(lowerQuery) ||
        endpoint.method.toLowerCase().includes(lowerQuery) ||
        (endpoint.alias && endpoint.alias.toLowerCase().includes(lowerQuery))
      );
    });
    
    if (matchingEndpoints.length > 0) {
      filtered[tag] = {
        description: category.description,
        endpoints: matchingEndpoints
      };
    }
  });
  
  return filtered;
};

/**
 * Generates example code for an API endpoint
 * @param {string} path - The endpoint path
 * @param {string} method - The HTTP method
 * @param {Object} parameters - The endpoint parameters
 * @param {Object} apiSpec - The full API spec
 * @returns {Object} - Code samples in different languages
 */
export const generateCodeSamples = (path, method, parameters, apiSpec) => {
  const host = apiSpec.host || 'api.example.com';
  const basePath = apiSpec.basePath || '';
  const scheme = (apiSpec.schemes && apiSpec.schemes[0]) || 'https';
  const url = `${scheme}://${host}${basePath}${path}`;
  
  // Sample values for parameters
  const queryParams = parameters.filter(p => p.in === 'query')
    .map(p => `${p.name}=${p.example || 'value'}`).join('&');
  
  const queryString = queryParams ? `?${queryParams}` : '';
  const fullUrl = `${url}${queryString}`;
  
  // Get security requirements
  const endpointSecurity = apiSpec.paths[path][method].security || apiSpec.security || [];
  const authHeader = endpointSecurity.length > 0 ? 'Authorization: Bearer YOUR_API_KEY' : '';
  
  return {
    curl: `curl -X ${method.toUpperCase()} "${fullUrl}" ${authHeader ? `-H "${authHeader}"` : ''}`,
    
    javascript: `// Using fetch API
fetch("${fullUrl}", {
  method: "${method.toUpperCase()}"${authHeader ? `,
  headers: {
    "${authHeader.split(': ')[0]}": "${authHeader.split(': ')[1]}"
  }` : ''}
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`,
    
    python: `import requests

url = "${fullUrl}"
${authHeader ? `headers = {
    "${authHeader.split(': ')[0]}": "${authHeader.split(': ')[1]}"
}

response = requests.${method.toLowerCase()}(url, headers=headers)` : `response = requests.${method.toLowerCase()}(url)`}
print(response.json())`,
    
    node: `const axios = require('axios');

axios.${method.toLowerCase()}('${fullUrl}'${authHeader ? `, {
  headers: {
    ${authHeader.split(': ')[0].toLowerCase()}: '${authHeader.split(': ')[1]}'
  }
}` : ''})
  .then(response => {
    console.log(response.data);
  })
  .catch(error => {
    console.error('Error:', error);
  });`,
  };
};

/**
 * Formats parameter type information
 * @param {Object} parameter - Parameter object from OpenAPI spec
 * @returns {string} - Formatted type information
 */
export const formatParameterType = (parameter) => {
  if (!parameter) return 'unknown';
  
  if (parameter.type) {
    let typeString = parameter.type;
    
    if (parameter.format) {
      typeString += ` (${parameter.format})`;
    }
    
    if (parameter.enum) {
      typeString += ` - enum: [${parameter.enum.join(', ')}]`;
    }
    
    return typeString;
  }
  
  if (parameter.schema) {
    if (parameter.schema.$ref) {
      // Extract type name from reference
      const refName = parameter.schema.$ref.split('/').pop();
      return refName;
    }
    
    if (parameter.schema.type) {
      return parameter.schema.type;
    }
  }
  
  return 'unknown';
};

/**
 * Determines the HTTP method color
 * @param {string} method - HTTP method
 * @returns {string} - Tailwind CSS color class
 */
export const getMethodColor = (method) => {
  switch (method.toLowerCase()) {
    case 'get': return 'bg-blue-500';
    case 'post': return 'bg-green-500';
    case 'put': return 'bg-amber-500';
    case 'delete': return 'bg-red-500';
    case 'patch': return 'bg-purple-500';
    default: return 'bg-gray-500';
  }
};

/**
 * Formats a path for display
 * @param {string} path - API path
 * @returns {string} - Formatted path with parameters highlighted
 */
export const formatPath = (path) => {
  return path.replace(/{([^}]+)}/g, '<span class="text-amber-500 font-semibold">{$1}</span>');
}; 