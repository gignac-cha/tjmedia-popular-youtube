# -*- coding: utf-8 -*-

import flask

import os
import datetime
import json
import urllib

import requests
import lxml.etree

import pytz

server = flask.Flask(__name__, static_url_path='')

@server.route('/')
def index():
  return server.send_static_file("index.html")

@server.route("/api/v1/api-key")
def _api_get_api_key():
  apiKey = os.getenv("API_KEY")
  return flask.jsonify(apiKey=apiKey)

if __name__ == "__main__":
  server.run()
