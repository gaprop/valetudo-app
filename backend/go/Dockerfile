FROM golang:1.22-alpine AS build

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /fitness-backend .

FROM alpine:3.20

WORKDIR /app
COPY --from=build /fitness-backend /usr/local/bin/fitness-backend

EXPOSE 8080
CMD ["fitness-backend"]
