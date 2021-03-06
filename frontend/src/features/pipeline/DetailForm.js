import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

import moment from "moment";

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Typography from '@material-ui/core/Typography';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';
import { red, green, blue } from '@material-ui/core/colors';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';

import {
  selectSelectedPipeline,
  setLogOpenForm,
  setCodeBuildProject,
  //selectLogFormOpen,
  //selectCodeBuildProject,
  getLogs
} from './pipelineSlice';

import LogForm from './LogForm';

import { useSelector, useDispatch } from 'react-redux';

function StageCard(props) {
  const dispatch = useDispatch();

  const { stage, index } = props;

  const useStyles = makeStyles({
    root: {
      maxWidth: 250,
      minWidth: 250,
      margin: '10px'
    },
    bullet: {
      display: 'inline-block',
      margin: '0 2px',
      transform: 'scale(0.8)',
    },
    title: {
      fontSize: 14,
    },
    pos: {
      marginTop: 5,
    },
  });

  const classes = useStyles();

  const isCodeBuild = (url) => {
    return url.includes("https://console.aws.amazon.com/codebuild/");
  }

  const openLogs = (event) => {
    dispatch(setCodeBuildProject(stage.actions[0].external_exec_id));
    dispatch(setLogOpenForm(true));
    dispatch(getLogs(stage.actions[0].external_exec_id));
  }

  return (
    <Card className={classes.root}>
      <CardContent>
        <Typography className={classes.title} color="textSecondary" gutterBottom>
          Stage {index + 1}
        </Typography>
        <Typography variant="h5" component="h2">
          {stage.name}
        </Typography>
        <Typography variant="body2" component="p">
          {stage.name === "Source" && stage.actions[0].summary}
          {(stage.name === "Build" || stage.name === "Deploy") && stage.actions[0].external_exec_id}
        </Typography>
        {stage.status === "Succeeded" && <CheckCircleOutlineIcon className={classes.pos} style={{ color: green[500] }} />}
        {stage.status === "Failed" && <ErrorOutlineIcon className={classes.pos} style={{ color: red[500] }} />}
        {stage.status === "InProgress" && <PlayArrowIcon className={classes.pos} style={{ color: blue[500] }} />}
      </CardContent>
      <CardActions>
        {stage.name === "Build" && isCodeBuild(stage.actions[0].external_exec_url) && <Button onClick={openLogs} size="small">Get Logs</Button>}
      </CardActions>
    </Card>
  )
}

export default function DetailForm(props) {
  //const dispatch = useDispatch();

  const pipeline = useSelector(selectSelectedPipeline);
  //const logOpen = useSelector(selectLogFormOpen);

  const useStyles = makeStyles({
    root: {
      display: 'flex',
      flexWrap: 'wrap',
    },
  });

  const classes = useStyles();

  return (
    <div>
      <Dialog fullWidth={true} maxWidth="md" open={props.open} onClose={() => {}} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">{pipeline.name}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Most recent execution: {moment.utc(pipeline.latest_run).fromNow()} / {pipeline.state} / {pipeline.latest_run_id}
          </DialogContentText>
          
          <div className={classes.root}>
            {props.open && pipeline.stages.map((stage, index) => {
              return (
                <StageCard key={`stage_${index}`} stage={stage} index={index} />
              )
            })}
          </div>
          
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {props.handleClose()}} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
      <LogForm />
    </div>
  );
}