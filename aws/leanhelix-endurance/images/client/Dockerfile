FROM golang:1.12.9

WORKDIR /src

ADD client .

CMD ["go", "test", "-v", "-count=1", "./..."]