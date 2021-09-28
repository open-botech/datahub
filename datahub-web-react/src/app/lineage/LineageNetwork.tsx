import React, { useRef, useEffect, useState } from 'react';
import { useWindowSize } from '@react-hook/window-size';
import styled from 'styled-components';
import vis from 'vis';
import { NetworkProps, EntityAndType, NetWorkEntity } from './types';

interface GraphDivProps {
    width?: number;
    height?: number;
}

// 外层容器
const GraphDiv = styled.div`
    width: ${(props: GraphDivProps) => props.width}px;
    height: ${(props: GraphDivProps) => props.height}px;
`;

const LineageNetwork = ({ entityAndType }: NetworkProps) => {
    const [network, setNetWork] = useState<any>(null);
    const [windowWidth, windowHeight] = useWindowSize();
    const graphRef = useRef(null);
    const { DataSet, Network } = vis;

    const height = windowHeight - 111;
    const width = windowWidth;

    // 递归处理节点数据
    const nodeDataProcessing = (
        entityTp: EntityAndType | null | undefined,
        newAsyncEntities: any[] = [],
        fullyFetched = true,
    ) => {
        if (entityTp?.entity.urn) {
            const { entity }: any = entityTp;
            const obj: NetWorkEntity = {
                id: entity.urn,
                label:
                    entity.name ||
                    (entity.__typename === 'DatasetField'
                        ? entity.urn.split('/')[1].slice(0, -1)
                        : entity.urn.split(',')[1]),
                type: entity.type,
                icon: '',
                upstreamChildren: entity.upstreamLineage
                    ? entity.upstreamLineage.entities.map((v) => v.entity.urn)
                    : [],
                downstreamChildren: entity.downstreamLineage
                    ? entity.downstreamLineage.entities.map((v) => v.entity.urn)
                    : [],
                relationChildren: entity.relationships
                    ? entity.relationships.relationships.map((v) => v.entity.urn)
                    : [],
                fullyFetched,
                platform: entity.platform || entity.urn.split('dataPlatform:')[1].split(',')[0],
                isdatafield: entity.__typename === 'DatasetField',
                color: entity.__typename === 'DatasetField' ? '#6E6EFD' : '#FFA807',
                shape: entity.__typename === 'DatasetField' ? 'circle' : 'box',
            };
            newAsyncEntities.push(obj);
            const configVis = (lineage: any, tp?: string) => {
                if (lineage) {
                    const urnArr = newAsyncEntities.map((v) => v.id);
                    const ets = tp ? lineage.relationships : lineage.entities;
                    ets.forEach((v) => {
                        if (!urnArr.includes(v.entity.urn)) {
                            nodeDataProcessing(v, newAsyncEntities, false);
                        }
                    });
                }
            };
            configVis(entity.upstreamLineage);
            configVis(entity.downstreamLineage);
            configVis(entity.relationships, 'r');
        }
        return newAsyncEntities;
    };

    // 生成线的数据
    const edgeDataProcessing = (nodeArr: any[]) => {
        const edgeArr: any[] = [];
        nodeArr.forEach((v) => {
            v.downstreamChildren.forEach((n) => {
                edgeArr.push({
                    from: v.id,
                    to: n,
                });
            });
            v.upstreamChildren.forEach((n) => {
                edgeArr.push({
                    from: n,
                    to: v.id,
                });
            });
            v.relationChildren.forEach((n) => {
                edgeArr.push({
                    from: v.id,
                    to: n,
                });
            });
        });
        return edgeArr;
    };

    // 数组内对象去重
    const deWeightThree = (arr: any[]) => {
        const newArr: any[] = [];
        const obj = {};
        for (let i = 0; i < arr.length; i++) {
            const keys = Object.keys(arr[i]);
            keys.sort((a, b) => {
                return Number(a) - Number(b);
            });
            let str = '';
            for (let j = 0; j < keys.length; j++) {
                str += JSON.stringify(keys[j]);
                str += JSON.stringify(arr[i][keys[j]]);
            }
            if (!obj.hasOwnProperty(str)) {
                newArr.push(arr[i]);
                obj[str] = true;
            }
        }
        return newArr;
    };

    const initNetWork = () => {
        const nodeArr = nodeDataProcessing(entityAndType);
        const edgeArr = deWeightThree(edgeDataProcessing(nodeArr));
        const nodes = new DataSet(nodeArr);
        const edges = new DataSet(edgeArr);
        const edgesOption = {
            arrows: {
                to: {
                    enabled: true,
                },
            },
            arrowStrikethrough: false,
            color: {
                color: '#999999',
            },
        };
        const nodesOption = {
            font: {
                color: '#ffffff',
            },
        };
        setNetWork(
            new Network(
                graphRef.current,
                { nodes, edges },
                {
                    autoResize: true,
                    height: '100%',
                    width: '100%',
                    clickToUse: false,
                    edges: edgesOption,
                    nodes: nodesOption,
                },
            ),
        );
    };

    useEffect(() => {
        initNetWork();
        return () => {
            network?.destroy();
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return <GraphDiv id="graph" ref={graphRef} width={width} height={height} />;
};

export default LineageNetwork;
