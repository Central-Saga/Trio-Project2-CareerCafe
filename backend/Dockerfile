FROM php:8.3-cli-alpine

RUN apk add --no-cache libpq-dev unzip curl \
    && docker-php-ext-install pdo pdo_pgsql
FROM php:8.4-cli-alpine

RUN apk add --no-cache \
    libpq-dev \
    unzip \
    curl \
    && docker-php-ext-install \
    pdo \
    pdo_pgsql

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html
