package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"os"
)

func main() {
	apiKey := os.Getenv("WEATHERSTACK_API_KEY")
	if apiKey == "" {
		apiKey = os.Getenv("VITE_WEATHERSTACK_API_KEY")
	}
	if apiKey == "" {
		log.Fatal("WEATHERSTACK_API_KEY or VITE_WEATHERSTACK_API_KEY environment variable is required")
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8083"
	}

	http.HandleFunc("/api/weather", func(w http.ResponseWriter, r *http.Request) {
		// Handle CORS headers
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		if r.Method != http.MethodGet {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		city := r.URL.Query().Get("city")
		if city == "" {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(map[string]interface{}{
				"success": false,
				"error": map[string]interface{}{
					"code": 601,
					"type": "missing_query",
					"info": "Please specify a city using the ?city= parameter.",
				},
			})
			return
		}

		apiURL := fmt.Sprintf("http://api.weatherstack.com/current?access_key=%s&query=%s", apiKey, url.QueryEscape(city))
		log.Printf("Proxying request to WeatherStack for city: %s", city)

		resp, err := http.Get(apiURL)
		if err != nil {
			log.Printf("Error fetching weather for %s: %v", city, err)
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]interface{}{
				"success": false,
				"error": map[string]interface{}{
					"code": 500,
					"type": "proxy_error",
					"info": "Failed to contact WeatherStack API.",
				},
			})
			return
		}
		defer resp.Body.Close()

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(resp.StatusCode)

		var result interface{}
		if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
			log.Printf("Error decoding weather response: %v", err)
			http.Error(w, "Error parsing response from weather service", http.StatusInternalServerError)
			return
		}

		json.NewEncoder(w).Encode(result)
	})

	log.Printf("Proxy server listening on port %s", port)
	if err := http.ListenAndServe("127.0.0.1:"+port, nil); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}
