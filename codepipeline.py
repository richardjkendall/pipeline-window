import logging
from os import pipe
import boto3
import json

logger = logging.getLogger(__name__)

cp = boto3.client("codepipeline")

def collapse_stages(state):
  """
  Walk the stages of the pipeline and summarise them
  """
  state_counts = {}
  stages = []
  overall_state = ""
  if "stageStates" in state:
    for stage_state in state["stageStates"]:
      name = stage_state["stageName"]
      exec_id = "n/a"
      exec_state = "n/a"
      if "latestExecution" in stage_state:
        exec_id = stage_state["latestExecution"]["pipelineExecutionId"]
        exec_state = stage_state["latestExecution"]["status"]
        if exec_state in state_counts:
          state_counts.update({
            exec_state: state_counts[exec_state] + 1
          })
        else:
          state_counts.update({
            exec_state: 1
          })
      stages.append({
        "name": name,
        "pipeline_id": exec_id,
        "status": exec_state
      })
    if "Failed" in state_counts:
      overall_state = "Failed"
    elif "Stopping" in state_counts:
      overall_state = "Stopping"
    elif "Stopped" in state_counts:
      overall_state = "Stopped"
    elif "InProgress" in state_counts:
      overall_state = "InProgress"
    elif "Succeeded" in state_counts:
      overall_state = "Succeeded"
  return {
    "overall_state": overall_state,
    "stages": stages,
  }

def get_pipeline_state(name):
  """
  Get latest execution along with details of it
  """
  state = cp.get_pipeline_state(
    name=name
  )
  statejson = json.dumps(state, indent=2, default=str)
  logging.info(f"State json {statejson}")
  return collapse_stages(state)

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
  pipelines_to_return = []
  # need to get status
  for pipeline in pipelines:
    state = get_pipeline_state(pipeline)
    statejson = json.dumps(state, indent=2, default=str)
    logging.info(f"{statejson}")
    ptr = {
      "name": pipeline,
      "state": state["overall_state"],
      "stages": state["stages"]
    }
    pipelines_to_return.append(ptr)
  return pipelines_to_return