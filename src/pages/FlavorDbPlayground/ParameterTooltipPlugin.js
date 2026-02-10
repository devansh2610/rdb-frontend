import React, { useState } from "react";

/**
 * Custom Swagger UI Plugin to add info buttons with tooltips for parameters
 * This enhances user experience by providing contextual help for each parameter
 */

const ParameterInfoTooltip = ({ param }) => {
  const [isHovered, setIsHovered] = useState(false);

  // Extract parameter information
  const paramName = param.get("name");
  const paramType = param.get("type") || param.getIn(["schema", "type"]) || "string";
  const paramDescription = param.get("description") || "No description available";
  const paramRequired = param.get("required") || false;
  const paramIn = param.get("in") || "query";
  const paramExample = param.get("x-example") || param.getIn(["schema", "example"]);

  // Generate example based on parameter name and type if not provided
  const getDefaultExample = () => {
    if (paramExample) return paramExample;
    
    const lowerName = paramName.toLowerCase();
    
    // Specific examples based on parameter names
    if (lowerName.includes("id")) {
      if (lowerName.includes("pubchem")) return "12345";
      if (lowerName.includes("receptor")) return "OR1A1";
      return "abc123";
    }
    if (lowerName.includes("name")) return "Vanillin";
    if (lowerName.includes("input") || lowerName.includes("query") || lowerName.includes("search")) {
      return "vanilla";
    }
    if (lowerName.includes("source")) return "Coffee";
    if (lowerName.includes("category")) return "Aromatic";
    
    // Default examples by type
    switch (paramType) {
      case "integer":
      case "number":
        return "123";
      case "boolean":
        return "true";
      case "array":
        return "[item1, item2]";
      default:
        return "example_value";
    }
  };

  const example = getDefaultExample();

  // Format parameter location for display
  const getLocationDisplay = (location) => {
    const locationMap = {
      path: "URL Path",
      query: "Query Parameter",
      header: "HTTP Header",
      body: "Request Body",
      formData: "Form Data"
    };
    return locationMap[location] || location;
  };

  return (
    <div 
      className="parameter-info-wrapper"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button 
        className="parameter-info-button"
        type="button"
        aria-label={`Information about ${paramName} parameter`}
      >
        ℹ️
      </button>
      
      {isHovered && (
        <div className="parameter-tooltip">
          <div className="tooltip-header">
            <strong>{paramName}</strong>
            {paramRequired && <span className="tooltip-required-badge">Required</span>}
          </div>
          
          <div className="tooltip-content">
            <div className="tooltip-section">
              <span className="tooltip-label">Purpose:</span>
              <span className="tooltip-value">{paramDescription}</span>
            </div>
            
            <div className="tooltip-section">
              <span className="tooltip-label">Type:</span>
              <span className="tooltip-value tooltip-type">{paramType}</span>
            </div>
            
            <div className="tooltip-section">
              <span className="tooltip-label">Location:</span>
              <span className="tooltip-value">{getLocationDisplay(paramIn)}</span>
            </div>
            
            {example && (
              <div className="tooltip-section">
                <span className="tooltip-label">Example:</span>
                <code className="tooltip-example">{example}</code>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Wrapper component for parameter row that includes the info button
 */
const ParameterRowWrapper = (Original, system) => (props) => {
  const param = props.param;
  
  return (
    <div className="parameter-row-with-info">
      <Original {...props} />
      <ParameterInfoTooltip param={param} />
    </div>
  );
};

/**
 * Swagger UI Plugin configuration
 * This plugin wraps the default parameter component with our custom info button
 */
const ParameterTooltipPlugin = () => {
  return {
    wrapComponents: {
      ParameterRow: ParameterRowWrapper
    }
  };
};

export default ParameterTooltipPlugin;
