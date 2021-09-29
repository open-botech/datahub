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

const LineageNetwork = ({ entityAndType, onEntityClick }: NetworkProps) => {
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
            const platfrom = entity.platform
                ? entity.platform.name
                : entity.urn.split('dataPlatform:')[1].split(',')[0];
            const name =
                entity.__typename === 'DatasetField'
                    ? entity.urn.split('/')[1].slice(0, -1)
                    : `${platfrom} | ${entity.type}\n\n${entity.urn.split(',')[1]}`;
            const obj: NetWorkEntity = {
                id: entity.urn,
                label: name,
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
                platform: platfrom,
                isdatafield: entity.__typename === 'DatasetField',
                color: entity.__typename === 'DatasetField' ? '#6E6EFD' : '#fafafa',
                shape: entity.__typename === 'DatasetField' ? 'circle' : 'box',
                widthConstraint: {
                    minimum: entity.__typename === 'DatasetField' ? 44 : 160,
                    maximum: entity.__typename === 'DatasetField' ? 44 : 160,
                },
                font: {
                    color: entity.__typename === 'DatasetField' ? '#ffffff' : '#333333',
                    size: entity.__typename === 'DatasetField' ? 9 : 12,
                    align: entity.__typename === 'DatasetField' ? 'center' : 'left',
                },
                margin: {
                    top: entity.__typename === 'DatasetField' ? 5 : 10,
                    bottom: entity.__typename === 'DatasetField' ? 5 : 10,
                },
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
                    color: {
                        color: '#ff69b4',
                    },
                    length: 400,
                });
            });
            v.upstreamChildren.forEach((n) => {
                edgeArr.push({
                    from: n,
                    to: v.id,
                    color: {
                        color: '#ff69b4',
                    },
                    length: 400,
                });
            });
            v.relationChildren.forEach((n) => {
                if (v.id.split(':')[2] === 'datasetField' && n.split(':')[2] === 'datasetField') {
                    edgeArr.push({
                        from: n,
                        to: v.id,
                        color: {
                            color: '#8a2be2',
                        },
                        length: 400,
                    });
                } else {
                    edgeArr.push({
                        from: v.id,
                        to: n,
                        color: {
                            color: '#3cb371',
                        },
                        length: 100,
                    });
                }
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
            color: {
                color: '#999999',
            },
        };
        const nt = new Network(
            graphRef.current,
            { nodes, edges },
            {
                autoResize: true,
                height: '100%',
                width: '100%',
                clickToUse: false,
                edges: edgesOption,
            },
        );
        nt.on('click', (p) => {
            if (p.nodes[0] && p.nodes[0].split(':')[2] !== 'datasetField') {
                onEntityClick({ urn: p.nodes[0], type: nodeArr.find((v) => v.id === p.nodes[0]).type });
            }
        });
        setNetWork(nt);
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
