# Satellite Data Integration Guide

## Overview

The satellite data service is designed to integrate with real Landsat satellite imagery APIs. Currently, it uses mock data but is structured to easily connect to production APIs.

## Integration Options

### 1. USGS EarthExplorer API (Recommended)

**Steps:**
1. Register at https://earthexplorer.usgs.gov/
2. Get API credentials
3. Use the `scene-search` endpoint to find closest scenes
4. Use `download-options` and `download-request` to download imagery

**Example API Structure:**
```javascript
// Query for available scenes
const response = await fetch('https://m2m.cr.usgs.gov/api/api/json/stable/scene-search', {
  method: 'POST',
  headers: { 'X-Auth-Token': YOUR_TOKEN },
  body: JSON.stringify({
    datasetName: 'LANDSAT_8_C1',
    spatialFilter: {
      filterType: 'mbr',
      lowerLeft: { latitude: lat - 0.1, longitude: lng - 0.1 },
      upperRight: { latitude: lat + 0.1, longitude: lng + 0.1 }
    },
    temporalFilter: {
      startDate: startDate,
      endDate: endDate
    },
    maxCloudCover: 20
  })
});
```

### 2. AWS Landsat Public Dataset

**Advantages:**
- No API key required
- Direct S3 access
- Free for public use

**Example:**
```
https://landsat-pds.s3.amazonaws.com/c1/L8/path/row/scene_id/
```

### 3. Sentinel Hub EO Browser API

**Steps:**
1. Sign up at https://www.sentinel-hub.com/
2. Get API key
3. Use Process API to request Landsat imagery

### 4. Agromonitoring API

**Steps:**
1. Register at https://agromonitoring.com/
2. Get API key
3. Query satellite imagery with polygon coordinates

## Implementation Checklist

- [ ] Replace `findClosestLandsatScene()` mock with real API call
- [ ] Add authentication/API key management
- [ ] Implement actual NDVI/NDWI calculation from Landsat bands
- [ ] Add image download/caching functionality
- [ ] Set up local metadata database for faster lookups
- [ ] Add error handling for API rate limits
- [ ] Implement retry logic for failed requests
- [ ] Add caching layer for frequently requested locations

## Current Mock Implementation

The current implementation simulates:
- Finding closest Landsat scene by date
- Cloud cover filtering
- Scene metadata (scene ID, acquisition date, path/row)
- Feature extraction (NDVI, NDWI) from satellite bands

## Files to Update

1. `services/landsatService.js` - Add real API integration
2. `services/satelliteData.js` - Update to use real Landsat service
3. Add `.env` file for API keys (don't commit to git)

## Resources

- [USGS EarthExplorer API Documentation](https://m2m.cr.usgs.gov/api/docs/json/)
- [AWS Landsat Dataset](https://registry.opendata.aws/usgs-landsat/)
- [Sentinel Hub API Docs](https://docs.sentinel-hub.com/api/latest/)
- [Landsat Collection 2 Data](https://www.usgs.gov/landsat-missions/landsat-collection-2)

