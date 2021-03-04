import logging
import boto3

logger = logging.getLogger(__name__)

cb = boto3.client("codebuild")

def get_build(build_id):
  response = cb.batch_get_builds(ids = [build_id])
  if "builds" in response:
    if len(response["builds"]) > 0:
      return response["builds"][0]
  return None