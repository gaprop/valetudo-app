package main

import (
	"context"
	"log"
	"net/http"
	"os"
)

func main() {
	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		databaseURL = "postgres://fitness:fitness@localhost:5432/fitness?sslmode=disable"
	}

	db, err := connectWithRetry(context.Background(), databaseURL)
	if err != nil {
		log.Fatalf("connect database: %v", err)
	}
	defer db.Close()

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	server := &Server{db: db}
	log.Printf("fitness backend listening on :%s", port)
	if err := http.ListenAndServe(":"+port, server.routes()); err != nil {
		log.Fatal(err)
	}
}
