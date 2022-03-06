import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import moment from "moment";

import { useSelector, useDispatch } from 'react-redux';

import {
  fetchAll,
  setOrder,
  setOrderBy,
  setSelected,
  setPage,
  setRowsPerPage,
  setOpenForm, 
  setPipeline, 
  selectPipelines,
  selectOrder,
  selectOrderBy,
  selectSelected,
  selectPage,
  selectRowsPerPage,
  selectOpenForm,
  selectPipelineSearchTerm,
  setPipelineSearchTerm,
} from './pipelineSlice';

import { selectNav } from '../navigation/navigationSlice';

import { lighten, makeStyles } from '@material-ui/core/styles';

import { TextField } from '@material-ui/core';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Checkbox from '@material-ui/core/Checkbox';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import MoreIcon from '@material-ui/icons/More';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';
import { red, green, blue } from '@material-ui/core/colors';

import DetailForm from './DetailForm';

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

const headCells = [
  { id: 'name', numeric: false, disablePadding: true, label: 'Pipeline' },
  { id: 'stages', sortDisabled: true, numeric: false, disablePadding: true, label: 'Stages' },
  { id: 'state', numeric: false, disablePadding: false, label: 'Status' },
  { id: 'latest_run', numeric: false, disablePadding: false, label: 'Last Run Date' },
  { id: 'trigger', sortDisabled: true, numeric: false, disablePadding: false, label: 'Trigger' }
];

function EnhancedTableHead(props) {
  const { classes, order, orderBy, onRequestSort } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          
        </TableCell>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? 'right' : 'left'}
            padding={headCell.disablePadding ? 'none' : 'default'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            {headCell.sortDisabled ?
              <p>{headCell.label}</p>
            : <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <span className={classes.visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </span>
              ) : null}
            </TableSortLabel>
            }
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  classes: PropTypes.object.isRequired,
  numSelected: PropTypes.number.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  order: PropTypes.oneOf(['asc', 'desc']).isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired,
};

const useToolbarStyles = makeStyles((theme) => ({
  root: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(1),
  },
  highlight:
    theme.palette.type === 'light'
      ? {
          color: theme.palette.secondary.main,
          backgroundColor: lighten(theme.palette.secondary.light, 0.85),
        }
      : {
          color: theme.palette.text.primary,
          backgroundColor: theme.palette.secondary.dark,
        },
  title: {
    flex: '1 1 100%',
  },
}));

const EnhancedTableToolbar = (props) => {
  const classes = useToolbarStyles();
  const { numSelected, onGetInfoClick } = props;

  return (
    <Toolbar
      className={clsx(classes.root, {
        [classes.highlight]: numSelected > 0,
      })}
    >
      {numSelected > 0 ? (
        <Typography className={classes.title} color="inherit" variant="subtitle1" component="div">
          {numSelected} selected
        </Typography>
      ) : (
        <Typography className={classes.title} variant="h6" id="tableTitle" component="div">
          Pipelines
        </Typography>
      )}

      {numSelected > 0 ? (
        <Tooltip title="Get more information">
          <IconButton aria-label="delete" onClick={onGetInfoClick}>
            <MoreIcon />
          </IconButton>
        </Tooltip>
      ) : (
        <div>
          <TextField 
            label="Search..." 
            value={props.pipelineSearchTerm}
            onChange={props.changeSearchTerm}
            variant="standard" 
            style={{width: "200px"}} 
          />
        </div>
      )}
    </Toolbar>
  );
};

EnhancedTableToolbar.propTypes = {
  numSelected: PropTypes.number.isRequired,
};

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
  },
  paper: {
    width: '100%',
    marginBottom: theme.spacing(2),
  },
  table: {
    minWidth: 750,
  },
  visuallyHidden: {
    border: 0,
    clip: 'rect(0 0 0 0)',
    height: 1,
    margin: -1,
    overflow: 'hidden',
    padding: 0,
    position: 'absolute',
    top: 20,
    width: 1,
  },
}));

