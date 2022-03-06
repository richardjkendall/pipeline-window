import React, { useEffect, useRef } from 'react';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import CircularProgress from '@material-ui/core/CircularProgress';

import styled from 'styled-components';

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

const LogView = styled.div`
  white-space: pre;
  font-family: 'monospace';

  font-family: monospace;
  background-color: #fff;
  margin: 4em auto;
  padding: 0.5em;
  counter-reset: line;

  div {
    display: inline;

    &:before {
      counter-increment: line;
      content: counter(line);
      display: inline-block;
      border-right: 1px solid #ddd;
      padding: 0 .5em;
      margin-right: .5em;
      color: #888;
      width: 40px;
      text-align: right;
    }
  }
`;

export default function LogForm(props) {
  const dispatch = useDispatch();

  const open = useSelector(selectLogFormOpen);
  const logs = useSelector(selectLogs);
  const loading = useSelector(selectLoading);

  const contentArea = useRef();

  useEffect(() => {
    if(loading === "idle" && logs.length > 0) {
      const logV = contentArea.current;
      logV.scrollTop = logV.scrollHeight;
    }
  }, [loading, logs.length]);

  const close = (event) => {
    dispatch(setLogOpenForm(false));
  }

  const colourText = function(text) {
    const controlRe = /\033\[(\d+)m/g;
    const lines = text.split("\n");
    var divs = [];
    var style = "";
    var lineNumber = 0;
    for(const line of lines) {
      const matches = line.matchAll(controlRe);
      var start = 0;
      var spans = [];
      var blockNumber = 0;
      // there are control statements
      for(const match of matches) {
        var slice = line.substring(start, match.index);
        //console.log(`start ${start} match index ${match.index}, number: ${match[1]} slice: ${slice}`)
        if(style === "") {
          spans.push(<span key={`line_${lineNumber}_block_${blockNumber}`}>{slice}</span>);
        } else {
          spans.push(<span key={`line_${lineNumber}_block_${blockNumber}`} style={{color: style}}>{slice}</span>);
        }
        if (match[1] === "0") {
          style = "";
        } else {
          style = COLOURS[match[1]];
        }
        start = match.index + match[0].length;
        blockNumber++;
      }
      // add the last span if needed
      if(start < line.length) {
        var lastSlice = line.substring(start, text.length);
        if(style === "") {
          spans.push(<span key={`line_${lineNumber}_block_${blockNumber}`}>{lastSlice}</span>);
        } else {
          spans.push(<span key={`line_${lineNumber}_block_${blockNumber}`} style={{color: style}}>{lastSlice}</span>);
        }
      }
      divs.push(<div key={`line_${lineNumber}`}>{spans}<br/></div>);
      lineNumber++;
    }
    return divs;
  }

  return (
    <div>
      <Dialog fullWidth={true} maxWidth="xl" open={open} onClose={() => {}} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Logs</DialogTitle>
        <DialogContent ref={contentArea}>

          {loading === "yes" ? <CircularProgress/> : <LogView>
            {colourText(logs)}
          </LogView>}
          
        </DialogContent>
        <DialogActions>
          <Button onClick={props.refresh} disabled={!loading} color="secondary">
            Refresh Logs
          </Button>
          <Button onClick={close} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}