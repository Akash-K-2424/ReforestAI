/**
 * Main API Service
 * Orchestrates the complete backend workflow:
 * 1. Geocoding: Convert pincode/area name to coordinates
 * 2. Satellite Data Retrieval: Get preprocessed satellite data for coordinates
 * 3. Feature Extraction: Extract NDVI, NDWI, etc. from satellite data
 * 4. Preprocessing: Normalize/scale features for model input
 * 5. Modeling: Run K-means clustering to predict priority
 * 6. Postprocessing: Map cluster to Red/Yellow/Green priority
 * 7. Return Results: Send complete results to frontend
 */
import { geocodeLocation } from './geocoding';
import { getSatelliteData } from './satelliteData';
import { predictPlantingPriority } from './mlModel';

export const analyzeLocation = async (query) => {
  try {
    // Step 1: Geocoding - Convert pincode/area name to coordinates
    console.log('📍 Step 1: Geocoding location...');
    const geocodeResult = await geocodeLocation(query);
    
    if (!geocodeResult.success) {
      // Return error with helpful message
      return {
        success: false,
        error: geocodeResult.error || 'Geocoding failed',
        suggestion: geocodeResult.suggestion,
        query: query,
        timestamp: new Date().toISOString()
      };
    }
    
    const { coordinates, area } = geocodeResult;
    
    // Step 2: Retrieve preprocessed satellite data
    console.log('🛰️ Step 2: Retrieving satellite data...');
    const satelliteResult = await getSatelliteData(coordinates);
    
    if (!satelliteResult.success) {
      throw new Error('Satellite data retrieval failed');
    }
    
    const { features } = satelliteResult;
    
    // Step 3 & 4: Feature extraction (already done in satellite data)
    // and Preprocessing + Modeling + Postprocessing
    console.log('🤖 Step 3-6: Extracting features, preprocessing, and running model...');
    const predictionResult = await predictPlantingPriority(features);
    
    if (!predictionResult.success) {
      throw new Error('Model prediction failed');
    }
    
    // Step 7: Return complete results
    return {
      success: true,
      query: query,
      location: {
        coordinates: coordinates,
        area: area,
        geocoded_at: new Date().toISOString()
      },
      satelliteData: {
        features: features,
        landsatScene: satelliteResult.landsatScene, // Include Landsat scene information
        metadata: satelliteResult.metadata
      },
      prediction: {
        priority: predictionResult.priority,
        priorityDetails: predictionResult.priorityDetails,
        cluster: predictionResult.cluster,
        confidence: {
          // Calculate confidence based on distance to cluster center
          score: Math.max(0, Math.min(100, 100 - (predictionResult.distances[predictionResult.cluster] * 100)))
        },
        metadata: predictionResult.metadata
      },
      workflow: {
        geocoding: 'complete',
        satellite_retrieval: 'complete',
        feature_extraction: 'complete',
        preprocessing: 'complete',
        modeling: 'complete',
        postprocessing: 'complete'
      },
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('Error in analyzeLocation:', error);
    return {
      success: false,
      error: error.message || 'Unknown error occurred',
      query: query,
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * Batch analysis for multiple locations
 */
export const analyzeLocationsBatch = async (queries) => {
  const results = await Promise.all(
    queries.map(query => analyzeLocation(query))
  );
  return results;
};

/**
 * Get cached results if available (for performance optimization)
 * In production, this would check Redis or similar cache
 */
export const getCachedAnalysis = async (query) => {
  // Mock cache check
  const cached = localStorage.getItem(`analysis_cache_${query}`);
  if (cached) {
    const parsed = JSON.parse(cached);
    // Check if cache is still valid (e.g., less than 1 hour old)
    const cacheAge = Date.now() - new Date(parsed.cached_at).getTime();
    if (cacheAge < 60 * 60 * 1000) { // 1 hour
      return {
        ...parsed,
        from_cache: true
      };
    }
  }
  return null;
};

/**
 * Cache analysis result
 */
export const cacheAnalysis = (query, result) => {
  try {
    const toCache = {
      ...result,
      cached_at: new Date().toISOString()
    };
    localStorage.setItem(`analysis_cache_${query}`, JSON.stringify(toCache));
  } catch (error) {
    console.warn('Failed to cache analysis result:', error);
  }
};

