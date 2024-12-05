FROM php:apache

WORKDIR /var/www/html
COPY koyeb_web_php

ENV PORT=8000
EXPOSE ${PORT}

RUN sed -i 's/Listen 80/Listen ${PORT}/' /etc/apache2/ports.conf
