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

cache = {
  "ranks": {},
  "youtube": {},
}

def get_ranks(strType, SYY, SMM, SDD, EYY, EMM, EDD):
  ranks = []

  scheme = "http"
  netloc = "www.tjmedia.co.kr"
  path = "/tjsong/song_monthPopular.asp"
  params = None
  queries = {
    "strType": strType,
    "SYY": SYY, "SMM": SMM, "SDD": SDD,
    "EYY": EYY, "EMM": EMM, "EDD": EDD,
  }
  query = urllib.parse.urlencode(queries)
  fragment = None
  url = urllib.parse.urlunparse((scheme, netloc, path, params, query, fragment))

  response = requests.get(url)
  if response.ok:
    root = lxml.etree.HTML(response.content)
    for tr in root.cssselect('#BoardType1 table.board_type1 tr'):
      tds = tr.xpath('./td')
      if len(tds) == 4:
        rank, number, title, artist = (td.text.encode("raw_unicode_escape").decode() for td in tds)
        ranks.append({
          "rank": rank,
          "number": number,
          "title": title,
          "artist": artist,
        })
  return ranks

@server.route("/api/v1/ranks", methods=[ "GET" ])
def _api_get_ranks():
  args = flask.request.args
  if any(key not in args.keys() for key in ("t", "sy", "sm", "sd", "ey", "em", "ed")):
    return flask.jsonify(error=True, message="Invalid parameters: 't', 'sy', 'sm', 'sd', 'ey', 'em', 'ed'")

  type_ = args["t"]
  start_year = args["sy"]
  start_month = args["sm"]
  start_day = args["sd"]
  end_year = args["ey"]
  end_month = args["em"]
  end_day = args["ed"]

  start = '-'.join((start_year, start_month, start_day))
  end = '-'.join((end_year, end_month, end_day))
  key = '~'.join((start, end))
  ranks = get_ranks(type_, start_year, start_month, start_day, end_year, end_month, end_day)
  cache["ranks"][key] = ranks
  return flask.jsonify(error=False, ranks=ranks)

@server.route("/api/v1/ranks/cached", methods=[ "GET" ])
def _api_get_ranks_cached():
  args = flask.request.args
  if any(key not in args.keys() for key in ("t", "sy", "sm", "sd", "ey", "em", "ed")):
    return flask.jsonify(error=True, message="Invalid parameters: 't', 'sy', 'sm', 'sd', 'ey', 'em', 'ed'")

  type_ = args["t"]
  start_year = args["sy"]
  start_month = args["sm"]
  start_day = args["sd"]
  end_year = args["ey"]
  end_month = args["em"]
  end_day = args["ed"]

  start = '-'.join((start_year, start_month, start_day))
  end = '-'.join((end_year, end_month, end_day))
  key = '~'.join((start, end))
  if key not in cache["ranks"].keys() or len(cache["ranks"][key]) <= 0:
    cache["ranks"][key] = get_ranks(type_, start_year, start_month, start_day, end_year, end_month, end_day)
  return flask.jsonify(error=False, ranks=cache["ranks"][key])

@server.route("/api/v1/youtube/cached", methods=[ "GET" ])
def _api_get_youtube_cached():
  args = flask.request.args
  if any(key not in args.keys() for key in ("number", "title", "artist")):
    return flask.jsonify(error=True, message="Invalid parameters: 'number', 'title', 'artist'")

  number = args["number"]
  title = args["title"]
  artist = args["artist"]

  key = number
  if key not in cache["youtube"].keys():
    return flask.jsonify(error=True, message="")
  return flask.jsonify(error=False, youtube=cache["youtube"][key])

@server.route("/api/v1/youtube", methods=[ "POST" ])
def _api_post_youtube():
  data = flask.request.json
  if any(key not in data.keys() for key in ("number", "title", "artist", "youtube")):
    return flask.jsonify(error=True, message="Invalid parameters: 'number', 'title', 'artist', 'youtube'")

  number = data["number"]
  title = data["title"]
  artist = data["artist"]
  youtube = data["youtube"]

  key = number
  cache["youtube"][key] = youtube
  return flask.jsonify(error=False)

@server.route("/api/v1/api-key")
def _api_get_api_key():
  apiKey = os.getenv("API_KEY")
  return flask.jsonify(apiKey=apiKey)

if __name__ == "__main__":
  server.run()
