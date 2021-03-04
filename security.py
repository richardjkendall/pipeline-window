"""
security.py
Contains code which manages access to API routes
"""
import logging
from functools import wraps
from flask import request, g

logger = logging.getLogger(__name__)

def secured(f):
  """
  Decorator to check that a request has valid headers and matches the requirements
  """
  @wraps(f)
  def decorated_function(*args, **kwargs):
    """
    Function to check headers are present and check their validity
    """
    logger.info("Secured decorator has started")
    logger.debug("Details passed to the secured decorator", extra={"headers": request.headers})
    if "x-remote-user" in request.headers:
      username = request.headers["x-remote-user"]
      if "x-remote-user-groups" in request.headers:
        groups = request.headers["x-remote-user-groups"]
        logger.info(f"Groups from header: {groups}")
        groups = groups.split(",")
        return f(username, groups, *args, **kwargs)
      else:
        logger.info("X-Remote-User-Groups header is missing from request, so allowing all access")
        return f(username, [], *args, **kwargs)
    else:
      logger.info("X-Remote-User header is missing from request")
      return f(None, [], *args, **kwargs)
  
  return decorated_function