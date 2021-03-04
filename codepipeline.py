import logging
from os import pipe
import boto3
import json
import datetime
import pytz

logger = logging.getLogger(__name__)

cp = boto3.client("codepipeline")

EPOCH = datetime.datetime(1900, 1, 1, 0, 0, 0, tzinfo=pytz.UTC)

def summarise_actions(action_states):
  """
  Summarise the actions
  """
  actions = []
  for action in action_states:
    name = action["actionName"]
    revision_id = ""
    summary = ""
    status = ""
    external_exec_id = ""
    external_exec_url = ""
    entity_url = ""
    latest_status_change = EPOCH
    if "currentRevision" in action:
      revision_id = action["currentRevision"].get("revisionId", "")
    entity_url = action.get("entityUrl", "")
    if "latestExecution" in action:
      le = action["latestExecution"]
      status = le.get("status", "")
      summary = le.get("summary", "")
      external_exec_id = le.get("externalExecutionId", "")
      external_exec_url = le.get("externalExecutionUrl", "")
      latest_status_change = le.get("lastStatusChange", EPOCH)
    actions.append({
      "name": name,
      "revision_id": revision_id,
      "summary": summary,
      "status": status,
      "external_exec_id": external_exec_id,
      "external_exec_url": external_exec_url,
      "entity_url": entity_url,
      "latest_status_change": latest_status_change
    })
  return actions

def collapse_stages(state):
  """
  Walk the stages of the pipeline and summarise them
  """
  state_counts = {}
  stages = []
  overall_state = ""
  latest_date = EPOCH
  latest_id = ""
  if "stageStates" in state:
    for stage_state in state["stageStates"]:
      name = stage_state["stageName"]
      exec_id = "n/a"
      exec_state = "n/a"
      actions = []
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
      if "actionStates" in stage_state:
        actions = summarise_actions(stage_state["actionStates"])
        for action in actions:
          if action["latest_status_change"] > latest_date:
            latest_date = action["latest_status_change"]
            latest_id = exec_id
      stages.append({
        "name": name,
        "pipeline_id": exec_id,
        "status": exec_state,
        "actions": actions
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
    "latest_execution": latest_date,
    "latest_id": latest_id
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
      "stages": state["stages"],
      "latest_run": state["latest_execution"],
      "latest_run_id": state["latest_id"]
    }
    pipelines_to_return.append(ptr)
  return pipelines_to_return