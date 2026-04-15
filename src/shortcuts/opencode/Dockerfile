FROM ubuntu:26.04

COPY ./opencode.json /opencode/
COPY ./init.sh /

RUN ["bash", "-c", "./init.sh"]

WORKDIR /playground