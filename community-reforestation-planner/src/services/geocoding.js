/**
 * Geocoding Service
 * Converts pincode or area name to latitude/longitude coordinates
 * 
 * Uses OpenStreetMap Nominatim API (free, no API key required)
 * In production, could also integrate with:
 * - DIGIPIN for Indian pincodes
 * - Google Geocoding API
 */

// Cache for geocoding results to avoid duplicate API calls
const geocodeCache = new Map();

// Check if query is a valid Indian pincode (6 digits)
const isValidIndianPincode = (query) => {
  const pincodeRegex = /^[1-9][0-9]{5}$/;
  return pincodeRegex.test(query.trim());
};

// Format pincode query for Nominatim (add "India" for better results)
const formatPincodeQuery = (pincode) => {
  return `${pincode}, India`;
};

export const geocodeLocation = async (query) => {
  if (!query || typeof query !== 'string') {
    return {
      success: false,
      error: 'Invalid query provided',
      query: query
    };
  }

  const trimmedQuery = query.trim();
  
  if (!trimmedQuery) {
    return {
      success: false,
      error: 'Query cannot be empty',
      query: query
    };
  }

  // Check cache first
  const cacheKey = trimmedQuery.toLowerCase();
  if (geocodeCache.has(cacheKey)) {
    const cached = geocodeCache.get(cacheKey);
    // Return cached result immediately
    return {
      ...cached,
      from_cache: true
    };
  }

  try {
    // Format query based on whether it's a pincode or area name
    let searchQuery = trimmedQuery;
    const isPincode = isValidIndianPincode(trimmedQuery);
    
    if (isPincode) {
      // For Indian pincodes, add "India" for better geocoding results
      searchQuery = formatPincodeQuery(trimmedQuery);
    }

    // Use OpenStreetMap Nominatim API
    const nominatimUrl = 'https://nominatim.openstreetmap.org/search';
    const params = new URLSearchParams({
      q: searchQuery,
      format: 'json',
      addressdetails: '1',
      limit: '1',
    });

    // Add country restriction only for Indian pincodes
    if (isPincode) {
      params.set('countrycodes', 'in');
    }

    const response = await fetch(`${nominatimUrl}?${params.toString()}`, {
      headers: {
        'User-Agent': 'ReforestAI/1.0', // Required by Nominatim
        'Accept-Language': 'en'
      }
    });

    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      // Try fallback: search without country restriction for area names
      if (!isPincode) {
        params.delete('countrycodes');
        const fallbackResponse = await fetch(`${nominatimUrl}?${params.toString()}`, {
          headers: {
            'User-Agent': 'ReforestAI/1.0',
            'Accept-Language': 'en'
          }
        });
        
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          if (fallbackData && fallbackData.length > 0) {
            const result = fallbackData[0];
            const coordinates = {
              lat: parseFloat(result.lat),
              lng: parseFloat(result.lon)
            };

            const areaName = result.display_name || result.address?.city || 
                           result.address?.town || result.address?.village || 
                           trimmedQuery;

            const geocodeResult = {
              success: true,
              coordinates: coordinates,
              area: areaName,
              query: trimmedQuery,
              isPincode: isPincode,
              address: result.address
            };

            // Cache the result
            geocodeCache.set(cacheKey, geocodeResult);
            
            return geocodeResult;
          }
        }
      }

      return {
        success: false,
        error: `Location not found for "${trimmedQuery}". Please check the pincode or area name.`,
        query: trimmedQuery,
        suggestion: isPincode 
          ? 'Please verify the 6-digit pincode is correct.' 
          : 'Try using a more specific location name or nearby city.'
      };
    }

    const result = data[0];
    const coordinates = {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon)
    };

    // Build area name from address components
    let areaName = result.display_name;
    if (result.address) {
      const addr = result.address;
      // Prefer more specific location names
      areaName = addr.postcode 
        ? `${addr.postcode}${addr.city ? ', ' + addr.city : ''}${addr.state ? ', ' + addr.state : ''}${addr.country ? ', ' + addr.country : ''}`
        : addr.city || addr.town || addr.village || addr.state || result.display_name;
    }

    const geocodeResult = {
      success: true,
      coordinates: coordinates,
      area: areaName,
      query: trimmedQuery,
      isPincode: isPincode,
      address: result.address
    };

    // Cache the result (with expiration after 24 hours)
    geocodeCache.set(cacheKey, geocodeResult);
    setTimeout(() => {
      geocodeCache.delete(cacheKey);
    }, 24 * 60 * 60 * 1000); // 24 hours

    return geocodeResult;

  } catch (error) {
    console.error('Geocoding error:', error);
    
    // Fallback to mock data for specific known locations
    const mockGeocodingData = {
      'kattankulathur': { lat: 12.8258, lng: 80.0462, area: 'Kattankulathur, Tamil Nadu' },
      '600042': { lat: 13.0827, lng: 80.2707, area: 'Chennai, Tamil Nadu' },
      '110001': { lat: 28.6139, lng: 77.2090, area: 'New Delhi, Delhi' },
      '400001': { lat: 18.9388, lng: 72.8353, area: 'Mumbai, Maharashtra' },
      '560001': { lat: 12.9716, lng: 77.5946, area: 'Bangalore, Karnataka' },
    };

    const normalizedQuery = trimmedQuery.toLowerCase();
    if (mockGeocodingData[normalizedQuery]) {
      const mockResult = {
        success: true,
        coordinates: {
          lat: mockGeocodingData[normalizedQuery].lat,
          lng: mockGeocodingData[normalizedQuery].lng
        },
        area: mockGeocodingData[normalizedQuery].area,
        query: trimmedQuery,
        from_fallback: true
      };
      return mockResult;
    }

    return {
      success: false,
      error: error.message || 'Failed to geocode location. Please try again.',
      query: trimmedQuery
    };
  }
};

