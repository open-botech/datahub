import { Button, message, Typography } from 'antd';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { StepProps } from './types';
import { getSourceConfigs, jsonToYaml, yamlToJson } from '../utils';
import { YamlEditor } from './YamlEditor';
import { ANTD_GRAY } from '../../../entity/shared/constants';
import { IngestionSourceBuilderStep } from './steps';

const Section = styled.div`
    display: flex;
    flex-direction: column;
    padding-bottom: 16px;
`;

const BorderedSection = styled(Section)`
    border: solid ${ANTD_GRAY[4]} 0.5px;
`;

const SelectTemplateHeader = styled(Typography.Title)`
    && {
        margin-bottom: 8px;
    }
`;

const ControlsContainer = styled.div`
    display: flex;
    justify-content: center;
    margin-top: 8px;
`;

/**
 * The step for defining a recipe
 */
export const DefineRecipeStep = ({ state, updateState, goTo, prev }: StepProps) => {
    const existingRecipeJson = state.config?.recipe;
    const existingRecipeYaml = existingRecipeJson && jsonToYaml(existingRecipeJson);

    const [stagedRecipeYml, setStagedRecipeYml] = useState(existingRecipeYaml || '');

    useEffect(() => {
        setStagedRecipeYml(existingRecipeYaml || '');
    }, [existingRecipeYaml]);

    const [stepComplete, setStepComplete] = useState(false);

    const { type } = state;
    const sourceConfigs = getSourceConfigs(type as string);
    const displayRecipe = stagedRecipeYml || sourceConfigs.placeholderRecipe;
    const sourceDisplayName = sourceConfigs.displayName;

    useEffect(() => {
        if (stagedRecipeYml && stagedRecipeYml.length > 0) {
            setStepComplete(true);
        }
    }, [stagedRecipeYml]);

    const onClickNext = () => {
        // Convert the recipe into it's json representation, and catch + report exceptions while we do it.
        let recipeJson;
        try {
            recipeJson = yamlToJson(stagedRecipeYml);
        } catch (e) {
            message.warn('Found invalid YAML. Please check your recipe configuration.');
            return;
        }

        const newState = {
            ...state,
            config: {
                ...state.config,
                recipe: recipeJson,
            },
        };
        updateState(newState);

        goTo(IngestionSourceBuilderStep.CREATE_SCHEDULE);
    };

    return (
        <>
            <Section>
                <SelectTemplateHeader level={5}>Configure {sourceDisplayName} Recipe</SelectTemplateHeader>
            </Section>
            <BorderedSection>
                <YamlEditor initialText={displayRecipe} onChange={setStagedRecipeYml} />
            </BorderedSection>
            <ControlsContainer>
                <Button style={{marginRight: 20}} ghost disabled={prev === undefined} onClick={prev}>
                    上一步
                </Button>
                <Button type="primary" ghost disabled={!stepComplete} onClick={onClickNext}>
                    下一步
                </Button>
            </ControlsContainer>
        </>
    );
};
