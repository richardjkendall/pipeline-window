import json
import logging
import os
import secrets

from flask import Flask, render_template, request, redirect
from flask_cors import CORS
from utils import success_json_response
from codepipeline import get_pipelines_with_status

app = Flask(__name__,
            static_url_path="/",
            static_folder="static")
CORS(app)

# set logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] (%(threadName)-10s) %(message)s')
logger = logging.getLogger(__name__)

@app.route("/")
def gotoindex():
  # headers on request
  logger.info("Headers on request...")
  for key,value in dict(request.headers).items():
    logger.info("{key} -> {val}".format(key=key, val=value))
  # check for X-Forwarded headers
  if request.headers.get("x-forwarded-host"):
    host = request.headers.get("x-forwarded-host")
    # check if host is a list and get first element assuming this is the host the user expects
    if len(host.split(",")) > 1:
      host = host.split(",")[0].strip()
    if request.headers.get("x-forwarded-proto"):
      proto = request.headers.get("x-forwarded-proto")
      url = "{proto}://{host}/index.html".format(proto=proto, host=host)
      logger.info("URL for redirect is {url}".format(url=url))
      return redirect(url, code=302)
    else:
      url = "http://{host}/index.html".format(host=host)
      logger.info("URL for redirect is {url}".format(url=url))
      return redirect(url, code=302)
  else:
    return redirect("/index.html", code=302)

@app.route("/api")
def root():
  return success_json_response({
    "ping": "pong"
  })

@app.route("/api/pipeline")
def get_pipelines():
  pipes = get_pipelines_with_status()
  return success_json_response(
    pipes
  )

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0")