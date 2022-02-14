import { Modal, Steps, Typography } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { isEqual } from 'lodash';
import { SourceBuilderState, StepProps } from './types';
import { CreateScheduleStep } from './CreateScheduleStep';
import { DefineRecipeStep } from './DefineRecipeStep';
import { NameSourceStep } from './NameSourceStep';
import { SelectTemplateStep } from './SelectTemplateStep';

const TitleContainer = styled.div`
    display: flex;
    justify-content: space-between;
`;

const StepsContainer = styled.div`
    margin-right: 20px;
    margin-left: 20px;
    margin-bottom: 40px;
`;

/**
 * Mapping from the step type to the title for the step
 */
export enum IngestionSourceBuilderStepTitles {
    SELECT_TEMPLATE = '选择数据类型',
    DEFINE_RECIPE = '配置数据源',
    CREATE_SCHEDULE = '调度周期',
    NAME_SOURCE = '完成',
}

/**
 * Mapping from the step type to the component implementing that step.
 */
export const IngestionSourceBuilderStepComponent = {
    SELECT_TEMPLATE: SelectTemplateStep,
    DEFINE_RECIPE: DefineRecipeStep,
    CREATE_SCHEDULE: CreateScheduleStep,
    NAME_SOURCE: NameSourceStep,
};

/**
 * Steps of the Ingestion Source Builder flow.
 */
export enum IngestionSourceBuilderStep {
    SELECT_TEMPLATE = 'SELECT_TEMPLATE',
    DEFINE_RECIPE = 'DEFINE_RECIPE',
    CREATE_SCHEDULE = 'CREATE_SCHEDULE',
    NAME_SOURCE = 'NAME_SOURCE',
}

type Props = {
    initialState?: SourceBuilderState;
    visible: boolean;
    onSubmit?: (input: SourceBuilderState, resetState: () => void) => void;
    onCancel?: () => void;
};

export const IngestionSourceBuilderModal = ({ initialState, visible, onSubmit, onCancel }: Props) => {
    const isEditing = initialState !== undefined;
    const titleText = isEditing ? '配置数据源' : '新增数据源';
    const initialStep = isEditing
        ? IngestionSourceBuilderStep.DEFINE_RECIPE
        : IngestionSourceBuilderStep.SELECT_TEMPLATE;

    const [stepStack, setStepStack] = useState([initialStep]);
    const [ingestionBuilderState, setIngestionBuilderState] = useState<SourceBuilderState>({});

    // Reset the ingestion builder modal state when the modal is re-opened.
    const prevInitialState = useRef(initialState);
    useEffect(() => {
        if (!isEqual(prevInitialState.current, initialState)) {
            setIngestionBuilderState(initialState || {});
        }
        prevInitialState.current = initialState;
    }, [initialState]);

    // Reset the step stack to the initial step when the modal is re-opened.
    useEffect(() => setStepStack([initialStep]), [initialStep]);

    const goTo = (step: IngestionSourceBuilderStep) => {
        setStepStack([...stepStack, step]);
    };

    const prev = () => {
        setStepStack(stepStack.slice(0, -1));
    };

    const cancel = () => {
        onCancel?.();
    };

    const submit = () => {
        onSubmit?.(ingestionBuilderState, () => {
            setStepStack([initialStep]);
            setIngestionBuilderState({});
        });
    };

    const currentStep = stepStack[stepStack.length - 1];
    const currentStepIndex = Object.values(IngestionSourceBuilderStep)
        .map((value, index) => ({
            value,
            index,
        }))
        .filter((obj) => obj.value === currentStep)[0].index;
    const StepComponent: React.FC<StepProps> = IngestionSourceBuilderStepComponent[currentStep];

    return (
        <Modal
            width={1440}
            footer={null}
            title={
                <TitleContainer>
                    <Typography.Text>{titleText}</Typography.Text>
                </TitleContainer>
            }
            style={{ top: 40 }}
            visible={visible}
            onCancel={onCancel}
            className="dark-modal"
        >
            <StepsContainer>
                <Steps current={currentStepIndex}>
                    {Object.keys(IngestionSourceBuilderStep).map((item) => (
                        <Steps.Step key={item} title={IngestionSourceBuilderStepTitles[item]} />
                    ))}
                </Steps>
            </StepsContainer>
            <StepComponent
                state={ingestionBuilderState}
                updateState={setIngestionBuilderState}
                goTo={goTo}
                prev={stepStack.length > 1 ? prev : undefined}
                submit={submit}
                cancel={cancel}
            />
        </Modal>
    );
};
