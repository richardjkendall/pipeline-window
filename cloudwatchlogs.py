import logging
from os import pipe
import boto3
import json

logger = logging.getLogger(__name__)

logs = boto3.client("logs")

def get_logs(log_group, stream_name):
  events = []
  response = logs.get_log_events(
    logGroupName=log_group,
    logStreamName=stream_name,
    #limit=20,
    startFromHead=True
  )
  logging.info("Got response from logs API")
  if "events" in response:
    logging.info("Got {n} events".format(n=len(response["events"])))
    events.extend(response["events"])
  nbt = ""
  while "nextForwardToken" in response and len(response["events"]) > 0:
    logging.info("Got a next token {t}, so going again...".format(t=response["nextForwardToken"]))
    response = logs.get_log_events(
      logGroupName=log_group,
      logStreamName=stream_name,
      nextToken=response["nextForwardToken"],
      #limit=20,
      startFromHead=True
    )
    nbt = response["nextForwardToken"]
    if "events" in response:
      logging.info("Got {n} events".format(n=len(response["events"])))
      events.extend(response["events"])
  return events
  
