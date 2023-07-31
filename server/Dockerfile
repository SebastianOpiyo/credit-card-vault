# API server
FROM python:3.9-buster

ENV TZ=Africa/Nairobi
ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONIOENCODING UTF-8

# Install any needed packages specified in requirements.txt
RUN apt-get update && \
    apt-get install -y gcc musl-dev libpq-dev

WORKDIR /app

COPY /server/requirements.txt .
ARG PIP_TRUSTED_HOST=127.0.0.1
ARG PIP_INDEX_URL=https://pypi.python.org/simple/
RUN pip3 install --quiet --no-cache-dir -r requirements.txt

COPY server/ .

EXPOSE 8000

CMD ["python", "app.py"]