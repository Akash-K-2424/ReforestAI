/**
 * Export Service
 * Provides functionality to export analysis results as PDF, CSV, or JSON
 */

/**
 * Export location data as CSV
 */
export const exportToCSV = (location) => {
  if (!location || !location.features) {
    throw new Error('Invalid location data');
  }

  const { features, name, score, priority, priorityLevel, priorityColor } = location;
  
  // Create CSV headers
  const headers = [
    'Location Name',
    'Priority Level',
    'Priority Color',
    'Score',
    'NDVI',
    'NDWI',
    'Vegetation Density (%)',
    'Soil Moisture',
    'Elevation (m)',
    'Land Use Type',
    'Data Source',
    'Collection Date',
    'Grid Resolution'
  ];

  // Create CSV rows
  const rows = [
    [
      name || 'N/A',
      priorityLevel || 'N/A',
      priorityColor || 'N/A',
      score || 'N/A',
      features.ndvi?.toFixed(3) || 'N/A',
      features.ndwi?.toFixed(3) || 'N/A',
      features.vegetation_density?.toFixed(2) || 'N/A',
      features.soil_moisture?.toFixed(3) || 'N/A',
      features.elevation?.toFixed(1) || 'N/A',
      features.land_use_type || 'N/A',
      features.data_source || 'N/A',
      features.collection_date || 'N/A',
      features.grid_resolution || 'N/A'
    ]
  ];

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `reforestation-analysis-${name?.replace(/\s+/g, '-') || 'location'}-${Date.now()}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

/**
 * Export location data as JSON
 */
export const exportToJSON = (location) => {
  if (!location) {
    throw new Error('Invalid location data');
  }

  const exportData = {
    exportDate: new Date().toISOString(),
    location: {
      name: location.name,
      coordinates: location.lat && location.lng ? {
        latitude: location.lat,
        longitude: location.lng
      } : null,
      priority: {
        level: location.priorityLevel,
        color: location.priorityColor,
        score: location.score
      },
      features: location.features || {},
      analysis: {
        carbonSequestration: location.carbonSequestration || null,
        airQualityImprovement: location.airQualityImprovement || null,
        floodRiskReduction: location.floodRiskReduction || null,
        groundwaterRecharge: location.groundwaterRecharge || null
      }
    }
  };

  const jsonContent = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `reforestation-analysis-${location.name?.replace(/\s+/g, '-') || 'location'}-${Date.now()}.json`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

/**
 * Export location data as formatted text (for printing or sharing)
 */
export const exportToText = (location) => {
  if (!location || !location.features) {
    throw new Error('Invalid location data');
  }

  const { features, name, score, priorityLevel, priorityColor } = location;
  
  const textContent = `
REFORESTATION ANALYSIS REPORT
===============================
Generated: ${new Date().toLocaleString()}

LOCATION INFORMATION
---------------------
Location Name: ${name || 'N/A'}
Priority Level: ${priorityLevel || 'N/A'} (${priorityColor || 'N/A'})
Priority Score: ${score || 'N/A'}/100

SATELLITE DATA FEATURES
------------------------
NDVI (Vegetation Index): ${features.ndvi?.toFixed(3) || 'N/A'}
NDWI (Water Index): ${features.ndwi?.toFixed(3) || 'N/A'}
Vegetation Density: ${features.vegetation_density?.toFixed(1) || 'N/A'}%
Soil Moisture: ${features.soil_moisture ? (features.soil_moisture * 100).toFixed(1) + '%' : 'N/A'}
Elevation: ${features.elevation?.toFixed(1) || 'N/A'} meters
Land Use Type: ${features.land_use_type || 'N/A'}

DATA METADATA
--------------
Data Source: ${features.data_source || 'N/A'}
Collection Date: ${features.collection_date || 'N/A'}
Grid Resolution: ${features.grid_resolution || 'N/A'}

ENVIRONMENTAL IMPACT
---------------------
Carbon Sequestration Potential: High
Air Quality Improvement: ${priorityColor === 'green' ? 'High' : priorityColor === 'yellow' ? 'Medium' : 'Low'}
Flood Risk Reduction: ${priorityColor === 'green' ? 'High' : priorityColor === 'yellow' ? 'Medium' : 'Low'}
Groundwater Recharge: ${priorityColor === 'green' ? 'High' : priorityColor === 'yellow' ? 'Medium' : 'Low'}

RECOMMENDATION
--------------
${priorityColor === 'green' 
  ? 'This location is highly recommended for reforestation activities. The area shows low vegetation density and suitable conditions for planting.'
  : priorityColor === 'yellow'
  ? 'This location has moderate priority for reforestation. Consider this area if resources are available.'
  : 'This location has low priority. The area may already be well-forested or have unsuitable conditions.'}

---
Report generated by ReforestAI
  `.trim();

  const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `reforestation-analysis-${name?.replace(/\s+/g, '-') || 'location'}-${Date.now()}.txt`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

/**
 * Export multiple locations as batch CSV
 */
export const exportBatchToCSV = (locations) => {
  if (!locations || locations.length === 0) {
    throw new Error('No locations to export');
  }

  const headers = [
    'Location Name',
    'Priority Level',
    'Priority Color',
    'Score',
    'NDVI',
    'NDWI',
    'Vegetation Density (%)',
    'Soil Moisture',
    'Elevation (m)',
    'Land Use Type'
  ];

  const rows = locations.map(location => [
    location.name || 'N/A',
    location.priorityLevel || 'N/A',
    location.priorityColor || 'N/A',
    location.score || 'N/A',
    location.features?.ndvi?.toFixed(3) || 'N/A',
    location.features?.ndwi?.toFixed(3) || 'N/A',
    location.features?.vegetation_density?.toFixed(2) || 'N/A',
    location.features?.soil_moisture?.toFixed(3) || 'N/A',
    location.features?.elevation?.toFixed(1) || 'N/A',
    location.features?.land_use_type || 'N/A'
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `reforestation-batch-analysis-${Date.now()}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

