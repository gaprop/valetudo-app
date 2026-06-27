package main

import (
	"context"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

func connectWithRetry(ctx context.Context, databaseURL string) (*pgxpool.Pool, error) {
	var lastErr error
	for attempt := 1; attempt <= 20; attempt++ {
		db, err := pgxpool.New(ctx, databaseURL)
		if err == nil {
			if pingErr := db.Ping(ctx); pingErr == nil {
				return db, nil
			} else {
				lastErr = pingErr
				db.Close()
			}
		} else {
			lastErr = err
		}
		time.Sleep(1 * time.Second)
	}
	return nil, lastErr
}
