# pipeline-window

[![build and push to public aws ecr](https://github.com/richardjkendall/pipeline-window/actions/workflows/build.yml/badge.svg)](https://github.com/richardjkendall/pipeline-window/actions/workflows/build.yml)

This is a quick tool which shows the status of AWS CodePipeline and associated CodeBuild projects.  I created it so people without AWS access can self-serve for visibility and resolve issues by having access to the logs.

## Running it

The application is packaged as a container and is available on my ECR public container registry here https://gallery.ecr.aws/rjk/pipeline-viewer

Running it is as simple as

```bash
docker run \
  -p 5000:5000 \
  public.ecr.aws/rjk/pipeline-viewer:latest
```

You will need a method to pass in AWS credentials.  This can either be done as environment variables or by running the container in an AWS environment like ECS.

## Protecting it

The application expects to be deployed behind a authenticating reverse proxy.  It works well with [oidc-rproxy](https://github.com/richardjkendall/oidc-rproxy).

The application expects the following HTTP headers to be set by the reverse proxy:

X-Remote-User: the username of the user who has authenticated with the reverse proxy

X-Remote-User-Groups: a comma separated list of groups the user belongs to e.g. group1,group2,group3

The groups are used to filter the pipelines the user can see.  Each pipeline name is checked to see if it contains a string of characters which is the same as one of the group names.  If it does then the pipeline is shown to the user, otherwise the pipeline is not visible.

If the headers are not set then the default behaviour of the application is to hide all the pipelines.  You can change this by setting the `AUTHZ_MODE` environment variable to a value other than 'EXP'.

These headers are set by the oidc-rproxy component.

## Deploying

To make this easy, I've pre-created a Terraform module which can deploy the user manager behind an OIDC authenticating reverse proxy, you can see it here: https://github.com/richardjkendall/tf-modules/tree/master/modules/pipeline-viewer
