import logging
from os import pipe
import boto3

logger = logging.getLogger(__name__)

cp = boto3.client("codepipeline")

def get_pipelines_with_status(filters = None):
  """
  List all the pipelines and most recent status

  Filter with filters if set
  """
  raw_pipelines = []
  pipelines = set()
  next_token = ""
  scan = True
  while scan:
    response = {}
    if next_token:
      response = cp.list_pipelines(nextToken=next_token)
    else:
      response = cp.list_pipelines()
    if "pipelines" in response:
      raw_pipelines.extend(response["pipelines"])
    if "nextToken" in response:
      next_token = response["nextToken"]
    else:
      scan = False
  if filters:
    # there are filters so we should filter
    for filter in filters:
      for pipeline in raw_pipelines:
        if filter in pipeline["name"]:
          pipelines.add(pipeline["name"])
  else:
    pass
    for pipeline in raw_pipelines:
      pipelines.add(pipeline["name"])
  pipelines = list(pipelines)
  # need to get status

  return pipelines