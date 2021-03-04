import logging
from os import pipe
import boto3
import json

logger = logging.getLogger(__name__)

cp = boto3.client("codebuild")