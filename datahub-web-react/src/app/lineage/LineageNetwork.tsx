import React, { useRef, useEffect } from 'react';
import { useWindowSize } from '@react-hook/window-size';
import styled from 'styled-components';
import vis from 'vis';
import { NetworkProps } from './types';

const LineageNetwork = ({ margin, fetchedEntities }: NetworkProps) => {
    const [windowWidth, windowHeight] = useWindowSize();
    const graphRef = useRef(null);
    const { DataSet, Network } = vis;

    const height = windowHeight - 111;
    const width = windowWidth;

    const GraphDiv = styled.div`
        width: ${width}px;
        height: ${height}px;
    `;

    const nodes = new DataSet([
        { id: 1, label: 'Node 1' },
        { id: 2, label: 'Node 2' },
        { id: 3, label: 'Node 3' },
        { id: 4, label: 'Node 4' },
        { id: 5, label: 'Node 5' },
    ]);

    const edges = new DataSet([
        { from: 1, to: 3 },
        { from: 1, to: 2 },
        { from: 2, to: 4 },
        { from: 2, to: 5 },
        { from: 3, to: 3 },
    ]);

    console.log(margin, fetchedEntities);

    const initNetWork = () => {
        const network = new Network(graphRef.current, { nodes, edges }, {});
        console.log('network', network);
    };

    useEffect(() => {
        initNetWork();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return <GraphDiv id="graph" ref={graphRef} />;
};

export default LineageNetwork;
