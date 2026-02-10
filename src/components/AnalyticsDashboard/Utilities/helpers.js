import { scaleOrdinal } from 'd3-scale';
import { interpolateRainbow, interpolateBlues } from 'd3-scale-chromatic';

export const colorScale = scaleOrdinal().range(Array.from({ length: 10 }, (_, i) => interpolateRainbow(i / 10)));
export const blueScale = scaleOrdinal().range(Array.from({ length: 10 }, (_, i) => interpolateBlues(0.3 + (i * 0.07))));

export const detectAnomalies = (data, threshold = 1.5) => {
  if (!data || data.length < 3) return [];
  
  const values = data.map(d => d.requests);
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const stdDev = Math.sqrt(values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length);
  
  return data.map((item, index) => {
    const zScore = Math.abs((item.requests - mean) / stdDev);
    return {
      ...item,
      isAnomaly: zScore > threshold
    };
  });
};

export const generateAnalyticsData = (start, end, includeAnomalies = false) => {
  const hoursDiff = Math.ceil((end - start) / (1000 * 60 * 60));
  const is24hView = hoursDiff <= 24;
  
  const formatDateTime = (date) => {
    if (is24hView) {
      return date.getHours().toString().padStart(2, '0') + ':' + 
             date.getMinutes().toString().padStart(2, '0');
    } else {
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      
      if (days <= 7) {
        const options = { weekday: 'short', day: 'numeric', month: 'short' };
        return date.toLocaleDateString('en-IN', options);
      } else if (days <= 31) {
        const options = { day: 'numeric', month: 'short' };
        return date.toLocaleDateString('en-IN', options);
      } else {
        const options = { day: 'numeric', month: 'short' };
        return date.toLocaleDateString('en-IN', options);
      }
    }
  };
  
  let usageData;
  
  if (is24hView) {
    const now = new Date();
    
    usageData = Array.from({ length: 24 }, (_, i) => {
      const hourOffset = i - 23;
      const hour = new Date(now.getTime() + (hourOffset * 3600000));
      
      const isBusinessHour = hour.getHours() >= 9 && hour.getHours() <= 18;
      
      const isInFuture = hour > now;
      
      const baseRequests = isInFuture 
        ? null 
        : (isBusinessHour 
            ? Math.floor(Math.random() * 80) + 40
            : Math.floor(Math.random() * 30) + 10);
      
      return {
        date: formatDateTime(hour),
        timestamp: hour.getTime(),
        requests: baseRequests,
        errors: isInFuture ? null : Math.floor(Math.random() * (baseRequests ? baseRequests * 0.05 : 0)),
        latency: isInFuture ? null : Math.floor(Math.random() * 300) + 50,
        isLive: i === 23
      };
    });
  } else {
    const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    
    usageData = Array.from({ length: daysDiff }, (_, i) => {
      const date = new Date(start.getTime() + (i * 86400000));
      
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      
      const baseRequests = isWeekend 
        ? Math.floor(Math.random() * 300) + 100
        : Math.floor(Math.random() * 500) + 200;
      
      return {
        date: formatDateTime(date),
        timestamp: date.getTime(),
        requests: baseRequests,
        errors: Math.floor(Math.random() * 20),
        latency: Math.floor(Math.random() * 300) + 50
      };
    });
  }
  
  const processedData = typeof detectAnomalies === 'function' 
    ? detectAnomalies(usageData) 
    : usageData;
  
  let prevPeriodData;
  
  if (is24hView) {
    const now = new Date();
    
    prevPeriodData = Array.from({ length: 24 }, (_, i) => {
      const hourOffset = i - 47;
      const hour = new Date(now.getTime() + (hourOffset * 3600000));
      
      const isBusinessHour = hour.getHours() >= 9 && hour.getHours() <= 18;
      
      return {
        date: formatDateTime(hour),
        timestamp: hour.getTime(),
        requests: isBusinessHour 
          ? Math.floor(Math.random() * 75) + 35
          : Math.floor(Math.random() * 25) + 8,
        errors: Math.floor(Math.random() * 8),
        latency: Math.floor(Math.random() * 320) + 45
      };
    });
  } else {
    const periodLength = end.getTime() - start.getTime();
    const prevStart = new Date(start.getTime() - periodLength);
    const prevEnd = new Date(end.getTime() - periodLength);
    const prevDaysDiff = Math.ceil((prevEnd - prevStart) / (1000 * 60 * 60 * 24));
    
    prevPeriodData = Array.from({ length: prevDaysDiff }, (_, i) => {
      const date = new Date(prevStart.getTime() + (i * 86400000));
      
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      
      return {
        date: formatDateTime(date),
        timestamp: date.getTime(),
        requests: isWeekend 
          ? Math.floor(Math.random() * 280) + 90
          : Math.floor(Math.random() * 480) + 180,
        errors: Math.floor(Math.random() * 18),
        latency: Math.floor(Math.random() * 320) + 45
      };
    });
  }
  
  if (includeAnomalies) {
    const validDataPoints = usageData.filter(d => d.requests !== null);
    if (validDataPoints.length > 0) {
      const spikeIndex = Math.floor(Math.random() * validDataPoints.length);
      const spikePoint = usageData.indexOf(validDataPoints[spikeIndex]);
      usageData[spikePoint].requests = Math.floor(usageData[spikePoint].requests * 2.5);
      
      const errorIndex = Math.floor(Math.random() * validDataPoints.length);
      const errorPoint = usageData.indexOf(validDataPoints[errorIndex]);
      usageData[errorPoint].errors = Math.floor(usageData[errorPoint].errors * 5);
    }
  }

  return {
    usage: processedData,
    prevPeriodUsage: prevPeriodData,
    endpoints: [
      { endpoint: 'recipe', count: 2450, avgLatency: 142, trend: 5.2 },
      { endpoint: 'flavor', count: 1890, avgLatency: 178, trend: -2.1 },
      { endpoint: 'sustainability', count: 1560, avgLatency: 210, trend: 12.8 },
      { endpoint: 'dietrx', count: 1250, avgLatency: 165, trend: 3.7 },
      { endpoint: 'recipe2.0', count: 980, avgLatency: 132, trend: 1.2 },
      { endpoint: 'flavor2.0', count: 580, avgLatency: 112, trend: 1.0 },
    ],
    errors: [
      { code: '400', count: 45, description: 'Bad Request' },
      { code: '401', count: 28, description: 'Unauthorized' },
      { code: '404', count: 62, description: 'Not Found' },
      { code: '500', count: 15, description: 'Server Error' },
    ],
    latency: [
      { endpoint: 'recipe', minLatency: 120, maxLatency: 300, avgLatency: 180 },
      { endpoint: 'flavor', minLatency: 80, maxLatency: 220, avgLatency: 125 },
      { endpoint: 'sustain', minLatency: 150, maxLatency: 450, avgLatency: 240 },
      { endpoint: 'dietrx', minLatency: 110, maxLatency: 280, avgLatency: 165 },
      { endpoint: 'recipe2', minLatency: 90, maxLatency: 320, avgLatency: 185 },
      { endpoint: 'flavor2', minLatency: 200, maxLatency: 400, avgLatency: 300 }
    ],
    performanceMetrics: [
      { metric: 'Response Time', value: 187, maxValue: 500 },
      { metric: 'Success Rate', value: 98.7, maxValue: 100 },
      { metric: 'CPU Usage', value: 42, maxValue: 100 },
      { metric: 'Memory Usage', value: 68, maxValue: 100 },
      { metric: 'Cache Hit Rate', value: 76, maxValue: 100 },
    ]
  };
}; 