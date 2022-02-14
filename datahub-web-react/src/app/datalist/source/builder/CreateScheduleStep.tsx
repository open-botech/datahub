import { Button, Form, Input, Typography } from 'antd';
import React, { useMemo } from 'react';
import styled from 'styled-components';
import cronstrue from 'cronstrue';
import { CheckCircleOutlined } from '@ant-design/icons';
import { SourceBuilderState, StepProps } from './types';
import { ANTD_GRAY, REDESIGN_COLORS } from '../../../entity/shared/constants';
import { lowerFirstLetter } from '../../../shared/textUtil';
import { IngestionSourceBuilderStep } from './steps';

const CronText = styled(Typography.Paragraph)`
    &&& {
        margin-top: 8px;
        margin-bottom: 0px;
    }
    color: ${ANTD_GRAY[7]};
`;

const CronSuccessCheck = styled(CheckCircleOutlined)`
    color: ${REDESIGN_COLORS.BLUE};
    margin-right: 4px;
`;

const ControlsContainer = styled.div`
    display: flex;
    justify-content: center;
    margin-top: 8px;
`;

export const CreateScheduleStep = ({ state, updateState, goTo, prev }: StepProps) => {
    const interval = state.schedule?.interval || '';
    const timezone = state.schedule?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;

    const setTimezone = (tz: string) => {
        const newState: SourceBuilderState = {
            ...state,
            schedule: {
                ...state.schedule,
                timezone: tz,
            },
        };
        updateState(newState);
    };

    const setCronInterval = (int: string) => {
        const newState: SourceBuilderState = {
            ...state,
            schedule: {
                ...state.schedule,
                interval: int,
            },
        };
        updateState(newState);
    };

    const cronAsText = useMemo(() => {
        if (interval) {
            try {
                return {
                    text: `Runs ${lowerFirstLetter(cronstrue.toString(interval))}.`,
                    error: false,
                };
            } catch (e) {
                return {
                    text: undefined,
                    error: true,
                };
            }
        }
        return {
            text: undefined,
            error: false,
        };
    }, [interval]);

    const onClickNext = () => {
        setTimezone(timezone);
        goTo(IngestionSourceBuilderStep.NAME_SOURCE);
    };

    const onClickSkip = () => {
        const newState: SourceBuilderState = {
            ...state,
            schedule: undefined,
        };
        updateState(newState);
        goTo(IngestionSourceBuilderStep.NAME_SOURCE);
    };

    return (
        <>
            <Form labelCol={{ span: 8 }} wrapperCol={{ span: 8 }}>
                <Form.Item className="schedule-setting" label={<Typography.Text strong>周期设置</Typography.Text>}>
                  <Input value={interval} onChange={(e) => setCronInterval(e.target.value)} placeholder="请输入周期" />
                  <CronText>
                      {cronAsText.error && <>Invalid cron schedule. Cron must be of UNIX form:</>}
                      {!cronAsText.text && (
                          <Typography.Paragraph keyboard style={{ marginTop: 4 }}>
                              运行时间：每分钟、每周二
                          </Typography.Paragraph>
                      )}
                      {cronAsText.text && (
                          <>
                              <CronSuccessCheck />
                              {cronAsText.text}
                          </>
                      )}
                  </CronText>
                </Form.Item>
            </Form>
            <ControlsContainer>
                <Button type="primary" ghost onClick={prev} style={{ marginRight: 20 }}>上一步</Button>
                <Button type="primary" ghost style={{ marginRight: 20 }} onClick={onClickSkip}>
                    跳过
                </Button>
                <Button type="primary" disabled={!interval || interval.length === 0 || cronAsText.error} onClick={onClickNext}>
                    下一步
                </Button>
            </ControlsContainer>
        </>
    );
};
