import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faKey, faBook, faShieldAlt, faRocket, faServer, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

const ApiIntro = ({ apiSpec }) => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">{apiSpec.info.title}</h1>
        <p className="text-lg text-gray-600">{apiSpec.info.description}</p>
        
        {apiSpec.info.contact && (
          <div className="mt-4 text-sm text-gray-500">
            Contact: <a href={`mailto:${apiSpec.info.contact.email}`} className="text-indigo-600 hover:text-indigo-800">{apiSpec.info.contact.name}</a>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <Card 
          icon={faKey} 
          title="Authentication" 
          color="indigo"
        >
          <p className="mb-4">
            This API uses API Key authentication. Include your API key in the request headers.
          </p>
          <CodeBlock language="bash">
            {`# Example with curl
curl -X GET "${apiSpec.schemes[0]}://${apiSpec.host}${apiSpec.basePath}path/to/endpoint" \\
  -H "Authorization: Bearer YOUR_API_KEY"`}
          </CodeBlock>
        </Card>
        
        <Card 
          icon={faShieldAlt} 
          title="Rate Limits" 
          color="amber"
        >
          <p>
            To ensure service stability, the API enforces rate limits:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>100 requests per minute per API key</li>
            <li>10,000 requests per day per API key</li>
            <li>If you exceed these limits, you'll receive a 429 Too Many Requests response</li>
          </ul>
        </Card>
        
        <Card 
          icon={faServer} 
          title="Base URL" 
          color="emerald"
        >
          <p className="mb-3">
            All API requests should be made to:
          </p>
          <div className="bg-gray-100 p-3 rounded-md font-mono text-sm break-all">
            {`${apiSpec.schemes[0]}://${apiSpec.host}${apiSpec.basePath}`}
          </div>
        </Card>
        
        <Card 
          icon={faExclamationTriangle} 
          title="Error Handling" 
          color="red"
        >
          <p className="mb-3">
            The API uses standard HTTP status codes to indicate success or failure:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>200 - Success</li>
            <li>400 - Bad Request</li>
            <li>401 - Unauthorized</li>
            <li>404 - Not Found</li>
            <li>500 - Server Error</li>
          </ul>
        </Card>
      </div>
      
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-lg border border-indigo-100 mb-8">
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-1">
            <FontAwesomeIcon icon={faRocket} className="text-indigo-500 text-xl" />
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-semibold text-gray-800">Getting Started</h3>
            <p className="mt-2 text-gray-600">
              To start using the API, first sign up for an account and get your API key from the dashboard. 
              Then, make your first API call following the examples in the documentation.
            </p>
            <div className="mt-4">
              <a href="#" className="inline-flex items-center text-indigo-600 hover:text-indigo-800">
                <FontAwesomeIcon icon={faBook} className="mr-2" />
                View the complete documentation
              </a>
            </div>
          </div>
        </div>
      </div>
      
      <div className="border-t border-gray-200 pt-6">
        <h2 className="text-xl font-semibold mb-4">Available Endpoints</h2>
        <p className="text-gray-600 mb-4">
          Use the navigation menu on the left to explore all available API endpoints. 
          Each endpoint includes detailed documentation, request parameters, and example responses.
        </p>
      </div>
    </div>
  );
};

const Card = ({ icon, title, color, children }) => {
  const colorMap = {
    indigo: 'bg-indigo-100 text-indigo-600',
    amber: 'bg-amber-100 text-amber-600',
    emerald: 'bg-emerald-100 text-emerald-600',
    red: 'bg-red-100 text-red-600',
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4">
        <div className="flex items-center mb-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colorMap[color]}`}>
            <FontAwesomeIcon icon={icon} />
          </div>
          <h3 className="ml-3 text-lg font-semibold text-gray-800">{title}</h3>
        </div>
        <div className="text-gray-600">
          {children}
        </div>
      </div>
    </div>
  );
};

const CodeBlock = ({ language, children }) => {
  return (
    <div className="relative">
      <div className="absolute top-0 right-0 px-2 py-1 text-xs text-gray-500 bg-gray-100 rounded-bl-md">
        {language}
      </div>
      <pre className="bg-gray-800 text-gray-100 p-4 rounded-md overflow-x-auto text-sm mt-2">
        <code>{children}</code>
      </pre>
    </div>
  );
};

export default ApiIntro; 