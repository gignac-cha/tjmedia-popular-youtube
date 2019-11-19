# -*- coding: utf-8 -*-

import flask

import os
import datetime
import json
import urllib

import requests
import lxml.etree

import pytz

import youtube_dl

server = flask.Flask(__name__, static_url_path='')

@server.route('/')
def index():
  return server.send_static_file("index.html")

cache = {
  "ranks": {},
  "youtube": {},
  "audio": {},
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

@server.route("/api/v1/ranks/<type_>", methods=[ "GET" ])
def _api_get_ranks(type_):
  args = flask.request.args
  if any(key not in args.keys() for key in ("sy", "sm", "sd", "ey", "em", "ed")):
    return flask.jsonify(error=True, message="Invalid parameters: 'sy', 'sm', 'sd', 'ey', 'em', 'ed'")

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

@server.route("/api/v1/ranks/<type_>/cached", methods=[ "GET" ])
def _api_get_ranks_cached(type_):
  args = flask.request.args
  if any(key not in args.keys() for key in ("sy", "sm", "sd", "ey", "em", "ed")):
    return flask.jsonify(error=True, message="Invalid parameters: 'sy', 'sm', 'sd', 'ey', 'em', 'ed'")

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

@server.route("/api/v1/youtube/<number>/cached", methods=[ "GET" ])
def _api_get_youtube_cached(number):
  if number not in cache["youtube"].keys():
    return flask.jsonify(error=True, message="")
  return flask.jsonify(error=False, youtube=cache["youtube"][number])

@server.route("/api/v1/youtube/<number>", methods=[ "POST" ])
def _api_post_youtube(number):
  data = flask.request.json
  if "youtube" not in data.keys():
    return flask.jsonify(error=True, message="Invalid parameters: 'youtube'")

  youtube = data["youtube"]

  cache["youtube"][number] = youtube
  return flask.jsonify(error=False)

@server.route("/api/v1/audio/<videoId>", methods=[ "GET" ])
def _get_audio(videoId):
  if videoId not in cache["audio"].keys():
    return flask.jsonify(error=True, message="")

  if not os.path.exists(f'web/static/{videoId}.mp3'):
    return flask.jsonify(error=True, message="")

  return flask.jsonify(error=False)

@server.route("/api/v1/audio/<videoId>", methods=[ "POST" ])
def _api_post_audio(videoId):
  if videoId not in cache["audio"].keys():
    urls = [ f'https://www.youtube.com/watch?v={videoId}' ]
    result = youtube_dl.YoutubeDL({
      "format": "bestaudio/best",
      "postprocessors": [
        {
          "key": "FFmpegExtractAudio",
          "preferredcodec": "mp3",
          "preferredquality": "320",
        },
      ],
      "outtmpl": "web/static/%(id)s.%(ext)s"
    }).download(urls)
    if result != 0:
      return flask.jsonify(error=True, message="")
    cache["audio"][videoId] = True
  return flask.jsonify(error=False)

@server.route("/audio/<videoId>", methods=[ "GET" ])
def _api_get_audio(videoId):
  if videoId not in cache["audio"].keys():
    return flask.jsonify(error=True, message="")

  return server.send_static_file(f'{videoId}.mp3')

@server.route("/api/v1/api-key")
def _api_get_api_key():
  apiKey = os.getenv("API_KEY")
  return flask.jsonify(apiKey=apiKey)

if __name__ == "__main__":
  server.run()
