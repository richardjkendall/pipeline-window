import React from 'react';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import CircularProgress from '@material-ui/core/CircularProgress';

import {
  selectLogFormOpen,
  setLogOpenForm,
  selectLogs,
  selectLoading
} from './pipelineSlice';

import { useSelector, useDispatch } from 'react-redux';

export default function LogForm(props) {
  const dispatch = useDispatch();

  const open = useSelector(selectLogFormOpen);
  const logs = useSelector(selectLogs);
  const loading = useSelector(selectLoading);
  /*

  const useStyles = makeStyles({
    root: {
      display: 'flex',
      flexWrap: 'wrap',
    },
  });

  const classes = useStyles();*/

  const close = (event) => {
    dispatch(setLogOpenForm(false));
  }

  return (
    <div>
      <Dialog fullWidth={true} maxWidth="xl" open={open} onClose={() => {}} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Logs</DialogTitle>
        <DialogContent>
          
          {loading === "yes" ? <CircularProgress/> : <pre>
            {logs}
          </pre>}
          
        </DialogContent>
        <DialogActions>
          <Button onClick={close} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}