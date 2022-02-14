import { Button, Form, Input, Typography } from 'antd';
import React from 'react';
import styled from 'styled-components';
import { SourceBuilderState, StepProps } from './types';

const ControlsContainer = styled.div`
    display: flex;
    justify-content: center;
    margin-top: 8px;
`;

export const NameSourceStep = ({ state, updateState, prev, submit }: StepProps) => {
    const setName = (stagedName: string) => {
        const newState: SourceBuilderState = {
            ...state,
            name: stagedName,
        };
        updateState(newState);
    };

    const setExecutorId = (execId: string) => {
        const newState: SourceBuilderState = {
            ...state,
            config: {
                ...state.config,
                executorId: execId,
            },
        };
        updateState(newState);
    };

    const setVersion = (version: string) => {
        const newState: SourceBuilderState = {
            ...state,
            config: {
                ...state.config,
                version,
            },
        };
        updateState(newState);
    };

    const onClickCreate = () => {
        if (state.name !== undefined && state.name.length > 0) {
            submit();
        }
    };

    return (
        <>
            <Form labelCol={{ span: 8 }} wrapperCol={{ span: 8 }} style={{ marginTop: 150, marginBottom: 150}}>
                <Form.Item
                    required
                    label={
                        <Typography.Text strong style={{ marginBottom: 0 }}>
                            数据源名称
                        </Typography.Text>
                    }
                >
                    <Input
                        placeholder="请输入数据源名称"
                        value={state.name}
                        onChange={(event) => setName(event.target.value)}
                    />
                </Form.Item>
                <Form.Item label={<Typography.Text strong>执行ID</Typography.Text>}>
                    <Input
                        placeholder="默认"
                        value={state.config?.executorId || ''}
                        onChange={(event) => setExecutorId(event.target.value)}
                    />
                </Form.Item>
                <Form.Item label={<Typography.Text strong>CLI  Version</Typography.Text>}>
                    <Input
                        placeholder="0.8.19.1"
                        value={state.config?.version || ''}
                        onChange={(event) => setVersion(event.target.value)}
                    />
                </Form.Item>
            </Form>
            <ControlsContainer>
                <Button type="primary" ghost onClick={prev} style={{marginRight: 20}}>上一步</Button>
                <Button type="primary" disabled={!(state.name !== undefined && state.name.length > 0)} onClick={onClickCreate}>
                    完成
                </Button>
            </ControlsContainer>
        </>
    );
};
