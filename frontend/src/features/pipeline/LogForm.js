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

const COLOURS = {
  30: "rgb(0,0,0)",        // black
  31: "rgb(205,49,49)",    // red
  32: "rgb(13,188,121)",   // green
  33: "rgb(229,299,16)",   // yellow
  34: "rgb(36,114,200)",   // blue
  35: "rgb(188,63,188)",   // magenta
  36: "rgb(17,168,205)",   // cyan
  37: "rgb(229,229,229)",  // white
  90: "rgb(102,102,102)",  // bright black
  91: "rgb(241,76,76)",    // bright red
  92: "rgb(35,209,139)",   // bright green
  93: "rgb(245,245,67)",   // bright yellow
  94: "rgb(59,142,234)",   // bright blue
  95: "rgb(214,112,214)",  // bright magenta
  96: "rgb(41,184,219)",   // bright cyan
  97: "rgb(229,229,229)"   // white
}

export default function LogForm(props) {
  const dispatch = useDispatch();

  const open = useSelector(selectLogFormOpen);
  const logs = useSelector(selectLogs);
  const loading = useSelector(selectLoading);

  const close = (event) => {
    dispatch(setLogOpenForm(false));
  }

  const colourText = function(text) {
    const re = /\033\[(\d+)m/gm;
    const matches = text.matchAll(re);
    var start = 0;
    var style = "";
    var newText = [];
    var blockNum = 0;
    for (const match of matches) {
      //console.log(`Match ${match}, - index ${match.index}`);
      var slice = text.substring(start, match.index);
      if (style === "") {
        newText.push(<span key={`block_${blockNum}`}>{slice}</span>);
      } else {
        newText.push(<span key={`block_${blockNum}`} style={{color: style}}>{slice}</span>)
      }
      if (match[1] === "0") {
        style = "";
      } else {
        style = COLOURS[match[1]];
      }
      start = match.index + match[0].length;
      blockNum++;
    }
    if (start < text.length) {
      var lastSlice = text.substring(start, text.length);
      if (style === "") {
        newText.push(<span key="last_block">{lastSlice}</span>);
      } else {
        newText.push(<span key="last_block" style={{color: style}}>{lastSlice}</span>)
      }
    }
    console.log(text);
    return newText;
  }

  return (
    <div>
      <Dialog fullWidth={true} maxWidth="xl" open={open} onClose={() => {}} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Logs</DialogTitle>
        <DialogContent>
          
          {loading === "yes" ? <CircularProgress/> : <div style={{whiteSpace: "pre", fontFamily: "monospace"}}>
            {colourText(logs)}
          </div>}
          
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