import json
import logging
import os
import secrets

from flask import Flask, render_template, request, redirect
from flask_cors import CORS
from utils import success_json_response
from security import secured
from codepipeline import get_pipelines_with_status
from codebuild import get_build
from cloudwatchlogs import get_logs

app = Flask(__name__,
            static_url_path="/",
            static_folder="static")
CORS(app)

# set logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] (%(threadName)-10s) %(message)s')
logger = logging.getLogger(__name__)

MODE = os.getenv("AUTHZ_MODE", "EXP")

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
@secured
def root(username, groups):
  return success_json_response({
    "ping": "pong",
    "username": username,
    "groups": groups
  })

@app.route("/api/pipeline")
@secured
def get_pipelines(username, groups):
  if MODE == "EXP" and len(groups) == 0:
    return success_json_response([])
  else:
    pipes = get_pipelines_with_status(groups)
    return success_json_response(
      pipes
    )

@app.route("/api/codebuild/<string:id>")
def get_build_logs(id):
  cb = get_build(id)
  if cb:
    log_group = cb["logs"]["groupName"]
    log_stream = cb["logs"]["streamName"]
    logs = get_logs(
      log_group=log_group,
      stream_name=log_stream
    )
    logs = [l["message"] for l in logs]
    return success_json_response({
      "log_group": log_group,
      "log_stream": log_stream,
      "events": logs
    })

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0")