export default function PipelineTable() {
  const rows = useSelector(selectPipelines)
  const classes = useStyles();
  const dispatch = useDispatch();

  const order = useSelector(selectOrder);
  const orderBy = useSelector(selectOrderBy);
  const selected = useSelector(selectSelected);
  const page = useSelector(selectPage);
  const rowsPerPage = useSelector(selectRowsPerPage);
  const formOpen = useSelector(selectOpenForm);
  const nav = useSelector(selectNav);
  const pipelineSearchTerm = useSelector(selectPipelineSearchTerm);

  const [loadPage] = useState(0);

  useEffect(() => {
    dispatch(fetchAll())
  }, [loadPage, dispatch]);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    dispatch(setOrder(isAsc ? 'desc' : 'asc'));
    dispatch(setOrderBy(property));
  };

  const handlePipelineSearchTermChange = (event) => {
    dispatch(setPipelineSearchTerm(event.target.value));
  };

  const handleClick = (event, name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];
    // very simple logic as only one item can be selected at once
    if (selectedIndex === -1) {
      newSelected.push(name);
    }
    dispatch(setSelected(newSelected));
  };

  const handleChangePage = (event, newPage) => {
    dispatch(setPage(newPage));
  };

  const handleChangeRowsPerPage = (event) => {
    dispatch(setRowsPerPage(parseInt(event.target.value, 10)));
    dispatch(setPage(0));
  };

  const isSelected = (name) => selected.indexOf(name) !== -1;

  const emptyRows = rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage);

  const pipeFilter = task => {
    let searchByTerm = true;
    if(pipelineSearchTerm !== "") {
      searchByTerm = task.name.toLowerCase().includes(pipelineSearchTerm.toLowerCase());
    }
    if(nav === "all") {
      return true && searchByTerm;
    }
    if(nav === "running") {
      return task.state === "InProgress" && searchByTerm;
    }
    if(nav === "failed") {
      return task.state === "Failed" && searchByTerm
    }
    return false;
  }

  const getTrigger = stages => {
    if (stages.length > 0) {
      const stage1 = stages[0];
      if(stage1.actions.length > 0) {
        const action1 = stage1.actions[0];
        return action1.summary;
      } else {
        return "n/a"
      }
    } else {
      return "n/a"
    }
  }

  const openDetail = (event) => {
    var selectedPipeline = rows.filter(r => r.name === selected[0])[0];
    dispatch(setPipeline(selectedPipeline));
    dispatch(setOpenForm(true));
  }

  const closeDetail = (event) => {
    dispatch(setOpenForm(false));
  }

  return (
    <div className={classes.root}>
      <Paper className={classes.paper}>
        <DetailForm open={formOpen} handleClose={closeDetail} />
        <EnhancedTableToolbar 
          numSelected={selected.length} 
          pipelineSearchTerm={pipelineSearchTerm}
          changeSearchTerm={handlePipelineSearchTermChange}
          onGetInfoClick={openDetail} 
        />
        <TableContainer>
          <Table
            className={classes.table}
            aria-labelledby="tableTitle"
            size="medium"
            aria-label="enhanced table"
          >
            <EnhancedTableHead
              classes={classes}
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
              rowCount={rows.length}
            />
            <TableBody>
              {stableSort(rows, getComparator(order, orderBy))
                .filter(pipeFilter)
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => {
                  const isItemSelected = isSelected(row.name);
                  const labelId = `enhanced-table-checkbox-${index}`;

                  return (
                    <TableRow
                      hover
                      onClick={(event) => handleClick(event, row.name)}
                      role="checkbox"
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      key={row.name}
                      selected={isItemSelected}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={isItemSelected}
                          inputProps={{ 'aria-labelledby': labelId }}
                        />
                      </TableCell>
                      <TableCell component="th" id={labelId} scope="row" padding="none">
                        {row.name}
                      </TableCell>
                      <TableCell align="left">{row.stages.length}</TableCell>
                      <TableCell align="left">
                        {row.state === "Failed" && <ErrorOutlineIcon style={{ color: red[500] }} /> }
                        {row.state === "InProgress" && <PlayArrowIcon style={{ color: blue[500] }} />}
                        {row.state === "Succeeded" && <CheckCircleOutlineIcon style={{ color: green[500] }} />}
                      </TableCell>
                      <TableCell align="left">{moment.utc(row.latest_run).fromNow()}</TableCell>
                      <TableCell align="left">{getTrigger(row.stages)}</TableCell>
                    </TableRow>
                  );
                })}
              {emptyRows > 0 && (
                <TableRow style={{ height: 53 * emptyRows }}>
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />
      </Paper>
    </div>
  );
}