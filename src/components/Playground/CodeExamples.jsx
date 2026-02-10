import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faAngleLeft,
  faAngleRight,
  faArrowDown,
  faCheck,
  faCopy,
  faCode,
  faTerminal,
  faSyncAlt,
  faChevronLeft,
  faChevronRight
} from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import TryItPanel from './TryItPanel';
import java from '../../assets/java.png';
import python from '../../assets/python.png';
import node from '../../assets/node.png';
import ruby from '../../assets/ruby.png';
import shell from '../../assets/shell.png';


const CodeExamples = ({ path, method, parameters, requiresAuth, apiKey, spec, isLoading, apiResponse }) => {
  const [selectedLanguage, setSelectedLanguage] = useState('curl');
  const [copySuccess, setCopySuccess] = useState(false);
  const langTabsRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const languages = {
    curl: {
      name: 'cURL',
      logo: shell
    },
    nodejs: {
      name: 'Node.js',
      logo: node
    },
    javascript: {
      name: 'JavaScript',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/6/6a/JavaScript-logo.png'
    },
    python: {
      name: 'Python',
      logo: python
    },
    ruby: {
      name: 'Ruby',
      logo: ruby
    },
    php: {
      name: 'PHP',
      logo: 'https://www.php.net/images/logos/new-php-logo.svg'
    },
    java: {
      name: 'Java',
      logo: java
    },
    go: {
      name: 'Go',
      logo: 'https://go.dev/blog/go-brand/Go-Logo/SVG/Go-Logo_Blue.svg'
    },
  };

  useEffect(() => {
    const checkScroll = () => {
      if (langTabsRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = langTabsRef.current;
        setCanScrollLeft(scrollLeft > 0);
        setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
      }
    };

    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [selectedLanguage]);

  const scrollTabs = (direction) => {
    if (langTabsRef.current) {
      const scrollAmount = direction === 'left' ? -100 : 100;
      langTabsRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const generateCodeExample = (language) => {
    const baseUrl = `${spec.schemes[0]}://${spec.host}${spec.basePath}${path}`;
    const authHeader = requiresAuth && apiKey ? `Bearer ${apiKey}` : 'YOUR_API_KEY';

    // Get body parameter with actual value if available
    const bodyParam = parameters.find(p => p.in === 'body');
    let bodyParamExample = null;

    if (bodyParam) {
      if (bodyParam.value) {
        try {
          bodyParamExample = bodyParam.value;
        } catch (e) {
          bodyParamExample = '{"example": "value", "nested": {"key": "value"}}';
        }
      } else {
        bodyParamExample = '{"example": "value", "nested": {"key": "value"}}';
      }
    }

    const pathParams = {};
    parameters.filter(p => p.in === 'path').forEach(param => {
      // Use the value passed from ApiEndpoint
      pathParams[param.name] = param.value || param.example || `{${param.name}}`;
    });

    const queryParams = {};
    parameters.filter(p => p.in === 'query').forEach(param => {
      queryParams[param.name] = param.value || param.example || `{${param.name}}`;
    });

    let url = baseUrl;
    Object.entries(pathParams).forEach(([key, value]) => {
      url = url.replace(`{${key}}`, value);
    });

    const queryString = Object.entries(queryParams)
      .filter(([_, value]) => value !== undefined && value !== '')
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');

    if (queryString) {
      url += `?${queryString}`;
    }

    switch (language) {
      case 'curl':
        let curlCmd = `curl -X ${method.toUpperCase()} "${url}"`;

        if (requiresAuth) {
          curlCmd += ` \\\n  -H "Authorization: ${authHeader}"`;
        }

        curlCmd += ` \\\n  -H "Content-Type: application/json"`;

        if (bodyParamExample) {
          curlCmd += ` \\\n  -d '${bodyParamExample}'`;
        }

        return curlCmd;

      case 'nodejs':
        let nodeCode = `// Using Node.js with Axios\n`;
        nodeCode += `const axios = require('axios');\n\n`;
        nodeCode += `const config = {\n`;
        nodeCode += `  method: '${method.toUpperCase()}',\n`;
        nodeCode += `  url: '${url}',\n`;
        nodeCode += `  headers: {\n`;
        nodeCode += `    'Content-Type': 'application/json',\n`;

        if (requiresAuth) {
          nodeCode += `    'Authorization': '${authHeader}',\n`;
        }

        nodeCode += `  },\n`;

        if (bodyParamExample) {
          nodeCode += `  data: ${bodyParamExample},\n`;
        }

        nodeCode += `};\n\n`;
        nodeCode += `axios(config)\n`;
        nodeCode += `  .then(response => console.log(JSON.stringify(response.data)))\n`;
        nodeCode += `  .catch(error => console.error(error));\n`;

        return nodeCode;

      case 'javascript':
        let jsCode = `// Using fetch API\n`;
        jsCode += `const options = {\n`;
        jsCode += `  method: '${method.toUpperCase()}',\n`;
        jsCode += `  headers: {\n`;
        jsCode += `    'Content-Type': 'application/json',\n`;

        if (requiresAuth) {
          jsCode += `    'Authorization': '${authHeader}',\n`;
        }

        jsCode += `  },\n`;

        if (bodyParamExample) {
          jsCode += `  body: JSON.stringify(${bodyParamExample}),\n`;
        }

        jsCode += `};\n\n`;
        jsCode += `fetch('${url}', options)\n`;
        jsCode += `  .then(response => response.json())\n`;
        jsCode += `  .then(data => console.log(data))\n`;
        jsCode += `  .catch(error => console.error('Error:', error));`;

        return jsCode;

      case 'python':
        let pyCode = `import requests\n\n`;
        pyCode += `url = "${url}"\n`;

        if (Object.keys(queryParams).length > 0) {
          pyCode += `\n# Query parameters can also be passed as a dictionary to the params argument\n`;
          pyCode += `params = ${JSON.stringify(queryParams, null, 2).replace(/"/g, "'")}\n`;
        }

        pyCode += `\nheaders = {\n`;
        pyCode += `    "Content-Type": "application/json",\n`;

        if (requiresAuth) {
          pyCode += `    "Authorization": "${authHeader}",\n`;
        }

        pyCode += `}\n\n`;

        if (bodyParamExample) {
          pyCode += `payload = ${bodyParamExample.replace(/"/g, "'")}\n\n`;
        }

        pyCode += `response = requests.${method.toLowerCase()}(\n`;
        pyCode += `    url,\n`;

        if (Object.keys(queryParams).length > 0) {
          pyCode += `    params=params,\n`;
        }

        if (bodyParamExample) {
          pyCode += `    json=payload,\n`;
        }

        pyCode += `    headers=headers\n`;
        pyCode += `)\n\n`;
        pyCode += `print(response.json())`;

        return pyCode;

      case 'ruby':
        let rubyCode = `require 'uri'\nrequire 'net/http'\nrequire 'json'\n\n`;
        rubyCode += `url = URI("${url}")\n\n`;
        rubyCode += `http = Net::HTTP.new(url.host, url.port)\n`;
        rubyCode += `http.use_ssl = ${baseUrl.startsWith('https')}\n\n`;
        rubyCode += `request = Net::HTTP::${method.charAt(0).toUpperCase() + method.slice(1).toLowerCase()}.new(url)\n`;
        rubyCode += `request["Content-Type"] = "application/json"\n`;

        if (requiresAuth) {
          rubyCode += `request["Authorization"] = "${authHeader}"\n`;
        }

        if (bodyParamExample) {
          rubyCode += `request.body = ${bodyParamExample.replace(/"/g, "'")}.to_json\n`;
        }

        rubyCode += `\nresponse = http.request(request)\n`;
        rubyCode += `puts response.read_body`;

        return rubyCode;

      case 'php':
        let phpCode = `<?php\n\n$curl = curl_init();\n\n`;
        phpCode += `curl_setopt_array($curl, [\n`;
        phpCode += `    CURLOPT_URL => "${url}",\n`;
        phpCode += `    CURLOPT_RETURNTRANSFER => true,\n`;
        phpCode += `    CURLOPT_CUSTOMREQUEST => "${method.toUpperCase()}",\n`;

        if (bodyParamExample) {
          phpCode += `    CURLOPT_POSTFIELDS => '${bodyParamExample}',\n`;
        }

        phpCode += `    CURLOPT_HTTPHEADER => [\n`;
        phpCode += `        "Content-Type: application/json",\n`;

        if (requiresAuth) {
          phpCode += `        "Authorization: ${authHeader}",\n`;
        }

        phpCode += `    ],\n`;
        phpCode += `]);\n\n`;
        phpCode += `$response = curl_exec($curl);\n$err = curl_error($curl);\n\n`;
        phpCode += `curl_close($curl);\n\n`;
        phpCode += `if ($err) {\n    echo "cURL Error #:" . $err;\n} else {\n    echo $response;\n}`;

        return phpCode;

      case 'java':
        let javaCode = `import java.io.IOException;\n`;
        javaCode += `import java.net.URI;\n`;
        javaCode += `import java.net.http.HttpClient;\n`;
        javaCode += `import java.net.http.HttpRequest;\n`;
        javaCode += `import java.net.http.HttpResponse;\n\n`;
        javaCode += `public class ApiExample {\n`;
        javaCode += `    public static void main(String[] args) {\n`;
        javaCode += `        HttpClient client = HttpClient.newHttpClient();\n`;

        if (bodyParamExample) {
          javaCode += `        String requestBody = ${JSON.stringify(bodyParamExample)};\n\n`;
        }

        javaCode += `        HttpRequest request = HttpRequest.newBuilder()\n`;
        javaCode += `            .uri(URI.create("${url}"))\n`;

        if (bodyParamExample) {
          javaCode += `            .${method.toLowerCase()}(HttpRequest.BodyPublishers.ofString(requestBody))\n`;
        } else if (method.toLowerCase() === 'get') {
          javaCode += `            .GET()\n`;
        } else if (method.toLowerCase() === 'delete') {
          javaCode += `            .DELETE()\n`;
        } else {
          javaCode += `            .method("${method.toUpperCase()}", HttpRequest.BodyPublishers.noBody())\n`;
        }

        javaCode += `            .header("Content-Type", "application/json")\n`;

        if (requiresAuth) {
          javaCode += `            .header("Authorization", "${authHeader}")\n`;
        }

        javaCode += `            .build();\n\n`;
        javaCode += `        try {\n`;
        javaCode += `            HttpResponse<String> response = client.send(request,\n`;
        javaCode += `                HttpResponse.BodyHandlers.ofString());\n`;
        javaCode += `            System.out.println(response.body());\n`;
        javaCode += `        } catch (IOException | InterruptedException e) {\n`;
        javaCode += `            e.printStackTrace();\n`;
        javaCode += `        }\n`;
        javaCode += `    }\n`;
        javaCode += `}`;

        return javaCode;

      case 'go':
        let goCode = `package main\n\n`;
        goCode += `import (\n`;
        goCode += `    "fmt"\n`;
        goCode += `    "io/ioutil"\n`;
        goCode += `    "net/http"\n`;

        if (bodyParamExample) {
          goCode += `    "strings"\n`;
        }

        goCode += `)\n\n`;
        goCode += `func main() {\n`;

        if (bodyParamExample) {
          goCode += `    payload := \`${bodyParamExample}\`\n`;
          goCode += `    req, err := http.NewRequest("${method.toUpperCase()}", "${url}", strings.NewReader(payload))\n`;
        } else {
          goCode += `    req, err := http.NewRequest("${method.toUpperCase()}", "${url}", nil)\n`;
        }

        goCode += `    if err != nil {\n`;
        goCode += `        fmt.Println(err)\n`;
        goCode += `        return\n`;
        goCode += `    }\n\n`;
        goCode += `    req.Header.Add("Content-Type", "application/json")\n`;

        if (requiresAuth) {
          goCode += `    req.Header.Add("Authorization", "${authHeader}")\n`;
        }

        goCode += `\n    client := &http.Client{}\n`;
        goCode += `    resp, err := client.Do(req)\n`;
        goCode += `    if err != nil {\n`;
        goCode += `        fmt.Println(err)\n`;
        goCode += `        return\n`;
        goCode += `    }\n`;
        goCode += `    defer resp.Body.Close()\n\n`;
        goCode += `    body, err := ioutil.ReadAll(resp.Body)\n`;
        goCode += `    if err != nil {\n`;
        goCode += `        fmt.Println(err)\n`;
        goCode += `        return\n`;
        goCode += `    }\n\n`;
        goCode += `    fmt.Println(string(body))\n`;
        goCode += `}`;

        return goCode;

      default:
        return "// Code example not available for this language";
    }
  };

  const codeExample = generateCodeExample(selectedLanguage);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeExample);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-2 border-b border-gray-700 flex-shrink-0">
        <div className="flex items-center">
          <FontAwesomeIcon icon={faCode} className="mr-2 text-indigo-400" />
          <h3 className="text-xs font-medium text-gray-200">Code Examples</h3>
        </div>
      </div>

      <div className="flex items-center px-1 pt-2 border-b border-gray-700 flex-shrink-0">
        <button
          onClick={() => scrollTabs('left')}
          className={`text-gray-400 hover:text-white px-1 flex-shrink-0 ${canScrollLeft ? '' : 'cursor-default'}`}
          disabled={!canScrollLeft}
        >
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>

        <div ref={langTabsRef} className="flex overflow-x-auto hide-scrollbar flex-1">
          {Object.entries(languages).map(([key, lang]) => (
            <button
              key={key}
              className={`px-2 py-1 mx-1 text-xs font-medium rounded-t-md transition-colors ${selectedLanguage === key
                  ? 'bg-gray-700 text-white border-b-2 border-indigo-400'
                  : 'text-gray-400 hover:bg-gray-700 hover:text-gray-200'
                }`}
              onClick={() => setSelectedLanguage(key)}
            >
              <span className="flex items-center">
                <span className="w-4 h-4 flex items-center justify-center bg-gray-800 rounded mr-1 overflow-hidden">
                  <img
                    src={lang.logo}
                    alt={`${lang.name} logo`}
                    className="w-full h-full object-contain p-0.5"
                  />
                </span>
                <span className="text-xs">{lang.name}</span>
              </span>
            </button>
          ))}
        </div>

        <button
          onClick={() => scrollTabs('right')}
          className={`text-gray-400 hover:text-white px-1 flex-shrink-0 ${canScrollRight ? '' : 'cursor-default'}`}
          disabled={!canScrollRight}
        >
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
      </div>

      <div className="flex-grow overflow-hidden flex flex-col">
        <div className="relative h-[30%] overflow-hidden">
          <pre className="p-3 overflow-x-auto overflow-y-auto text-xs text-gray-300 font-mono whitespace-pre h-full">
            <code>{codeExample}</code>
          </pre>

          <button
            onClick={handleCopyCode}
            className="absolute bottom-2 right-2 p-1 bg-gray-700 rounded hover:bg-gray-600 transition-colors"
            aria-label="Copy code"
          >
            <FontAwesomeIcon
              icon={copySuccess ? faCheck : faCopy}
              className={copySuccess ? 'text-green-400' : 'text-gray-400'}
              size="sm"
            />
          </button>

          {copySuccess && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-8 right-2 bg-gray-700 text-gray-200 text-xs py-1 px-2 rounded"
            >
              Copied!
            </motion.div>
          )}
        </div>
        <div className="border-t border-gray-700 h-[70%] flex flex-col overflow-hidden">
          <div className="p-1 bg-gray-900 flex-shrink-0">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-medium text-gray-300 flex items-center">
                <FontAwesomeIcon icon={faTerminal} className="mr-1" />
                Response
                {isLoading && (
                  <FontAwesomeIcon icon={faSyncAlt} className="ml-2 animate-spin text-indigo-400" />
                )}
              </h3>

              <div className="flex items-center gap-2 text-xs">
                <span className="inline-flex items-center px-2 py-0.5 rounded font-medium bg-green-500 text-white">
                  200 OK
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded font-medium bg-amber-500 text-white">
                  404 Not Found
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded font-medium bg-red-500 text-white">
                  500 Server Error
                </span>
              </div>
            </div>
          </div>

          <div className="p-2 flex-grow overflow-hidden h-full">
            <div className="h-full">
              <TryItPanel
                response={apiResponse}
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeExamples; 