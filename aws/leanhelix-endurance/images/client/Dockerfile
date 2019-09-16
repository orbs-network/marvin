FROM golang:1.12.9

WORKDIR /src
ADD client .
RUN go build -o client main.go

CMD ["./client"]