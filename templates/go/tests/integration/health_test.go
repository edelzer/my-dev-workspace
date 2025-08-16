// +build integration

package integration

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"app/internal/api/handlers"
	"app/internal/utils"
)

func TestHealthEndpoints(t *testing.T) {
	// Setup
	logger := utils.NewLogger("debug", "test")
	db := setupTestDB(t)
	redisClient := setupTestRedis(t)
	
	healthHandler := handlers.NewHealthHandler(db, redisClient, logger)
	
	gin.SetMode(gin.TestMode)
	router := gin.New()
	
	// Setup routes
	health := router.Group("/health")
	{
		health.GET("/", healthHandler.Health)
		health.GET("/readiness", healthHandler.Readiness)
		health.GET("/liveness", healthHandler.Liveness)
	}

	tests := []struct {
		name           string
		endpoint       string
		expectedStatus int
		checkResponse  func(t *testing.T, body []byte)
	}{
		{
			name:           "health endpoint",
			endpoint:       "/health/",
			expectedStatus: http.StatusOK,
			checkResponse: func(t *testing.T, body []byte) {
				var response map[string]interface{}
				err := json.Unmarshal(body, &response)
				require.NoError(t, err)
				
				assert.Equal(t, "healthy", response["status"])
				assert.NotNil(t, response["timestamp"])
				assert.NotNil(t, response["services"])
			},
		},
		{
			name:           "readiness endpoint",
			endpoint:       "/health/readiness",
			expectedStatus: http.StatusOK,
			checkResponse: func(t *testing.T, body []byte) {
				var response map[string]interface{}
				err := json.Unmarshal(body, &response)
				require.NoError(t, err)
				
				assert.Equal(t, "ready", response["status"])
			},
		},
		{
			name:           "liveness endpoint",
			endpoint:       "/health/liveness",
			expectedStatus: http.StatusOK,
			checkResponse: func(t *testing.T, body []byte) {
				var response map[string]interface{}
				err := json.Unmarshal(body, &response)
				require.NoError(t, err)
				
				assert.Equal(t, "alive", response["status"])
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Act
			req := httptest.NewRequest("GET", tt.endpoint, nil)
			w := httptest.NewRecorder()
			router.ServeHTTP(w, req)

			// Assert
			assert.Equal(t, tt.expectedStatus, w.Code)
			
			if tt.checkResponse != nil {
				tt.checkResponse(t, w.Body.Bytes())
			}
		})
	}
}

func TestHealthEndpoint_DatabaseDown(t *testing.T) {
	// Setup with invalid database connection
	logger := utils.NewLogger("debug", "test")
	
	// Use nil database to simulate connection failure
	var db *gorm.DB = nil
	redisClient := setupTestRedis(t)
	
	healthHandler := handlers.NewHealthHandler(db, redisClient, logger)
	
	gin.SetMode(gin.TestMode)
	router := gin.New()
	router.GET("/health/", healthHandler.Health)

	// Act
	req := httptest.NewRequest("GET", "/health/", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	// Assert
	assert.Equal(t, http.StatusServiceUnavailable, w.Code)
	
	var response map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &response)
	require.NoError(t, err)
	
	assert.Equal(t, "unhealthy", response["status"])
	
	services, ok := response["services"].(map[string]interface{})
	require.True(t, ok)
	
	database, ok := services["database"].(map[string]interface{})
	require.True(t, ok)
	assert.Equal(t, "unhealthy", database["status"])
}

func TestHealthEndpoint_RedisDown(t *testing.T) {
	// Setup with invalid Redis connection
	logger := utils.NewLogger("debug", "test")
	db := setupTestDB(t)
	
	// Use nil Redis client to simulate connection failure
	var redisClient *redis.Client = nil
	
	healthHandler := handlers.NewHealthHandler(db, redisClient, logger)
	
	gin.SetMode(gin.TestMode)
	router := gin.New()
	router.GET("/health/", healthHandler.Health)

	// Act
	req := httptest.NewRequest("GET", "/health/", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	// Assert
	assert.Equal(t, http.StatusServiceUnavailable, w.Code)
	
	var response map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &response)
	require.NoError(t, err)
	
	assert.Equal(t, "unhealthy", response["status"])
	
	services, ok := response["services"].(map[string]interface{})
	require.True(t, ok)
	
	redis, ok := services["redis"].(map[string]interface{})
	require.True(t, ok)
	assert.Equal(t, "unhealthy", redis["status"])
}

func BenchmarkHealthEndpoint(b *testing.B) {
	// Setup
	logger := utils.NewLogger("error", "test") // Reduce log noise
	db := setupTestDB(nil)
	redisClient := setupTestRedis(nil)
	
	healthHandler := handlers.NewHealthHandler(db, redisClient, logger)
	
	gin.SetMode(gin.ReleaseMode)
	router := gin.New()
	router.GET("/health/", healthHandler.Health)

	// Benchmark
	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		req := httptest.NewRequest("GET", "/health/", nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)
		
		if w.Code != http.StatusOK {
			b.Fatalf("Expected status 200, got %d", w.Code)
		}
	}
}