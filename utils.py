"""
Useful bits of code
"""
import logging
import sys
import random
from flask import make_response, jsonify

logger = logging.getLogger(__name__)

def get_rand_string(number_of_characters):
    chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
    rnd = random.SystemRandom()
    out = ""
    for d in range(number_of_characters):
        i = rnd.randint(0, sys.maxsize)
        i = i % len(chars)
        out = out + chars[i:i+1]
    return out

def check_for_keys(dict, keys):
  missing = []
  for key in keys:
    if key not in dict:
      missing.append(key)
  if len(missing) > 0:
    return missing
  else:
    return False

def success_json_response(payload):
  """
  Turns payload into a JSON HTTP200 response
  """
  response = make_response(jsonify(payload), 200)
  response.headers["Content-type"] = "application/json"
  return response

def generic_exception_json_response(code):
    """
    Turns an unhandled exception into a JSON payload to respond to a service call
    """
    payload = {
        "error": "TechnicalException",
        "message": "An unknown error occured",
        "code": code
    }
    resp = make_response(jsonify(payload), code)
    resp.headers["Content-type"] = "application/json"
    return resp

def exception_to_json_response(exception, code):
    """
    Turns an exception into a JSON payload to respond to a service call
    """
    payload = {
        "error": type(exception).__name__,
        "message": str(exception),
        "code": code
    }
    resp = make_response(jsonify(payload), code)
    resp.headers["Content-type"] = "application/json"
    return resp