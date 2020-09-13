import React, {
    useContext, useEffect, useRef, useState,
} from 'react';
import {
    Box, Paper, Typography, IconButton, Tooltip,
} from '@material-ui/core';
import { AddBox as AddBoxIcon } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import * as colors from '@material-ui/core/colors';
import { observer } from 'mobx-react';
import { Stage, Layer, Line } from 'react-konva';
import { values } from 'lodash';
import DragBlock from './DragBlock';
import DiagramContext from '../../context/DiagramContext';

const useStyles = makeStyles((theme) => ({
    rootWrapper: {
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.palette.divider,
    },
    wrapper: {
        width: `calc(100% - ${theme.spacing(8)}px)`,
        height: `calc(100% - ${theme.spacing(8)}px)`,
        position: 'absolute',
        margin: theme.spacing(4),
        overflow: 'auto',
        '&::-webkit-scrollbar': {
            width: theme.spacing(1),
            height: theme.spacing(1),
        },
        '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#BEBEBE',
            borderRadius: theme.spacing(0.5),
        },
    },
    diagramField: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        zIndex: 2,
    },
    diagramCanvas: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        zIndex: 0,
    },
    infoWrapper: {
        position: 'absolute',
        right: theme.spacing(7),
        top: theme.spacing(7),
        zIndex: 1000,
        padding: theme.spacing(1),
    },
    addBlockButton: {
        position: 'absolute',
        left: theme.spacing(5),
        top: theme.spacing(5),
        zIndex: 1000,
        color: colors.green[500],
    },
}));

function Diagram() {
    const classes = useStyles();

    const boxRef = useRef();
    const wrapperRef = useRef();
    const diagramState = useContext(DiagramContext);
    const {
        blocks,
        lines,
        lineAddMode,
        addNewBlock,
        clearLine,
        setPositionLine,
    } = diagramState;

    const [widthBlock, setWidthBlock] = useState(0);
    const [heightBlock, setHeightBlock] = useState(0);
    const [moveMode, setMoveMode] = useState(false);
    const [zoomValue, setZoomValue] = useState(1);

    const setSizeBlock = () => {
        if (boxRef.current?.clientWidth || boxRef.current?.clientHeight) {
            setWidthBlock(boxRef.current?.clientWidth);
            setHeightBlock(boxRef.current?.clientHeight);
        }
    };

    useEffect(() => {
        setSizeBlock();
    }, [boxRef]);

    return (
        <Box className={classes.rootWrapper}>
            <Paper
                className={classes.wrapper}
                style={{ cursor: moveMode ? 'move' : 'default' }}
                ref={wrapperRef}
                onMouseDown={(event) => {
                    if (event.button === 1) {
                        event.preventDefault();
                        setMoveMode(true);
                    }
                }}
                onMouseUp={(event) => {
                    clearLine();
                    if (event.button === 1) {
                        setMoveMode(false);
                    }
                }}
                onMouseMove={(event) => {
                    if (lineAddMode) {
                        setPositionLine(event.movementX / zoomValue, event.movementY / zoomValue);
                    }
                    if (moveMode) {
                        wrapperRef.current.scrollLeft = wrapperRef.current?.scrollLeft - event.movementX;
                        wrapperRef.current.scrollTop = wrapperRef.current?.scrollTop - event.movementY;
                    }
                }}
                onMouseLeave={() => {
                    setMoveMode(false);
                }}
            >
                <Box
                    className={classes.diagramField}
                    style={{ zoom: zoomValue }}
                    id="diagramField"
                    ref={boxRef}
                    onWheel={(event) => {
                        const value = ((zoomValue - event.deltaY / 10000) * 100).toFixed(0);
                        if (value >= 50 && value <= 150) {
                            setZoomValue(zoomValue - event.deltaY / 10000);
                            setSizeBlock();
                        }
                    }}
                >
                    {values(blocks).map((item) => (
                        <DragBlock
                            key={item.id}
                            id={item.id}
                            parentRef={boxRef.current}
                            zoomValue={zoomValue}
                            setWidthBlock={setWidthBlock}
                            setHeightBlock={setHeightBlock}
                            setHeightParentRef={(height) => {
                                boxRef.current.style.height = height;
                            }}
                            setWidthParentRef={(width) => {
                                boxRef.current.style.width = width;
                            }}
                        />
                    ))}
                    <Stage
                        className={classes.diagramCanvas}
                        width={widthBlock}
                        height={heightBlock}
                    >
                        <Layer>
                            {lines.map((line) => (
                                <Line
                                    key={`line${line.fromId.answerId}`}
                                    points={[
                                        line.fromId.position.x,
                                        line.fromId.position.y,
                                        line.toId.position.x,
                                        line.toId.position.y,
                                    ]}
                                    tension={5}
                                    stroke={colors[line.color][700]}
                                />
                            ))}
                        </Layer>
                    </Stage>
                </Box>
            </Paper>
            <Paper className={classes.infoWrapper}>
                <Typography>{`Масштаб: ${(zoomValue * 100).toFixed(0)}%`}</Typography>
            </Paper>
            <Tooltip title="Добавить новый блок">
                <IconButton
                    className={classes.addBlockButton}
                    onClick={() => {
                        addNewBlock(`in${Date.now()}`);
                    }}
                >
                    <AddBoxIcon fontSize="large" />
                </IconButton>
            </Tooltip>
        </Box>
    );
}

export default observer(Diagram);
